using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;


namespace TMS.Application.DTOs.Financial;

public class UpdateInvoiceDto
{
    [Required]
    public Guid Id { get; set; }
    
    [StringLength(100)]
    public string? InvoiceNumber { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal? Amount { get; set; }
    
    [StringLength(3)]
    public string? CurrencyCode { get; set; }
    
    public DateTime? DueDate { get; set; }
    
    [Range(0, 100, ErrorMessage = "Tax rate must be between 0 and 100")]
    public decimal? TaxRate { get; set; }
    
    [StringLength(50)]
    public string? TaxType { get; set; }
    
    public PaymentType? PaymentType { get; set; }
    
    [Range(0, 100, ErrorMessage = "Payment percentage must be between 0 and 100")]
    public int? PaymentPercentage { get; set; }
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
}

