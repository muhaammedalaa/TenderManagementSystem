import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Table, Container, Alert, Spinner } from 'react-bootstrap';
import { FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { createQuotation } from '../services/quotationService';
import FileUpload from '../components/FileUpload';

const emptyQuote = { tenderId: '', supplierId: '', referenceNumber: '', amount: '', status: 'Submitted', currencyCode: 'USD' };
const statuses = ['Submitted', 'UnderReview', 'Approved', 'Rejected', 'Awarded'];

const QuotationsPage = () => {
  const { t } = useTranslation();
  const [quotes, setQuotes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyQuote);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

  const filtered = useMemo(() => {
    const qstr = (val) => (val || '').toString().toLowerCase();
    return quotes
      .map(q => ({
        ...q,
        supplierName: q.supplierName || suppliers.find(s => s.id === q.supplierId)?.name || '',
        tenderTitle: tenders.find(t => t.id === q.tenderId)?.title || ''
      }))
      .filter(q => !query || qstr(q.supplierName).includes(qstr(query)) || qstr(q.tenderTitle).includes(qstr(query)))
      .filter(q => !statusFilter || q.status === statusFilter);
  }, [quotes, suppliers, tenders, query, statusFilter]);

  const openCreate = () => {
    setForm({ ...emptyQuote });
    setUploadedFiles([]);
    setShowModal(true);
  };

  const toErrorMessage = (err) => {
    try {
      const data = err?.response?.data;
      if (typeof data === 'string') return data;
      if (data && typeof data === 'object') {
        if (data.title) return data.title;
        if (data.detail) return data.detail;
        if (data.errors) {
          const firstKey = Object.keys(data.errors)[0];
          if (firstKey) return Array.isArray(data.errors[firstKey]) ? data.errors[firstKey][0] : String(data.errors[firstKey]);
        }
        return JSON.stringify(data);
      }
      return err?.message || 'Unexpected error';
    } catch (_) {
      return 'Unexpected error';
    }
  };

  const fetchAll = async () => {
    const [qRes, sRes, tRes, cRes] = await Promise.all([
      api.get('/quotations'),
      api.get('/suppliers?pageSize=1000'), // Request a large page size to get all suppliers
      api.get('/tenders'),
      api.get('/currencies'),
    ]);
    setQuotes(qRes.data.data || []);
    setSuppliers(sRes.data.data || []);
    setTenders(tRes.data.data || []);
    setCurrencies(cRes.data.data || []);
    const currenciesData = Array.isArray(cRes.data) ? cRes.data : [cRes.data];
    setCurrencies(currenciesData);
  };

  useEffect(() => {
    fetchAll().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveQuote = async () => {
    if (!form.supplierId || !form.tenderId || !form.amount || !form.referenceNumber || !form.currencyCode) {
      alert(t('forms.validation.required'));
      return;
    }
    try {
      const isNew = !form.id;
      let savedQuote;
      if (isNew) {
        savedQuote = await createQuotation({
          tenderId: form.tenderId,
          supplierId: form.supplierId,
          referenceNumber: form.referenceNumber,
          amount: Number(form.amount),
          status: form.status,
          currencyCode: form.currencyCode,
        });
      } else {
        // Assuming an update function exists for quotations
        // await api.put(`/api/quotations/${form.id}`, form);
        // savedQuote = form;
        alert(t('notifications.failed', { action: 'update', item: t('quotations.title') }));
        return;
      }

      await fetchAll();
      setShowModal(false);

      if (isNew) {
        // Reset form after successful creation
        setForm({ ...emptyQuote });
        setUploadedFiles([]);
      }
    } catch (err) {
      alert(toErrorMessage(err));
    }
  };

  const updateStatus = (_id, _status) => {
    // Optional: implement server-side status update endpoint
  };

  const handleViewDetails = (quotation) => {
    setSelectedQuotation(quotation);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (quotation) => {
    setSelectedQuotation(quotation);
    setShowFilesModal(true);
  };

  const statusColor = (s) => {
    switch (String(s || '').toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      case 'underreview': return 'warning';
      case 'awarded': return 'info';
      case 'submitted': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="dashboard">
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2>{t('quotations.title')}</h2>
            </div>
          </Col>
          <Col md="auto">
            <Button variant="primary" onClick={openCreate}>{t('quotations.addQuotation')}</Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <div className="alert-card">
              <Form.Label>{t('common.search')}</Form.Label>
              <Form.Control placeholder={t('table.search')} value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </Col>
          <Col md={4}>
            <div className="alert-card">
              <Form.Label>{t('common.status')}</Form.Label>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">{t('filters.all')}</option>
                {statuses.map(s => <option key={s} value={s}>{t(`quotations.statuses.${s.toLowerCase()}`) || s}</option>)}
              </Form.Select>
            </div>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="chart-wrapper">
              <div className="chart-title">
                {t('quotations.title')}
              </div>
              <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>{t('quotations.supplier')}</th>
                <th>{t('quotations.tender')}</th>
                <th>{t('common.amount')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.details')}</th>
                <th>{t('common.files')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id}>
                  <td>{q.supplierName}</td>
                  <td>{q.tenderTitle}</td>
                  <td>{q.currencyCode} {Number(q.amount || 0).toLocaleString()}</td>
                  <td><Badge bg={statusColor(q.status)}>{q.status}</Badge></td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleViewDetails(q)}
                      title={t('common.viewDetails')}
                    >
                      <FaEye />
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => handleViewFiles(q)}
                      title={t('common.viewFiles')}
                    >
                      <FaFileAlt />
                    </Button>
                  </td>
                  <td>
                    <Form.Select size="sm" value={q.status} onChange={e => updateStatus(q.id, e.target.value)} style={{ maxWidth: 180 }}>
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center p-4 text-muted">{t('table.noData')}</td>
                </tr>
              )}
            </tbody>
          </Table>
            </div>
          </Col>
        </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('quotations.addQuotation')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-2">
            <Col md={6}>
              <Form.Label>{t('quotations.tender')}</Form.Label>
              <Form.Select value={form.tenderId} onChange={e => setForm({ ...form, tenderId: e.target.value })}>
                <option value="">{t('forms.selectOption')}</option>
                {tenders.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={12}>
              <Form.Label>{t('quotations.supplier')}</Form.Label>
              <Form.Select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">{t('forms.selectOption')}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={12}>
              <Form.Label>{t('quotations.quotationNumber')}</Form.Label>
              <Form.Control value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} />
            </Col>
            <Col md={12}>
              <Form.Label>{t('common.amount')}</Form.Label>
              <Form.Control type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </Col>
            <Col md={12}>
              <Form.Label>{t('common.currency')}</Form.Label>
              <Form.Select value={form.currencyCode} onChange={e => setForm({ ...form, currencyCode: e.target.value })}>
                <option value="">{t('forms.selectOption')}</option>
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={12}>
              <Form.Label>Quotation Documents</Form.Label>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={saveQuote} disabled={!form.supplierId || !form.tenderId || !form.referenceNumber || !form.amount}>{t('common.submit')}</Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('quotations.quotationDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuotation && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('quotations.quotationNumber')}:</strong> {selectedQuotation.referenceNumber}
                </Col>
                <Col md={6}>
                  <strong>{t('quotations.supplier')}:</strong> {selectedQuotation.supplierName}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('quotations.tender')}:</strong> {selectedQuotation.tenderTitle}
                </Col>
                <Col md={6}>
                  <strong>{t('common.amount')}:</strong> {selectedQuotation.currencyCode} {Number(selectedQuotation.amount || 0).toLocaleString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('common.status')}:</strong> <Badge bg={statusColor(selectedQuotation.status)}>{selectedQuotation.status}</Badge>
                </Col>
                <Col md={6}>
                  <strong>{t('common.currency')}:</strong> {selectedQuotation.currencyCode}
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
          <Modal.Title>{t('quotations.quotationFiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuotation && (
            <div>
              <h6>{t('quotations.quotationNumber')}: {selectedQuotation.referenceNumber}</h6>
              <div className="mt-3">
                {selectedQuotation.attachments && selectedQuotation.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedQuotation.attachments.map((file, index) => (
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

export default QuotationsPage;


