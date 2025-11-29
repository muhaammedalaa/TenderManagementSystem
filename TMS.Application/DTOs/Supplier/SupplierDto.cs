using TMS.Application.DTOs.Address;
using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.Entity;

namespace TMS.Application.DTOs.Supplier;

public class SupplierDto : BaseDto
{
    public Guid EntityId { get; set; }
    public Guid? PrimaryAddressId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? TaxNumber { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? ContactPerson { get; set; }
    public string? ContactPhone { get; set; }
    public string? ContactEmail { get; set; }
    public decimal? FinancialCapacity { get; set; }
    public int? ExperienceYears { get; set; }
    
    // Navigation properties
    public EntityDto? Entity { get; set; }
    public AddressDto? PrimaryAddress { get; set; }
}
