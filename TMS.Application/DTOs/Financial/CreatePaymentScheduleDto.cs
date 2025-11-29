using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;


namespace TMS.Application.DTOs.Financial;

public class CreatePaymentScheduleDto
{
    [Required]
    public Guid ContractId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string ScheduleNumber { get; set; } = string.Empty;
    
    [Required]
    [StringLength(255)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
    public decimal Amount { get; set; }
    
    [Required]
    [StringLength(3)]
    public string CurrencyCode { get; set; } = string.Empty;
    
    [Required]
    public DateTime DueDate { get; set; }
    
    public PaymentType PaymentType { get; set; } = PaymentType.Advance;
    
    [Range(0, 100, ErrorMessage = "Payment percentage must be between 0 and 100")]
    public int PaymentPercentage { get; set; } = 25;
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [StringLength(500)]
    public string? MilestoneDescription { get; set; }
    
    public bool IsAutomatic { get; set; } = false;
    
    [StringLength(500)]
    public string? TriggerCondition { get; set; }
}

