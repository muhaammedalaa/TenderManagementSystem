using System.ComponentModel.DataAnnotations;
using TMS.Core.Enums;

namespace TMS.Application.DTOs.Financial;

public class PaymentScheduleTemplate
{
    [Required]
    [StringLength(255)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [Range(0, 100, ErrorMessage = "Payment percentage must be between 0 and 100")]
    public int PaymentPercentage { get; set; }
    
    public PaymentType PaymentType { get; set; } = PaymentType.Advance;
    
    [Required]
    public int DaysFromContractStart { get; set; } // Number of days from contract start date
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    [StringLength(500)]
    public string? MilestoneDescription { get; set; }
    
    public bool IsAutomatic { get; set; } = false;
    
    [StringLength(500)]
    public string? TriggerCondition { get; set; }
}