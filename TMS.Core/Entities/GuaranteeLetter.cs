using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class GuaranteeLetter : BaseEntity
{
    [MaxLength(255)]
    public string? Type { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string GuaranteeNumber { get; set; } = string.Empty;
    
    [MaxLength(255)]
    public string? Supplier { get; set; }
    
    [MaxLength(255)]
    public string? Tender { get; set; }
    
    [MaxLength(255)]
    public string? Winner { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? Amount { get; set; }
    
    public DateTime? IssueDate { get; set; }
    
    public DateTime? ExpiryDate { get; set; }
    
    [MaxLength(50)]
    public string? Status { get; set; }
    
    [Column(TypeName = "decimal(5,2)")]
    public decimal? ProfitPercentage { get; set; }
    
    [Column(TypeName = "decimal(15,2)")]
    public decimal? CalculatedProfit { get; set; }
    
    public Guid? ContractId { get; set; }
    
    public Guid? BankGuaranteeId { get; set; }
    
    public Guid? GovernmentGuaranteeId { get; set; }
    
    // Navigation properties
    public virtual Contract? Contract { get; set; }
    public virtual BankGuarantee? BankGuarantee { get; set; }
    public virtual GovernmentGuarantee? GovernmentGuarantee { get; set; }
}
