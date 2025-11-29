using TMS.Application.DTOs.Approval;
using TMS.Core.Enums;

namespace TMS.Application.Interfaces;

public interface IApprovalWorkflowService
{
    // Workflow Management
    Task<ApprovalWorkflowDto> CreateWorkflowAsync(CreateApprovalWorkflowDto request);
    Task<ApprovalWorkflowDto> GetWorkflowByIdAsync(Guid id);
    Task<List<ApprovalWorkflowDto>> GetAllWorkflowsAsync();
    Task<ApprovalWorkflowDto> UpdateWorkflowAsync(Guid id, CreateApprovalWorkflowDto request);
    Task<bool> DeleteWorkflowAsync(Guid id);
    Task<bool> ActivateWorkflowAsync(Guid id);
    Task<bool> DeactivateWorkflowAsync(Guid id);

    // Step Management
    Task<ApprovalStepDto> CreateStepAsync(Guid workflowId, CreateApprovalStepDto request);
    Task<ApprovalStepDto> UpdateStepAsync(Guid stepId, CreateApprovalStepDto request);
    Task<bool> DeleteStepAsync(Guid stepId);
    Task<List<ApprovalStepDto>> GetWorkflowStepsAsync(Guid workflowId);

    // Request Management
    Task<ApprovalRequestDto> CreateRequestAsync(CreateApprovalRequestDto request);
    Task<ApprovalRequestDto> GetRequestByIdAsync(Guid id);
    Task<List<ApprovalRequestDto>> GetRequestsByUserIdAsync(Guid userId);
    Task<List<ApprovalRequestDto>> GetRequestsByEntityAsync(Guid entityId, string entityType);
    Task<List<ApprovalRequestDto>> GetPendingRequestsAsync();
    Task<List<ApprovalRequestDto>> GetMyPendingApprovalsAsync(Guid userId);

    // Action Management
    Task<ApprovalActionDto> ProcessActionAsync(ApprovalActionRequestDto request);
    Task<List<ApprovalActionDto>> GetRequestActionsAsync(Guid requestId);
    Task<List<ApprovalActionDto>> GetUserActionsAsync(Guid userId);

    // Workflow Processing
    Task<bool> StartWorkflowAsync(Guid requestId);
    Task<bool> MoveToNextStepAsync(Guid requestId);
    Task<bool> ReturnToPreviousStepAsync(Guid requestId);
    Task<bool> CompleteWorkflowAsync(Guid requestId, string completionNotes);
    Task<bool> RejectWorkflowAsync(Guid requestId, string rejectionReason);

    // Statistics and Reports
    Task<object> GetWorkflowStatisticsAsync();
    Task<object> GetUserApprovalStatisticsAsync(Guid userId);
    Task<List<ApprovalRequestDto>> GetOverdueRequestsAsync();
    Task<List<ApprovalRequestDto>> GetRequestsByStatusAsync(ApprovalStatus status);
}
