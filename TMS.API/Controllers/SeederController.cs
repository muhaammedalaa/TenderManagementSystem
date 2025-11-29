using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;

namespace TMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class SeederController : ControllerBase
{
    private readonly DataSeeder _dataSeeder;
    private readonly TmsDbContext _context;

    public SeederController(DataSeeder dataSeeder, TmsDbContext context)
    {
        _dataSeeder = dataSeeder;
        _context = context;
    }

    /// <summary>
    /// Seeds the database with test data for API testing
    /// </summary>
    [HttpPost("seed")]
    public async Task<IActionResult> SeedData()
    {
        try
        {
            await _dataSeeder.SeedAsync();
            
            return Ok(new
            {
                message = "Database seeded successfully",
                timestamp = DateTime.UtcNow,
                data = new
                {
                    users = await _context.Users.CountAsync(),
                    roles = await _context.Roles.CountAsync(),
                    entities = await _context.Entities.CountAsync(),
                    suppliers = await _context.Suppliers.CountAsync(),
                    tenders = await _context.Tenders.CountAsync(),
                    quotations = await _context.Quotations.CountAsync(),
                    contracts = await _context.Contracts.CountAsync(),
                    notifications = await _context.Notifications.CountAsync()
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error seeding database",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Clears all data from the database
    /// </summary>
    [HttpPost("clear")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ClearData()
    {
        try
        {
            await _dataSeeder.ClearAllDataAsync();
            
            return Ok(new
            {
                message = "Database cleared successfully",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error clearing database",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Resets the database (clears and reseeds)
    /// </summary>
    [HttpPost("reset")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ResetData()
    {
        try
        {
            await _dataSeeder.ClearAllDataAsync();
            await _dataSeeder.SeedAsync();
            
            return Ok(new
            {
                message = "Database reset successfully",
                timestamp = DateTime.UtcNow,
                data = new
                {
                    users = await _context.Users.CountAsync(),
                    roles = await _context.Roles.CountAsync(),
                    entities = await _context.Entities.CountAsync(),
                    suppliers = await _context.Suppliers.CountAsync(),
                    tenders = await _context.Tenders.CountAsync(),
                    quotations = await _context.Quotations.CountAsync(),
                    contracts = await _context.Contracts.CountAsync(),
                    notifications = await _context.Notifications.CountAsync()
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error resetting database",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets the current database statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetDatabaseStats()
    {
        try
        {
            var stats = new
            {
                users = await _context.Users.CountAsync(),
                roles = await _context.Roles.CountAsync(),
                userRoles = await _context.UserRoles.CountAsync(),
                entities = await _context.Entities.CountAsync(),
                addresses = await _context.Addresses.CountAsync(),
                suppliers = await _context.Suppliers.CountAsync(),
                currencies = await _context.Currencies.CountAsync(),
                tenders = await _context.Tenders.CountAsync(),
                quotations = await _context.Quotations.CountAsync(),
                assignmentOrders = await _context.AssignmentOrders.CountAsync(),
                contracts = await _context.Contracts.CountAsync(),
                supplyDeliveries = await _context.SupplyDeliveries.CountAsync(),
                bankGuarantees = await _context.BankGuarantees.CountAsync(),
                governmentGuarantees = await _context.GovernmentGuarantees.CountAsync(),
                supportMatters = await _context.SupportMatters.CountAsync(),
                notifications = await _context.Notifications.CountAsync(),
                operationLogs = await _context.OperationLogs.CountAsync(),
                files = await _context.TmsFiles.CountAsync(),
                timestamp = DateTime.UtcNow
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error getting database statistics",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets all currencies
    /// </summary>
    [HttpGet("currencies")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCurrencies()
    {
        try
        {
            var currencies = await _context.Currencies
                .Select(c => new { c.Id, c.Code, c.Name, c.Symbol, c.ExchangeRate, c.DecimalPlaces })
                .ToListAsync();
            
            return Ok(currencies);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Error retrieving currencies",
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Gets sample API endpoints for testing
    /// </summary>
    [HttpGet("endpoints")]
    public IActionResult GetTestEndpoints()
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        
        var endpoints = new
        {
            baseUrl,
            authentication = new
            {
                login = $"{baseUrl}/api/auth/login",
                register = $"{baseUrl}/api/auth/register"
            },
            users = new
            {
                list = $"{baseUrl}/api/users",
                get = $"{baseUrl}/api/users/{{id}}",
                create = $"{baseUrl}/api/users",
                update = $"{baseUrl}/api/users/{{id}}",
                delete = $"{baseUrl}/api/users/{{id}}"
            },
            entities = new
            {
                list = $"{baseUrl}/api/entities",
                get = $"{baseUrl}/api/entities/{{id}}",
                create = $"{baseUrl}/api/entities",
                update = $"{baseUrl}/api/entities/{{id}}"
            },
            suppliers = new
            {
                list = $"{baseUrl}/api/suppliers",
                get = $"{baseUrl}/api/suppliers/{{id}}",
                create = $"{baseUrl}/api/suppliers",
                update = $"{baseUrl}/api/suppliers/{{id}}"
            },
            tenders = new
            {
                list = $"{baseUrl}/api/tenders",
                get = $"{baseUrl}/api/tenders/{{id}}",
                create = $"{baseUrl}/api/tenders",
                update = $"{baseUrl}/api/tenders/{{id}}"
            },
            quotations = new
            {
                list = $"{baseUrl}/api/quotations",
                get = $"{baseUrl}/api/quotations/{{id}}",
                create = $"{baseUrl}/api/quotations",
                update = $"{baseUrl}/api/quotations/{{id}}"
            },
            contracts = new
            {
                list = $"{baseUrl}/api/contracts",
                get = $"{baseUrl}/api/contracts/{{id}}",
                create = $"{baseUrl}/api/contracts",
                update = $"{baseUrl}/api/contracts/{{id}}"
            },
            notifications = new
            {
                list = $"{baseUrl}/api/notifications",
                get = $"{baseUrl}/api/notifications/{{id}}",
                create = $"{baseUrl}/api/notifications"
            },
            dashboard = new
            {
                stats = $"{baseUrl}/api/dashboard/stats",
                guarantees = $"{baseUrl}/api/dashboard/guarantees"
            },
            seeder = new
            {
                seed = $"{baseUrl}/api/seeder/seed",
                clear = $"{baseUrl}/api/seeder/clear",
                reset = $"{baseUrl}/api/seeder/reset",
                stats = $"{baseUrl}/api/seeder/stats",
                endpoints = $"{baseUrl}/api/seeder/endpoints"
            }
        };

        return Ok(endpoints);
    }
}
