import axios from 'axios';
import { api, authAPI, seederAPI, usersAPI, suppliersAPI, tendersAPI, quotationsAPI, contractsAPI, entitiesAPI, bankGuaranteesAPI, governmentGuaranteesAPI, supportMattersAPI, notificationsAPI, supplyDeliveriesAPI, filesAPI } from '../api';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock window.location
delete window.location;
window.location = { href: '' };

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists', () => {
      const mockToken = 'valid.jwt.token';
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ token: mockToken, user: { id: '1' } })
      );

      const mockConfig = { headers: {} };
      const mockRequestInterceptor = mockedAxios.create.mock.calls[0][0];
      
      // Simulate the request interceptor
      const config = mockRequestInterceptor.interceptors.request.use.mock.calls[0][0];
      const result = config(mockConfig);

      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should not add Authorization header when token is invalid', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ token: 'invalid-token', user: { id: '1' } })
      );

      const mockConfig = { headers: {} };
      const mockRequestInterceptor = mockedAxios.create.mock.calls[0][0];
      
      const config = mockRequestInterceptor.interceptors.request.use.mock.calls[0][0];
      const result = config(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const mockConfig = { headers: {} };
      const mockRequestInterceptor = mockedAxios.create.mock.calls[0][0];
      
      const config = mockRequestInterceptor.interceptors.request.use.mock.calls[0][0];
      const result = config(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should not add Authorization header when no auth state exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const mockConfig = { headers: {} };
      const mockRequestInterceptor = mockedAxios.create.mock.calls[0][0];
      
      const config = mockRequestInterceptor.interceptors.request.use.mock.calls[0][0];
      const result = config(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should handle 401 error by clearing auth state and redirecting', () => {
      const mockError = {
        response: { status: 401 }
      };

      const mockResponseInterceptor = mockedAxios.create.mock.calls[0][0];
      const errorHandler = mockResponseInterceptor.interceptors.response.use.mock.calls[0][1];
      
      errorHandler(mockError);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tms_auth_state_v1');
      expect(window.location.href).toBe('/login');
    });

    it('should not handle non-401 errors', () => {
      const mockError = {
        response: { status: 500 }
      };

      const mockResponseInterceptor = mockedAxios.create.mock.calls[0][0];
      const errorHandler = mockResponseInterceptor.interceptors.response.use.mock.calls[0][1];
      
      const result = errorHandler(mockError);

      expect(localStorageMock.removeItem).not.toHaveBeenCalled();
      expect(window.location.href).toBe('');
      expect(result).rejects.toEqual(mockError);
    });
  });

  describe('Auth API', () => {
    it('should call login endpoint with correct parameters', async () => {
      const credentials = { username: 'test', password: 'password' };
      const mockResponse = { data: { token: 'token', user: { id: '1' } } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await authAPI.login(credentials);
      
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
    });

    it('should call register endpoint with correct parameters', async () => {
      const userData = { username: 'test', email: 'test@test.com', password: 'password' };
      const mockResponse = { data: { token: 'token', user: { id: '1' } } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await authAPI.register(userData);
      
      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call getCurrentUser endpoint', async () => {
      const mockResponse = { data: { id: '1', username: 'test' } };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await authAPI.getCurrentUser();
      
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Seeder API', () => {
    it('should call seed endpoint', async () => {
      const mockResponse = { data: { message: 'Database seeded successfully' } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await seederAPI.seed();
      
      expect(api.post).toHaveBeenCalledWith('/seeder/seed');
      expect(result).toEqual(mockResponse);
    });

    it('should call clear endpoint', async () => {
      const mockResponse = { data: { message: 'Database cleared successfully' } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await seederAPI.clear();
      
      expect(api.post).toHaveBeenCalledWith('/seeder/clear');
      expect(result).toEqual(mockResponse);
    });

    it('should call reset endpoint', async () => {
      const mockResponse = { data: { message: 'Database reset successfully' } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await seederAPI.reset();
      
      expect(api.post).toHaveBeenCalledWith('/seeder/reset');
      expect(result).toEqual(mockResponse);
    });

    it('should call getStats endpoint', async () => {
      const mockResponse = { data: { stats: { users: 10, tenders: 5 } } };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await seederAPI.getStats();
      
      expect(api.get).toHaveBeenCalledWith('/seeder/stats');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Users API', () => {
    it('should call getAll with params', async () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = { data: { users: [], total: 0 } };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await usersAPI.getAll(params);
      
      expect(api.get).toHaveBeenCalledWith('/users', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should call getById with correct id', async () => {
      const id = '123';
      const mockResponse = { data: { id, username: 'test' } };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await usersAPI.getById(id);
      
      expect(api.get).toHaveBeenCalledWith(`/users/${id}`);
      expect(result).toEqual(mockResponse);
    });

    it('should call create with user data', async () => {
      const userData = { username: 'test', email: 'test@test.com' };
      const mockResponse = { data: { id: '123', ...userData } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await usersAPI.create(userData);
      
      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call update with id and user data', async () => {
      const id = '123';
      const userData = { username: 'updated' };
      const mockResponse = { data: { id, ...userData } };
      
      api.put = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await usersAPI.update(id, userData);
      
      expect(api.put).toHaveBeenCalledWith(`/users/${id}`, userData);
      expect(result).toEqual(mockResponse);
    });

    it('should call delete with correct id', async () => {
      const id = '123';
      const mockResponse = { data: { message: 'User deleted' } };
      
      api.delete = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await usersAPI.delete(id);
      
      expect(api.delete).toHaveBeenCalledWith(`/users/${id}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Tenders API', () => {
    it('should call getAll with params', async () => {
      const params = { status: 'active' };
      const mockResponse = { data: { tenders: [], total: 0 } };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await tendersAPI.getAll(params);
      
      expect(api.get).toHaveBeenCalledWith('/tenders', { params });
      expect(result).toEqual(mockResponse);
    });

    it('should call create with tender data', async () => {
      const tenderData = { title: 'Test Tender', description: 'Test Description' };
      const mockResponse = { data: { id: '123', ...tenderData } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await tendersAPI.create(tenderData);
      
      expect(api.post).toHaveBeenCalledWith('/tenders', tenderData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Files API', () => {
    it('should call upload with file, entityType, and entityId', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const entityType = 'tender';
      const entityId = '123';
      const mockResponse = { data: { id: '456', filename: 'test.txt' } };
      
      api.post = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await filesAPI.upload(file, entityType, entityId);
      
      expect(api.post).toHaveBeenCalledWith('/files/upload', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call download with correct id', async () => {
      const id = '123';
      const mockResponse = { data: new Blob(['test']) };
      
      api.get = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await filesAPI.download(id);
      
      expect(api.get).toHaveBeenCalledWith(`/files/${id}/download`, { responseType: 'blob' });
      expect(result).toEqual(mockResponse);
    });

    it('should call delete with correct id', async () => {
      const id = '123';
      const mockResponse = { data: { message: 'File deleted' } };
      
      api.delete = jest.fn().mockResolvedValue(mockResponse);
      
      const result = await filesAPI.delete(id);
      
      expect(api.delete).toHaveBeenCalledWith(`/files/${id}`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('API Configuration', () => {
    it('should create axios instance with correct base URL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5000/api',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should use environment variable for API URL when available', () => {
      const originalEnv = process.env.REACT_APP_API_URL;
      process.env.REACT_APP_API_URL = 'https://api.example.com';
      
      // Re-import to test environment variable
      jest.resetModules();
      require('../api');
      
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Restore original environment
      process.env.REACT_APP_API_URL = originalEnv;
    });
  });
});
