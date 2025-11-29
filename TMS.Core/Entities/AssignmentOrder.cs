using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class AssignmentOrder : BaseEntity
{
    [Required]
    public Guid QuotationId { get; set; }
    
    [Required]
    public Guid EntityId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string OrderNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? DeliveryDate { get; set; }
    
    public string? PaymentTerms { get; set; }
    
    public AssignmentOrderStatus Status { get; set; } = AssignmentOrderStatus.Issued;
    
    public string? Notes { get; set; }
    
    // Navigation properties
    public virtual Quotation Quotation { get; set; } = null!;
    public virtual Entity Entity { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
