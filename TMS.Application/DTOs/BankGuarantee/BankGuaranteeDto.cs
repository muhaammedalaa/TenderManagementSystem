using TMS.Core.Enums;

namespace TMS.Application.DTOs.BankGuarantee;

public class BankGuaranteeDto
{
    public Guid Id { get; set; }
    public Guid QuotationId { get; set; }
    public string GuaranteeNumber { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string? BankBranch { get; set; }
    public string? BankSwiftCode { get; set; }
    public string? BankContactPerson { get; set; }
    public string? BankContactEmail { get; set; }
    public string? BankContactPhone { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public GuaranteeType GuaranteeType { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public decimal? TaxAmount { get; set; }
    public string? TaxType { get; set; }
    public decimal? TaxRate { get; set; }
    public string? TaxRegistrationNumber { get; set; }
    public bool IsTaxIncluded { get; set; }
    public string? GuaranteeTerms { get; set; }
    public bool IsRenewable { get; set; }
    public int? RenewalPeriodDays { get; set; }
    public decimal? ProfitPercentage { get; set; }
    public decimal? CalculatedProfit { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime UpdatedAtUtc { get; set; }
    
    // Navigation properties
    public string? SupplierName { get; set; }
    public string? TenderTitle { get; set; }
    public string? CurrencyName { get; set; }
}
