namespace TMS.Application.DTOs.AssignmentOrder;

public class CreateAssignmentOrderDto
{
    public Guid QuotationId { get; set; }
    public Guid EntityId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? Notes { get; set; }
}
