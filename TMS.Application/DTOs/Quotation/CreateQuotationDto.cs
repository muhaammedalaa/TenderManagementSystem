using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Quotation;

public class CreateQuotationDto
{
    [Required]
    public Guid TenderId { get; set; }
    
    [Required]
    public Guid SupplierId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ReferenceNumber { get; set; } = string.Empty;
    
    [Required]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    public int? ValidityPeriod { get; set; }
    public int? DeliveryPeriod { get; set; }
    public decimal? TechnicalScore { get; set; }
    public decimal? FinancialScore { get; set; }
    public decimal? TotalScore { get; set; }
    public string? EvaluationNotes { get; set; }
}
