using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Tender : BaseEntity
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
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? EstimatedBudget { get; set; }
    
    [Required]
    public DateTime SubmissionDeadline { get; set; }
    
    [Required]
    public DateTime OpeningDate { get; set; }
    
    public TenderStatus Status { get; set; } = TenderStatus.Draft;
    
    public bool IsActive { get; set; } = true;
    
    public string? Requirements { get; set; }
    
    public string? TermsConditions { get; set; }
    
    public Guid? WinnerQuotationId { get; set; }
    
    public DateTime? AwardedDate { get; set; }
    
    public Guid? AwardedBy { get; set; }
    
    public bool AutoDetermineWinner { get; set; } = false;
    
    public WinnerDeterminationMethod? WinnerDeterminationMethod { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? LowestBidAmount { get; set; }
    
    public Guid? LowestBidQuotationId { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? HighestScore { get; set; }
    
    public Guid? HighestScoreQuotationId { get; set; }
    
    // Navigation properties
    public virtual Entity Entity { get; set; } = null!;
    public virtual Quotation? WinnerQuotation { get; set; }
    public virtual Quotation? LowestBidQuotation { get; set; }
    public virtual Quotation? HighestScoreQuotation { get; set; }
    public virtual User? AwardedByUser { get; set; }
    public virtual ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
}
