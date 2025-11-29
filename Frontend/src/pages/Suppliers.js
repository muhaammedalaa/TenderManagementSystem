import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Button, Card, Col, Form, Modal, Row, Table, Badge } from 'react-bootstrap';
import { FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import FileUpload from '../components/FileUpload';

const emptySupplier = {
  id: '',
  entityId: '',
  name: '',
  email: '',
  phone: '',
  category: '',
  taxNumber: '',
  registrationNumber: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  financialCapacity: '',
  experienceYears: '',
  primaryAddressId: '',
  active: true,
  isActive: true
};

const SuppliersPage = () => {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptySupplier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (categoryFilter) params.append('category', categoryFilter);
      if (entityFilter) params.append('entityId', entityFilter);

      const res = await api.get(`/suppliers?${params}`);
      console.log("Suppliers API Response:", res.data); // Debug
      setSuppliers(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, [query, categoryFilter, entityFilter]);

  const loadEntities = async () => {
    try {
      const res = await api.get('/entities');
      setEntities(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Failed to load entities:', err);
      setEntities([]);
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setAddresses([]);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadEntities();
    loadAddresses();
  }, [loadSuppliers]);

  const categories = useMemo(
    () => Array.from(new Set(Array.isArray(suppliers) ? suppliers.map(s => s.category) : [])),
    [suppliers]
  );

  const toggleSelect = (id) => {
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelected(copy);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptySupplier });
    setShowModal(true);
  };

  const openEdit = (supplier) => {
    setEditing(supplier.id);
    setForm(supplier);
    setShowModal(true);
  };

  const saveSupplier = async () => {
    if (!form.name || !form.category || !form.entityId) return;
    setError('');
    try {
      const supplierData = {
        entityId: form.entityId,
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        category: form.category,
        taxNumber: form.taxNumber || null,
        registrationNumber: form.registrationNumber || null,
        contactPerson: form.contactPerson || null,
        contactPhone: form.contactPhone || null,
        contactEmail: form.contactEmail || null,
        financialCapacity: form.financialCapacity ? parseFloat(form.financialCapacity) : null,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : null,
        primaryAddressId: form.primaryAddressId || null,
        active: form.active
      };

      if (editing) {
        await api.put(`/suppliers/${editing}`, supplierData);
      } else {
        await api.post('/suppliers', supplierData);
      }

      setShowModal(false);
      setEditing(null);
      setForm(emptySupplier);
      loadSuppliers(); // Reload to ensure consistency
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to save supplier');
    }
  };

  const deleteSelected = async () => {
    setError('');
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map(id => api.delete(`/suppliers/${id}`)));
      setSuppliers(prev => prev.filter(s => !selected.has(s.id)));
      setSelected(new Set());
    } catch (err) {
      console.error(err);
      setError('Failed to delete selected');
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (supplier) => {
    setSelectedSupplier(supplier);
    setShowFilesModal(true);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{t('suppliers.title')}</h2>
        <p className="text-muted">{t('suppliers.subtitle')}</p>
      </div>

      <div className="alert-card">
        <Row className="mb-3">
          <Col md={4}>
            <Form.Control
              placeholder={t('table.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">{t('filters.all')} {t('suppliers.categories')}</option>
              {categories.map(cat => <option key={cat}>{cat}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
            >
              <option value="">{t('filters.all')} {t('entities.title')}</option>
              {entities.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Button variant="primary" onClick={openCreate}>{t('suppliers.addSupplier')}</Button>
          </Col>
        </Row>

        {error && <div className="text-danger mb-2">{error}</div>}
      </div>

      <div className="chart-wrapper">
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>{t('suppliers.supplierName')}</th>
              <th>{t('suppliers.category')}</th>
              <th>{t('entities.title')}</th>
              <th>{t('common.details')}</th>
              <th>{t('common.files')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(suppliers) && suppliers.map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{entities.find(e => e.id === s.entityId)?.name || '-'}</td>
                <td>
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={() => handleViewDetails(s)}
                    title={t('common.viewDetails')}
                  >
                    <FaEye />
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleViewFiles(s)}
                    title={t('common.viewFiles')}
                  >
                    <FaFileAlt />
                  </Button>
                </td>
                <td>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(s)}>{t('common.edit')}</Button>{' '}
                  <Button size="sm" variant="danger" onClick={() => { setSelected(new Set([s.id])); deleteSelected(); }}>{t('common.delete')}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? t('suppliers.editSupplier') : t('suppliers.addSupplier')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-2">
              <Col>
                <Form.Label>{t('suppliers.supplierName')}</Form.Label>
                <Form.Control
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Label>{t('suppliers.category')}</Form.Label>
                <Form.Control
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Label>{t('entities.title')}</Form.Label>
                <Form.Select
                  value={form.entityId}
                  onChange={e => setForm({ ...form, entityId: e.target.value })}
                >
                  <option value="">{t('forms.selectOption')}</option>
                  {entities.map(ent => <option key={ent.id} value={ent.id}>{ent.name}</option>)}
                </Form.Select>
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Form.Label>{t('suppliers.email')}</Form.Label>
                <Form.Control
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Label>{t('suppliers.phone')}</Form.Label>
                <Form.Control
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </Col>
            </Row>

            <Row className="mb-2">
              <Col>
                <Form.Label>{t('suppliers.contactPerson')}</Form.Label>
                <Form.Control
                  value={form.contactPerson}
                  onChange={e => setForm({ ...form, contactPerson: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Label>{t('suppliers.contactEmail')}</Form.Label>
                <Form.Control
                  type="email"
                  value={form.contactEmail}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                />
              </Col>
              <Col>
                <Form.Label>{t('suppliers.contactPhone')}</Form.Label>
                <Form.Control
                  value={form.contactPhone}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>
                <Form.Label>Supplier Documents</Form.Label>
                <FileUpload
                  onFileUploaded={(file) => {
                    setUploadedFiles(prev => [...prev, file]);
                  }}
                  onFileRemoved={(file) => {
                    setUploadedFiles(prev => prev.filter(f => f.savedFileName !== file.savedFileName));
                  }}
                  multiple={true}
                  maxFiles={10}
                  existingFiles={uploadedFiles}
                  className="mb-3"
                />
              </Col>
            </Row>

            <Button variant="primary" onClick={saveSupplier} disabled={loading}>
              {loading ? t('notifications.saving') : t('common.save')}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('suppliers.supplierDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.supplierName')}:</strong> {selectedSupplier.name}
                </Col>
                <Col md={6}>
                  <strong>{t('suppliers.category')}:</strong> {selectedSupplier.category}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.email')}:</strong> {selectedSupplier.email || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('suppliers.phone')}:</strong> {selectedSupplier.phone || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.taxNumber')}:</strong> {selectedSupplier.taxNumber || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('suppliers.registrationNumber')}:</strong> {selectedSupplier.registrationNumber || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.contactPerson')}:</strong> {selectedSupplier.contactPerson || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('suppliers.contactPhone')}:</strong> {selectedSupplier.contactPhone || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.contactEmail')}:</strong> {selectedSupplier.contactEmail || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('suppliers.financialCapacity')}:</strong> {selectedSupplier.financialCapacity || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('suppliers.experienceYears')}:</strong> {selectedSupplier.experienceYears || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('entities.title')}:</strong> {entities.find(e => e.id === selectedSupplier.entityId)?.name || t('common.notSpecified')}
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
          <Modal.Title>{t('suppliers.supplierFiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSupplier && (
            <div>
              <h6>{t('suppliers.supplierName')}: {selectedSupplier.name}</h6>
              <div className="mt-3">
                {selectedSupplier.attachments && selectedSupplier.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedSupplier.attachments.map((file, index) => (
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

export default SuppliersPage;
