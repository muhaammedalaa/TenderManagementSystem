using Microsoft.EntityFrameworkCore;
using TMS.Application.DTOs.Common;
using TMS.Application.DTOs.Tender;
using TMS.Infrastructure.Models;
using TMS.Infrastructure.Data;

namespace TMS.Infrastructure.Services
{
    public class TenderSearchService : BaseSearchService<TMS.Core.Entities.Tender>
    {
        public TenderSearchService(TmsDbContext context) : base(context, context.Tenders)
        {
        }

        protected override IQueryable<TMS.Core.Entities.Tender> ApplySearchTerm(IQueryable<TMS.Core.Entities.Tender> query, string searchTerm)
        {
            return query.Where(t => 
                t.Title.Contains(searchTerm) ||
                t.ReferenceNumber.Contains(searchTerm) ||
                t.Description.Contains(searchTerm) ||
                t.Requirements.Contains(searchTerm));
        }

        protected override IQueryable<TMS.Core.Entities.Tender> ApplyStatusFilter(IQueryable<TMS.Core.Entities.Tender> query, string status)
        {
            if (Enum.TryParse<TMS.Core.Enums.TenderStatus>(status, true, out var tenderStatus))
            {
                return query.Where(t => t.Status == tenderStatus);
            }
            return query;
        }

        protected override IQueryable<TMS.Core.Entities.Tender> ApplyFilter(IQueryable<TMS.Core.Entities.Tender> query, string filterField, object filterValue)
        {
            return filterField.ToLower() switch
            {
                "status" => query.Where(t => t.Status.ToString() == filterValue.ToString()),
                "category" => query.Where(t => t.Category == filterValue.ToString()),
                "entityid" => query.Where(t => t.EntityId == Guid.Parse(filterValue.ToString()!)),
                "winnerdeterminationmethod" => query.Where(t => t.WinnerDeterminationMethod.ToString() == filterValue.ToString()),
                "estimatedbudgetmin" => query.Where(t => t.EstimatedBudget >= Convert.ToDecimal(filterValue)),
                "estimatedbudgetmax" => query.Where(t => t.EstimatedBudget <= Convert.ToDecimal(filterValue)),
                "isactive" => query.Where(t => t.IsActive == Convert.ToBoolean(filterValue)),
                _ => query
            };
        }

        protected override IQueryable<TMS.Core.Entities.Tender> ApplyDateRangeFilter(IQueryable<TMS.Core.Entities.Tender> query, DateTime? dateFrom, DateTime? dateTo)
        {
            if (dateFrom.HasValue)
                query = query.Where(t => t.CreatedAtUtc >= dateFrom.Value);

            if (dateTo.HasValue)
                query = query.Where(t => t.CreatedAtUtc <= dateTo.Value);

            return query;
        }

        protected override IQueryable<TMS.Core.Entities.Tender> ApplySorting(IQueryable<TMS.Core.Entities.Tender> query, string? sortBy, string? sortDirection)
        {
            var isDescending = sortDirection?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "title" => isDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
                "referencenumber" => isDescending ? query.OrderByDescending(t => t.ReferenceNumber) : query.OrderBy(t => t.ReferenceNumber),
                "status" => isDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
                "category" => isDescending ? query.OrderByDescending(t => t.Category) : query.OrderBy(t => t.Category),
                "estimatedbudget" => isDescending ? query.OrderByDescending(t => t.EstimatedBudget) : query.OrderBy(t => t.EstimatedBudget),
                "openingdate" => isDescending ? query.OrderByDescending(t => t.OpeningDate) : query.OrderBy(t => t.OpeningDate),
                "submissiondeadline" => isDescending ? query.OrderByDescending(t => t.SubmissionDeadline) : query.OrderBy(t => t.SubmissionDeadline),
                _ => query.OrderByDescending(t => t.CreatedAtUtc)
            };
        }

        protected override IQueryable<string> GetSearchSuggestionsQuery(string searchTerm, int maxSuggestions)
        {
            return _dbSet
                .Where(t => t.Title.Contains(searchTerm) || t.ReferenceNumber.Contains(searchTerm))
                .Select(t => t.Title)
                .Take(maxSuggestions)
                .Distinct();
        }

        protected override IQueryable<string> GetFilterOptionsQuery(string filterField)
        {
            return filterField.ToLower() switch
            {
                "status" => _dbSet.Select(t => t.Status.ToString()).Distinct(),
                "category" => _dbSet.Select(t => t.Category).Distinct(),
                "winnerdeterminationmethod" => _dbSet.Select(t => t.WinnerDeterminationMethod.ToString()).Distinct(),
                _ => _dbSet.Select(t => "").Distinct()
            };
        }

        public async Task<PagedResult<TenderDto>> SearchTendersAsync(SearchFilterDto searchDto)
        {
            var query = _dbSet
                .Include(t => t.Entity)
                .Include(t => t.WinnerQuotation)
                    .ThenInclude(q => q.Supplier)
                .AsQueryable();

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
            var tenders = await query
                .Skip((searchDto.Page - 1) * searchDto.Limit)
                .Take(searchDto.Limit)
                .ToListAsync();

            // Map to DTOs
            var tenderDtos = tenders.Select(t => new TenderDto
            {
                Id = t.Id,
                Title = t.Title,
                ReferenceNumber = t.ReferenceNumber,
                Description = t.Description,
                Requirements = t.Requirements,
                Category = t.Category,
                Status = t.Status,
                EstimatedBudget = t.EstimatedBudget,
                OpeningDate = t.OpeningDate,
                SubmissionDeadline = t.SubmissionDeadline,
                TermsConditions = t.TermsConditions,
                WinnerDeterminationMethod = t.WinnerDeterminationMethod,
                AutoDetermineWinner = t.AutoDetermineWinner,
                EntityId = t.EntityId,
                EntityName = t.Entity?.Name,
                CreatedAtUtc = t.CreatedAtUtc,
                CreatedBy = t.CreatedBy,
                UpdatedAtUtc = t.UpdatedAtUtc,
                UpdatedBy = t.UpdatedBy
            }).ToList();

            return new PagedResult<TenderDto>
            {
                Data = tenderDtos,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.Limit
            };
        }
    }
}
