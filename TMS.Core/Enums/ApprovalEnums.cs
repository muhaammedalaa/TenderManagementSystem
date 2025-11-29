namespace TMS.Core.Enums;

public enum WorkflowType
{
    TenderApproval = 1,
    ContractApproval = 2,
    AssignmentOrderApproval = 3,
    SupportMatterApproval = 4,
    GuaranteeLetterApproval = 5,
    GeneralApproval = 6
}

public enum ApprovalRole
{
    BranchContractsManager = 1,        // مدير فرع التعاقدات
    UnifiedProcurementManager = 2,     // مدير عمليات الشراء الموحد
    AssistantUnifiedProcurementManager = 3, // مساعد مدير الجهاز لإدارة الشراء الموحد
    LegalAffairs = 4,                  // الشئون القانونية
    FinancialManager = 5,              // المدير المالي
    GeneralManager = 6,                // المدير العام
    DepartmentHead = 7,                // رئيس القسم
    Employee = 8                       // موظف
}

public enum ApprovalStatus
{
    Pending = 1,           // في الانتظار
    InProgress = 2,        // قيد المراجعة
    Approved = 3,          // موافق عليه
    Rejected = 4,          // مرفوض
    Returned = 5,          // مرتجع
    Cancelled = 6,         // ملغي
    Expired = 7,           // منتهي الصلاحية
    Delegated = 8          // مفوض
}

public enum ApprovalActionType
{
    Approve = 1,           // موافقة
    Reject = 2,            // رفض
    Return = 3,            // إرجاع
    Delegate = 4,          // تفويض
    Cancel = 5,            // إلغاء
    Comment = 6,           // تعليق
    RequestInfo = 7        // طلب معلومات إضافية
}
