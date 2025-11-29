using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.AssignmentOrder;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class AssignmentOrdersController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public AssignmentOrdersController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentOrderDto>>> GetAssignmentOrders(
        string? search,
        Guid? quotationId,
        Guid? entityId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.AssignmentOrders
            .Include(ao => ao.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(ao => ao.Entity)
            .Include(ao => ao.Currency)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(ao => 
                ao.OrderNumber.Contains(search) ||
                (ao.Notes != null && ao.Notes.Contains(search)));
        }

        if (quotationId.HasValue)
        {
            query = query.Where(ao => ao.QuotationId == quotationId.Value);
        }

        if (entityId.HasValue)
        {
            query = query.Where(ao => ao.EntityId == entityId.Value);
        }

        var totalCount = await query.CountAsync();
        var assignmentOrders = await query
            .OrderByDescending(ao => ao.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var assignmentOrderDtos = _mapper.Map<IEnumerable<AssignmentOrderDto>>(assignmentOrders);

        return Ok(new
        {
            data = assignmentOrderDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AssignmentOrderDto>> GetAssignmentOrder(Guid id)
    {
        var assignmentOrder = await _context.AssignmentOrders
            .Include(ao => ao.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(ao => ao.Entity)
            .Include(ao => ao.Currency)
            .Include(ao => ao.Contracts)
            .AsNoTracking()
            .FirstOrDefaultAsync(ao => ao.Id == id);

        if (assignmentOrder == null)
            return NotFound();

        var assignmentOrderDto = _mapper.Map<AssignmentOrderDto>(assignmentOrder);
        return Ok(assignmentOrderDto);
    }

    [HttpGet("{id:guid}/contracts")]
    public async Task<ActionResult<IEnumerable<object>>> GetAssignmentOrderContracts(Guid id)
    {
        var contracts = await _context.Contracts
            .Include(c => c.AssignmentOrder)
            .Where(c => c.AssignmentOrderId == id)
            .OrderByDescending(c => c.CreatedAtUtc)
            .Select(c => new
            {
                id = c.Id,
                contractNumber = c.ContractNumber,
                contractType = c.ContractType.ToString(),
                amount = c.Amount,
                currency = c.CurrencyCode,
                startDate = c.StartDate,
                endDate = c.EndDate,
                status = c.Status,
                description = c.Description
            })
            .ToListAsync();

        return Ok(contracts);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AssignmentOrderDto>> CreateAssignmentOrder([FromBody] CreateAssignmentOrderDto createAssignmentOrderDto)
    {
        var validator = new CreateAssignmentOrderValidator();
        var validationResult = await validator.ValidateAsync(createAssignmentOrderDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if order number already exists
        if (await _context.AssignmentOrders.AnyAsync(ao => ao.OrderNumber == createAssignmentOrderDto.OrderNumber))
        {
            return BadRequest($"Assignment order with number '{createAssignmentOrderDto.OrderNumber}' already exists.");
        }

        // Validate quotation exists
        if (!await _context.Quotations.AnyAsync(q => q.Id == createAssignmentOrderDto.QuotationId))
        {
            return BadRequest($"Quotation with ID {createAssignmentOrderDto.QuotationId} does not exist.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == createAssignmentOrderDto.EntityId))
        {
            return BadRequest($"Entity with ID {createAssignmentOrderDto.EntityId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == createAssignmentOrderDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{createAssignmentOrderDto.CurrencyCode}' does not exist.");
        }

        var assignmentOrder = _mapper.Map<AssignmentOrder>(createAssignmentOrderDto);
        assignmentOrder.CreatedAtUtc = DateTime.UtcNow;
        assignmentOrder.UpdatedAtUtc = DateTime.UtcNow;

        _context.AssignmentOrders.Add(assignmentOrder);
        await _context.SaveChangesAsync();

        var assignmentOrderDto = _mapper.Map<AssignmentOrderDto>(assignmentOrder);
        return CreatedAtAction(nameof(GetAssignmentOrder), new { id = assignmentOrder.Id }, assignmentOrderDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateAssignmentOrder(Guid id, [FromBody] CreateAssignmentOrderDto updateAssignmentOrderDto)
    {
        var assignmentOrder = await _context.AssignmentOrders.FindAsync(id);
        if (assignmentOrder == null)
            return NotFound();

        var validator = new CreateAssignmentOrderValidator();
        var validationResult = await validator.ValidateAsync(updateAssignmentOrderDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if order number already exists (excluding current order)
        if (await _context.AssignmentOrders.AnyAsync(ao => ao.OrderNumber == updateAssignmentOrderDto.OrderNumber && ao.Id != id))
        {
            return BadRequest($"Assignment order with number '{updateAssignmentOrderDto.OrderNumber}' already exists.");
        }

        // Validate quotation exists
        if (!await _context.Quotations.AnyAsync(q => q.Id == updateAssignmentOrderDto.QuotationId))
        {
            return BadRequest($"Quotation with ID {updateAssignmentOrderDto.QuotationId} does not exist.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == updateAssignmentOrderDto.EntityId))
        {
            return BadRequest($"Entity with ID {updateAssignmentOrderDto.EntityId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == updateAssignmentOrderDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{updateAssignmentOrderDto.CurrencyCode}' does not exist.");
        }

        _mapper.Map(updateAssignmentOrderDto, assignmentOrder);
        assignmentOrder.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteAssignmentOrder(Guid id)
    {
        var assignmentOrder = await _context.AssignmentOrders.FindAsync(id);
        if (assignmentOrder == null)
            return NotFound();

        // Check if assignment order has contracts
        if (await _context.Contracts.AnyAsync(c => c.AssignmentOrderId == id))
        {
            return BadRequest("Cannot delete assignment order that has contracts.");
        }

        _context.AssignmentOrders.Remove(assignmentOrder);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetAssignmentOrderStatistics()
    {
        var totalOrders = await _context.AssignmentOrders.CountAsync();
        var totalAmount = await _context.AssignmentOrders.SumAsync(ao => ao.Amount);
        var averageAmount = await _context.AssignmentOrders.AverageAsync(ao => ao.Amount);

        var ordersByEntity = await _context.AssignmentOrders
            .Include(ao => ao.Entity)
            .GroupBy(ao => ao.Entity.Name)
            .Select(g => new
            {
                entityName = g.Key,
                count = g.Count(),
                totalAmount = g.Sum(ao => ao.Amount)
            })
            .OrderByDescending(x => x.count)
            .Take(10)
            .ToListAsync();

        var statistics = new
        {
            totalOrders,
            totalAmount,
            averageAmount,
            ordersByEntity
        };

        return Ok(statistics);
    }
}

public class CreateAssignmentOrderValidator : AbstractValidator<CreateAssignmentOrderDto>
{
    public CreateAssignmentOrderValidator()
    {
        RuleFor(x => x.OrderNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.OrderDate).NotEmpty();
        RuleFor(x => x.DeliveryDate).GreaterThan(x => x.OrderDate).When(x => x.DeliveryDate.HasValue);
        RuleFor(x => x.PaymentTerms).MaximumLength(500);
        RuleFor(x => x.Notes).MaximumLength(1000);
    }
}
