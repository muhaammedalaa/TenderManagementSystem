using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Address;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public AddressesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AddressDto>>> GetAddresses(
        Guid? entityId,
        AddressType? addressType,
        bool? isPrimary,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Addresses
            .Include(a => a.Entity)
            .AsNoTracking();

        if (entityId.HasValue)
        {
            query = query.Where(a => a.EntityId == entityId.Value);
        }

        if (addressType.HasValue)
        {
            query = query.Where(a => a.AddressType == addressType.Value);
        }

        if (isPrimary.HasValue)
        {
            query = query.Where(a => a.IsPrimary == isPrimary.Value);
        }

        var totalCount = await query.CountAsync();
        var addresses = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var addressDtos = _mapper.Map<IEnumerable<AddressDto>>(addresses);

        return Ok(new
        {
            data = addressDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AddressDto>> GetAddress(Guid id)
    {
        var address = await _context.Addresses
            .Include(a => a.Entity)
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);

        if (address == null)
            return NotFound();

        var addressDto = _mapper.Map<AddressDto>(address);
        return Ok(addressDto);
    }

    [HttpGet("entity/{entityId:guid}")]
    public async Task<ActionResult<IEnumerable<AddressDto>>> GetAddressesByEntity(Guid entityId)
    {
        var addresses = await _context.Addresses
            .Include(a => a.Entity)
            .Where(a => a.EntityId == entityId)
            .OrderBy(a => a.IsPrimary ? 0 : 1)
            .ThenBy(a => a.AddressType)
            .ToListAsync();

        var addressDtos = _mapper.Map<IEnumerable<AddressDto>>(addresses);
        return Ok(addressDtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AddressDto>> CreateAddress([FromBody] CreateAddressDto createAddressDto)
    {
        var validator = new CreateAddressValidator();
        var validationResult = await validator.ValidateAsync(createAddressDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == createAddressDto.EntityId))
        {
            return BadRequest($"Entity with ID {createAddressDto.EntityId} does not exist.");
        }

        // If this is set as primary, unset other primary addresses for this entity
        if (createAddressDto.IsPrimary)
        {
            var existingPrimaryAddresses = await _context.Addresses
                .Where(a => a.EntityId == createAddressDto.EntityId && a.IsPrimary)
                .ToListAsync();

            foreach (var existingAddress in existingPrimaryAddresses)
            {
                existingAddress.IsPrimary = false;
            }
        }

        var address = _mapper.Map<Address>(createAddressDto);
        address.CreatedAtUtc = DateTime.UtcNow;
        address.UpdatedAtUtc = DateTime.UtcNow;

        _context.Addresses.Add(address);
        await _context.SaveChangesAsync();

        var addressDto = _mapper.Map<AddressDto>(address);
        return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, addressDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAddress(Guid id, [FromBody] CreateAddressDto updateAddressDto)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null)
            return NotFound();

        var validator = new CreateAddressValidator();
        var validationResult = await validator.ValidateAsync(updateAddressDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == updateAddressDto.EntityId))
        {
            return BadRequest($"Entity with ID {updateAddressDto.EntityId} does not exist.");
        }

        // If this is set as primary, unset other primary addresses for this entity
        if (updateAddressDto.IsPrimary)
        {
            var existingPrimaryAddresses = await _context.Addresses
                .Where(a => a.EntityId == updateAddressDto.EntityId && a.IsPrimary && a.Id != id)
                .ToListAsync();

            foreach (var existingAddress in existingPrimaryAddresses)
            {
                existingAddress.IsPrimary = false;
            }
        }

        _mapper.Map(updateAddressDto, address);
        address.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAddress(Guid id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null)
            return NotFound();

        _context.Addresses.Remove(address);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/set-primary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetPrimaryAddress(Guid id)
    {
        var address = await _context.Addresses.FindAsync(id);
        if (address == null)
            return NotFound();

        // Unset other primary addresses for this entity
        var existingPrimaryAddresses = await _context.Addresses
            .Where(a => a.EntityId == address.EntityId && a.IsPrimary && a.Id != id)
            .ToListAsync();

        foreach (var existingAddress in existingPrimaryAddresses)
        {
            existingAddress.IsPrimary = false;
        }

        address.IsPrimary = true;
        address.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("types")]
    public ActionResult<IEnumerable<object>> GetAddressTypes()
    {
        var addressTypes = Enum.GetValues<AddressType>()
            .Select(at => new
            {
                value = at.ToString(),
                name = at.ToString().Replace("_", " ")
            })
            .ToList();

        return Ok(addressTypes);
    }
}

public class CreateAddressValidator : AbstractValidator<CreateAddressDto>
{
    public CreateAddressValidator()
    {
        RuleFor(x => x.AddressLine1).NotEmpty().MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.State).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Country).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PostalCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.AddressType).IsInEnum();
        RuleFor(x => x.AddressLine2).MaximumLength(200);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
