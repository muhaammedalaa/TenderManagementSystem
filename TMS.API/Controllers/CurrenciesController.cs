using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.Currency;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class CurrenciesController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public CurrenciesController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CurrencyDto>>> GetCurrencies()
    {
        var currencies = await _context.Currencies
            .AsNoTracking()
            .OrderBy(c => c.Code)
            .ToListAsync();

        var currencyDtos = _mapper.Map<IEnumerable<CurrencyDto>>(currencies);
        return Ok(currencyDtos);
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<CurrencyDto>> GetCurrency(string code)
    {
        var currency = await _context.Currencies
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Code == code);

        if (currency == null)
            return NotFound();

        var currencyDto = _mapper.Map<CurrencyDto>(currency);
        return Ok(currencyDto);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CurrencyDto>> CreateCurrency([FromBody] CreateCurrencyDto createCurrencyDto)
    {
        var validator = new CreateCurrencyValidator();
        var validationResult = await validator.ValidateAsync(createCurrencyDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if currency code already exists
        if (await _context.Currencies.AnyAsync(c => c.Code == createCurrencyDto.Code))
        {
            return BadRequest($"Currency with code '{createCurrencyDto.Code}' already exists.");
        }

        var currency = _mapper.Map<Currency>(createCurrencyDto);
        currency.CreatedAtUtc = DateTime.UtcNow;
        currency.UpdatedAtUtc = DateTime.UtcNow;

        _context.Currencies.Add(currency);
        await _context.SaveChangesAsync();

        var currencyDto = _mapper.Map<CurrencyDto>(currency);
        return CreatedAtAction(nameof(GetCurrency), new { code = currency.Code }, currencyDto);
    }

    [HttpPut("{code}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateCurrency(string code, [FromBody] CreateCurrencyDto updateCurrencyDto)
    {
        var currency = await _context.Currencies.FindAsync(code);
        if (currency == null)
            return NotFound();

        var validator = new CreateCurrencyValidator();
        var validationResult = await validator.ValidateAsync(updateCurrencyDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Check if currency code already exists (excluding current currency)
        if (await _context.Currencies.AnyAsync(c => c.Code == updateCurrencyDto.Code && c.Code != code))
        {
            return BadRequest($"Currency with code '{updateCurrencyDto.Code}' already exists.");
        }

        _mapper.Map(updateCurrencyDto, currency);
        currency.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{code}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteCurrency(string code)
    {
        var currency = await _context.Currencies.FindAsync(code);
        if (currency == null)
            return NotFound();

        // Check if currency is used in quotations
        if (await _context.Quotations.AnyAsync(q => q.CurrencyCode == code))
        {
            return BadRequest("Cannot delete currency that is used in quotations.");
        }

        // Check if currency is used in contracts
        if (await _context.Contracts.AnyAsync(c => c.CurrencyCode == code))
        {
            return BadRequest("Cannot delete currency that is used in contracts.");
        }

        // Check if currency is used in bank guarantees
        if (await _context.BankGuarantees.AnyAsync(bg => bg.CurrencyCode == code))
        {
            return BadRequest("Cannot delete currency that is used in bank guarantees.");
        }

        // Check if currency is used in government guarantees
        if (await _context.GovernmentGuarantees.AnyAsync(gg => gg.CurrencyCode == code))
        {
            return BadRequest("Cannot delete currency that is used in government guarantees.");
        }

        _context.Currencies.Remove(currency);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<CurrencyDto>>> GetActiveCurrencies()
    {
        var currencies = await _context.Currencies
            .Where(c => c.IsActive)
            .AsNoTracking()
            .OrderBy(c => c.Code)
            .ToListAsync();

        var currencyDtos = _mapper.Map<IEnumerable<CurrencyDto>>(currencies);
        return Ok(currencyDtos);
    }

    [HttpPatch("{code}/activate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ActivateCurrency(string code)
    {
        var currency = await _context.Currencies.FindAsync(code);
        if (currency == null)
            return NotFound();

        currency.IsActive = true;
        currency.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPatch("{code}/deactivate")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeactivateCurrency(string code)
    {
        var currency = await _context.Currencies.FindAsync(code);
        if (currency == null)
            return NotFound();

        currency.IsActive = false;
        currency.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

public class CreateCurrencyValidator : AbstractValidator<CreateCurrencyDto>
{
    public CreateCurrencyValidator()
    {
        RuleFor(x => x.Code).NotEmpty().Length(3).WithMessage("Currency code must be exactly 3 characters.");
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Symbol).NotEmpty().MaximumLength(10);
        RuleFor(x => x.DecimalPlaces).InclusiveBetween(0, 4);
    }
}
