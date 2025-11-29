namespace TMS.Application.DTOs.Financial;

public class ContractFinancialSummaryDto
{
    public Guid ContractId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public decimal ContractAmount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    
    // Payment Summary
    public decimal TotalInvoiced { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal TotalRemaining { get; set; }
    public decimal AdvancePaymentAmount { get; set; }
    public decimal AdvancePaymentPercentage { get; set; }
    
    // Payment Schedules
    public int TotalSchedules { get; set; }
    public int CompletedSchedules { get; set; }
    public int PendingSchedules { get; set; }
    public int OverdueSchedules { get; set; }
    
    // Invoices
    public int TotalInvoices { get; set; }
    public int PaidInvoices { get; set; }
    public int PendingInvoices { get; set; }
    public int OverdueInvoices { get; set; }
    
    // Next Payment
    public DateTime? NextPaymentDueDate { get; set; }
    public decimal? NextPaymentAmount { get; set; }
    public string? NextPaymentDescription { get; set; }
    
    // Progress
    public decimal PaymentProgressPercentage { get; set; }
    public string PaymentStatus { get; set; } = string.Empty; // "On Track", "Behind", "Overdue"
}

