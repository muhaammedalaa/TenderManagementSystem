import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Tenders from '../Tenders';

// Mock the API module with proper responses
jest.mock('../../services/api', () => ({
  get: jest.fn()
}));

// Mock the AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', username: 'testuser', roles: ['Admin'] },
    isAuthenticated: true
  })
}));

describe('Tenders Page', () => {
  const mockApi = require('../../services/api');
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default API responses
    mockApi.get.mockImplementation((url) => {
      if (url.includes('/tenders')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: '1',
                title: 'Medical Equipment Supply',
                referenceNumber: 'TEN-2024-001',
                status: 0,
                category: 'Medical',
                estimatedBudget: 100000,
                openingDate: '2024-01-01',
                submissionDeadline: '2024-02-01',
                entityName: 'Test Entity'
              },
              {
                id: '2',
                title: 'IT Services',
                referenceNumber: 'TEN-2024-002',
                status: 1,
                category: 'IT',
                estimatedBudget: 50000,
                openingDate: '2024-01-15',
                submissionDeadline: '2024-02-15',
                entityName: 'Test Entity'
              }
            ]
          }
        });
      } else if (url.includes('/entities')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: '1',
                name: 'Test Entity',
                active: true
              }
            ]
          }
        });
      } else if (url.includes('/quotations')) {
        return Promise.resolve({
          data: {
            data: []
          }
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('renders tenders page correctly', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      expect(screen.getByText('Tenders Management')).toBeInTheDocument();
    });
  });

  it('displays search bar', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search tenders by title/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('shows filter button', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      const filterButton = screen.getByText(/filter/i);
      expect(filterButton).toBeInTheDocument();
    });
  });

  it('shows create tender button', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      const createButton = screen.getByText(/add tender/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  it('handles search input changes', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search tenders by title/i);
      fireEvent.change(searchInput, { target: { value: 'Medical' } });
      expect(searchInput.value).toBe('Medical');
    });
  });

  it('handles status filter changes', async () => {
    await act(async () => {
      render(<Tenders />);
    });

    await waitFor(() => {
      const statusSelect = screen.getByDisplayValue(/all status/i);
      fireEvent.change(statusSelect, { target: { value: 'open' } });
      expect(statusSelect.value).toBe('open');
    });
  });
});
