using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Enums;
using TMS.Application.DTOs.Notification;
using AutoMapper;
using FluentValidation;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IMapper _mapper;

    public NotificationsController(TmsDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotifications(
        Guid? userId,
        string? type,
        bool? isRead,
        int page = 1, 
        int pageSize = 10)
    {
        var query = _context.Notifications
            .Include(n => n.User)
            .AsNoTracking();

        if (userId.HasValue)
        {
            query = query.Where(n => n.UserId == userId.Value);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            if (Enum.TryParse<NotificationType>(type, true, out var typeEnum))
            {
                query = query.Where(n => n.Type == typeEnum);
            }
        }

        if (isRead.HasValue)
        {
            query = query.Where(n => n.IsRead == isRead.Value);
        }

        var totalCount = await query.CountAsync();
        var notifications = await query
            .OrderByDescending(n => n.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var notificationDtos = _mapper.Map<IEnumerable<NotificationDto>>(notifications);

        return Ok(new
        {
            data = notificationDtos,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NotificationDto>> GetNotification(Guid id)
    {
        var notification = await _context.Notifications
            .Include(n => n.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(n => n.Id == id);

        if (notification == null)
            return NotFound();

        var notificationDto = _mapper.Map<NotificationDto>(notification);
        return Ok(notificationDto);
    }

    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetUserNotifications(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAtUtc)
            .ToListAsync();

        var notificationDtos = _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        return Ok(notificationDtos);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCount(Guid userId)
    {
        var unreadCount = await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead);

        return Ok(new { unreadCount });
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto createNotificationDto)
    {
        var validator = new CreateNotificationValidator();
        var validationResult = await validator.ValidateAsync(createNotificationDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate user exists
        if (!await _context.Users.AnyAsync(u => u.Id == createNotificationDto.UserId))
        {
            return BadRequest($"User with ID {createNotificationDto.UserId} does not exist.");
        }

        var notification = _mapper.Map<Notification>(createNotificationDto);
        notification.CreatedAtUtc = DateTime.UtcNow;
        notification.UpdatedAtUtc = DateTime.UtcNow;

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var notificationDto = _mapper.Map<NotificationDto>(notification);
        return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notificationDto);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateNotification(Guid id, [FromBody] CreateNotificationDto updateNotificationDto)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        var validator = new CreateNotificationValidator();
        var validationResult = await validator.ValidateAsync(updateNotificationDto);
        
        if (!validationResult.IsValid)
        {
            foreach (var error in validationResult.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }
            return ValidationProblem(ModelState);
        }

        // Validate user exists
        if (!await _context.Users.AnyAsync(u => u.Id == updateNotificationDto.UserId))
        {
            return BadRequest($"User with ID {updateNotificationDto.UserId} does not exist.");
        }

        _mapper.Map(updateNotificationDto, notification);
        notification.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/mark-read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        notification.IsRead = true;
        notification.ReadAtUtc = DateTime.UtcNow;
        notification.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id:guid}/mark-unread")]
    public async Task<IActionResult> MarkAsUnread(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        notification.IsRead = false;
        notification.ReadAtUtc = null;
        notification.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAtUtc = DateTime.UtcNow;
            notification.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("user/{userId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUserNotifications(Guid userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId)
            .ToListAsync();

        _context.Notifications.RemoveRange(notifications);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetNotificationStatistics()
    {
        var totalNotifications = await _context.Notifications.CountAsync();
        var unreadNotifications = await _context.Notifications.CountAsync(n => !n.IsRead);
        var readNotifications = await _context.Notifications.CountAsync(n => n.IsRead);

        var notificationsByType = await _context.Notifications
            .GroupBy(n => n.Type)
            .Select(g => new
            {
                type = g.Key,
                count = g.Count()
            })
            .OrderByDescending(x => x.count)
            .ToListAsync();

        var statistics = new
        {
            totalNotifications,
            unreadNotifications,
            readNotifications,
            notificationsByType
        };

        return Ok(statistics);
    }
}

public class CreateNotificationValidator : AbstractValidator<CreateNotificationDto>
{
    public CreateNotificationValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Type).IsInEnum();
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Data).MaximumLength(2000);
    }
}
