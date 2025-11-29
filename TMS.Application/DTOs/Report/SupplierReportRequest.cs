using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class SupplierReportRequest
    {
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public List<int>? SupplierIds { get; set; }
        
        public List<int>? TenderIds { get; set; }
        
        public List<int>? ContractIds { get; set; }
        
        public string? PerformanceMetric { get; set; } // "delivery_time", "quality", "price", "overall"
        
        public bool IncludeQuotations { get; set; } = true;
        
        public bool IncludeContracts { get; set; } = true;
        
        public bool IncludeDeliveries { get; set; } = true;
        
        public bool IncludeRatings { get; set; } = true;
        
        public string? GroupBy { get; set; } // "supplier", "month", "quarter", "year"
        
        public string? SortBy { get; set; } // "performance", "value", "count", "rating"
        
        public string? SortOrder { get; set; } = "desc";
        
        public int? TopSuppliers { get; set; } = 10;
        
        public decimal? MinPerformanceScore { get; set; }
        
        public decimal? MaxPerformanceScore { get; set; }
    }
}
