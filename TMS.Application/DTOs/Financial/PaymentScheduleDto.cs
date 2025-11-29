using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class PaymentScheduleDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string ScheduleNumber { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public PaymentType PaymentType { get; set; }
    public int PaymentPercentage { get; set; }
    public PaymentScheduleStatus Status { get; set; }
    public DateTime? PaymentDate { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string? Notes { get; set; }
    public string? MilestoneDescription { get; set; }
    public bool IsAutomatic { get; set; }
    public string? TriggerCondition { get; set; }
    public Guid? InvoiceId { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Contract Information
    public string? ContractNumber { get; set; }
    public string? EntityName { get; set; }
    public string? SupplierName { get; set; }
}

