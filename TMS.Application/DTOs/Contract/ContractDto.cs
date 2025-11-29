using TMS.Core.Enums;
using TMS.Application.DTOs.AssignmentOrder;

namespace TMS.Application.DTOs.Contract;

public class ContractDto
{
    public Guid Id { get; set; }
    public Guid AssignmentOrderId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public ContractType ContractType { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? CompletionDate { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Navigation properties
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? CurrencyName { get; set; }
    public AssignmentOrderDto? AssignmentOrder { get; set; }
}
