using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class Supplier : BaseEntity
{
    [Required]
    public Guid EntityId { get; set; }
    
    public Guid? PrimaryAddressId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(255)]
    [EmailAddress]
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
    
    [MaxLength(255)]
    [EmailAddress]
    public string? ContactEmail { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? FinancialCapacity { get; set; }
    
    public int? ExperienceYears { get; set; }
    
    // Navigation properties
    public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
    public virtual Entity Entity { get; set; } = null!;
    public virtual Address? PrimaryAddress { get; set; }
    public virtual ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
}
