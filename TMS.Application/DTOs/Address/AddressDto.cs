using TMS.Application.DTOs.Common;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Address;

public class AddressDto : BaseDto
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string? State { get; set; }
    public string? PostalCode { get; set; }
    public string Country { get; set; } = string.Empty;
    public AddressType AddressType { get; set; }
}
