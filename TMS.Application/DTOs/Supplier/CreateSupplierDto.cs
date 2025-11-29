using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Supplier;

public class CreateSupplierDto
{
    [Required]
    public Guid EntityId { get; set; }
    
    public Guid? PrimaryAddressId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    [MaxLength(255)]
    public string? Email { get; set; }
    
    [MaxLength(50)]
    public string? Phone { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string? TaxNumber { get; set; }
    
    [MaxLength(50)]
    public string? RegistrationNumber { get; set; }
    
    [MaxLength(255)]
    public string? ContactPerson { get; set; }
    
    [MaxLength(50)]
    public string? ContactPhone { get; set; }
    
    [EmailAddress]
    [MaxLength(255)]
    public string? ContactEmail { get; set; }
    
    public decimal? FinancialCapacity { get; set; }
    public int? ExperienceYears { get; set; }
    public bool Active { get; set; }
}
