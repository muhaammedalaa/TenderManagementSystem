// src/components/Entities.js
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Row, Col, Card, Badge, Container } from "react-bootstrap";
import { FaSearch, FaFilter, FaSort, FaEdit, FaTrash, FaUpload, FaPlus, FaEye, FaFileAlt, FaDownload } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import api from "../services/api";
import FileUpload from "../components/FileUpload";
import SearchBar from "../components/SearchBar";
import FilterPanel from "../components/FilterPanel";
import { toast } from 'react-toastify';

const Entities = () => {
  const { t } = useTranslation();
  const [entities, setEntities] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null); // ظبط الـ editing
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    parentId: null,
    active: true,
  });
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [entityId, setEntityId] = useState(null);
  const [filters, setFilters] = useState({
    active: "all",
    parentId: "all",
  });

  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Get suggestions function
  const getSuggestions = async (term) => {
    if (!term || term.length < 2) return [];
    try {
      // For now, we'll use local filtering for suggestions
      const filtered = entities.filter(entity => 
        entity.name?.toLowerCase().includes(term.toLowerCase()) ||
        entity.code?.toLowerCase().includes(term.toLowerCase()) ||
        entity.description?.toLowerCase().includes(term.toLowerCase())
      );
      return filtered.slice(0, 10).map(entity => entity.name);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  };

  // Load suggestions when search term changes
  useEffect(() => {
    if (searchTerm && searchTerm.length > 1) {
      getSuggestions(searchTerm).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, entities]);

  const toErrorMessage = (err) => {
    if (err.response && err.response.data) {
      const data = err.response.data;
      if (data.errors) {
        const firstKey = Object.keys(data.errors)[0];
        if (firstKey) return Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : String(data.errors[firstKey]);
      }
      return data.message || JSON.stringify(data);
    }
    return err?.message || 'Unexpected error';
  };

  const fetchEntities = async () => {
    try {
      console.log('Fetching entities...');
      let queryString = `?pageSize=1000`;
      if (filters.active !== "all") {
        queryString += `&active=${filters.active}`;
      }
      if (filters.parentId !== "all") {
        queryString += `&parentId=${filters.parentId}`;
      }
      console.log('Query string:', queryString);
      const res = await api.get(`/entities${queryString}`);
      console.log('Entities response:', res.data);
      // التأكد من أن البيانات مصفوفة واستخراجها من خاصية 'data'
      const entitiesData = Array.isArray(res.data.data) ? res.data.data : [];
      console.log('Entities data:', entitiesData);
      console.log('Entities active values:', entitiesData.map(e => ({ name: e.name, active: e.active, type: typeof e.active })));
      setEntities(entitiesData);
    } catch (err) {
      console.error('Error fetching entities:', err);
      toast.error(toErrorMessage(err));
    }
  };

  useEffect(() => {
    fetchEntities();
  }, [filters]); // أضف filters كاعتماد لـ useEffect لإعادة جلب الكيانات عند تغيير الفلاتر

  const handleAddEntity = () => {
    setEditing(null);
    resetForm();
    setShow(true);
  };

  const handleSave = async () => {
    try {
      let savedEntity;
      if (editing) {
        await api.put(`/entities/${editing.id}`, form);
        savedEntity = { ...form, id: editing.id };
      } else {
        const response = await api.post("/entities", form);
        savedEntity = response.data;
      }
      setEntityId(savedEntity.id);
      setEntities(prevEntities => {
        if (editing) {
          return prevEntities.map(entity => (entity.id === savedEntity.id ? savedEntity : entity));
        } else {
          return [...prevEntities, savedEntity];
        }
      });
      setShow(false);

      // Handle file uploads if any files were uploaded
      if (uploadedFiles.length > 0) {
        try {
          for (const file of uploadedFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('entityId', savedEntity.id);
            formData.append('entityType', 'entity');
            formData.append('description', `Entity document for ${savedEntity.name}`);
            
            await api.post('/files/upload', formData);
          }
          toast.success(t('notifications.filesUploaded', { count: uploadedFiles.length }));
        } catch (fileErr) {
          console.error('Error uploading files:', fileErr);
          toast.warning(t('notifications.entityCreated') + ' ' + t('notifications.filesUploadFailed'));
        }
      }

      if (!editing) {
        if (uploadedFiles.length === 0 && window.confirm(t('notifications.created', { item: t('entities.title') }) + ". " + t('forms.uploadFile') + "?")) {
          setShowFileUpload(true);
        } else {
          resetForm();
        }
      } else {
        resetForm();
      }
      toast.success(t('notifications.created', { item: t('entities.title') }));
    } catch (err) {
      console.error(err);
      toast.error(t('notifications.failed', { action: 'save', item: t('entities.title') }) + ": " + toErrorMessage(err));
    }
  };

  const handleEdit = (entity) => {
    setEditing(entity);
    setEntityId(entity.id);
    setForm({
      name: entity.name,
      code: entity.code,
      description: entity.description || "",
      parentId: entity.parentId,
      active: entity.active,
    });
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('notifications.confirmDelete', { item: t('entities.title') }))) return;
    try {
      await api.delete(`/entities/${id}`);
      fetchEntities();
      toast.success(t('notifications.deleted', { item: t('entities.title') }));
    } catch (err) {
      console.error(err);
      toast.error(t('notifications.failed', { action: 'delete', item: t('entities.title') }) + ": " + toErrorMessage(err));
    }
  };

  const handleViewDetails = (entity) => {
    setSelectedEntity(entity);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (entity) => {
    setSelectedEntity(entity);
    setShowFilesModal(true);
  };

  const handleClose = () => {
    setShow(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      description: "",
      parentId: null,
      active: true,
    });
    setEntityId(null);
    setUploadedFiles([]);
  };

  // Filter entities based on search term and filters
  const filteredEntities = Array.isArray(entities) ? entities.filter((entity) => {
    console.log('Filtering entity:', entity.name, 'Active:', entity.active, 'Filter active:', filters.active, 'ParentId:', entity.parentId, 'Filter parentId:', filters.parentId);
    
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        entity.name?.toLowerCase().includes(searchLower) ||
        entity.code?.toLowerCase().includes(searchLower) ||
        entity.description?.toLowerCase().includes(searchLower);
      
      console.log('Search term filter:', searchTerm, 'Matches:', matchesSearch);
      if (!matchesSearch) return false;
    }

    // Existing filters
    if (filters.active !== "all") {
      const entityActive = entity.active === true || entity.active === 'true' || entity.active === 1;
      const filterActive = filters.active === 'true';
      console.log('Entity active check:', entity.name, 'entity.active:', entity.active, 'entityActive:', entityActive, 'filterActive:', filterActive);
      if (entityActive !== filterActive) {
        console.log('Entity filtered out by active filter:', entity.name);
        return false;
      }
    }
    if (filters.parentId !== "all" && String(entity.parentId) !== filters.parentId) {
      console.log('Entity filtered out by parentId filter:', entity.name);
      return false;
    }
    console.log('Entity passed all filters:', entity.name);
    return true;
  }) : [];

  // Sort filtered entities
  const sortedEntities = [...filteredEntities].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
      case 'code':
        aValue = a.code?.toLowerCase() || '';
        bValue = b.code?.toLowerCase() || '';
        break;
      case 'active':
        aValue = (a.active === true || a.active === 'true' || a.active === 1) ? 1 : 0;
        bValue = (b.active === true || b.active === 'true' || b.active === 1) ? 1 : 0;
        break;
      case 'parent':
        aValue = a.parentId ? entities.find(p => p.id === a.parentId)?.name?.toLowerCase() || '' : '';
        bValue = b.parentId ? entities.find(p => p.id === b.parentId)?.name?.toLowerCase() || '' : '';
        break;
      default:
        aValue = a.name?.toLowerCase() || '';
        bValue = b.name?.toLowerCase() || '';
        break;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{t('entities.title')}</h2>
        <p className="text-muted">Manage organizational entities and hierarchy</p>
        <Button variant="primary" onClick={handleAddEntity}>
          <FaPlus className="me-2" />
          {t('entities.addEntity')}
        </Button>
      </div>

      <div className="alert-card">
        {/* Search and Filters */}
        <Row className="mb-3">
          <Col md={8}>
            <SearchBar
              placeholder="Search entities by name, code, or description..."
              onSearch={setSearchTerm}
              loading={loading}
              suggestions={suggestions}
              showSuggestions={true}
              size="md"
            />
          </Col>
          <Col md={4}>
            <div className="d-flex gap-2">
              <Form.Select
                value={filters.active}
                onChange={(e) => setFilters({ ...filters, active: e.target.value })}
              >
                <option value="all">{t('filters.all')} {t('common.status')}</option>
                <option value="true">{t('filters.active')}</option>
                <option value="false">{t('filters.inactive')}</option>
              </Form.Select>
              <Button
                variant="outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-1" />
                Filters
              </Button>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters */}
        {showFilters && (
          <Row className="mb-3">
            <Col>
              <div className="alert-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span>Advanced Filters</span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setFilters({
                        active: "all",
                        parentId: "all",
                      });
                      setSearchTerm('');
                    }}
                  >
                    Clear All
                  </Button>
                </div>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Parent Entity</Form.Label>
                      <Form.Select
                        value={filters.parentId}
                        onChange={(e) => setFilters({ ...filters, parentId: e.target.value })}
                      >
                        <option value="all">{t('filters.all')} {t('entities.parent')}</option>
                        {Array.isArray(entities) && entities
                          .filter((e) => !e.parentId)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        )}

        {/* Results Count and Clear Filters */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="d-flex align-items-center">
              <h6 className="mb-0 me-3">
                Results ({sortedEntities.length} of {entities.length})
              </h6>
              {(searchTerm || filters.active !== "all" || filters.parentId !== "all") && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      active: "all",
                      parentId: "all",
                    });
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </Col>
          <Col md={6} className="text-end">
            <small className="text-muted">
              Sorted by: {sortBy} ({sortDirection})
            </small>
          </Col>
        </Row>
      </div>

      <div className="chart-wrapper">
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>
                <div className="d-flex align-items-center">
                  {t('entities.entityName')}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-1"
                    onClick={() => {
                      const newDirection = sortBy === 'name' && sortDirection === 'asc' ? 'desc' : 'asc';
                      setSortBy('name');
                      setSortDirection(newDirection);
                    }}
                  >
                    <FaSort />
                  </Button>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center">
                  {t('entities.code')}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-1"
                    onClick={() => {
                      const newDirection = sortBy === 'code' && sortDirection === 'asc' ? 'desc' : 'asc';
                      setSortBy('code');
                      setSortDirection(newDirection);
                    }}
                  >
                    <FaSort />
                  </Button>
                </div>
              </th>
              <th>{t('common.description')}</th>
              <th>
                <div className="d-flex align-items-center">
                  {t('entities.parent')}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-1"
                    onClick={() => {
                      const newDirection = sortBy === 'parent' && sortDirection === 'asc' ? 'desc' : 'asc';
                      setSortBy('parent');
                      setSortDirection(newDirection);
                    }}
                  >
                    <FaSort />
                  </Button>
                </div>
              </th>
              <th>
                <div className="d-flex align-items-center">
                  {t('common.status')}
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-1"
                    onClick={() => {
                      const newDirection = sortBy === 'active' && sortDirection === 'asc' ? 'desc' : 'asc';
                      setSortBy('active');
                      setSortDirection(newDirection);
                    }}
                  >
                    <FaSort />
                  </Button>
                </div>
              </th>
              <th>{t('common.details')}</th>
              <th>{t('common.files')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntities.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">
                  <div>
                    <FaSearch className="text-muted mb-2" style={{ fontSize: '2rem' }} />
                    <h6>No Entities Found</h6>
                    <p className="text-muted mb-0">
                      {searchTerm || filters.active !== "all" || filters.parentId !== "all" 
                        ? 'Try adjusting your search criteria or filters.'
                        : 'No entities available. Create a new entity to get started.'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedEntities.map((entity) => (
                <tr key={entity.id}>
                  <td>{entity.name}</td>
                  <td><Badge bg="secondary">{entity.code}</Badge></td>
                  <td>{entity.description || '-'}</td>
                  <td>
                    {entities.find((p) => p.id === entity.parentId)?.name || "-"}
                  </td>
                  <td>
                    {(() => {
                      const isActive = entity.active === true || entity.active === 'true' || entity.active === 1;
                      return (
                        <Badge bg={isActive ? 'success' : 'danger'}>
                          {isActive ? t('filters.active') : t('filters.inactive')}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewDetails(entity)}
                      title={t('common.viewDetails')}
                    >
                      <FaEye />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleViewFiles(entity)}
                      title={t('common.viewFiles')}
                    >
                      <FaFileAlt />
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleEdit(entity)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(entity.id)}
                      >
                        <FaTrash />
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => {
                          setEntityId(entity.id);
                          setShowFileUpload(true);
                        }}
                      >
                        <FaUpload />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? t('entities.editEntity') : t('entities.addEntity')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>{t('entities.entityName')} *</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('entities.code')} *</Form.Label>
              <Form.Control
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('common.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('entities.parent')}</Form.Label>
              <Form.Select
                value={form.parentId || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    parentId: e.target.value || null,
                  })
                }
              >
                <option value="">{t('forms.selectOption')}</option>
                {Array.isArray(entities) && entities
                  .filter((e) => !e.parentId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={t('filters.active')}
                checked={form.active}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.checked })
                }
              />
            </Form.Group>

            {/* File Upload Section */}
            <Form.Group className="mb-3">
              <Form.Label>{t('forms.attachments')}</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setUploadedFiles(prev => [...prev, ...files]);
                }}
                className="mb-2"
              />
              <Form.Text className="text-muted">
                {t('forms.fileUploadHelp')}
              </Form.Text>
              
              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <h6>{t('forms.uploadedFiles')}:</h6>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center p-2 border rounded mb-1">
                      <div className="d-flex align-items-center">
                        <FaFileAlt className="me-2 text-primary" />
                        <div>
                          <div className="fw-bold">{file.name}</div>
                          <small className="text-muted">
                            {(file.size / 1024).toFixed(2)} KB
                          </small>
                        </div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editing ? t('common.save') : t('common.save')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* File Upload Modal */}
      {showFileUpload && entityId && (
        <FileUpload
          show={showFileUpload}
          onClose={() => {
            setShowFileUpload(false);
            setEntityId(null);
          }}
          entityId={entityId}
          entityType="entity"
        />
      )}

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('entities.entityDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntity && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('entities.entityName')}:</strong> {selectedEntity.name}
                </Col>
                <Col md={6}>
                  <strong>{t('entities.code')}:</strong> {selectedEntity.code}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>{t('common.description')}:</strong> {selectedEntity.description || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('entities.parent')}:</strong> {entities.find((p) => p.id === selectedEntity.parentId)?.name || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('common.status')}:</strong> 
                  <Badge bg={selectedEntity.active ? 'success' : 'danger'} className="ms-2">
                    {selectedEntity.active ? t('filters.active') : t('filters.inactive')}
                  </Badge>
                </Col>
              </Row>
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
          <Modal.Title>{t('entities.entityFiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEntity && (
            <div>
              <h6>{t('entities.entityName')}: {selectedEntity.name}</h6>
              <div className="mt-3">
                {selectedEntity.attachments && selectedEntity.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedEntity.attachments.map((file, index) => (
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
    </div>
  );
};

export default Entities;
