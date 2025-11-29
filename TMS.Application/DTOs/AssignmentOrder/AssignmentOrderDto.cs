namespace TMS.Application.DTOs.AssignmentOrder;

public class AssignmentOrderDto
{
    public Guid Id { get; set; }
    public Guid QuotationId { get; set; }
    public Guid EntityId { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateTime? DeliveryDate { get; set; }
    public string? PaymentTerms { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Navigation properties
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? EntityName { get; set; }
    public string? CurrencyName { get; set; }
}
