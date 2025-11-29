using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TMS.Infrastructure.Data;
using TMS.API;
using Xunit;

namespace TMS.Tests.Common
{
    public class IntegrationTestBase : WebApplicationFactory<Program>, IAsyncLifetime
    {
        protected TmsDbContext Context { get; private set; } = null!;

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove all database-related services
                var dbContextDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<TmsDbContext>));
                if (dbContextDescriptor != null)
                    services.Remove(dbContextDescriptor);

                var dbContextServiceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(TmsDbContext));
                if (dbContextServiceDescriptor != null)
                    services.Remove(dbContextServiceDescriptor);

                // Add in-memory database
                services.AddDbContext<TmsDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDatabase");
                });

                // Build the service provider
                var sp = services.BuildServiceProvider();

                // Create a scope to obtain a reference to the database context
                using var scope = sp.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<TmsDbContext>();
                var logger = scopedServices.GetRequiredService<ILogger<IntegrationTestBase>>();

                // Ensure the database is created
                db.Database.EnsureCreated();

                try
                {
                    // Seed the database with test data
                    SeedTestData(db);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the database with test data. Error: {Message}", ex.Message);
                }
            });
        }

        protected virtual void SeedTestData(TmsDbContext context)
        {
            // Override in derived classes to seed specific test data
        }

        public async Task InitializeAsync()
        {
            var scope = Services.CreateScope();
            Context = scope.ServiceProvider.GetRequiredService<TmsDbContext>();
            await Context.Database.EnsureCreatedAsync();
        }

        public new async Task DisposeAsync()
        {
            if (Context != null)
            {
                await Context.Database.EnsureDeletedAsync();
                await Context.DisposeAsync();
            }
        }
    }
}

