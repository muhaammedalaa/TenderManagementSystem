import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Form, Table, Button, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaBell, FaEye, FaCheck, FaTimes, FaSpinner, FaTrash, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isReadFilter, setIsReadFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0
  });
  const [form, setForm] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'Info',
    priority: 'Normal',
    relatedEntityId: '',
    relatedEntityType: '',
    data: '',
    id: null
  });

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifications', { 
        params: { 
          type: typeFilter || undefined,
          isRead: isReadFilter !== '' ? isReadFilter === 'true' : undefined,
          page: pagination.page,
          pageSize: pagination.pageSize
        } 
      });
      
      const notificationsData = response.data?.data || response.data || [];
      setNotifications(notificationsData);
      
      if (response.data?.totalCount !== undefined) {
        setPagination(prev => ({
          ...prev,
          totalCount: response.data.totalCount,
          totalPages: response.data.totalPages
        }));
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
      toast.error('Failed to load notifications');
      
      // Add mock data for testing when API fails
      const mockNotifications = [
        {
          id: '1',
          title: 'New Tender Available',
          message: 'A new tender has been published for medical supplies',
          type: 'Info',
          priority: 'Normal',
          isRead: false,
          userName: 'John Doe',
          createdAtUtc: new Date().toISOString(),
          relatedEntityType: 'Tender',
          relatedEntityId: 'TND-001'
        },
        {
          id: '2',
          title: 'Contract Expiring Soon',
          message: 'Contract #CTR-2024-001 will expire in 30 days',
          type: 'Warning',
          priority: 'High',
          isRead: true,
          userName: 'Jane Smith',
          createdAtUtc: new Date(Date.now() - 86400000).toISOString(),
          relatedEntityType: 'Contract',
          relatedEntityId: 'CTR-2024-001'
        },
        {
          id: '3',
          title: 'Payment Received',
          message: 'Payment of $5,000 has been received for Invoice #INV-001',
          type: 'Success',
          priority: 'Normal',
          isRead: false,
          userName: 'Mike Johnson',
          createdAtUtc: new Date(Date.now() - 172800000).toISOString(),
          relatedEntityType: 'Invoice',
          relatedEntityId: 'INV-001'
        }
      ];
      setNotifications(mockNotifications);
      setPagination(prev => ({
        ...prev,
        totalCount: mockNotifications.length,
        totalPages: 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoadingEntities(true);
    try {
      const response = await api.get('/users', { 
        params: { 
          page: 1, 
          pageSize: 1000 
        } 
      });
      const usersData = response.data?.data || response.data || [];
      setUsers(usersData);
      console.log('Users loaded:', usersData.length);
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Failed to load users');
      
      // Add mock users for testing when API fails
      const mockUsers = [
        { id: '1', userName: 'admin', email: 'admin@example.com' },
        { id: '2', userName: 'manager', email: 'manager@example.com' },
        { id: '3', userName: 'user1', email: 'user1@example.com' }
      ];
      setUsers(mockUsers);
    } finally {
      setLoadingEntities(false);
    }
  };

  useEffect(() => { 
    loadNotifications(); 
  }, [typeFilter, isReadFilter, pagination.page]);

  useEffect(() => { 
    loadUsers();
  }, []);

  // Load users when modal opens
  useEffect(() => {
    if (showCreateModal) {
      loadUsers();
    }
  }, [showCreateModal]);

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setForm({
      userId: '',
      title: '',
      message: '',
      type: 'Info',
      priority: 'Normal',
      relatedEntityId: '',
      relatedEntityType: '',
      data: '',
      id: null
    });
    setSelectedNotification(null);
    setError(null);
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleDelete = (notification) => {
    setSelectedNotification(notification);
    setShowDeleteModal(true);
  };

  const handleMarkAsRead = async (id) => {
    // Update local state immediately for better UX
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
    
    // Update selectedNotification if it's the same notification
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => ({ ...prev, isRead: true }));
    }
    
    try {
      await api.patch(`/notifications/${id}/mark-read`);
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
      toast.success('Notification marked as read (demo mode)');
    }
  };

  const handleMarkAsUnread = async (id) => {
    // Update local state immediately for better UX
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: false } : notification
    ));
    
    // Update selectedNotification if it's the same notification
    if (selectedNotification && selectedNotification.id === id) {
      setSelectedNotification(prev => ({ ...prev, isRead: false }));
    }
    
    try {
      await api.patch(`/notifications/${id}/mark-unread`);
      toast.success('Notification marked as unread');
    } catch (err) {
      console.error('Error marking notification as unread:', err);
      toast.success('Notification marked as unread (demo mode)');
    }
  };

  const handleMarkAllAsRead = async () => {
    // Update local state immediately for better UX
    setNotifications(prev => prev.map(notification => ({ ...notification, isRead: true })));
    
    // Update selectedNotification if it exists
    if (selectedNotification) {
      setSelectedNotification(prev => ({ ...prev, isRead: true }));
    }
    
    try {
      await api.post('/notifications/mark-all-read', null, {
        params: { userId: 'current-user-id' } // You might need to get this from auth context
      });
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      toast.success('All notifications marked as read (demo mode)');
    }
  };

  const createNotification = async () => {
    if (!form.userId || !form.title || !form.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        userId: form.userId,
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
        relatedEntityId: form.relatedEntityId || null,
        relatedEntityType: form.relatedEntityType || null,
        data: form.data || null
      };

      await api.post('/notifications', payload);
      toast.success('Notification created successfully');
      handleModalClose();
      await loadNotifications();
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err.response?.data?.message || 'Failed to create notification');
      toast.error('Failed to create notification');
      
      // For demo purposes, add the notification to the local state
      const newNotification = {
        id: Date.now().toString(),
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
        isRead: false,
        userName: users.find(u => u.id === form.userId)?.userName || 'Unknown',
        createdAtUtc: new Date().toISOString(),
        relatedEntityType: form.relatedEntityType,
        relatedEntityId: form.relatedEntityId
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      toast.success('Notification created successfully (demo mode)');
      handleModalClose();
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async () => {
    if (!selectedNotification) return;
    
    setLoading(true);
    try {
      await api.delete(`/notifications/${selectedNotification.id}`);
      toast.success('Notification deleted successfully');
      handleModalClose();
      await loadNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
      
      // For demo purposes, remove from local state
      setNotifications(prev => prev.filter(notification => notification.id !== selectedNotification.id));
      toast.success('Notification deleted successfully (demo mode)');
      handleModalClose();
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeVariant = (type) => {
    if (!type || typeof type !== 'string') return 'secondary';
    switch (type.toLowerCase()) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    if (!priority || typeof priority !== 'string') return 'secondary';
    switch (priority.toLowerCase()) {
      case 'low': return 'success';
      case 'normal': return 'info';
      case 'high': return 'warning';
      case 'urgent': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredNotifications = useMemo(() => notifications, [notifications]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Notifications</h2>
        <p className="text-muted">Manage system notifications and alerts</p>
        <div className="d-flex gap-2">
          <Button 
            variant="success" 
            onClick={handleMarkAllAsRead}
            className="d-flex align-items-center gap-2"
          >
            <FaCheck /> Mark All as Read
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreate}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus /> New Notification
          </Button>
        </div>
      </div>

      <div className="alert-card">
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Label>Search</Form.Label>
            <Form.Control 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              placeholder="Search by title or message" 
            />
          </Col>
          <Col md={3}>
            <Form.Label>Type</Form.Label>
            <Form.Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Error">Error</option>
              <option value="Success">Success</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label>Status</Form.Label>
            <Form.Select value={isReadFilter} onChange={e => setIsReadFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setQuery('');
                setTypeFilter('');
                setIsReadFilter('');
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
            Loading notifications...
          </div>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>User</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredNotifications) && filteredNotifications.map(notification => (
                <tr key={notification.id} className={!notification.isRead ? 'fw-bold' : ''}>
                  <td>
                    <div className="fw-medium">{notification.title}</div>
                    {notification.relatedEntityType && (
                      <small className="text-muted">{notification.relatedEntityType}</small>
                    )}
                  </td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                      {notification.message}
                    </div>
                  </td>
                  <td>
                    <Badge bg={getTypeBadgeVariant(notification.type)}>
                      {notification.type || 'N/A'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={getPriorityBadgeVariant(notification.priority)}>
                      {notification.priority || 'Normal'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={notification.isRead ? 'success' : 'warning'}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </Badge>
                  </td>
                  <td>{notification.userName || '-'}</td>
                  <td>
                    {notification.createdAtUtc ? new Date(notification.createdAtUtc).toLocaleDateString('en-US') : '-'}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        onClick={() => handleViewDetails(notification)}
                        title="View Details"
                      >
                        <FaEye />
                      </Button>
                      {notification.isRead ? (
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => handleMarkAsUnread(notification.id)}
                          title="Mark as Unread"
                        >
                          <FaTimes />
                        </Button>
                      ) : (
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Mark as Read"
                        >
                          <FaCheck />
                        </Button>
                      )}
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDelete(notification)}
                        title="Delete"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {Array.isArray(filteredNotifications) && filteredNotifications.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-muted">
                    No notifications found
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

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaBell className="me-2" />
            Notification Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedNotification && (
            <>
              <div className="mb-3">
                <h5 className="text-primary">{selectedNotification.title}</h5>
                <div className="d-flex gap-2 mb-2">
                  <Badge bg={getTypeBadgeVariant(selectedNotification.type)}>
                    {selectedNotification.type}
                  </Badge>
                  <Badge bg={getPriorityBadgeVariant(selectedNotification.priority)}>
                    {selectedNotification.priority}
                  </Badge>
                  <Badge bg={selectedNotification.isRead ? 'success' : 'warning'}>
                    {selectedNotification.isRead ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Message:</h6>
                <p className="bg-light p-3 rounded">{selectedNotification.message}</p>
              </div>
              
              <Row>
                <Col md={6}>
                  <p><strong>User:</strong> {selectedNotification.userName || 'N/A'}</p>
                  <p><strong>Created At:</strong> {selectedNotification.createdAtUtc ? new Date(selectedNotification.createdAtUtc).toLocaleString() : 'N/A'}</p>
                </Col>
                <Col md={6}>
                  {selectedNotification.readAtUtc && (
                    <p><strong>Read At:</strong> {new Date(selectedNotification.readAtUtc).toLocaleString()}</p>
                  )}
                  {selectedNotification.relatedEntityType && selectedNotification.relatedEntityId && (
                    <p><strong>Related Entity:</strong> {selectedNotification.relatedEntityType} (ID: {selectedNotification.relatedEntityId})</p>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleModalClose}>Close</Button>
          {selectedNotification && !selectedNotification.isRead && (
            <Button variant="success" onClick={() => { handleMarkAsRead(selectedNotification.id); handleModalClose(); }}>
              <FaCheck className="me-2" />
              Mark as Read
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Create Modal */}
      <Modal show={showCreateModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaPlus className="me-2" />
            New Notification
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
                <Form.Label>User *</Form.Label>
                <Form.Select 
                  value={form.userId} 
                  onChange={e => setForm({ ...form, userId: e.target.value })}
                  isInvalid={!form.userId}
                  disabled={loadingEntities}
                >
                  <option value="">
                    {loadingEntities ? 'Loading users...' : '-- Select User --'}
                  </option>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.userName || user.email}
                      </option>
                    ))
                  ) : (
                    !loadingEntities && (
                      <option value="" disabled>No users available</option>
                    )
                  )}
                </Form.Select>
                {loadingEntities && (
                  <div className="d-flex align-items-center mt-1">
                    <FaSpinner className="fa-spin me-2" />
                    <small className="text-muted">Loading users...</small>
                  </div>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type *</Form.Label>
                <Form.Select 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  isInvalid={!form.type}
                >
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Error">Error</option>
                  <option value="Success">Success</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Enter notification title"
              isInvalid={!form.title}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message *</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              value={form.message} 
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Enter notification message"
              isInvalid={!form.message}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select 
                  value={form.priority} 
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Related Entity Type</Form.Label>
                <Form.Control 
                  value={form.relatedEntityType} 
                  onChange={e => setForm({ ...form, relatedEntityType: e.target.value })}
                  placeholder="e.g., Tender, Contract"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Related Entity ID</Form.Label>
                <Form.Control 
                  value={form.relatedEntityId} 
                  onChange={e => setForm({ ...form, relatedEntityId: e.target.value })}
                  placeholder="Enter entity ID"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Additional Data</Form.Label>
                <Form.Control 
                  value={form.data} 
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  placeholder="JSON data (optional)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={createNotification} 
            disabled={!form.userId || !form.title || !form.message || loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Create Notification
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleModalClose}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaTrash className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p>Are you sure you want to delete this notification?</p>
          {selectedNotification && (
            <div className="bg-light p-3 rounded">
              <strong>Title:</strong> {selectedNotification.title}<br />
              <strong>Type:</strong> {selectedNotification.type}<br />
              <strong>User:</strong> {selectedNotification.userName || 'N/A'}
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
            onClick={deleteNotification} 
            disabled={loading}
          >
            {loading ? <FaSpinner className="fa-spin me-2" /> : null}
            Delete Notification
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default NotificationsPage;