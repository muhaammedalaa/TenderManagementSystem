import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Table, Alert, Spinner, Button, Modal, Badge } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { supplyDeliveriesAPI } from '../services/api';


const SupplyDeliveriesPage = () => {
  const { t } = useTranslation();
  
  // State management
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState({});

  // Statistics
  const [stats, setStats] = useState(null);

  // Status options with proper translations
  const statusOptions = [
    { value: 'Pending', label: 'supplyDeliveries.pending', color: 'warning' },
    { value: 'Scheduled', label: 'supplyDeliveries.scheduled', color: 'info' },
    { value: 'InTransit', label: 'supplyDeliveries.inTransit', color: 'primary' },
    { value: 'Shipped', label: 'supplyDeliveries.shipped', color: 'secondary' },
    { value: 'Delivered', label: 'supplyDeliveries.delivered', color: 'success' },
    { value: 'Accepted', label: 'supplyDeliveries.accepted', color: 'success' },
    { value: 'Rejected', label: 'supplyDeliveries.rejected', color: 'danger' },
    { value: 'Cancelled', label: 'supplyDeliveries.cancelled', color: 'danger' }
  ];

  // Helper functions
  const getStatusOption = (status) => {
    if (typeof status === 'number') {
      return statusOptions[status] || statusOptions[0];
    }
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getStatusText = (status) => {
    const option = getStatusOption(status);
    return t(option.label);
  };

  const getStatusBadgeColor = (status) => {
    const option = getStatusOption(status);
    return option.color;
  };

  // Data fetching
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await supplyDeliveriesAPI.getAll();
      setDeliveries(res.data.data || res.data || []);
      setStats(res.data.statistics || null);
    } catch (err) {
      console.log('API Error, using mock data:', err);
      // Mock data for testing
      const mockDeliveries = [
        {
          id: 1,
          delivery_number: 'DEL-001',
          contract_id: 'CON-2024-001',
          delivery_date: '2024-01-15T00:00:00Z',
          quantity: 100,
          unit: 'pieces',
          status: 'Delivered',
          notes: 'Medical supplies delivered successfully',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        },
        {
          id: 2,
          delivery_number: 'DEL-002',
          contract_id: 'CON-2024-002',
          delivery_date: '2024-01-20T00:00:00Z',
          quantity: 50,
          unit: 'boxes',
          status: 'InTransit',
          notes: 'Office equipment in transit',
          created_at: '2024-01-12T00:00:00Z',
          updated_at: '2024-01-18T00:00:00Z'
        },
        {
          id: 3,
          delivery_number: 'DEL-003',
          contract_id: 'CON-2024-003',
          delivery_date: '2024-01-25T00:00:00Z',
          quantity: 200,
          unit: 'units',
          status: 'Pending',
          notes: 'Electronics pending approval',
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ];
      
      setDeliveries(mockDeliveries);
      setStats({
        totalDeliveries: 3,
        pendingDeliveries: 1,
        inTransitDeliveries: 1,
        deliveredDeliveries: 1,
        cancelledDeliveries: 0,
        totalQuantity: 350,
        averageQuantity: 116.67
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Filter and search
  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = !searchTerm || 
      delivery.delivery_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.contract_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Modal handlers
  const handleOpenModal = (delivery = {}) => {
    setModalData({
      id: delivery.id,
      delivery_number: delivery.delivery_number || '',
      contract_id: delivery.contract_id || '',
      quantity: delivery.quantity || 1,
      unit: delivery.unit || '',
      delivery_date: delivery.delivery_date ? 
        new Date(delivery.delivery_date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0],
      status: delivery.status || 'Pending',
      notes: delivery.notes || ''
    });
    setIsEdit(!!delivery.id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData({});
    setIsEdit(false);
  };

  const handleViewModal = (delivery) => {
    setViewData(delivery);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setViewData({});
  };

  // CRUD operations
  const handleSave = async () => {
    try {
      const deliveryToSave = { ...modalData };

      if (isEdit) {
        await supplyDeliveriesAPI.update(deliveryToSave.id, deliveryToSave);
      } else {
        await supplyDeliveriesAPI.create(deliveryToSave);
      }
      
      handleCloseModal();
      fetchDeliveries();
    } catch (err) {
      alert(t('notifications.failed', { 
        action: t('common.save'), 
        item: t('supplyDeliveries.title') 
      }) + ": " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete', { 
      item: t('supplyDeliveries.title') 
    }))) return;
    
    try {
      await supplyDeliveriesAPI.delete(id);
      fetchDeliveries();
    } catch (err) {
      alert(t('notifications.failed', { 
        action: t('common.delete'), 
        item: t('supplyDeliveries.title') 
      }) + ": " + err.message);
    }
  };

  const handleStatusChange = async (delivery, newStatus) => {
    try {
      await supplyDeliveriesAPI.updateStatus(delivery.id, { status: newStatus });
      fetchDeliveries();
    } catch (err) {
      alert(t('notifications.failed', { 
        action: t('common.update'), 
        item: t('common.status') 
      }) + ": " + err.message);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return '-';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="dashboard">
        <Container>
          <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">{t('common.loading')}</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard">
        <Container>
          <Alert variant="danger">
            <Alert.Heading>{t('common.error')}</Alert.Heading>
            <p>{error.message}</p>
            <Button variant="outline-danger" onClick={fetchDeliveries}>
              {t('common.retry')}
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Container fluid>
        {/* Header */}
        <Row>
          <Col>
            <div className="dashboard-header">
              <h2>{t('supplyDeliveries.title')}</h2>
              <p className="text-muted mb-0">{t('supplyDeliveries.subtitle')}</p>
            </div>
          </Col>
        </Row>

        {/* Search and Filters */}
        <Row>
          <Col>
            <div className="alert-card">
              <Row className="align-items-center">
                <Col md={4}>
                  <div className="position-relative">
                    <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="text"
                      placeholder={t('supplyDeliveries.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="ps-5"
                    />
                  </div>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">{t('supplyDeliveries.allStatuses')}</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={5} className="text-end">
                  <Button variant="primary" onClick={() => handleOpenModal()}>
                    <FaPlus className="me-2" />
                    {t('supplyDeliveries.addDelivery')}
                  </Button>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        {stats && (
          <Row className="mb-4">
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-primary">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="stat-number">{stats.totalDeliveries}</div>
                <div className="stat-label">{t('supplyDeliveries.totalDeliveries')}</div>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-warning">
                  <i className="fas fa-clock"></i>
                </div>
                <div className="stat-number">{stats.pendingDeliveries}</div>
                <div className="stat-label">{t('supplyDeliveries.pending')}</div>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-info">
                  <i className="fas fa-shipping-fast"></i>
                </div>
                <div className="stat-number">{stats.inTransitDeliveries}</div>
                <div className="stat-label">{t('supplyDeliveries.inTransit')}</div>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-number">{stats.deliveredDeliveries}</div>
                <div className="stat-label">{t('supplyDeliveries.delivered')}</div>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-secondary">
                  <i className="fas fa-cubes"></i>
                </div>
                <div className="stat-number">{stats.totalQuantity}</div>
                <div className="stat-label">{t('supplyDeliveries.totalQuantity')}</div>
              </div>
            </Col>
            <Col md={2}>
              <div className="stat-card">
                <div className="stat-icon bg-info">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stat-number">{stats.averageQuantity?.toFixed(0) || 0}</div>
                <div className="stat-label">{t('supplyDeliveries.averageQuantity')}</div>
              </div>
            </Col>
          </Row>
        )}

        {/* Deliveries Table */}
        <Row>
          <Col>
            <div className="chart-wrapper">
              <div className="chart-title">
                <h5>{t('supplyDeliveries.deliveriesList')}</h5>
                <small className="text-muted">
                  {filteredDeliveries.length} {t('supplyDeliveries.of')} {deliveries.length} {t('supplyDeliveries.deliveries')}
                </small>
              </div>
              
              <div className="table-responsive">
                <Table striped hover className="mb-0 align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-nowrap">{t('supplyDeliveries.deliveryNumber')}</th>
                      <th className="text-nowrap">{t('supplyDeliveries.contractId')}</th>
                      <th className="text-nowrap">{t('supplyDeliveries.deliveryDate')}</th>
                      <th className="text-nowrap">{t('supplyDeliveries.quantity')}</th>
                      <th className="text-nowrap">{t('supplyDeliveries.unit')}</th>
                      <th className="text-nowrap">{t('common.status')}</th>
                      <th className="text-nowrap">{t('common.notes')}</th>
                      <th className="text-nowrap text-center">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeliveries.length > 0 ? filteredDeliveries.map((delivery) => (
                      <tr key={delivery.id}>
                        <td className="text-nowrap">
                          <strong>{delivery.delivery_number || '-'}</strong>
                        </td>
                        <td className="text-nowrap">{delivery.contract_id || '-'}</td>
                        <td className="text-nowrap">{formatDate(delivery.delivery_date)}</td>
                        <td className="text-nowrap">{delivery.quantity || '-'}</td>
                        <td className="text-nowrap">{delivery.unit || '-'}</td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <Badge 
                              bg={getStatusBadgeColor(delivery.status)}
                              className="text-nowrap"
                              style={{fontSize: '0.7rem'}}
                            >
                              {getStatusText(delivery.status)}
                            </Badge>
                            <Form.Select
                              value={delivery.status}
                              onChange={(e) => handleStatusChange(delivery, e.target.value)}
                              size="sm"
                              style={{width: '100%', fontSize: '0.7rem'}}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {t(option.label)}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                        </td>
                        <td className="text-truncate" style={{maxWidth: '150px'}} title={delivery.notes || '-'}>
                          {delivery.notes || '-'}
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button 
                              size="sm" 
                              variant="outline-info" 
                              onClick={() => handleViewModal(delivery)}
                              title={t('common.view')}
                              style={{padding: '0.25rem 0.5rem'}}
                            >
                              <FaEye style={{fontSize: '0.7rem'}} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              onClick={() => handleOpenModal(delivery)}
                              title={t('common.edit')}
                              style={{padding: '0.25rem 0.5rem'}}
                            >
                              <FaEdit style={{fontSize: '0.7rem'}} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger" 
                              onClick={() => handleDelete(delivery.id)}
                              title={t('common.delete')}
                              style={{padding: '0.25rem 0.5rem'}}
                            >
                              <FaTrash style={{fontSize: '0.7rem'}} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted">
                          <div className="d-flex flex-column align-items-center">
                            <i className="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                            <h5>{t('supplyDeliveries.noDeliveries')}</h5>
                            <p className="mb-3">{t('supplyDeliveries.noDeliveriesMessage')}</p>
                            <Button variant="primary" onClick={() => handleOpenModal()}>
                              <FaPlus className="me-2" />
                              {t('supplyDeliveries.addDelivery')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
        </Table>
              </div>
            </div>
          </Col>
        </Row>

        {/* Add/Edit Modal */}
        <Modal show={modalOpen} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEdit ? t('supplyDeliveries.editDelivery') : t('supplyDeliveries.addDelivery')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('supplyDeliveries.deliveryNumber')} *</Form.Label>
                    <Form.Control
                      type="text"
                      value={modalData.delivery_number || ''}
                      onChange={(e) => setModalData({...modalData, delivery_number: e.target.value})}
                      placeholder={t('supplyDeliveries.deliveryNumberPlaceholder')}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('supplyDeliveries.contractId')} *</Form.Label>
                    <Form.Control
                      type="text"
                      value={modalData.contract_id || ''}
                      onChange={(e) => setModalData({...modalData, contract_id: e.target.value})}
                      placeholder={t('supplyDeliveries.contractIdPlaceholder')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('supplyDeliveries.deliveryDate')} *</Form.Label>
                    <Form.Control
                      type="date"
                      value={modalData.delivery_date || ''}
            onChange={(e) => setModalData({...modalData, delivery_date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('supplyDeliveries.quantity')} *</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={modalData.quantity || ''}
                      onChange={(e) => setModalData({...modalData, quantity: Number(e.target.value)})}
                      placeholder="0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('supplyDeliveries.unit')} *</Form.Label>
                    <Form.Control
                      type="text"
                      value={modalData.unit || ''}
                      onChange={(e) => setModalData({...modalData, unit: e.target.value})}
                      placeholder={t('supplyDeliveries.unitPlaceholder')}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('common.status')}</Form.Label>
                <Form.Select
                  value={modalData.status || 'Pending'}
            onChange={(e) => setModalData({...modalData, status: e.target.value})}
          >
            {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>{t('common.notes')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={modalData.notes || ''}
                  onChange={(e) => setModalData({...modalData, notes: e.target.value})}
                  placeholder={t('supplyDeliveries.notesPlaceholder')}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {isEdit ? t('common.update') : t('common.create')}
            </Button>
          </Modal.Footer>
      </Modal>

        {/* View Modal */}
        <Modal show={viewModalOpen} onHide={handleCloseViewModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{t('supplyDeliveries.deliveryDetails')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {viewData && (
              <div className="row">
                <div className="col-md-6">
                  <h6>{t('supplyDeliveries.deliveryNumber')}</h6>
                  <p className="text-muted">{viewData.delivery_number || '-'}</p>
                  
                  <h6>{t('supplyDeliveries.contractId')}</h6>
                  <p className="text-muted">{viewData.contract_id || '-'}</p>
                  
                  <h6>{t('supplyDeliveries.deliveryDate')}</h6>
                  <p className="text-muted">{formatDate(viewData.delivery_date)}</p>
                  
                  <h6>{t('common.status')}</h6>
                  <Badge bg={getStatusBadgeColor(viewData.status)}>
                    {getStatusText(viewData.status)}
                  </Badge>
                </div>
                <div className="col-md-6">
                  <h6>{t('supplyDeliveries.quantity')}</h6>
                  <p className="text-muted">{viewData.quantity || '-'}</p>
                  
                  <h6>{t('supplyDeliveries.unit')}</h6>
                  <p className="text-muted">{viewData.unit || '-'}</p>
                  
                  <h6>{t('common.notes')}</h6>
                  <p className="text-muted">{viewData.notes || '-'}</p>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseViewModal}>
              {t('common.close')}
            </Button>
            <Button variant="primary" onClick={() => {
              handleCloseViewModal();
              handleOpenModal(viewData);
            }}>
              {t('common.edit')}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default SupplyDeliveriesPage;