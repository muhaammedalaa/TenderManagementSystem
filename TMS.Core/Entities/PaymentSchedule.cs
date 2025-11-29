using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class PaymentSchedule : BaseEntity
{
    [Required]
    public Guid ContractId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ScheduleNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public PaymentType PaymentType { get; set; } = PaymentType.Advance;
    
    public int PaymentPercentage { get; set; } // 25%, 50%, 100%
    
    public PaymentScheduleStatus Status { get; set; } = PaymentScheduleStatus.Pending;
    
    public DateTime? PaymentDate { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal PaidAmount { get; set; } = 0;
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal RemainingAmount { get; set; }
    
    public string? Notes { get; set; }
    
    public string? MilestoneDescription { get; set; }
    
    public bool IsAutomatic { get; set; } = false; // دفع تلقائي عند استيفاء الشروط
    
    public string? TriggerCondition { get; set; } // شروط تفعيل الدفع التلقائي
    
    public Guid? InvoiceId { get; set; } // الفاتورة المرتبطة
    
    // Navigation properties
    public virtual Contract Contract { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual Invoice? Invoice { get; set; }
}

