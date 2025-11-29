using TMS.Application.DTOs.Common;
using TMS.Infrastructure.Models;

namespace TMS.Infrastructure.Interfaces
{
    public interface ISearchService<T> where T : class
    {
        Task<PagedResult<T>> SearchAsync(SearchFilterDto searchDto);
        Task<List<string>> GetSuggestionsAsync(string searchTerm, int maxSuggestions = 10);
        Task<List<string>> GetFilterOptionsAsync(string filterField);
    }
}
