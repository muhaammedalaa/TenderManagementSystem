using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class CreatePaymentDto
{
    [Required]
    public Guid InvoiceId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string PaymentNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;
    
    [StringLength(255)]
    public string? BankName { get; set; }
    
    [StringLength(100)]
    public string? BankAccount { get; set; }
    
    [StringLength(100)]
    public string? TransactionReference { get; set; }
    
    [StringLength(100)]
    public string? CheckNumber { get; set; }
    
    public DateTime? CheckDate { get; set; }
    
    public DateTime? CheckDueDate { get; set; }
    
    [StringLength(255)]
    public string? BankSwiftCode { get; set; }
    
    [StringLength(255)]
    public string? BankIban { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [StringLength(100)]
    public string? ReceiptNumber { get; set; }
}
