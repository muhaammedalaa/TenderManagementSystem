import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCustomTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  FaBars, FaHome, FaBuilding, FaFileContract, FaHandshake,
  FaChartLine, FaQuestionCircle, FaEnvelope, FaCog, FaSignOutAlt, 
  FaGavel, FaTachometerAlt, FaCubes, FaFileAlt, FaReceipt, 
  FaClipboardList, FaFileSignature, FaUniversity, FaLandmark, 
  FaTruckMoving, FaLifeRing, FaBell, FaSearch, FaChevronLeft, FaChevronRight,
  FaUserCog, FaUserShield, FaCheckCircle, FaDollarSign, FaFileInvoice, FaCreditCard
} from 'react-icons/fa';
import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs';
import '../styles/App.css';


const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggle: toggleTheme } = useCustomTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Debug translation
  console.log('Current language:', i18n.language);
  console.log('Translation test:', t('navigation.dashboard'));
  console.log('i18n ready:', i18n.isInitialized);
  
  // Test manual language change
  const testTranslation = () => {
    console.log('Testing translation...');
    console.log('EN dashboard:', i18n.t('navigation.dashboard', { lng: 'en' }));
    console.log('AR dashboard:', i18n.t('navigation.dashboard', { lng: 'ar' }));
    console.log('Current dashboard:', t('navigation.dashboard'));
  };
  console.log('Available languages:', i18n.languages);
  console.log('Current resources:', i18n.getResourceBundle(i18n.language, 'translation'));

  const toggleSidebar = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    setSidebarOpen(!newCollapsed);
  };

  const menuItems = [
    { path: '/', icon: 'dashboard', textKey: 'navigation.dashboard', fallback: 'Dashboard', badge: null },
    { path: '/Entities', icon: 'products', textKey: 'navigation.entities', fallback: 'Entities', badge: null },
    { path: '/tenders', icon: 'campaigns', textKey: 'navigation.tenders', fallback: 'Tenders', badge: null },
    { path: '/suppliers', icon: 'sales', textKey: 'navigation.suppliers', fallback: 'Suppliers', badge: '3' },
    { path: '/Quotations', icon: 'discount', textKey: 'navigation.quotations', fallback: 'Quotations', badge: null },
    { path: '/contracts', icon: 'payouts', textKey: 'navigation.contracts', fallback: 'Contracts', badge: null },
    { path: '/financial', icon: 'financial', textKey: 'navigation.financial', fallback: 'Financial Dashboard', badge: null },
    { path: '/invoices', icon: 'invoices', textKey: 'navigation.invoices', fallback: 'Invoices', badge: null },
    { path: '/payments', icon: 'payments', textKey: 'navigation.payments', fallback: 'Payments', badge: null },
    { path: '/financial-reports', icon: 'reports', textKey: 'navigation.financialReports', fallback: 'Financial Reports', badge: null },
    { path: '/assignmentorders', icon: 'chat', textKey: 'navigation.assignmentOrders', fallback: 'Assignment Orders', badge: '7' },
    { path: '/guarantee-letters', icon: 'settings', textKey: 'navigation.guaranteeLetters', fallback: 'Guarantee Letters', badge: null },
    { path: '/bank-guarantees', icon: 'new-product', textKey: 'navigation.bankGuarantees', fallback: 'Bank Guarantees', badge: null },
    { path: '/government-guarantees', icon: 'dashboard', textKey: 'navigation.governmentGuarantees', fallback: 'Government Guarantees', badge: null },
    { path: '/supplydeliveries', icon: 'products', textKey: 'navigation.supplyDeliveries', fallback: 'Supply Deliveries', badge: null },
    { path: '/reports', icon: 'campaigns', textKey: 'navigation.reports', fallback: 'Reports', badge: null },
    { path: '/approval-workflow', icon: 'approval', textKey: 'navigation.approvalWorkflow', fallback: 'Approval Workflow', badge: null },
    { path: '/support', icon: 'sales', textKey: 'navigation.support', fallback: 'Support', badge: null },
    { path: '/Notifications', icon: 'chat', textKey: 'navigation.messages', fallback: 'Messages', badge: '5' },
    { path: '/admin', icon: 'admin', textKey: 'navigation.admin', fallback: 'Admin Panel', badge: null },
    { path: '/settings', icon: 'settings', textKey: 'navigation.settings', fallback: 'Settings', badge: null },
  ];

  const getIconComponent = (iconName) => {
    const iconMap = {
      dashboard: <FaTachometerAlt />,
      products: <FaCubes />,
      campaigns: <FaFileAlt />,
      sales: <FaBuilding />,
      discount: <FaReceipt />,
      payouts: <FaFileContract />,
      financial: <FaDollarSign />,
      invoices: <FaFileInvoice />,
      payments: <FaCreditCard />,
      chat: <FaClipboardList />,
      settings: <FaFileSignature />,
      admin: <FaUserCog />,
      users: <FaUserShield />,
      'new-product': <FaUniversity />,
      approval: <FaCheckCircle />,
    };
    return iconMap[iconName] || <FaTachometerAlt />;
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      <div className="sidebar-content">
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <Link to="/" className="text-decoration-none" style={{ color: 'inherit' }}>
              <div className="logo">TMS</div>
              {!isCollapsed && <div className="logo-text">Tender Management</div>}
            </Link>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '40px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="sidebar-search">
            <div className="search-icon-sidebar">
              <FaSearch />
            </div>
            <input 
              type="text" 
              className="search-input" 
              placeholder={t('common.search') || 'Search'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-shortcut"></div>
          </div>
        )}

        {/* Language Switcher */}
        <div className="sidebar-language-switcher">
          <LanguageSwitcher />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <div key={index} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                data-tooltip={t(item.textKey) || item.fallback}
              >
                <div className={`nav-icon ${item.icon}`}>
                  {getIconComponent(item.icon)}
                </div>
                {!isCollapsed && <div className="nav-text">{t(item.textKey) || item.fallback}</div>}
                {item.badge && (
                  <div className="nav-badge">{item.badge}</div>
                )}
              </NavLink>
            </div>
          ))}

          {/* Theme Toggle */}
          <div className="nav-item">
            <div 
              className="nav-link" 
              onClick={toggleTheme}
              data-tooltip={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              <div className="nav-icon">
                {theme === 'dark' ? <BsFillSunFill /> : <BsFillMoonFill />}
              </div>
              {!isCollapsed && (
                <div className="nav-text">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <div className="nav-item">
            <div 
              className="nav-link" 
              onClick={handleLogout}
              data-tooltip={t('navigation.logout') || 'Logout'}
            >
              <div className="nav-icon">
                <FaSignOutAlt />
              </div>
              {!isCollapsed && <div className="nav-text">{t('navigation.logout') || 'Logout'}</div>}
            </div>
          </div>
        </nav>

        {/* User Profile */}
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">UPF</div>
            {!isCollapsed && (
              <>
                <div className="user-details">
                  <div className="user-name">UPF User</div>
                  <div className="user-role">System Administrator</div>
                </div>
                <div className="user-dropdown">
                  <FaChevronLeft />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;  