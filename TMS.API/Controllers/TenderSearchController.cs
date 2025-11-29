using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Common;
using TMS.Infrastructure.Services;

namespace TMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TenderSearchController : ControllerBase
    {
        private readonly TenderSearchService _tenderSearchService;

        public TenderSearchController(TenderSearchService tenderSearchService)
        {
            _tenderSearchService = tenderSearchService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchTenders([FromBody] SearchFilterDto searchDto)
        {
            try
            {
                var result = await _tenderSearchService.SearchTendersAsync(searchDto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while searching tenders", error = ex.Message });
            }
        }

        [HttpGet("suggestions")]
        public async Task<IActionResult> GetSearchSuggestions([FromQuery] string searchTerm, [FromQuery] int maxSuggestions = 10)
        {
            try
            {
                if (string.IsNullOrEmpty(searchTerm))
                    return BadRequest("Search term is required");

                var result = await _tenderSearchService.GetSuggestionsAsync(searchTerm, maxSuggestions);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while getting suggestions", error = ex.Message });
            }
        }

        [HttpGet("filter-options/{filterField}")]
        public async Task<IActionResult> GetFilterOptions(string filterField)
        {
            try
            {
                var options = await _tenderSearchService.GetFilterOptionsAsync(filterField);
                return Ok(options);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while getting filter options", error = ex.Message });
            }
        }

        [HttpGet("quick-filters")]
        public IActionResult GetQuickFilters()
        {
            var quickFilters = new
            {
                Status = new[]
                {
                    new { value = "Open", label = "Open", count = 0 },
                    new { value = "Closed", label = "Closed", count = 0 },
                    new { value = "Awarded", label = "Awarded", count = 0 },
                    new { value = "Cancelled", label = "Cancelled", count = 0 }
                },
                Category = new[]
                {
                    new { value = "Medical", label = "Medical", count = 0 },
                    new { value = "IT", label = "IT", count = 0 },
                    new { value = "Construction", label = "Construction", count = 0 },
                    new { value = "Services", label = "Services", count = 0 }
                },
                WinnerDeterminationMethod = new[]
                {
                    new { value = "LowestBid", label = "Lowest Bid", count = 0 },
                    new { value = "HighestScore", label = "Highest Score", count = 0 },
                    new { value = "BestValue", label = "Best Value", count = 0 }
                }
            };

            return Ok(quickFilters);
        }
    }
}
