using TMS.Application.DTOs.Common;

namespace TMS.Application.DTOs.User;

public class UserDto : BaseDto
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public DateTime? LastLoginUtc { get; set; }
    public List<string> Roles { get; set; } = new();
}
