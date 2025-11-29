using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TMS.Core.Interfaces;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Repositories;
using TMS.Infrastructure.Services;
using TMS.Infrastructure.Interfaces;
using TMS.Application.Interfaces;

namespace TMS.Infrastructure.Data.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Database
        services.AddDbContextPool<TmsDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection") + ";Pooling=true;Maximum Pool Size=100;"));

        // Repositories
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Data Seeder
        services.AddScoped<DataSeeder>();

        // Search Services
        services.AddScoped<ISearchService<TMS.Core.Entities.Tender>, TenderSearchService>();

        // Financial Services
        services.AddScoped<IFinancialService, FinancialService>();

        return services;
    }
}

