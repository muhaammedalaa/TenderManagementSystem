using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Report
{
    public class FinancialReportDto
    {
        public Guid ReportId { get; set; }
        
        [Required]
        public string ReportName { get; set; } = string.Empty;
        
        public DateTime GeneratedAt { get; set; }
        
        public DateTime StartDate { get; set; }
        
        public DateTime EndDate { get; set; }
        
        public decimal TotalRevenue { get; set; }
        
        public int TotalInvoices { get; set; }
        
        public int TotalPayments { get; set; }
        
        public int OverduePayments { get; set; }
        
        public List<FinancialReportItemDto> Items { get; set; } = new List<FinancialReportItemDto>();
        
        public List<FinancialReportChartDto> Charts { get; set; } = new List<FinancialReportChartDto>();
    }
    
    public class FinancialReportItemDto
    {
        public string Name { get; set; } = string.Empty;
        
        public decimal Amount { get; set; }
        
        public string Currency { get; set; } = string.Empty;
        
        public DateTime Date { get; set; }
        
        public string Type { get; set; } = string.Empty;
    }
    
    public class FinancialReportChartDto
    {
        public string Title { get; set; } = string.Empty;
        
        public string Type { get; set; } = string.Empty; // "line", "bar", "pie"
        
        public List<FinancialReportChartDataDto> Data { get; set; } = new List<FinancialReportChartDataDto>();
    }
    
    public class FinancialReportChartDataDto
    {
        public string Label { get; set; } = string.Empty;
        
        public decimal Value { get; set; }
        
        public string Color { get; set; } = string.Empty;
    }
}

