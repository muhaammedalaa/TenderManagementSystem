using TMS.Application.DTOs.Common;

namespace TMS.Application.DTOs.Role;

public class RoleDto : BaseDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
