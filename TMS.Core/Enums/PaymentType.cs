namespace TMS.Core.Enums;

public enum PaymentType
{
    Advance = 0,        // دفعة مقدمة (25% عند التوقيع)
    Milestone = 1,      // دفعة عند إنجاز مرحلة
    Final = 2,          // الدفعة النهائية
    Retention = 3,      // ضمان حسن التنفيذ
    Penalty = 4,        // غرامة
    Bonus = 5           // مكافأة
}

