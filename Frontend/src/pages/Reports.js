import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner, Badge, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { FaFilePdf, FaFileExcel, FaDownload, FaCalendarAlt, FaChartBar, FaUsers, FaHandshake, FaDollarSign } from 'react-icons/fa';
import axios from 'axios';

const Reports = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [scheduledReports, setScheduledReports] = useState([]);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [activeTab, setActiveTab] = useState('generate');

    // Form states
    const [formData, setFormData] = useState({
        reportType: '',
        startDate: '',
        endDate: '',
        entityIds: [],
        currency: '',
        includeCharts: true,
        includeKPIs: true
    });

    useEffect(() => {
        loadTemplates();
        loadScheduledReports();
    }, []);

    const loadTemplates = async () => {
        try {
            const response = await axios.get('/api/reports/templates');
            setTemplates(response.data);
        } catch (error) {
            console.error('Error loading templates:', error);
            toast.error('Failed to load report templates');
        }
    };

    const loadScheduledReports = async () => {
        try {
            const response = await axios.get('/api/reports/scheduled');
            setScheduledReports(response.data);
        } catch (error) {
            console.error('Error loading scheduled reports:', error);
            toast.error('Failed to load scheduled reports');
        }
    };

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const requestData = {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString()
            };

            let response;
            switch (formData.reportType) {
                case 'tender':
                    response = await axios.post('/api/reports/tender-summary', requestData);
                    break;
                case 'financial':
                    response = await axios.post('/api/reports/financial', requestData);
                    break;
                case 'supplier':
                    response = await axios.post('/api/reports/supplier-performance', requestData);
                    break;
                case 'contract':
                    response = await axios.post('/api/reports/contract-status', requestData);
                    break;
                case 'dashboard':
                    response = await axios.post('/api/reports/dashboard', requestData);
                    break;
                default:
                    throw new Error('Invalid report type');
            }

            setReportData(response.data);
            setShowGenerateModal(false);
            toast.success('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!reportData) return;

        setLoading(true);
        try {
            const exportRequest = {
                reportName: `${formData.reportType}_report`,
                reportType: formData.reportType,
                reportData: reportData,
                reportTitle: `${formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)} Report`,
                generatedBy: 'Current User',
                generatedAt: new Date()
            };

            const response = await axios.post('/api/reports/export/pdf', exportRequest, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formData.reportType}_report_${new Date().toISOString().split('T')[0]}.txt`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('PDF exported successfully!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Failed to export PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        if (!reportData) return;

        setLoading(true);
        try {
            const exportRequest = {
                reportName: `${formData.reportType}_report`,
                reportType: formData.reportType,
                reportData: reportData,
                reportTitle: `${formData.reportType.charAt(0).toUpperCase() + formData.reportType.slice(1)} Report`,
                generatedBy: 'Current User',
                generatedAt: new Date()
            };

            const response = await axios.post('/api/reports/export/excel', exportRequest, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formData.reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel exported successfully!');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            toast.error('Failed to export Excel');
        } finally {
            setLoading(false);
        }
    };

    const handleScheduleReport = async () => {
        setLoading(true);
        try {
            const scheduleRequest = {
                reportName: `${formData.reportType}_scheduled_report`,
                reportType: formData.reportType,
                reportData: formData,
                scheduleType: 'monthly',
                recipients: ['manager@company.com'],
                exportFormats: ['PDF', 'Excel'],
                isActive: true
            };

            await axios.post('/api/reports/schedule', scheduleRequest);
            setShowScheduleModal(false);
            loadScheduledReports();
            toast.success('Report scheduled successfully!');
        } catch (error) {
            console.error('Error scheduling report:', error);
            toast.error('Failed to schedule report');
        } finally {
            setLoading(false);
        }
    };

    const getReportIcon = (type) => {
        switch (type) {
            case 'tender': return <FaHandshake className="text-primary" />;
            case 'financial': return <FaDollarSign className="text-success" />;
            case 'supplier': return <FaUsers className="text-info" />;
            case 'contract': return <FaHandshake className="text-warning" />;
            case 'dashboard': return <FaChartBar className="text-danger" />;
            default: return <FaChartBar className="text-secondary" />;
        }
    };

    const reportTypes = [
        { value: 'tender', label: 'Tender Summary Report', description: 'Comprehensive tender analysis with quotations and winners' },
        { value: 'financial', label: 'Financial Report', description: 'Financial overview with tenders, contracts, and guarantees' },
        { value: 'supplier', label: 'Supplier Performance Report', description: 'Supplier performance analysis with ratings and metrics' },
        { value: 'contract', label: 'Contract Status Report', description: 'Contract progress and status tracking' },
        { value: 'dashboard', label: 'Dashboard Report', description: 'Comprehensive dashboard with KPIs and charts' }
    ];

  return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h2>
                    <FaChartBar className="me-2" />
                    {t('reports.title')}
                </h2>
                <p className="text-muted">{t('reports.subtitle')}</p>
            </div>

            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="generate" title="Generate Reports">
                    <Row className="mb-4">
                        <Col md={8}>
                            <div className="alert-card">
                                <h5 className="mb-3">Generate New Report</h5>
                                    <Form>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Report Type</Form.Label>
                                                    <Form.Select
                                                        value={formData.reportType}
                                                        onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                                                    >
                                                        <option value="">Select Report Type</option>
                                                        {reportTypes.map(type => (
                                                            <option key={type.value} value={type.value}>
                                                                {type.label}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Currency</Form.Label>
                                                    <Form.Select
                                                        value={formData.currency}
                                                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                                    >
                                                        <option value="">All Currencies</option>
                                                        <option value="USD">USD</option>
                                                        <option value="EUR">EUR</option>
                                                        <option value="GBP">GBP</option>
                                                        <option value="SAR">SAR</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Start Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                                    />
                                                </Form.Group>
            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>End Date</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                                    />
                                                </Form.Group>
            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Include Charts"
                                                    checked={formData.includeCharts}
                                                    onChange={(e) => setFormData({...formData, includeCharts: e.target.checked})}
                                                />
            </Col>
                                            <Col md={6}>
                                                <Form.Check
                                                    type="checkbox"
                                                    label="Include KPIs"
                                                    checked={formData.includeKPIs}
                                                    onChange={(e) => setFormData({...formData, includeKPIs: e.target.checked})}
                                                />
            </Col>
          </Row>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="primary"
                                                onClick={handleGenerateReport}
                                                disabled={loading || !formData.reportType || !formData.startDate || !formData.endDate}
                                            >
                                                {loading ? <Spinner size="sm" className="me-2" /> : <FaChartBar className="me-2" />}
                                                Generate Report
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => setShowScheduleModal(true)}
                                                disabled={!formData.reportType || !formData.startDate || !formData.endDate}
                                            >
                                                <FaCalendarAlt className="me-2" />
                                                Schedule Report
                                            </Button>
                                        </div>
                                    </Form>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="stat-card">
                                <h6 className="mb-3">Report Templates</h6>
                                    {templates.map(template => (
                                        <div key={template.id} className="d-flex align-items-center mb-2 p-2 border rounded">
                                            {getReportIcon(template.reportType)}
                                            <div className="ms-2 flex-grow-1">
                                                <div className="fw-bold">{template.name}</div>
                                                <small className="text-muted">{template.description}</small>
                                            </div>
            </div>
                                    ))}
                            </div>
                        </Col>
                    </Row>

                    {reportData && (
                        <Row>
                            <Col>
                                <div className="chart-wrapper">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Generated Report</h5>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleExportPdf}
                                                disabled={loading}
                                            >
                                                <FaFilePdf className="me-1" />
                                                Export PDF
                                            </Button>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={handleExportExcel}
                                                disabled={loading}
                                            >
                                                <FaFileExcel className="me-1" />
                                                Export Excel
                                            </Button>
                                        </div>
                                    </div>
                                    <pre className="bg-light p-3 rounded" style={{maxHeight: '400px', overflow: 'auto'}}>
                                        {JSON.stringify(reportData, null, 2)}
                                    </pre>
                                </div>
                            </Col>
                        </Row>
                    )}
                </Tab>

                <Tab eventKey="scheduled" title="Scheduled Reports">
                    <Row>
                        <Col>
                            <div className="chart-wrapper">
                                <h5 className="mb-3">Scheduled Reports</h5>
                                    {scheduledReports.length === 0 ? (
                                        <Alert variant="info">
                                            No scheduled reports found. Create one by generating a report and scheduling it.
                                        </Alert>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
            <thead>
              <tr>
                                                        <th>Report Name</th>
                                                        <th>Type</th>
                                                        <th>Schedule</th>
                                                        <th>Next Run</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                                                    {scheduledReports.map(report => (
                                                        <tr key={report.id}>
                                                            <td>{report.reportName}</td>
                                                            <td>
                                                                <Badge bg="secondary">{report.reportType}</Badge>
                                                            </td>
                                                            <td>{report.scheduleType}</td>
                                                            <td>{new Date(report.nextRun).toLocaleString()}</td>
                                                            <td>
                                                                <Badge bg={report.isActive ? 'success' : 'danger'}>
                                                                    {report.isActive ? 'Active' : 'Inactive'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => {/* Cancel logic */}}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </td>
                </tr>
              ))}
            </tbody>
                                            </table>
                                        </div>
                                    )}
                            </div>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>

            {/* Schedule Report Modal */}
            <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Schedule Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Schedule Type</Form.Label>
                                    <Form.Select>
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Recipients</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="manager@company.com"
                                        multiple
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Export Formats</Form.Label>
                                    <div>
                                        <Form.Check inline type="checkbox" label="PDF" defaultChecked />
                                        <Form.Check inline type="checkbox" label="Excel" defaultChecked />
                                    </div>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Optional description"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowScheduleModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleScheduleReport} disabled={loading}>
                        {loading ? <Spinner size="sm" className="me-2" /> : null}
                        Schedule Report
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Reports;