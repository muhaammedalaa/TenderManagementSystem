using System.Linq.Expressions;
using TMS.Core.Entities;
using TMS.Core.Enums;

namespace TMS.Core.Specifications;

public class QuotationSpecifications
{
    public static Expression<Func<Quotation, bool>> ByStatus(QuotationStatus status)
    {
        return q => q.Status == status;
    }

    public static Expression<Func<Quotation, bool>> ByTenderId(Guid tenderId)
    {
        return q => q.TenderId == tenderId;
    }

    public static Expression<Func<Quotation, bool>> BySupplierId(Guid supplierId)
    {
        return q => q.SupplierId == supplierId;
    }

    public static Expression<Func<Quotation, bool>> ByAmountRange(decimal minAmount, decimal maxAmount)
    {
        return q => q.Amount >= minAmount && q.Amount <= maxAmount;
    }

    public static Expression<Func<Quotation, bool>> ActiveQuotations()
    {
        return q => q.IsActive;
    }

    public static Expression<Func<Quotation, bool>> ByCurrency(string currencyCode)
    {
        return q => q.CurrencyCode == currencyCode;
    }
}
