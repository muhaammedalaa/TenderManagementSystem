using TMS.Core.Enums;

namespace TMS.Application.DTOs.GovernmentGuarantee;

public class CreateGovernmentGuaranteeDto
{
    public Guid QuotationId { get; set; }
    public string GuaranteeNumber { get; set; } = string.Empty;
    public string AuthorityName { get; set; } = string.Empty;
    public string? AuthorityType { get; set; }
    public string? AuthorityCode { get; set; }
    public string? AuthorityContactPerson { get; set; }
    public string? AuthorityContactEmail { get; set; }
    public string? AuthorityContactPhone { get; set; }
    public string? ApprovalNumber { get; set; }
    public DateTime? ApprovalDate { get; set; }
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = "USD";
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public GuaranteeType GuaranteeType { get; set; }
    public string Status { get; set; } = "Active";
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
}
