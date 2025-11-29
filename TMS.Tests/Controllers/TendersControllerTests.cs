using System.Net;
using System.Net.Http.Json;
using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using TMS.Application.DTOs.Tender;
using TMS.Core.Entities;
using TMS.Tests.Common;
using TMS.Infrastructure.Data;
using Xunit;
using TMS.Core.Enums;

namespace TMS.Tests.Controllers
{
    public class TendersControllerTests : IntegrationTestBase
    {
        private readonly HttpClient _client;
        private readonly Fixture _fixture;

        public TendersControllerTests()
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
                    .With(t => t.Title, "Test Tender 1")
                    .With(t => t.Status, TenderStatus.Open)
                    .With(t => t.EntityId, entity.Id)
                    .Create(),
                _fixture.Build<Tender>()
                    .With(t => t.Title, "Test Tender 2")
                    .With(t => t.Status, TenderStatus.Closed)
                    .With(t => t.EntityId, entity.Id)
                    .Create()
            };
            context.Tenders.AddRange(tenders);

            context.SaveChanges();
        }

        [Fact]
        public async Task GetTenders_ShouldReturnOk()
        {
            // Act
            var response = await _client.GetAsync("/api/tenders");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var tenders = await response.Content.ReadFromJsonAsync<List<TenderDto>>();
            tenders.Should().NotBeNull();
            tenders.Should().HaveCount(2);
        }

        [Fact]
        public async Task GetTender_WithValidId_ShouldReturnTender()
        {
            // Arrange
            var tender = Context.Tenders.First();

            // Act
            var response = await _client.GetAsync($"/api/tenders/{tender.Id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<TenderDto>();
            result.Should().NotBeNull();
            result.Id.Should().Be(tender.Id);
        }

        [Fact]
        public async Task GetTender_WithInvalidId_ShouldReturnNotFound()
        {
            // Arrange
            var invalidId = Guid.NewGuid();

            // Act
            var response = await _client.GetAsync($"/api/tenders/{invalidId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound);
        }

        [Fact]
        public async Task CreateTender_WithValidData_ShouldReturnCreated()
        {
            // Arrange
            var entity = Context.Entities.First();
            var createDto = _fixture.Build<CreateTenderDto>()
                .With(t => t.EntityId, entity.Id)
                .Create();

            // Act
            var response = await _client.PostAsJsonAsync("/api/tenders", createDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<TenderDto>();
            result.Should().NotBeNull();
            result.Title.Should().Be(createDto.Title);
        }

        [Fact]
        public async Task UpdateTender_WithValidData_ShouldReturnOk()
        {
            // Arrange
            var tender = Context.Tenders.First();
            var updateDto = _fixture.Build<CreateTenderDto>()
                .With(t => t.Title, "Updated Tender Title")
                .Create();

            // Act
            var response = await _client.PutAsJsonAsync($"/api/tenders/{tender.Id}", updateDto);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var result = await response.Content.ReadFromJsonAsync<TenderDto>();
            result.Should().NotBeNull();
            result.Title.Should().Be("Updated Tender Title");
        }

        [Fact]
        public async Task DeleteTender_WithValidId_ShouldReturnNoContent()
        {
            // Arrange
            var tender = Context.Tenders.First();

            // Act
            var response = await _client.DeleteAsync($"/api/tenders/{tender.Id}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NoContent);
        }
    }
}

