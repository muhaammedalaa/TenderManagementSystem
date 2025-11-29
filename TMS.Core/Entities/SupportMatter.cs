using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class SupportMatter : BaseEntity
{
    [Required]
    public Guid EntityId { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public SupportPriority Priority { get; set; } = SupportPriority.Normal;
    
    public SupportStatus Status { get; set; } = SupportStatus.Open;
    
    public string? Description { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? TotalAmount { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitPercentage { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? CalculatedProfit { get; set; }
    
    public DateTime OpenedAtUtc { get; set; } = DateTime.UtcNow;
    
    public DateTime? ClosedAtUtc { get; set; }
    
    public Guid? OpenedBy { get; set; }
    
    public Guid? ClosedBy { get; set; }
    
    // Navigation properties
    public virtual Entity Entity { get; set; } = null!;
    public virtual User? OpenedByUser { get; set; }
    public virtual User? ClosedByUser { get; set; }
}
