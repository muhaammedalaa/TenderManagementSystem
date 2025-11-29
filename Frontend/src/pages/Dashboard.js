import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Table, Badge, Alert, ProgressBar, Spinner, Button } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { tendersAPI, quotationsAPI, suppliersAPI, bankGuaranteesAPI, governmentGuaranteesAPI, contractsAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import { FaTrophy, FaExclamationTriangle, FaClock, FaDollarSign, FaChartLine, FaUsers, FaShieldAlt } from 'react-icons/fa';
import handleApiError from '../services/apiErrorHandler';
import { useAuth } from '../context/AuthContext';
import '../index.css';


ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement);

// Helper function to get CSS variables
const getCSSVariable = (variableName, fallback = '#000000') => {
  // Try to get from dashboard element first
  const dashboardElement = document.querySelector('.dashboard');
  if (dashboardElement) {
    const computedStyle = getComputedStyle(dashboardElement);
    const value = computedStyle.getPropertyValue(variableName).trim();
    if (value) return value;
  }
  
  // Fallback to root element
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(variableName).trim() || fallback;
};

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const StatCard = ({ title, value, variant = 'primary', icon, subtitle, trend }) => (
  <div className="stat-card">
    <div className="stat-icon">
      {icon}
    </div>
    <div className="stat-number">{value}</div>
    <div className="stat-label">{title}</div>
    {subtitle && <div className="stat-subtitle">{subtitle}</div>}
    {trend && (
      <div className={`small ${trend > 0 ? 'text-success' : trend < 0 ? 'text-danger' : 'text-muted'}`}>
        <i className={`fas fa-arrow-${trend > 0 ? 'up' : trend < 0 ? 'down' : 'right'}`}></i>
        {Math.abs(trend)}%
      </div>
    )}
  </div>
);

