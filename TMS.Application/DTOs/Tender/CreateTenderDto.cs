using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Tender;

public class CreateTenderDto
{
    [Required]
    public Guid EntityId { get; set; }
    
    [Required]
    [MaxLength(500)]
    public string Title { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ReferenceNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;
    
    public decimal? EstimatedBudget { get; set; }
    
    [Required]
    public DateTime SubmissionDeadline { get; set; }
    
    [Required]
    public DateTime OpeningDate { get; set; }
    
    public string? Requirements { get; set; }
    public string? TermsConditions { get; set; }
    public bool AutoDetermineWinner { get; set; } = false;
    public WinnerDeterminationMethod? WinnerDeterminationMethod { get; set; }
}
