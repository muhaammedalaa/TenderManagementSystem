using System.Linq.Expressions;
using TMS.Core.Entities;
using TMS.Core.Enums;

namespace TMS.Core.Specifications;

public class TenderSpecifications
{
    public static Expression<Func<Tender, bool>> ByStatus(TenderStatus status)
    {
        return t => t.Status == status;
    }

    public static Expression<Func<Tender, bool>> ByEntityId(Guid entityId)
    {
        return t => t.EntityId == entityId;
    }

    public static Expression<Func<Tender, bool>> ByCategory(string category)
    {
        return t => t.Category == category;
    }

    public static Expression<Func<Tender, bool>> ByDateRange(DateTime startDate, DateTime endDate)
    {
        return t => t.SubmissionDeadline >= startDate && t.SubmissionDeadline <= endDate;
    }

    public static Expression<Func<Tender, bool>> ActiveTenders()
    {
        return t => t.IsActive && t.Status != TenderStatus.Cancelled;
    }

    public static Expression<Func<Tender, bool>> ByBudgetRange(decimal minBudget, decimal maxBudget)
    {
        return t => t.EstimatedBudget >= minBudget && t.EstimatedBudget <= maxBudget;
    }
}
