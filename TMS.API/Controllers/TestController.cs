using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;
using TMS.Core.Interfaces;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    private readonly TmsDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public TestController(TmsDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    [HttpGet("health")]
    public async Task<IActionResult> HealthCheck()
    {
        try
        {
            // Test database connectivity
            var canConnect = await _context.Database.CanConnectAsync();
            var userCount = await _unitOfWork.Users.CountAsync();
            
            if (canConnect)
            {
                return Ok(new { 
                    Status = "Healthy", 
                    Database = "Connected",
                    UserCount = userCount,
                    Timestamp = DateTime.UtcNow
                });
            }
            else
            {
                return StatusCode(503, new { 
                    Status = "Unhealthy", 
                    Database = "Disconnected",
                    Timestamp = DateTime.UtcNow
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                Status = "Error", 
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpGet("database-info")]
    public async Task<IActionResult> GetDatabaseInfo()
    {
        try
        {
            var entityCounts = new
            {
                users = await _context.Users.CountAsync(),
                roles = await _context.Roles.CountAsync(),
                entities = await _context.Entities.CountAsync(),
                addresses = await _context.Addresses.CountAsync(),
                suppliers = await _context.Suppliers.CountAsync(),
                currencies = await _context.Currencies.CountAsync(),
                tenders = await _context.Tenders.CountAsync(),
                quotations = await _context.Quotations.CountAsync(),
                contracts = await _context.Contracts.CountAsync(),
                assignmentOrders = await _context.AssignmentOrders.CountAsync(),
                bankGuarantees = await _context.BankGuarantees.CountAsync(),
                governmentGuarantees = await _context.GovernmentGuarantees.CountAsync(),
                supplyDeliveries = await _context.SupplyDeliveries.CountAsync(),
                supportMatters = await _context.SupportMatters.CountAsync(),
                notifications = await _context.Notifications.CountAsync(),
                operationLogs = await _context.OperationLogs.CountAsync(),
                files = await _context.TmsFiles.CountAsync()
            };

            return Ok(new
            {
                Status = "Success",
                Database = "Connected",
                EntityCounts = entityCounts,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Error",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpGet("test-data")]
    public async Task<IActionResult> CreateTestData()
    {
        try
        {
            // Check if test data already exists
            var hasUsers = await _context.Users.AnyAsync();
            if (hasUsers)
            {
                return BadRequest("Test data already exists. Use /api/test/clear-data to remove existing data first.");
            }

            // Create test roles
            var adminRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Description = "Administrator role",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            var userRole = new Role
            {
                Id = Guid.NewGuid(),
                Name = "User",
                Description = "Regular user role",
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _context.Roles.AddRange(adminRole, userRole);

            // Create test users
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@tms.com",
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            var regularUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@tms.com",
                Username = "john.doe",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _context.Users.AddRange(adminUser, regularUser);

            // Create user roles
            _context.UserRoles.AddRange(
                new UserRole { UserId = adminUser.Id, RoleId = adminRole.Id, CreatedAtUtc = DateTime.UtcNow },
                new UserRole { UserId = regularUser.Id, RoleId = userRole.Id, CreatedAtUtc = DateTime.UtcNow }
            );

            // Create test currencies
            var usdCurrency = new Currency
            {
                Code = "USD",
                Name = "US Dollar",
                Symbol = "$",
                DecimalPlaces = 2,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            var eurCurrency = new Currency
            {
                Code = "EUR",
                Name = "Euro",
                Symbol = "€",
                DecimalPlaces = 2,
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _context.Currencies.AddRange(usdCurrency, eurCurrency);

            // Create test entity
            var testEntity = new Entity
            {
                Id = Guid.NewGuid(),
                Name = "Test Organization",
                Code = "TEST001",
                Description = "Test organization for development",
                IsActive = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _context.Entities.Add(testEntity);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Status = "Success",
                Message = "Test data created successfully",
                Data = new
                {
                    Users = 2,
                    Roles = 2,
                    Currencies = 2,
                    Entities = 1
                },
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Error",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpDelete("clear-data")]
    public async Task<IActionResult> ClearTestData()
    {
        try
        {
            // Clear all data in reverse dependency order
            _context.OperationLogs.RemoveRange(_context.OperationLogs);
            _context.Notifications.RemoveRange(_context.Notifications);
            _context.TmsFiles.RemoveRange(_context.TmsFiles);
            _context.SupportMatters.RemoveRange(_context.SupportMatters);
            _context.SupplyDeliveries.RemoveRange(_context.SupplyDeliveries);
            _context.GovernmentGuarantees.RemoveRange(_context.GovernmentGuarantees);
            _context.BankGuarantees.RemoveRange(_context.BankGuarantees);
            _context.Contracts.RemoveRange(_context.Contracts);
            _context.AssignmentOrders.RemoveRange(_context.AssignmentOrders);
            _context.Quotations.RemoveRange(_context.Quotations);
            _context.Tenders.RemoveRange(_context.Tenders);
            _context.Suppliers.RemoveRange(_context.Suppliers);
            _context.Addresses.RemoveRange(_context.Addresses);
            _context.Entities.RemoveRange(_context.Entities);
            _context.Currencies.RemoveRange(_context.Currencies);
            _context.UserRoles.RemoveRange(_context.UserRoles);
            _context.Users.RemoveRange(_context.Users);
            _context.Roles.RemoveRange(_context.Roles);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Status = "Success",
                Message = "All test data cleared successfully",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                Status = "Error",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
