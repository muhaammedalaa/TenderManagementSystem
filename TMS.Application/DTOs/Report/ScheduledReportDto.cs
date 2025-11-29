namespace TMS.Application.DTOs.Report
{
    public class ScheduledReportDto
    {
        public int Id { get; set; }
        public string ReportName { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public string ScheduleType { get; set; } = string.Empty;
        public string? CronExpression { get; set; }
        public DateTime? NextRun { get; set; }
        public DateTime? LastRun { get; set; }
        public bool IsActive { get; set; }
        public List<string> Recipients { get; set; } = new();
        public List<string> ExportFormats { get; set; } = new();
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public string? LastError { get; set; }
    }
}
