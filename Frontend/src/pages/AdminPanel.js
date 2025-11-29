import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaUser, FaLock, FaUserCheck, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('users');
    
    // Users state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPagination, setUsersPagination] = useState({
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
    });
    const [usersFilters, setUsersFilters] = useState({
        search: '',
        isActive: null,
        roleId: null
    });

    // Roles state
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(false);

    // Modals state
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);

    // Forms state
    const [userForm, setUserForm] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        roleIds: []
    });

    const [roleForm, setRoleForm] = useState({
        name: '',
        description: ''
    });

    const [assignRoleForm, setAssignRoleForm] = useState({
        userId: '',
        roleIds: []
    });

    // Error/Success messages
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Check if user is admin
    const isAdmin = user?.roles?.includes('Admin');

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
            fetchRoles();
        }
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [usersPagination.page, usersPagination.pageSize, usersFilters]);

    // API calls
    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const params = new URLSearchParams({
                page: usersPagination.page.toString(),
                pageSize: usersPagination.pageSize.toString()
            });

            if (usersFilters.search) params.append('search', usersFilters.search);
            if (usersFilters.isActive !== null) params.append('isActive', usersFilters.isActive.toString());
            if (usersFilters.roleId) params.append('roleId', usersFilters.roleId);

            const response = await api.get(`/users?${params}`);
            setUsers(response.data.data);
            setUsersPagination(prev => ({
                ...prev,
                totalCount: response.data.totalCount,
                totalPages: response.data.totalPages
            }));
        } catch (err) {
            setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchRoles = async () => {
        setRolesLoading(true);
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (err) {
            setError('Failed to fetch roles: ' + (err.response?.data?.message || err.message));
        } finally {
            setRolesLoading(false);
        }
    };

    const fetchUserRoles = async (userId) => {
        try {
            const response = await api.get(`/users/${userId}`);
            return response.data.roles || [];
        } catch (err) {
            console.error('Failed to fetch user roles:', err);
            return [];
        }
    };

    // User operations
    const handleCreateUser = async () => {
        try {
            await api.post('/users', userForm);
            setSuccess('User created successfully');
            setShowUserModal(false);
            resetUserForm();
            fetchUsers();
        } catch (err) {
            setError('Failed to create user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateUser = async () => {
        try {
            await api.put(`/users/${selectedUser.id}`, {
                ...userForm,
                id: selectedUser.id,
                firstName: userForm.firstName || 'N/A',
                lastName: userForm.lastName || 'N/A'
            });
            setSuccess('User updated successfully');
            setShowUserModal(false);
            resetUserForm();
            fetchUsers();
        } catch (err) {
            setError('Failed to update user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}`);
                setSuccess('User deleted successfully');
                fetchUsers();
            } catch (err) {
                setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await api.patch(`/users/${userId}/activate`);
            setSuccess('User activated successfully');
            fetchUsers();
        } catch (err) {
            setError('Failed to activate user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeactivateUser = async (userId) => {
        try {
            await api.patch(`/users/${userId}/deactivate`);
            setSuccess('User deactivated successfully');
            fetchUsers();
        } catch (err) {
            setError('Failed to deactivate user: ' + (err.response?.data?.message || err.message));
        }
    };

    // Role operations
    const handleCreateRole = async () => {
        try {
            await api.post('/roles', roleForm);
            setSuccess('Role created successfully');
            setShowRoleModal(false);
            resetRoleForm();
            fetchRoles();
        } catch (err) {
            setError('Failed to create role: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdateRole = async () => {
        try {
            await api.put(`/roles/${selectedRole.id}`, roleForm);
            setSuccess('Role updated successfully');
            setShowRoleModal(false);
            resetRoleForm();
            fetchRoles();
        } catch (err) {
            setError('Failed to update role: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await api.delete(`/roles/${roleId}`);
                setSuccess('Role deleted successfully');
                fetchRoles();
            } catch (err) {
                setError('Failed to delete role: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    // Assign role operations
    const handleAssignRoles = async () => {
        try {
            if (!assignRoleForm.userId) {
                setError('Please select a user');
                return;
            }

            if (!assignRoleForm.roleIds || assignRoleForm.roleIds.length === 0) {
                setError('Please select at least one role');
                return;
            }

            const requestData = {
                roleIds: assignRoleForm.roleIds
            };
            
            console.log('Assigning roles:', {
                userId: assignRoleForm.userId,
                roleIds: assignRoleForm.roleIds,
                requestData
            });
            
            console.log('Sending request to:', `/users/${assignRoleForm.userId}/roles`);
            console.log('Request body:', JSON.stringify(requestData, null, 2));
            
            await api.put(`/users/${assignRoleForm.userId}/roles`, requestData);
            setSuccess('Roles assigned successfully');
            setShowAssignRoleModal(false);
            resetAssignRoleForm();
            fetchUsers();
        } catch (err) {
            console.error('Assign roles error:', err);
            console.error('Error response:', err.response?.data);
            console.error('Validation errors:', err.response?.data?.errors);
            setError('Failed to assign roles: ' + (err.response?.data?.message || err.message));
        }
    };

    // Form handlers
    const handleShowUserModal = (user = null) => {
        setSelectedUser(user);
        if (user) {
            setUserForm({
                username: user.username,
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                password: '',
                roleIds: user.roles || []
            });
        } else {
            resetUserForm();
        }
        setShowUserModal(true);
    };

    const handleShowRoleModal = (role = null) => {
        setSelectedRole(role);
        if (role) {
            setRoleForm({
                name: role.name,
                description: role.description || ''
            });
        } else {
            resetRoleForm();
        }
        setShowRoleModal(true);
    };

    const handleShowAssignRoleModal = async (user) => {
        // Get user roles as GUIDs, not role names
        const userRoleIds = [];
        if (user.roles && user.roles.length > 0) {
            // Find role IDs by matching role names
            user.roles.forEach(roleName => {
                const role = roles.find(r => r.name === roleName);
                if (role) {
                    userRoleIds.push(role.id);
                }
            });
        }
        
        setAssignRoleForm({
            userId: user.id,
            roleIds: userRoleIds
        });
        setShowAssignRoleModal(true);
    };

    const resetUserForm = () => {
        setUserForm({
            username: '',
            email: '',
            firstName: '',
            lastName: '',
            phone: '',
            password: '',
            roleIds: []
        });
        setSelectedUser(null);
    };

    const resetRoleForm = () => {
        setRoleForm({
            name: '',
            description: ''
        });
        setSelectedRole(null);
    };

    const resetAssignRoleForm = () => {
        setAssignRoleForm({
            userId: '',
            roleIds: []
        });
    };

    const handleRoleToggle = (roleId) => {
        setAssignRoleForm(prev => ({
            ...prev,
            roleIds: prev.roleIds.includes(roleId)
                ? prev.roleIds.filter(id => id !== roleId)
                : [...prev.roleIds, roleId]
        }));
    };

    // Redirect if not admin
    if (!isAdmin) {
        return (
            <Container className="mt-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Card className="text-center">
                            <Card.Body>
                                <FaLock className="text-danger mb-3" style={{ fontSize: '48px' }} />
                                <h4>Access Denied</h4>
                                <p className="text-muted">You don't have permission to access this page.</p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>Admin Panel</h2>
                <p className="text-muted">Manage users, roles, and permissions</p>
            </div>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert variant="success" dismissible onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                {/* Users Tab */}
                <Tab eventKey="users" title={
                    <span>
                        <FaUser className="me-2" />
                        Users
                    </span>
                }>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Users Management</h5>
                            <Button variant="primary" onClick={() => handleShowUserModal()}>
                                <FaPlus className="me-2" />
                                Add User
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {/* Filters */}
                            <Row className="mb-3">
                                <Col md={4}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search users..."
                                        value={usersFilters.search}
                                        onChange={(e) => setUsersFilters(prev => ({ ...prev, search: e.target.value }))}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={usersFilters.isActive === null ? '' : usersFilters.isActive.toString()}
                                        onChange={(e) => setUsersFilters(prev => ({ 
                                            ...prev, 
                                            isActive: e.target.value === '' ? null : e.target.value === 'true' 
                                        }))}
                                    >
                                        <option value="">All Status</option>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </Form.Select>
                                </Col>
                                <Col md={3}>
                                    <Form.Select
                                        value={usersFilters.roleId || ''}
                                        onChange={(e) => setUsersFilters(prev => ({ 
                                            ...prev, 
                                            roleId: e.target.value || null 
                                        }))}
                                    >
                                        <option value="">All Roles</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                                <Col md={2}>
                                    <Button variant="outline-secondary" onClick={fetchUsers}>
                                        <FaSearch />
                                    </Button>
                                </Col>
                            </Row>

                            {usersLoading ? (
                                <div className="text-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <>
                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Username</th>
                                                <th>Roles</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.firstName} {user.lastName}</td>
                                                    <td>{user.email}</td>
                                                    <td>{user.username}</td>
                                                    <td>
                                                        {user.roles?.map(role => (
                                                            <Badge key={role} bg="primary" className="me-1">
                                                                {role}
                                                            </Badge>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        <Badge bg={user.isActive ? 'success' : 'danger'}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            variant="outline-primary" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleShowUserModal(user)}
                                                        >
                                                            <FaEdit />
                                                        </Button>
                                                        <Button 
                                                            variant="outline-info" 
                                                            size="sm" 
                                                            className="me-2"
                                                            onClick={() => handleShowAssignRoleModal(user)}
                                                        >
                                                            <FaUserCheck />
                                                        </Button>
                                                        {user.isActive ? (
                                                            <Button 
                                                                variant="outline-warning" 
                                                                size="sm" 
                                                                className="me-2"
                                                                onClick={() => handleDeactivateUser(user.id)}
                                                            >
                                                                Deactivate
                                                            </Button>
                                                        ) : (
                                                            <Button 
                                                                variant="outline-success" 
                                                                size="sm" 
                                                                className="me-2"
                                                                onClick={() => handleActivateUser(user.id)}
                                                            >
                                                                Activate
                                                            </Button>
                                                        )}
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm"
                                                            onClick={() => handleDeleteUser(user.id)}
                                                        >
                                                            <FaTrash />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    {/* Pagination */}
                                    <Row className="mt-3">
                                        <Col md={6}>
                                            <p className="text-muted">
                                                Showing {((usersPagination.page - 1) * usersPagination.pageSize) + 1} to{' '}
                                                {Math.min(usersPagination.page * usersPagination.pageSize, usersPagination.totalCount)} of{' '}
                                                {usersPagination.totalCount} entries
                                            </p>
                                        </Col>
                                        <Col md={6}>
                                            <div className="d-flex justify-content-end">
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm" 
                                                    className="me-2"
                                                    disabled={usersPagination.page === 1}
                                                    onClick={() => setUsersPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                >
                                                    Previous
                                                </Button>
                                                <span className="align-self-center me-2">
                                                    Page {usersPagination.page} of {usersPagination.totalPages}
                                                </span>
                                                <Button 
                                                    variant="outline-secondary" 
                                                    size="sm"
                                                    disabled={usersPagination.page === usersPagination.totalPages}
                                                    onClick={() => setUsersPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Roles Tab */}
                <Tab eventKey="roles" title={
                    <span>
                        <FaLock className="me-2" />
                        Roles
                    </span>
                }>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Roles Management</h5>
                            <Button variant="primary" onClick={() => handleShowRoleModal()}>
                                <FaPlus className="me-2" />
                                Add Role
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            {rolesLoading ? (
                                <div className="text-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <Table responsive>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.map((role) => (
                                            <tr key={role.id}>
                                                <td>{role.name}</td>
                                                <td>{role.description || 'No description'}</td>
                                                <td>{new Date(role.createdAtUtc).toLocaleDateString()}</td>
                                                <td>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        className="me-2"
                                                        onClick={() => handleShowRoleModal(role)}
                                                    >
                                                        <FaEdit />
                                                    </Button>
                                                    <Button 
                                                        variant="outline-danger" 
                                                        size="sm"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                    >
                                                        <FaTrash />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>

                {/* Assign Roles Tab */}
                <Tab eventKey="assign-roles" title={
                    <span>
                        <FaUserCheck className="me-2" />
                        Assign Roles
                    </span>
                }>
                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Assign Roles to Users</h5>
                        </Card.Header>
                        <Card.Body>
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Current Roles</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div>
                                                    <strong>{user.firstName} {user.lastName}</strong>
                                                    <br />
                                                    <small className="text-muted">{user.email}</small>
                                                </div>
                                            </td>
                                            <td>
                                                {user.roles?.map(role => (
                                                    <Badge key={role} bg="primary" className="me-1">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => handleShowAssignRoleModal(user)}
                                                >
                                                    <FaUserCheck className="me-1" />
                                                    Assign Roles
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* User Modal */}
            <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedUser ? 'Edit User' : 'Create User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.username}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={userForm.email}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.firstName}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.lastName}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={userForm.phone}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Password {!selectedUser && '*'}</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={userForm.password}
                                        onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder={selectedUser ? 'Leave empty to keep current password' : 'Enter password'}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Roles</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <Form.Check
                                        key={role.id}
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        label={role.name}
                                        checked={userForm.roleIds.includes(role.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setUserForm(prev => ({
                                                    ...prev,
                                                    roleIds: [...prev.roleIds, role.id]
                                                }));
                                            } else {
                                                setUserForm(prev => ({
                                                    ...prev,
                                                    roleIds: prev.roleIds.filter(id => id !== role.id)
                                                }));
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUserModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={selectedUser ? handleUpdateUser : handleCreateUser}>
                        {selectedUser ? 'Update User' : 'Create User'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Role Modal */}
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedRole ? 'Edit Role' : 'Create Role'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Role Name *</Form.Label>
                            <Form.Control
                                type="text"
                                value={roleForm.name}
                                onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={roleForm.description}
                                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={selectedRole ? handleUpdateRole : handleCreateRole}>
                        {selectedRole ? 'Update Role' : 'Create Role'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Assign Role Modal */}
            <Modal show={showAssignRoleModal} onHide={() => setShowAssignRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Assign Roles</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>User</Form.Label>
                            <Form.Control
                                type="text"
                                value={users.find(u => u.id === assignRoleForm.userId)?.firstName + ' ' + users.find(u => u.id === assignRoleForm.userId)?.lastName || ''}
                                disabled
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select Roles</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {roles.map(role => (
                                    <Form.Check
                                        key={role.id}
                                        type="checkbox"
                                        id={`assign-role-${role.id}`}
                                        label={role.name}
                                        checked={assignRoleForm.roleIds.includes(role.id)}
                                        onChange={() => handleRoleToggle(role.id)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAssignRoleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleAssignRoles}>
                        Assign Roles
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPanel;