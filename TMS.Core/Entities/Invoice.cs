using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Invoice : BaseEntity
{
    [Required]
    public Guid ContractId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime IssueDate { get; set; } = DateTime.UtcNow;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Draft;
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal TaxAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal TaxRate { get; set; } = 0;
    
    [MaxLength(50)]
    public string? TaxType { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal PaidAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal RemainingAmount { get; set; }
    
    public PaymentType PaymentType { get; set; } = PaymentType.Advance;
    
    public int? PaymentPercentage { get; set; } // 25% عند التوقيع
    
    public string? Description { get; set; }
    
    public string? Notes { get; set; }
    
    public DateTime? PaymentDate { get; set; }
    
    public string? PaymentReference { get; set; }
    
    public Guid? PaidBy { get; set; }
    
    // Navigation properties
    public virtual Contract Contract { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual User? PaidByUser { get; set; }
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}

