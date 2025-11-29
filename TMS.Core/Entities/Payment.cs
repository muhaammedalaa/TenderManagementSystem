using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Payment : BaseEntity
{
    [Required]
    public Guid InvoiceId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string PaymentNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
    
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.BankTransfer;
    
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    
    [MaxLength(255)]
    public string? BankName { get; set; }
    
    [MaxLength(100)]
    public string? BankAccount { get; set; }
    
    [MaxLength(100)]
    public string? TransactionReference { get; set; }
    
    [MaxLength(100)]
    public string? CheckNumber { get; set; }
    
    public DateTime? CheckDate { get; set; }
    
    public DateTime? CheckDueDate { get; set; }
    
    [MaxLength(255)]
    public string? BankSwiftCode { get; set; }
    
    [MaxLength(255)]
    public string? BankIban { get; set; }
    
    public string? Notes { get; set; }
    
    public string? ReceiptNumber { get; set; }
    
    public DateTime? ConfirmationDate { get; set; }
    
    public Guid? ConfirmedBy { get; set; }
    
    [MaxLength(500)]
    public string? ConfirmationNotes { get; set; }
    
    // Navigation properties
    public virtual Invoice Invoice { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual User? ConfirmedByUser { get; set; }
}

