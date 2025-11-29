using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public string PaymentNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus Status { get; set; }
    public string? BankName { get; set; }
    public string? BankAccount { get; set; }
    public string? TransactionReference { get; set; }
    public string? CheckNumber { get; set; }
    public DateTime? CheckDate { get; set; }
    public DateTime? CheckDueDate { get; set; }
    public string? BankSwiftCode { get; set; }
    public string? BankIban { get; set; }
    public string? Notes { get; set; }
    public string? ReceiptNumber { get; set; }
    public DateTime? ConfirmationDate { get; set; }
    public Guid? ConfirmedBy { get; set; }
    public string? ConfirmedByUserName { get; set; }
    public string? ConfirmationNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Invoice Information
    public string? InvoiceNumber { get; set; }
    public string? ContractNumber { get; set; }
    public string? EntityName { get; set; }
    public string? SupplierName { get; set; }
}

