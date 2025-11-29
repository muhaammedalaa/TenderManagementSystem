using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.BankGuarantee;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BankGuaranteesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public BankGuaranteesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BankGuaranteeDto>>> GetBankGuarantees(
        string? search, 
        GuaranteeType? guaranteeType,
        string? status,
        Guid? quotationId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.BankGuarantees
            .Include(bg => bg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(bg => bg.Currency)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(bg => 
                bg.GuaranteeNumber.Contains(search) || 
                bg.BankName.Contains(search) ||
                (bg.BankBranch != null && bg.BankBranch.Contains(search)));
        }

        if (guaranteeType.HasValue)
        {
            query = query.Where(bg => bg.GuaranteeType == guaranteeType.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<GuaranteeStatus>(status, true, out var statusEnum))
            {
                query = query.Where(bg => bg.Status == statusEnum);
            }
        }

        if (quotationId.HasValue)
        {
            query = query.Where(bg => bg.QuotationId == quotationId.Value);
        }

        var totalCount = await query.CountAsync();
        var bankGuarantees = await query
            .OrderByDescending(bg => bg.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var bankGuaranteeDtos = _mapper.Map<IEnumerable<BankGuaranteeDto>>(bankGuarantees);

        return Ok(new
        {
            data = bankGuaranteeDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BankGuaranteeDto>> GetBankGuarantee(Guid id)
    {
        var bankGuarantee = await _context.BankGuarantees
            .Include(bg => bg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(bg => bg.Currency)
            .AsNoTracking()
            .FirstOrDefaultAsync(bg => bg.Id == id);

        if (bankGuarantee == null)
            return NotFound();

        var bankGuaranteeDto = _mapper.Map<BankGuaranteeDto>(bankGuarantee);
        return Ok(bankGuaranteeDto);
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<IEnumerable<BankGuaranteeDto>>> GetExpiringGuarantees(int days = 30)
    {
        var expiryDate = DateTime.UtcNow.AddDays(days);

        var expiringGuarantees = await _context.BankGuarantees
            .Include(bg => bg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(bg => bg.Currency)
            .Where(bg => bg.ExpiryDate <= expiryDate && bg.Status == GuaranteeStatus.Active)
            .OrderBy(bg => bg.ExpiryDate)
            .ToListAsync();

        var bankGuaranteeDtos = _mapper.Map<IEnumerable<BankGuaranteeDto>>(expiringGuarantees);
        return Ok(bankGuaranteeDtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<BankGuaranteeDto>> CreateBankGuarantee([FromBody] CreateBankGuaranteeDto createBankGuaranteeDto)
    {
        Console.WriteLine($"CreateBankGuarantee called with data: {System.Text.Json.JsonSerializer.Serialize(createBankGuaranteeDto)}");
        
        var validator = new CreateBankGuaranteeValidator();
        var validationResult = await validator.ValidateAsync(createBankGuaranteeDto);
        
        if (!validationResult.IsValid)
        {
            Console.WriteLine("Validation failed:");
            foreach (var error in validationResult.Errors)
            {
                Console.WriteLine($"  {error.PropertyName}: {error.ErrorMessage}");
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if guarantee number already exists
        if (await _context.BankGuarantees.AnyAsync(bg => bg.GuaranteeNumber == createBankGuaranteeDto.GuaranteeNumber))
        {
            return BadRequest($"Bank guarantee with number '{createBankGuaranteeDto.GuaranteeNumber}' already exists.");
        }

        // Validate quotation exists
        if (!await _context.Quotations.AnyAsync(q => q.Id == createBankGuaranteeDto.QuotationId))
        {
            return BadRequest($"Quotation with ID {createBankGuaranteeDto.QuotationId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == createBankGuaranteeDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{createBankGuaranteeDto.CurrencyCode}' does not exist.");
        }

        var bankGuarantee = _mapper.Map<BankGuarantee>(createBankGuaranteeDto);
        bankGuarantee.CreatedAtUtc = DateTime.UtcNow;
        bankGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        // Calculate profit if percentage is provided
        if (bankGuarantee.ProfitPercentage.HasValue)
        {
            bankGuarantee.CalculatedProfit = (bankGuarantee.Amount * bankGuarantee.ProfitPercentage.Value) / 100;
        }

        _context.BankGuarantees.Add(bankGuarantee);
        await _context.SaveChangesAsync();

        var bankGuaranteeDto = _mapper.Map<BankGuaranteeDto>(bankGuarantee);
        return CreatedAtAction(nameof(GetBankGuarantee), new { id = bankGuarantee.Id }, bankGuaranteeDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBankGuarantee(Guid id, [FromBody] CreateBankGuaranteeDto updateBankGuaranteeDto)
    {
        var bankGuarantee = await _context.BankGuarantees.FindAsync(id);
        if (bankGuarantee == null)
            return NotFound();

        var validator = new CreateBankGuaranteeValidator();
        var validationResult = await validator.ValidateAsync(updateBankGuaranteeDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if guarantee number already exists (excluding current guarantee)
        if (await _context.BankGuarantees.AnyAsync(bg => bg.GuaranteeNumber == updateBankGuaranteeDto.GuaranteeNumber && bg.Id != id))
        {
            return BadRequest($"Bank guarantee with number '{updateBankGuaranteeDto.GuaranteeNumber}' already exists.");
        }

        // Validate quotation exists
        if (!await _context.Quotations.AnyAsync(q => q.Id == updateBankGuaranteeDto.QuotationId))
        {
            return BadRequest($"Quotation with ID {updateBankGuaranteeDto.QuotationId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == updateBankGuaranteeDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{updateBankGuaranteeDto.CurrencyCode}' does not exist.");
        }

        _mapper.Map(updateBankGuaranteeDto, bankGuarantee);
        bankGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        // Recalculate profit if percentage is provided
        if (bankGuarantee.ProfitPercentage.HasValue)
        {
            bankGuarantee.CalculatedProfit = (bankGuarantee.Amount * bankGuarantee.ProfitPercentage.Value) / 100;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBankGuarantee(Guid id)
    {
        var bankGuarantee = await _context.BankGuarantees.FindAsync(id);
        if (bankGuarantee == null)
            return NotFound();

        _context.BankGuarantees.Remove(bankGuarantee);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateBankGuaranteeStatus(Guid id, [FromBody] UpdateBankGuaranteeStatusDto statusDto)
    {
        var bankGuarantee = await _context.BankGuarantees.FindAsync(id);
        if (bankGuarantee == null)
            return NotFound();

        bankGuarantee.Status = statusDto.Status;
        bankGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetBankGuaranteeStatistics()
    {
        var totalGuarantees = await _context.BankGuarantees.CountAsync();
        var activeGuarantees = await _context.BankGuarantees.CountAsync(bg => bg.Status == GuaranteeStatus.Active);
        var expiredGuarantees = await _context.BankGuarantees.CountAsync(bg => bg.Status == GuaranteeStatus.Expired);

        var totalAmount = await _context.BankGuarantees.SumAsync(bg => bg.Amount);
        var averageAmount = await _context.BankGuarantees.AverageAsync(bg => bg.Amount);

        var totalProfit = await _context.BankGuarantees
            .Where(bg => bg.CalculatedProfit.HasValue)
            .SumAsync(bg => bg.CalculatedProfit ?? 0);

        var averageProfitMargin = await _context.BankGuarantees
            .Where(bg => bg.ProfitPercentage.HasValue)
            .AverageAsync(bg => bg.ProfitPercentage ?? 0);

        var statistics = new
        {
            totalGuarantees,
            activeGuarantees,
            expiredGuarantees,
            totalAmount,
            averageAmount,
            totalProfit,
            averageProfitMargin
        };

        return Ok(statistics);
    }

    [HttpGet("by-bank")]
    public async Task<ActionResult<IEnumerable<object>>> GetGuaranteesByBank()
    {
        var guaranteesByBank = await _context.BankGuarantees
            .GroupBy(bg => bg.BankName)
            .Select(g => new
            {
                bankName = g.Key,
                count = g.Count(),
                totalAmount = g.Sum(bg => bg.Amount),
                averageAmount = g.Average(bg => bg.Amount)
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(guaranteesByBank);
    }
}

// DTOs
public record UpdateBankGuaranteeStatusDto(GuaranteeStatus Status);

public class CreateBankGuaranteeValidator : AbstractValidator<CreateBankGuaranteeDto>
{
    public CreateBankGuaranteeValidator()
    {
        RuleFor(x => x.GuaranteeNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BankName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.ExpiryDate).NotEmpty().GreaterThan(x => x.IssueDate);
        RuleFor(x => x.GuaranteeType).IsInEnum();
        RuleFor(x => x.Status).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProfitPercentage).InclusiveBetween(0, 100).When(x => x.ProfitPercentage.HasValue);
    }
}
