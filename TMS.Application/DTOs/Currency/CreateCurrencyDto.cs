using System.ComponentModel.DataAnnotations;

namespace TMS.Application.DTOs.Currency;

public class CreateCurrencyDto
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
    public decimal ExchangeRate { get; set; }
    
    [Required]
    public int DecimalPlaces { get; set; } = 2;
}
