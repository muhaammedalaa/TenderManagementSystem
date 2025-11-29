using TMS.Core.Enums;

namespace TMS.Application.DTOs.Contract;

public class CreateContractDto
{
    public Guid AssignmentOrderId { get; set; }
    public string ContractNumber { get; set; } = string.Empty;
    public ContractType ContractType { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public ContractStatus Status { get; set; } = ContractStatus.Active;
    public string? Description { get; set; }
}
