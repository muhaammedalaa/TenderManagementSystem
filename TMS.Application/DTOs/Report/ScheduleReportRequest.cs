using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class ScheduleReportRequest
    {
        [Required]
        public string ReportName { get; set; } = string.Empty;
        
        [Required]
        public string ReportType { get; set; } = string.Empty;
        
        [Required]
        public object ReportData { get; set; } = new();
        
        [Required]
        public string ScheduleType { get; set; } = string.Empty; // "daily", "weekly", "monthly", "quarterly", "yearly", "custom"
        
        public string? CronExpression { get; set; }
        
        public DateTime? StartDate { get; set; }
        
        public DateTime? EndDate { get; set; }
        
        public List<string>? Recipients { get; set; }
        
        public string? EmailSubject { get; set; }
        
        public string? EmailBody { get; set; }
        
        public List<string>? ExportFormats { get; set; } = new() { "PDF", "Excel" };
        
        public bool IsActive { get; set; } = true;
        
        public string? Description { get; set; }
        
        public Dictionary<string, object>? Parameters { get; set; }
        
        public string? TimeZone { get; set; } = "UTC";
        
        public int? MaxRetries { get; set; } = 3;
        
        public int? RetryIntervalMinutes { get; set; } = 30;
    }
}
