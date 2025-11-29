using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class FinancialReportRequest
    {
        [Required]
        public string ReportName { get; set; } = string.Empty;
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<int>? TenderIds { get; set; }
        
        public List<int>? ContractIds { get; set; }
        
        public List<int>? EntityIds { get; set; }
        
        public string? Currency { get; set; }
        
        public bool IncludeTenders { get; set; } = true;
        
        public bool IncludeContracts { get; set; } = true;
        
        public bool IncludeGuarantees { get; set; } = true;
        
        public bool IncludeDeliveries { get; set; } = true;
        
        public string? GroupBy { get; set; } // "month", "quarter", "year", "entity", "type"
        
        public string? ReportType { get; set; } // "summary", "detailed", "comparison"
        
        public bool IncludeCharts { get; set; } = true;
        
        public bool IncludeForecasts { get; set; } = false;
        
        public int? ForecastMonths { get; set; } = 12;
    }
}
