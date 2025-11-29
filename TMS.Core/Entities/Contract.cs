using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Contract : BaseEntity
{
    public Guid? AssignmentOrderId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ContractNumber { get; set; } = string.Empty;
    
    [Required]
    public ContractType ContractType { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public string? PaymentTerms { get; set; }
    
    public string? DeliveryTerms { get; set; }
    
    public int? WarrantyPeriod { get; set; }
    
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    
    public DateTime? TerminationDate { get; set; }
    
    public string? TerminationReason { get; set; }
    
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public DateTime? CompletionDate { get; set; }
    
    // Navigation properties
    public virtual AssignmentOrder? AssignmentOrder { get; set; }
    public virtual Currency Currency { get; set; } = null!;
    public virtual ICollection<SupplyDelivery> SupplyDeliveries { get; set; } = new List<SupplyDelivery>();
    public virtual ICollection<GuaranteeLetter> GuaranteeLetters { get; set; } = new List<GuaranteeLetter>();
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public virtual ICollection<PaymentSchedule> PaymentSchedules { get; set; } = new List<PaymentSchedule>();
}
