using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.SupportMatter;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SupportMattersController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public SupportMattersController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupportMatterDto>>> GetSupportMatters(
        string? search,
        string? status,
        string? category,
        Guid? entityId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.SupportMatters
            .Include(sm => sm.Entity)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(sm => 
                sm.Title.Contains(search) ||
                (sm.Description != null && sm.Description.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<SupportStatus>(status, true, out var statusEnum))
            {
                query = query.Where(sm => sm.Status == statusEnum);
            }
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(sm => sm.Category == category);
        }

        if (entityId.HasValue)
        {
            query = query.Where(sm => sm.EntityId == entityId.Value);
        }

        var totalCount = await query.CountAsync();
        var supportMatters = await query
            .OrderByDescending(sm => sm.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var supportMatterDtos = _mapper.Map<IEnumerable<SupportMatterDto>>(supportMatters);

        return Ok(new
        {
            data = supportMatterDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupportMatterDto>> GetSupportMatter(Guid id)
    {
        var supportMatter = await _context.SupportMatters
            .Include(sm => sm.Entity)
            .AsNoTracking()
            .FirstOrDefaultAsync(sm => sm.Id == id);

        if (supportMatter == null)
            return NotFound();

        var supportMatterDto = _mapper.Map<SupportMatterDto>(supportMatter);
        return Ok(supportMatterDto);
    }

    [HttpGet("entity/{entityId:guid}")]
    public async Task<ActionResult<IEnumerable<SupportMatterDto>>> GetSupportMattersByEntity(Guid entityId)
    {
        var supportMatters = await _context.SupportMatters
            .Include(sm => sm.Entity)
            .Where(sm => sm.EntityId == entityId)
            .OrderByDescending(sm => sm.CreatedAtUtc)
            .ToListAsync();

        var supportMatterDtos = _mapper.Map<IEnumerable<SupportMatterDto>>(supportMatters);
        return Ok(supportMatterDtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SupportMatterDto>> CreateSupportMatter([FromBody] CreateSupportMatterDto createSupportMatterDto)
    {
        var validator = new CreateSupportMatterValidator();
        var validationResult = await validator.ValidateAsync(createSupportMatterDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == createSupportMatterDto.EntityId))
        {
            return BadRequest($"Entity with ID {createSupportMatterDto.EntityId} does not exist.");
        }

        var supportMatter = _mapper.Map<SupportMatter>(createSupportMatterDto);
        supportMatter.CreatedAtUtc = DateTime.UtcNow;
        supportMatter.UpdatedAtUtc = DateTime.UtcNow;

        // Calculate profit if both total amount and percentage are provided
        if (supportMatter.TotalAmount.HasValue && supportMatter.ProfitPercentage.HasValue)
        {
            supportMatter.CalculatedProfit = (supportMatter.TotalAmount.Value * supportMatter.ProfitPercentage.Value) / 100;
        }

        _context.SupportMatters.Add(supportMatter);
        await _context.SaveChangesAsync();

        var supportMatterDto = _mapper.Map<SupportMatterDto>(supportMatter);
        return CreatedAtAction(nameof(GetSupportMatter), new { id = supportMatter.Id }, supportMatterDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupportMatter(Guid id, [FromBody] CreateSupportMatterDto updateSupportMatterDto)
    {
        var supportMatter = await _context.SupportMatters.FindAsync(id);
        if (supportMatter == null)
            return NotFound();

        var validator = new CreateSupportMatterValidator();
        var validationResult = await validator.ValidateAsync(updateSupportMatterDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == updateSupportMatterDto.EntityId))
        {
            return BadRequest($"Entity with ID {updateSupportMatterDto.EntityId} does not exist.");
        }

        _mapper.Map(updateSupportMatterDto, supportMatter);
        supportMatter.UpdatedAtUtc = DateTime.UtcNow;

        // Recalculate profit if both total amount and percentage are provided
        if (supportMatter.TotalAmount.HasValue && supportMatter.ProfitPercentage.HasValue)
        {
            supportMatter.CalculatedProfit = (supportMatter.TotalAmount.Value * supportMatter.ProfitPercentage.Value) / 100;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupportMatter(Guid id)
    {
        var supportMatter = await _context.SupportMatters.FindAsync(id);
        if (supportMatter == null)
            return NotFound();

        _context.SupportMatters.Remove(supportMatter);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupportMatterStatus(Guid id, [FromBody] UpdateSupportMatterStatusDto statusDto)
    {
        var supportMatter = await _context.SupportMatters.FindAsync(id);
        if (supportMatter == null)
            return NotFound();

        supportMatter.Status = statusDto.Status;
        supportMatter.UpdatedAtUtc = DateTime.UtcNow;

        if (statusDto.Status == SupportStatus.Closed)
        {
            supportMatter.ClosedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/priority")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupportMatterPriority(Guid id, [FromBody] UpdateSupportMatterPriorityDto priorityDto)
    {
        var supportMatter = await _context.SupportMatters.FindAsync(id);
        if (supportMatter == null)
            return NotFound();

        supportMatter.Priority = priorityDto.Priority;
        supportMatter.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetSupportMatterStatistics()
    {
        var totalMatters = await _context.SupportMatters.CountAsync();
        var openMatters = await _context.SupportMatters.CountAsync(sm => sm.Status == SupportStatus.Open);
        var closedMatters = await _context.SupportMatters.CountAsync(sm => sm.Status == SupportStatus.Closed);

        var totalAmount = await _context.SupportMatters
            .Where(sm => sm.TotalAmount.HasValue)
            .SumAsync(sm => sm.TotalAmount ?? 0);

        var totalProfit = await _context.SupportMatters
            .Where(sm => sm.CalculatedProfit.HasValue)
            .SumAsync(sm => sm.CalculatedProfit ?? 0);

        var mattersByCategory = await _context.SupportMatters
            .GroupBy(sm => sm.Category)
            .Select(g => new
            {
                category = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var mattersByPriority = await _context.SupportMatters
            .GroupBy(sm => sm.Priority)
            .Select(g => new
            {
                priority = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var statistics = new
        {
            totalMatters,
            openMatters,
            closedMatters,
            totalAmount,
            totalProfit,
            mattersByCategory,
            mattersByPriority
        };

        return Ok(statistics);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetSupportMatterCategories()
    {
        var categories = await _context.SupportMatters
            .Where(sm => !string.IsNullOrWhiteSpace(sm.Category))
            .Select(sm => sm.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("priorities")]
    public async Task<ActionResult<IEnumerable<SupportPriority>>> GetSupportMatterPriorities()
    {
        var priorities = await _context.SupportMatters
            .Select(sm => sm.Priority)
            .Distinct()
            .OrderBy(p => p)
            .ToListAsync();

        return Ok(priorities);
    }
}

// DTOs
public record UpdateSupportMatterStatusDto(SupportStatus Status);
public record UpdateSupportMatterPriorityDto(SupportPriority Priority);

public class CreateSupportMatterValidator : AbstractValidator<CreateSupportMatterDto>
{
    public CreateSupportMatterValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Priority).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.TotalAmount).GreaterThanOrEqualTo(0).When(x => x.TotalAmount.HasValue);
        RuleFor(x => x.ProfitPercentage).InclusiveBetween(0, 100).When(x => x.ProfitPercentage.HasValue);
        RuleFor(x => x.CalculatedProfit).GreaterThanOrEqualTo(0).When(x => x.CalculatedProfit.HasValue);
    }
}
