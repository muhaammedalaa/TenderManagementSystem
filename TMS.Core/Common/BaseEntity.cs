using System.ComponentModel.DataAnnotations;

namespace TMS.Core.Common;

public abstract class BaseEntity
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    
    public Guid? CreatedBy { get; set; }
    
    public Guid? UpdatedBy { get; set; }
}
