using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Financial;

public class ConfirmPaymentDto
{
    public Guid? ConfirmedBy { get; set; }
    
    [StringLength(500)]
    public string? ConfirmationNotes { get; set; }
}

