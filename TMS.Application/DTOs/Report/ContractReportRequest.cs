using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class ContractReportRequest
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<int>? ContractIds { get; set; }
        
        public List<int>? TenderIds { get; set; }
        
        public List<int>? EntityIds { get; set; }
        
        public List<string>? Statuses { get; set; }
        
        public List<string>? Types { get; set; }
        
        public decimal? MinValue { get; set; }
        
        public decimal? MaxValue { get; set; }
        
        public string? Currency { get; set; }
        
        public bool IncludeTenders { get; set; } = true;
        
        public bool IncludeDeliveries { get; set; } = true;
        
        public bool IncludePayments { get; set; } = true;
        
        public bool IncludeGuarantees { get; set; } = true;
        
        public string? GroupBy { get; set; } // "month", "quarter", "year", "entity", "status", "type"
        
        public string? SortBy { get; set; } // "date", "value", "title", "status", "progress"
        
        public string? SortOrder { get; set; } = "desc";
        
        public bool IncludeProgress { get; set; } = true;
        
        public bool IncludeMilestones { get; set; } = true;
        
        public bool IncludeRiskAssessment { get; set; } = false;
    }
}
