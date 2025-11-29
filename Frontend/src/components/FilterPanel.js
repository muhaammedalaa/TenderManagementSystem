import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Collapse, Badge } from 'react-bootstrap';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const FilterPanel = ({ 
  filters = {}, 
  onFilterChange, 
  onClearFilters, 
  collapsible = true,
  className = "",
  filterConfig = {} // Configuration for different filter types
}) => {
  const [isOpen, setIsOpen] = useState(!collapsible);
  const [localFilters, setLocalFilters] = useState(filters);

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...localFilters, [filterKey]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // Render filter based on configuration
  const renderFilter = (filterKey, config) => {
    const value = localFilters[filterKey] || '';
    
    switch (config.type) {
      case 'select':
        return (
          <Form.Select
            value={value}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
          >
            <option value="">{config.placeholder || `All ${config.label}`}</option>
            {config.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        );
      
      case 'date':
        return (
          <Form.Control
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            placeholder={config.placeholder}
          />
        );
      
      case 'number':
        return (
          <Form.Control
            type="number"
            value={value}
            onChange={(e) => handleFilterChange(filterKey, e.target.value)}
            placeholder={config.placeholder}
            min={config.min}
            max={config.max}
          />
        );
      
      default:
        return null;
    }
  };

  const filterContent = (
    <Card.Body>
      <Row>
        {Object.entries(filterConfig).map(([filterKey, config]) => (
          <Col key={filterKey} md={config.colSize || 3}>
            <Form.Group>
              <Form.Label>{config.label}</Form.Label>
              {config.type === 'dateRange' ? (
                <Row>
                  <Col>
                    <Form.Control
                      type="date"
                      value={localFilters[`${filterKey}From`] || ''}
                      onChange={(e) => handleFilterChange(`${filterKey}From`, e.target.value)}
                      placeholder="From Date"
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="date"
                      value={localFilters[`${filterKey}To`] || ''}
                      onChange={(e) => handleFilterChange(`${filterKey}To`, e.target.value)}
                      placeholder="To Date"
                    />
                  </Col>
                </Row>
              ) : config.type === 'numberRange' ? (
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder={config.minPlaceholder || "Min"}
                      value={localFilters[`${filterKey}Min`] || ''}
                      onChange={(e) => handleFilterChange(`${filterKey}Min`, e.target.value)}
                      min={config.min}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder={config.maxPlaceholder || "Max"}
                      value={localFilters[`${filterKey}Max`] || ''}
                      onChange={(e) => handleFilterChange(`${filterKey}Max`, e.target.value)}
                      max={config.max}
                    />
                  </Col>
                </Row>
              ) : (
                renderFilter(filterKey, config)
              )}
            </Form.Group>
          </Col>
        ))}
      </Row>

      {/* Action Buttons */}
      {activeFiltersCount > 0 && (
        <Row className="mt-3">
          <Col className="d-flex justify-content-end">
            <Button
              variant="outline-danger"
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
            >
              <FaTimes className="me-1" />
              Clear Filters
            </Button>
          </Col>
        </Row>
      )}
    </Card.Body>
  );

  return (
    <Card className={`filter-panel ${className}`}>
      <Card.Header 
        className="d-flex justify-content-between align-items-center"
        style={{ cursor: collapsible ? 'pointer' : 'default' }}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge bg="primary" className="ms-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {collapsible && (
          <div>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        )}
      </Card.Header>
      
      <Collapse in={isOpen}>
        {filterContent}
      </Collapse>
    </Card>
  );
};

export default FilterPanel;
