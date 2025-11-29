namespace TMS.Core.Enums;

public enum PaymentStatus
{
    Pending = 0,        // في الانتظار
    Processing = 1,     // قيد المعالجة
    Completed = 2,      // مكتمل
    Failed = 3,         // فشل
    Cancelled = 4,      // ملغي
    Refunded = 5        // مسترد
}

