using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Enums;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly TmsDbContext _context;

    public DashboardController(TmsDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var openTenders = await _context.Tenders.CountAsync(t => t.Status == TenderStatus.Open);
        var pendingQuotations = await _context.Quotations.CountAsync(q => q.Status == QuotationStatus.Submitted);
        var activeSuppliers = await _context.Suppliers.CountAsync(s => s.IsActive);
        var totalEntities = await _context.Entities.CountAsync();
        var activeContracts = await _context.Contracts.CountAsync(c => c.Status == ContractStatus.Active);
        var expiringGuarantees = await _context.BankGuarantees
            .CountAsync(bg => bg.ExpiryDate <= DateTime.UtcNow.AddDays(30) && bg.Status == GuaranteeStatus.Active) +
            await _context.GovernmentGuarantees
            .CountAsync(gg => gg.ExpiryDate <= DateTime.UtcNow.AddDays(30) && gg.Status == GuaranteeStatus.Active);

        var stats = new List<object>
        {
            new { title = "Open Tenders", value = openTenders, variant = "primary", icon = "tender" },
            new { title = "Pending Quotations", value = pendingQuotations, variant = "warning", icon = "quotation" },
            new { title = "Active Suppliers", value = activeSuppliers, variant = "success", icon = "supplier" },
            new { title = "Total Entities", value = totalEntities, variant = "info", icon = "entity" },
            new { title = "Active Contracts", value = activeContracts, variant = "success", icon = "contract" },
            new { title = "Expiring Guarantees", value = expiringGuarantees, variant = "danger", icon = "guarantee" }
        };

        return Ok(new { stats });
    }

    [HttpGet("recent-tenders")]
    public async Task<IActionResult> GetRecentTenders()
    {
        var recentTenders = await _context.Tenders
            .Include(t => t.Entity)
            .OrderByDescending(t => t.CreatedAtUtc)
            .Take(5)
            .Select(t => new
            {
                id = t.Id,
                referenceNumber = t.ReferenceNumber,
                title = t.Title,
                status = t.Status.ToString(),
                entityName = t.Entity.Name,
                submissionDeadline = t.SubmissionDeadline,
                estimatedBudget = t.EstimatedBudget
            })
            .ToListAsync();

        return Ok(new { recentTenders });
    }

    [HttpGet("tender-status")]
    public async Task<IActionResult> GetTenderStatus()
    {
        var tenderStatusCounts = await _context.Tenders
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
            .ToListAsync();

        var labels = tenderStatusCounts.Select(ts => ts.Status).ToArray();
        var data = tenderStatusCounts.Select(ts => ts.Count).ToArray();
        var backgroundColor = new[] { "#198754", "#6c757d", "#ffc107", "#dc3545", "#0d6efd", "#fd7e14" };

        var tenderStatusData = new
        {
            labels = labels,
            datasets = new[]
            {
                new
                {
                    label = "Tenders by Status",
                    data = data,
                    backgroundColor = backgroundColor.Take(labels.Length).ToArray(),
                    borderWidth = 1
                }
            }
        };

        return Ok(new { tenderStatusData });
    }

    [HttpGet("quotations-by-month")]
    public async Task<IActionResult> GetQuotationsByMonth()
    {
        var currentYear = DateTime.UtcNow.Year;
        var quotationsByMonth = await _context.Quotations
            .Where(q => q.CreatedAtUtc.Year == currentYear)
            .GroupBy(q => q.CreatedAtUtc.Month)
            .Select(g => new { Month = g.Key, Count = g.Count() })
            .OrderBy(x => x.Month)
            .ToListAsync();

        var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var labels = quotationsByMonth.Select(qbm => monthNames[qbm.Month - 1]).ToArray();
        var data = quotationsByMonth.Select(qbm => qbm.Count).ToArray();

        var quotationsByMonthData = new
        {
            labels = labels,
            datasets = new[]
            {
                new
                {
                    label = "Quotations",
                    data = data,
                    backgroundColor = "#0d6efd",
                    borderColor = "#0d6efd",
                    borderWidth = 2
                }
            }
        };

        return Ok(new { quotationsByMonthData });
    }

    [HttpGet("guarantee-stats")]
    public async Task<IActionResult> GetGuaranteeStats()
    {
        var totalBankGuarantees = await _context.BankGuarantees.CountAsync();
        var activeBankGuarantees = await _context.BankGuarantees.CountAsync(bg => bg.Status == GuaranteeStatus.Active);
        var expiredBankGuarantees = await _context.BankGuarantees.CountAsync(bg => bg.Status == GuaranteeStatus.Expired);

        var totalGovernmentGuarantees = await _context.GovernmentGuarantees.CountAsync();
        var activeGovernmentGuarantees = await _context.GovernmentGuarantees.CountAsync(gg => gg.Status == GuaranteeStatus.Active);
        var expiredGovernmentGuarantees = await _context.GovernmentGuarantees.CountAsync(gg => gg.Status == GuaranteeStatus.Expired);

        var guaranteeStats = new List<object>
        {
            new { title = "Total Bank Guarantees", value = totalBankGuarantees, variant = "primary", type = "bank" },
            new { title = "Active Bank Guarantees", value = activeBankGuarantees, variant = "success", type = "bank" },
            new { title = "Expired Bank Guarantees", value = expiredBankGuarantees, variant = "danger", type = "bank" },
            new { title = "Total Government Guarantees", value = totalGovernmentGuarantees, variant = "info", type = "government" },
            new { title = "Active Government Guarantees", value = activeGovernmentGuarantees, variant = "success", type = "government" },
            new { title = "Expired Government Guarantees", value = expiredGovernmentGuarantees, variant = "danger", type = "government" }
        };

        return Ok(new { guaranteeStats });
    }

    [HttpGet("profit-stats")]
    public async Task<IActionResult> GetProfitStats()
    {
        var bankGuaranteeProfit = await _context.BankGuarantees
            .Where(bg => bg.CalculatedProfit.HasValue)
            .SumAsync(bg => bg.CalculatedProfit ?? 0);

        var governmentGuaranteeProfit = await _context.GovernmentGuarantees
            .Where(gg => gg.CalculatedProfit.HasValue)
            .SumAsync(gg => gg.CalculatedProfit ?? 0);

        var totalProfit = bankGuaranteeProfit + governmentGuaranteeProfit;

        var averageBankProfitMargin = await _context.BankGuarantees
            .Where(bg => bg.ProfitPercentage.HasValue)
            .AverageAsync(bg => bg.ProfitPercentage ?? 0);

        var averageGovernmentProfitMargin = await _context.GovernmentGuarantees
            .Where(gg => gg.ProfitPercentage.HasValue)
            .AverageAsync(gg => gg.ProfitPercentage ?? 0);

        var profitStats = new List<object>
        {
            new { title = "Total Profit", value = totalProfit.ToString("N2"), variant = "success", currency = "USD" },
            new { title = "Bank Guarantee Profit", value = bankGuaranteeProfit.ToString("N2"), variant = "primary", currency = "USD" },
            new { title = "Government Guarantee Profit", value = governmentGuaranteeProfit.ToString("N2"), variant = "info", currency = "USD" },
            new { title = "Average Bank Profit Margin", value = averageBankProfitMargin.ToString("N2") + "%", variant = "primary" },
            new { title = "Average Government Profit Margin", value = averageGovernmentProfitMargin.ToString("N2") + "%", variant = "info" }
        };

        return Ok(new { profitStats });
    }

    [HttpGet("expiring-guarantees")]
    public async Task<IActionResult> GetExpiringGuarantees(int days = 30)
    {
        var expiryDate = DateTime.UtcNow.AddDays(days);

        var expiringBankGuarantees = await _context.BankGuarantees
            .Include(bg => bg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Where(bg => bg.ExpiryDate <= expiryDate && bg.Status == GuaranteeStatus.Active)
            .Select(bg => new
            {
                id = bg.Id,
                type = "Bank",
                guaranteeNumber = bg.GuaranteeNumber,
                supplierName = bg.Quotation != null && bg.Quotation.Supplier != null ? bg.Quotation.Supplier.Name : "Unknown",
                amount = bg.Amount,
                currency = bg.CurrencyCode,
                expiryDate = bg.ExpiryDate,
                daysUntilExpiry = (bg.ExpiryDate - DateTime.UtcNow).Days
            })
            .ToListAsync();

        var expiringGovernmentGuarantees = await _context.GovernmentGuarantees
            .Include(gg => gg.Quotation)
                .ThenInclude(q => q.Supplier)
            .Where(gg => gg.ExpiryDate <= expiryDate && gg.Status == GuaranteeStatus.Active)
            .Select(gg => new
            {
                id = gg.Id,
                type = "Government",
                guaranteeNumber = gg.GuaranteeNumber,
                supplierName = gg.Quotation != null && gg.Quotation.Supplier != null ? gg.Quotation.Supplier.Name : "Unknown",
                amount = gg.Amount,
                currency = gg.CurrencyCode,
                expiryDate = gg.ExpiryDate,
                daysUntilExpiry = (gg.ExpiryDate - DateTime.UtcNow).Days
            })
            .ToListAsync();

        var allExpiring = expiringBankGuarantees.Concat(expiringGovernmentGuarantees)
            .OrderBy(g => g.expiryDate)
            .ToList();

        return Ok(new { expiringGuarantees = allExpiring });
    }

    [HttpGet("recent-activities")]
    public async Task<IActionResult> GetRecentActivities(int count = 10)
    {
        var recentActivities = await _context.OperationLogs
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .Take(count)
            .Select(ol => new
            {
                id = ol.Id,
                action = ol.Action,
                entityType = ol.EntityType,
                entityId = ol.EntityId,
                details = ol.Details,
                userId = ol.UserId,
                createdAt = ol.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new { recentActivities });
    }
}
