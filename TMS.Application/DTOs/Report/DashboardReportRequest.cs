using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class DashboardReportRequest
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<int>? EntityIds { get; set; }
        
        public string? Currency { get; set; }
        
        public bool IncludeTenders { get; set; } = true;
        
        public bool IncludeContracts { get; set; } = true;
        
        public bool IncludeSuppliers { get; set; } = true;
        
        public bool IncludeFinancials { get; set; } = true;
        
        public bool IncludePerformance { get; set; } = true;
        
        public bool IncludeCharts { get; set; } = true;
        
        public bool IncludeKPIs { get; set; } = true;
        
        public bool IncludeTrends { get; set; } = true;
        
        public bool IncludeForecasts { get; set; } = false;
        
        public int? ForecastMonths { get; set; } = 6;
        
        public string? ReportFormat { get; set; } = "comprehensive"; // "summary", "detailed", "comprehensive"
        
        public List<string>? ChartTypes { get; set; } // "pie", "bar", "line", "doughnut", "area"
        
        public string? GroupBy { get; set; } // "month", "quarter", "year", "entity"
        
        public bool IncludeExecutiveSummary { get; set; } = true;
        
        public bool IncludeRecommendations { get; set; } = true;
        
        public bool IncludeRiskAnalysis { get; set; } = false;
    }
}
