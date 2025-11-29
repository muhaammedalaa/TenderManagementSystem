using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Contract;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class ContractsController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public ContractsController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContractDto>>> GetContracts(
        string? search, 
        ContractType? contractType,
        string? status,
        Guid? assignmentOrderId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Contracts
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao!.Quotation)
                    .ThenInclude(q => q!.Supplier)
            .Include(c => c.Currency)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(c => 
                c.ContractNumber.Contains(search) || 
                (c.Description != null && c.Description.Contains(search)));
        }

        if (contractType.HasValue)
        {
            query = query.Where(c => c.ContractType == contractType.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<ContractStatus>(status, true, out var statusEnum))
            {
                query = query.Where(c => c.Status == statusEnum);
            }
        }

        if (assignmentOrderId.HasValue)
        {
            query = query.Where(c => c.AssignmentOrderId == assignmentOrderId.Value);
        }

        var totalCount = await query.CountAsync();
        var contracts = await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var contractDtos = _mapper.Map<IEnumerable<ContractDto>>(contracts);
        
        // Debug log to check if AssignmentOrder is included
        if (contractDtos.Any())
        {
            var firstContract = contractDtos.First();
            Console.WriteLine($"First contract AssignmentOrder: {firstContract.AssignmentOrder?.OrderNumber ?? "NULL"}");
            Console.WriteLine($"First contract AssignmentOrderId: {firstContract.AssignmentOrderId}");
            if (firstContract.AssignmentOrder != null)
            {
                Console.WriteLine($"AssignmentOrder details: OrderNumber={firstContract.AssignmentOrder.OrderNumber}, Amount={firstContract.AssignmentOrder.Amount}");
            }
            else
            {
                Console.WriteLine("AssignmentOrder is NULL - checking raw contract data");
                var rawContract = contracts.First();
                Console.WriteLine($"Raw contract AssignmentOrderId: {rawContract.AssignmentOrderId}");
                Console.WriteLine($"Raw contract AssignmentOrder: {rawContract.AssignmentOrder?.OrderNumber ?? "NULL"}");
            }
        }

        return Ok(new
        {
            data = contractDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ContractDto>> GetContract(Guid id)
    {
        var contract = await _context.Contracts
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao!.Quotation)
                    .ThenInclude(q => q!.Supplier)
            .Include(c => c.Currency)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
            return NotFound();

        var contractDto = _mapper.Map<ContractDto>(contract);
        return Ok(contractDto);
    }

    [HttpGet("{id:guid}/deliveries")]
    public async Task<ActionResult<IEnumerable<object>>> GetContractDeliveries(Guid id)
    {
        var deliveries = await _context.SupplyDeliveries
            .Include(sd => sd.Contract)
            .Where(sd => sd.ContractId == id)
            .OrderByDescending(sd => sd.CreatedAtUtc)
            .Select(sd => new
            {
                id = sd.Id,
                deliveryNumber = sd.DeliveryNumber,
                deliveryDate = sd.DeliveryDate,
                quantity = sd.Quantity,
                unit = sd.Unit,
                status = sd.Status.ToString(),
                notes = sd.Notes,
                createdAt = sd.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(deliveries);
    }

    [HttpGet("{id:guid}/guarantees")]
    public async Task<ActionResult<IEnumerable<object>>> GetContractGuarantees(Guid id)
    {
        var contract = await _context.Contracts
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao!.Quotation)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
            return NotFound();

        var quotationId = contract.AssignmentOrder?.QuotationId;
        
        if (quotationId == null)
            return BadRequest("Contract is not associated with a quotation.");

        var bankGuarantees = await _context.BankGuarantees
            .Where(bg => bg.QuotationId == quotationId)
            .Select(bg => new
            {
                id = bg.Id,
                type = "Bank",
                guaranteeNumber = bg.GuaranteeNumber,
                bankName = bg.BankName,
                amount = bg.Amount,
                currency = bg.CurrencyCode,
                issueDate = bg.IssueDate,
                expiryDate = bg.ExpiryDate,
                status = bg.Status
            })
            .ToListAsync();

        var governmentGuarantees = await _context.GovernmentGuarantees
            .Where(gg => gg.QuotationId == quotationId)
            .Select(gg => new
            {
                id = gg.Id,
                type = "Government",
                guaranteeNumber = gg.GuaranteeNumber,
                authorityName = gg.AuthorityName,
                amount = gg.Amount,
                currency = gg.CurrencyCode,
                issueDate = gg.IssueDate,
                expiryDate = gg.ExpiryDate,
                status = gg.Status
            })
            .ToListAsync();

        var allGuarantees = bankGuarantees.Cast<object>().Concat(governmentGuarantees.Cast<object>())
            .OrderByDescending(g => ((dynamic)g).issueDate)
            .ToList();

        return Ok(allGuarantees);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ContractDto>> CreateContract([FromBody] CreateContractDto createContractDto)
    {
        var validator = new CreateContractValidator();
        var validationResult = await validator.ValidateAsync(createContractDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if contract number already exists
        if (await _context.Contracts.AnyAsync(c => c.ContractNumber == createContractDto.ContractNumber))
        {
            return BadRequest($"Contract with number '{createContractDto.ContractNumber}' already exists.");
        }

        // Validate assignment order exists
        if (!await _context.AssignmentOrders.AnyAsync(ao => ao.Id == createContractDto.AssignmentOrderId))
        {
            return BadRequest($"Assignment order with ID {createContractDto.AssignmentOrderId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == createContractDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{createContractDto.CurrencyCode}' does not exist.");
        }

        var contract = _mapper.Map<Contract>(createContractDto);
        contract.CreatedAtUtc = DateTime.UtcNow;
        contract.UpdatedAtUtc = DateTime.UtcNow;

        _context.Contracts.Add(contract);
        await _context.SaveChangesAsync();

        var contractDto = _mapper.Map<ContractDto>(contract);
        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, contractDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateContract(Guid id, [FromBody] CreateContractDto updateContractDto)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound();

        var validator = new CreateContractValidator();
        var validationResult = await validator.ValidateAsync(updateContractDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if contract number already exists (excluding current contract)
        if (await _context.Contracts.AnyAsync(c => c.ContractNumber == updateContractDto.ContractNumber && c.Id != id))
        {
            return BadRequest($"Contract with number '{updateContractDto.ContractNumber}' already exists.");
        }

        // Validate assignment order exists
        if (!await _context.AssignmentOrders.AnyAsync(ao => ao.Id == updateContractDto.AssignmentOrderId))
        {
            return BadRequest($"Assignment order with ID {updateContractDto.AssignmentOrderId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == updateContractDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{updateContractDto.CurrencyCode}' does not exist.");
        }

        _mapper.Map(updateContractDto, contract);
        contract.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteContract(Guid id)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound();

        // Check if contract has deliveries
        if (await _context.SupplyDeliveries.AnyAsync(sd => sd.ContractId == id))
        {
            return BadRequest("Cannot delete contract that has deliveries.");
        }

        _context.Contracts.Remove(contract);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateContractStatus(Guid id, [FromBody] UpdateContractStatusDto statusDto)
    {
        var contract = await _context.Contracts.FindAsync(id);
        if (contract == null)
            return NotFound();

        contract.Status = statusDto.Status;
        contract.UpdatedAtUtc = DateTime.UtcNow;

        if (statusDto.Status == ContractStatus.Completed)
        {
            contract.CompletionDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetContractStatistics()
    {
        var totalContracts = await _context.Contracts.CountAsync();
        var activeContracts = await _context.Contracts.CountAsync(c => c.Status == ContractStatus.Active);
        var completedContracts = await _context.Contracts.CountAsync(c => c.Status == ContractStatus.Completed);
        var cancelledContracts = await _context.Contracts.CountAsync(c => c.Status == ContractStatus.Terminated);

        var totalValue = await _context.Contracts.SumAsync(c => c.Amount);
        var averageValue = await _context.Contracts.AverageAsync(c => c.Amount);

        var statistics = new
        {
            totalContracts,
            activeContracts,
            completedContracts,
            cancelledContracts,
            totalValue,
            averageValue
        };

        return Ok(statistics);
    }
}

// DTOs
public record UpdateContractStatusDto(ContractStatus Status);

public class CreateContractValidator : AbstractValidator<CreateContractDto>
{
    public CreateContractValidator()
    {
        RuleFor(x => x.ContractNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ContractType).IsInEnum();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.StartDate).NotEmpty();
        RuleFor(x => x.EndDate).NotEmpty().GreaterThan(x => x.StartDate);
        RuleFor(x => x.Status).NotEmpty();
        RuleFor(x => x.Description).MaximumLength(1000);
    }
}
