import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaCreditCard, FaPlus, FaEye, FaEdit, FaTrash, FaCheck, FaTimes, FaSearch, FaFilter, FaUpload, FaFile, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { financialAPI, contractsAPI } from '../services/api';
import { toast } from 'react-toastify';
import SearchAndFilterPanel from '../components/SearchAndFilterPanel';
import Pagination from '../components/Pagination';

const Payments = () => {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    
    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0
    });
    
    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilesModal, setShowFilesModal] = useState(false);
    
    const [paymentForm, setPaymentForm] = useState({
        invoiceId: '',
        amount: '',
        paymentMethod: 'BankTransfer',
        transactionReference: '',
        checkNumber: '',
        checkDate: '',
        checkDueDate: '',
        bankName: '',
        bankAccount: '',
        bankSwiftCode: '',
        bankIban: '',
        notes: ''
    });
    
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchPayments();
        fetchInvoices();
    }, []);

    // Search and filter handlers
    const handleSearch = (search) => {
        setSearchTerm(search);
        fetchPayments(search, filters, 1, pagination.limit);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        fetchPayments(searchTerm, newFilters, 1, pagination.limit);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchTerm('');
        fetchPayments('', {}, 1, pagination.limit);
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
        fetchPayments(searchTerm, filters, page, pagination.limit);
    };

    // Modal handlers
    const handleViewDetails = (payment) => {
        setSelectedPayment(payment);
        setShowDetailsModal(true);
    };

    const handleViewFiles = (payment) => {
        setSelectedPayment(payment);
        setShowFilesModal(true);
    };

    const fetchPayments = async (search = '', filterParams = {}, page = 1, limit = 10) => {
        try {
            setLoading(true);
            
            // Build query parameters
            const params = {
                page,
                limit,
                ...filterParams
            };
            
            if (search) {
                params.search = search;
            }
            
            console.log('Fetching payments with params:', params);
            
            const paymentsResponse = await financialAPI.getPayments(params);
            const responseData = paymentsResponse?.data;
            
            console.log('Payments response:', paymentsResponse);
            console.log('Payments data:', responseData);
            
            if (!responseData) {
                console.warn('No payments data received');
                setPayments([]);
                setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
                return;
            }
            
            // Handle paginated response
            if (responseData.data && responseData.pagination) {
                const paymentsWithDetails = responseData.data
                    .filter(payment => payment)
                    .map(payment => ({
                        ...payment,
                        invoiceNumber: payment.invoiceNumber || 'غير محدد',
                        contractNumber: payment.contractNumber || 'غير محدد',
                        entityName: payment.entityName || 'غير محدد',
                        supplierName: payment.supplierName || 'غير محدد'
                    }));
                
                setPayments(paymentsWithDetails);
                setPagination({
                    page: responseData.pagination.page,
                    limit: responseData.pagination.limit,
                    totalCount: responseData.pagination.totalCount,
                    totalPages: responseData.pagination.totalPages
                });
            } else {
                // Handle legacy response structure
                const payments = Array.isArray(responseData) ? responseData : 
                               Array.isArray(responseData?.data) ? responseData.data :
                               Array.isArray(responseData?.items) ? responseData.items :
                               [];
                
                const paymentsWithDetails = payments
                    .filter(payment => payment)
                                .map(payment => ({
                                    ...payment,
                        invoiceNumber: payment.invoiceNumber || 'غير محدد',
                        contractNumber: payment.contractNumber || 'غير محدد',
                        entityName: payment.entityName || 'غير محدد',
                        supplierName: payment.supplierName || 'غير محدد'
                    }));
                
                setPayments(paymentsWithDetails);
                setPagination(prev => ({ 
                    ...prev, 
                    totalCount: paymentsWithDetails.length, 
                    totalPages: Math.ceil(paymentsWithDetails.length / limit) 
                }));
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل المدفوعات';
            toast.error(errorMessage);
            setPayments([]);
            setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async () => {
        try {
            // Fetch all invoices directly from the financial API
            const invoicesResponse = await financialAPI.getInvoices();
            console.log('Invoices response in Payments:', invoicesResponse);
            console.log('Invoices response data:', invoicesResponse?.data);
            
            if (!invoicesResponse?.data) {
                console.warn('No invoices data received');
                setInvoices([]);
                return;
            }
            
            // Handle different response structures
            const invoices = Array.isArray(invoicesResponse.data) ? invoicesResponse.data : 
                           Array.isArray(invoicesResponse.data?.data) ? invoicesResponse.data.data :
                           Array.isArray(invoicesResponse.data?.items) ? invoicesResponse.data.items :
                           [];
            
            // Filter invoices that have remaining amount (not fully paid)
            const availableInvoices = invoices
                .filter(invoice => invoice && (invoice.remainingAmount > 0 || invoice.status !== 'Paid'))
                        .map(invoice => ({
                            ...invoice,
                    contractNumber: invoice.contractNumber || 'غير محدد'
                }));
            
            console.log('Available invoices for payments:', {
                totalInvoices: invoices.length,
                availableInvoices: availableInvoices.length,
                sampleInvoices: availableInvoices.slice(0, 3).map(i => ({
                    id: i.id,
                    invoiceNumber: i.invoiceNumber,
                    remainingAmount: i.remainingAmount,
                    status: i.status
                }))
            });
            
            setInvoices(availableInvoices || []);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل الفواتير';
            toast.error(errorMessage);
            setInvoices([]); // Set empty array to prevent crashes
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();
        
        // Validate form data
        if (!paymentForm.invoiceId) {
            toast.error('يرجى اختيار الفاتورة');
            return;
        }
        if (!paymentForm.amount || paymentForm.amount <= 0) {
            toast.error('يرجى إدخال مبلغ صحيح');
            return;
        }
        if (!paymentForm.paymentMethod) {
            toast.error('يرجى اختيار طريقة الدفع');
            return;
        }
        
        try {
            // Transform data to match backend expectations
            const paymentData = {
                invoiceId: paymentForm.invoiceId,
                paymentNumber: `PAY-${Date.now()}`, // Generate unique payment number
                amount: parseFloat(paymentForm.amount),
                currencyCode: 'USD', // Default currency, could be made dynamic
                paymentDate: new Date().toISOString(),
                paymentMethod: paymentForm.paymentMethod === 'BankTransfer' ? 0 : 
                              paymentForm.paymentMethod === 'Check' ? 1 :
                              paymentForm.paymentMethod === 'Cash' ? 2 :
                              paymentForm.paymentMethod === 'CreditCard' ? 3 :
                              paymentForm.paymentMethod === 'OnlinePayment' ? 4 :
                              paymentForm.paymentMethod === 'LetterOfCredit' ? 5 : 0,
                bankName: paymentForm.bankName || null,
                bankAccount: paymentForm.bankAccount || null,
                transactionReference: paymentForm.transactionReference || null,
                checkNumber: paymentForm.checkNumber || null,
                checkDate: paymentForm.checkDate ? new Date(paymentForm.checkDate).toISOString() : null,
                checkDueDate: paymentForm.checkDueDate ? new Date(paymentForm.checkDueDate).toISOString() : null,
                bankSwiftCode: paymentForm.bankSwiftCode || null,
                bankIban: paymentForm.bankIban || null,
                notes: paymentForm.notes || null,
                receiptNumber: null
            };
            
            console.log('Sending payment data:', paymentData);
            console.log('Calling financialAPI...');
            
            let response;
            if (selectedPayment) {
                // Update existing payment
                response = await financialAPI.updatePayment(selectedPayment.id, paymentData);
                console.log('Update response received:', response);
            } else {
                // Create new payment
                response = await financialAPI.createPayment(paymentData);
                console.log('Create response received:', response);
            }
            
            console.log('Response status:', response?.status);
            console.log('Response data:', response?.data);
            
            if (response?.data) {
                toast.success(selectedPayment ? 'تم تحديث المدفوعة بنجاح' : 'تم إنشاء المدفوعة بنجاح');
                setShowCreateModal(false);
                setSelectedPayment(null);
                setPaymentForm({
                    invoiceId: '',
                    amount: '',
                    paymentMethod: 'BankTransfer',
                    transactionReference: '',
                    checkNumber: '',
                    checkDate: '',
                    checkDueDate: '',
                    bankName: '',
                    bankAccount: '',
                    bankSwiftCode: '',
                    bankIban: '',
                    notes: ''
                });
                fetchPayments();
                fetchInvoices(); // Refresh invoices to update paid amounts
                
                // Force refresh of other pages by reloading the current page data
                setTimeout(() => {
                    // Trigger a custom event to notify other components
                    window.dispatchEvent(new CustomEvent('paymentCreated', { 
                        detail: { invoiceId: paymentForm.invoiceId, amount: paymentData.amount } 
                    }));
                }, 1000);
            } else {
                toast.warning('تم إرسال الطلب لكن لم يتم تأكيد العملية');
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في إنشاء المدفوعة';
            toast.error(errorMessage);
        }
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setShowViewModal(true);
    };

    const handleEditPayment = (payment) => {
        setSelectedPayment(payment);
        setPaymentForm({
            invoiceId: payment.invoiceId || '',
            amount: payment.amount || '',
            paymentMethod: payment.paymentMethod === 0 ? 'BankTransfer' :
                          payment.paymentMethod === 1 ? 'Check' :
                          payment.paymentMethod === 2 ? 'Cash' :
                          payment.paymentMethod === 3 ? 'CreditCard' :
                          payment.paymentMethod === 4 ? 'OnlinePayment' :
                          payment.paymentMethod === 5 ? 'LetterOfCredit' : 'BankTransfer',
            transactionReference: payment.transactionReference || '',
            checkNumber: payment.checkNumber || '',
            checkDate: payment.checkDate ? new Date(payment.checkDate).toISOString().split('T')[0] : '',
            checkDueDate: payment.checkDueDate ? new Date(payment.checkDueDate).toISOString().split('T')[0] : '',
            bankName: payment.bankName || '',
            bankAccount: payment.bankAccount || '',
            bankSwiftCode: payment.bankSwiftCode || '',
            bankIban: payment.bankIban || '',
            notes: payment.notes || ''
        });
        setUploadedFiles(payment.attachments || []);
        setShowCreateModal(true);
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
        const newFiles = files.map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
            uploaded: false
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDeletePayment = async (payment) => {
        if (!window.confirm(`هل أنت متأكد من حذف المدفوعة ${payment.paymentNumber}؟`)) {
            return;
        }

        try {
            await financialAPI.deletePayment(payment.id);
            toast.success('تم حذف المدفوعة بنجاح');
            fetchPayments();
            fetchInvoices(); // Refresh invoices to update paid amounts
        } catch (error) {
            console.error('Error deleting payment:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في حذف المدفوعة';
            toast.error(errorMessage);
        }
    };

    const handleConfirmPayment = (payment) => {
        setSelectedPayment(payment);
        setShowConfirmModal(true);
    };

    const confirmPayment = async () => {
        if (!selectedPayment?.id) {
            toast.error('معرف المدفوعة مطلوب');
            return;
        }
        
        try {
            const response = await financialAPI.confirmPayment(selectedPayment.id, {
                confirmationNotes: 'تم تأكيد المدفوعة'
            });
            
            if (response?.data) {
                toast.success('تم تأكيد المدفوعة بنجاح');
                setShowConfirmModal(false);
                fetchPayments();
                fetchInvoices(); // Refresh invoices to update paid amounts
                
                // Force refresh of other pages by reloading the current page data
                setTimeout(() => {
                    // Trigger a custom event to notify other components
                    window.dispatchEvent(new CustomEvent('paymentConfirmed', { 
                        detail: { paymentId: selectedPayment.id } 
                    }));
                }, 1000);
            } else {
                toast.warning('تم إرسال الطلب لكن لم يتم تأكيد المدفوعة');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تأكيد المدفوعة';
            toast.error(errorMessage);
        }
    };

    const getStatusBadge = (status) => {
        if (!status) {
            return <Badge bg="secondary">غير محدد</Badge>;
        }
        
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

    // Filter configuration for payments
    const filterConfig = {
        status: {
            type: 'select',
            label: 'Status',
            options: [
                { value: 'Pending', label: 'Pending' },
                { value: 'Processing', label: 'Processing' },
                { value: 'Completed', label: 'Completed' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Cancelled', label: 'Cancelled' },
                { value: 'Refunded', label: 'Refunded' }
            ]
        },
        dateRange: {
            type: 'dateRange',
            label: 'Payment Date Range',
            colSize: 6
        },
        sortBy: {
            type: 'select',
            label: 'Sort By',
            options: [
                { value: 'paymentnumber', label: 'Payment Number' },
                { value: 'paymentdate', label: 'Payment Date' },
                { value: 'amount', label: 'Amount' }
            ]
        }
    };

    const getPaymentMethodText = (method) => {
        if (!method && method !== 0) {
            return 'غير محدد';
        }
        
        // Handle both string and number values
        const methodMap = {
            0: 'حوالة بنكية',
            1: 'شيك',
            2: 'نقداً',
            3: 'بطاقة ائتمان',
            4: 'دفع إلكتروني',
            5: 'اعتماد مستندي',
            'BankTransfer': 'حوالة بنكية',
            'Check': 'شيك',
            'Cash': 'نقداً',
            'CreditCard': 'بطاقة ائتمان',
            'OnlinePayment': 'دفع إلكتروني',
            'LetterOfCredit': 'اعتماد مستندي'
        };
        return methodMap[method] || method;
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
                        <FaCreditCard className="me-2" />
                                {t('payments.title')}
                    </h2>
                        </div>
                </Col>
            </Row>

            {/* Search and Filter Panel */}
            <Row className="mb-4">
                <Col md={8}>
                    <SearchAndFilterPanel
                        onSearch={handleSearch}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                        searchPlaceholder={t('payments.searchPayments')}
                        filterConfig={filterConfig}
                        showFilters={true}
                        collapsibleFilters={true}
                    />
                </Col>
                <Col md={4} className="text-end">
                    <Button 
                        variant="primary" 
                        onClick={() => setShowCreateModal(true)}
                    >
                        <FaPlus className="me-1" />
                        {t('payments.addPayment')}
                    </Button>
                </Col>
            </Row>

            {/* Payments Table */}
            <Row>
                <Col>
                        <div className="chart-wrapper">
                            <div className="chart-title">
                                {t('payments.title')} ({pagination.totalCount})
                            </div>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('payments.paymentNumber')}</th>
                                        <th>{t('payments.invoice')}</th>
                                        <th>{t('payments.contract')}</th>
                                        <th>{t('payments.amount')}</th>
                                        <th>{t('payments.paymentMethod')}</th>
                                        <th>{t('payments.paymentDate')}</th>
                                        <th>{t('payments.status')}</th>
                                        <th>{t('common.details')}</th>
                                        <th>{t('common.files')}</th>
                                        <th>{t('payments.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(payments || []).map((payment) => (
                                        <tr key={payment.id}>
                                            <td>{payment?.paymentNumber || t('common.notSpecified')}</td>
                                            <td>{payment?.invoiceNumber || t('common.notSpecified')}</td>
                                            <td>{payment?.contractNumber || t('common.notSpecified')}</td>
                                            <td>{(payment?.amount || 0).toLocaleString()} {payment?.currencyCode || 'USD'}</td>
                                            <td>{getPaymentMethodText(payment?.paymentMethod)}</td>
                                            <td>{payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>{getStatusBadge(payment?.status)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-info"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(payment)}
                                                    title={t('common.viewDetails')}
                                                >
                                                    <FaEye />
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => handleViewFiles(payment)}
                                                    title={t('common.viewFiles')}
                                                >
                                                    <FaFileAlt />
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewPayment(payment)}
                                                >
                                                    <FaEye />
                                                </Button>
                                                {payment.status === 'Pending' && (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        className="me-1"
                                                        onClick={() => handleConfirmPayment(payment)}
                                                    >
                                                        <FaCheck />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleEditPayment(payment)}
                                                    title={t('payments.editPayment')}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeletePayment(payment)}
                                                    title={t('payments.deletePayment')}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {(payments || []).length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-muted">{t('payments.noPayments')}</p>
                                </div>
                            )}
                            
                            {/* Pagination */}
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                totalCount={pagination.totalCount}
                                limit={pagination.limit}
                                onPageChange={handlePageChange}
                                showInfo={true}
                                className="mt-3"
                            />
                        </div>
                </Col>
            </Row>

            {/* Create Payment Modal */}
            <Modal show={showCreateModal} onHide={() => {
                setShowCreateModal(false);
                setSelectedPayment(null);
                setPaymentForm({
                    invoiceId: '',
                    amount: '',
                    paymentMethod: 'BankTransfer',
                    transactionReference: '',
                    checkNumber: '',
                    checkDate: '',
                    checkDueDate: '',
                    bankName: '',
                    bankAccount: '',
                    bankSwiftCode: '',
                    bankIban: '',
                    notes: ''
                });
                setUploadedFiles([]);
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedPayment ? t('payments.editPayment') : t('payments.addNewPayment')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreatePayment}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('payments.invoice')}</Form.Label>
                                    <Form.Select
                                        value={paymentForm.invoiceId}
                                        onChange={(e) => setPaymentForm({...paymentForm, invoiceId: e.target.value})}
                                        required
                                    >
                                        <option value="">{t('payments.selectInvoice')}</option>
                                        {(invoices || []).map(invoice => (
                                            <option key={invoice.id} value={invoice.id}>
                                                {invoice?.invoiceNumber || t('common.notSpecified')} - {(invoice?.remainingAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('payments.amount')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('payments.paymentMethod')}</Form.Label>
                                    <Form.Select
                                        value={paymentForm.paymentMethod}
                                        onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                    >
                                        <option value="BankTransfer">{t('payments.bankTransfer')}</option>
                                        <option value="Check">{t('payments.check')}</option>
                                        <option value="Cash">{t('payments.cash')}</option>
                                        <option value="CreditCard">{t('payments.creditCard')}</option>
                                        <option value="OnlinePayment">{t('payments.onlinePayment')}</option>
                                        <option value="LetterOfCredit">{t('payments.letterOfCredit')}</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('payments.referenceNumber')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={paymentForm.transactionReference}
                                        onChange={(e) => setPaymentForm({...paymentForm, transactionReference: e.target.value})}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        {paymentForm.paymentMethod === 'Check' && (
                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payments.checkNumber')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentForm.checkNumber}
                                            onChange={(e) => setPaymentForm({...paymentForm, checkNumber: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payments.checkDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={paymentForm.checkDate}
                                            onChange={(e) => setPaymentForm({...paymentForm, checkDate: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payments.dueDate')}</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={paymentForm.checkDueDate}
                                            onChange={(e) => setPaymentForm({...paymentForm, checkDueDate: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        
                        {(paymentForm.paymentMethod === 'BankTransfer' || paymentForm.paymentMethod === 'LetterOfCredit') && (
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payments.bankName')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentForm.bankName}
                                            onChange={(e) => setPaymentForm({...paymentForm, bankName: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>{t('payments.accountNumber')}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={paymentForm.bankAccount}
                                            onChange={(e) => setPaymentForm({...paymentForm, bankAccount: e.target.value})}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label>{t('payments.notes')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                            />
                        </Form.Group>
                        
                        {/* File Upload Section */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaUpload className="me-2" />
                                {t('payments.attachments')}
                            </Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                onChange={handleFileUpload}
                                className="mb-2"
                            />
                            <Form.Text className="text-muted">
                                {t('payments.fileUploadHelp')}
                            </Form.Text>
                            
                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-3">
                                    <h6>{t('payments.uploadedFiles')} ({uploadedFiles.length})</h6>
                                    <div className="list-group">
                                        {uploadedFiles.map((file) => (
                                            <div key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <FaFile className="me-2 text-primary" />
                                                    <div>
                                                        <div className="fw-bold">{file.name}</div>
                                                        <small className="text-muted">{formatFileSize(file.size)}</small>
                                                    </div>
                                                </div>
                                                <div>
                                                    {file.uploaded && (
                                                        <Badge bg="success" className="me-2">
                                                            {t('common.uploaded')}
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => removeFile(file.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button variant="primary" type="submit">
                            {selectedPayment ? t('payments.updatePayment') : t('payments.addPayment')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* View Payment Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('payments.paymentDetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentNumber')}:</strong> {selectedPayment.paymentNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.invoiceNumber')}:</strong> {selectedPayment.invoiceNumber}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.contractNumber')}:</strong> {selectedPayment.contractNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.amount')}:</strong> {selectedPayment.amount.toLocaleString()} {selectedPayment.currencyCode}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentMethod')}:</strong> {getPaymentMethodText(selectedPayment?.paymentMethod)}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.status')}:</strong> {getStatusBadge(selectedPayment?.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentDate')}:</strong> {selectedPayment?.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString('en-US') : t('common.notSpecified')}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.referenceNumber')}:</strong> {selectedPayment.transactionReference || t('common.notSpecified')}
                                </Col>
                            </Row>
                            {selectedPayment.bankName && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>{t('payments.bankName')}:</strong> {selectedPayment.bankName}
                                    </Col>
                                    <Col md={6}>
                                        <strong>{t('payments.accountNumber')}:</strong> {selectedPayment.bankAccount || t('common.notSpecified')}
                                    </Col>
                                </Row>
                            )}
                            {selectedPayment.notes && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('payments.notes')}:</strong> {selectedPayment.notes}
                                    </Col>
                                </Row>
                            )}
                            {selectedPayment.attachments && selectedPayment.attachments.length > 0 && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('payments.attachments')}:</strong>
                                        <div className="mt-2">
                                            {selectedPayment.attachments.map((attachment, index) => (
                                                <div key={index} className="d-flex align-items-center mb-2">
                                                    <FaFile className="me-2 text-primary" />
                                                    <span className="me-2">{attachment.name}</span>
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            // Handle file download
                                                            const link = document.createElement('a');
                                                            link.href = attachment.url;
                                                            link.download = attachment.name;
                                                            link.click();
                                                        }}
                                                    >
                                                        <FaDownload />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>
                        {t('common.close')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Payment Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('payments.confirmPayment')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('payments.confirmPaymentMessage')}</p>
                    {selectedPayment && (
                        <div>
                            <p><strong>{t('payments.paymentNumber')}:</strong> {selectedPayment.paymentNumber}</p>
                            <p><strong>{t('payments.amount')}:</strong> {selectedPayment.amount.toLocaleString()} {selectedPayment.currencyCode}</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="success" onClick={confirmPayment}>
                        <FaCheck className="me-1" />
                        {t('common.confirm')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('payments.paymentDetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentNumber')}:</strong> {selectedPayment.paymentNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.invoiceNumber')}:</strong> {selectedPayment.invoiceNumber}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.contractNumber')}:</strong> {selectedPayment.contractNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.amount')}:</strong> {selectedPayment.amount.toLocaleString()} {selectedPayment.currencyCode}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentMethod')}:</strong> {getPaymentMethodText(selectedPayment?.paymentMethod)}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.status')}:</strong> {getStatusBadge(selectedPayment?.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('payments.paymentDate')}:</strong> {selectedPayment?.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleDateString('en-US') : t('common.notSpecified')}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('payments.referenceNumber')}:</strong> {selectedPayment.transactionReference || t('common.notSpecified')}
                                </Col>
                            </Row>
                            {selectedPayment.bankName && (
                                <Row className="mb-3">
                                    <Col md={6}>
                                        <strong>{t('payments.bankName')}:</strong> {selectedPayment.bankName}
                                    </Col>
                                    <Col md={6}>
                                        <strong>{t('payments.accountNumber')}:</strong> {selectedPayment.bankAccount || t('common.notSpecified')}
                                    </Col>
                                </Row>
                            )}
                            {selectedPayment.notes && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('payments.notes')}:</strong> {selectedPayment.notes}
                                    </Col>
                                </Row>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                        {t('common.close')}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Files Modal */}
            <Modal show={showFilesModal} onHide={() => setShowFilesModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('payments.paymentFiles')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPayment && (
                        <div>
                            <h6>{t('payments.paymentNumber')}: {selectedPayment.paymentNumber}</h6>
                            <div className="mt-3">
                                {selectedPayment.attachments && selectedPayment.attachments.length > 0 ? (
                                    <div className="list-group">
                                        {selectedPayment.attachments.map((file, index) => (
                                            <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center">
                                                    <FaFileAlt className="me-2 text-primary" />
                                                    <div>
                                                        <div className="fw-bold">{file.name}</div>
                                                        <small className="text-muted">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''}</small>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = file.url;
                                                        link.download = file.name;
                                                        link.click();
                                                    }}
                                                >
                                                    <FaDownload />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted">{t('common.noFiles')}</p>
                                )}
                            </div>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFilesModal(false)}>
                        {t('common.close')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
        </div>
    );
};

export default Payments;
