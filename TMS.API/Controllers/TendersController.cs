using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Tender;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class TendersController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public TendersController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TenderDto>>> GetTenders(
        string? search, 
        TenderStatus? status, 
        bool? active,
        Guid? entityId,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Tenders
            .Include(t => t.Entity)
            .Include(t => t.WinnerQuotation)
                .ThenInclude(wq => wq!.Supplier)
            .Include(t => t.Quotations)
                .ThenInclude(q => q.Supplier)
            .Include(t => t.Quotations)
                .ThenInclude(q => q.Currency)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(t => 
                t.Title.Contains(search) || 
                t.ReferenceNumber.Contains(search) ||
                (t.Description != null && t.Description.Contains(search)));
        }

        if (status.HasValue)
        {
            query = query.Where(t => t.Status == status.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(t => t.IsActive == active.Value);
        }

        if (entityId.HasValue)
        {
            query = query.Where(t => t.EntityId == entityId.Value);
        }

        var totalCount = await query.CountAsync();
        var tenders = await query
            .OrderByDescending(t => t.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var tenderDtos = _mapper.Map<IEnumerable<TenderDto>>(tenders);

        return Ok(new
        {
            data = tenderDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TenderDto>> GetTender(Guid id)
    {
        var tender = await _context.Tenders
            .Include(t => t.Entity)
            .Include(t => t.WinnerQuotation)
                .ThenInclude(wq => wq!.Supplier)
            .Include(t => t.Quotations)
                .ThenInclude(q => q.Supplier)
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tender == null)
            return NotFound();

        var tenderDto = _mapper.Map<TenderDto>(tender);
        return Ok(tenderDto);
    }

    [HttpGet("{id:guid}/quotations")]
    public async Task<ActionResult<IEnumerable<object>>> GetTenderQuotations(Guid id)
    {
        var quotations = await _context.Quotations
            .Include(q => q.Supplier)
            .Include(q => q.Currency)
            .Where(q => q.TenderId == id)
            .OrderByDescending(q => q.CreatedAtUtc)
            .Select(q => new
            {
                id = q.Id,
                supplierId = q.SupplierId,
                supplierName = q.Supplier.Name,
                referenceNumber = q.ReferenceNumber,
                amount = q.Amount,
                currency = q.CurrencyCode,
                status = q.Status,
                submissionDate = q.SubmissionDate,
                technicalScore = q.TechnicalScore,
                financialScore = q.FinancialScore,
                totalScore = q.TotalScore,
                validityPeriod = q.ValidityPeriod,
                deliveryPeriod = q.DeliveryPeriod
            })
            .ToListAsync();

        return Ok(quotations);
    }

    [HttpGet("{id:guid}/statistics")]
    public async Task<ActionResult<object>> GetTenderStatistics(Guid id)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        var totalQuotations = await _context.Quotations.CountAsync(q => q.TenderId == id);
        var averageAmount = await _context.Quotations
            .Where(q => q.TenderId == id)
            .AverageAsync(q => q.Amount);
        var lowestAmount = await _context.Quotations
            .Where(q => q.TenderId == id)
            .MinAsync(q => q.Amount);
        var highestAmount = await _context.Quotations
            .Where(q => q.TenderId == id)
            .MaxAsync(q => q.Amount);

        var statistics = new
        {
            totalQuotations,
            averageAmount,
            lowestAmount,
            highestAmount,
            estimatedBudget = tender.EstimatedBudget,
            budgetVariance = tender.EstimatedBudget.HasValue 
                ? (averageAmount - tender.EstimatedBudget.Value) / tender.EstimatedBudget.Value * 100 
                : (decimal?)null,
            submissionDeadline = tender.SubmissionDeadline,
            daysUntilDeadline = (tender.SubmissionDeadline - DateTime.UtcNow).Days,
            status = tender.Status.ToString()
        };

        return Ok(statistics);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TenderDto>> CreateTender([FromBody] CreateTenderDto createTenderDto)
    {
        var validator = new CreateTenderValidator();
        var validationResult = await validator.ValidateAsync(createTenderDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if reference number already exists
        if (await _context.Tenders.AnyAsync(t => t.ReferenceNumber == createTenderDto.ReferenceNumber))
        {
            return BadRequest($"Tender with reference '{createTenderDto.ReferenceNumber}' already exists.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == createTenderDto.EntityId))
        {
            return BadRequest($"Entity with ID {createTenderDto.EntityId} does not exist.");
        }

        var tender = _mapper.Map<Tender>(createTenderDto);
        tender.CreatedAtUtc = DateTime.UtcNow;
        tender.UpdatedAtUtc = DateTime.UtcNow;

        _context.Tenders.Add(tender);
        await _context.SaveChangesAsync();

        var tenderDto = _mapper.Map<TenderDto>(tender);
        return CreatedAtAction(nameof(GetTender), new { id = tender.Id }, tenderDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTender(Guid id, [FromBody] CreateTenderDto updateTenderDto)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        var validator = new CreateTenderValidator();
        var validationResult = await validator.ValidateAsync(updateTenderDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if reference number already exists (excluding current tender)
        if (await _context.Tenders.AnyAsync(t => t.ReferenceNumber == updateTenderDto.ReferenceNumber && t.Id != id))
        {
            return BadRequest($"Tender with reference '{updateTenderDto.ReferenceNumber}' already exists.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == updateTenderDto.EntityId))
        {
            return BadRequest($"Entity with ID {updateTenderDto.EntityId} does not exist.");
        }

        _mapper.Map(updateTenderDto, tender);
        tender.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteTender(Guid id)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        // Check if tender has quotations
        if (await _context.Quotations.AnyAsync(q => q.TenderId == id))
        {
            return BadRequest("Cannot delete tender that has quotations.");
        }

        _context.Tenders.Remove(tender);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateTenderStatus(Guid id, [FromBody] UpdateTenderStatusDto statusDto)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        tender.Status = statusDto.Status;
        tender.UpdatedAtUtc = DateTime.UtcNow;

        if (statusDto.Status == TenderStatus.Awarded && statusDto.WinnerQuotationId.HasValue)
        {
            tender.WinnerQuotationId = statusDto.WinnerQuotationId.Value;
            tender.AwardedDate = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateTender(Guid id)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        tender.IsActive = true;
        tender.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateTender(Guid id)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        tender.IsActive = false;
        tender.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/award")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AwardTender(Guid id, [FromBody] AwardTenderDto awardDto)
    {
        Console.WriteLine($"AwardTender called with TenderId: {id}, WinnerQuotationId: {awardDto.WinnerQuotationId}");
        
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
        {
            Console.WriteLine($"Tender with ID {id} not found");
            return NotFound();
        }

        var quotation = await _context.Quotations.FindAsync(awardDto.WinnerQuotationId);
        if (quotation == null || quotation.TenderId != id)
        {
            Console.WriteLine($"Invalid quotation: {awardDto.WinnerQuotationId} for tender: {id}");
            return BadRequest("Invalid quotation for this tender.");
        }

        Console.WriteLine($"Updating tender {id} with winner quotation {awardDto.WinnerQuotationId}");

        // Update tender
        tender.WinnerQuotationId = awardDto.WinnerQuotationId;
        tender.AwardedDate = DateTime.UtcNow;
        tender.Status = TenderStatus.Awarded;
        tender.UpdatedAtUtc = DateTime.UtcNow;

        // Update quotation status
        quotation.Status = QuotationStatus.Awarded;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        
        Console.WriteLine($"Tender {id} successfully awarded to quotation {awardDto.WinnerQuotationId}");
        return NoContent();
    }

    [HttpPut("{id:guid}/award")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AwardTenderPut(Guid id, [FromBody] AwardTenderDto awardDto)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        var quotation = await _context.Quotations.FindAsync(awardDto.WinnerQuotationId);
        if (quotation == null || quotation.TenderId != id)
            return BadRequest("Invalid quotation for this tender.");

        // Update tender
        tender.WinnerQuotationId = awardDto.WinnerQuotationId;
        tender.AwardedDate = DateTime.UtcNow;
        tender.Status = TenderStatus.Awarded;
        tender.UpdatedAtUtc = DateTime.UtcNow;

        // Update quotation status
        quotation.Status = QuotationStatus.Awarded;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:guid}/award")]
    public async Task<IActionResult> AwardTenderPost(Guid id, [FromBody] AwardTenderDto awardDto)
    {
        var tender = await _context.Tenders.FindAsync(id);
        if (tender == null)
            return NotFound();

        var quotation = await _context.Quotations.FindAsync(awardDto.WinnerQuotationId);
        if (quotation == null || quotation.TenderId != id)
            return BadRequest("Invalid quotation for this tender.");

        // Update tender
        tender.WinnerQuotationId = awardDto.WinnerQuotationId;
        tender.AwardedDate = DateTime.UtcNow;
        tender.Status = TenderStatus.Awarded;
        tender.UpdatedAtUtc = DateTime.UtcNow;

        // Update quotation status
        quotation.Status = QuotationStatus.Awarded;
        quotation.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("test-award")]
    public IActionResult TestAward()
    {
        return Ok("Award endpoint is working!");
    }

    [HttpPost("test-award-post")]
    public IActionResult TestAwardPost([FromBody] AwardTenderDto awardDto)
    {
        return Ok($"Test award POST endpoint is working! Received: {awardDto.WinnerQuotationId}");
    }

    [HttpPost("{id:guid}/test-award")]
    public IActionResult TestAwardWithId(Guid id, [FromBody] AwardTenderDto awardDto)
    {
        return Ok($"Test award POST endpoint with ID is working! Tender ID: {id}, Quotation ID: {awardDto.WinnerQuotationId}");
    }

    [HttpPost("{id:guid}/award-test")]
    public IActionResult AwardTenderTest(Guid id, [FromBody] AwardTenderDto awardDto)
    {
        return Ok($"Award test endpoint is working! Tender ID: {id}, Quotation ID: {awardDto.WinnerQuotationId}");
    }

    [HttpGet("status-summary")]
    public async Task<ActionResult<object>> GetTenderStatusSummary()
    {
        var statusCounts = await _context.Tenders
            .GroupBy(t => t.Status)
            .Select(g => new
            {
                Status = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(statusCounts);
    }
}

// DTOs
public record UpdateTenderStatusDto(TenderStatus Status, Guid? WinnerQuotationId = null);
public record AwardTenderDto(Guid WinnerQuotationId);

public class CreateTenderValidator : AbstractValidator<CreateTenderDto>
{
    public CreateTenderValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.ReferenceNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EstimatedBudget).GreaterThanOrEqualTo(0).When(x => x.EstimatedBudget.HasValue);
        RuleFor(x => x.SubmissionDeadline).NotEmpty().GreaterThan(DateTime.UtcNow);
        RuleFor(x => x.OpeningDate).GreaterThan(x => x.SubmissionDeadline);
    }
}
