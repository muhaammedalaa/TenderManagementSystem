using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Common;
using TMS.Infrastructure.Interfaces;
using TMS.Infrastructure.Models;

namespace TMS.Infrastructure.Services
{
    public abstract class BaseSearchService<T> : ISearchService<T> where T : class
    {
        protected readonly DbContext _context;
        protected readonly DbSet<T> _dbSet;

        protected BaseSearchService(DbContext context, DbSet<T> dbSet)
        {
            _context = context;
            _dbSet = dbSet;
        }

        public virtual async Task<PagedResult<T>> SearchAsync(SearchFilterDto searchDto)
        {
            var query = _dbSet.AsQueryable();

            // Apply search term
            if (!string.IsNullOrEmpty(searchDto.Search))
            {
                query = ApplySearchTerm(query, searchDto.Search);
            }

            // Apply status filter
            if (!string.IsNullOrEmpty(searchDto.Status) && searchDto.Status != "all")
            {
                query = ApplyStatusFilter(query, searchDto.Status);
            }

            // Apply date range filter
            if (searchDto.FromDate.HasValue || searchDto.ToDate.HasValue)
            {
                query = ApplyDateRangeFilter(query, searchDto.FromDate, searchDto.ToDate);
            }

            // Apply sorting
            query = ApplySorting(query, searchDto.SortBy, searchDto.SortDirection);

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var data = await query
                .Skip((searchDto.Page - 1) * searchDto.Limit)
                .Take(searchDto.Limit)
                .ToListAsync();

            return new PagedResult<T>
            {
                Data = data,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.Limit
            };
        }

        public virtual async Task<List<string>> GetSuggestionsAsync(string searchTerm, int maxSuggestions = 10)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return new List<string>();

            var suggestions = await GetSearchSuggestionsQuery(searchTerm, maxSuggestions).ToListAsync();
            return suggestions;
        }

        public virtual async Task<List<string>> GetFilterOptionsAsync(string filterField)
        {
            return await GetFilterOptionsQuery(filterField).ToListAsync();
        }

        // Abstract methods to be implemented by derived classes
        protected abstract IQueryable<T> ApplySearchTerm(IQueryable<T> query, string searchTerm);
        protected abstract IQueryable<T> ApplyStatusFilter(IQueryable<T> query, string status);
        protected abstract IQueryable<T> ApplyFilter(IQueryable<T> query, string filterField, object filterValue);
        protected abstract IQueryable<T> ApplyDateRangeFilter(IQueryable<T> query, DateTime? dateFrom, DateTime? dateTo);
        protected abstract IQueryable<T> ApplySorting(IQueryable<T> query, string? sortBy, string? sortDirection);
        protected abstract IQueryable<string> GetSearchSuggestionsQuery(string searchTerm, int maxSuggestions);
        protected abstract IQueryable<string> GetFilterOptionsQuery(string filterField);
    }
}
