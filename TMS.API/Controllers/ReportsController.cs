using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TMS.Application.Interfaces;
using TMS.Application.DTOs.Report;
using System.ComponentModel.DataAnnotations;

namespace TMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Generate Tender Summary Report
        /// </summary>
        [HttpPost("tender-summary")]
        public async Task<IActionResult> GenerateTenderSummaryReport([FromBody] TenderReportRequest request)
        {
            try
            {
                var report = await _reportService.GenerateTenderSummaryReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating tender summary report");
                return BadRequest(new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate Financial Report
        /// </summary>
        [HttpPost("financial")]
        public async Task<IActionResult> GenerateFinancialReport([FromBody] FinancialReportRequest request)
        {
            try
            {
                var report = await _reportService.GenerateFinancialReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating financial report");
                return BadRequest(new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate Supplier Performance Report
        /// </summary>
        [HttpPost("supplier-performance")]
        public async Task<IActionResult> GenerateSupplierPerformanceReport([FromBody] SupplierReportRequest request)
        {
            try
            {
                var report = await _reportService.GenerateSupplierPerformanceReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating supplier performance report");
                return BadRequest(new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate Contract Status Report
        /// </summary>
        [HttpPost("contract-status")]
        public async Task<IActionResult> GenerateContractStatusReport([FromBody] ContractReportRequest request)
        {
            try
            {
                var report = await _reportService.GenerateContractStatusReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating contract status report");
                return BadRequest(new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Generate Comprehensive Dashboard Report
        /// </summary>
        [HttpPost("dashboard")]
        public async Task<IActionResult> GenerateDashboardReport([FromBody] DashboardReportRequest request)
        {
            try
            {
                var report = await _reportService.GenerateDashboardReportAsync(request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating dashboard report");
                return BadRequest(new { message = "Error generating report", error = ex.Message });
            }
        }

        /// <summary>
        /// Export Report as PDF
        /// </summary>
        [HttpPost("export/pdf")]
        public async Task<IActionResult> ExportReportAsPdf([FromBody] ExportReportRequest request)
        {
            try
            {
                var pdfBytes = await _reportService.ExportReportAsPdfAsync(request);
                return File(pdfBytes, "text/plain", $"{request.ReportName}_{DateTime.Now:yyyyMMdd}.txt");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report as PDF");
                return BadRequest(new { message = "Error exporting PDF", error = ex.Message });
            }
        }

        /// <summary>
        /// Export Report as Excel
        /// </summary>
        [HttpPost("export/excel")]
        public async Task<IActionResult> ExportReportAsExcel([FromBody] ExportReportRequest request)
        {
            try
            {
                var excelBytes = await _reportService.ExportReportAsExcelAsync(request);
                return File(excelBytes, "text/csv", $"{request.ReportName}_{DateTime.Now:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report as Excel");
                return BadRequest(new { message = "Error exporting Excel", error = ex.Message });
            }
        }

        /// <summary>
        /// Get Available Report Templates
        /// </summary>
        [HttpGet("templates")]
        public async Task<IActionResult> GetReportTemplates()
        {
            try
            {
                var templates = await _reportService.GetReportTemplatesAsync();
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report templates");
                return BadRequest(new { message = "Error getting templates", error = ex.Message });
            }
        }

        /// <summary>
        /// Get Report History
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetReportHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var history = await _reportService.GetReportHistoryAsync(page, pageSize);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report history");
                return BadRequest(new { message = "Error getting history", error = ex.Message });
            }
        }

        /// <summary>
        /// Schedule Automated Report
        /// </summary>
        [HttpPost("schedule")]
        public async Task<IActionResult> ScheduleReport([FromBody] ScheduleReportRequest request)
        {
            try
            {
                var result = await _reportService.ScheduleReportAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling report");
                return BadRequest(new { message = "Error scheduling report", error = ex.Message });
            }
        }

        /// <summary>
        /// Get Scheduled Reports
        /// </summary>
        [HttpGet("scheduled")]
        public async Task<IActionResult> GetScheduledReports()
        {
            try
            {
                var reports = await _reportService.GetScheduledReportsAsync();
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scheduled reports");
                return BadRequest(new { message = "Error getting scheduled reports", error = ex.Message });
            }
        }

        /// <summary>
        /// Cancel Scheduled Report
        /// </summary>
        [HttpDelete("scheduled/{id}")]
        public async Task<IActionResult> CancelScheduledReport(int id)
        {
            try
            {
                await _reportService.CancelScheduledReportAsync(id);
                return Ok(new { message = "Scheduled report cancelled successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling scheduled report");
                return BadRequest(new { message = "Error cancelling scheduled report", error = ex.Message });
            }
        }
    }
}