const KPIChart = ({ data, type = 'doughnut', title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        color: 'var(--text-color)',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: type === 'bar' || type === 'line' ? {
      x: {
        ticks: {
          color: 'var(--text-color)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      },
      y: {
        ticks: {
          color: 'var(--text-color)'
        },
        grid: {
          color: 'var(--border-color)'
        }
      }
    } : {}
  };

  const ChartComponent = type === 'pie' ? Pie : type === 'bar' ? Bar : type === 'line' ? Line : Doughnut;
  
  return (
    <div className="chart-container" style={{ height: `${height}px` }}>
      <ChartComponent data={data} options={options} />
    </div>
  );
};

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  
  // State for all dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Basic stats
  const [basicStats, setBasicStats] = useState({
    totalTenders: 0,
    totalQuotations: 0,
    totalSuppliers: 0,
    totalGuarantees: 0,
    activeGuarantees: 0,
    expiredGuarantees: 0
  });

  // Tender status distribution
  const [tenderStatusData, setTenderStatusData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 2
    }]
  });

  // Quotations per tender
  const [quotationsPerTender, setQuotationsPerTender] = useState({
    labels: [],
    datasets: [{
      label: t('dashboard.quotationsPerTender'),
      data: [],
      backgroundColor: '#36A2EB',
      borderColor: '#36A2EB',
      borderWidth: 1
    }]
  });

  // Top suppliers by participation
  const [topSuppliers, setTopSuppliers] = useState([]);

  // Profit analysis
  const [profitAnalysis, setProfitAnalysis] = useState({
    labels: [],
    datasets: [{
      label: t('dashboard.averageProfit'),
      data: [],
      backgroundColor: '#4BC0C0',
      borderColor: '#4BC0C0',
      borderWidth: 2,
      fill: false
    }]
  });

  // Deadline alerts
  const [deadlineAlerts, setDeadlineAlerts] = useState({
    closingSoon: [],
    expiringSoon: []
  });

  // Recent activity
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if user is authenticated
      if (!isAuthenticated) {
        console.log('⚠️ User not authenticated, skipping data fetch');
        setLoading(false);
        setError('Please log in to view dashboard data');
        return;
      }

      setLoading(true);
      setError('');
      try {
        console.log('🔄 Fetching dashboard data for user:', user?.username);
        
        // Fetch all data with proper error handling
        console.log('🔄 Starting API calls...');
        
        const [tendersResponse, quotationsResponse, suppliersResponse, bankGuaranteesResponse, governmentGuaranteesResponse] = await Promise.all([
          tendersAPI.getAll({ pageSize: 1000 }).catch(err => {
            console.error('❌ Failed to fetch tenders:', err);
            return { data: { items: [] } };
          }),
          quotationsAPI.getAll({ pageSize: 1000 }).catch(err => {
            console.error('❌ Failed to fetch quotations:', err);
            return { data: { items: [] } };
          }),
          suppliersAPI.getAll({ pageSize: 1000 }).catch(err => {
            console.error('❌ Failed to fetch suppliers:', err);
            return { data: { items: [] } };
          }),
          bankGuaranteesAPI.getAll({ pageSize: 1000 }).catch(err => {
            console.error('❌ Failed to fetch bank guarantees:', err);
            return { data: { items: [] } };
          }),
          governmentGuaranteesAPI.getAll({ pageSize: 1000 }).catch(err => {
            console.error('❌ Failed to fetch government guarantees:', err);
            return { data: { items: [] } };
          })
        ]);

        // Log API responses for debugging
        console.log('📊 API Responses:', {
          tenders: tendersResponse.data,
          quotations: quotationsResponse.data,
          suppliers: suppliersResponse.data,
          bankGuarantees: bankGuaranteesResponse.data,
          governmentGuarantees: governmentGuaranteesResponse.data
        });

        // Log detailed response structure
        console.log('🔍 Detailed API Response Analysis:');
        console.log('Tenders Response Structure:', {
          status: tendersResponse.status,
          data: tendersResponse.data,
          dataType: typeof tendersResponse.data,
          isArray: Array.isArray(tendersResponse.data),
          hasItems: tendersResponse.data?.items ? 'Yes' : 'No',
          itemsLength: tendersResponse.data?.items?.length || 'N/A'
        });

        // Extract data with proper fallbacks - API returns data in data.data format
        const tenders = Array.isArray(tendersResponse.data?.data) ? tendersResponse.data.data : 
                       Array.isArray(tendersResponse.data?.items) ? tendersResponse.data.items : 
                       Array.isArray(tendersResponse.data) ? tendersResponse.data : [];
        const quotations = Array.isArray(quotationsResponse.data?.data) ? quotationsResponse.data.data : 
                          Array.isArray(quotationsResponse.data?.items) ? quotationsResponse.data.items : 
                          Array.isArray(quotationsResponse.data) ? quotationsResponse.data : [];
        const suppliers = Array.isArray(suppliersResponse.data?.data) ? suppliersResponse.data.data : 
                         Array.isArray(suppliersResponse.data?.items) ? suppliersResponse.data.items : 
                         Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [];
        const bankGuarantees = Array.isArray(bankGuaranteesResponse.data?.data) ? bankGuaranteesResponse.data.data : 
                              Array.isArray(bankGuaranteesResponse.data?.items) ? bankGuaranteesResponse.data.items : 
                              Array.isArray(bankGuaranteesResponse.data) ? bankGuaranteesResponse.data : [];
        const governmentGuarantees = Array.isArray(governmentGuaranteesResponse.data?.data) ? governmentGuaranteesResponse.data.data : 
                                    Array.isArray(governmentGuaranteesResponse.data?.items) ? governmentGuaranteesResponse.data.items : 
                                    Array.isArray(governmentGuaranteesResponse.data) ? governmentGuaranteesResponse.data : [];

        console.log('📊 Data fetched:', {
          tenders: tenders.length,
          quotations: quotations.length,
          suppliers: suppliers.length,
          bankGuarantees: bankGuarantees.length,
          governmentGuarantees: governmentGuarantees.length
        });

        // 1. Basic Statistics
        const totalGuarantees = bankGuarantees.length + governmentGuarantees.length;
        const activeGuarantees = [...bankGuarantees, ...governmentGuarantees].filter(g => 
          g.status === 'Active' || g.status === 'active' || g.status === 'ACTIVE'
        ).length;
        const expiredGuarantees = [...bankGuarantees, ...governmentGuarantees].filter(g => 
          g.status === 'Expired' || g.status === 'expired' || g.status === 'EXPIRED'
        ).length;

        // Calculate total amounts and profits from guarantees
        const allGuarantees = [...bankGuarantees, ...governmentGuarantees];
        const totalGuaranteeAmount = allGuarantees.reduce((sum, g) => sum + (g.amount || 0), 0);
        const totalCalculatedProfit = allGuarantees.reduce((sum, g) => sum + (g.calculatedProfit || 0), 0);
        const avgProfitPercentage = allGuarantees.length > 0 ? 
          allGuarantees.reduce((sum, g) => sum + (g.profitPercentage || 0), 0) / allGuarantees.length : 0;

        console.log('📈 Basic stats calculated:', {
          totalTenders: tenders.length,
          totalQuotations: quotations.length,
          totalSuppliers: suppliers.length,
          totalGuarantees,
          activeGuarantees,
          expiredGuarantees
        });

        setBasicStats({
          totalTenders: tenders.length,
          totalQuotations: quotations.length,
          totalSuppliers: suppliers.length,
          totalGuarantees,
          activeGuarantees,
          expiredGuarantees,
          totalGuaranteeAmount,
          totalCalculatedProfit,
          avgProfitPercentage
        });

        // 2. Tender Status Distribution
        const statusCounts = tenders.reduce((acc, tender) => {
          const status = tender.status || 'Draft';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});

        console.log('📊 Tender status distribution:', statusCounts);

        // Get CSS variables for colors
        const chartPrimary = getCSSVariable('--chart-primary', '#8B5CF6');
        const chartSecondary = getCSSVariable('--chart-secondary', '#6B46C1');
        const chartSuccess = getCSSVariable('--chart-success', '#10B981');
        const chartWarning = getCSSVariable('--chart-warning', '#F59E0B');
        const chartInfo = getCSSVariable('--chart-info', '#3B82F6');
        const cardBgColor = getCSSVariable('--card-bg-color', '#FFFFFF');

        console.log('🎨 CSS Variables Retrieved:', {
          chartPrimary, chartSecondary, chartSuccess, chartWarning, chartInfo, cardBgColor
        });

        // Debug: Check if dashboard element exists
        const dashboardElement = document.querySelector('.dashboard');
        console.log('🔍 Dashboard Element Found:', !!dashboardElement);
        if (dashboardElement) {
          const computedStyle = getComputedStyle(dashboardElement);
          console.log('🔍 Dashboard CSS Variables:', {
            primary: computedStyle.getPropertyValue('--chart-primary'),
            secondary: computedStyle.getPropertyValue('--chart-secondary'),
            success: computedStyle.getPropertyValue('--chart-success')
          });
        }

        const tenderStatusChartData = {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              chartPrimary,
              chartSecondary,
              chartSuccess,
              chartWarning,
              chartInfo
            ],
            borderWidth: 2,
            borderColor: cardBgColor,
            hoverBorderWidth: 3,
            hoverBorderColor: chartPrimary
          }]
        };

        console.log('🎨 Tender Status Chart Data:', tenderStatusChartData);
        setTenderStatusData(tenderStatusChartData);

        // 3. Quotations per Tender Analysis
        const tenderQuotationCounts = tenders.map(tender => {
          const tenderQuotations = quotations.filter(q => q.tenderId === tender.id);
          return {
            tenderTitle: tender.title?.substring(0, 20) + '...',
            quotationCount: tenderQuotations.length,
            minAmount: tenderQuotations.length > 0 ? Math.min(...tenderQuotations.map(q => q.amount || 0)) : 0,
            maxAmount: tenderQuotations.length > 0 ? Math.max(...tenderQuotations.map(q => q.amount || 0)) : 0,
            avgProfit: tenderQuotations.length > 0 ? tenderQuotations.reduce((sum, q) => sum + (q.profitPercentage || 0), 0) / tenderQuotations.length : 0
          };
        }).filter(t => t.quotationCount > 0).slice(0, 10);

        console.log('📊 Quotations per tender:', tenderQuotationCounts);

        // Get additional CSS variables for bar chart
        const chartPink = getCSSVariable('--chart-pink', '#EC4899');
        const chartIndigo = getCSSVariable('--chart-indigo', '#6366F1');
        const chartCyan = getCSSVariable('--chart-cyan', '#06B6D4');
        const chartOrange = getCSSVariable('--chart-orange', '#F97316');
        const chartTeal = getCSSVariable('--chart-teal', '#14B8A6');

        const quotationsChartData = {
          labels: tenderQuotationCounts.map(t => t.tenderTitle),
          datasets: [{
            label: t('dashboard.quotationsPerTender'),
            data: tenderQuotationCounts.map(t => t.quotationCount),
            backgroundColor: [
              chartPrimary, chartSecondary, chartSuccess, chartWarning, chartInfo,
              chartPink, chartIndigo, chartCyan, chartOrange, chartTeal
            ],
            borderColor: cardBgColor,
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverBorderColor: chartPrimary
          }]
        };

        console.log('🎨 Quotations Chart Data:', quotationsChartData);
        setQuotationsPerTender(quotationsChartData);

        // 4. Top Suppliers Analysis
        const supplierParticipation = suppliers.map(supplier => {
          const supplierQuotations = quotations.filter(q => q.supplierId === supplier.id);
          const totalAmount = supplierQuotations.reduce((sum, q) => sum + (q.amount || 0), 0);
          const avgProfit = supplierQuotations.length > 0 ? supplierQuotations.reduce((sum, q) => sum + (q.profitPercentage || 0), 0) / supplierQuotations.length : 0;
          
          return {
            name: supplier.name || supplier.supplierName || 'Unknown Supplier',
            participationCount: supplierQuotations.length,
            totalAmount,
            avgProfit,
            avgAmount: supplierQuotations.length > 0 ? totalAmount / supplierQuotations.length : 0
          };
        }).sort((a, b) => b.participationCount - a.participationCount).slice(0, 5);

        console.log('🏆 Top suppliers:', supplierParticipation);

        setTopSuppliers(supplierParticipation);

        // 5. Profit Analysis from Guarantees
        const guaranteeProfitData = allGuarantees
          .filter(g => g.profitPercentage && g.amount)
          .map(g => ({
            guaranteeNumber: g.guaranteeNumber,
            amount: g.amount,
            profitPercentage: g.profitPercentage,
            calculatedProfit: g.calculatedProfit || (g.amount * g.profitPercentage / 100)
          }))
          .sort((a, b) => b.calculatedProfit - a.calculatedProfit)
          .slice(0, 10);

        console.log('💰 Guarantee profit analysis:', guaranteeProfitData);

        // Create rgba color from CSS variable
        const primaryRgba = chartPrimary.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16));
        const primaryRgbaString = `rgba(${primaryRgba[0]}, ${primaryRgba[1]}, ${primaryRgba[2]}, 0.1)`;

        const profitAnalysisChartData = {
          labels: guaranteeProfitData.map(g => g.guaranteeNumber.substring(0, 15) + '...'),
          datasets: [{
            label: t('dashboard.calculatedProfit'),
            data: guaranteeProfitData.map(g => g.calculatedProfit),
            backgroundColor: primaryRgbaString,
            borderColor: chartPrimary,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: chartPrimary,
            pointBorderColor: cardBgColor,
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: chartSecondary,
            pointHoverBorderColor: cardBgColor,
            pointHoverBorderWidth: 3
          }]
        };

        console.log('🎨 Profit Analysis Chart Data:', profitAnalysisChartData);
        setProfitAnalysis(profitAnalysisChartData);

        // 6. Deadline Alerts
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const closingSoon = tenders.filter(tender => {
          if (!tender.closingDate) return false;
          const closingDate = new Date(tender.closingDate);
          return closingDate > now && closingDate <= sevenDaysFromNow;
        });

        const expiringSoon = [...bankGuarantees, ...governmentGuarantees].filter(guarantee => {
          if (!guarantee.expiryDate) return false;
          const expiryDate = new Date(guarantee.expiryDate);
          return expiryDate > now && expiryDate <= sevenDaysFromNow;
        });

        console.log('⚠️ Deadline alerts:', {
          closingSoon: closingSoon.length,
          expiringSoon: expiringSoon.length
        });

        setDeadlineAlerts({
          closingSoon: closingSoon.slice(0, 5),
          expiringSoon: expiringSoon.slice(0, 5)
        });

        // 7. Recent Activity
        const recentTenders = tenders
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || a.openingDate || a.createdDate || 0);
            const dateB = new Date(b.createdAt || b.openingDate || b.createdDate || 0);
            return dateB - dateA;
          })
          .slice(0, 5);

        console.log('📅 Recent activity:', recentTenders);

        setRecentActivity(recentTenders);

        // Log success
        console.log('✅ Real data loaded successfully!');

        console.log('✅ Dashboard data loaded successfully!');

      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        handleApiError(error, 'Failed to load dashboard data. Please try again.');
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [t, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">{t('common.loading')}...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}


      {/* Header */}
      <div className="dashboard-header">
        <h2 className="mb-0">
          <FaChartLine className="me-2" />
          {t('dashboard.title')}
        </h2>
        <div className="d-flex align-items-center gap-3">
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            <FaChartLine className="me-1" />
            {loading ? t('common.loading') : t('common.refresh')}
          </Button>
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={async () => {
              try {
                console.log('🧪 Testing API connection...');
                const response = await tendersAPI.getAll({ pageSize: 10 });
                console.log('✅ API Test Result:', response);
                console.log('📊 Response Data:', response.data);
                console.log('📊 Response Status:', response.status);
                console.log('📊 Response Headers:', response.headers);
                alert(`API Test Result: Status ${response.status}, Data: ${JSON.stringify(response.data)}`);
              } catch (error) {
                console.error('❌ API Test Failed:', error);
                console.error('❌ Error Response:', error.response);
                alert(`API test failed: ${error.message}`);
              }
            }}
          >
            Test API
          </Button>
          <Button 
            variant="outline-success" 
            size="sm" 
            onClick={async () => {
              try {
                console.log('🌱 Seeding database...');
                const response = await fetch('http://localhost:5000/api/seeder/seed', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tms_auth_state_v1') ? JSON.parse(localStorage.getItem('tms_auth_state_v1')).token : ''}`
                  }
                });
                const result = await response.json();
                console.log('✅ Seed Result:', result);
                alert('Database seeded! Please refresh the page.');
                window.location.reload();
              } catch (error) {
                console.error('❌ Seed Failed:', error);
                alert(`Seed failed: ${error.message}`);
              }
            }}
          >
            Seed Data
          </Button>
          <Badge bg="info" className="fs-6">
            {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-number">{basicStats.totalTenders}</div>
            <div className="stat-label">{t('dashboard.totalTenders')}</div>
            <div className="stat-subtitle">{t('dashboard.activeTenders')}</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-number">{basicStats.totalQuotations}</div>
            <div className="stat-label">{t('dashboard.totalQuotations')}</div>
            <div className="stat-subtitle">{t('dashboard.avgPerTender')}</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-number">{basicStats.totalSuppliers}</div>
            <div className="stat-label">{t('dashboard.totalSuppliers')}</div>
            <div className="stat-subtitle">{t('dashboard.activeSuppliers')}</div>
          </div>
        </Col>
        <Col md={3} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaShieldAlt />
            </div>
            <div className="stat-number">{basicStats.totalGuarantees}</div>
            <div className="stat-label">{t('dashboard.totalGuarantees')}</div>
            <div className="stat-subtitle">{`${basicStats.activeGuarantees} ${t('dashboard.active')}`}</div>
          </div>
        </Col>
      </Row>

      {/* Profit Analysis Cards */}
      <Row className="g-3 mb-4">
        <Col md={4} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-number">${basicStats.totalGuaranteeAmount?.toLocaleString() || '0'}</div>
            <div className="stat-label">{t('dashboard.totalGuaranteeAmount')}</div>
            <div className="stat-subtitle">{t('dashboard.fromGuarantees')}</div>
          </div>
        </Col>
        <Col md={4} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-number">${basicStats.totalCalculatedProfit?.toLocaleString() || '0'}</div>
            <div className="stat-label">{t('dashboard.totalCalculatedProfit')}</div>
            <div className="stat-subtitle">{t('dashboard.fromGuarantees')}</div>
          </div>
        </Col>
        <Col md={4} sm={6}>
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-number">{basicStats.avgProfitPercentage?.toFixed(2) || '0'}%</div>
            <div className="stat-label">{t('dashboard.averageProfitPercentage')}</div>
            <div className="stat-subtitle">{t('dashboard.fromGuarantees')}</div>
          </div>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="g-3 mb-4">
            <Col lg={6}>
              <div className="chart-wrapper">
                <h5 className="chart-title">{t('dashboard.tenderStatusDistribution')}</h5>
                <KPIChart key="tender-status" data={tenderStatusData} type="pie" title={t('dashboard.tenderStatusDistribution')} />
              </div>
            </Col>
            <Col lg={6}>
              <div className="chart-wrapper">
                <h5 className="chart-title">{t('dashboard.quotationsPerTender')}</h5>
                <KPIChart key="quotations-per-tender" data={quotationsPerTender} type="bar" title={t('dashboard.quotationsPerTender')} />
              </div>
            </Col>
      </Row>

      {/* Analysis Row */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">{t('dashboard.profitAnalysis')}</h5>
            </Card.Header>
            <Card.Body>
              <KPIChart key="profit-analysis" data={profitAnalysis} type="line" title={t('dashboard.averageProfit')} />
            </Card.Body>
          </Card>
          </Col>
        <Col lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">{t('dashboard.topSuppliers')}</h5>
            </Card.Header>
            <Card.Body>
              {topSuppliers.length === 0 ? (
                <div className="text-center text-muted p-4">
                  <FaUsers className="fs-1 mb-2 text-muted" />
                  <div>{t('dashboard.noData')}</div>
                  <small className="text-muted">{t('dashboard.noSuppliersData')}</small>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSuppliers.map((supplier, index) => (
                    <div key={supplier.name} className="d-flex justify-content-between align-items-center p-2 border rounded">
                      <div>
                        <div className="fw-bold">#{index + 1} {supplier.name}</div>
                        <div className="text-muted small">
                          {supplier.participationCount} {t('dashboard.participations')}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="text-success fw-bold">
                          {supplier.avgProfit.toFixed(1)}%
                        </div>
                        <div className="text-muted small">
                          {supplier.totalAmount.toLocaleString()} {t('common.currency')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Alerts and Recent Activity */}
      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaExclamationTriangle className="me-2 text-warning" />
                {t('dashboard.deadlineAlerts')}
              </h5>
              <Badge bg="warning">{deadlineAlerts.closingSoon.length + deadlineAlerts.expiringSoon.length}</Badge>
            </Card.Header>
            <Card.Body>
              {deadlineAlerts.closingSoon.length > 0 && (
                <div className="mb-3">
                  <h6 className="text-warning">{t('dashboard.tendersClosingSoon')}</h6>
                  {deadlineAlerts.closingSoon.map(tender => (
                    <div key={tender.id} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                      <div>
                        <div className="fw-bold">{tender.title}</div>
                        <div className="text-muted small">
                          {t('dashboard.closesOn')}: {new Date(tender.closingDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge bg="warning">
                        <FaClock className="me-1" />
                        {Math.ceil((new Date(tender.closingDate) - new Date()) / (1000 * 60 * 60 * 24))} {t('dashboard.daysLeft')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {deadlineAlerts.expiringSoon.length > 0 && (
                <div>
                  <h6 className="text-danger">{t('dashboard.guaranteesExpiringSoon')}</h6>
                  {deadlineAlerts.expiringSoon.map(guarantee => (
                    <div key={guarantee.id} className="d-flex justify-content-between align-items-center p-2 border rounded mb-2">
                      <div>
                        <div className="fw-bold">{guarantee.guaranteeNumber}</div>
                        <div className="text-muted small">
                          {t('dashboard.expiresOn')}: {new Date(guarantee.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge bg="danger">
                        <FaClock className="me-1" />
                        {Math.ceil((new Date(guarantee.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} {t('dashboard.daysLeft')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {deadlineAlerts.closingSoon.length === 0 && deadlineAlerts.expiringSoon.length === 0 && (
                <div className="text-center text-muted">
                  <FaClock className="fs-1 mb-2" />
                  <div>{t('dashboard.noDeadlines')}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Header>
              <h5 className="mb-0">{t('dashboard.recentActivity')}</h5>
            </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                    <th>{t('tenders.title')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('tenders.closingDate')}</th>
              </tr>
            </thead>
            <tbody>
                  {recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center p-3 text-muted">
                        {t('dashboard.noRecentActivity')}
                      </td>
                </tr>
              ) : (
                    recentActivity.map(tender => (
                      <tr key={tender.id}>
                        <td>
                          <div className="fw-bold">{tender.title}</div>
                          <div className="text-muted small">
                            {tender.description ? tender.description.substring(0, 50) + '...' : 'N/A'}
                          </div>
                        </td>
                        <td>
                          <Badge bg={tender.status === 'Open' ? 'success' : tender.status === 'Closed' ? 'secondary' : 'primary'}>
                            {tender.status || 'Draft'}
                          </Badge>
                        </td>
                        <td>
                          {tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'N/A'}
                        </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;


