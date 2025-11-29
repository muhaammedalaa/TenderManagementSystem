using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class ExportReportRequest
    {
        [Required]
        public string ReportName { get; set; } = string.Empty;
        
        [Required]
        public string ReportType { get; set; } = string.Empty; // "tender", "financial", "supplier", "contract", "dashboard"
        
        [Required]
        public object ReportData { get; set; } = new();
        
        public string? TemplateName { get; set; }
        
        public string? CompanyName { get; set; }
        
        public string? CompanyLogo { get; set; }
        
        public string? ReportTitle { get; set; }
        
        public string? ReportSubtitle { get; set; }
        
        public string? GeneratedBy { get; set; }
        
        public DateTime? GeneratedAt { get; set; } = DateTime.UtcNow;
        
        public string? FooterText { get; set; }
        
        public bool IncludeCharts { get; set; } = true;
        
        public bool IncludeChartsAsImages { get; set; } = true;
        
        public string? ChartFormat { get; set; } = "png"; // "png", "jpeg", "svg"
        
        public int? ChartWidth { get; set; } = 800;
        
        public int? ChartHeight { get; set; } = 600;
        
        public bool IncludePageNumbers { get; set; } = true;
        
        public bool IncludeTableOfContents { get; set; } = true;
        
        public string? PageOrientation { get; set; } = "portrait"; // "portrait", "landscape"
        
        public string? PageSize { get; set; } = "A4"; // "A4", "A3", "Letter", "Legal"
        
        public Dictionary<string, object>? CustomSettings { get; set; }
    }
}
