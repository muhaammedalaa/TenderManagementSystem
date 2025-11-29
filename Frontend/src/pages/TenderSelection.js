import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Badge, 
  ProgressBar, Accordion, ListGroup, ButtonGroup, Tooltip, OverlayTrigger 
} from 'react-bootstrap';
import { 
  FaTrophy, FaCalculator, FaFilePdf, FaUpload, FaDownload, FaEye, 
  FaCheckCircle, FaTimesCircle, FaInfoCircle, FaChartBar, FaCog 
} from 'react-icons/fa';
import api from '../services/api';

const TenderSelection = () => {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [winnerAnalysis, setWinnerAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoDetermineWinner, setAutoDetermineWinner] = useState(false);
  const [winnerMethod, setWinnerMethod] = useState('lowest_bid');

  const fetchTenders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tenders?status=open');
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setTenders(data);
    } catch (err) {
      setError('Failed to fetch tenders');
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuotations = useCallback(async (tenderId) => {
    try {
      const response = await api.get(`/api/quotations?tenderId=${tenderId}`);
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setQuotations(data);
    } catch (err) {
      console.error('Error fetching quotations:', err);
    }
  }, []);

  const fetchWinnerAnalysis = useCallback(async (tenderId) => {
    try {
      const response = await api.get(`/api/tenders/${tenderId}/winner-analysis`);
      setWinnerAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching winner analysis:', err);
    }
  }, []);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  const handleTenderSelect = async (tender) => {
    setSelectedTender(tender);
    await fetchQuotations(tender.id);
    await fetchWinnerAnalysis(tender.id);
  };

  const handleDetermineWinner = async () => {
    if (!selectedTender) return;

    try {
      const response = await api.post(`/api/tenders/${selectedTender.id}/determine-winner`);
      setWinnerAnalysis(response.data);
      setShowWinnerModal(true);
      
      // Refresh tenders to get updated winner
      await fetchTenders();
    } catch (err) {
      setError('Failed to determine winner');
      console.error('Error determining winner:', err);
    }
  };

  const handleSetWinner = async (quotationId) => {
    if (!selectedTender) return;

    try {
      await api.post(`/api/tenders/${selectedTender.id}/set-winner`, {
        quotationId: quotationId
      });
      
      // Refresh data
      await fetchTenders();
      await fetchQuotations(selectedTender.id);
      await fetchWinnerAnalysis(selectedTender.id);
      
      setShowWinnerModal(false);
    } catch (err) {
      setError('Failed to set winner');
      console.error('Error setting winner:', err);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedTender) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entityId', selectedTender.id);
      formData.append('entityType', 'tender');
      formData.append('description', `Winner determination document for ${selectedTender.title}`);

      await api.post('/api/files/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setShowUploadModal(false);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      setError('Failed to upload file');
      console.error('Error uploading file:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const getWinnerMethodColor = (method) => {
    switch (method) {
      case 'lowest_bid': return 'success';
      case 'highest_score': return 'primary';
      case 'combined': return 'warning';
      default: return 'secondary';
    }
  };

  const getWinnerMethodIcon = (method) => {
    switch (method) {
      case 'lowest_bid': return '💰';
      case 'highest_score': return '⭐';
      case 'combined': return '⚖️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <FaTrophy className="me-2" />
                Tender Selection & Winner Determination
              </h4>
              <ButtonGroup>
                <Button 
                  variant="outline-primary" 
                  onClick={() => setShowUploadModal(true)}
                  disabled={!selectedTender}
                >
                  <FaUpload className="me-2" />
                  Upload PDF
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleDetermineWinner}
                  disabled={!selectedTender || quotations.length === 0}
                >
                  <FaCalculator className="me-2" />
                  Auto Determine Winner
                </Button>
              </ButtonGroup>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Row>
                {/* Tender Selection */}
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Available Tenders</h6>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <ListGroup variant="flush">
                        {tenders.map(tender => (
                          <ListGroup.Item 
                            key={tender.id}
                            action
                            active={selectedTender?.id === tender.id}
                            onClick={() => handleTenderSelect(tender)}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <div>
                              <strong>{tender.title}</strong>
                              <br />
                              <small className="text-muted">
                                {tender.referenceNumber} • {tender.category}
                              </small>
                            </div>
                            {tender.winnerQuotationId && (
                              <Badge bg="success">
                                <FaTrophy />
                              </Badge>
                            )}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Quotations and Analysis */}
                <Col md={8}>
                  {selectedTender ? (
                    <div>
                      {/* Tender Info */}
                      <Card className="mb-3">
                        <Card.Header>
                          <h6 className="mb-0">Selected Tender: {selectedTender.title}</h6>
                        </Card.Header>
                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <p><strong>Reference:</strong> {selectedTender.referenceNumber}</p>
                              <p><strong>Category:</strong> {selectedTender.category}</p>
                              <p><strong>Budget:</strong> ${selectedTender.estimatedBudget?.toLocaleString() || 'N/A'}</p>
                            </Col>
                            <Col md={6}>
                              <p><strong>Status:</strong> 
                                <Badge bg={selectedTender.status === 'open' ? 'success' : 'secondary'} className="ms-2">
                                  {selectedTender.status}
                                </Badge>
                              </p>
                              <p><strong>Deadline:</strong> {new Date(selectedTender.submissionDeadline).toLocaleDateString()}</p>
                              <p><strong>Quotations:</strong> {quotations.length}</p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      {/* Winner Analysis */}
                      {winnerAnalysis && (
                        <Card className="mb-3">
                          <Card.Header>
                            <h6 className="mb-0">
                              <FaChartBar className="me-2" />
                              Winner Analysis
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <Row>
                              <Col md={4}>
                                <div className="text-center">
                                  <h5>Lowest Bid</h5>
                                  <h3 className="text-success">
                                    ${winnerAnalysis.lowestBidAmount?.toLocaleString() || 'N/A'}
                                  </h3>
                                  {winnerAnalysis.lowestBidQuotationId && (
                                    <Button 
                                      size="sm" 
                                      variant="outline-success"
                                      onClick={() => handleSetWinner(winnerAnalysis.lowestBidQuotationId)}
                                    >
                                      Select as Winner
                                    </Button>
                                  )}
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="text-center">
                                  <h5>Highest Score</h5>
                                  <h3 className="text-primary">
                                    {winnerAnalysis.highestScore?.toFixed(2) || 'N/A'}
                                  </h3>
                                  {winnerAnalysis.highestScoreQuotationId && (
                                    <Button 
                                      size="sm" 
                                      variant="outline-primary"
                                      onClick={() => handleSetWinner(winnerAnalysis.highestScoreQuotationId)}
                                    >
                                      Select as Winner
                                    </Button>
                                  )}
                                </div>
                              </Col>
                              <Col md={4}>
                                <div className="text-center">
                                  <h5>Recommended</h5>
                                  <h3 className="text-warning">
                                    {getWinnerMethodIcon(winnerAnalysis.recommendedMethod)}
                                  </h3>
                                  <Badge bg={getWinnerMethodColor(winnerAnalysis.recommendedMethod)}>
                                    {winnerAnalysis.recommendedMethod.replace('_', ' ')}
                                  </Badge>
                                </div>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      )}

                      {/* Quotations Table */}
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Quotations ({quotations.length})</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Supplier</th>
                                <th>Amount</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quotations.map(quotation => (
                                <tr key={quotation.id}>
                                  <td>{quotation.supplierName}</td>
                                  <td>${quotation.amount.toLocaleString()}</td>
                                  <td>
                                    {quotation.totalScore ? (
                                      <ProgressBar 
                                        now={quotation.totalScore} 
                                        max={100}
                                        label={`${quotation.totalScore.toFixed(1)}%`}
                                      />
                                    ) : (
                                      'N/A'
                                    )}
                                  </td>
                                  <td>
                                    <Badge bg={
                                      quotation.status === 'accepted' ? 'success' :
                                      quotation.status === 'rejected' ? 'danger' :
                                      'secondary'
                                    }>
                                      {quotation.status}
                                    </Badge>
                                  </td>
                                  <td>
                                    <ButtonGroup size="sm">
                                      <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>View Details</Tooltip>}
                                      >
                                        <Button variant="outline-info">
                                          <FaEye />
                                        </Button>
                                      </OverlayTrigger>
                                      {quotation.status === 'submitted' && (
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={<Tooltip>Select as Winner</Tooltip>}
                                        >
                                          <Button 
                                            variant="outline-success"
                                            onClick={() => handleSetWinner(quotation.id)}
                                          >
                                            <FaCheckCircle />
                                          </Button>
                                        </OverlayTrigger>
                                      )}
                                    </ButtonGroup>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </div>
                  ) : (
                    <Card>
                      <Card.Body className="text-center">
                        <FaInfoCircle size={48} className="text-muted mb-3" />
                        <h5>Select a Tender</h5>
                        <p className="text-muted">
                          Choose a tender from the list to view quotations and determine the winner.
                        </p>
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Winner Determination Modal */}
      <Modal show={showWinnerModal} onHide={() => setShowWinnerModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaTrophy className="me-2" />
            Winner Determination Results
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {winnerAnalysis && (
            <div>
              <Alert variant="info">
                <strong>Recommended Method:</strong> {winnerAnalysis.recommendedMethod.replace('_', ' ')}
              </Alert>
              
              <h6>Analysis Summary:</h6>
              <ul>
                <li>Total Quotations: {winnerAnalysis.quotations.length}</li>
                <li>Lowest Bid: ${winnerAnalysis.lowestBidAmount?.toLocaleString() || 'N/A'}</li>
                <li>Highest Score: {winnerAnalysis.highestScore?.toFixed(2) || 'N/A'}</li>
              </ul>

              <h6>Quotations:</h6>
              <ListGroup>
                {winnerAnalysis.quotations.map(q => (
                  <ListGroup.Item key={q.id} className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{q.supplierName}</strong>
                      <br />
                      <small>Amount: ${q.amount.toLocaleString()} | Score: {q.totalScore?.toFixed(1) || 'N/A'}</small>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline-success"
                      onClick={() => handleSetWinner(q.id)}
                    >
                      Select Winner
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* File Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUpload className="me-2" />
            Upload PDF Document
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleFileUpload}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Select PDF File</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">
                Only PDF files are allowed. Maximum size: 20MB
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={!selectedFile || uploadingFile}
            >
              {uploadingFile ? 'Uploading...' : 'Upload'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default TenderSelection;








