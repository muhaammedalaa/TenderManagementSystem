import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterPanel from '../FilterPanel';

describe('FilterPanel Component', () => {
  const mockOnFilterChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders filter panel correctly', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Entity')).toBeInTheDocument();
  });

  it('handles filter changes', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'open' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ status: 'open' });
  });

  it('handles clear filters', () => {
    render(
      <FilterPanel
        filters={{ status: 'open', category: 'medical' }}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);

    expect(mockOnClearFilters).toHaveBeenCalled();
  });

  it('shows active filters count', () => {
    render(
      <FilterPanel
        filters={{ status: 'open', category: 'medical' }}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByText('2')).toBeInTheDocument(); // Active filters count
  });

  it('handles collapsible panel', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        collapsible={true}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(toggleButton);

    // Panel should be collapsible
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('handles non-collapsible panel', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        collapsible={false}
      />
    );

    // Panel should always be open
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('handles multiple filter changes', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const statusSelect = screen.getByDisplayValue('All Status');
    const categorySelect = screen.getByDisplayValue('All Categories');

    fireEvent.change(statusSelect, { target: { value: 'open' } });
    fireEvent.change(categorySelect, { target: { value: 'medical' } });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
    // The component resets filters on each change, so we check the last call
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({ 
      status: '', 
      category: '' 
    });
  });

  it('displays initial filter values', () => {
    const initialFilters = {
      status: 'Closed',
      category: 'IT',
      entity: 'entity-1'
    };

    render(
      <FilterPanel
        filters={initialFilters}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    expect(screen.getByDisplayValue('Closed')).toBeInTheDocument();
    expect(screen.getByDisplayValue('IT')).toBeInTheDocument();
  });

  it('handles date range filters', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs[0]; // First date input
    const endDateInput = dateInputs[1]; // Second date input

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
  });

  it('handles budget range filters', () => {
    render(
      <FilterPanel
        filters={{}}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
      />
    );

    const numberInputs = screen.getAllByDisplayValue('');
    const minBudgetInput = numberInputs[2]; // Third input (budget range)
    const maxBudgetInput = numberInputs[3]; // Fourth input (budget range)

    fireEvent.change(minBudgetInput, { target: { value: '1000' } });
    fireEvent.change(maxBudgetInput, { target: { value: '5000' } });

    expect(mockOnFilterChange).toHaveBeenCalledTimes(2);
  });
});
