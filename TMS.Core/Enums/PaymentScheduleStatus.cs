namespace TMS.Core.Enums;

public enum PaymentScheduleStatus
{
    Pending = 0,        // في الانتظار
    Due = 1,            // مستحق
    Paid = 2,           // مدفوع
    Overdue = 3,        // متأخر
    Cancelled = 4,      // ملغي
    PartiallyPaid = 5   // مدفوع جزئياً
}

