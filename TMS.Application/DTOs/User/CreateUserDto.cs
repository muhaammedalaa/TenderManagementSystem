using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.User;

public class CreateUserDto
{
    [Required]
    [MaxLength(255)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? FirstName { get; set; }
    
    [MaxLength(255)]
    public string? LastName { get; set; }
    
    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? Phone { get; set; }
    
    public List<Guid> RoleIds { get; set; } = new();
}
