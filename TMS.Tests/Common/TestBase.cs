using AutoFixture;
using AutoFixture.Xunit2;
using Microsoft.EntityFrameworkCore;
using TMS.Infrastructure.Data;
using TMS.Core.Entities;

namespace TMS.Tests.Common
{
    public abstract class TestBase
    {
        protected readonly IFixture Fixture;
        protected readonly TmsDbContext Context;

        protected TestBase()
        {
            Fixture = new Fixture();
            Fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
                .ForEach(b => Fixture.Behaviors.Remove(b));
            Fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            var options = new DbContextOptionsBuilder<TmsDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            Context = new TmsDbContext(options);
        }

        protected async Task<T> CreateEntityAsync<T>(T entity) where T : class
        {
            // Clear any existing tracking
            Context.ChangeTracker.Clear();
            
            Context.Set<T>().Add(entity);
            await Context.SaveChangesAsync();
            
            // Detach the entity to avoid tracking conflicts
            Context.Entry(entity).State = EntityState.Detached;
            
            return entity;
        }

        protected async Task<List<T>> CreateEntitiesAsync<T>(List<T> entities) where T : class
        {
            // Clear any existing tracking
            Context.ChangeTracker.Clear();
            
            Context.Set<T>().AddRange(entities);
            await Context.SaveChangesAsync();
            
            // Detach all entities to avoid tracking conflicts
            foreach (var entity in entities)
            {
                Context.Entry(entity).State = EntityState.Detached;
            }
            
            return entities;
        }

        protected async Task<T?> GetEntityAsync<T>(object id) where T : class
        {
            return await Context.Set<T>().FindAsync(id);
        }

        protected async Task<List<T>> GetAllEntitiesAsync<T>() where T : class
        {
            return await Context.Set<T>().ToListAsync();
        }

        protected async Task DeleteEntityAsync<T>(T entity) where T : class
        {
            Context.Set<T>().Remove(entity);
            await Context.SaveChangesAsync();
        }

        protected async Task ClearDatabaseAsync()
        {
            Context.RemoveRange(Context.ChangeTracker.Entries());
            await Context.SaveChangesAsync();
        }

        public void Dispose()
        {
            Context?.Dispose();
        }
    }
}

