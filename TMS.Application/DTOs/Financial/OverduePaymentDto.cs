namespace TMS.Application.DTOs.Financial;

public class OverduePaymentDto
{
    public Guid Id { get; set; }
    public Guid ContractId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string ContractNumber { get; set; } = string.Empty;
    public string ScheduleNumber { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal RemainingAmount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public int DaysOverdue { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

