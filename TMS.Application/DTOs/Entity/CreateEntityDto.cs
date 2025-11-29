using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Entity;

public class CreateEntityDto
{
    public Guid? ParentId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    
    public string? Description { get; set; }
}
