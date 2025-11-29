using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using TMS.Application.Mappings;
using TMS.Application.Interfaces;
using TMS.Application.Services;

namespace TMS.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var configuration = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
            // Add other profiles if you have them
        });

        services.AddSingleton<IMapper>(provider => configuration.CreateMapper());

        // FluentValidation
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Add Application Services
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IApprovalWorkflowService, ApprovalWorkflowService>();
        services.AddScoped<IFinancialService, FinancialService>();

        return services;
    }
}
