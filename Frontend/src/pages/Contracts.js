import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Form, Table, Alert, Spinner, Button, Modal, Container, Badge } from 'react-bootstrap';
import { FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { toast } from 'react-toastify';
import FileUpload from '../components/FileUpload';

const ContractsPage = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    assignmentOrderId: '',
    contractNumber: '',
    contractType: '',
    amount: '',
    currencyCode: 'USD',
    startDate: '',
    endDate: '',
    paymentTerms: '',
    deliveryTerms: '',
    warrantyPeriod: '',
    status: 'Active',
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [assignmentOrders, setAssignmentOrders] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
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
      const res = await api.get('/contracts', { params: { search: query, status } });
      console.log("Contracts API response:", res.data);
      const contractsData = res.data.data || [];
      console.log("Contracts data:", contractsData);
      if (contractsData.length > 0) {
        console.log("First contract assignment order:", contractsData[0].assignmentOrder);
        if (contractsData[0].assignmentOrder) {
          console.log("AssignmentOrder orderNumber:", contractsData[0].assignmentOrder.orderNumber);
        }
      }
      setItems(contractsData);
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
        const currenciesRes = await api.get('/currencies');
        const currenciesData = Array.isArray(currenciesRes.data) 
      ? currenciesRes.data 
      : [currenciesRes.data];
    setCurrencies(currenciesData);
        const assignmentOrdersRes = await api.get('/assignmentorders');
        console.log('Assignment Orders API response:', assignmentOrdersRes.data);
        const assignmentOrdersData = assignmentOrdersRes.data.data || assignmentOrdersRes.data || [];
        console.log('Assignment Orders data:', assignmentOrdersData);
        setAssignmentOrders(assignmentOrdersData);
      } catch (e) {
        console.error('Error fetching dropdown data:', e);
        toast.error(toErrorMessage(e));
      }
    };
    fetchDropdownData();
    /* eslint-disable-next-line */
  }, [query, status]);

  const handleAssignmentOrderSelection = (assignmentOrderId) => {
    console.log('Assignment Order selected:', assignmentOrderId);
    console.log('Available assignment orders:', assignmentOrders);
    const selectedOrder = assignmentOrders.find(order => order.id === assignmentOrderId);
    console.log('Selected order:', selectedOrder);
    
    if (selectedOrder) {
      console.log('Setting form with order data:', {
        assignmentOrderId: assignmentOrderId,
        amount: selectedOrder.amount,
        currencyCode: selectedOrder.currencyCode
      });
      
      setForm(prev => {
        const newForm = {
          ...prev,
          assignmentOrderId: assignmentOrderId,
          amount: selectedOrder.amount?.toString() || '',
          currencyCode: selectedOrder.currencyCode || 'USD'
        };
        console.log('Form updated with order data:', newForm);
        return newForm;
      });
      
      // Also update the amount field directly to ensure it's visible
      setTimeout(() => {
        const amountField = document.querySelector('input[type="number"][placeholder*="Amount will be auto-filled"]');
        if (amountField) {
          amountField.value = selectedOrder.amount?.toString() || '';
          amountField.dispatchEvent(new Event('input', { bubbles: true }));
        }
        
        // Also update the currency field
        const currencyField = document.querySelector('select[value*="' + selectedOrder.currencyCode + '"]');
        if (currencyField) {
          currencyField.value = selectedOrder.currencyCode || 'USD';
          currencyField.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
      
      // Show success message
      toast.success(`Order data auto-populated: ${selectedOrder.currencyCode} ${selectedOrder.amount}`);
    } else {
      console.log('Selected order not found');
    }
  };

  const filtered = useMemo(() => Array.isArray(items) ? items : [], [items]);

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (contract) => {
    setSelectedContract(contract);
    setShowFilesModal(true);
  };

  return (
    <div className="dashboard">
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <div className="dashboard-header">
              <h2>{t('contracts.title')}</h2>
            </div>
          </Col>
          <Col md="auto">
            <Button onClick={() => setShow(true)}>{t('contracts.addContract')}</Button>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={6}>
            <div className="alert-card">
              <Form.Label>{t('common.search')}</Form.Label>
              <Form.Control value={query} onChange={e => setQuery(e.target.value)} placeholder={t('table.search')} />
            </div>
          </Col>
          <Col md={4}>
            <div className="alert-card">
              <Form.Label>{t('common.status')}</Form.Label>
              <Form.Select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">{t('filters.all')}</option>
                <option value="active">{t('filters.active')}</option>
                <option value="closed">{t('filters.closed')}</option>
              </Form.Select>
            </div>
          </Col>
          <Col md="auto">
            <button className="btn btn-outline-primary" onClick={load}>{t('filters.applyFilters')}</button>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="chart-wrapper">
              <div className="chart-title">
                {t('contracts.title')}
              </div>
              {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}
              {loading && (<div className="p-4 text-center"><Spinner animation="border" size="sm" className="me-2" />{t('table.loading')}</div>)}
              <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>{t('contracts.contractNumber')}</th>
                <th>{t('contracts.contractType')}</th>
                <th>{t('common.amount')}</th>
                <th>{t('common.currency')}</th>
                <th>{t('contracts.assignmentOrder')}</th>
                <th>{t('contracts.startDate')}</th>
                <th>{t('contracts.endDate')}</th>
                <th>{t('contracts.paymentTerms')}</th>
                <th>{t('contracts.deliveryTerms')}</th>
                <th>{t('contracts.warrantyPeriod')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.details')}</th>
                <th>{t('common.files')}</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filtered) && filtered.length > 0 ? (
                filtered.map(i => {
                  console.log('Rendering contract:', i.contractNumber, 'AssignmentOrder:', i.assignmentOrder, 'AssignmentOrderId:', i.assignmentOrderId);
                  if (i.assignmentOrder) {
                    console.log('AssignmentOrder orderNumber:', i.assignmentOrder.orderNumber);
                  } else {
                    console.log('AssignmentOrder is null or undefined');
                  }
                  return (
                  <tr key={i.id}>
                    <td>{i.contractNumber}</td>
                    <td>{i.contractType}</td>
                    <td>{i.amount}</td>
                    <td>{i.currencyCode}</td>
                    <td>{i.assignmentOrder?.orderNumber || i.assignmentOrderId || '-'}</td>
                    <td>{i.startDate ? new Date(i.startDate).toLocaleDateString() : '-'}</td>
                    <td>{i.endDate ? new Date(i.endDate).toLocaleDateString() : '-'}</td>
                    <td>{i.paymentTerms || '-'}</td>
                    <td>{i.deliveryTerms || '-'}</td>
                    <td>{i.warrantyPeriod || 0}</td>
                    <td>
                      <Badge bg={i.status === 'Active' ? 'success' : 'secondary'}>
                        {i.status || '-'}
                      </Badge>
                    </td>
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="text-center p-4 text-muted">{t('table.noData')}</td>
                </tr>
              )}
            </tbody>
          </Table>
            </div>
          </Col>
        </Row>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton><Modal.Title>{t('contracts.addContract')}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.contractNumber')}</Form.Label>
            <Form.Control value={form.contractNumber} onChange={e => setForm({ ...form, contractNumber: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.contractType')}</Form.Label>
            <Form.Select value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value })}>
              <option value="">{t('forms.selectOption')}</option>
              <option value="0">{t('contracts.types.supply')}</option>
              <option value="1">{t('contracts.types.service')}</option>
              <option value="2">{t('contracts.types.construction')}</option>
              <option value="3">{t('contracts.types.consulting')}</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('common.amount')}</Form.Label>
            <Form.Control 
              type="number" 
              min="0" 
              value={form.amount} 
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder={t('forms.autoFilled')}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('common.currency')}</Form.Label>
            <Form.Select 
              value={form.currencyCode} 
              onChange={e => setForm({ ...form, currencyCode: e.target.value })}
            >
              <option value="">{t('forms.selectOption')}</option>
              {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.assignmentOrder')}</Form.Label>
            <Form.Select value={form.assignmentOrderId} onChange={e => handleAssignmentOrderSelection(e.target.value)}>
              <option value="">{t('forms.selectOption')}</option>
              {assignmentOrders.length > 0 ? (
                assignmentOrders.map(ao => (
                  <option key={ao.id} value={ao.id}>
                    {ao.orderNumber} - {ao.currencyCode} {ao.amount}
                  </option>
                ))
              ) : (
                <option value="" disabled>{t('table.noData')}</option>
              )}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.startDate')}</Form.Label>
            <Form.Control type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.endDate')}</Form.Label>
            <Form.Control type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.paymentTerms')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.deliveryTerms')}</Form.Label>
            <Form.Control as="textarea" rows={3} value={form.deliveryTerms} onChange={e => setForm({ ...form, deliveryTerms: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>{t('contracts.warrantyPeriod')} ({t('contracts.months')})</Form.Label>
            <Form.Control type="number" min="0" value={form.warrantyPeriod} onChange={e => setForm({ ...form, warrantyPeriod: e.target.value })} />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Contract Documents</Form.Label>
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
          <Button variant="primary" onClick={async () => {
            try {
              const contractData = {
                contractNumber: form.contractNumber,
                contractType: Number(form.contractType || 0),
                amount: Number(form.amount || 0),
                currencyCode: form.currencyCode,
                assignmentOrderId: form.assignmentOrderId || null,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
                paymentTerms: form.paymentTerms,
                deliveryTerms: form.deliveryTerms,
                warrantyPeriod: Number(form.warrantyPeriod || 0),
                status: form.status,
              };
              
              console.log('Creating contract with data:', contractData);
              console.log('Form data:', form);
              
              await api.post('/contracts', contractData);
              setShow(false);
              // Reset form
              setForm({
                assignmentOrderId: '',
                contractNumber: '',
                contractType: '',
                amount: '',
                currencyCode: 'USD',
                startDate: '',
                endDate: '',
                paymentTerms: '',
                deliveryTerms: '',
                warrantyPeriod: '',
                status: 'Active',
              });
              await load();
              toast.success(t('notifications.created', { item: t('contracts.title') }));
            } catch (e) {
              console.error('Error creating contract:', e);
              console.error('Error response:', e.response?.data);
              console.error('Error status:', e.response?.status);
              toast.error(toErrorMessage(e));
            }
          }} disabled={!form.contractNumber || !form.contractType || !form.amount || !form.currencyCode || !form.startDate || !form.endDate || !form.assignmentOrderId}>{t('common.create')}</Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('contracts.contractDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContract && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('contracts.contractNumber')}:</strong> {selectedContract.contractNumber}
                </Col>
                <Col md={6}>
                  <strong>{t('contracts.contractType')}:</strong> {selectedContract.contractType}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('common.amount')}:</strong> {selectedContract.amount} {selectedContract.currencyCode}
                </Col>
                <Col md={6}>
                  <strong>{t('contracts.assignmentOrder')}:</strong> {selectedContract.assignmentOrder?.orderNumber || selectedContract.assignmentOrderId || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('contracts.startDate')}:</strong> {selectedContract.startDate ? new Date(selectedContract.startDate).toLocaleDateString() : t('common.notSpecified')}
                </Col>
                <Col md={6}>
                  <strong>{t('contracts.endDate')}:</strong> {selectedContract.endDate ? new Date(selectedContract.endDate).toLocaleDateString() : t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>{t('contracts.warrantyPeriod')}:</strong> {selectedContract.warrantyPeriod || 0} {t('contracts.months')}
                </Col>
                <Col md={6}>
                  <strong>{t('common.status')}:</strong> 
                  <Badge bg={selectedContract.status === 'Active' ? 'success' : 'secondary'} className="ms-2">
                    {selectedContract.status || t('common.notSpecified')}
                  </Badge>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>{t('contracts.paymentTerms')}:</strong> {selectedContract.paymentTerms || t('common.notSpecified')}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <strong>{t('contracts.deliveryTerms')}:</strong> {selectedContract.deliveryTerms || t('common.notSpecified')}
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
          <Modal.Title>{t('contracts.contractFiles')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedContract && (
            <div>
              <h6>{t('contracts.contractNumber')}: {selectedContract.contractNumber}</h6>
              <div className="mt-3">
                {selectedContract.attachments && selectedContract.attachments.length > 0 ? (
                  <div className="list-group">
                    {selectedContract.attachments.map((file, index) => (
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

export default ContractsPage;
