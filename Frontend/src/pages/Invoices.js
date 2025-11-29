import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaFileInvoice, FaPlus, FaEye, FaEdit, FaTrash, FaDownload, FaSearch, FaFilter, FaUpload, FaFile, FaFileAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { financialAPI, contractsAPI } from '../services/api';
import { toast } from 'react-toastify';
import SearchAndFilterPanel from '../components/SearchAndFilterPanel';
import Pagination from '../components/Pagination';


const Invoices = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    
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
    console.log('Invoices keys test:', t('invoices', { returnObjects: true }));
console.log('Single key test:', t('invoices.title'));

    
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
    
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchInvoices();
        fetchContracts();
        
        // Listen for payment events to refresh invoices
        const handlePaymentCreated = (event) => {
            console.log('Payment created event received:', event.detail);
            console.log('Refreshing invoices...');
            fetchInvoices();
        };
        
        const handlePaymentConfirmed = (event) => {
            console.log('Payment confirmed event received:', event.detail);
            console.log('Refreshing invoices...');
            fetchInvoices();
        };
        
        window.addEventListener('paymentCreated', handlePaymentCreated);
        window.addEventListener('paymentConfirmed', handlePaymentConfirmed);
        
        // Cleanup event listeners
        return () => {
            window.removeEventListener('paymentCreated', handlePaymentCreated);
            window.removeEventListener('paymentConfirmed', handlePaymentConfirmed);
        };
    }, []);

    // Search and filter handlers
    const handleSearch = (search) => {
        setSearchTerm(search);
        fetchInvoices(search, filters, 1, pagination.limit);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        fetchInvoices(searchTerm, newFilters, 1, pagination.limit);
    };

    const handleClearFilters = () => {
        setFilters({});
        setSearchTerm('');
        fetchInvoices('', {}, 1, pagination.limit);
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
        fetchInvoices(searchTerm, filters, page, pagination.limit);
    };

    // Modal handlers
    const handleViewDetails = (invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailsModal(true);
    };

    const handleViewFiles = (invoice) => {
        setSelectedInvoice(invoice);
        setShowFilesModal(true);
    };

    const fetchInvoices = async (search = '', filterParams = {}, page = 1, limit = 10) => {
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
            
            console.log('Fetching invoices with params:', params);
            
            const invoicesResponse = await financialAPI.getInvoices(params);
            const responseData = invoicesResponse?.data;
            
            console.log('Invoices response:', invoicesResponse);
            console.log('Invoices data:', responseData);
            
            if (!responseData) {
                console.warn('No invoices data received');
                setInvoices([]);
                setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
                return;
            }
            
            // Handle paginated response
            if (responseData.data && responseData.pagination) {
                const invoicesWithDetails = responseData.data
                    .filter(invoice => invoice)
                    .map(invoice => ({
                        ...invoice,
                        contractNumber: invoice.contractNumber || 'غير محدد',
                        entityName: invoice.entityName || 'غير محدد',
                        supplierName: invoice.supplierName || 'غير محدد'
                    }));
                
                setInvoices(invoicesWithDetails);
                setPagination({
                    page: responseData.pagination.page,
                    limit: responseData.pagination.limit,
                    totalCount: responseData.pagination.totalCount,
                    totalPages: responseData.pagination.totalPages
                });
            } else {
                // Handle legacy response structure
                const invoices = Array.isArray(responseData) ? responseData : 
                               Array.isArray(responseData?.data) ? responseData.data :
                               Array.isArray(responseData?.items) ? responseData.items :
                               [];
                
                const invoicesWithDetails = invoices
                    .filter(invoice => invoice)
                        .map(invoice => ({
                            ...invoice,
                        contractNumber: invoice.contractNumber || 'غير محدد',
                        entityName: invoice.entityName || 'غير محدد',
                        supplierName: invoice.supplierName || 'غير محدد'
                    }));
                
                setInvoices(invoicesWithDetails);
                setPagination(prev => ({ 
                    ...prev, 
                    totalCount: invoicesWithDetails.length, 
                    totalPages: Math.ceil(invoicesWithDetails.length / limit) 
                }));
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل الفواتير';
            toast.error(errorMessage);
            setInvoices([]);
            setPagination(prev => ({ ...prev, totalCount: 0, totalPages: 0 }));
        } finally {
            setLoading(false);
        }
    };

    const fetchContracts = async () => {
        try {
            const response = await contractsAPI.getAll();
            console.log('Contracts response:', response);
            console.log('Contracts data:', response.data);
            
            if (!response?.data) {
                console.warn('No contracts data received');
                setContracts([]);
                return;
            }
            
            // Handle different response structures
            const contractsData = Array.isArray(response.data) ? response.data : 
                                 Array.isArray(response.data?.data) ? response.data.data :
                                 Array.isArray(response.data?.items) ? response.data.items :
                                 [];
            
            console.log('Processed contracts:', contractsData);
            setContracts(contractsData || []);
        } catch (error) {
            console.error('Error fetching contracts:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في تحميل العقود';
            toast.error(errorMessage);
            setContracts([]); // Set empty array to prevent crashes
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
            
            let response;
            if (selectedInvoice) {
                // Update existing invoice
                response = await financialAPI.updateInvoice(selectedInvoice.id, invoiceData);
                console.log('Update response received:', response);
            } else {
                // Create new invoice
                response = await financialAPI.createInvoice(invoiceData);
                console.log('Create response received:', response);
            }
            
            console.log('Response data:', response?.data);
            
            if (response?.data) {
                toast.success(selectedInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تم إنشاء الفاتورة بنجاح');
                setShowCreateModal(false);
                setSelectedInvoice(null);
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
                fetchInvoices();
            } else {
                toast.warning('تم إرسال الطلب لكن لم يتم تأكيد العملية');
            }
        } catch (error) {
            console.error('Error with invoice:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'فشل في العملية';
            toast.error(errorMessage);
        }
    };

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setShowViewModal(true);
    };

    const handleEditInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setInvoiceForm({
            contractId: invoice.contractId || '',
            invoiceNumber: invoice.invoiceNumber || '',
            amount: invoice.amount || '',
            currencyCode: invoice.currencyCode || 'USD',
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
            taxRate: invoice.taxRate || 0,
            description: invoice.description || '',
            notes: invoice.notes || ''
        });
        setUploadedFiles(invoice.attachments || []);
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

    const handleDeleteInvoice = async (invoice) => {
        if (!window.confirm(`هل أنت متأكد من حذف الفاتورة ${invoice.invoiceNumber}؟`)) {
            return;
        }

        try {
            await financialAPI.deleteInvoice(invoice.id);
            toast.success('تم حذف الفاتورة بنجاح');
            fetchInvoices();
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

    // Filter configuration for invoices
    const filterConfig = {
        status: {
            type: 'select',
            label: 'Status',
            options: [
                { value: 'Draft', label: 'Draft' },
                { value: 'Sent', label: 'Sent' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Overdue', label: 'Overdue' },
                { value: 'PartiallyPaid', label: 'Partially Paid' },
                { value: 'Cancelled', label: 'Cancelled' }
            ]
        },
        dateRange: {
            type: 'dateRange',
            label: 'Issue Date Range',
            colSize: 6
        },
        sortBy: {
            type: 'select',
            label: 'Sort By',
            options: [
                { value: 'invoicenumber', label: 'Invoice Number' },
                { value: 'issuedate', label: 'Issue Date' },
                { value: 'totalamount', label: 'Total Amount' }
            ]
        }
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
                        <FaFileInvoice className="me-2" />
                                {t('invoices.title')}
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
                        searchPlaceholder={t('invoices.searchInvoices')}
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
                        {t('invoices.createInvoice')}
                    </Button>
                </Col>
            </Row>

            {/* Invoices Table */}
            <Row>
                <Col>
                        <div className="chart-wrapper">
                            <div className="chart-title">
                                {t('invoices.title')} ({pagination.totalCount})
                            </div>
                            <Table responsive striped hover>
                                <thead>
                                    <tr>
                                        <th>{t('invoices.invoiceNumber')}</th>
                                        <th>{t('contracts.contractNumber')}</th>
                                        <th>{t('entities.entityName')}</th>
                                        <th>{t('suppliers.supplierName')}</th>
                                        <th>{t('invoices.totalAmount')}</th>
                                        <th>{t('invoices.paidAmount')}</th>
                                        <th>{t('invoices.remainingAmount')}</th>
                                        <th>{t('invoices.dueDate')}</th>
                                        <th>{t('invoices.status')}</th>
                                        <th>{t('invoices.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(invoices || []).map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td>{invoice?.invoiceNumber || t('common.notSpecified')}</td>
                                            <td>{invoice?.contractNumber || t('common.notSpecified')}</td>
                                            <td>{invoice?.entityName || t('common.notSpecified')}</td>
                                            <td>{invoice?.supplierName || t('common.notSpecified')}</td>
                                            <td>{(invoice?.totalAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{(invoice?.paidAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{(invoice?.remainingAmount || 0).toLocaleString()} {invoice?.currencyCode || 'USD'}</td>
                                            <td>{invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US') : t('common.notSpecified')}</td>
                                            <td>{getStatusBadge(invoice?.status)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleViewInvoice(invoice)}
                                                    title={t('common.viewDetails')}
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="me-1"
                                                    onClick={() => handleEditInvoice(invoice)}
                                                    title={t('invoices.editInvoice')}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteInvoice(invoice)}
                                                    title={t('invoices.deleteInvoice')}
                                                >
                                                    <FaTrash />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            
                            {(invoices || []).length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-muted">{t('invoices.noInvoices')}</p>
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

            {/* Create Invoice Modal */}
            <Modal show={showCreateModal} onHide={() => {
                setShowCreateModal(false);
                setSelectedInvoice(null);
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
                setUploadedFiles([]);
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedInvoice ? t('invoices.editInvoice') : t('invoices.createInvoice')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateInvoice}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('invoices.contract')}</Form.Label>
                                    <Form.Select
                                        value={invoiceForm.contractId}
                                        onChange={(e) => setInvoiceForm({...invoiceForm, contractId: e.target.value})}
                                        required
                                    >
                                        <option value="">{t('invoices.selectContract')}</option>
                                        {(contracts || []).map(contract => (
                                            <option key={contract.id} value={contract.id}>
                                                {contract?.contractNumber || t('common.notSpecified')} - {(contract?.amount || 0).toLocaleString()} {contract?.currencyCode || 'USD'}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>{t('invoices.invoiceNumber')}</Form.Label>
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
                                    <Form.Label>{t('invoices.dueDate')}</Form.Label>
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
                                    <Form.Label>{t('invoices.taxRate')}</Form.Label>
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
                        
                        {/* File Upload Section */}
                        <Form.Group className="mb-3">
                            <Form.Label>
                                <FaUpload className="me-2" />
                                {t('invoices.attachments')}
                            </Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                                onChange={handleFileUpload}
                                className="mb-2"
                            />
                            <Form.Text className="text-muted">
                                {t('invoices.fileUploadHelp')}
                            </Form.Text>
                            
                            {/* Uploaded Files List */}
                            {uploadedFiles.length > 0 && (
                                <div className="mt-3">
                                    <h6>{t('invoices.uploadedFiles')} ({uploadedFiles.length})</h6>
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
                            {selectedInvoice ? t('invoices.updateInvoice') : t('invoices.createInvoice')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* View Invoice Modal */}
            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{t('invoices.invoiceDetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedInvoice && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('invoices.invoiceNumber')}:</strong> {selectedInvoice.invoiceNumber}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('contracts.contractNumber')}:</strong> {selectedInvoice.contractNumber}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('entities.entityName')}:</strong> {selectedInvoice.entityName || t('common.notSpecified')}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('suppliers.supplierName')}:</strong> {selectedInvoice.supplierName || t('common.notSpecified')}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('common.amount')}:</strong> {selectedInvoice.amount.toLocaleString()} {selectedInvoice.currencyCode}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('invoices.taxAmount')}:</strong> {selectedInvoice.taxAmount.toLocaleString()} {selectedInvoice.currencyCode}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('invoices.totalAmount')}:</strong> {selectedInvoice.totalAmount.toLocaleString()} {selectedInvoice.currencyCode}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('invoices.paidAmount')}:</strong> {selectedInvoice.paidAmount.toLocaleString()} {selectedInvoice.currencyCode}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('invoices.remainingAmount')}:</strong> {(selectedInvoice?.remainingAmount || 0).toLocaleString()} {selectedInvoice?.currencyCode || 'USD'}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('invoices.status')}:</strong> {getStatusBadge(selectedInvoice?.status)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>{t('invoices.issueDate')}:</strong> {selectedInvoice?.issueDate ? new Date(selectedInvoice.issueDate).toLocaleDateString('en-US') : t('common.notSpecified')}
                                </Col>
                                <Col md={6}>
                                    <strong>{t('invoices.dueDate')}:</strong> {selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString('en-US') : t('common.notSpecified')}
                                </Col>
                            </Row>
                            {selectedInvoice.description && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('common.description')}:</strong> {selectedInvoice.description}
                                    </Col>
                                </Row>
                            )}
                            {selectedInvoice.notes && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('common.notes')}:</strong> {selectedInvoice.notes}
                                    </Col>
                                </Row>
                            )}
                            {selectedInvoice.attachments && selectedInvoice.attachments.length > 0 && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>{t('invoices.attachments')}:</strong>
                                        <div className="mt-2">
                                            {selectedInvoice.attachments.map((attachment, index) => (
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
                    <Button variant="primary">
                        <FaDownload className="me-1" />
{t('invoices.downloadPdf')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
        </div>
    );
};

export default Invoices;
