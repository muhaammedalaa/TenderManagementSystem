using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TMS.Core.Common;

namespace TMS.Core.Entities;

public class Currency : BaseEntity
{
    [Required]
    [MaxLength(3)]
    public string Code { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(10)]
    public string Symbol { get; set; } = string.Empty;
    
    [Required]
    [Column(TypeName = "decimal(10,4)")]
    public decimal ExchangeRate { get; set; }
    
    [Required]
    public int DecimalPlaces { get; set; } = 2;
    
    // Navigation properties
    public virtual ICollection<Quotation> Quotations { get; set; } = new List<Quotation>();
    public virtual ICollection<AssignmentOrder> AssignmentOrders { get; set; } = new List<AssignmentOrder>();
    public virtual ICollection<Contract> Contracts { get; set; } = new List<Contract>();
    public virtual ICollection<BankGuarantee> BankGuarantees { get; set; } = new List<BankGuarantee>();
    public virtual ICollection<GovernmentGuarantee> GovernmentGuarantees { get; set; } = new List<GovernmentGuarantee>();
    public virtual ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<PaymentSchedule> PaymentSchedules { get; set; } = new List<PaymentSchedule>();
}
