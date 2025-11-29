namespace TMS.Application.DTOs.Financial;

public class PaymentAnalyticsDto
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal TotalPayments { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AveragePaymentAmount { get; set; }
    public int AveragePaymentTime { get; set; } // in days
    public decimal OnTimePayments { get; set; } // percentage
    public decimal LatePayments { get; set; } // percentage
    public Dictionary<string, int> PaymentMethodBreakdown { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, decimal> MonthlyTrends { get; set; } = new Dictionary<string, decimal>();
    public List<PaymentMethodAnalyticsDto> PaymentMethods { get; set; } = new List<PaymentMethodAnalyticsDto>();
    public List<MonthlyPaymentDto> MonthlyPayments { get; set; } = new List<MonthlyPaymentDto>();
}

public class PaymentMethodAnalyticsDto
{
    public string Method { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal Percentage { get; set; }
}

public class MonthlyPaymentDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int Count { get; set; }
    public decimal AverageAmount { get; set; }
}

