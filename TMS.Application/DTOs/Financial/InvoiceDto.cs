using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime DueDate { get; set; }
    public InvoiceStatus Status { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal TaxRate { get; set; }
    public string? TaxType { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal RemainingAmount { get; set; }
    public PaymentType PaymentType { get; set; }
    public int? PaymentPercentage { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? PaymentReference { get; set; }
    public Guid? PaidBy { get; set; }
    public string? PaidByUserName { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Contract Information
    public string? ContractNumber { get; set; }
    public string? EntityName { get; set; }
    public string? SupplierName { get; set; }
}

