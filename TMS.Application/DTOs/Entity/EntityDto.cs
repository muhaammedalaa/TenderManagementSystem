using TMS.Application.DTOs.Common;

namespace TMS.Application.DTOs.Entity;

public class EntityDto : BaseDto
{
    public Guid? ParentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ParentName { get; set; }
    public List<EntityDto> Children { get; set; } = new();
}
