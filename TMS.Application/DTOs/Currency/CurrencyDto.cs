using TMS.Application.DTOs.Common;

namespace TMS.Application.DTOs.Currency;

public class CurrencyDto : BaseDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Symbol { get; set; } = string.Empty;
    public decimal ExchangeRate { get; set; }
}
