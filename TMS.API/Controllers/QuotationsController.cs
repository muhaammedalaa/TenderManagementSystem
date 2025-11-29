using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Quotation;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class QuotationsController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public QuotationsController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<QuotationDto>>> GetQuotations(
        Guid? tenderId, 
        Guid? supplierId,
        string? status,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Quotations
            .Include(q => q.Tender)
            .Include(q => q.Supplier)
            .Include(q => q.Currency)
            .AsNoTracking();

        if (tenderId.HasValue)
        {
            query = query.Where(q => q.TenderId == tenderId.Value);
        }

        if (supplierId.HasValue)
        {
            query = query.Where(q => q.SupplierId == supplierId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (Enum.TryParse<QuotationStatus>(status, true, out var statusEnum))
            {
                query = query.Where(q => q.Status == statusEnum);
            }
        }

        var totalCount = await query.CountAsync();
        var quotations = await query
            .OrderByDescending(q => q.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var quotationDtos = _mapper.Map<IEnumerable<QuotationDto>>(quotations);

        return Ok(new
        {
            data = quotationDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<QuotationDto>> GetQuotation(Guid id)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Tender)
            .Include(q => q.Supplier)
            .Include(q => q.Currency)
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation == null)
            return NotFound();

        var quotationDto = _mapper.Map<QuotationDto>(quotation);
        return Ok(quotationDto);
    }

    [HttpGet("{id:guid}/evaluation")]
    public async Task<ActionResult<object>> GetQuotationEvaluation(Guid id)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Tender)
            .Include(q => q.Supplier)
            .AsNoTracking()
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation == null)
            return NotFound();

        var evaluation = new
        {
            quotationId = quotation.Id,
            tenderId = quotation.TenderId,
            tenderTitle = quotation.Tender.Title,
            supplierName = quotation.Supplier.Name,
            amount = quotation.Amount,
            currency = quotation.CurrencyCode,
            technicalScore = quotation.TechnicalScore,
            financialScore = quotation.FinancialScore,
            totalScore = quotation.TotalScore,
            status = quotation.Status,
            evaluationNotes = quotation.EvaluationNotes,
            evaluationDate = quotation.EvaluationDate,
            submissionDate = quotation.SubmissionDate,
            validityPeriod = quotation.ValidityPeriod,
            deliveryPeriod = quotation.DeliveryPeriod
        };

        return Ok(evaluation);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<QuotationDto>> CreateQuotation([FromBody] CreateQuotationDto createQuotationDto)
    {
        var validator = new CreateQuotationValidator();
        var validationResult = await validator.ValidateAsync(createQuotationDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if reference number already exists
        if (await _context.Quotations.AnyAsync(q => q.ReferenceNumber == createQuotationDto.ReferenceNumber))
        {
            return BadRequest($"Quotation with reference '{createQuotationDto.ReferenceNumber}' already exists.");
        }

        // Validate tender exists
        if (!await _context.Tenders.AnyAsync(t => t.Id == createQuotationDto.TenderId))
        {
            return BadRequest($"Tender with ID {createQuotationDto.TenderId} does not exist.");
        }

        // Validate supplier exists
        if (!await _context.Suppliers.AnyAsync(s => s.Id == createQuotationDto.SupplierId))
        {
            return BadRequest($"Supplier with ID {createQuotationDto.SupplierId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == createQuotationDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{createQuotationDto.CurrencyCode}' does not exist.");
        }

        var quotation = _mapper.Map<Quotation>(createQuotationDto);
        quotation.CreatedAtUtc = DateTime.UtcNow;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        _context.Quotations.Add(quotation);
        await _context.SaveChangesAsync();

        var quotationDto = _mapper.Map<QuotationDto>(quotation);
        return CreatedAtAction(nameof(GetQuotation), new { id = quotation.Id }, quotationDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateQuotation(Guid id, [FromBody] CreateQuotationDto updateQuotationDto)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound();

        var validator = new CreateQuotationValidator();
        var validationResult = await validator.ValidateAsync(updateQuotationDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if reference number already exists (excluding current quotation)
        if (await _context.Quotations.AnyAsync(q => q.ReferenceNumber == updateQuotationDto.ReferenceNumber && q.Id != id))
        {
            return BadRequest($"Quotation with reference '{updateQuotationDto.ReferenceNumber}' already exists.");
        }

        // Validate tender exists
        if (!await _context.Tenders.AnyAsync(t => t.Id == updateQuotationDto.TenderId))
        {
            return BadRequest($"Tender with ID {updateQuotationDto.TenderId} does not exist.");
        }

        // Validate supplier exists
        if (!await _context.Suppliers.AnyAsync(s => s.Id == updateQuotationDto.SupplierId))
        {
            return BadRequest($"Supplier with ID {updateQuotationDto.SupplierId} does not exist.");
        }

        // Validate currency exists
        if (!await _context.Currencies.AnyAsync(c => c.Code == updateQuotationDto.CurrencyCode))
        {
            return BadRequest($"Currency with code '{updateQuotationDto.CurrencyCode}' does not exist.");
        }

        _mapper.Map(updateQuotationDto, quotation);
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteQuotation(Guid id)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound();

        // Check if quotation is a winner
        if (await _context.Tenders.AnyAsync(t => t.WinnerQuotationId == id))
        {
            return BadRequest("Cannot delete quotation that is a tender winner.");
        }

        _context.Quotations.Remove(quotation);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/evaluate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> EvaluateQuotation(Guid id, [FromBody] EvaluateQuotationDto evaluationDto)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound();

        var validator = new EvaluateQuotationValidator();
        var validationResult = await validator.ValidateAsync(evaluationDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        quotation.TechnicalScore = evaluationDto.TechnicalScore;
        quotation.FinancialScore = evaluationDto.FinancialScore;
        quotation.TotalScore = evaluationDto.TotalScore;
        quotation.Status = evaluationDto.Status;
        quotation.EvaluationNotes = evaluationDto.EvaluationNotes;
        quotation.EvaluationDate = DateTime.UtcNow;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateQuotationStatus(Guid id, [FromBody] UpdateQuotationStatusDto statusDto)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound();

        quotation.Status = statusDto.Status;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        if (statusDto.Status == QuotationStatus.Awarded)
        {
            // Update tender winner
            var tender = await _context.Tenders.FindAsync(quotation.TenderId);
            if (tender != null)
            {
                tender.WinnerQuotationId = id;
                tender.AwardedDate = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetQuotationStatistics()
    {
        var totalQuotations = await _context.Quotations.CountAsync();
        var wonQuotations = await _context.Quotations.CountAsync(q => q.Status == QuotationStatus.Awarded);
        var pendingQuotations = await _context.Quotations.CountAsync(q => q.Status == QuotationStatus.UnderReview);
        var rejectedQuotations = await _context.Quotations.CountAsync(q => q.Status == QuotationStatus.Rejected);

        var averageAmount = await _context.Quotations.AverageAsync(q => q.Amount);
        var totalValue = await _context.Quotations.SumAsync(q => q.Amount);

        var statistics = new
        {
            totalQuotations,
            wonQuotations,
            pendingQuotations,
            rejectedQuotations,
            winRate = totalQuotations > 0 ? (double)wonQuotations / totalQuotations * 100 : 0,
            averageAmount,
            totalValue
        };

        return Ok(statistics);
    }
}

// DTOs
public record EvaluateQuotationDto(
    decimal? TechnicalScore,
    decimal? FinancialScore,
    decimal? TotalScore,
    QuotationStatus Status,
    string? EvaluationNotes
);

public record UpdateQuotationStatusDto(QuotationStatus Status);

public class CreateQuotationValidator : AbstractValidator<CreateQuotationDto>
{
    public CreateQuotationValidator()
    {
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CurrencyCode).NotEmpty().MaximumLength(3);
        RuleFor(x => x.ValidityPeriod).GreaterThan(0).When(x => x.ValidityPeriod.HasValue);
        RuleFor(x => x.DeliveryPeriod).GreaterThan(0).When(x => x.DeliveryPeriod.HasValue);
        RuleFor(x => x.TechnicalScore).InclusiveBetween(0, 100).When(x => x.TechnicalScore.HasValue);
        RuleFor(x => x.FinancialScore).InclusiveBetween(0, 100).When(x => x.FinancialScore.HasValue);
        RuleFor(x => x.TotalScore).InclusiveBetween(0, 100).When(x => x.TotalScore.HasValue);
    }
}

public class EvaluateQuotationValidator : AbstractValidator<EvaluateQuotationDto>
{
    public EvaluateQuotationValidator()
    {
        RuleFor(x => x.TechnicalScore).InclusiveBetween(0, 100).When(x => x.TechnicalScore.HasValue);
        RuleFor(x => x.FinancialScore).InclusiveBetween(0, 100).When(x => x.FinancialScore.HasValue);
        RuleFor(x => x.TotalScore).InclusiveBetween(0, 100).When(x => x.TotalScore.HasValue);
        RuleFor(x => x.Status).IsInEnum();
        RuleFor(x => x.EvaluationNotes).MaximumLength(1000);
    }
}
