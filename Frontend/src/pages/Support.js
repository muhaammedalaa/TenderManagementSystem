import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Table, Button, Modal, Alert, Badge, Container, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileUpload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import FileUpload from '../components/FileUpload';

const SupportPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [entities, setEntities] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ 
    entityId: '', 
    title: '', 
    category: '', 
    priority: 'Normal', 
    description: '', 
    totalAmount: '', 
    profitPercentage: '', 
    id: null 
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });

  const loadSupportMatters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/supportmatters', { 
        params: { 
          search: query, 
          status: status || undefined,
          category: category || undefined,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const supportData = response.data?.data || response.data || [];
      setItems(supportData);
      
      if (response.data?.totalCount !== undefined) {
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages
        }));
      }
    } catch (err) {
      console.error('Error loading support matters:', err);
      setError('Failed to load support matters');
      toast.error('Failed to load support matters');
    } finally {
      setLoading(false);
    }
  };

  const loadEntities = async () => {
    console.log('Starting to load entities...');
    setLoadingEntities(true);
    try {
      // Try to get all entities without pagination
      const response = await api.get('/entities', { 
        params: { 
          page: 1, 
          pageSize: 1000 // Get all entities
        } 
      });
      console.log('Entities API response:', response);
      
      // Handle both paginated and non-paginated responses
      const entitiesData = response.data?.data || response.data || [];
      setEntities(entitiesData);
      console.log('Entities loaded successfully:', entitiesData);
      console.log('Entities count:', entitiesData.length);
      
      // Check if entities were loaded successfully
      if (entitiesData.length === 0) {
        console.warn('No entities found in the database. Please check if entities are seeded.');
        toast.warning('No entities found. Please check if entities are available in the database.');
      }
    } catch (err) {
      console.error('Error loading entities:', err);
      console.error('Error details:', err.response?.data);
      toast.error('Failed to load entities');
    } finally {
      setLoadingEntities(false);
    }
  };

  const load = async () => {
    await Promise.all([loadSupportMatters(), loadEntities()]);
  };

  useEffect(() => { 
    loadSupportMatters(); 
  }, [query, status, category, pagination.page]);

  useEffect(() => { 
    loadEntities(); 
  }, []);

  // Load entities when modal opens
  useEffect(() => {
    if (show || showEdit) {
      console.log('Modal opened, loading entities...');
      loadEntities();
    }
  }, [show, showEdit]);

  const filtered = useMemo(() => items, [items]);

  const handleModalClose = () => {
    setShow(false);
    setShowEdit(false);
    setShowDelete(false);
    setForm({ 
      entityId: '', 
      title: '', 
      category: '', 
      priority: 'Normal', 
      description: '', 
      totalAmount: '', 
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
      entityId: item.entityId,
      title: item.title,
      category: item.category,
      priority: item.priority,
      description: item.description || '',
      totalAmount: item.totalAmount || '',
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
    if (!form.entityId || !form.title || !form.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        entityId: form.entityId,
        title: form.title,
        category: form.category,
        priority: form.priority,
        description: form.description || null,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        profitPercentage: form.profitPercentage ? parseFloat(form.profitPercentage) : null
      };

      const response = await api.post('/supportmatters', payload);
      toast.success('Support matter created successfully');
      handleModalClose();
      await load();
    } catch (err) {
      console.error('Error creating support matter:', err);
      setError(err.response?.data?.message || 'Failed to create support matter');
      toast.error('Failed to create support matter');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async () => {
    if (!form.entityId || !form.title || !form.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        entityId: form.entityId,
        title: form.title,
        category: form.category,
        priority: form.priority,
        description: form.description || null,
        totalAmount: form.totalAmount ? parseFloat(form.totalAmount) : null,
        profitPercentage: form.profitPercentage ? parseFloat(form.profitPercentage) : null
      };

      await api.put(`/supportmatters/${form.id}`, payload);
      toast.success('Support matter updated successfully');
      handleModalClose();
      await load();
    } catch (err) {
      console.error('Error updating support matter:', err);
      setError(err.response?.data?.message || 'Failed to update support matter');
      toast.error('Failed to update support matter');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      await api.delete(`/supportmatters/${selectedItem.id}`);
      toast.success('Support matter deleted successfully');
      handleModalClose();
      await load();
    } catch (err) {
      console.error('Error deleting support matter:', err);
      toast.error('Failed to delete support matter');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'normal': return 'primary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'success';
      case 'inprogress': return 'warning';
      case 'closed': return 'secondary';
      case 'resolved': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard">
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2>Support Matters</h2>
            </div>
          </Col>
          <Col md="auto">
            <Button 
              variant="primary" 
              onClick={() => setShow(true)}
              className="d-flex align-items-center gap-2"
            >
              <FaPlus /> New Support Matter
            </Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <div className="alert-card">
              <Form.Label>Search</Form.Label>
              <Form.Control 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                placeholder="Search by title or description" 
              />
            </div>
          </Col>
          <Col md={3}>
            <div className="alert-card">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="InProgress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </div>
          </Col>
          <Col md={3}>
            <div className="alert-card">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                placeholder="Filter by category" 
              />
            </div>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setQuery('');
                setStatus('');
                setCategory('');
              }}
              className="w-100"
            >
              Clear
            </Button>
          </Col>
        </Row>

        {error && (
          <Row className="mb-4">
            <Col>
              <div className="alert-card">
                <Alert variant="danger" className="mb-0">
                  {error}
                </Alert>
              </div>
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            <div className="chart-wrapper">
              <div className="chart-title">
                Support Matters
              </div>
              {loading ? (
                <div className="text-center p-4">
                  <FaSpinner className="fa-spin me-2" />
                  Loading support matters...
                </div>
              ) : (
                <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Entity</th>
                  <th>Total Amount</th>
                  <th>Profit %</th>
                  <th>Calculated Profit</th>
                  <th>Opened</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filtered) && filtered.map(item => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-medium">{item.title}</div>
                      {item.description && (
                        <small className="text-muted">{item.description.substring(0, 50)}...</small>
                      )}
                    </td>
                    <td>
                      <Badge bg="info">{item.category}</Badge>
                    </td>
                    <td>
                      <Badge bg={getPriorityBadgeVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.entityName || entities.find(e => e.id === item.entityId)?.name || '-'}</td>
                    <td>
                      {item.totalAmount ? `$${parseFloat(item.totalAmount).toLocaleString()}` : '-'}
                    </td>
                    <td>
                      {item.profitPercentage ? `${item.profitPercentage}%` : '-'}
                    </td>
                    <td>
                      {item.calculatedProfit ? `$${parseFloat(item.calculatedProfit).toLocaleString()}` : '-'}
                    </td>
                    <td>
                      {item.openedAtUtc ? new Date(item.openedAtUtc).toLocaleDateString() : '-'}
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
                    <td colSpan={10} className="text-center p-4 text-muted">
                      No support matters found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
            </div>
          </Col>
        </Row>

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
      <Modal show={show} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaPlus className="me-2" />
            New Support Matter
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Entity *</Form.Label>
                <Form.Select 
                  value={form.entityId} 
                  onChange={e => setForm({ ...form, entityId: e.target.value })}
                  isInvalid={!form.entityId}
                  disabled={loadingEntities}
                >
                  <option value="">
                    {loadingEntities ? 'Loading entities...' : '-- Select Entity --'}
                  </option>
                  {Array.isArray(entities) && entities.length > 0 ? (
                    entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))
                  ) : (
                    !loadingEntities && (
                      <option value="" disabled>No entities available</option>
                    )
                  )}
                </Form.Select>
                {loadingEntities && (
                  <div className="d-flex align-items-center mt-1">
                    <FaSpinner className="fa-spin me-2" />
                    <small className="text-muted">Loading entities...</small>
                  </div>
                )}
                {!loadingEntities && entities.length === 0 && (
                  <div className="mt-1">
                    <small className="text-warning">No entities found. Please check if entities are available.</small>
                    <div className="mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={loadEntities}
                        disabled={loadingEntities}
                      >
                        {loadingEntities ? <FaSpinner className="fa-spin me-1" /> : null}
                        Refresh Entities
                      </Button>
                    </div>
                  </div>
                )}
                {!loadingEntities && entities.length > 0 && (
                  <div className="mt-1">
                    <small className="text-success">{entities.length} entities loaded</small>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter support matter title"
                  isInvalid={!form.title}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Control 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Enter category"
                  isInvalid={!form.category}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter detailed description"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  value={form.totalAmount} 
                  onChange={e => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Profit Percentage</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.profitPercentage} 
                  onChange={e => setForm({ ...form, profitPercentage: e.target.value })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
          </Row>

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
              description="Upload support matter documents and screenshots"
              entityId={form.id}
              entityType="supportmatter"
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
            disabled={!form.entityId || !form.title || !form.category || loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Create Support Matter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title className="d-flex align-items-center">
            <FaEdit className="me-2" />
            Edit Support Matter
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Entity *</Form.Label>
                <Form.Select 
                  value={form.entityId} 
                  onChange={e => setForm({ ...form, entityId: e.target.value })}
                  isInvalid={!form.entityId}
                  disabled={loadingEntities}
                >
                  <option value="">
                    {loadingEntities ? 'Loading entities...' : '-- Select Entity --'}
                  </option>
                  {Array.isArray(entities) && entities.length > 0 ? (
                    entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))
                  ) : (
                    !loadingEntities && (
                      <option value="" disabled>No entities available</option>
                    )
                  )}
                </Form.Select>
                {loadingEntities && (
                  <div className="d-flex align-items-center mt-1">
                    <FaSpinner className="fa-spin me-2" />
                    <small className="text-muted">Loading entities...</small>
                  </div>
                )}
                {!loadingEntities && entities.length === 0 && (
                  <div className="mt-1">
                    <small className="text-warning">No entities found. Please check if entities are available.</small>
                    <div className="mt-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={loadEntities}
                        disabled={loadingEntities}
                      >
                        {loadingEntities ? <FaSpinner className="fa-spin me-1" /> : null}
                        Refresh Entities
                      </Button>
                    </div>
                  </div>
                )}
                {!loadingEntities && entities.length > 0 && (
                  <div className="mt-1">
                    <small className="text-success">{entities.length} entities loaded</small>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control 
                  value={form.title} 
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter support matter title"
                  isInvalid={!form.title}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Control 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  placeholder="Enter category"
                  isInvalid={!form.category}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Enter detailed description"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Total Amount</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  value={form.totalAmount} 
                  onChange={e => setForm({ ...form, totalAmount: e.target.value })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Profit Percentage</Form.Label>
                <Form.Control 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.profitPercentage} 
                  onChange={e => setForm({ ...form, profitPercentage: e.target.value })}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
          </Row>

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
              description="Upload support matter documents and screenshots"
              entityId={form.id}
              entityType="supportmatter"
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
            disabled={!form.entityId || !form.title || !form.category || loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Update Support Matter
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
          <p>Are you sure you want to delete this support matter?</p>
          {selectedItem && (
            <div className="bg-light p-3 rounded">
              <strong>Title:</strong> {selectedItem.title}<br />
              <strong>Category:</strong> {selectedItem.category}<br />
              <strong>Priority:</strong> {selectedItem.priority}
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
            Delete Support Matter
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </div>
  );
};

export default SupportPage;


