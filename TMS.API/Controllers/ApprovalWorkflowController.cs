using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Approval;
using TMS.Application.Interfaces;
using TMS.Core.Enums;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApprovalWorkflowController : ControllerBase
{
    private readonly IApprovalWorkflowService _approvalWorkflowService;

    public ApprovalWorkflowController(IApprovalWorkflowService approvalWorkflowService)
    {
        _approvalWorkflowService = approvalWorkflowService;
    }

    #region Workflow Management

    [HttpPost("workflows")]
    public async Task<ActionResult<ApprovalWorkflowDto>> CreateWorkflow([FromBody] CreateApprovalWorkflowDto request)
    {
        try
        {
            var workflow = await _approvalWorkflowService.CreateWorkflowAsync(request);
            return CreatedAtAction(nameof(GetWorkflow), new { id = workflow.Id }, workflow);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("workflows/{id}")]
    public async Task<ActionResult<ApprovalWorkflowDto>> GetWorkflow(Guid id)
    {
        try
        {
            var workflow = await _approvalWorkflowService.GetWorkflowByIdAsync(id);
            return Ok(workflow);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("workflows")]
    public async Task<ActionResult<List<ApprovalWorkflowDto>>> GetAllWorkflows()
    {
        try
        {
            var workflows = await _approvalWorkflowService.GetAllWorkflowsAsync();
            return Ok(workflows);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("workflows/{id}")]
    public async Task<ActionResult<ApprovalWorkflowDto>> UpdateWorkflow(Guid id, [FromBody] CreateApprovalWorkflowDto request)
    {
        try
        {
            var workflow = await _approvalWorkflowService.UpdateWorkflowAsync(id, request);
            return Ok(workflow);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("workflows/{id}")]
    public async Task<ActionResult> DeleteWorkflow(Guid id)
    {
        try
        {
            var result = await _approvalWorkflowService.DeleteWorkflowAsync(id);
            if (result)
                return NoContent();
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("workflows/{id}/activate")]
    public async Task<ActionResult> ActivateWorkflow(Guid id)
    {
        try
        {
            var result = await _approvalWorkflowService.ActivateWorkflowAsync(id);
            if (result)
                return Ok(new { message = "Workflow activated successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("workflows/{id}/deactivate")]
    public async Task<ActionResult> DeactivateWorkflow(Guid id)
    {
        try
        {
            var result = await _approvalWorkflowService.DeactivateWorkflowAsync(id);
            if (result)
                return Ok(new { message = "Workflow deactivated successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Step Management

    [HttpPost("workflows/{workflowId}/steps")]
    public async Task<ActionResult<ApprovalStepDto>> CreateStep(Guid workflowId, [FromBody] CreateApprovalStepDto request)
    {
        try
        {
            var step = await _approvalWorkflowService.CreateStepAsync(workflowId, request);
            return CreatedAtAction(nameof(GetStep), new { stepId = step.Id }, step);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("steps/{stepId}")]
    public async Task<ActionResult<ApprovalStepDto>> GetStep(Guid stepId)
    {
        try
        {
            var steps = await _approvalWorkflowService.GetWorkflowStepsAsync(stepId);
            return Ok(steps);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("workflows/{workflowId}/steps")]
    public async Task<ActionResult<List<ApprovalStepDto>>> GetWorkflowSteps(Guid workflowId)
    {
        try
        {
            var steps = await _approvalWorkflowService.GetWorkflowStepsAsync(workflowId);
            return Ok(steps);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("steps/{stepId}")]
    public async Task<ActionResult<ApprovalStepDto>> UpdateStep(Guid stepId, [FromBody] CreateApprovalStepDto request)
    {
        try
        {
            var step = await _approvalWorkflowService.UpdateStepAsync(stepId, request);
            return Ok(step);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("steps/{stepId}")]
    public async Task<ActionResult> DeleteStep(Guid stepId)
    {
        try
        {
            var result = await _approvalWorkflowService.DeleteStepAsync(stepId);
            if (result)
                return NoContent();
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Request Management

    [HttpPost("requests")]
    public async Task<ActionResult<ApprovalRequestDto>> CreateRequest([FromBody] CreateApprovalRequestDto request)
    {
        try
        {
            var approvalRequest = await _approvalWorkflowService.CreateRequestAsync(request);
            return CreatedAtAction(nameof(GetRequest), new { id = approvalRequest.Id }, approvalRequest);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("requests/{id}")]
    public async Task<ActionResult<ApprovalRequestDto>> GetRequest(Guid id)
    {
        try
        {
            var request = await _approvalWorkflowService.GetRequestByIdAsync(id);
            return Ok(request);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("requests")]
    public async Task<ActionResult<List<ApprovalRequestDto>>> GetRequests(
        [FromQuery] Guid? userId = null,
        [FromQuery] Guid? entityId = null,
        [FromQuery] string? entityType = null,
        [FromQuery] ApprovalStatus? status = null)
    {
        try
        {
            List<ApprovalRequestDto> requests;

            if (userId.HasValue)
            {
                requests = await _approvalWorkflowService.GetRequestsByUserIdAsync(userId.Value);
            }
            else if (entityId.HasValue && !string.IsNullOrEmpty(entityType))
            {
                requests = await _approvalWorkflowService.GetRequestsByEntityAsync(entityId.Value, entityType);
            }
            else if (status.HasValue)
            {
                requests = await _approvalWorkflowService.GetRequestsByStatusAsync(status.Value);
            }
            else
            {
                requests = await _approvalWorkflowService.GetPendingRequestsAsync();
            }

            return Ok(requests);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("requests/my-pending/{userId}")]
    public async Task<ActionResult<List<ApprovalRequestDto>>> GetMyPendingApprovals(Guid userId)
    {
        try
        {
            var requests = await _approvalWorkflowService.GetMyPendingApprovalsAsync(userId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("requests/overdue")]
    public async Task<ActionResult<List<ApprovalRequestDto>>> GetOverdueRequests()
    {
        try
        {
            var requests = await _approvalWorkflowService.GetOverdueRequestsAsync();
            return Ok(requests);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Action Management

    [HttpPost("actions")]
    public async Task<ActionResult<ApprovalActionDto>> ProcessAction([FromBody] ApprovalActionRequestDto request)
    {
        try
        {
            var action = await _approvalWorkflowService.ProcessActionAsync(request);
            return Ok(action);
        }
        catch (ArgumentException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("requests/{requestId}/actions")]
    public async Task<ActionResult<List<ApprovalActionDto>>> GetRequestActions(Guid requestId)
    {
        try
        {
            var actions = await _approvalWorkflowService.GetRequestActionsAsync(requestId);
            return Ok(actions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("actions/user/{userId}")]
    public async Task<ActionResult<List<ApprovalActionDto>>> GetUserActions(Guid userId)
    {
        try
        {
            var actions = await _approvalWorkflowService.GetUserActionsAsync(userId);
            return Ok(actions);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Workflow Processing

    [HttpPost("requests/{requestId}/start")]
    public async Task<ActionResult> StartWorkflow(Guid requestId)
    {
        try
        {
            var result = await _approvalWorkflowService.StartWorkflowAsync(requestId);
            if (result)
                return Ok(new { message = "Workflow started successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{requestId}/next-step")]
    public async Task<ActionResult> MoveToNextStep(Guid requestId)
    {
        try
        {
            var result = await _approvalWorkflowService.MoveToNextStepAsync(requestId);
            if (result)
                return Ok(new { message = "Moved to next step successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{requestId}/previous-step")]
    public async Task<ActionResult> ReturnToPreviousStep(Guid requestId)
    {
        try
        {
            var result = await _approvalWorkflowService.ReturnToPreviousStepAsync(requestId);
            if (result)
                return Ok(new { message = "Returned to previous step successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{requestId}/complete")]
    public async Task<ActionResult> CompleteWorkflow(Guid requestId, [FromBody] string completionNotes)
    {
        try
        {
            var result = await _approvalWorkflowService.CompleteWorkflowAsync(requestId, completionNotes);
            if (result)
                return Ok(new { message = "Workflow completed successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("requests/{requestId}/reject")]
    public async Task<ActionResult> RejectWorkflow(Guid requestId, [FromBody] string rejectionReason)
    {
        try
        {
            var result = await _approvalWorkflowService.RejectWorkflowAsync(requestId, rejectionReason);
            if (result)
                return Ok(new { message = "Workflow rejected successfully" });
            return NotFound();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion

    #region Statistics and Reports

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetWorkflowStatistics()
    {
        try
        {
            var statistics = await _approvalWorkflowService.GetWorkflowStatisticsAsync();
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("statistics/user/{userId}")]
    public async Task<ActionResult<object>> GetUserApprovalStatistics(Guid userId)
    {
        try
        {
            var statistics = await _approvalWorkflowService.GetUserApprovalStatisticsAsync(userId);
            return Ok(statistics);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    #endregion
}
