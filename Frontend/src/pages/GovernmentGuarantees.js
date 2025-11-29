import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Table, Alert, Spinner, Button, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSpinner, FaFileAlt, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import FileUpload from '../components/FileUpload';

const GovernmentGuaranteesPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [guaranteeType, setGuaranteeType] = useState('');
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [form, setForm] = useState({
    quotationId: '',
    guaranteeNumber: '',
    authorityName: '',
    authorityType: '',
    authorityCode: '',
    authorityContactPerson: '',
    authorityContactEmail: '',
    authorityContactPhone: '',
    approvalNumber: '',
    approvalDate: '',
    amount: '',
    currencyCode: 'USD',
    issueDate: '',
    expiryDate: '',
    guaranteeType: 'BidBond',
    status: 'Active',
    notes: '',
    taxAmount: '',
    taxType: '',
    taxRate: '',
    taxRegistrationNumber: '',
    isTaxIncluded: false,
    guaranteeTerms: '',
    isRenewable: false,
    renewalPeriodDays: '',
    profitPercentage: '',
    id: null
  });

  const loadGovernmentGuarantees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/governmentguarantees', { 
        params: { 
          search: query, 
          status: status || undefined,
          guaranteeType: guaranteeType || undefined,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const governmentGuaranteesData = response.data?.data || response.data || [];
      setItems(governmentGuaranteesData);
      
      if (response.data?.totalCount !== undefined) {
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages
        }));
      }
    } catch (err) {
      console.error('Error loading government guarantees:', err);
      setError('Failed to load government guarantees');
      toast.error('Failed to load government guarantees');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotations = async () => {
    setLoadingEntities(true);
    try {
      const response = await api.get('/quotations', { 
        params: { 
          page: 1, 
          pageSize: 1000 
        } 
      });
      const quotationsData = response.data?.data || response.data || [];
      setQuotations(quotationsData);
      console.log('Quotations loaded:', quotationsData.length);
    } catch (err) {
      console.error('Error loading quotations:', err);
      toast.error('Failed to load quotations');
    } finally {
      setLoadingEntities(false);
    }
  };

  const loadCurrencies = async () => {
    try {
      const response = await api.get('/currencies');
      setCurrencies(response.data || []);
      console.log('Currencies loaded:', response.data?.length || 0);
    } catch (err) {
      console.error('Error loading currencies:', err);
      toast.error('Failed to load currencies');
    }
  };

  const load = async () => {
    await Promise.all([loadGovernmentGuarantees(), loadQuotations(), loadCurrencies()]);
  };

  useEffect(() => { 
    loadGovernmentGuarantees(); 
  }, [query, status, guaranteeType, pagination.page]);

  useEffect(() => { 
    loadQuotations(); 
    loadCurrencies();
  }, []);

  // Load entities when modal opens
  useEffect(() => {
    if (show || showEdit) {
      loadQuotations();
      loadCurrencies();
    }
  }, [show, showEdit]);

  const filtered = useMemo(() => items, [items]);

  const handleModalClose = () => {
    setShow(false);
    setShowEdit(false);
    setShowDelete(false);
    setForm({
      quotationId: '',
      guaranteeNumber: '',
      authorityName: '',
      authorityType: '',
      authorityCode: '',
      authorityContactPerson: '',
      authorityContactEmail: '',
      authorityContactPhone: '',
      approvalNumber: '',
      approvalDate: '',
      amount: '',
      currencyCode: 'USD',
      issueDate: '',
      expiryDate: '',
      guaranteeType: 'BidBond',
      status: 'Active',
      notes: '',
      taxAmount: '',
      taxType: '',
      taxRate: '',
      taxRegistrationNumber: '',
      isTaxIncluded: false,
      guaranteeTerms: '',
      isRenewable: false,
      renewalPeriodDays: '',
      profitPercentage: '',
      id: null
    });
    setUploadedFiles([]);
    setSelectedItem(null);
    setError(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setForm({
      quotationId: item.quotationId,
      guaranteeNumber: item.guaranteeNumber,
      authorityName: item.authorityName,
      authorityType: item.authorityType || '',
      authorityCode: item.authorityCode || '',
      authorityContactPerson: item.authorityContactPerson || '',
      authorityContactEmail: item.authorityContactEmail || '',
      authorityContactPhone: item.authorityContactPhone || '',
      approvalNumber: item.approvalNumber || '',
      approvalDate: item.approvalDate ? new Date(item.approvalDate).toISOString().split('T')[0] : '',
      amount: item.amount || '',
      currencyCode: item.currencyCode || 'USD',
      issueDate: item.issueDate ? new Date(item.issueDate).toISOString().split('T')[0] : '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      guaranteeType: item.guaranteeType || 'BidBond',
      status: item.status || 'Active',
      notes: item.notes || '',
      taxAmount: item.taxAmount || '',
      taxType: item.taxType || '',
      taxRate: item.taxRate || '',
      taxRegistrationNumber: item.taxRegistrationNumber || '',
      isTaxIncluded: item.isTaxIncluded || false,
      guaranteeTerms: item.guaranteeTerms || '',
      isRenewable: item.isRenewable || false,
      renewalPeriodDays: item.renewalPeriodDays || '',
      profitPercentage: item.profitPercentage || '',
      id: item.id
    });
    setShowEdit(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDelete(true);
  };

  const createItem = async () => {
    if (!form.quotationId || !form.guaranteeNumber || !form.authorityName || !form.amount || !form.issueDate || !form.expiryDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        quotationId: form.quotationId,
        guaranteeNumber: form.guaranteeNumber,
        authorityName: form.authorityName,
        authorityType: form.authorityType || null,
        authorityCode: form.authorityCode || null,
        authorityContactPerson: form.authorityContactPerson || null,
        authorityContactEmail: form.authorityContactEmail || null,
        authorityContactPhone: form.authorityContactPhone || null,
        approvalNumber: form.approvalNumber || null,
        approvalDate: form.approvalDate || null,
        amount: parseFloat(form.amount),
        currencyCode: form.currencyCode,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        guaranteeType: form.guaranteeType,
        status: form.status,
        notes: form.notes || null,
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : null,
        taxType: form.taxType || null,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
        taxRegistrationNumber: form.taxRegistrationNumber || null,
        isTaxIncluded: form.isTaxIncluded,
        guaranteeTerms: form.guaranteeTerms || null,
        isRenewable: form.isRenewable,
        renewalPeriodDays: form.renewalPeriodDays ? parseInt(form.renewalPeriodDays) : null,
        profitPercentage: form.profitPercentage ? parseFloat(form.profitPercentage) : null
      };

      const response = await api.post('/governmentguarantees', payload);
      toast.success('Government guarantee created successfully');
      handleModalClose();
      await loadGovernmentGuarantees();
    } catch (err) {
      console.error('Error creating government guarantee:', err);
      setError(err.response?.data?.message || 'Failed to create government guarantee');
      toast.error('Failed to create government guarantee');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    if (!form.quotationId || !form.guaranteeNumber || !form.authorityName || !form.amount || !form.issueDate || !form.expiryDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        quotationId: form.quotationId,
        guaranteeNumber: form.guaranteeNumber,
        authorityName: form.authorityName,
        authorityType: form.authorityType || null,
        authorityCode: form.authorityCode || null,
        authorityContactPerson: form.authorityContactPerson || null,
        authorityContactEmail: form.authorityContactEmail || null,
        authorityContactPhone: form.authorityContactPhone || null,
        approvalNumber: form.approvalNumber || null,
        approvalDate: form.approvalDate || null,
        amount: parseFloat(form.amount),
        currencyCode: form.currencyCode,
        issueDate: form.issueDate,
        expiryDate: form.expiryDate,
        guaranteeType: form.guaranteeType,
        status: form.status,
        notes: form.notes || null,
        taxAmount: form.taxAmount ? parseFloat(form.taxAmount) : null,
        taxType: form.taxType || null,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
        taxRegistrationNumber: form.taxRegistrationNumber || null,
        isTaxIncluded: form.isTaxIncluded,
        guaranteeTerms: form.guaranteeTerms || null,
        isRenewable: form.isRenewable,
        renewalPeriodDays: form.renewalPeriodDays ? parseInt(form.renewalPeriodDays) : null,
        profitPercentage: form.profitPercentage ? parseFloat(form.profitPercentage) : null
      };

      await api.put(`/governmentguarantees/${form.id}`, payload);
      toast.success('Government guarantee updated successfully');
      handleModalClose();
      await loadGovernmentGuarantees();
    } catch (err) {
      console.error('Error updating government guarantee:', err);
      setError(err.response?.data?.message || 'Failed to update government guarantee');
      toast.error('Failed to update government guarantee');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      await api.delete(`/governmentguarantees/${selectedItem.id}`);
      toast.success('Government guarantee deleted successfully');
      handleModalClose();
      await loadGovernmentGuarantees();
    } catch (err) {
      console.error('Error deleting government guarantee:', err);
      toast.error('Failed to delete government guarantee');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    if (!status || typeof status !== 'string') return 'secondary';
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'expired': return 'danger';
      case 'cancelled': return 'secondary';
      case 'renewed': return 'info';
      default: return 'secondary';
    }
  };

  const getGuaranteeTypeBadgeVariant = (type) => {
    if (!type || typeof type !== 'string') return 'secondary';
    switch (type.toLowerCase()) {
      case 'bidbond': return 'primary';
      case 'performance': return 'warning';
      case 'advance': return 'info';
      case 'warranty': return 'success';
      default: return 'secondary';
    }
  };

  const handleViewDetails = (guarantee) => {
    setSelectedGuarantee(guarantee);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (guarantee) => {
    setSelectedGuarantee(guarantee);
    setShowFilesModal(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Government Guarantees</h2>
        <p className="text-muted">Manage government guarantees and bonds</p>
        <Button 
          variant="primary" 
          onClick={() => setShow(true)}
          className="d-flex align-items-center gap-2"
        >
          <FaPlus /> New Government Guarantee
        </Button>
      </div>

      <div className="alert-card">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Label>Search</Form.Label>
            <Form.Control 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search by guarantee number or authority name" 
            />
          </Col>
          <Col md={3}>
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Renewed">Renewed</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Guarantee Type</Form.Label>
            <Form.Select value={guaranteeType} onChange={e => setGuaranteeType(e.target.value)}>
              <option value="">All Types</option>
              <option value="BidBond">Bid Bond</option>
              <option value="Performance">Performance</option>
              <option value="Advance">Advance</option>
              <option value="Warranty">Warranty</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setQuery('');
                setStatus('');
                setGuaranteeType('');
              }}
              className="w-100"
            >
              Clear
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="chart-wrapper">
        {loading ? (
          <div className="text-center p-4">
            <FaSpinner className="fa-spin me-2" />
            Loading government guarantees...
          </div>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Guarantee Number</th>
                <th>Authority Name</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Type</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Supplier</th>
                <th>Details</th>
                <th>Files</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filtered) && filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-medium">{item.guaranteeNumber}</div>
                    {item.authorityType && (
                      <small className="text-muted">{item.authorityType}</small>
                    )}
                  </td>
                  <td>{item.authorityName}</td>
                  <td>
                    {item.amount ? `$${parseFloat(item.amount).toLocaleString()}` : '-'}
                    {item.calculatedProfit && (
                      <div className="text-success small">
                        Profit: ${parseFloat(item.calculatedProfit).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge bg="info">{item.currencyCode || 'N/A'}</Badge>
                  </td>
                  <td>
                    <Badge bg={getGuaranteeTypeBadgeVariant(item.guaranteeType)}>
                      {item.guaranteeType || 'N/A'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getStatusBadgeVariant(item.status)}>
                      {item.status || 'N/A'}
                    </Badge>
                  </td>
                  <td>
                    {item.issueDate ? new Date(item.issueDate).toLocaleDateString('en-US') : '-'}
                  </td>
                  <td>
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('en-US') : '-'}
                  </td>
                  <td>{item.supplierName || '-'}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewDetails(item)}
                      title="View Details"
                    >
                      <FaEye />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleViewFiles(item)}
                      title="View Files"
                    >
                      <FaFileAlt />
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(item)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.isArray(filtered) && filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center p-4 text-muted">
                    No government guarantees found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="d-flex align-items-center px-3">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button 
              variant="outline-primary" 
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal show={show} onHide={handleModalClose} size="xl">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaPlus className="me-2" />
            New Government Guarantee
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quotation *</Form.Label>
                <Form.Select 
                  value={form.quotationId} 
                  onChange={e => setForm({ ...form, quotationId: e.target.value })}
                  isInvalid={!form.quotationId}
                  disabled={loadingEntities}
                >
                  <option value="">
                    {loadingEntities ? 'Loading quotations...' : '-- Select Quotation --'}
                  </option>
                  {Array.isArray(quotations) && quotations.length > 0 ? (
                    quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.supplierName} - ${q.amount} {q.currencyCode}
                      </option>
                    ))
                  ) : (
                    !loadingEntities && (
                      <option value="" disabled>No quotations available</option>
                    )
                  )}
                </Form.Select>
                {loadingEntities && (
                  <div className="d-flex align-items-center mt-1">
                    <FaSpinner className="fa-spin me-2" />
                    <small className="text-muted">Loading quotations...</small>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Guarantee Number *</Form.Label>
                <Form.Control 
                  value={form.guaranteeNumber} 
                  onChange={e => setForm({ ...form, guaranteeNumber: e.target.value })}
                  placeholder="Enter guarantee number"
                  isInvalid={!form.guaranteeNumber}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Authority Name *</Form.Label>
                <Form.Control 
                  value={form.authorityName} 
                  onChange={e => setForm({ ...form, authorityName: e.target.value })}
                  placeholder="Enter authority name"
                  isInvalid={!form.authorityName}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Authority Type</Form.Label>
                <Form.Control 
                  value={form.authorityType} 
                  onChange={e => setForm({ ...form, authorityType: e.target.value })}
                  placeholder="Enter authority type"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  isInvalid={!form.amount}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Currency *</Form.Label>
                <Form.Select 
                  value={form.currencyCode} 
                  onChange={e => setForm({ ...form, currencyCode: e.target.value })}
                  isInvalid={!form.currencyCode}
                >
                  <option value="">-- Select Currency --</option>
                  {Array.isArray(currencies) && currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Guarantee Type *</Form.Label>
                <Form.Select 
                  value={form.guaranteeType} 
                  onChange={e => setForm({ ...form, guaranteeType: e.target.value })}
                  isInvalid={!form.guaranteeType}
                >
                  <option value="BidBond">Bid Bond</option>
                  <option value="Performance">Performance</option>
                  <option value="Advance">Advance</option>
                  <option value="Warranty">Warranty</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Issue Date *</Form.Label>
                <Form.Control 
                  type="date" 
                  value={form.issueDate} 
                  onChange={e => setForm({ ...form, issueDate: e.target.value })}
                  isInvalid={!form.issueDate}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date *</Form.Label>
                <Form.Control 
                  type="date" 
                  value={form.expiryDate} 
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  isInvalid={!form.expiryDate}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Enter additional notes"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>File Attachments</Form.Label>
            <FileUpload
              onFileUploaded={(file) => {
                setUploadedFiles(prev => [...prev, file]);
              }}
              onFileRemoved={(file) => {
                setUploadedFiles(prev => prev.filter(f => f.savedFileName !== file.savedFileName));
              }}
              multiple={true}
              maxFiles={5}
              existingFiles={uploadedFiles}
              description="Upload government guarantee documents and certificates"
              entityId={form.id}
              entityType="governmentguarantee"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={createItem} 
            disabled={!form.quotationId || !form.guaranteeNumber || !form.authorityName || !form.amount || !form.issueDate || !form.expiryDate || loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Create Government Guarantee
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={handleModalClose} size="xl">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title className="d-flex align-items-center">
            <FaEdit className="me-2" />
            Edit Government Guarantee
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {error && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Quotation *</Form.Label>
                <Form.Select 
                  value={form.quotationId} 
                  onChange={e => setForm({ ...form, quotationId: e.target.value })}
                  isInvalid={!form.quotationId}
                  disabled={loadingEntities}
                >
                  <option value="">
                    {loadingEntities ? 'Loading quotations...' : '-- Select Quotation --'}
                  </option>
                  {Array.isArray(quotations) && quotations.length > 0 ? (
                    quotations.map(q => (
                      <option key={q.id} value={q.id}>
                        {q.supplierName} - ${q.amount} {q.currencyCode}
                      </option>
                    ))
                  ) : (
                    !loadingEntities && (
                      <option value="" disabled>No quotations available</option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Guarantee Number *</Form.Label>
                <Form.Control 
                  value={form.guaranteeNumber} 
                  onChange={e => setForm({ ...form, guaranteeNumber: e.target.value })}
                  placeholder="Enter guarantee number"
                  isInvalid={!form.guaranteeNumber}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Authority Name *</Form.Label>
                <Form.Control 
                  value={form.authorityName} 
                  onChange={e => setForm({ ...form, authorityName: e.target.value })}
                  placeholder="Enter authority name"
                  isInvalid={!form.authorityName}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Authority Type</Form.Label>
                <Form.Control 
                  value={form.authorityType} 
                  onChange={e => setForm({ ...form, authorityType: e.target.value })}
                  placeholder="Enter authority type"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={form.amount} 
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  isInvalid={!form.amount}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Currency *</Form.Label>
                <Form.Select 
                  value={form.currencyCode} 
                  onChange={e => setForm({ ...form, currencyCode: e.target.value })}
                  isInvalid={!form.currencyCode}
                >
                  <option value="">-- Select Currency --</option>
                  {Array.isArray(currencies) && currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Guarantee Type *</Form.Label>
                <Form.Select 
                  value={form.guaranteeType} 
                  onChange={e => setForm({ ...form, guaranteeType: e.target.value })}
                  isInvalid={!form.guaranteeType}
                >
                  <option value="BidBond">Bid Bond</option>
                  <option value="Performance">Performance</option>
                  <option value="Advance">Advance</option>
                  <option value="Warranty">Warranty</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Issue Date *</Form.Label>
                <Form.Control 
                  type="date" 
                  value={form.issueDate} 
                  onChange={e => setForm({ ...form, issueDate: e.target.value })}
                  isInvalid={!form.issueDate}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiry Date *</Form.Label>
                <Form.Control 
                  type="date" 
                  value={form.expiryDate} 
                  onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  isInvalid={!form.expiryDate}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={form.notes} 
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Enter additional notes"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>File Attachments</Form.Label>
            <FileUpload
              onFileUploaded={(file) => {
                setUploadedFiles(prev => [...prev, file]);
              }}
              onFileRemoved={(file) => {
                setUploadedFiles(prev => prev.filter(f => f.savedFileName !== file.savedFileName));
              }}
              multiple={true}
              maxFiles={5}
              existingFiles={uploadedFiles}
              description="Upload government guarantee documents and certificates"
              entityId={form.id}
              entityType="governmentguarantee"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="warning" 
            onClick={updateItem} 
            disabled={!form.quotationId || !form.guaranteeNumber || !form.authorityName || !form.amount || !form.issueDate || !form.expiryDate || loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Update Government Guarantee
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDelete} onHide={handleModalClose}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaTrash className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>Are you sure you want to delete this government guarantee?</p>
          {selectedItem && (
            <div className="bg-light p-3 rounded">
              <strong>Guarantee Number:</strong> {selectedItem.guaranteeNumber}<br />
              <strong>Authority Name:</strong> {selectedItem.authorityName}<br />
              <strong>Amount:</strong> ${parseFloat(selectedItem.amount).toLocaleString()}
            </div>
          )}
          <p className="text-danger mt-3">
            <strong>Warning:</strong> This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={deleteItem} 
            disabled={loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Delete Government Guarantee
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Government Guarantee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuarantee && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Guarantee Number:</strong> {selectedGuarantee.guaranteeNumber}
                </Col>
                <Col md={6}>
                  <strong>Authority Name:</strong> {selectedGuarantee.authorityName}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Amount:</strong> {selectedGuarantee.amount ? `$${parseFloat(selectedGuarantee.amount).toLocaleString()}` : '-'}
                </Col>
                <Col md={6}>
                  <strong>Currency:</strong> {selectedGuarantee.currencyCode || 'N/A'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Type:</strong> 
                  <Badge bg={getGuaranteeTypeBadgeVariant(selectedGuarantee.guaranteeType)} className="ms-2">
                    {selectedGuarantee.guaranteeType || 'N/A'}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> 
                  <Badge bg={getStatusBadgeVariant(selectedGuarantee.status)} className="ms-2">
                    {selectedGuarantee.status || 'N/A'}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Issue Date:</strong> {selectedGuarantee.issueDate ? new Date(selectedGuarantee.issueDate).toLocaleDateString('en-US') : '-'}
                </Col>
                <Col md={6}>
                  <strong>Expiry Date:</strong> {selectedGuarantee.expiryDate ? new Date(selectedGuarantee.expiryDate).toLocaleDateString('en-US') : '-'}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Supplier:</strong> {selectedGuarantee.supplierName || '-'}
                </Col>
                <Col md={6}>
                  <strong>Authority Type:</strong> {selectedGuarantee.authorityType || '-'}
                </Col>
              </Row>
              {selectedGuarantee.notes && (
                <Row className="mb-3">
                  <Col>
                    <strong>Notes:</strong> {selectedGuarantee.notes}
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Files Modal */}
      <Modal show={showFilesModal} onHide={() => setShowFilesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Government Guarantee Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuarantee && (
            <div>
              <h6>Guarantee Number: {selectedGuarantee.guaranteeNumber}</h6>
              <div className="mt-3">
                {selectedGuarantee.attachments && selectedGuarantee.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedGuarantee.attachments.map((file, index) => (
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
                  <p className="text-muted">No files available</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GovernmentGuaranteesPage;
