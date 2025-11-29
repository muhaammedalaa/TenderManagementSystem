using System.ComponentModel.DataAnnotations;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class Role : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
