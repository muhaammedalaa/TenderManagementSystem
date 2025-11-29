using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class TenderReportRequest
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<int>? TenderIds { get; set; }
        
        public List<string>? Statuses { get; set; }
        
        public List<int>? EntityIds { get; set; }
        
        public decimal? MinValue { get; set; }
        
        public decimal? MaxValue { get; set; }
        
        public string? Currency { get; set; }
        
        public bool IncludeQuotations { get; set; } = true;
        
        public bool IncludeWinners { get; set; } = true;
        
        public bool IncludeFinancials { get; set; } = true;
        
        public string? GroupBy { get; set; } // "month", "quarter", "year", "entity", "status"
        
        public string? SortBy { get; set; } // "date", "value", "title", "status"
        
        public string? SortOrder { get; set; } = "desc"; // "asc", "desc"
        
        public int? PageSize { get; set; } = 100;
        
        public int? PageNumber { get; set; } = 1;
    }
}
