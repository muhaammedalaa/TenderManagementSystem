import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { authAPI } from '../../services/api';

// Mock the authAPI
jest.mock('../../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getCurrentUser: jest.fn()
  }
}));

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

// Test component to access auth context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{auth.isLoading.toString()}</div>
      <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</div>
      <div data-testid="token">{auth.token || 'null'}</div>
      <button onClick={() => auth.login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={() => auth.register({ username: 'test', email: 'test@test.com', password: 'test' })}>
        Register
      </button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should provide initial state correctly', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });
  });

  it('should handle successful login', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' };
    const mockToken = 'mock-token';
    
    authAPI.login.mockResolvedValue({
      data: { token: mockToken, user: mockUser }
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({ username: 'test', password: 'test' });
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });
  });

  it('should handle login failure', async () => {
    authAPI.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    });

    let authContext;
    const TestComponentWithAuth = () => {
      authContext = useAuth();
      return <div data-testid="test">Test</div>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponentWithAuth />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    await act(async () => {
      try {
        await authContext.login({ username: 'test', password: 'wrong' });
      } catch (error) {
        expect(error.message).toBe('Invalid credentials');
      }
    });
  });

  it('should handle missing credentials', async () => {
    let authContext;
    
    const TestComponentWithAuth = () => {
      authContext = useAuth();
      return <div data-testid="test">Test</div>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponentWithAuth />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    await act(async () => {
      try {
        await authContext.login({ username: '', password: '' });
      } catch (error) {
        expect(error.message).toBe('Username and password are required');
        expect(error.code).toBe('MISSING_CREDENTIALS');
      }
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@test.com' };
    const mockToken = 'mock-token';
    
    authAPI.register.mockResolvedValue({
      data: { token: mockToken, user: mockUser }
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(authAPI.register).toHaveBeenCalledWith({ 
        username: 'test', 
        email: 'test@test.com', 
        password: 'test' 
      });
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });
  });

  it('should handle registration failure', async () => {
    authAPI.register.mockRejectedValue({
      response: { data: { message: 'User already exists' } }
    });

    let authContext;
    const TestComponentWithAuth = () => {
      authContext = useAuth();
      return <div data-testid="test">Test</div>;
    };

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponentWithAuth />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    await act(async () => {
      try {
        await authContext.register({ username: 'test', email: 'test@test.com', password: 'test' });
      } catch (error) {
        expect(error.message).toBe('User already exists');
      }
    });
  });

  it('should handle logout', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    const mockToken = 'mock-token';
    
    // First login
    authAPI.login.mockResolvedValue({
      data: { token: mockToken, user: mockUser }
    });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Then logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });
  });

  it('should restore auth state from localStorage', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    const mockToken = 'mock-token';
    
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ token: mockToken, user: mockUser })
    );
    
    authAPI.getCurrentUser.mockResolvedValue({ data: mockUser });

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    });
  });

  it('should clear auth state when token is invalid', async () => {
    const mockUser = { id: '1', username: 'testuser' };
    const mockToken = 'invalid-token';
    
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify({ token: mockToken, user: mockUser })
    );
    
    authAPI.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tms_auth_state_v1');
    });
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');
    
    consoleSpy.mockRestore();
  });
});
