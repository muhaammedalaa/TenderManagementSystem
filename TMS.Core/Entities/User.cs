using System.ComponentModel.DataAnnotations;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class User : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? FirstName { get; set; }
    
    [MaxLength(255)]
    public string? LastName { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Phone { get; set; }
    
    public DateTime? LastLoginUtc { get; set; }
    
    // Navigation properties
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<OperationLog> OperationLogs { get; set; } = new List<OperationLog>();
}
