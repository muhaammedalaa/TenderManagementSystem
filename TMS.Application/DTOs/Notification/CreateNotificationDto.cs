using TMS.Core.Enums;

namespace TMS.Application.DTOs.Notification;

public class CreateNotificationDto
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public Guid? RelatedEntityId { get; set; }
    public string? RelatedEntityType { get; set; }
    public bool IsRead { get; set; } = false;
    public string? Data { get; set; }
    public SupportPriority Priority { get; set; } = SupportPriority.Normal;
}
