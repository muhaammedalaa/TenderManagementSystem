using Microsoft.AspNetCore.Mvc;
using TMS.Application.DTOs.Common;

namespace TMS.API.Controllers
{
    [ApiController]
    public abstract class BaseSearchController : ControllerBase
    {
        protected IActionResult HandleSearchResult<T>(PagedResultDto<T> result)
        {
            return Ok(new
            {
                data = result.Data,
                pagination = new
                {
                    totalCount = result.TotalCount,
                    page = result.Page,
                    limit = result.Limit,
                    totalPages = result.TotalPages,
                    hasNextPage = result.HasNextPage,
                    hasPreviousPage = result.HasPreviousPage
                }
            });
        }

        protected SearchFilterDto GetSearchFilter()
        {
            return new SearchFilterDto
            {
                Search = Request.Query["search"].FirstOrDefault(),
                Status = Request.Query["status"].FirstOrDefault(),
                FromDate = DateTime.TryParse(Request.Query["fromDate"].FirstOrDefault(), out var fromDate) ? fromDate : null,
                ToDate = DateTime.TryParse(Request.Query["toDate"].FirstOrDefault(), out var toDate) ? toDate : null,
                Page = int.TryParse(Request.Query["page"].FirstOrDefault(), out var page) ? page : 1,
                Limit = int.TryParse(Request.Query["limit"].FirstOrDefault(), out var limit) ? limit : 10,
                SortBy = Request.Query["sortBy"].FirstOrDefault(),
                SortDirection = Request.Query["sortDirection"].FirstOrDefault() ?? "asc"
            };
        }
    }
}
