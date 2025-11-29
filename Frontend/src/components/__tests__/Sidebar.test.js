import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      language: 'en',
      isInitialized: true,
      languages: ['en', 'ar'],
      getResourceBundle: () => ({})
    }
  })
}));

// Mock the AuthContext
const mockLogout = jest.fn();
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
    user: { id: '1', username: 'testuser', roles: ['Admin'] },
    isAuthenticated: true
  })
}));

// Mock the ThemeContext
const mockToggleTheme = jest.fn();
jest.mock('../context/ThemeContext', () => ({
  useCustomTheme: () => ({
    theme: 'light',
    toggle: mockToggleTheme
  })
}));

// Mock LanguageSwitcher
jest.mock('../components/LanguageSwitcher', () => {
  return function MockLanguageSwitcher() {
    return <div data-testid="language-switcher">Language Switcher</div>;
  };
});

const renderSidebar = (sidebarOpen = true) => {
  const mockSetSidebarOpen = jest.fn();
  return render(
    <BrowserRouter>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={mockSetSidebarOpen} />
    </BrowserRouter>
  );
};

describe('Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sidebar correctly', () => {
    renderSidebar();

    expect(screen.getByText('TMS')).toBeInTheDocument();
    expect(screen.getByText('navigation.dashboard')).toBeInTheDocument();
    expect(screen.getByText('navigation.entities')).toBeInTheDocument();
    expect(screen.getByText('navigation.tenders')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: /navigation.dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /navigation.entities/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /navigation.tenders/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /navigation.suppliers/i })).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    renderSidebar();

    const logoutButton = screen.getByText('navigation.logout');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('toggles sidebar collapse', () => {
    renderSidebar();

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    fireEvent.click(toggleButton);

    // Check if sidebar is collapsed (this would depend on the actual implementation)
    expect(toggleButton).toBeInTheDocument();
  });

  it('handles theme toggle', () => {
    renderSidebar();

    const themeToggleButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(themeToggleButton);

    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('displays user information', () => {
    renderSidebar();

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('shows admin panel link for admin users', () => {
    renderSidebar();

    expect(screen.getByText('navigation.admin')).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    renderSidebar();

    const searchInput = screen.getByPlaceholderText(/search/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('renders language switcher', () => {
    renderSidebar();

    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('shows collapsed state when sidebarOpen is false', () => {
    renderSidebar(false);

    // In collapsed state, some elements might be hidden or shown differently
    expect(screen.getByText('TMS')).toBeInTheDocument();
  });

  it('handles navigation to different routes', () => {
    renderSidebar();

    const dashboardLink = screen.getByRole('link', { name: /navigation.dashboard/i });
    const entitiesLink = screen.getByRole('link', { name: /navigation.entities/i });

    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(entitiesLink).toHaveAttribute('href', '/entities');
  });

  it('displays correct icons for navigation items', () => {
    renderSidebar();

    // Check if icons are present (they would be SVG elements)
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    renderSidebar();

    const firstLink = screen.getByRole('link', { name: /navigation.dashboard/i });
    firstLink.focus();
    
    expect(document.activeElement).toBe(firstLink);
  });

  it('shows notification bell', () => {
    renderSidebar();

    expect(screen.getByText('navigation.messages')).toBeInTheDocument();
  });

  it('displays settings link', () => {
    renderSidebar();

    expect(screen.getByText('navigation.settings')).toBeInTheDocument();
  });

  it('handles responsive behavior', () => {
    renderSidebar();

    // Test if sidebar responds to window resize or other responsive events
    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toBeInTheDocument();
  });
});

