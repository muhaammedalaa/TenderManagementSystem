using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Financial;
using TMS.Application.DTOs.Report;
using TMS.Application.DTOs.Common;
using TMS.Application.Interfaces;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FinancialController : BaseSearchController
{
    private readonly IFinancialService _financialService;

    public FinancialController(IFinancialService financialService)
    {
        _financialService = financialService;
    }

    #region Invoice Management

    [HttpPost("invoices")]
    public async Task<ActionResult<InvoiceDto>> CreateInvoice([FromBody] CreateInvoiceDto dto)
    {
        try
        {
            var invoice = await _financialService.CreateInvoiceAsync(dto);
            return CreatedAtAction(nameof(GetInvoice), new { id = invoice.Id }, invoice);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("invoices/{id}")]
    public async Task<ActionResult<InvoiceDto>> GetInvoice(Guid id)
    {
        try
        {
            var invoice = await _financialService.GetInvoiceAsync(id);
            return Ok(invoice);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("invoices")]
    public async Task<IActionResult> GetInvoices([FromQuery] Guid? contractId = null)
    {
        if (contractId.HasValue)
        {
            var invoices = await _financialService.GetInvoicesByContractAsync(contractId.Value);
            return Ok(invoices);
        }
        else
        {
            // Return all invoices with search and filter support
            var filter = GetSearchFilter();
            var result = await _financialService.GetInvoicesWithPaginationAsync(filter);
            return HandleSearchResult(result);
        }
    }

    [HttpGet("contracts/{contractId}/invoices")]
    public async Task<ActionResult<IEnumerable<InvoiceDto>>> GetInvoicesByContract(Guid contractId)
    {
        var invoices = await _financialService.GetInvoicesByContractAsync(contractId);
        return Ok(invoices);
    }

    #endregion

    #region Contract Financial Operations

    [HttpPost("contracts/{contractId}/advance-payment")]
    public async Task<ActionResult> CreateAdvancePayment(Guid contractId, [FromQuery] decimal percentage = 25)
    {
        try
        {
            var result = await _financialService.CreateAdvancePaymentAsync(contractId, percentage);
            if (result)
            {
                return Ok(new { message = $"Advance payment of {percentage}% created successfully" });
            }
            return BadRequest("Failed to create advance payment");
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("contracts/{contractId}/summary")]
    public async Task<ActionResult<ContractFinancialSummaryDto>> GetContractFinancialSummary(Guid contractId)
    {
        try
        {
            var summary = await _financialService.GetContractFinancialSummaryAsync(contractId);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("contracts/{contractId}/financial-summary")]
    public async Task<ActionResult<ContractFinancialSummaryDto>> GetContractFinancialSummaryLegacy(Guid contractId)
    {
        try
        {
            var summary = await _financialService.GetContractFinancialSummaryAsync(contractId);
            return Ok(summary);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    #endregion

    #region Payment Management

    [HttpPost("payments")]
    public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        try
        {
            var payment = await _financialService.CreatePaymentAsync(dto);
            return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("payments/{id}")]
    public async Task<ActionResult<PaymentDto>> GetPayment(Guid id)
    {
        try
        {
            var payment = await _financialService.GetPaymentAsync(id);
            return Ok(payment);
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("payments")]
    public async Task<IActionResult> GetPayments([FromQuery] Guid? invoiceId = null)
    {
        if (invoiceId.HasValue)
        {
            var payments = await _financialService.GetPaymentsByInvoiceAsync(invoiceId.Value);
            return Ok(payments);
        }
        else
        {
            // Return all payments with search and filter support
            var filter = GetSearchFilter();
            var result = await _financialService.GetPaymentsWithPaginationAsync(filter);
            return HandleSearchResult(result);
        }
    }

    [HttpPost("payments/{id}/confirm")]
    public async Task<ActionResult<PaymentDto>> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentDto dto)
    {
        try
        {
            var payment = await _financialService.ConfirmPaymentAsync(id, dto);
            return Ok(payment);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion

    #region Payment Schedules

    [HttpGet("contracts/{contractId}/payment-schedules")]
    public async Task<ActionResult<IEnumerable<PaymentScheduleDto>>> GetPaymentSchedulesByContract(Guid contractId)
    {
        var schedules = await _financialService.GetPaymentSchedulesByContractAsync(contractId);
        return Ok(schedules);
    }

    #endregion

    #region Financial Reports

    [HttpPost("reports")]
    public async Task<ActionResult<FinancialReportDto>> GenerateFinancialReport([FromBody] FinancialReportRequest request)
    {
        try
        {
            var report = await _financialService.GetFinancialReportAsync(request);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("reports/financial")]
    public async Task<ActionResult<FinancialReportDto>> GetFinancialReport([FromQuery] FinancialReportRequest request)
    {
        try
        {
            var report = await _financialService.GetFinancialReportAsync(request);
            return Ok(report);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("overdue-payments")]
    public async Task<ActionResult<IEnumerable<OverduePaymentDto>>> GetOverduePayments()
    {
        var overduePayments = await _financialService.GetOverduePaymentsAsync();
        return Ok(overduePayments);
    }

    [HttpGet("reports/overdue-payments")]
    public async Task<ActionResult<IEnumerable<OverduePaymentDto>>> GetOverduePaymentsReport()
    {
        var overduePayments = await _financialService.GetOverduePaymentsAsync();
        return Ok(overduePayments);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<PaymentAnalyticsDto>> GetPaymentAnalytics()
    {
        try
        {
            var startDate = DateTime.Now.AddMonths(-12); // Last 12 months
            var endDate = DateTime.Now;
            var analytics = await _financialService.GetPaymentAnalyticsAsync(startDate, endDate);
            return Ok(analytics);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("reports/payment-analytics")]
    public async Task<ActionResult<PaymentAnalyticsDto>> GetPaymentAnalytics(
        [FromQuery] DateTime startDate, 
        [FromQuery] DateTime endDate)
    {
        try
        {
            var analytics = await _financialService.GetPaymentAnalyticsAsync(startDate, endDate);
            return Ok(analytics);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion
}
