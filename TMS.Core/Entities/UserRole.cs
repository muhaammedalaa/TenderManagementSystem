using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TMS.Core.Entities;

public class UserRole
{
    [Key]
    [Column(Order = 0)]
    public Guid UserId { get; set; }
    
    [Key]
    [Column(Order = 1)]
    public Guid RoleId { get; set; }
    
    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
    
    public Guid? AssignedBy { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Role Role { get; set; } = null!;
}
