using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.GovernmentGuarantee;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class GovernmentGuaranteesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public GovernmentGuaranteesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GovernmentGuaranteeDto>>> GetGovernmentGuarantees(
        string? search, 
        GuaranteeType? guaranteeType,
        string? status,
        Guid? quotationId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.GovernmentGuarantees
            .Include(gg => gg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(gg => gg.Currency)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(gg => 
                gg.GuaranteeNumber.Contains(search) || 
                gg.AuthorityName.Contains(search) ||
                (gg.AuthorityType != null && gg.AuthorityType.Contains(search)));
        }

        if (guaranteeType.HasValue)
        {
            query = query.Where(gg => gg.GuaranteeType == guaranteeType.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<GuaranteeStatus>(status, true, out var statusEnum))
            {
                query = query.Where(gg => gg.Status == statusEnum);
            }
        }

        if (quotationId.HasValue)
        {
            query = query.Where(gg => gg.QuotationId == quotationId.Value);
        }

        var totalCount = await query.CountAsync();
        var governmentGuarantees = await query
            .OrderByDescending(gg => gg.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var governmentGuaranteeDtos = _mapper.Map<IEnumerable<GovernmentGuaranteeDto>>(governmentGuarantees);

        return Ok(new
        {
            data = governmentGuaranteeDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GovernmentGuaranteeDto>> GetGovernmentGuarantee(Guid id)
    {
        var governmentGuarantee = await _context.GovernmentGuarantees
            .Include(gg => gg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(gg => gg.Currency)
            .AsNoTracking()
            .FirstOrDefaultAsync(gg => gg.Id == id);

        if (governmentGuarantee == null)
            return NotFound();

        var governmentGuaranteeDto = _mapper.Map<GovernmentGuaranteeDto>(governmentGuarantee);
        return Ok(governmentGuaranteeDto);
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<IEnumerable<GovernmentGuaranteeDto>>> GetExpiringGuarantees(int days = 30)
    {
        var expiryDate = DateTime.UtcNow.AddDays(days);

        var expiringGuarantees = await _context.GovernmentGuarantees
            .Include(gg => gg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Include(gg => gg.Currency)
            .Where(gg => gg.ExpiryDate <= expiryDate && gg.Status == GuaranteeStatus.Active)
            .OrderBy(gg => gg.ExpiryDate)
            .ToListAsync();

        var governmentGuaranteeDtos = _mapper.Map<IEnumerable<GovernmentGuaranteeDto>>(expiringGuarantees);
        return Ok(governmentGuaranteeDtos);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<GovernmentGuaranteeDto>> CreateGovernmentGuarantee([FromBody] CreateGovernmentGuaranteeDto createGovernmentGuaranteeDto)
    {
        Console.WriteLine($"CreateGovernmentGuarantee called with data: {System.Text.Json.JsonSerializer.Serialize(createGovernmentGuaranteeDto)}");
        
        var validator = new CreateGovernmentGuaranteeValidator();
        var validationResult = await validator.ValidateAsync(createGovernmentGuaranteeDto);
        
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
        if (await _context.GovernmentGuarantees.AnyAsync(gg => gg.GuaranteeNumber == createGovernmentGuaranteeDto.GuaranteeNumber))
        {
            return BadRequest($"Government guarantee with number '{createGovernmentGuaranteeDto.GuaranteeNumber}' already exists.");
        }

        // Validate quotation exists
        Console.WriteLine($"Checking if quotation {createGovernmentGuaranteeDto.QuotationId} exists...");
        var quotationExists = await _context.Quotations.AnyAsync(q => q.Id == createGovernmentGuaranteeDto.QuotationId);
        Console.WriteLine($"Quotation exists: {quotationExists}");
        if (!quotationExists)
        {
            return BadRequest($"Quotation with ID {createGovernmentGuaranteeDto.QuotationId} does not exist.");
        }

        // Validate currency exists
        Console.WriteLine($"Checking if currency {createGovernmentGuaranteeDto.CurrencyCode} exists...");
        var currencyExists = await _context.Currencies.AnyAsync(c => c.Code == createGovernmentGuaranteeDto.CurrencyCode);
        Console.WriteLine($"Currency exists: {currencyExists}");
        if (!currencyExists)
        {
            return BadRequest($"Currency with code '{createGovernmentGuaranteeDto.CurrencyCode}' does not exist.");
        }

        var governmentGuarantee = _mapper.Map<GovernmentGuarantee>(createGovernmentGuaranteeDto);
        governmentGuarantee.CreatedAtUtc = DateTime.UtcNow;
        governmentGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        // Calculate profit if percentage is provided
        if (governmentGuarantee.ProfitPercentage.HasValue)
        {
            governmentGuarantee.CalculatedProfit = (governmentGuarantee.Amount * governmentGuarantee.ProfitPercentage.Value) / 100;
        }

        _context.GovernmentGuarantees.Add(governmentGuarantee);
        await _context.SaveChangesAsync();

        var governmentGuaranteeDto = _mapper.Map<GovernmentGuaranteeDto>(governmentGuarantee);
        return CreatedAtAction(nameof(GetGovernmentGuarantee), new { id = governmentGuarantee.Id }, governmentGuaranteeDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateGovernmentGuarantee(Guid id, [FromBody] CreateGovernmentGuaranteeDto updateGovernmentGuaranteeDto)
    {
        var governmentGuarantee = await _context.GovernmentGuarantees.FindAsync(id);
        if (governmentGuarantee == null)
            return NotFound();

        var validator = new CreateGovernmentGuaranteeValidator();
        var validationResult = await validator.ValidateAsync(updateGovernmentGuaranteeDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if guarantee number already exists (excluding current guarantee)
        if (await _context.GovernmentGuarantees.AnyAsync(gg => gg.GuaranteeNumber == updateGovernmentGuaranteeDto.GuaranteeNumber && gg.Id != id))
        {
            return BadRequest($"Government guarantee with number '{updateGovernmentGuaranteeDto.GuaranteeNumber}' already exists.");
        }

        // Validate quotation exists
        if (!await _context.Quotations.AnyAsync(q => q.Id == updateGovernmentGuaranteeDto.QuotationId))
        {
            return BadRequest($"Quotation with ID {updateGovernmentGuaranteeDto.QuotationId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == updateGovernmentGuaranteeDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{updateGovernmentGuaranteeDto.CurrencyCode}' does not exist.");
        }

        _mapper.Map(updateGovernmentGuaranteeDto, governmentGuarantee);
        governmentGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        // Recalculate profit if percentage is provided
        if (governmentGuarantee.ProfitPercentage.HasValue)
        {
            governmentGuarantee.CalculatedProfit = (governmentGuarantee.Amount * governmentGuarantee.ProfitPercentage.Value) / 100;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteGovernmentGuarantee(Guid id)
    {
        var governmentGuarantee = await _context.GovernmentGuarantees.FindAsync(id);
        if (governmentGuarantee == null)
            return NotFound();

        _context.GovernmentGuarantees.Remove(governmentGuarantee);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateGovernmentGuaranteeStatus(Guid id, [FromBody] UpdateGovernmentGuaranteeStatusDto statusDto)
    {
        var governmentGuarantee = await _context.GovernmentGuarantees.FindAsync(id);
        if (governmentGuarantee == null)
            return NotFound();

        governmentGuarantee.Status = statusDto.Status;
        governmentGuarantee.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetGovernmentGuaranteeStatistics()
    {
        var totalGuarantees = await _context.GovernmentGuarantees.CountAsync();
        var activeGuarantees = await _context.GovernmentGuarantees.CountAsync(gg => gg.Status == GuaranteeStatus.Active);
        var expiredGuarantees = await _context.GovernmentGuarantees.CountAsync(gg => gg.Status == GuaranteeStatus.Expired);

        var totalAmount = await _context.GovernmentGuarantees.SumAsync(gg => gg.Amount);
        var averageAmount = await _context.GovernmentGuarantees.AverageAsync(gg => gg.Amount);

        var totalProfit = await _context.GovernmentGuarantees
            .Where(gg => gg.CalculatedProfit.HasValue)
            .SumAsync(gg => gg.CalculatedProfit ?? 0);

        var averageProfitMargin = await _context.GovernmentGuarantees
            .Where(gg => gg.ProfitPercentage.HasValue)
            .AverageAsync(gg => gg.ProfitPercentage ?? 0);

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

    [HttpGet("by-authority")]
    public async Task<ActionResult<IEnumerable<object>>> GetGuaranteesByAuthority()
    {
        var guaranteesByAuthority = await _context.GovernmentGuarantees
            .GroupBy(gg => gg.AuthorityName)
            .Select(g => new
            {
                authorityName = g.Key,
                count = g.Count(),
                totalAmount = g.Sum(gg => gg.Amount),
                averageAmount = g.Average(gg => gg.Amount)
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        return Ok(guaranteesByAuthority);
    }
}

// DTOs
public record UpdateGovernmentGuaranteeStatusDto(GuaranteeStatus Status);

public class CreateGovernmentGuaranteeValidator : AbstractValidator<CreateGovernmentGuaranteeDto>
{
    public CreateGovernmentGuaranteeValidator()
    {
        RuleFor(x => x.GuaranteeNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AuthorityName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.IssueDate).NotEmpty();
        RuleFor(x => x.ExpiryDate).NotEmpty().GreaterThan(x => x.IssueDate);
        RuleFor(x => x.GuaranteeType).IsInEnum();
        RuleFor(x => x.Status).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ProfitPercentage).InclusiveBetween(0, 100).When(x => x.ProfitPercentage.HasValue);
    }
}
