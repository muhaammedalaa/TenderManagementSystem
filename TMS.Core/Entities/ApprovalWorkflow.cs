using TMS.Core.Common;
using TMS.Core.Enums;

namespace TMS.Core.Entities;

public class ApprovalWorkflow : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkflowType WorkflowType { get; set; }
    public new bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 0;
    
    // Navigation Properties
    public virtual ICollection<ApprovalStep> Steps { get; set; } = new List<ApprovalStep>();
    public virtual ICollection<ApprovalRequest> Requests { get; set; } = new List<ApprovalRequest>();
}

public class ApprovalStep : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ApprovalRole RequiredRole { get; set; }
    public Guid? RequiredUserId { get; set; } // Optional specific user
    public bool IsRequired { get; set; } = true;
    public int TimeLimitDays { get; set; } = 7; // Days to complete this step
    public bool CanDelegate { get; set; } = false; // Can delegate to another user
    public bool CanReject { get; set; } = true; // Can reject the request
    public bool CanReturn { get; set; } = true; // Can return to previous step
    
    // Navigation Properties
    public virtual ApprovalWorkflow Workflow { get; set; } = null!;
    public virtual User? RequiredUser { get; set; }
    public virtual ICollection<ApprovalAction> Actions { get; set; } = new List<ApprovalAction>();
}

public class ApprovalRequest : BaseEntity
{
    public Guid WorkflowId { get; set; }
    public Guid EntityId { get; set; } // ID of the entity being approved (Tender, Contract, etc.)
    public string EntityType { get; set; } = string.Empty; // "Tender", "Contract", "AssignmentOrder", etc.
    public string RequestTitle { get; set; } = string.Empty;
    public string RequestDescription { get; set; } = string.Empty;
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;
    public int CurrentStepOrder { get; set; } = 1;
    public Guid? CurrentApproverId { get; set; }
    public DateTime? CurrentStepDueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
    public string? RejectionReason { get; set; }
    public string? CompletionNotes { get; set; }
    
    // Navigation Properties
    public virtual ApprovalWorkflow Workflow { get; set; } = null!;
    public virtual User? CurrentApprover { get; set; }
    public virtual User? CompletedByUser { get; set; }
    public virtual ICollection<ApprovalAction> Actions { get; set; } = new List<ApprovalAction>();
}

public class ApprovalAction : BaseEntity
{
    public Guid RequestId { get; set; }
    public Guid StepId { get; set; }
    public Guid ApproverId { get; set; }
    public ApprovalActionType ActionType { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; } = DateTime.UtcNow;
    public Guid? DelegatedToUserId { get; set; }
    public string? DelegationReason { get; set; }
    
    // Navigation Properties
    public virtual ApprovalRequest Request { get; set; } = null!;
    public virtual ApprovalStep Step { get; set; } = null!;
    public virtual User Approver { get; set; } = null!;
    public virtual User? DelegatedToUser { get; set; }
}
