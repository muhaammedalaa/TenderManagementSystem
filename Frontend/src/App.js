import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import SuppliersPage from './pages/Suppliers';
import Tenders from './pages/Tenders'; 
import TenderSelection from './pages/TenderSelection';
import QuotationsPage from './pages/Quotations';
import NotificationsPage from './pages/Notifications';
import Entities from './pages/Entities';
import ReportsPage from './pages/Reports';
import SupportPage from './pages/Support';
import SupplyDeliveriesPage from './pages/SupplyDeliveries';
import GuaranteeLettersPage from './pages/GuaranteeLetters';
import BankGuaranteesPage from './pages/BankGuarantees';
import GovernmentGuaranteesPage from './pages/GovernmentGuarantees';
import ContractsPage from './pages/Contracts';
import AssignmentOrdersPage from './pages/AssignmentOrders';
import SettingsPage from './pages/Settings';
import TenderDetailsPage from './pages/TenderDetails';
import AdminPanel from './pages/AdminPanel';
import ApprovalWorkflowPage from './pages/ApprovalWorkflow';
import FinancialDashboard from './pages/FinancialDashboard';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import FinancialReports from './pages/FinancialReports';

import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { CustomThemeProvider } from './context/ThemeContext';   // ✅ استدعاء CustomThemeProvider
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { useCustomTheme } from './context/ThemeContext'; // Import useCustomTheme
import './styles/App.css';
import './index.css';





// ================= Protected Route ==================
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

// ================= Layout with Sidebar ==================
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme } = useCustomTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content flex-grow-1">
        <Container fluid className="py-3">
          {children}
        </Container>
      </div>
    </div>
  );
};

// ================= Main App ==================
function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <CustomThemeProvider>   {/* ✅ ضفنا CustomThemeProvider هنا */}
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/suppliers"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SuppliersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenders"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Tenders />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tender-selection"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TenderSelection />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/quotations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <QuotationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <NotificationsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/entities"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Entities />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ReportsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
             <Route
              path="/supplydeliveries"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SupplyDeliveriesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SupportPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/guarantee-letters"
              element={
                <ProtectedRoute >
                  <AppLayout>
                    <GuaranteeLettersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/bank-guarantees"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <BankGuaranteesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/government-guarantees"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GovernmentGuaranteesPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/contracts"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ContractsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/financial"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FinancialDashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Invoices />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Payments />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/financial-reports"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <FinancialReports />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assignmentorders"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AssignmentOrdersPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SettingsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/tenders/:id"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <TenderDetailsPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AdminPanel />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/approval-workflow"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <ApprovalWorkflowPage />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

           

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CustomThemeProvider>
      </UIProvider>
    </AuthProvider>
  );
}

export default App;
