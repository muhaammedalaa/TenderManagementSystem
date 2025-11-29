using AutoFixture;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Common;
using TMS.Core.Entities;
using TMS.Infrastructure.Data;
using TMS.Infrastructure.Services;
using TMS.Tests.Common;
using Xunit;
using TMS.Core.Enums;

namespace TMS.Tests.Services
{
    public class TenderSearchServiceTests : TestBase
    {
        private readonly TenderSearchService _service;

        public TenderSearchServiceTests()
        {
            _service = new TenderSearchService(Context);
        }

        [Fact]
        public async Task SearchAsync_WithSearchTerm_ShouldReturnMatchingTenders()
        {
            // Arrange
            var entity = Fixture.Create<Entity>();
            await CreateEntityAsync(entity);

            var tenders = new List<Tender>
            {
                Fixture.Build<Tender>()
                    .With(t => t.Title, "Medical Equipment Supply")
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                Fixture.Build<Tender>()
                    .With(t => t.Title, "IT Services")
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            await CreateEntitiesAsync(tenders);

            var searchDto = new SearchFilterDto
            {
                SearchTerm = "Medical",
                Page = 1,
                PageSize = 10
            };

            // Act
            var result = await _service.SearchAsync(searchDto);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(1);
            result.Data.First().Title.Should().Contain("Medical");
        }

        [Fact]
        public async Task SearchAsync_WithStatusFilter_ShouldReturnFilteredTenders()
        {
            // Arrange
            var entity = Fixture.Create<Entity>();
            await CreateEntityAsync(entity);

            var tenders = new List<Tender>
            {
                Fixture.Build<Tender>()
                    .With(t => t.Status, TenderStatus.Open)
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                Fixture.Build<Tender>()
                    .With(t => t.Status, TenderStatus.Closed)
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            await CreateEntitiesAsync(tenders);

            var searchDto = new SearchFilterDto
            {
                Filters = new Dictionary<string, object> { { "status", "Open" } },
                Page = 1,
                PageSize = 10
            };

            // Act
            var result = await _service.SearchAsync(searchDto);

            // Assert
            result.Should().NotBeNull();
            result.Data.Should().HaveCount(1);
            result.Data.First().Status.Should().Be(TenderStatus.Open);
        }

        [Fact]
        public async Task GetSuggestionsAsync_WithSearchTerm_ShouldReturnSuggestions()
        {
            // Arrange
            var entity = Fixture.Create<Entity>();
            await CreateEntityAsync(entity);

            var tenders = new List<Tender>
            {
                Fixture.Build<Tender>()
                    .With(t => t.Title, "Medical Equipment Supply")
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                Fixture.Build<Tender>()
                    .With(t => t.Title, "Medical Services")
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            await CreateEntitiesAsync(tenders);

            // Act
            var result = await _service.GetSuggestionsAsync("Medical");

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().AllSatisfy(s => s.Should().Contain("Medical"));
        }

        [Fact]
        public async Task GetFilterOptionsAsync_WithStatusField_ShouldReturnStatusOptions()
        {
            // Arrange
            var entity = Fixture.Create<Entity>();
            await CreateEntityAsync(entity);

            var tenders = new List<Tender>
            {
                Fixture.Build<Tender>()
                    .With(t => t.Status, TenderStatus.Open)
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                Fixture.Build<Tender>()
                    .With(t => t.Status, TenderStatus.Closed)
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            await CreateEntitiesAsync(tenders);

            // Act
            var result = await _service.GetFilterOptionsAsync("status");

            // Assert
            result.Should().NotBeNull();
            result.Should().Contain("Open");
            result.Should().Contain("Closed");
        }
    }
}

