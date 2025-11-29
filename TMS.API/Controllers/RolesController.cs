using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.Role;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public RolesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetRoles()
    {
        var roles = await _context.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .ToListAsync();

        var roleDtos = _mapper.Map<IEnumerable<RoleDto>>(roles);
        return Ok(roleDtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoleDto>> GetRole(Guid id)
    {
        var role = await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
            return NotFound();

        var roleDto = _mapper.Map<RoleDto>(role);
        return Ok(roleDto);
    }

    [HttpPost]
    public async Task<ActionResult<RoleDto>> CreateRole([FromBody] CreateRoleDto createRoleDto)
    {
        var validator = new CreateRoleValidator();
        var validationResult = await validator.ValidateAsync(createRoleDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if role name already exists
        if (await _context.Roles.AnyAsync(r => r.Name == createRoleDto.Name))
        {
            return BadRequest("Role with this name already exists.");
        }

        var role = _mapper.Map<Role>(createRoleDto);
        role.CreatedAtUtc = DateTime.UtcNow;
        role.UpdatedAtUtc = DateTime.UtcNow;

        _context.Roles.Add(role);
        await _context.SaveChangesAsync();

        var roleDto = _mapper.Map<RoleDto>(role);
        return CreatedAtAction(nameof(GetRole), new { id = role.Id }, roleDto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] CreateRoleDto updateRoleDto)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
            return NotFound();

        var validator = new CreateRoleValidator();
        var validationResult = await validator.ValidateAsync(updateRoleDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if role name already exists (excluding current role)
        if (await _context.Roles.AnyAsync(r => r.Name == updateRoleDto.Name && r.Id != id))
        {
            return BadRequest("Role with this name already exists.");
        }

        _mapper.Map(updateRoleDto, role);
        role.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteRole(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
            return NotFound();

        // Check if role is assigned to any users
        var hasUsers = await _context.UserRoles.AnyAsync(ur => ur.RoleId == id);
        if (hasUsers)
        {
            return BadRequest("Cannot delete role that is assigned to users.");
        }

        _context.Roles.Remove(role);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id:guid}/users")]
    public async Task<ActionResult<IEnumerable<object>>> GetRoleUsers(Guid id)
    {
        var role = await _context.Roles.FindAsync(id);
        if (role == null)
            return NotFound();

        var users = await _context.UserRoles
            .Include(ur => ur.User)
            .Where(ur => ur.RoleId == id)
            .Select(ur => new
            {
                id = ur.User.Id,
                firstName = ur.User.FirstName,
                lastName = ur.User.LastName,
                email = ur.User.Email,
                username = ur.User.Username,
                isActive = ur.User.IsActive,
                assignedAt = ur.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(users);
    }
}

public class CreateRoleValidator : AbstractValidator<CreateRoleDto>
{
    public CreateRoleValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
