using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.Entity;
using TMS.Core.Enums;

using TMS.Application.DTOs.Quotation;

namespace TMS.Application.DTOs.Tender;

public class TenderDto : BaseDto
{
    public Guid EntityId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal? EstimatedBudget { get; set; }
    public DateTime SubmissionDeadline { get; set; }
    public DateTime OpeningDate { get; set; }
    public TenderStatus Status { get; set; }
    public string? Requirements { get; set; }
    public string? TermsConditions { get; set; }
    public Guid? WinnerQuotationId { get; set; }
    public DateTime? AwardedDate { get; set; }
    public Guid? AwardedBy { get; set; }
    public bool AutoDetermineWinner { get; set; }
    public WinnerDeterminationMethod? WinnerDeterminationMethod { get; set; }
    public decimal? LowestBidAmount { get; set; }
    public Guid? LowestBidQuotationId { get; set; }
    public decimal? HighestScore { get; set; }
    public Guid? HighestScoreQuotationId { get; set; }
    
    // Navigation properties
    public EntityDto? Entity { get; set; }
    public string? EntityName { get; set; }
    public int QuotationCount { get; set; }
    public List<QuotationDto>? Quotations { get; set; }
}
