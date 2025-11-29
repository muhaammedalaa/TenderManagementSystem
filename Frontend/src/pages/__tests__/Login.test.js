import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Mock the AuthContext
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false
  }),
  AuthProvider: ({ children }) => children
}));

// Mock the ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useCustomTheme: () => ({
    theme: 'light'
  }),
  ThemeProvider: ({ children }) => children
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLogin();

    expect(screen.getByText('auth.login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'auth.login' })).toBeInTheDocument();
  });

  it('displays default credentials', () => {
    renderLogin();

    const usernameInput = screen.getByDisplayValue('admin');
    const passwordInput = screen.getByDisplayValue('Admin123!');

    expect(usernameInput).toHaveValue('admin');
    expect(passwordInput).toHaveValue('Admin123!');
  });

  it('handles input changes', () => {
    renderLogin();

    const usernameInput = screen.getByDisplayValue('admin');
    const passwordInput = screen.getByDisplayValue('Admin123!');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(usernameInput).toHaveValue('testuser');
    expect(passwordInput).toHaveValue('testpass');
  });

  it('toggles password visibility', () => {
    renderLogin();

    const passwordInput = screen.getByDisplayValue('Admin123!');
    const toggleButton = screen.getByRole('button', { name: '' });

    expect(passwordInput).toHaveAttribute('type', 'password');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('handles remember me checkbox', () => {
    renderLogin();

    const rememberMeCheckbox = screen.getByRole('checkbox');
    expect(rememberMeCheckbox).toBeChecked();

    fireEvent.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('handles successful login with admin credentials', async () => {
    mockLogin.mockResolvedValue({ token: 'mock-token', user: { id: '1', username: 'admin' } });

    renderLogin();

    const loginButton = screen.getByRole('button', { name: 'auth.login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'admin',
        password: 'Admin123!'
      });
    });

    // Navigation is handled by the component, not tested here
  });

  it('handles successful login with mohamed.alaa credentials', async () => {
    mockLogin.mockResolvedValue({ token: 'mock-token', user: { id: '1', username: 'mohamed.alaa' } });

    renderLogin();

    const usernameInput = screen.getByDisplayValue('admin');
    const passwordInput = screen.getByDisplayValue('Admin123!');

    fireEvent.change(usernameInput, { target: { value: 'mohamed.alaa' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });

    const loginButton = screen.getByRole('button', { name: 'auth.login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'mohamed.alaa',
        password: 'admin123'
      });
    });

    // Navigation is handled by the component, not tested here
  });

  it('handles login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderLogin();

    const usernameInput = screen.getByDisplayValue('admin');
    const passwordInput = screen.getByDisplayValue('Admin123!');

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    const loginButton = screen.getByRole('button', { name: 'auth.login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('auth.loginError')).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderLogin();

    const loginButton = screen.getByRole('button', { name: 'auth.login' });
    fireEvent.click(loginButton);

    expect(screen.getByText('common.loading')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
    });
  });

  it('displays social login buttons', () => {
    renderLogin();

    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
  });

  it('displays company logo and branding', () => {
    renderLogin();

    expect(screen.getByText('UPF')).toBeInTheDocument();
    expect(screen.getByText('Find your perfect tender')).toBeInTheDocument();
  });

  it('handles form submission with enter key', () => {
    mockLogin.mockResolvedValue({ token: 'mock-token', user: { id: '1', username: 'admin' } });

    renderLogin();

    const form = screen.getByRole('button', { name: 'auth.login' }).closest('form');
    fireEvent.submit(form);

    expect(mockLogin).toHaveBeenCalled();
  });
});
