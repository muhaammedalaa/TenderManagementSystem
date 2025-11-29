using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Application.DTOs.OperationLog;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class OperationLogsController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public OperationLogsController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OperationLogDto>>> GetOperationLogs(
        string? search,
        string? action,
        string? entityType,
        Guid? userId,
        DateTime? startDate,
        DateTime? endDate,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.OperationLogs
            .Include(ol => ol.User)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(ol => 
                ol.Action.Contains(search) ||
                (ol.EntityType != null && ol.EntityType.Contains(search)) ||
                (ol.Details != null && ol.Details.Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(ol => ol.Action == action);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(ol => ol.EntityType == entityType);
        }

        if (userId.HasValue)
        {
            query = query.Where(ol => ol.UserId == userId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(ol => ol.CreatedAtUtc >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(ol => ol.CreatedAtUtc <= endDate.Value);
        }

        var totalCount = await query.CountAsync();
        var operationLogs = await query
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var operationLogDtos = _mapper.Map<IEnumerable<OperationLogDto>>(operationLogs);

        return Ok(new
        {
            data = operationLogDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OperationLogDto>> GetOperationLog(Guid id)
    {
        var operationLog = await _context.OperationLogs
            .Include(ol => ol.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(ol => ol.Id == id);

        if (operationLog == null)
            return NotFound();

        var operationLogDto = _mapper.Map<OperationLogDto>(operationLog);
        return Ok(operationLogDto);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<OperationLogDto>>> GetUserOperationLogs(Guid userId)
    {
        var operationLogs = await _context.OperationLogs
            .Where(ol => ol.UserId == userId)
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .Take(100) // Limit to last 100 operations
            .ToListAsync();

        var operationLogDtos = _mapper.Map<IEnumerable<OperationLogDto>>(operationLogs);
        return Ok(operationLogDtos);
    }

    [HttpGet("entity/{entityType}/{entityId:guid}")]
    public async Task<ActionResult<IEnumerable<OperationLogDto>>> GetEntityOperationLogs(string entityType, Guid entityId)
    {
        var operationLogs = await _context.OperationLogs
            .Include(ol => ol.User)
            .Where(ol => ol.EntityType == entityType && ol.EntityId == entityId)
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .ToListAsync();

        var operationLogDtos = _mapper.Map<IEnumerable<OperationLogDto>>(operationLogs);
        return Ok(operationLogDtos);
    }

    [HttpPost]
    public async Task<ActionResult<OperationLogDto>> CreateOperationLog([FromBody] CreateOperationLogDto createOperationLogDto)
    {
        var validator = new CreateOperationLogValidator();
        var validationResult = await validator.ValidateAsync(createOperationLogDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate user exists
        if (!await _context.Users.AnyAsync(u => u.Id == createOperationLogDto.UserId))
        {
            return BadRequest($"User with ID {createOperationLogDto.UserId} does not exist.");
        }

        var operationLog = _mapper.Map<OperationLog>(createOperationLogDto);
        operationLog.CreatedAtUtc = DateTime.UtcNow;

        _context.OperationLogs.Add(operationLog);
        await _context.SaveChangesAsync();

        var operationLogDto = _mapper.Map<OperationLogDto>(operationLog);
        return CreatedAtAction(nameof(GetOperationLog), new { id = operationLog.Id }, operationLogDto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteOperationLog(Guid id)
    {
        var operationLog = await _context.OperationLogs.FindAsync(id);
        if (operationLog == null)
            return NotFound();

        _context.OperationLogs.Remove(operationLog);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("cleanup")]
    public async Task<IActionResult> CleanupOldLogs(int daysToKeep = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
        
        var oldLogs = await _context.OperationLogs
            .Where(ol => ol.CreatedAtUtc < cutoffDate)
            .ToListAsync();

        _context.OperationLogs.RemoveRange(oldLogs);
        await _context.SaveChangesAsync();

        return Ok(new { deletedCount = oldLogs.Count });
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetOperationLogStatistics()
    {
        var totalLogs = await _context.OperationLogs.CountAsync();

        var logsByAction = await _context.OperationLogs
            .GroupBy(ol => ol.Action)
            .Select(g => new
            {
                action = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var logsByEntityType = await _context.OperationLogs
            .GroupBy(ol => ol.EntityType)
            .Select(g => new
            {
                entityType = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var logsByUser = await _context.OperationLogs
            .Include(ol => ol.User)
            .GroupBy(ol => ol.UserId)
            .Select(g => new
            {
                userId = g.Key,
                userName = g.First().User != null ? 
                    (g.First().User.FirstName ?? "") + " " + (g.First().User.LastName ?? "") : 
                    "",
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .Take(10)
            .ToListAsync();

        var recentActivity = await _context.OperationLogs
            .Include(ol => ol.User)
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .Take(10)
            .Select(ol => new
            {
                id = ol.Id,
                action = ol.Action,
                entityType = ol.EntityType,
                userName = ol.User != null ? 
                    (ol.User.FirstName ?? "") + " " + (ol.User.LastName ?? "") : 
                    "",
                createdAt = ol.CreatedAtUtc
            })
            .ToListAsync();

        var statistics = new
        {
            totalLogs,
            logsByAction,
            logsByEntityType,
            logsByUser,
            recentActivity
        };

        return Ok(statistics);
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportOperationLogs(
        DateTime? startDate,
        DateTime? endDate,
        string? action,
        string? entityType,
        Guid? userId)
    {
        var query = _context.OperationLogs
            .Include(ol => ol.User)
            .AsNoTracking();

        if (startDate.HasValue)
        {
            query = query.Where(ol => ol.CreatedAtUtc >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(ol => ol.CreatedAtUtc <= endDate.Value);
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            query = query.Where(ol => ol.Action == action);
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(ol => ol.EntityType == entityType);
        }

        if (userId.HasValue)
        {
            query = query.Where(ol => ol.UserId == userId.Value);
        }

        var logs = await query
            .OrderByDescending(ol => ol.CreatedAtUtc)
            .Select(ol => new
            {
                Id = ol.Id,
                Action = ol.Action,
                EntityType = ol.EntityType,
                EntityId = ol.EntityId,
                UserName = ol.User != null ? 
                    (ol.User.FirstName ?? "") + " " + (ol.User.LastName ?? "") : 
                    "",
                Details = ol.Details,
                IpAddress = ol.IpAddress,
                UserAgent = ol.UserAgent,
                CreatedAt = ol.CreatedAtUtc
            })
            .ToListAsync();

        // Convert to CSV format
        var csv = "Id,Action,EntityType,EntityId,UserName,Details,IpAddress,UserAgent,CreatedAt\n";
        foreach (var log in logs)
        {
            csv += $"{log.Id},{log.Action},{log.EntityType},{log.EntityId},{log.UserName},\"{log.Details}\",{log.IpAddress},{log.UserAgent},{log.CreatedAt:yyyy-MM-dd HH:mm:ss}\n";
        }

        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"operation_logs_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv");
    }
}

public class CreateOperationLogValidator : AbstractValidator<CreateOperationLogDto>
{
    public CreateOperationLogValidator()
    {
        RuleFor(x => x.Action).NotEmpty().MaximumLength(100);
        RuleFor(x => x.EntityType).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Details).MaximumLength(2000);
        RuleFor(x => x.IpAddress).MaximumLength(45);
        RuleFor(x => x.UserAgent).MaximumLength(500);
    }
}
