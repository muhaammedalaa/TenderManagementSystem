import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaDollarSign, FaFileInvoice, FaCreditCard, FaChartLine, FaPlus, FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { financialAPI, contractsAPI } from '../services/api';
import { toast } from 'react-toastify';

const FinancialDashboard = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [financialData, setFinancialData] = useState({
        totalRevenue: 0,
        totalInvoices: 0,
        totalPayments: 0,
        overduePayments: 0,
        contracts: [],
        recentInvoices: [],
        paymentSchedules: [],
        overduePayments: []
    });
    const [earliestStartDate, setEarliestStartDate] = useState(null);
    const [latestEndDate, setLatestEndDate] = useState(null);
    
    const [selectedContract, setSelectedContract] = useState(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showContractSummary, setShowContractSummary] = useState(false);
    const [contractSummary, setContractSummary] = useState(null);
    
    // Form states
    const [invoiceForm, setInvoiceForm] = useState({
        contractId: '',
        invoiceNumber: '',
        amount: '',
        currencyCode: 'USD',
        dueDate: '',
        taxRate: 0,
        description: '',
        notes: ''
    });
    
    const [paymentForm, setPaymentForm] = useState({
        invoiceId: '',
        amount: '',
        paymentMethod: 'BankTransfer',
        transactionReference: '',
        notes: ''
    });

    useEffect(() => {
        fetchFinancialData();
        
        // Listen for payment events to refresh financial data
        const handlePaymentCreated = (event) => {
            console.log('Payment created event received in Dashboard:', event.detail);
            console.log('Refreshing financial data...');
            fetchFinancialData();
        };
        
        const handlePaymentConfirmed = (event) => {
            console.log('Payment confirmed event received in Dashboard:', event.detail);
            console.log('Refreshing financial data...');
            fetchFinancialData();
        };
        
        window.addEventListener('paymentCreated', handlePaymentCreated);
        window.addEventListener('paymentConfirmed', handlePaymentConfirmed);
        
        // Cleanup event listeners
        return () => {
            window.removeEventListener('paymentCreated', handlePaymentCreated);
            window.removeEventListener('paymentConfirmed', handlePaymentConfirmed);
        };
    }, []);

        const fetchFinancialData = async () => {
            try {
                setLoading(true);
                
                // Fetch contracts with financial data
                const contractsResponse = await contractsAPI.getAll();
                console.log('Contracts response in FinancialDashboard:', contractsResponse);
                console.log('Contracts response data:', contractsResponse?.data);
            
            // Handle different response structures with error handling
            const contracts = Array.isArray(contractsResponse?.data) ? contractsResponse.data : 
                             Array.isArray(contractsResponse?.data?.data) ? contractsResponse.data.data :
                             Array.isArray(contractsResponse?.data?.items) ? contractsResponse.data.items :
                             [];
            
            console.log('Processed contracts:', contracts);
            console.log('Contracts with dates:', contracts.filter(c => c && (c.startDate || c.endDate)));
            
                // Calculate totals with safe access
                const totalRevenue = contracts.reduce((sum, contract) => {
                    if (!contract) return sum;
                    return sum + (contract.amount || contract.totalAmount || 0);
                }, 0);
                
                // Get date range from contracts
                 const validStartDates = contracts
                    .filter(contract => contract && contract.startDate)
                    .map(contract => new Date(contract.startDate))
                    .filter(date => !isNaN(date.getTime()));
                
                const validEndDates = contracts
                    .filter(contract => contract && contract.endDate)
                    .map(contract => new Date(contract.endDate))
                    .filter(date => !isNaN(date.getTime()));
                
                const calculatedEarliestStartDate = validStartDates.length > 0 ? 
                    new Date(Math.min(...validStartDates)) : null;
                const calculatedLatestEndDate = validEndDates.length > 0 ? 
                    new Date(Math.max(...validEndDates)) : null;
                
                // Update date state
                setEarliestStartDate(calculatedEarliestStartDate);
                setLatestEndDate(calculatedLatestEndDate);
                
                console.log('Contract dates found:', {
                    contractsCount: contracts.length,
                    validStartDates: validStartDates.length,
                    validEndDates: validEndDates.length,
                    earliestStartDate: calculatedEarliestStartDate,
                    latestEndDate: calculatedLatestEndDate,
                    sampleContracts: contracts.slice(0, 3).map(c => ({
                        id: c.id,
                        contractNumber: c.contractNumber,
                        startDate: c.startDate,
                        endDate: c.endDate
                    }))
                });
            
            // Fetch invoices directly from the financial API
            let recentInvoices = [];
            let totalInvoices = 0;
            let totalPayments = 0;
            
            try {
                const invoicesResponse = await financialAPI.getInvoices();
                console.log('Invoices response in FinancialDashboard:', invoicesResponse);
                console.log('Invoices response data:', invoicesResponse?.data);
                
                const invoices = Array.isArray(invoicesResponse?.data) ? invoicesResponse.data : 
                               Array.isArray(invoicesResponse?.data?.data) ? invoicesResponse.data.data :
                               Array.isArray(invoicesResponse?.data?.items) ? invoicesResponse.data.items :
                               [];
                
                totalInvoices = invoices.length;
                totalPayments = invoices.reduce((sum, invoice) => {
                    if (!invoice) return sum;
                    return sum + (invoice.paidAmount || 0);
                }, 0);
                
                // Get recent invoices (last 10)
                recentInvoices = invoices
                    .filter(invoice => invoice)
                    .sort((a, b) => new Date(b.createdAtUtc || b.issueDate) - new Date(a.createdAtUtc || a.issueDate))
                    .slice(0, 10);
                    
                console.log('Processed invoices:', {
                    totalInvoices,
                    totalPayments,
                    recentInvoicesCount: recentInvoices.length,
                    sampleInvoices: recentInvoices.slice(0, 3).map(i => ({
                        id: i.id,
                        invoiceNumber: i.invoiceNumber,
                        amount: i.amount,
                        paidAmount: i.paidAmount
                    }))
                });
            } catch (invoicesError) {
                console.warn('Error fetching invoices:', invoicesError);
                recentInvoices = [];
            }
            
            // Fetch overdue payments with error handling
            let overduePayments = [];
            try {
                const overdueResponse = await financialAPI.getOverduePayments();
                overduePayments = Array.isArray(overdueResponse?.data) ? overdueResponse.data : [];
            } catch (overdueError) {
                console.warn('Error fetching overdue payments:', overdueError);
                overduePayments = [];
            }
            
            // Safe flattening of payment schedules from contracts
            const paymentSchedules = contracts
                .filter(contract => contract && contract.paymentSchedules && Array.isArray(contract.paymentSchedules))
                .flatMap(contract => contract.paymentSchedules)
                .filter(schedule => schedule); // Remove null/undefined schedules
            
            setFinancialData({
                totalRevenue: totalRevenue || 0,
                totalInvoices: totalInvoices || 0,
                totalPayments: totalPayments || 0,
                overduePayments: overduePayments.length || 0,
                contracts: contracts || [],
                recentInvoices: recentInvoices || [],
                paymentSchedules: paymentSchedules || [],
                overduePayments: overduePayments || []
            });
        } catch (error) {
            console.error('Error fetching financial data:', error);
            toast.error('فشل في تحميل البيانات المالية');
            
                // Set default empty data to prevent crashes
                setFinancialData({
                    totalRevenue: 0,
                    totalInvoices: 0,
                    totalPayments: 0,
                    overduePayments: 0,
                    contracts: [],
                    recentInvoices: [],
                    paymentSchedules: [],
                    overduePayments: []
                });
                
                // Reset dates
                setEarliestStartDate(null);
                setLatestEndDate(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdvancePayment = async (contractId) => {
        if (!contractId) {
            toast.error('معرف العقد مطلوب');
            return;
        }
        
        try {
            await financialAPI.createPaymentSchedule({
                contractId,
                paymentType: 'Advance',
                paymentPercentage: 25,
                amount: 0, // Will be calculated based on contract amount
                dueDate: new Date().toISOString().split('T')[0],
                description: 'دفعة مقدمة 25% عند توقيع العقد'
            });
            toast.success('تم إنشاء الدفعة المقدمة بنجاح');
            fetchFinancialData();
        } catch (error) {
            console.error('Error creating advance payment:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في إنشاء الدفعة المقدمة';
            toast.error(errorMessage);
        }
    };

    const handleViewContractSummary = async (contractId) => {
        if (!contractId) {
            toast.error('معرف العقد مطلوب');
            return;
        }
        
        try {
            const response = await financialAPI.getContractFinancialSummary(contractId);
            const summaryData = response?.data;
            
            if (!summaryData) {
                toast.warning('لا توجد بيانات مالية متاحة لهذا العقد');
                return;
            }
            
            setContractSummary(summaryData);
            setShowContractSummary(true);
        } catch (error) {
            console.error('Error fetching contract summary:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل ملخص العقد المالي';
            toast.error(errorMessage);
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!invoiceForm.contractId) {
            toast.error('يرجى اختيار العقد');
            return;
        }
        if (!invoiceForm.invoiceNumber) {
            toast.error('يرجى إدخال رقم الفاتورة');
            return;
        }
        if (!invoiceForm.amount || invoiceForm.amount <= 0) {
            toast.error('يرجى إدخال مبلغ صحيح');
            return;
        }
        if (!invoiceForm.dueDate) {
            toast.error('يرجى إدخال تاريخ الاستحقاق');
            return;
        }
        
        try {
            // Transform data to match backend expectations
            const invoiceData = {
                contractId: invoiceForm.contractId,
                invoiceNumber: invoiceForm.invoiceNumber || `INV-${Date.now()}`,
                amount: parseFloat(invoiceForm.amount),
                currencyCode: invoiceForm.currencyCode,
                dueDate: new Date(invoiceForm.dueDate).toISOString(),
                taxRate: parseFloat(invoiceForm.taxRate) || 0,
                taxType: 'VAT',
                paymentType: 0, // Advance enum value
                paymentPercentage: 25,
                description: invoiceForm.description || '',
                notes: invoiceForm.notes || ''
            };
            
            console.log('Sending invoice data:', invoiceData);
            const response = await financialAPI.createInvoice(invoiceData);
            console.log('Response received:', response);
            console.log('Response data:', response?.data);
            
            if (response?.data) {
                toast.success('تم إنشاء الفاتورة بنجاح');
                setShowInvoiceModal(false);
                setInvoiceForm({
                    contractId: '',
                    invoiceNumber: '',
                    amount: '',
                    currencyCode: 'USD',
                    dueDate: '',
                    taxRate: 0,
                    description: '',
                    notes: ''
                });
                fetchFinancialData();
            } else {
                toast.warning('تم إرسال الطلب لكن لم يتم تأكيد إنشاء الفاتورة');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في إنشاء الفاتورة';
            toast.error(errorMessage);
        }
    };

    const handleDeleteInvoice = async (invoice) => {
        if (!window.confirm(`هل أنت متأكد من حذف الفاتورة ${invoice.invoiceNumber}؟`)) {
            return;
        }

        try {
            await financialAPI.deleteInvoice(invoice.id);
            toast.success('تم حذف الفاتورة بنجاح');
            fetchFinancialData();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في حذف الفاتورة';
            toast.error(errorMessage);
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

    const getPaymentStatusBadge = (status) => {
        const statusMap = {
            'Pending': { variant: 'warning', text: 'في الانتظار' },
            'Processing': { variant: 'info', text: 'قيد المعالجة' },
            'Completed': { variant: 'success', text: 'مكتمل' },
            'Failed': { variant: 'danger', text: 'فشل' },
            'Cancelled': { variant: 'dark', text: 'ملغي' },
            'Refunded': { variant: 'secondary', text: 'مسترد' }
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
                                <FaDollarSign className="me-2" />
                                {t('financial.title')}
                            </h2>
                        </div>
                    </Col>
                </Row>
            
                {/* Date Range Info */}
                {earliestStartDate && latestEndDate ? (
                    <Row className="mb-4">
                        <Col>
                            <div className="alert-card">
                                <Alert variant="info" className="mb-0">
                                    <strong>{t('contracts.contractPeriod')}:</strong> {t('common.from')} {earliestStartDate.toLocaleDateString('en-US')} {t('common.to')} {latestEndDate.toLocaleDateString('en-US')}
                                </Alert>
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <Row className="mb-4">
                        <Col>
                            <div className="alert-card">
                                <Alert variant="warning" className="mb-0">
                                    <strong>{t('common.note')}:</strong> {t('financial.noContractDates')}
                                </Alert>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Financial Summary Cards */}
                <Row className="mb-4">
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaDollarSign />
                            </div>
                            <div className="stat-number">{financialData.totalRevenue.toLocaleString()}</div>
                            <div className="stat-label">{t('financial.totalRevenue')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaFileInvoice />
                            </div>
                            <div className="stat-number">{financialData.totalInvoices}</div>
                            <div className="stat-label">{t('financial.totalInvoices')}</div>
                            <div className="stat-subtitle">{t('common.total')}</div>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaCreditCard />
                            </div>
                            <div className="stat-number">{financialData.totalPayments.toLocaleString()}</div>
                            <div className="stat-label">{t('financial.totalPayments')}</div>
                            <div className="stat-subtitle">USD</div>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <FaChartLine />
                            </div>
                            <div className="stat-number">{financialData.overduePayments}</div>
                            <div className="stat-label">{t('financial.overduePayments')}</div>
                            <div className="stat-subtitle">{t('common.count')}</div>
                        </div>
                    </Col>
                </Row>

            {/* Contracts Table */}
            <Row className="mb-4">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5>العقود المالية</h5>
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => setShowInvoiceModal(true)}
                            >
                                <FaPlus className="me-1" />
{t('financial.createInvoice')}
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('contracts.contractNumber')}</th>
                                        <th>{t('common.amount')}</th>
                                        <th>{t('common.currency')}</th>
                                        <th>{t('contracts.startDate')}</th>
                                        <th>{t('contracts.endDate')}</th>
                                        <th>{t('common.status')}</th>
                                        <th>{t('common.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(financialData.contracts || []).map((contract) => (
                                        <tr key={contract.id}>
                                            <td>{contract.contractNumber}</td>
                                            <td>{(contract.amount || contract.totalAmount || 0).toLocaleString()}</td>
                                            <td>{contract.currencyCode}</td>
                                            <td>{contract?.startDate ? new Date(contract.startDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>{contract?.endDate ? new Date(contract.endDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>
                                                <Badge bg={contract.status === 'Active' ? 'success' : 'secondary'}>
                                                    {contract.status === 'Active' ? t('common.active') : contract.status}
                                                </Badge>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewContractSummary(contract.id)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleCreateAdvancePayment(contract.id)}
                                                >
                                                    <FaPlus /> 25%
                                                </Button>
                                            </td>
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
                        <div className="chart-wrapper">
                            <div className="chart-title">
                                {t('financial.recentInvoices')}
                            </div>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('financial.invoiceNumberCol')}</th>
                                        <th>{t('financial.amountCol')}</th>
                                        <th>{t('financial.paidCol')}</th>
                                        <th>{t('financial.remainingCol')}</th>
                                        <th>{t('financial.dueDateCol')}</th>
                                        <th>{t('financial.statusCol')}</th>
                                        <th>{t('financial.actionsCol')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(financialData.recentInvoices || []).map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>{invoice.invoiceNumber}</td>
                                            <td>{(invoice.totalAmount || 0).toLocaleString()}</td>
                                            <td>{(invoice.paidAmount || 0).toLocaleString()}</td>
                                            <td>{(invoice.remainingAmount || 0).toLocaleString()}</td>
                                            <td>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>{getStatusBadge(invoice.status)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteInvoice(invoice)}
                                                    title={t('financial.deleteInvoice')}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>

                {/* Overdue Payments Alert */}
                {(financialData.overduePayments || []).length > 0 && (
                    <Row className="mb-4">
                        <Col>
                            <div className="alert-card">
                                <Alert variant="danger" className="mb-0">
                                    <Alert.Heading>{t('financial.overduePaymentsAlert')}</Alert.Heading>
                                    <p>{t('financial.overduePaymentsMessage', { count: (financialData.overduePayments || []).length })}</p>
                                </Alert>
                            </div>
                        </Col>
                    </Row>
                )}

            {/* Create Invoice Modal */}
            <Modal show={showInvoiceModal} onHide={() => setShowInvoiceModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('financial.createNewInvoice')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateInvoice}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('financial.selectContract')}</Form.Label>
                                    <Form.Select
                                        value={invoiceForm.contractId}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, contractId: e.target.value})}
                                        required
                                    >
                                        <option value="">{t('financial.selectContract')}</option>
                                        {(financialData.contracts || []).map(contract => (
                                            <option key={contract.id} value={contract.id}>
                                                {contract?.contractNumber || t('common.notSpecified')} - {(contract?.amount || 0).toLocaleString()} {contract?.currencyCode || 'USD'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('financial.invoiceNumber')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={invoiceForm.invoiceNumber}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('common.amount')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={invoiceForm.amount}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('common.currency')}</Form.Label>
                                    <Form.Select
                                        value={invoiceForm.currencyCode}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, currencyCode: e.target.value})}
                                    >
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                        <option value="SAR">SAR</option>
                                        <option value="EGP">EGP</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('financial.dueDate')}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={invoiceForm.dueDate}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('financial.taxRate')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={invoiceForm.taxRate}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, taxRate: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('common.description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={invoiceForm.description}
                                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t('common.notes')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={invoiceForm.notes}
                                onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="primary" type="submit">
                            {t('financial.createInvoiceButton')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Contract Financial Summary Modal */}
            <Modal show={showContractSummary} onHide={() => setShowContractSummary(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('financial.contractSummary')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {contractSummary && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('financial.contractNumber')}:</strong> {contractSummary.contractNumber || t('common.notSpecified')}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('financial.totalAmount')}:</strong> {(contractSummary.contractAmount || 0).toLocaleString()} {contractSummary.currencyCode || 'USD'}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('financial.totalInvoiced')}:</strong> {(contractSummary.totalInvoiced || 0).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('financial.totalPaid')}:</strong> {(contractSummary.totalPaid || 0).toLocaleString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('financial.remaining')}:</strong> {(contractSummary.totalRemaining || 0).toLocaleString()}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('financial.progressPercentage')}:</strong> {(contractSummary.paymentProgressPercentage || 0).toFixed(1)}%
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('financial.advancePayment')}:</strong> {(contractSummary.advancePaymentAmount || 0).toLocaleString()} ({contractSummary.advancePaymentPercentage || 0}%)
                                </Col>
                                <Col md={6}>
                                    <strong>{t('financial.paymentStatus')}:</strong> 
                                    <Badge bg={contractSummary.paymentStatus === 'On Track' ? 'success' : 'warning'} className="ms-2">
                                        {contractSummary.paymentStatus === 'On Track' ? t('financial.onTrack') : (contractSummary.paymentStatus || t('common.notSpecified'))}
                                    </Badge>
                                </Col>
                            </Row>
                            {(contractSummary.nextPaymentDueDate || contractSummary.nextPaymentAmount) && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>{t('financial.nextPayment')}:</strong> {(contractSummary.nextPaymentAmount || 0).toLocaleString()}
                                    </Col>
                                    <Col md={6}>
                                        <strong>{t('financial.nextPaymentDueDate')}:</strong> {contractSummary.nextPaymentDueDate ? new Date(contractSummary.nextPaymentDueDate).toLocaleDateString('en-US') : t('common.notSpecified')}
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowContractSummary(false)}>
                        {t('common.close')}
                    </Button>
                </Modal.Footer>
            </Modal>
            </Container>
        </div>
    );
};

export default FinancialDashboard;
