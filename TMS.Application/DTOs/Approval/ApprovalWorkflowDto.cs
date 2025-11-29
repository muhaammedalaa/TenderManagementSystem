using TMS.Core.Enums;

namespace TMS.Application.DTOs.Approval;

public class ApprovalWorkflowDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkflowType WorkflowType { get; set; }
    public bool IsActive { get; set; }
    public int Priority { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<ApprovalStepDto> Steps { get; set; } = new();
}

public class ApprovalStepDto
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ApprovalRole RequiredRole { get; set; }
    public Guid? RequiredUserId { get; set; }
    public string? RequiredUserName { get; set; }
    public bool IsRequired { get; set; }
    public int TimeLimitDays { get; set; }
    public bool CanDelegate { get; set; }
    public bool CanReject { get; set; }
    public bool CanReturn { get; set; }
}

public class ApprovalRequestDto
{
    public Guid Id { get; set; }
    public Guid WorkflowId { get; set; }
    public string WorkflowName { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string RequestTitle { get; set; } = string.Empty;
    public string RequestDescription { get; set; } = string.Empty;
    public ApprovalStatus Status { get; set; }
    public int CurrentStepOrder { get; set; }
    public Guid? CurrentApproverId { get; set; }
    public string? CurrentApproverName { get; set; }
    public DateTime? CurrentStepDueDate { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
    public string? CompletedByName { get; set; }
    public string? RejectionReason { get; set; }
    public string? CompletionNotes { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public List<ApprovalActionDto> Actions { get; set; } = new();
}

public class ApprovalActionDto
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public Guid StepId { get; set; }
    public string StepName { get; set; } = string.Empty;
    public Guid ApproverId { get; set; }
    public string ApproverName { get; set; } = string.Empty;
    public ApprovalActionType ActionType { get; set; }
    public string Comments { get; set; } = string.Empty;
    public DateTime ActionDate { get; set; }
    public Guid? DelegatedToUserId { get; set; }
    public string? DelegatedToUserName { get; set; }
    public string? DelegationReason { get; set; }
}

public class CreateApprovalWorkflowDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public WorkflowType WorkflowType { get; set; }
    public bool IsActive { get; set; } = true;
    public int Priority { get; set; } = 0;
    public List<CreateApprovalStepDto> Steps { get; set; } = new();
}

public class CreateApprovalStepDto
{
    public int StepOrder { get; set; }
    public string StepName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ApprovalRole RequiredRole { get; set; }
    public Guid? RequiredUserId { get; set; }
    public bool IsRequired { get; set; } = true;
    public int TimeLimitDays { get; set; } = 7;
    public bool CanDelegate { get; set; } = false;
    public bool CanReject { get; set; } = true;
    public bool CanReturn { get; set; } = true;
}

public class CreateApprovalRequestDto
{
    public Guid WorkflowId { get; set; }
    public Guid EntityId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string RequestTitle { get; set; } = string.Empty;
    public string RequestDescription { get; set; } = string.Empty;
}

public class ApprovalActionRequestDto
{
    public Guid RequestId { get; set; }
    public ApprovalActionType ActionType { get; set; }
    public string Comments { get; set; } = string.Empty;
    public Guid? DelegatedToUserId { get; set; }
    public string? DelegationReason { get; set; }
}
