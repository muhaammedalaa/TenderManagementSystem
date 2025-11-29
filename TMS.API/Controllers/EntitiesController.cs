using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.Entity;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EntitiesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public EntitiesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EntityDto>>> GetEntities(
        string? search, 
        bool? active,
        Guid? parentId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Entities
            .Include(e => e.Parent)
            .Include(e => e.Children)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e => 
                e.Name.Contains(search) || 
                e.Code.Contains(search) ||
                (e.Description != null && e.Description.Contains(search)));
        }

        if (active.HasValue)
        {
            query = query.Where(e => e.IsActive == active.Value);
        }

        if (parentId.HasValue)
        {
            query = query.Where(e => e.ParentId == parentId.Value);
        }

        var totalCount = await query.CountAsync();
        var entities = await query
            .OrderBy(e => e.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var entityDtos = _mapper.Map<IEnumerable<EntityDto>>(entities);

        return Ok(new
        {
            data = entityDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EntityDto>> GetEntity(Guid id)
    {
        var entity = await _context.Entities
            .Include(e => e.Parent)
            .Include(e => e.Children)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);

        if (entity == null)
            return NotFound();

        var entityDto = _mapper.Map<EntityDto>(entity);
        return Ok(entityDto);
    }

    [HttpGet("hierarchy")]
    public async Task<ActionResult<IEnumerable<EntityHierarchyDto>>> GetEntityHierarchy()
    {
        var entities = await _context.Entities
            .Where(e => e.IsActive)
            .OrderBy(e => e.Name)
            .ToListAsync();

        var hierarchy = BuildEntityHierarchy(entities, null);
        return Ok(hierarchy);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<EntityDto>> CreateEntity([FromBody] CreateEntityDto createEntityDto)
    {
        var validator = new CreateEntityValidator();
        var validationResult = await validator.ValidateAsync(createEntityDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if code already exists
        if (await _context.Entities.AnyAsync(e => e.Code == createEntityDto.Code))
        {
            return BadRequest($"Entity with code '{createEntityDto.Code}' already exists.");
        }

        // Validate parent entity exists if specified
        if (createEntityDto.ParentId.HasValue)
        {
            if (!await _context.Entities.AnyAsync(e => e.Id == createEntityDto.ParentId.Value))
            {
                return BadRequest($"Parent entity with ID {createEntityDto.ParentId.Value} does not exist.");
            }
        }

        var entity = _mapper.Map<Entity>(createEntityDto);
        entity.CreatedAtUtc = DateTime.UtcNow;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        _context.Entities.Add(entity);
        await _context.SaveChangesAsync();

        var entityDto = _mapper.Map<EntityDto>(entity);
        return CreatedAtAction(nameof(GetEntity), new { id = entity.Id }, entityDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateEntity(Guid id, [FromBody] CreateEntityDto updateEntityDto)
    {
        var entity = await _context.Entities.FindAsync(id);
        if (entity == null)
            return NotFound();

        var validator = new CreateEntityValidator();
        var validationResult = await validator.ValidateAsync(updateEntityDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if code already exists (excluding current entity)
        if (await _context.Entities.AnyAsync(e => e.Code == updateEntityDto.Code && e.Id != id))
        {
            return BadRequest($"Entity with code '{updateEntityDto.Code}' already exists.");
        }

        // Validate parent entity exists if specified
        if (updateEntityDto.ParentId.HasValue)
        {
            if (!await _context.Entities.AnyAsync(e => e.Id == updateEntityDto.ParentId.Value))
            {
                return BadRequest($"Parent entity with ID {updateEntityDto.ParentId.Value} does not exist.");
            }

            // Prevent circular reference
            if (updateEntityDto.ParentId.Value == id)
            {
                return BadRequest("Entity cannot be its own parent.");
            }
        }

        _mapper.Map(updateEntityDto, entity);
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteEntity(Guid id)
    {
        var entity = await _context.Entities.FindAsync(id);
        if (entity == null)
            return NotFound();

        // Check if entity has children
        if (await _context.Entities.AnyAsync(e => e.ParentId == id))
        {
            return BadRequest("Cannot delete entity that has child entities.");
        }

        // Check if entity has suppliers
        if (await _context.Suppliers.AnyAsync(s => s.EntityId == id))
        {
            return BadRequest("Cannot delete entity that has associated suppliers.");
        }

        // Check if entity has tenders
        if (await _context.Tenders.AnyAsync(t => t.EntityId == id))
        {
            return BadRequest("Cannot delete entity that has associated tenders.");
        }

        _context.Entities.Remove(entity);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateEntity(Guid id)
    {
        var entity = await _context.Entities.FindAsync(id);
        if (entity == null)
            return NotFound();

        entity.IsActive = true;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateEntity(Guid id)
    {
        var entity = await _context.Entities.FindAsync(id);
        if (entity == null)
            return NotFound();

        entity.IsActive = false;
        entity.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private List<EntityHierarchyDto> BuildEntityHierarchy(List<Entity> entities, Guid? parentId)
    {
        return entities
            .Where(e => e.ParentId == parentId)
            .Select(e => new EntityHierarchyDto
            {
                Id = e.Id,
                Name = e.Name,
                Code = e.Code,
                Description = e.Description,
                IsActive = e.IsActive,
                Children = BuildEntityHierarchy(entities, e.Id)
            })
            .ToList();
    }
}

// DTOs
public record EntityHierarchyDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string? Description { get; init; }
    public bool IsActive { get; init; }
    public List<EntityHierarchyDto> Children { get; init; } = new();
}

public class CreateEntityValidator : AbstractValidator<CreateEntityDto>
{
    public CreateEntityValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
