using TMS.Core.Enums;

namespace TMS.Application.DTOs.SupplyDelivery;

public class CreateSupplyDeliveryDto
{
    public Guid ContractId { get; set; }
    public string DeliveryNumber { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public DateTime DeliveryDate { get; set; }
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Scheduled;
    public string? Notes { get; set; }
}
