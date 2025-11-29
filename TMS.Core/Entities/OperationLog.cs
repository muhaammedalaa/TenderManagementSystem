using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class OperationLog : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string OperationType { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string Action { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [MaxLength(255)]
    public string? EntityType { get; set; }
    
    public Guid? EntityId { get; set; }
    
    public string? Details { get; set; }
    
    public Guid? UserId { get; set; }
    
    [MaxLength(255)]
    public string? UserName { get; set; }
    
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    [MaxLength(50)]
    public string? Status { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    [MaxLength(45)]
    public string? IpAddress { get; set; }
    
    [MaxLength(500)]
    public string? UserAgent { get; set; }
    
    // Navigation properties
    public virtual User? User { get; set; }
}
