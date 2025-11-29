using TMS.Core.Enums;

namespace TMS.Application.DTOs.SupplyDelivery;

public class SupplyDeliveryDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string DeliveryNumber { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime DeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public DeliveryStatus Status { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Navigation properties
    public string? ContractNumber { get; set; }
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
}
