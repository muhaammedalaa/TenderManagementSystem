using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class Quotation : BaseEntity
{
    [Required]
    public Guid TenderId { get; set; }
    
    [Required]
    public Guid SupplierId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string ReferenceNumber { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    public int? ValidityPeriod { get; set; }
    
    public int? DeliveryPeriod { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? TechnicalScore { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? FinancialScore { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? TotalScore { get; set; }
    
    public QuotationStatus Status { get; set; } = QuotationStatus.Submitted;
    
    public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? EvaluationDate { get; set; }
    
    public string? EvaluationNotes { get; set; }
    
    public Guid? EvaluatedBy { get; set; }
    
    // Navigation properties
    public virtual Tender Tender { get; set; } = null!;
    public virtual Supplier Supplier { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual User? EvaluatedByUser { get; set; }
    public virtual ICollection<AssignmentOrder> AssignmentOrders { get; set; } = new List<AssignmentOrder>();
    public virtual ICollection<BankGuarantee> BankGuarantees { get; set; } = new List<BankGuarantee>();
    public virtual ICollection<GovernmentGuarantee> GovernmentGuarantees { get; set; } = new List<GovernmentGuarantee>();
}
