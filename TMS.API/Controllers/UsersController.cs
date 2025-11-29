using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.User;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public UsersController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers(
        string? search, 
        bool? isActive, 
        Guid? roleId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => 
                (u.FirstName != null && u.FirstName.Contains(search)) || 
                (u.LastName != null && u.LastName.Contains(search)) || 
                u.Email.Contains(search) ||
                u.Username.Contains(search));
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        if (roleId.HasValue)
        {
            query = query.Where(u => u.UserRoles.Any(ur => ur.RoleId == roleId.Value));
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var userDtos = _mapper.Map<IEnumerable<UserDto>>(users);

        return Ok(new
        {
            data = userDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserDto>> GetUser(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(userDto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto)
    {
        var validator = new CreateUserValidator();
        var validationResult = await validator.ValidateAsync(createUserDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if email already exists
        if (await _context.Users.AnyAsync(u => u.Email == createUserDto.Email))
        {
            return BadRequest("User with this email already exists.");
        }

        // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.Username == createUserDto.Username))
        {
            return BadRequest("User with this username already exists.");
        }

        var user = _mapper.Map<User>(createUserDto);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password);
        user.CreatedAtUtc = DateTime.UtcNow;
        user.UpdatedAtUtc = DateTime.UtcNow;

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Add roles if provided
        if (createUserDto.RoleIds?.Any() == true)
        {
            var userRoles = createUserDto.RoleIds.Select(roleId => new UserRole
            {
                UserId = user.Id,
                RoleId = roleId,
                CreatedAtUtc = DateTime.UtcNow
            });

            _context.UserRoles.AddRange(userRoles);
            await _context.SaveChangesAsync();
        }

        var userDto = _mapper.Map<UserDto>(user);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto updateUserDto)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        var validator = new UpdateUserValidator();
        var validationResult = await validator.ValidateAsync(updateUserDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if email already exists (excluding current user)
        if (await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id))
        {
            return BadRequest("User with this email already exists.");
        }

        // Check if username already exists (excluding current user)
        if (await _context.Users.AnyAsync(u => u.Username == updateUserDto.Username && u.Id != id))
        {
            return BadRequest("User with this username already exists.");
        }

        _mapper.Map(updateUserDto, user);
        user.UpdatedAtUtc = DateTime.UtcNow;

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(updateUserDto.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password);
        }

        // Update roles if provided
        if (updateUserDto.RoleIds != null)
        {
            // Remove existing roles
            _context.UserRoles.RemoveRange(user.UserRoles);

            // Add new roles
            if (updateUserDto.RoleIds.Any())
            {
                var userRoles = updateUserDto.RoleIds.Select(roleId => new UserRole
                {
                    UserId = user.Id,
                    RoleId = roleId,
                    CreatedAtUtc = DateTime.UtcNow
                });

                _context.UserRoles.AddRange(userRoles);
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // Check if user has any related data
        var hasTenders = await _context.Tenders.AnyAsync(t => t.CreatedBy == id);
        var hasQuotations = await _context.Quotations.AnyAsync(q => q.CreatedBy == id);
        var hasContracts = await _context.Contracts.AnyAsync(c => c.CreatedBy == id);

        if (hasTenders || hasQuotations || hasContracts)
        {
            return BadRequest("Cannot delete user with existing related data. Consider deactivating instead.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        user.IsActive = true;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        user.IsActive = false;
        user.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:guid}/roles")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignRoles(Guid id, [FromBody] AssignRolesDto assignRolesDto)
    {
        Console.WriteLine($"AssignRoles called for user {id}");
        Console.WriteLine($"Request body: {System.Text.Json.JsonSerializer.Serialize(assignRolesDto)}");

        if (assignRolesDto == null)
        {
            Console.WriteLine("Request body is null");
            return BadRequest("Request body is required");
        }

        var validator = new AssignRolesValidator();
        var validationResult = await validator.ValidateAsync(assignRolesDto);
        
        if (!validationResult.IsValid)
        {
            Console.WriteLine("Validation failed");
            foreach (var error in validationResult.Errors)
            {
                Console.WriteLine($"Validation error: {error.PropertyName} - {error.ErrorMessage}");
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
        {
            Console.WriteLine($"User {id} not found");
            return NotFound();
        }

        Console.WriteLine($"Found user: {user.Username}");

        // Remove existing roles
        _context.UserRoles.RemoveRange(user.UserRoles);
        Console.WriteLine($"Removed {user.UserRoles.Count} existing roles");

        // Add new roles
        if (assignRolesDto.RoleIds?.Any() == true)
        {
            var userRoles = assignRolesDto.RoleIds.Select(roleId => new UserRole
            {
                UserId = user.Id,
                RoleId = roleId,
                CreatedAtUtc = DateTime.UtcNow
            });

            _context.UserRoles.AddRange(userRoles);
            Console.WriteLine($"Added {assignRolesDto.RoleIds.Count} new roles");
        }
        else
        {
            Console.WriteLine("No roles to assign");
        }

        await _context.SaveChangesAsync();
        Console.WriteLine("Changes saved successfully");
        return NoContent();
    }

    [HttpPost("{id:guid}/change-password")]
    public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto changePasswordDto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound();

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest("Current password is incorrect.");
        }

        var validator = new ChangePasswordValidator();
        var validationResult = await validator.ValidateAsync(changePasswordDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
        user.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

// DTOs
public record ChangePasswordDto(string CurrentPassword, string NewPassword, string ConfirmPassword);

public class AssignRolesDto
{
    public List<Guid> RoleIds { get; set; } = new();
}

public class AssignRolesValidator : AbstractValidator<AssignRolesDto>
{
    public AssignRolesValidator()
    {
        RuleFor(x => x.RoleIds).NotNull().WithMessage("RoleIds cannot be null");
    }
}

// Validators
public class CreateUserValidator : AbstractValidator<CreateUserDto>
{
    public CreateUserValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Phone).MaximumLength(20);
    }
}

public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Username).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Password).MinimumLength(8).When(x => !string.IsNullOrWhiteSpace(x.Password));
    }
}

public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
        RuleFor(x => x.ConfirmPassword).NotEmpty().Equal(x => x.NewPassword)
            .WithMessage("Confirm password must match new password.");
    }
}
