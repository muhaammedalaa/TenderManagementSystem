using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Supplier;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public SuppliersController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers(
        string? search, 
        string? category, 
        Guid? entityId, 
        bool? active,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Suppliers
            .Include(s => s.Entity)
            .Include(s => s.PrimaryAddress)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(s => 
                s.Name.Contains(search) || 
                (s.Email != null && s.Email.Contains(search)) ||
                (s.ContactPerson != null && s.ContactPerson.Contains(search)) ||
                (s.TaxNumber != null && s.TaxNumber.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(s => s.Category == category);
        }

        if (entityId.HasValue)
        {
            query = query.Where(s => s.EntityId == entityId.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(s => s.IsActive == active.Value);
        }

        var totalCount = await query.CountAsync();
        var suppliers = await query
            .OrderByDescending(s => s.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var supplierDtos = _mapper.Map<IEnumerable<SupplierDto>>(suppliers);

        return Ok(new
        {
            data = supplierDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(Guid id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Entity)
            .Include(s => s.PrimaryAddress)
            .Include(s => s.Addresses)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id);

        if (supplier == null)
            return NotFound();

        var supplierDto = _mapper.Map<SupplierDto>(supplier);
        return Ok(supplierDto);
    }

    [HttpGet("{id:guid}/quotations")]
    public async Task<ActionResult<IEnumerable<object>>> GetSupplierQuotations(Guid id)
    {
        var quotations = await _context.Quotations
            .Include(q => q.Tender)
            .Include(q => q.Currency)
            .Where(q => q.SupplierId == id)
            .OrderByDescending(q => q.CreatedAtUtc)
            .Select(q => new
            {
                id = q.Id,
                tenderId = q.TenderId,
                tenderTitle = q.Tender.Title,
                tenderReferenceNumber = q.Tender.ReferenceNumber,
                referenceNumber = q.ReferenceNumber,
                amount = q.Amount,
                currency = q.CurrencyCode,
                status = q.Status,
                submissionDate = q.SubmissionDate,
                technicalScore = q.TechnicalScore,
                financialScore = q.FinancialScore,
                totalScore = q.TotalScore
            })
            .ToListAsync();

        return Ok(quotations);
    }

    [HttpGet("{id:guid}/performance")]
    public async Task<ActionResult<object>> GetSupplierPerformance(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound();

        var totalQuotations = await _context.Quotations.CountAsync(q => q.SupplierId == id);
        var wonQuotations = await _context.Quotations
            .CountAsync(q => q.SupplierId == id && q.Status == QuotationStatus.Awarded);
        var totalTenders = await _context.Quotations
            .Where(q => q.SupplierId == id)
            .Select(q => q.TenderId)
            .Distinct()
            .CountAsync();

        var averageScore = await _context.Quotations
            .Where(q => q.SupplierId == id && q.TotalScore.HasValue)
            .AverageAsync(q => q.TotalScore);

        var totalContractValue = await _context.Contracts
            .Include(c => c.AssignmentOrder)
                .ThenInclude(ao => ao.Quotation)
            .Where(c => c.AssignmentOrder != null && c.AssignmentOrder.Quotation != null && c.AssignmentOrder.Quotation.SupplierId == id)
            .SumAsync(c => c.Amount);

        var performance = new
        {
            totalQuotations,
            wonQuotations,
            winRate = totalQuotations > 0 ? (double)wonQuotations / totalQuotations * 100 : 0,
            totalTenders,
            averageScore,
            totalContractValue,
            lastQuotationDate = await _context.Quotations
                .Where(q => q.SupplierId == id)
                .MaxAsync(q => (DateTime?)q.CreatedAtUtc)
        };

        return Ok(performance);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] CreateSupplierDto createSupplierDto)
    {
        var validator = new CreateSupplierValidator();
        var validationResult = await validator.ValidateAsync(createSupplierDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if email already exists
        if (await _context.Suppliers.AnyAsync(s => s.Email == createSupplierDto.Email))
        {
            return BadRequest("Supplier with this email already exists.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == createSupplierDto.EntityId))
        {
            return BadRequest($"Entity with ID {createSupplierDto.EntityId} does not exist.");
        }

        var supplier = _mapper.Map<Supplier>(createSupplierDto);
        supplier.CreatedAtUtc = DateTime.UtcNow;
        supplier.UpdatedAtUtc = DateTime.UtcNow;
        supplier.IsActive = createSupplierDto.Active; // Map Active from DTO to IsActive in entity

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        var supplierDto = _mapper.Map<SupplierDto>(supplier);
        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplierDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateSupplier(Guid id, [FromBody] CreateSupplierDto updateSupplierDto)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound();

        var validator = new CreateSupplierValidator();
        var validationResult = await validator.ValidateAsync(updateSupplierDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if email already exists (excluding current supplier)
        if (await _context.Suppliers.AnyAsync(s => s.Email == updateSupplierDto.Email && s.Id != id))
        {
            return BadRequest("Supplier with this email already exists.");
        }

        // Validate entity exists
        if (!await _context.Entities.AnyAsync(e => e.Id == updateSupplierDto.EntityId))
        {
            return BadRequest($"Entity with ID {updateSupplierDto.EntityId} does not exist.");
        }

        _mapper.Map(updateSupplierDto, supplier);
        supplier.UpdatedAtUtc = DateTime.UtcNow;
        supplier.IsActive = updateSupplierDto.Active; // Map Active from DTO to IsActive in entity

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteSupplier(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound();

        // Check if supplier has quotations
        if (await _context.Quotations.AnyAsync(q => q.SupplierId == id))
        {
            return BadRequest("Cannot delete supplier that has quotations.");
        }

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateSupplier(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound();

        supplier.IsActive = true;
        supplier.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{id:guid}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateSupplier(Guid id)
    {
        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound();

        supplier.IsActive = false;
        supplier.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetSupplierCategories()
    {
        var categories = await _context.Suppliers
            .Where(s => !string.IsNullOrWhiteSpace(s.Category))
            .Select(s => s.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}

public class CreateSupplierValidator : AbstractValidator<CreateSupplierDto>
{
    public CreateSupplierValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TaxNumber).MaximumLength(50);
        RuleFor(x => x.RegistrationNumber).MaximumLength(50);
        RuleFor(x => x.ContactPerson).MaximumLength(200);
        RuleFor(x => x.ContactPhone).MaximumLength(20);
        RuleFor(x => x.ContactEmail).EmailAddress().MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.ContactEmail));
        RuleFor(x => x.FinancialCapacity).GreaterThanOrEqualTo(0).When(x => x.FinancialCapacity.HasValue);
        RuleFor(x => x.ExperienceYears).GreaterThanOrEqualTo(0).When(x => x.ExperienceYears.HasValue);
        RuleFor(x => x.Active).NotNull();
    }
}
