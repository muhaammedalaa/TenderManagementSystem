using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Role;

public class CreateRoleDto
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}
