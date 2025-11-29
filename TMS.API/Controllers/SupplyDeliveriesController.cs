using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.SupplyDelivery;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SupplyDeliveriesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public SupplyDeliveriesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplyDeliveryDto>>> GetSupplyDeliveries(
        string? search,
        Guid? contractId,
        DeliveryStatus? status,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.SupplyDeliveries
            .Include(sd => sd.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao!.Quotation)
                        .ThenInclude(q => q!.Supplier)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(sd => 
                sd.DeliveryNumber.Contains(search) ||
                (sd.Notes != null && sd.Notes.Contains(search)));
        }

        if (contractId.HasValue)
        {
            query = query.Where(sd => sd.ContractId == contractId.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(sd => sd.Status == status.Value);
        }

        var totalCount = await query.CountAsync();
        var supplyDeliveries = await query
            .OrderByDescending(sd => sd.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var supplyDeliveryDtos = _mapper.Map<IEnumerable<SupplyDeliveryDto>>(supplyDeliveries);

        return Ok(new
        {
            data = supplyDeliveryDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupplyDeliveryDto>> GetSupplyDelivery(Guid id)
    {
        var supplyDelivery = await _context.SupplyDeliveries
            .Include(sd => sd.Contract)
                .ThenInclude(c => c.AssignmentOrder)
                    .ThenInclude(ao => ao!.Quotation)
                        .ThenInclude(q => q!.Supplier)
            .AsNoTracking()
            .FirstOrDefaultAsync(sd => sd.Id == id);

        if (supplyDelivery == null)
            return NotFound();

        var supplyDeliveryDto = _mapper.Map<SupplyDeliveryDto>(supplyDelivery);
        return Ok(supplyDeliveryDto);
    }

    [HttpGet("contract/{contractId:guid}")]
    public async Task<ActionResult<IEnumerable<SupplyDeliveryDto>>> GetDeliveriesByContract(Guid contractId)
    {
        var supplyDeliveries = await _context.SupplyDeliveries
            .Include(sd => sd.Contract)
            .Where(sd => sd.ContractId == contractId)
            .OrderBy(sd => sd.DeliveryDate)
            .ToListAsync();

        var supplyDeliveryDtos = _mapper.Map<IEnumerable<SupplyDeliveryDto>>(supplyDeliveries);
        return Ok(supplyDeliveryDtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SupplyDeliveryDto>> CreateSupplyDelivery([FromBody] CreateSupplyDeliveryDto createSupplyDeliveryDto)
    {
        var validator = new CreateSupplyDeliveryValidator();
        var validationResult = await validator.ValidateAsync(createSupplyDeliveryDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if delivery number already exists
        if (await _context.SupplyDeliveries.AnyAsync(sd => sd.DeliveryNumber == createSupplyDeliveryDto.DeliveryNumber))
        {
            return BadRequest($"Supply delivery with number '{createSupplyDeliveryDto.DeliveryNumber}' already exists.");
        }

        // Validate contract exists
        if (!await _context.Contracts.AnyAsync(c => c.Id == createSupplyDeliveryDto.ContractId))
        {
            return BadRequest($"Contract with ID {createSupplyDeliveryDto.ContractId} does not exist.");
        }

        var supplyDelivery = _mapper.Map<SupplyDelivery>(createSupplyDeliveryDto);
        supplyDelivery.CreatedAtUtc = DateTime.UtcNow;
        supplyDelivery.UpdatedAtUtc = DateTime.UtcNow;

        _context.SupplyDeliveries.Add(supplyDelivery);
        await _context.SaveChangesAsync();

        var supplyDeliveryDto = _mapper.Map<SupplyDeliveryDto>(supplyDelivery);
        return CreatedAtAction(nameof(GetSupplyDelivery), new { id = supplyDelivery.Id }, supplyDeliveryDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupplyDelivery(Guid id, [FromBody] CreateSupplyDeliveryDto updateSupplyDeliveryDto)
    {
        var supplyDelivery = await _context.SupplyDeliveries.FindAsync(id);
        if (supplyDelivery == null)
            return NotFound();

        var validator = new CreateSupplyDeliveryValidator();
        var validationResult = await validator.ValidateAsync(updateSupplyDeliveryDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if delivery number already exists (excluding current delivery)
        if (await _context.SupplyDeliveries.AnyAsync(sd => sd.DeliveryNumber == updateSupplyDeliveryDto.DeliveryNumber && sd.Id != id))
        {
            return BadRequest($"Supply delivery with number '{updateSupplyDeliveryDto.DeliveryNumber}' already exists.");
        }

        // Validate contract exists
        if (!await _context.Contracts.AnyAsync(c => c.Id == updateSupplyDeliveryDto.ContractId))
        {
            return BadRequest($"Contract with ID {updateSupplyDeliveryDto.ContractId} does not exist.");
        }

        _mapper.Map(updateSupplyDeliveryDto, supplyDelivery);
        supplyDelivery.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplyDelivery(Guid id)
    {
        var supplyDelivery = await _context.SupplyDeliveries.FindAsync(id);
        if (supplyDelivery == null)
            return NotFound();

        _context.SupplyDeliveries.Remove(supplyDelivery);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupplyDeliveryStatus(Guid id, [FromBody] UpdateSupplyDeliveryStatusDto statusDto)
    {
        var supplyDelivery = await _context.SupplyDeliveries.FindAsync(id);
        if (supplyDelivery == null)
            return NotFound();

        if (!Enum.TryParse(typeof(DeliveryStatus), statusDto.Status, true, out var parsedStatus))
        {
            return BadRequest($"Invalid DeliveryStatus value: {statusDto.Status}");
        }

        supplyDelivery.Status = (DeliveryStatus)parsedStatus!;
        supplyDelivery.UpdatedAtUtc = DateTime.UtcNow;

        if (supplyDelivery.Status == DeliveryStatus.Delivered)
        {
            supplyDelivery.ActualDeliveryDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetSupplyDeliveryStatistics()
    {
        var totalDeliveries = await _context.SupplyDeliveries.CountAsync();
        var pendingDeliveries = await _context.SupplyDeliveries.CountAsync(sd => sd.Status == DeliveryStatus.Pending);
        var inTransitDeliveries = await _context.SupplyDeliveries.CountAsync(sd => sd.Status == DeliveryStatus.InTransit);
        var deliveredDeliveries = await _context.SupplyDeliveries.CountAsync(sd => sd.Status == DeliveryStatus.Delivered);
        var cancelledDeliveries = await _context.SupplyDeliveries.CountAsync(sd => sd.Status == DeliveryStatus.Cancelled);

        var totalQuantity = await _context.SupplyDeliveries.SumAsync(sd => sd.Quantity);
        var averageQuantity = await _context.SupplyDeliveries.AverageAsync(sd => sd.Quantity);

        var statistics = new
        {
            totalDeliveries,
            pendingDeliveries,
            inTransitDeliveries,
            deliveredDeliveries,
            cancelledDeliveries,
            totalQuantity,
            averageQuantity
        };

        return Ok(statistics);
    }

    [HttpGet("overdue")]
    public async Task<ActionResult<IEnumerable<SupplyDeliveryDto>>> GetOverdueDeliveries()
    {
        var overdueDeliveries = await _context.SupplyDeliveries
            .Include(sd => sd.Contract)
            .Where(sd => sd.Status != DeliveryStatus.Delivered && 
                        sd.Status != DeliveryStatus.Cancelled &&
                        sd.DeliveryDate < DateTime.UtcNow)
            .OrderBy(sd => sd.DeliveryDate)
            .ToListAsync();

        var supplyDeliveryDtos = _mapper.Map<IEnumerable<SupplyDeliveryDto>>(overdueDeliveries);
        return Ok(supplyDeliveryDtos);
    }
}

// DTOs
public record UpdateSupplyDeliveryStatusDto(string Status);

public class CreateSupplyDeliveryValidator : AbstractValidator<CreateSupplyDeliveryDto>
{
    public CreateSupplyDeliveryValidator()
    {
        RuleFor(x => x.DeliveryNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.Unit).NotEmpty().MaximumLength(50);
        RuleFor(x => x.DeliveryDate).NotEmpty();
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}
