import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaChartLine, FaDownload, FaFilter, FaSearch, FaDollarSign, FaFileInvoice, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { financialAPI } from '../services/api';
import { toast } from 'react-toastify';

const FinancialReports = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState({
        summary: {
            totalRevenue: 0,
            totalInvoices: 0,
            totalPayments: 0,
            overdueAmount: 0,
            pendingAmount: 0
        },
        contracts: [],
        invoices: [],
        payments: [],
        overduePayments: [],
        monthlyData: [],
        entityBreakdown: [],
        supplierBreakdown: []
    });
    
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        entityId: '',
        supplierId: '',
        currency: '',
        reportType: 'summary'
    });

    useEffect(() => {
        fetchReportData();
    }, [filters]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            
            // Initialize default report data
            let reportData = {
                summary: {
                    totalRevenue: 0,
                    totalInvoices: 0,
                    totalPayments: 0,
                    overdueAmount: 0,
                    pendingAmount: 0
                },
                overduePayments: [],
                invoices: [],
                payments: [],
                monthlyData: [],
                entityBreakdown: [],
                supplierBreakdown: [],
                analytics: {
                    totalRevenue: 0,
                    totalPayments: 0,
                    paymentTrends: [],
                    overdueCount: 0,
                    averagePaymentTime: 0,
                    onTimePayments: 0,
                    latePayments: 0,
                    paymentMethods: []
                }
            };
            
            // Fetch invoices data
            try {
                const invoicesResponse = await financialAPI.getInvoices();
                if (invoicesResponse?.data) {
                    const invoices = Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [];
                    reportData.invoices = invoices;
                    reportData.summary.totalInvoices = invoices.length;
                    reportData.summary.totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
                    reportData.summary.totalPayments = invoices.reduce((sum, invoice) => sum + (invoice.paidAmount || 0), 0);
                    reportData.summary.pendingAmount = invoices.reduce((sum, invoice) => sum + (invoice.remainingAmount || 0), 0);
                }
            } catch (invoicesError) {
                console.warn('Error fetching invoices:', invoicesError);
            }
            
            // Fetch payments data
            try {
                const paymentsResponse = await financialAPI.getPayments();
                if (paymentsResponse?.data) {
                    const payments = Array.isArray(paymentsResponse.data) ? paymentsResponse.data : [];
                    reportData.payments = payments;
                    
                    // Calculate analytics
                    const totalPayments = payments.length;
                    const onTimePayments = payments.filter(p => p.status === 'Completed').length;
                    const latePayments = payments.filter(p => p.status === 'Failed' || p.status === 'Cancelled').length;
                    
                    reportData.analytics.onTimePayments = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 0;
                    reportData.analytics.latePayments = totalPayments > 0 ? Math.round((latePayments / totalPayments) * 100) : 0;
                    reportData.analytics.averagePaymentTime = 15; // Default value
                    
                    // Get unique payment methods
                    const paymentMethods = [...new Set(payments.map(p => p.paymentMethod).filter(Boolean))];
                    reportData.analytics.paymentMethods = paymentMethods;
                }
            } catch (paymentsError) {
                console.warn('Error fetching payments:', paymentsError);
            }
            
            // Generate monthly data from invoices
            try {
                const monthlyData = generateMonthlyData(reportData.invoices);
                reportData.monthlyData = monthlyData;
            } catch (monthlyError) {
                console.warn('Error generating monthly data:', monthlyError);
            }
            
            // Generate entity and supplier breakdowns
            try {
                const entityBreakdown = generateEntityBreakdown(reportData.invoices);
                const supplierBreakdown = generateSupplierBreakdown(reportData.invoices);
                reportData.entityBreakdown = entityBreakdown;
                reportData.supplierBreakdown = supplierBreakdown;
            } catch (breakdownError) {
                console.warn('Error generating breakdowns:', breakdownError);
            }
            
            // Fetch overdue payments with error handling
            try {
                const overdueResponse = await financialAPI.getOverduePayments();
                if (overdueResponse?.data && Array.isArray(overdueResponse.data)) {
                    reportData.overduePayments = overdueResponse.data;
                    reportData.summary.overdueAmount = overdueResponse.data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
                }
            } catch (overdueError) {
                console.warn('Error fetching overdue payments:', overdueError);
            }
            
            setReportData(reportData);
        } catch (error) {
            console.error('Error fetching report data:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل بيانات التقرير';
            toast.error(errorMessage);
            
            // Set default empty data to prevent crashes
            setReportData({
                summary: {
                    totalRevenue: 0,
                    totalInvoices: 0,
                    totalPayments: 0,
                    overdueAmount: 0,
                    pendingAmount: 0
                },
                overduePayments: [],
                analytics: {
                    totalRevenue: 0,
                    totalPayments: 0,
                    paymentTrends: [],
                    overdueCount: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateMonthlyData = (invoices) => {
        const monthlyData = {};
        
        invoices.forEach(invoice => {
            if (invoice.issueDate) {
                const date = new Date(invoice.issueDate);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = {
                        month: monthName,
                        revenue: 0,
                        payments: 0,
                        invoiceCount: 0,
                        collectionRate: 0
                    };
                }
                
                monthlyData[monthKey].revenue += invoice.totalAmount || 0;
                monthlyData[monthKey].payments += invoice.paidAmount || 0;
                monthlyData[monthKey].invoiceCount += 1;
            }
        });
        
        // Calculate collection rates
        Object.values(monthlyData).forEach(month => {
            month.collectionRate = month.revenue > 0 ? (month.payments / month.revenue) * 100 : 0;
        });
        
        return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
    };

    const generateEntityBreakdown = (invoices) => {
        const entityData = {};
        
        invoices.forEach(invoice => {
            const entityName = invoice.entityName || 'غير محدد';
            
            if (!entityData[entityName]) {
                entityData[entityName] = {
                    name: entityName,
                    contractCount: 0,
                    totalAmount: 0,
                    paidAmount: 0,
                    collectionRate: 0
                };
            }
            
            entityData[entityName].contractCount += 1;
            entityData[entityName].totalAmount += invoice.totalAmount || 0;
            entityData[entityName].paidAmount += invoice.paidAmount || 0;
        });
        
        // Calculate collection rates
        Object.values(entityData).forEach(entity => {
            entity.collectionRate = entity.totalAmount > 0 ? (entity.paidAmount / entity.totalAmount) * 100 : 0;
        });
        
        return Object.values(entityData);
    };

    const generateSupplierBreakdown = (invoices) => {
        const supplierData = {};
        
        invoices.forEach(invoice => {
            const supplierName = invoice.supplierName || 'غير محدد';
            
            if (!supplierData[supplierName]) {
                supplierData[supplierName] = {
                    name: supplierName,
                    contractCount: 0,
                    totalAmount: 0,
                    amounts: []
                };
            }
            
            supplierData[supplierName].contractCount += 1;
            supplierData[supplierName].totalAmount += invoice.totalAmount || 0;
            supplierData[supplierName].amounts.push(invoice.totalAmount || 0);
        });
        
        // Calculate average amounts
        Object.values(supplierData).forEach(supplier => {
            supplier.averageAmount = supplier.amounts.length > 0 ? 
                supplier.amounts.reduce((sum, amount) => sum + amount, 0) / supplier.amounts.length : 0;
        });
        
        return Object.values(supplierData);
    };

    const exportReport = (format) => {
        try {
            if (!reportData || !reportData.summary) {
                toast.error('لا توجد بيانات للتصدير');
                return;
            }
            
            if (format === 'PDF') {
                // For now, just show info message
                toast.info('سيتم إضافة ميزة التصدير بصيغة PDF قريباً');
                return;
            }
            
            if (format === 'Excel') {
                // Create CSV content (Excel compatible)
                const csvContent = [
                    ['التقرير المالي', ''],
                    ['تاريخ التقرير', new Date().toLocaleDateString('en-US')],
                    ['إجمالي الإيرادات', reportData.summary.totalRevenue || 0],
                    ['إجمالي الفواتير', reportData.summary.totalInvoices || 0],
                    ['إجمالي المدفوعات', reportData.summary.totalPayments || 0],
                    ['المبلغ المتأخر', reportData.summary.overdueAmount || 0],
                    ['المبلغ المعلق', reportData.summary.pendingAmount || 0],
                    ['عدد المدفوعات المتأخرة', reportData.overduePayments?.length || 0]
                ].map(row => row.join(',')).join('\n');
                
                // Create and download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `financial-report-${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                toast.success('تم تصدير التقرير بنجاح');
            }
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('فشل في تصدير التقرير');
        }
    };

    const getStatusBadge = (status) => {
        if (!status) {
            return <Badge bg="secondary">غير محدد</Badge>;
        }
        
        const statusMap = {
            'Draft': { variant: 'secondary', text: 'مسودة' },
            'Sent': { variant: 'info', text: 'مرسل' },
            'Paid': { variant: 'success', text: 'مدفوع' },
            'Overdue': { variant: 'danger', text: 'متأخر' },
            'PartiallyPaid': { variant: 'warning', text: 'مدفوع جزئياً' },
            'Cancelled': { variant: 'dark', text: 'ملغي' }
        };
        
        const statusInfo = statusMap[status] || { variant: 'secondary', text: status };
        return <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>;
    };

    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">جاري التحميل...</span>
                    </Spinner>
                </div>
            </Container>
        );
    }

    return (
        <div className="dashboard">
            <Container fluid className="mt-4">
                <Row className="mb-4">
                    <Col>
                        <div className="dashboard-header">
                            <h2 className="d-flex align-items-center">
                                <FaChartLine className="me-2" />
                                {t('financialReports.title')}
                            </h2>
                        </div>
                    </Col>
                </Row>

                {/* Filters */}
                <Row className="mb-4">
                    <Col>
                        <div className="chart-wrapper">
                            <div className="chart-title">
                                {t('financialReports.filters')}
                            </div>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('financialReports.startDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('financialReports.endDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('financialReports.currency')}</Form.Label>
                                        <Form.Select
                                            value={filters.currency}
                                            onChange={(e) => handleFilterChange('currency', e.target.value)}
                                        >
                                            <option value="">{t('financialReports.allCurrencies')}</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="SAR">SAR</option>
                                            <option value="EGP">EGP</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('financialReports.reportType')}</Form.Label>
                                        <Form.Select
                                            value={filters.reportType}
                                            onChange={(e) => handleFilterChange('reportType', e.target.value)}
                                        >
                                            <option value="summary">{t('financialReports.summary')}</option>
                                            <option value="detailed">{t('financialReports.detailed')}</option>
                                            <option value="comparison">{t('financialReports.comparison')}</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Button variant="primary" onClick={fetchReportData}>
                                        <FaFilter className="me-1" />
                                        {t('financialReports.applyFilters')}
                                    </Button>
                                </Col>
                                <Col md={6} className="text-end">
                                    <Button variant="success" className="me-2" onClick={() => exportReport('PDF')}>
                                        <FaDownload className="me-1" />
                                        {t('financialReports.exportPDF')}
                                    </Button>
                                    <Button variant="info" onClick={() => exportReport('Excel')}>
                                        <FaDownload className="me-1" />
                                        {t('financialReports.exportExcel')}
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaDollarSign />
                            </div>
                            <div className="stat-number">{(reportData.summary?.totalRevenue || 0).toLocaleString()}</div>
                            <div className="stat-label">{t('financialReports.totalRevenue')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaFileInvoice />
                            </div>
                            <div className="stat-number">{reportData.summary?.totalInvoices || 0}</div>
                            <div className="stat-label">{t('financialReports.totalInvoices')}</div>
                            <div className="stat-subtitle">{t('common.total')}</div>
                        </div>
                    </Col>
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaCreditCard />
                            </div>
                            <div className="stat-number">{(reportData.summary?.totalPayments || 0).toLocaleString()}</div>
                            <div className="stat-label">{t('financialReports.totalPayments')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaExclamationTriangle />
                            </div>
                            <div className="stat-number">{(reportData.summary?.overdueAmount || 0).toLocaleString()}</div>
                            <div className="stat-label">{t('financialReports.overdueAmount')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>
                            <div className="stat-number">{(reportData.summary?.pendingAmount || 0).toLocaleString()}</div>
                            <div className="stat-label">{t('financialReports.pendingAmount')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={2}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>
                            <div className="stat-number">{reportData.summary?.totalRevenue > 0 ? ((reportData.summary.totalPayments / reportData.summary.totalRevenue) * 100).toFixed(1) : 0}%</div>
                            <div className="stat-label">{t('financialReports.collectionRate')}</div>
                            <div className="stat-subtitle">{t('common.percentage')}</div>
                        </div>
                    </Col>
                </Row>

            {/* Overdue Payments Alert */}
            {reportData.overduePayments && reportData.overduePayments.length > 0 && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger">
                            <Alert.Heading>{t('financialReports.overduePaymentsAlert')}</Alert.Heading>
                            <p>{t('financialReports.overduePaymentsMessage', { count: reportData.overduePayments?.length || 0, amount: (reportData.summary?.overdueAmount || 0).toLocaleString() })}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Monthly Trend */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>{t('financialReports.monthlyTrend')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('financialReports.month')}</th>
                                        <th>{t('financialReports.totalRevenue')}</th>
                                        <th>{t('financialReports.totalPayments')}</th>
                                        <th>{t('financialReports.collectionRate')}</th>
                                        <th>{t('financialReports.invoiceCount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportData.monthlyData || []).map((month, index) => (
                                        <tr key={index}>
                                            <td>{month?.month || t('common.notSpecified')}</td>
                                            <td>{(month?.revenue || 0).toLocaleString()}</td>
                                            <td>{(month?.payments || 0).toLocaleString()}</td>
                                            <td>
                                                <Badge bg={(month?.collectionRate || 0) > 80 ? 'success' : (month?.collectionRate || 0) > 60 ? 'warning' : 'danger'}>
                                                    {(month?.collectionRate || 0).toFixed(1)}%
                                                </Badge>
                                            </td>
                                            <td>{month?.invoiceCount || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Entity Breakdown */}
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5>{t('financialReports.entityBreakdown')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('entities.entityName')}</th>
                                        <th>{t('financialReports.totalContracts')}</th>
                                        <th>{t('financialReports.totalAmount')}</th>
                                        <th>{t('financialReports.collectionRate')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportData.entityBreakdown || []).map((entity, index) => (
                                        <tr key={index}>
                                            <td>{entity?.name || t('common.notSpecified')}</td>
                                            <td>{entity?.contractCount || 0}</td>
                                            <td>{(entity?.totalAmount || 0).toLocaleString()}</td>
                                            <td>
                                                <Badge bg={(entity?.collectionRate || 0) > 80 ? 'success' : (entity?.collectionRate || 0) > 60 ? 'warning' : 'danger'}>
                                                    {(entity?.collectionRate || 0).toFixed(1)}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Supplier Breakdown */}
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h5>{t('financialReports.supplierBreakdown')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('suppliers.supplierName')}</th>
                                        <th>{t('financialReports.contractCount')}</th>
                                        <th>{t('financialReports.totalAmount')}</th>
                                        <th>{t('financialReports.averageAmount')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportData.supplierBreakdown || []).map((supplier, index) => (
                                        <tr key={index}>
                                            <td>{supplier?.name || t('common.notSpecified')}</td>
                                            <td>{supplier?.contractCount || 0}</td>
                                            <td>{(supplier?.totalAmount || 0).toLocaleString()}</td>
                                            <td>{(supplier?.averageAmount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Invoices */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>{t('financialReports.recentInvoices')}</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('invoices.invoiceNumber')}</th>
                                        <th>{t('contracts.contractNumber')}</th>
                                        <th>{t('entities.entityName')}</th>
                                        <th>{t('invoices.totalAmount')}</th>
                                        <th>{t('invoices.paidAmount')}</th>
                                        <th>{t('invoices.remainingAmount')}</th>
                                        <th>{t('invoices.dueDate')}</th>
                                        <th>{t('invoices.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(reportData.invoices || []).slice(0, 10).map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>{invoice?.invoiceNumber || t('common.notSpecified')}</td>
                                            <td>{invoice?.contractNumber || t('common.notSpecified')}</td>
                                            <td>{invoice?.entityName || t('common.notSpecified')}</td>
                                            <td>{(invoice?.totalAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{(invoice?.paidAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{(invoice?.remainingAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>{getStatusBadge(invoice?.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Payment Analytics */}
            {reportData.analytics && (
                <Row className="mb-4">
                    <Col>
                        <Card>
                            <Card.Header>
                                <h5>{t('financialReports.paymentAnalytics')}</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h4 className="text-success">{reportData.analytics.averagePaymentTime} {t('financialReports.days')}</h4>
                                            <p className="text-muted">{t('financialReports.averagePaymentTime')}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h4 className="text-info">{reportData.analytics.onTimePayments}%</h4>
                                            <p className="text-muted">{t('financialReports.onTimePayments')}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h4 className="text-warning">{reportData.analytics.latePayments}%</h4>
                                            <p className="text-muted">{t('financialReports.latePayments')}</p>
                                        </div>
                                    </Col>
                                    <Col md={3}>
                                        <div className="text-center">
                                            <h4 className="text-primary">{(reportData.analytics?.paymentMethods || []).length}</h4>
                                            <p className="text-muted">{t('financialReports.paymentMethodsUsed')}</p>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
            </Container>
        </div>
    );
};

export default FinancialReports;
