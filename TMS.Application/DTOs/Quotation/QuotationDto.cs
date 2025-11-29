using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.Currency;
using TMS.Application.DTOs.Supplier;
using TMS.Application.DTOs.Tender;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Quotation;

public class QuotationDto : BaseDto
{
    public Guid TenderId { get; set; }
    public Guid SupplierId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string CurrencyCode { get; set; } = string.Empty;
    public int? ValidityPeriod { get; set; }
    public int? DeliveryPeriod { get; set; }
    public decimal? TechnicalScore { get; set; }
    public decimal? FinancialScore { get; set; }
    public decimal? TotalScore { get; set; }
    public QuotationStatus Status { get; set; }
    public DateTime SubmissionDate { get; set; }
    public DateTime? EvaluationDate { get; set; }
    public string? EvaluationNotes { get; set; }
    public Guid? EvaluatedBy { get; set; }
    
    // Navigation properties
    public string? TenderTitle { get; set; }
    public string? SupplierName { get; set; }
    public CurrencyDto? Currency { get; set; }
}
