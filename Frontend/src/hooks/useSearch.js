import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSearch = (endpoint, initialFilters = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build search parameters
  const buildSearchParams = useCallback(() => {
    const params = {
      searchTerm: searchTerm || undefined,
      filters: Object.keys(filters).reduce((acc, key) => {
        if (filters[key] && filters[key] !== '') {
          acc[key] = filters[key];
        }
        return acc;
      }, {}),
      sortBy,
      sortDirection,
      page,
      pageSize
    };

    // Remove undefined values
    return Object.keys(params).reduce((acc, key) => {
      if (params[key] !== undefined) {
        acc[key] = params[key];
      }
      return acc;
    }, {});
  }, [searchTerm, filters, sortBy, sortDirection, page, pageSize]);

  // Search function
  const searchFunction = useCallback(async () => {
    const searchParams = buildSearchParams();
    const response = await api.post(`${endpoint}/search`, searchParams);
    return response.data;
  }, [endpoint, buildSearchParams]);

  // State for data management
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Search function
  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    
    try {
      const result = await searchFunction();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [searchFunction]);

  // Refetch function
  const refetch = useCallback(() => {
    performSearch();
  }, [performSearch]);

  // Auto-search when parameters change
  useEffect(() => {
    performSearch();
  }, [performSearch]);

  // Get suggestions
  const getSuggestions = useCallback(async (term) => {
    if (!term || term.length < 2) return [];
    try {
      const response = await api.get(`${endpoint}/suggestions`, {
        params: { searchTerm: term, maxSuggestions: 10 }
      });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }, [endpoint]);

  // Get filter options
  const getFilterOptions = useCallback(async (filterField) => {
    try {
      const response = await api.get(`${endpoint}/filter-options/${filterField}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting filter options:', error);
      return [];
    }
  }, [endpoint]);

  // Handle search term change
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setPage(1); // Reset to first page when searching
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filtering
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((field, direction) => {
    setSortBy(field);
    setSortDirection(direction);
    setPage(1); // Reset to first page when sorting
  }, []);

  // Handle page change
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm('');
    setPage(1);
  }, [initialFilters]);

  // Reset to default state
  const reset = useCallback(() => {
    setSearchTerm('');
    setFilters(initialFilters);
    setSortBy('createdAt');
    setSortDirection('desc');
    setPage(1);
    setPageSize(10);
  }, [initialFilters]);

  return {
    // Data
    data: data?.data || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.page || 1,
    pageSize: data?.pageSize || 10,
    hasNextPage: data?.hasNextPage || false,
    hasPreviousPage: data?.hasPreviousPage || false,

    // State
    searchTerm,
    filters,
    sortBy,
    sortDirection,
    page,
    pageSize,

    // Loading states
    isLoading,
    isFetching,
    error,

    // Actions
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handlePageSizeChange,
    clearFilters,
    reset,
    refetch,

    // Utility functions
    getSuggestions,
    getFilterOptions
  };
};

export default useSearch;
