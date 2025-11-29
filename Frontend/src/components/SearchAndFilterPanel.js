import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';

const SearchAndFilterPanel = ({
  onSearch,
  onFilterChange,
  onClearFilters,
  searchPlaceholder = "Search...",
  filterConfig = {},
  showFilters = true,
  collapsibleFilters = true,
  className = ""
}) => {
  const [filters, setFilters] = useState({});

  // Handle search
  const handleSearch = (searchTerm) => {
    onSearch(searchTerm);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onClearFilters();
  };

  return (
    <div className={`search-and-filter-panel ${className}`}>
      <Row className="g-3">
        {/* Search Bar */}
        <Col md={showFilters ? 6 : 12}>
          <SearchBar
            placeholder={searchPlaceholder}
            onSearch={handleSearch}
            debounceMs={300}
          />
        </Col>

        {/* Filter Panel */}
        {showFilters && Object.keys(filterConfig).length > 0 && (
          <Col md={6}>
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filterConfig={filterConfig}
              collapsible={collapsibleFilters}
            />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SearchAndFilterPanel;
