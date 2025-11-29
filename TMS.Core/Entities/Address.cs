using System.ComponentModel.DataAnnotations;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Address : BaseEntity
{
    [Required]
    [MaxLength(255)]
    public string AddressLine1 { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? AddressLine2 { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;
    
    [MaxLength(100)]
    public string? State { get; set; }
    
    [MaxLength(20)]
    public string? PostalCode { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Country { get; set; } = string.Empty;
    
    [Required]
    public AddressType AddressType { get; set; }
    
    [Required]
    public Guid EntityId { get; set; }
    
    public bool IsPrimary { get; set; } = false;
    
    [MaxLength(500)]
    public string? Notes { get; set; }
    
    // Navigation properties
    public virtual Entity Entity { get; set; } = null!;
    public virtual ICollection<Supplier> Suppliers { get; set; } = new List<Supplier>();
}
