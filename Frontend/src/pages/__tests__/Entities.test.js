import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Entities from '../Entities';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API
jest.mock('../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

const mockApi = require('../../services/api');

const renderEntities = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Entities />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Entities Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockApi.get.mockImplementation((url) => {
      switch (url) {
        case '/entities':
          return Promise.resolve({
            data: {
              data: [
                { 
                  id: '1', 
                  name: 'Ministry of Health', 
                  active: true,
                  createdAt: '2024-01-01T00:00:00Z',
                  updatedAt: '2024-01-01T00:00:00Z'
                },
                { 
                  id: '2', 
                  name: 'Ministry of Education', 
                  active: false,
                  createdAt: '2024-01-02T00:00:00Z',
                  updatedAt: '2024-01-02T00:00:00Z'
                },
              ],
              totalCount: 2,
              page: 1,
              pageSize: 10,
              totalPages: 1
            }
          });
        default:
          return Promise.resolve({ data: { data: [], totalCount: 0 } });
      }
    });

    mockApi.post.mockResolvedValue({ data: { success: true } });
    mockApi.put.mockResolvedValue({ data: { success: true } });
    mockApi.delete.mockResolvedValue({ data: { success: true } });
  });

  it('renders entities page title', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Entities')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', async () => {
    await act(async () => {
      renderEntities();
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays entities list after loading', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Ministry of Health')).toBeInTheDocument();
      expect(screen.getByText('Ministry of Education')).toBeInTheDocument();
    });
  });

  it('displays search bar', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search entities/i)).toBeInTheDocument();
    });
  });

  it('displays filter panel', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  it('displays add entity button', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Add Entity')).toBeInTheDocument();
    });
  });

  it('opens add entity modal when add button is clicked', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      const addButton = screen.getByText('Add Entity');
      fireEvent.click(addButton);
      
      expect(screen.getByText('Add New Entity')).toBeInTheDocument();
    });
  });

  it('displays entity status correctly', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('displays upload files buttons', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      const uploadButtons = screen.getAllByText('Upload Files');
      expect(uploadButtons.length).toBeGreaterThan(0);
    });
  });

  it('handles search functionality', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search entities/i);
      fireEvent.change(searchInput, { target: { value: 'Health' } });
      
      expect(searchInput.value).toBe('Health');
    });
  });

  it('handles filter functionality', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      const filterButton = screen.getByText('Filters');
      fireEvent.click(filterButton);
      
      expect(screen.getByText('Active Status')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockApi.get.mockRejectedValue(new Error('API Error'));

    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('Entities')).toBeInTheDocument();
    });
  });

  it('displays no entities message when no data', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: [],
        totalCount: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      }
    });

    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('No Entities Found')).toBeInTheDocument();
    });
  });

  it('displays pagination controls', async () => {
    await act(async () => {
      renderEntities();
    });

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

