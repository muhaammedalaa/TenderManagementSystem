using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class CreateInvoiceDto
{
    [Required]
    public Guid ContractId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string InvoiceNumber { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    [Range(0, 100, ErrorMessage = "Tax rate must be between 0 and 100")]
    public decimal TaxRate { get; set; } = 0;
    
    [StringLength(50)]
    public string? TaxType { get; set; }
    
    public PaymentType PaymentType { get; set; } = PaymentType.Advance;
    
    [Range(0, 100, ErrorMessage = "Payment percentage must be between 0 and 100")]
    public int PaymentPercentage { get; set; } = 25;
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}
