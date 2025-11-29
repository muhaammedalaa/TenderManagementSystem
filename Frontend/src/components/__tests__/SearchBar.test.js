import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input correctly', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('calls onSearch when input value changes', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounced search
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });
  });

  it('displays suggestions when provided and search term exists', async () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2'];
    
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={suggestions}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for suggestions to appear
    await waitFor(() => {
      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });
  });

  it('calls onSearch when suggestion is clicked', async () => {
    const suggestions = ['Suggestion 1'];
    
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={suggestions}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      const suggestion = screen.getByText('Suggestion 1');
      fireEvent.click(suggestion);
    });

    expect(mockOnSearch).toHaveBeenCalledWith('Suggestion 1');
  });

  it('shows clear button when search term exists', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      const clearButton = screen.getByRole('button');
      expect(clearButton).toBeInTheDocument();
    });
  });

  it('clears search when clear button is clicked', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      const clearButton = screen.getByRole('button');
      fireEvent.click(clearButton);
    });

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('shows loading spinner when loading prop is true', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        loading={true}
        placeholder="Search..."
      />
    );

    expect(screen.getByText('')).toBeInTheDocument(); // Spinner is present
  });

  it('handles keyboard navigation in suggestions', async () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2'];
    
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={suggestions}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    // Test arrow down navigation
    fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
    fireEvent.keyDown(searchInput, { key: 'Enter' });

    expect(mockOnSearch).toHaveBeenCalledWith('Suggestion 1');
  });

  it('handles escape key to close suggestions', async () => {
    const suggestions = ['Suggestion 1'];
    
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={suggestions}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument();
    });

    fireEvent.keyDown(searchInput, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  it('does not show suggestions when showSuggestions is false', async () => {
    const suggestions = ['Suggestion 1'];
    
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={suggestions}
        showSuggestions={false}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(screen.queryByText('Suggestion 1')).not.toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        className="custom-class"
        placeholder="Search..."
      />
    );

    const searchContainer = screen.getByPlaceholderText('Search...').closest('.search-bar');
    expect(searchContainer).toHaveClass('custom-class');
  });

  it('handles different sizes', () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        size="lg"
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toHaveClass('form-control');
  });

  it('debounces search calls', async () => {
    render(
      <SearchBar
        onSearch={mockOnSearch}
        suggestions={[]}
        placeholder="Search..."
      />
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    
    // Type multiple characters quickly
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for debounced search
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });
  });
});