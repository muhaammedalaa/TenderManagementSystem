using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Notification : BaseEntity
{
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Message { get; set; } = string.Empty;
    
    [Required]
    public NotificationType Type { get; set; }
    
    public NotificationStatus Status { get; set; } = NotificationStatus.Unread;
    
    public Guid? RelatedEntityId { get; set; }
    
    [MaxLength(255)]
    public string? RelatedEntityType { get; set; }
    
    public DateTime? ReadAtUtc { get; set; }
    
    public bool IsRead { get; set; } = false;
    
    [MaxLength(500)]
    public string? Data { get; set; }
    
    public SupportPriority Priority { get; set; } = SupportPriority.Normal;
    
    // Navigation properties
    public virtual User User { get; set; } = null!;
}
