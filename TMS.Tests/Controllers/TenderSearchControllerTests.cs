using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TMS.Application.DTOs.Common;
using TMS.Core.Entities;
using TMS.Tests.Common;
using TMS.Infrastructure.Data;
using Xunit;
using TMS.Core.Enums;

namespace TMS.Tests.Controllers
{
    public class TenderSearchControllerTests : IntegrationTestBase
    {
        private readonly HttpClient _client;
        private readonly Fixture _fixture;

        public TenderSearchControllerTests()
        {
            _client = CreateClient();
            _fixture = new Fixture();
        }

        protected override void SeedTestData(TmsDbContext context)
        {
            // Seed test entities
            var entity = _fixture.Create<Entity>();
            context.Entities.Add(entity);

            // Seed test tenders
            var tenders = new List<Tender>
            {
                _fixture.Build<Tender>()
                    .With(t => t.Title, "Medical Equipment Supply")
                    .With(t => t.Status, TenderStatus.Open)
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                _fixture.Build<Tender>()
                    .With(t => t.Title, "IT Services")
                    .With(t => t.Status, TenderStatus.Closed)
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            context.Tenders.AddRange(tenders);

            context.SaveChanges();
        }

        [Fact]
        public async Task SearchTenders_WithValidSearchDto_ShouldReturnOk()
        {
            // Arrange
            var searchDto = new SearchFilterDto
            {
                SearchTerm = "Medical",
                Page = 1,
                PageSize = 10
            };

            // Act
            var response = await _client.PostAsJsonAsync("/api/tendersearch/search", searchDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var content = await response.Content.ReadAsStringAsync();
            content.Should().NotBeNullOrEmpty();
        }

        [Fact]
        public async Task GetSearchSuggestions_WithValidSearchTerm_ShouldReturnSuggestions()
        {
            // Arrange
            var searchTerm = "Medical";

            // Act
            var response = await _client.GetAsync($"/api/tendersearch/suggestions?searchTerm={searchTerm}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var suggestions = await response.Content.ReadFromJsonAsync<List<string>>();
            suggestions.Should().NotBeNull();
            suggestions.Should().HaveCount(1);
            suggestions.First().Should().Contain("Medical");
        }

        [Fact]
        public async Task GetSearchSuggestions_WithEmptySearchTerm_ShouldReturnBadRequest()
        {
            // Act
            var response = await _client.GetAsync("/api/tendersearch/suggestions?searchTerm=");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task GetFilterOptions_WithValidField_ShouldReturnOptions()
        {
            // Act
            var response = await _client.GetAsync("/api/tendersearch/filter-options/status");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var options = await response.Content.ReadFromJsonAsync<List<string>>();
            options.Should().NotBeNull();
            options.Should().Contain("Open");
            options.Should().Contain("Closed");
        }

        [Fact]
        public async Task GetQuickFilters_ShouldReturnQuickFilters()
        {
            // Act
            var response = await _client.GetAsync("/api/tendersearch/quick-filters");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var quickFilters = await response.Content.ReadAsStringAsync();
            quickFilters.Should().NotBeNullOrEmpty();
            quickFilters.Should().Contain("Status");
            quickFilters.Should().Contain("Category");
        }
    }
}

