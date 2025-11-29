import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Table, Alert, Spinner, Button, Modal, Container, Badge } from 'react-bootstrap';
import { FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';

const AssignmentOrdersPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    tenderId: '',
    quotationId: '',
    entityId: '',
    orderNumber: '',
    amount: '',
    currencyCode: 'USD',
    orderDate: '',
    deliveryDate: '',
    paymentTerms: '',
    notes: '',
  });
  const [quotations, setQuotations] = useState([]);
  const [entities, setEntities] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [tendersWithWinners, setTendersWithWinners] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

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

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/assignmentorders', { params: { search: query } });
      console.log("Assignment Orders API response:", res.data);
      setItems(res.data.data || []);
    } catch (e) {
      setError(toErrorMessage(e));
      toast.error(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const fetchDropdownData = async () => {
      try {
        // Fetch quotations
        const quotationsRes = await api.get('/quotations');
        setQuotations(quotationsRes.data.data || []);
        
        // Fetch entities
        const entitiesRes = await api.get('/entities');
        setEntities(entitiesRes.data.data || []);
        
        // Fetch currencies
        const currenciesRes = await api.get('/currencies');
        const currenciesData = Array.isArray(currenciesRes.data) 
          ? currenciesRes.data 
          : [currenciesRes.data];
        setCurrencies(currenciesData);
        
        // Fetch tenders with winners
        await fetchTendersWithWinners();
      } catch (e) {
        toast.error(toErrorMessage(e));
      }
    };
    fetchDropdownData();
    /* eslint-disable-next-line */
  }, [query]);

  const fetchTendersWithWinners = async () => {
    try {
      const tendersRes = await api.get('/tenders');
      const tendersData = Array.isArray(tendersRes.data) 
        ? tendersRes.data 
        : tendersRes.data.data || [];
      
      setTenders(tendersData);
      
      const tendersWithWinnerInfo = [];
      
      for (const tender of tendersData) {
        if (tender.winnerQuotationId) {
          // If quotations are already in tender data
          if (tender.quotations && tender.quotations.length > 0) {
            const winningQuotation = tender.quotations.find(q => q.id === tender.winnerQuotationId);
            
            if (winningQuotation) {
              tendersWithWinnerInfo.push({
                id: tender.id,
                title: tender.title || '',
                referenceNumber: tender.referenceNumber || '',
                winnerQuotationId: winningQuotation.id,
                winnerSupplierName: winningQuotation.supplierName || '',
                winnerAmount: winningQuotation.amount || 0,
                winnerCurrency: winningQuotation.currencyCode || 'USD'
              });
            }
          } else {
            // If no quotations in tender data, fetch them separately
            try {
              const quotationsResponse = await api.get(`/tenders/${tender.id}/quotations`);
              const quotations = Array.isArray(quotationsResponse.data) 
                ? quotationsResponse.data 
                : quotationsResponse.data.data || [];
              
              const winningQuotation = quotations.find(q => q.id === tender.winnerQuotationId);
              
              if (winningQuotation) {
                tendersWithWinnerInfo.push({
                  id: tender.id,
                  title: tender.title || '',
                  referenceNumber: tender.referenceNumber || '',
                  winnerQuotationId: winningQuotation.id,
                  winnerSupplierName: winningQuotation.supplierName || '',
                  winnerAmount: winningQuotation.amount || 0,
                  winnerCurrency: winningQuotation.currencyCode || 'USD'
                });
              }
            } catch (quotationError) {
              console.error(`Error fetching quotations for tender ${tender.id}:`, quotationError);
            }
          }
        }
      }
      
      setTendersWithWinners(tendersWithWinnerInfo);
      console.log('Tenders with winners loaded:', tendersWithWinnerInfo);
    } catch (err) {
      console.error('Error loading tenders with winners:', err);
      toast.error('Failed to load tenders with winners');
    }
  };

  const handleTenderSelection = (tenderId) => {
    console.log('Tender selected:', tenderId);
    const selectedTender = tendersWithWinners.find(t => t.id === tenderId);
    console.log('Selected tender:', selectedTender);
    
    if (selectedTender) {
      if (selectedTender.winnerQuotationId) {
        console.log('Setting form with winner data:', {
          tenderId: tenderId,
          quotationId: selectedTender.winnerQuotationId,
          amount: selectedTender.winnerAmount,
          currency: selectedTender.winnerCurrency,
          supplierName: selectedTender.winnerSupplierName
        });
        
        setForm(prev => {
          const newForm = {
            ...prev,
            quotationId: selectedTender.winnerQuotationId,
            amount: selectedTender.winnerAmount?.toString() || '',
            currencyCode: selectedTender.winnerCurrency || 'USD'
          };
          console.log('Form updated with winner data:', newForm);
          return newForm;
        });
        
        // Show success message
        toast.success(`Winner auto-populated: ${selectedTender.winnerSupplierName} - ${selectedTender.winnerCurrency} ${selectedTender.winnerAmount}`);
      } else {
        console.log('No winner found for selected tender');
        setForm(prev => ({
          ...prev,
          quotationId: '',
          amount: '',
          currencyCode: 'USD'
        }));
        
        toast.warning(`Selected tender "${selectedTender.title}" has no winner selected.`);
      }
    } else {
      console.log('Selected tender not found');
    }
  };

  const filtered = useMemo(() => Array.isArray(items) ? items : [], [items]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (order) => {
    setSelectedOrder(order);
    setShowFilesModal(true);
  };

  const handleSave = async () => {
    try {
      await api.post('/assignmentorders', {
        tenderId: form.tenderId,
        quotationId: form.quotationId,
        entityId: form.entityId,
        orderNumber: form.orderNumber,
        amount: Number(form.amount || 0),
        currencyCode: form.currencyCode,
        orderDate: form.orderDate ? new Date(form.orderDate).toISOString() : null,
        deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : null,
        paymentTerms: form.paymentTerms,
        notes: form.notes,
      });
      setShow(false);
      // Reset form
      setForm({
        tenderId: '',
        quotationId: '',
        entityId: '',
        orderNumber: '',
        amount: '',
        currencyCode: 'USD',
        orderDate: '',
        deliveryDate: '',
        paymentTerms: '',
        notes: '',
      });
      await load();
      toast.success(t('notifications.created', { item: t('assignmentOrders.title') }));
    } catch (e) {
      toast.error(toErrorMessage(e));
    }
  };

  return (
    <div className="dashboard">
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2>{t('assignmentOrders.title')}</h2>
            </div>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <div className="alert-card">
              <Form.Label>{t('common.search')}</Form.Label>
              <Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder={t('assignmentOrders.orderNumber')} />
            </div>
          </Col>
          <Col md="auto" className="ms-auto">
            <Button onClick={() => setShow(true)}>{t('assignmentOrders.addOrder')}</Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="chart-wrapper">
              <div className="chart-title">
                {t('assignmentOrders.title')}
              </div>
              {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}
              {loading && (<div className="p-4 text-center"><Spinner animation="border" size="sm" className="me-2" />{t('table.loading')}</div>)}
              <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>{t('assignmentOrders.orderNumber')}</th>
                <th>{t('assignmentOrders.tender')}</th>
                <th>{t('assignmentOrders.quotation')}</th>
                <th>{t('assignmentOrders.entity')}</th>
                <th>{t('common.amount')}</th>
                <th>{t('common.currency')}</th>
                <th>{t('assignmentOrders.orderDate')}</th>
                <th>{t('assignmentOrders.deliveryDate')}</th>
                <th>{t('assignmentOrders.paymentTerms')}</th>
                <th>{t('common.notes')}</th>
                <th>{t('common.details')}</th>
                <th>{t('common.files')}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filtered) && filtered.length > 0 ? (
                filtered.map(i => (
                  <tr key={i.id}>
                    <td>{i.orderNumber}</td>
                    <td>{i.tenderTitle || '-'}</td>
                    <td>{i.quotationReferenceNumber || '-'}</td>
                    <td>{i.entityName || '-'}</td>
                    <td>{i.amount}</td>
                    <td>{i.currencyName || '-'}</td>
                    <td>{i.orderDate ? new Date(i.orderDate).toLocaleDateString() : '-'}</td>
                    <td>{i.deliveryDate ? new Date(i.deliveryDate).toLocaleDateString() : '-'}</td>
                    <td>{i.paymentTerms || '-'}</td>
                    <td>{i.notes || '-'}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleViewDetails(i)}
                        title={t('common.viewDetails')}
                      >
                        <FaEye />
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleViewFiles(i)}
                        title={t('common.viewFiles')}
                      >
                        <FaFileAlt />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="text-center p-4 text-muted">{t('table.noData')}</td>
                </tr>
              )}
            </tbody>
          </Table>
            </div>
          </Col>
        </Row>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton><Modal.Title>{t('assignmentOrders.addOrder')}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.tender')}</Form.Label>
            <Form.Select value={form.tenderId || ''} onChange={e => handleTenderSelection(e.target.value)}>
              <option value="">{t('forms.selectOption')}</option>
              {tendersWithWinners.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} - {t.referenceNumber} {t.winnerQuotationId ? '(Winner: ' + t.winnerSupplierName + ')' : '(No Winner)'}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.quotation')}</Form.Label>
            <Form.Select value={form.quotationId} onChange={e => setForm({ ...form, quotationId: e.target.value })}>
              <option value="">{t('forms.selectOption')}</option>
              {quotations.map(q => <option key={q.id} value={q.id}>{q.referenceNumber}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.entity')}</Form.Label>
            <Form.Select value={form.entityId} onChange={e => setForm({ ...form, entityId: e.target.value })}>
              <option value="">{t('forms.selectOption')}</option>
              {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.orderNumber')}</Form.Label>
            <Form.Control value={form.orderNumber} onChange={e => setForm({ ...form, orderNumber: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('common.amount')}</Form.Label>
            <Form.Control type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('common.currency')}</Form.Label>
            <Form.Select value={form.currencyCode} onChange={e => setForm({ ...form, currencyCode: e.target.value })}>
              <option value="">{t('forms.selectOption')}</option>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.orderDate')}</Form.Label>
            <Form.Control type="date" value={form.orderDate} onChange={e => setForm({ ...form, orderDate: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.deliveryDate')}</Form.Label>
            <Form.Control type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('assignmentOrders.paymentTerms')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('common.notes')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Assignment Order Documents</Form.Label>
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
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleSave} disabled={!form.quotationId || !form.entityId || !form.orderNumber || !form.amount || !form.currencyCode || !form.orderDate}>{t('common.create')}</Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('assignmentOrders.orderDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('assignmentOrders.orderNumber')}:</strong> {selectedOrder.orderNumber}
                </Col>
                <Col md={6}>
                  <strong>{t('assignmentOrders.tender')}:</strong> {selectedOrder.tenderTitle || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('assignmentOrders.quotation')}:</strong> {selectedOrder.quotationReferenceNumber || t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('assignmentOrders.entity')}:</strong> {selectedOrder.entityName || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('common.amount')}:</strong> {selectedOrder.amount} {selectedOrder.currencyName || selectedOrder.currencyCode}
                </Col>
                <Col md={6}>
                  <strong>{t('assignmentOrders.orderDate')}:</strong> {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString() : t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('assignmentOrders.deliveryDate')}:</strong> {selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate).toLocaleDateString() : t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('assignmentOrders.paymentTerms')}:</strong> {selectedOrder.paymentTerms || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>{t('common.notes')}:</strong> {selectedOrder.notes || t('common.notSpecified')}
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
          <Modal.Title>{t('assignmentOrders.orderFiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <h6>{t('assignmentOrders.orderNumber')}: {selectedOrder.orderNumber}</h6>
              <div className="mt-3">
                {selectedOrder.attachments && selectedOrder.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedOrder.attachments.map((file, index) => (
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

export default AssignmentOrdersPage;