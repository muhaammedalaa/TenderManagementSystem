using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class BankGuarantee : BaseEntity
{
    [Required]
    public Guid QuotationId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string GuaranteeNumber { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string BankName { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? BankBranch { get; set; }
    
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime IssueDate { get; set; }
    
    [Required]
    public DateTime ExpiryDate { get; set; }
    
    [Required]
    public GuaranteeType GuaranteeType { get; set; }
    
    public GuaranteeStatus Status { get; set; } = GuaranteeStatus.Active;
    
    public string? Notes { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? TaxAmount { get; set; }
    
    [MaxLength(50)]
    public string? TaxType { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? TaxRate { get; set; }
    
    [MaxLength(50)]
    public string? TaxRegistrationNumber { get; set; }
    
    public bool IsTaxIncluded { get; set; } = false;
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitPercentage { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? CalculatedProfit { get; set; }
    
    [MaxLength(50)]
    public string? BankSwiftCode { get; set; }
    
    [MaxLength(100)]
    public string? BankAccountNumber { get; set; }
    
    [MaxLength(255)]
    public string? BankContactPerson { get; set; }
    
    [MaxLength(255)]
    [EmailAddress]
    public string? BankContactEmail { get; set; }
    
    [MaxLength(50)]
    public string? BankContactPhone { get; set; }
    
    public string? GuaranteeTerms { get; set; }
    
    public bool IsRenewable { get; set; } = false;
    
    public int? RenewalPeriodDays { get; set; }
    
    // Navigation properties
    public virtual Quotation Quotation { get; set; } = null!;
    public virtual Currency Currency { get; set; } = null!;
    public virtual ICollection<GuaranteeLetter> GuaranteeLetters { get; set; } = new List<GuaranteeLetter>();
}
