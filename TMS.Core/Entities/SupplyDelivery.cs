using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class SupplyDelivery : BaseEntity
{
    [Required]
    public Guid ContractId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string DeliveryNumber { get; set; } = string.Empty;
    
    [Required]
    public DateTime DeliveryDate { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Quantity { get; set; }
    
    [MaxLength(50)]
    public string? Unit { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? UnitPrice { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? TotalAmount { get; set; }
    
    public string? DeliveryLocation { get; set; }
    
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Scheduled;
    
    public DateTime? ActualDeliveryDate { get; set; }
    
    public DateTime? AcceptanceDate { get; set; }
    
    public string? Notes { get; set; }
    
    // Navigation properties
    public virtual Contract Contract { get; set; } = null!;
}
