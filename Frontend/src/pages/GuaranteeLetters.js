import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Badge, 
  Tabs, Tab, ButtonGroup, Tooltip, OverlayTrigger, ListGroup, Dropdown 
} from 'react-bootstrap';
import { 
  FaShieldAlt, FaUniversity, FaUpload, FaDownload, FaEye, 
  FaPlus, FaCalendarAlt, FaMoneyBillWave, FaExclamationTriangle, FaFileAlt
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import handleApiError from '../services/apiErrorHandler';

// Helper functions
const getGuaranteeTypeColor = (type) => {
  return type === 'bank' ? 'primary' : 'success';
};
// Helper to convert to UTC ISO string
const toUtcISOString = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00Z").toISOString();
};


const getGuaranteeTypeIcon = (type) => {
  return type === 'bank' ? <FaUniversity /> : <FaShieldAlt />;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'expired': return 'danger';
    case 'cancelled': return 'secondary';
    default: return 'warning';
  }
};

const getGuaranteeStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'expired': return 'danger';
    case 'cancelled': return 'secondary';
    default: return 'warning';
  }
};

const isExpiringSoon = (expiryDate) => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

const GuaranteeLetters = () => {
  const { t } = useTranslation();
  const [guarantees, setGuarantees] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [tendersWithWinners, setTendersWithWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGuarantee, setSelectedGuarantee] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [guaranteeToDelete, setGuaranteeToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    expiryFrom: '',
    expiryTo: ''
  });

  const [form, setForm] = useState({
    tenderId: '',
    quotationId: '',
    guaranteeNumber: '',
    amount: '',
    currency: 'USD',
    issueDate: '',
    expiryDate: '',
    guaranteeType: 'bank', // Default to bank
    notes: '',
    // Bank-specific fields
    bankName: '',
    bankBranch: '',
    bankSwiftCode: '',
    bankContactPerson: '',
    bankContactEmail: '',
    bankContactPhone: '',
    // Government-specific fields
    authorityName: '',
    authorityType: '',
    authorityCode: '',
    authorityContactPerson: '',
    authorityContactEmail: '',
    authorityContactPhone: '',
    approvalNumber: '',
    approvalDate: '',
    taxAmount: '',
    taxType: '',
    taxRate: '',
    taxRegistrationNumber: '',
    isTaxIncluded: false,
    guaranteeTerms: '',
    isRenewable: false,
    renewalPeriodDays: '',
    // Profit calculation fields
    profitPercentage: '',
    calculatedProfit: ''
  });

  useEffect(() => {
    const amount = parseFloat(form.amount);
    const profitPercentage = parseFloat(form.profitPercentage);

    if (!isNaN(amount) && !isNaN(profitPercentage)) {
      const calculated = (amount * profitPercentage) / 100;
      setForm(prev => ({ ...prev, calculatedProfit: calculated.toFixed(2) }));
    } else {
      setForm(prev => ({ ...prev, calculatedProfit: '' }));
    }
  }, [form.amount, form.profitPercentage]);

  const fetchGuarantees = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching guarantees...');
      
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.expiryFrom) params.append('expiryFrom', filters.expiryFrom);
      if (filters.expiryTo) params.append('expiryTo', filters.expiryTo);

      console.log('API params:', params.toString());

      // Fetch both types of guarantees
      const [bankResponse, govResponse] = await Promise.all([
        api.get(`/bankguarantees?${params}`),
        api.get(`/governmentguarantees?${params}`)
      ]);
      
      console.log('Bank guarantees response:', bankResponse.data);
      console.log('Government guarantees response:', govResponse.data);
      
      // Handle different response formats
      const bankGuarantees = Array.isArray(bankResponse.data) 
        ? bankResponse.data 
        : bankResponse.data?.data || [];
      
      const govGuarantees = Array.isArray(govResponse.data) 
        ? govResponse.data 
        : govResponse.data?.data || [];
      
      // Combine and format the responses
      const allGuarantees = [
        ...bankGuarantees.map(g => ({ ...g, type: 'bank' })),
        ...govGuarantees.map(g => ({ ...g, type: 'government' }))
      ];
      
      console.log('Combined guarantees:', allGuarantees);
      setGuarantees(allGuarantees);
    } catch (err) {
      setError('Failed to fetch guarantee letters');
      console.error('Error fetching guarantees:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  

  const fetchQuotations = useCallback(async () => {
    try {
      const response = await api.get('/quotations?status=accepted');
      setQuotations(response.data);
    } catch (err) {
      handleApiError(err, 'Failed to load quotations. Please try again.');
    }
  }, []);

  const fetchTendersWithWinners = useCallback(async () => {
    try {
      console.log('Fetching awarded tenders...');
      
      // Get all tenders with their quotations
      const tendersResponse = await api.get('/tenders');
      const tendersData = Array.isArray(tendersResponse.data) ? tendersResponse.data : tendersResponse.data.data || [];
      console.log('Tenders response:', tendersData);

      if (!tendersData || tendersData.length === 0) {
        console.log('No tenders found');
        setTendersWithWinners([]);
        return;
      }

      // Process tenders that have winners
      const tendersWithWinnerInfo = [];
      
      for (const tender of tendersData) {
        // Check if tender has a winner
        if (tender.winningQuotationId) {
          // If tender has quotations, use them
          if (tender.quotations && tender.quotations.length > 0) {
            const winningQuotation = tender.quotations.find(q => q.id === tender.winningQuotationId);
            
            if (winningQuotation) {
              console.log(`Processing tender ${tender.id} with winner:`, {
                tender: tender.title,
                winner: winningQuotation.supplierName,
                amount: winningQuotation.amount
              });

              tendersWithWinnerInfo.push({
            id: tender.id,
                title: tender.title || '',
                referenceNumber: tender.referenceNumber || '',
                winnerQuotationId: winningQuotation.id,
                winnerSupplierName: winningQuotation.supplierName || '',
                winnerAmount: winningQuotation.amount || 0,
                winnerCurrency: winningQuotation.currency || 'USD'
              });
            }
          } else {
            // If no quotations in tender data, fetch them separately
            try {
              const quotationsResponse = await api.get(`/tenders/${tender.id}/quotations`);
              const quotations = Array.isArray(quotationsResponse.data) ? quotationsResponse.data : quotationsResponse.data.data || [];
              
              const winningQuotation = quotations.find(q => q.id === tender.winningQuotationId);
              
              if (winningQuotation) {
                console.log(`Processing tender ${tender.id} with winner (fetched separately):`, {
                  tender: tender.title,
                  winner: winningQuotation.supplierName,
                  amount: winningQuotation.amount
                });

                tendersWithWinnerInfo.push({
                  id: tender.id,
                  title: tender.title || '',
                  referenceNumber: tender.referenceNumber || '',
                  winnerQuotationId: winningQuotation.id,
                  winnerSupplierName: winningQuotation.supplierName || '',
                  winnerAmount: winningQuotation.amount || 0,
                  winnerCurrency: winningQuotation.currency || 'USD'
                });
              }
            } catch (err) {
              console.error(`Error fetching quotations for tender ${tender.id}:`, err);
            }
          }
        } else {
          // If no winner, still include the tender for selection
          console.log(`Processing tender ${tender.id} without winner:`, {
            tender: tender.title,
            referenceNumber: tender.referenceNumber
          });

          tendersWithWinnerInfo.push({
            id: tender.id,
            title: tender.title || '',
            referenceNumber: tender.referenceNumber || '',
            winnerQuotationId: null,
            winnerSupplierName: 'No Winner Selected',
            winnerAmount: 0,
            winnerCurrency: 'USD'
          });
        }
      }

      console.log('Processed tenders with winners:', tendersWithWinnerInfo);
      console.log('Setting tendersWithWinners state with:', tendersWithWinnerInfo.length, 'tenders');

      setTendersWithWinners(tendersWithWinnerInfo);
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to load tenders. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchGuarantees();
    fetchQuotations();
    fetchTendersWithWinners();
  }, [fetchGuarantees, fetchQuotations, fetchTendersWithWinners]);
  

  const handleTenderSelection = (tenderId) => {
    console.log('Tender selected:', tenderId);
    console.log('Available tenders:', tendersWithWinners);
    const selectedTender = tendersWithWinners.find(t => t.id === tenderId);
    console.log('Selected tender:', selectedTender);
    
    if (selectedTender) {
      if (selectedTender.winnerQuotationId) {
        console.log('Setting form with winner data:', {
          tenderId: tenderId,
          quotationId: selectedTender.winnerQuotationId,
          amount: selectedTender.winnerAmount,
          currency: selectedTender.winnerCurrency
        });
        
      setForm(prev => ({
        ...prev,
        tenderId: tenderId,
        quotationId: selectedTender.winnerQuotationId,
        amount: selectedTender.winnerAmount?.toString() || '',
        currency: selectedTender.winnerCurrency || 'USD'
      }));
      } else {
        console.log('No winner found for selected tender, setting basic data');
        setForm(prev => ({
          ...prev,
          tenderId: tenderId,
          quotationId: '',
          amount: '',
          currency: 'USD'
        }));
      }
    } else {
      console.log('Selected tender not found');
    }
  };

  const handleCreateGuarantee = async (e) => {
    e.preventDefault();
    try {
      const guaranteeType = activeTab === 'bank' ? 'bank' : 'government';
      // Use the correct endpoint based on guarantee type
      const endpoint = guaranteeType === 'bank' ? '/bankguarantees' : '/governmentguarantees';
      
      // Validate required fields
      if (!form.quotationId) {
        setError('Please select a tender');
        return;
      }
      if (!form.guaranteeNumber) {
        setError('Please enter a guarantee number');
        return;
      }
      if (!form.amount) {
        setError('Please enter an amount');
        return;
      }
      if (!form.issueDate) {
        setError('Please enter an issue date');
        return;
      }
      if (!form.expiryDate) {
        setError('Please enter an expiry date');
        return;
      }
      
      if (!form.guaranteeType) {
        setError('Please select a guarantee type');
        return;
      }
      
      // Validate authority-specific fields
      if (guaranteeType === 'bank' && !form.bankName) {
        setError('Please enter a bank name');
        return;
      }
      if (guaranteeType === 'government' && !form.authorityName) {
        setError('Please enter an authority name');
        return;
      }
      
      const requestData = {
        quotationId: form.quotationId,
        guaranteeNumber: form.guaranteeNumber,
        amount: parseFloat(form.amount),
        currencyCode: form.currency,
        issueDate: toUtcISOString(form.issueDate),
        expiryDate: toUtcISOString(form.expiryDate),
        guaranteeType: form.guaranteeType === 'bank' ? 0 : 1, // Map to enum values (0 for Bank, 1 for Government)
        status: 'Active',
        notes: form.notes,
        // Provider details
        ...(guaranteeType === 'bank' ? {
          bankName: form.bankName,
          bankBranch: form.bankBranch,
          bankSwiftCode: form.bankSwiftCode,
          bankContactPerson: form.bankContactPerson,
          bankContactEmail: form.bankContactEmail,
          bankContactPhone: form.bankContactPhone
        } : {
          authorityName: form.authorityName,
          authorityType: form.authorityType,
          authorityCode: form.authorityCode,
          authorityContactPerson: form.authorityContactPerson,
          authorityContactEmail: form.authorityContactEmail,
          authorityContactPhone: form.authorityContactPhone,
          approvalNumber: form.approvalNumber,
          approvalDate: form.approvalDate ? toUtcISOString(form.approvalDate) : null,
          taxAmount: parseFloat(form.taxAmount) || null,
          taxType: form.taxType,
          taxRate: parseFloat(form.taxRate) || null,
          taxRegistrationNumber: form.taxRegistrationNumber,
          isTaxIncluded: form.isTaxIncluded,
          guaranteeTerms: form.guaranteeTerms,
          isRenewable: form.isRenewable,
          renewalPeriodDays: parseInt(form.renewalPeriodDays) || null,
        }),
        profitPercentage: parseFloat(form.profitPercentage) || null,
        calculatedProfit: parseFloat(form.calculatedProfit) || null
      };
      console.log(">>> Guarantee Payload to send:", requestData);

      // Show loading state
      setLoading(true);
      
      console.log('Creating guarantee letter:', {
        endpoint,
        type: guaranteeType,
        guaranteeNumber: requestData.guaranteeNumber,
        amount: requestData.amount,
        currency: requestData.currency
      });
      
      // Make API call
      const response = await api.post(endpoint, requestData);
      
      console.log('Guarantee letter created successfully:', response.data);
      
      // Reset and refresh
      setShowCreateModal(false);
      resetForm();
      fetchGuarantees();
      setError(null); // Clear any previous errors
    } catch (err) {
      handleApiError(err, 'Failed to create guarantee letter. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedGuarantee) return;

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entityId', selectedGuarantee.id);
      formData.append('entityType', 'guarantee');
      formData.append('description', `Guarantee letter document for ${selectedGuarantee.guaranteeNumber}`);

      await api.post('/files/upload-pdf', formData);

      setShowUploadModal(false);
      setSelectedFile(null);
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadPdf = async (guarantee) => {
    try {
      const endpoint = guarantee.type === 'bank' 
        ? `/guarantee-letters/bank/${guarantee.id}/pdf`
        : `/guarantee-letters/government/${guarantee.id}/pdf`;
      
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${guarantee.type.toUpperCase()}_Guarantee_${guarantee.guaranteeNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      handleApiError(err, 'Failed to download PDF');
    }
  };

  const handleDownloadExpiringReport = async () => {
    try {
      const response = await api.get('/guarantee-letters/expiring-report/pdf', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Expiring_Guarantees_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      handleApiError(err, 'Failed to download expiring report');
    }
  };

  const resetForm = () => {
    setForm({
      tenderId: '',
      quotationId: '',
      guaranteeNumber: '',
      amount: '',
      currency: 'USD',
      issueDate: '',
      expiryDate: '',
      guaranteeType: 'bank', // Default to bank
      notes: '',
      bankName: '',
      bankBranch: '',
      bankSwiftCode: '',
      bankContactPerson: '',
      bankContactEmail: '',
      bankContactPhone: '',
      authorityName: '',
      authorityType: '',
      authorityCode: '',
      authorityContactPerson: '',
      authorityContactEmail: '',
      authorityContactPhone: '',
      approvalNumber: '',
      approvalDate: '',
      taxAmount: '',
      taxType: '',
      taxRate: '',
      taxRegistrationNumber: '',
      isTaxIncluded: false,
      guaranteeTerms: '',
      isRenewable: false,
      renewalPeriodDays: '',
      profitPercentage: '',
      calculatedProfit: ''
    });
    setSelectedGuarantee(null);
    setShowEditModal(false);
    setGuaranteeToDelete(null);
    setShowDeleteConfirmModal(false);
  };

  const onEdit = (guarantee) => {
    setSelectedGuarantee(guarantee);
    setForm({
      tenderId: guarantee.tenderId || '',
      quotationId: guarantee.quotationId || '',
      guaranteeNumber: guarantee.guaranteeNumber || '',
      amount: guarantee.amount?.toString() || '',
      currency: guarantee.currency || 'USD',
      issueDate: guarantee.issueDate ? new Date(guarantee.issueDate).toISOString().split('T')[0] : '',
      expiryDate: guarantee.expiryDate ? new Date(guarantee.expiryDate).toISOString().split('T')[0] : '',
      guaranteeType: guarantee.guaranteeType || '',
      notes: guarantee.notes || '',
      bankName: guarantee.bankName || '',
      bankBranch: guarantee.bankBranch || '',
      bankSwiftCode: guarantee.bankSwiftCode || '',
      bankContactPerson: guarantee.bankContactPerson || '',
      bankContactEmail: guarantee.bankContactEmail || '',
      bankContactPhone: guarantee.bankContactPhone || '',
      authorityName: guarantee.authorityName || '',
      authorityType: guarantee.authorityType || '',
      authorityCode: guarantee.authorityCode || '',
      authorityContactPerson: guarantee.authorityContactPerson || '',
      authorityContactEmail: guarantee.authorityContactEmail || '',
      authorityContactPhone: guarantee.authorityContactPhone || '',
      approvalNumber: guarantee.approvalNumber || '',
      approvalDate: guarantee.approvalDate ? new Date(guarantee.approvalDate).toISOString().split('T')[0] : '',
      taxAmount: guarantee.taxAmount?.toString() || '',
      taxType: guarantee.taxType || '',
      taxRate: guarantee.taxRate?.toString() || '',
      taxRegistrationNumber: guarantee.taxRegistrationNumber || '',
      isTaxIncluded: guarantee.isTaxIncluded || false,
      profitPercentage: guarantee.profitPercentage?.toString() || '',
      calculatedProfit: guarantee.calculatedProfit?.toString() || ''
    });
    setShowEditModal(true);
  };

  const onDelete = (guarantee) => {
    setGuaranteeToDelete(guarantee);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!guaranteeToDelete) return;

    try {
      setLoading(true);
      const endpoint = guaranteeToDelete.type === 'bank'
        ? `/bankguarantees/${guaranteeToDelete.id}`
        : `/governmentguarantees/${guaranteeToDelete.id}`;

      await api.delete(endpoint);
      setShowDeleteConfirmModal(false);
      fetchGuarantees();
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to delete guarantee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (guarantee) => {
    setSelectedGuarantee(guarantee);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (guarantee) => {
    setSelectedGuarantee(guarantee);
    setShowFilesModal(true);
  };

  const handleUpdateGuarantee = async (e) => {
    e.preventDefault();
    if (!selectedGuarantee) return;

    try {
      setLoading(true);
      const guaranteeType = selectedGuarantee.type;
      const endpoint = guaranteeType === 'bank'
        ? `/bankguarantees/${selectedGuarantee.id}`
        : `/governmentguarantees/${selectedGuarantee.id}`;

      const requestData = {
        ...form,
        id: selectedGuarantee.id,
        amount: parseFloat(form.amount),
        issueDate: toUtcISOString(form.issueDate),
        expiryDate: toUtcISOString(form.expiryDate),
        approvalDate: form.approvalDate ? toUtcISOString(form.approvalDate) : null,
        taxAmount: parseFloat(form.taxAmount) || null,
        taxRate: parseFloat(form.taxRate) || null,
        profitPercentage: parseFloat(form.profitPercentage) || null,
        calculatedProfit: parseFloat(form.calculatedProfit) || null,
        guaranteeType: form.guaranteeType === 'bank' ? 0 : 1, // Map to enum values (0 for Bank, 1 for Government)
        renewalPeriodDays: parseInt(form.renewalPeriodDays) || null,
      };

      console.log(">>> Guarantee Update Payload to send:", requestData);

      await api.put(endpoint, requestData);
      setShowEditModal(false);
      resetForm();
      fetchGuarantees();
      setError(null);
    } catch (err) {
      handleApiError(err, 'Failed to update guarantee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGuarantees = guarantees.filter(guarantee => {
    if (activeTab === 'bank' && guarantee.type !== 'bank') return false;
    if (activeTab === 'government' && guarantee.type !== 'government') return false;
    return true;
  });

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
    <Container className="dashboard">
      <div className="dashboard-header">
        <h2 className="mb-0">
          <FaShieldAlt className="me-2" />
          {t('guarantees.title')}
        </h2>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-warning" 
            onClick={handleDownloadExpiringReport}
            className="btn-sm"
          >
            <FaDownload className="me-2" />
            {t('guarantees.expiringReport')}
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedGuarantee}
            className="btn-sm"
          >
            <FaUpload className="me-2" />
            {t('forms.uploadFile')}
          </Button>
          <Button 
            variant="success" 
            onClick={() => setShowCreateModal(true)}
            className="btn-sm"
          >
            <FaPlus className="me-2" />
            {t('guarantees.addGuarantee')}
          </Button>
        </div>
      </div>

      <div className="alert-card">
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </div>

      {/* Filters */}
      <div className="stat-card mb-4">
        <Row>
          <Col md={3}>
            <Form.Select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">{t('filters.all')} {t('guarantees.types')}</option>
              <option value="bank">{t('guarantees.bankGuarantees')}</option>
              <option value="government">{t('guarantees.governmentGuarantees')}</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">{t('filters.all')} {t('common.status')}</option>
              <option value="active">{t('filters.active')}</option>
              <option value="expired">{t('filters.expired')}</option>
              <option value="cancelled">{t('filters.cancelled')}</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              placeholder={t('filters.fromDate')}
              value={filters.expiryFrom}
              onChange={(e) => setFilters({ ...filters, expiryFrom: e.target.value })}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              placeholder={t('filters.toDate')}
              value={filters.expiryTo}
              onChange={(e) => setFilters({ ...filters, expiryTo: e.target.value })}
            />
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <div className="chart-wrapper">
        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
          <Tab eventKey="all" title={t('guarantees.allGuarantees')}>
            <GuaranteesTable 
              guarantees={filteredGuarantees}
              onSelect={setSelectedGuarantee}
              selectedGuarantee={selectedGuarantee}
              onDownloadPdf={handleDownloadPdf}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={handleViewDetails}
              onViewFiles={handleViewFiles}
            />
          </Tab>
          <Tab eventKey="bank" title={t('guarantees.bankGuarantees')}>
            <GuaranteesTable 
              guarantees={filteredGuarantees}
              onSelect={setSelectedGuarantee}
              selectedGuarantee={selectedGuarantee}
              onDownloadPdf={handleDownloadPdf}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={handleViewDetails}
              onViewFiles={handleViewFiles}
            />
          </Tab>
          <Tab eventKey="government" title={t('guarantees.governmentGuarantees')}>
            <GuaranteesTable 
              guarantees={filteredGuarantees}
              onSelect={setSelectedGuarantee}
              selectedGuarantee={selectedGuarantee}
              onDownloadPdf={handleDownloadPdf}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewDetails={handleViewDetails}
              onViewFiles={handleViewFiles}
            />
          </Tab>
          <Tab eventKey="expiring" title={t('guarantees.expiringSoon')}>
            <ExpiringGuarantees guarantees={guarantees} />
          </Tab>
        </Tabs>
      </div>

      {/* Create Guarantee Modal */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            {getGuaranteeTypeIcon(activeTab === 'bank' ? 'bank' : 'government')}
            <span className="ms-2">
              {t('guarantees.addGuarantee')} {activeTab === 'bank' ? t('guarantees.types.bank') : t('guarantees.types.government')}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateGuarantee}>
          <Modal.Body className="p-4 guarantee-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <Alert variant="danger" className="mb-3" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Basic Information Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className="fas fa-info-circle me-2"></i>
                Basic Information
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('tenders.title')} *</Form.Label>
                    <Form.Select
                      value={form.tenderId || ''}
                      onChange={(e) => handleTenderSelection(e.target.value)}
                      required
                    >
                      <option value="">-- {t('forms.selectOption')} --</option>
                      {tendersWithWinners.length > 0 ? (
                        tendersWithWinners.map(tender => (
                        <option key={tender.id} value={tender.id}>
                          {tender.title} - {tender.referenceNumber}
                            {tender.winnerSupplierName && tender.winnerSupplierName !== 'No Winner Selected' && ` (${t('tenders.winner')}: ${tender.winnerSupplierName})`}
                        </option>
                        ))
                      ) : (
                        <option disabled>{t('table.noData')}</option>
                      )}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('tenders.winnerQuotation')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.quotationId ? `${t('tenders.winner')}: ${tendersWithWinners.find(t => t.id === form.tenderId)?.winnerSupplierName || 'N/A'}` : ''}
                      readOnly
                      placeholder={t('forms.autoFilled')}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.guaranteeNumber')} *</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.guaranteeNumber}
                      onChange={(e) => setForm({ ...form, guaranteeNumber: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.guaranteeType')} *</Form.Label>
                    <Form.Select
                      value={form.guaranteeType}
                      onChange={(e) => setForm({ ...form, guaranteeType: e.target.value })}
                      required
                    >
                      <option value="">-- {t('forms.selectOption')} --</option>
                      <option value="bid">{t('guarantees.types.bid')}</option>
                      <option value="performance">{t('guarantees.types.performance')}</option>
                      <option value="advance">{t('guarantees.types.advance')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Financial Information Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className="fas fa-dollar-sign me-2"></i>
                Financial Information
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('common.amount')} *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('common.currency')}</Form.Label>
                    <Form.Select
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.profitPercentage')} (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={form.profitPercentage}
                      onChange={(e) => setForm({ ...form, profitPercentage: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.calculatedProfit')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.calculatedProfit}
                      readOnly
                      placeholder={t('forms.autoCalculated')}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Dates Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className="fas fa-calendar-alt me-2"></i>
                Important Dates
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.issueDate')} *</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.issueDate}
                      onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('guarantees.expiryDate')} *</Form.Label>
                    <Form.Control
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Bank/Government Information Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className={`fas ${activeTab === 'bank' ? 'fa-university' : 'fa-landmark'} me-2`}></i>
                {activeTab === 'bank' ? 'Bank Information' : 'Government Authority Information'}
              </h6>
              <Row>
                {activeTab === 'bank' ? (
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('guarantees.bankName')} *</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.bankName}
                        onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                ) : (
                  <>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('guarantees.authorityName')} *</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.authorityName}
                          onChange={(e) => setForm({ ...form, authorityName: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Authority Type *</Form.Label>
                        <Form.Select
                          value={form.authorityType}
                          onChange={(e) => setForm({ ...form, authorityType: e.target.value })}
                          required
                        >
                          <option value="">-- Select Type --</option>
                          <option value="ministry">Ministry</option>
                          <option value="department">Department</option>
                          <option value="agency">Agency</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Authority Code</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.authorityCode}
                          onChange={(e) => setForm({ ...form, authorityCode: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Authority Contact Person</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.authorityContactPerson}
                          onChange={(e) => setForm({ ...form, authorityContactPerson: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Authority Contact Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={form.authorityContactEmail}
                          onChange={(e) => setForm({ ...form, authorityContactEmail: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Authority Contact Phone</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.authorityContactPhone}
                          onChange={(e) => setForm({ ...form, authorityContactPhone: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Approval Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.approvalNumber}
                          onChange={(e) => setForm({ ...form, approvalNumber: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Approval Date</Form.Label>
                        <Form.Control
                          type="date"
                          value={form.approvalDate}
                          onChange={(e) => setForm({ ...form, approvalDate: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Tax Amount</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          value={form.taxAmount}
                          onChange={(e) => setForm({ ...form, taxAmount: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </>
                )}
              </Row>
            </div>

            {/* Additional Information Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className="fas fa-file-alt me-2"></i>
                Additional Information
              </h6>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('common.notes')}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* File Upload Section */}
            <div className="mb-4 p-3 border rounded bg-light">
              <h6 className="text-primary mb-3 d-flex align-items-center">
                <i className="fas fa-paperclip me-2"></i>
                Attachments
              </h6>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Guarantee Documents</Form.Label>
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
                </Col>
              </Row>
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)}>
              <i className="fas fa-times me-2"></i>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="px-4"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  {t('common.creating')}...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-2"></i>
                  {t('guarantees.createGuarantee')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Guarantee Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Guarantee Letter</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateGuarantee}>
          <Modal.Body className="guarantee-modal-body">
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tender *</Form.Label>
                  <Form.Select
                    value={form.tenderId}
                    onChange={(e) => handleTenderSelection(e.target.value)}
                    required
                    disabled={!!selectedGuarantee?.id}
                  >
                    <option value="">-- Select Tender --</option>
                    {tendersWithWinners.map(tender => (
                      <option key={tender.id} value={tender.id}>
                        {tender.title} ({tender.referenceNumber}) - {tender.winnerSupplierName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guarantee Number *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.guaranteeNumber}
                    onChange={(e) => setForm({ ...form, guaranteeNumber: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Profit Percentage (%)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={form.profitPercentage}
                    onChange={(e) => setForm({ ...form, profitPercentage: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Calculated Profit</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.calculatedProfit}
                    readOnly
                    placeholder="Calculated automatically"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Issue Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Guarantee Type *</Form.Label>
                  <Form.Select
                    value={form.guaranteeType}
                    onChange={(e) => setForm({ ...form, guaranteeType: e.target.value })}
                    required
                  >
                    <option value="">-- Select Type --</option>
                    <option value="bid">Bid Guarantee</option>
                    <option value="performance">Performance Guarantee</option>
                    <option value="advance">Advance Payment Guarantee</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                {selectedGuarantee?.type === 'bank' ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Bank Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      required
                    />
                  </Form.Group>
                ) : (
                  <div>
                    <Form.Group className="mb-3">
                      <Form.Label>Authority Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.authorityName}
                        onChange={(e) => setForm({ ...form, authorityName: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Select
                        value={form.authorityType}
                        onChange={(e) => setForm({ ...form, authorityType: e.target.value })}
                        required
                      >
                        <option value="">-- Select Type --</option>
                        <option value="ministry">Ministry</option>
                        <option value="department">Department</option>
                        <option value="agency">Agency</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Authority Code</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.authorityCode}
                        onChange={(e) => setForm({ ...form, authorityCode: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Authority Contact Person</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.authorityContactPerson}
                        onChange={(e) => setForm({ ...form, authorityContactPerson: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Authority Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={form.authorityContactEmail}
                        onChange={(e) => setForm({ ...form, authorityContactEmail: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Authority Contact Phone</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.authorityContactPhone}
                        onChange={(e) => setForm({ ...form, authorityContactPhone: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Approval Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.approvalNumber}
                        onChange={(e) => setForm({ ...form, approvalNumber: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Approval Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.approvalDate}
                        onChange={(e) => setForm({ ...form, approvalDate: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.taxAmount}
                        onChange={(e) => setForm({ ...form, taxAmount: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Type</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.taxType}
                        onChange={(e) => setForm({ ...form, taxType: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Rate</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.taxRate}
                        onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax Registration Number</Form.Label>
                      <Form.Control
                        type="text"
                        value={form.taxRegistrationNumber}
                        onChange={(e) => setForm({ ...form, taxRegistrationNumber: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Is Tax Included"
                        checked={form.isTaxIncluded}
                        onChange={(e) => setForm({ ...form, isTaxIncluded: e.target.checked })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Guarantee Terms</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={form.guaranteeTerms}
                        onChange={(e) => setForm({ ...form, guaranteeTerms: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Is Renewable"
                        checked={form.isRenewable}
                        onChange={(e) => setForm({ ...form, isRenewable: e.target.checked })}
                      />
                    </Form.Group>
                    {form.isRenewable && (
                      <Form.Group className="mb-3">
                        <Form.Label>Renewal Period (Days)</Form.Label>
                        <Form.Control
                          type="number"
                          value={form.renewalPeriodDays}
                          onChange={(e) => setForm({ ...form, renewalPeriodDays: e.target.value })}
                        />
                      </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                      <Form.Label>Profit Percentage</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.profitPercentage}
                        onChange={(e) => setForm({ ...form.profitPercentage, profitPercentage: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Calculated Profit</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={form.calculatedProfit}
                        onChange={(e) => setForm({ ...form.calculatedProfit, calculatedProfit: e.target.value })}
                        readOnly
                      />
                    </Form.Group>
                  </div>
                )}
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Guarantee'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="guarantee-modal-body">
          Are you sure you want to delete this guarantee letter?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Guarantee Letter Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuarantee && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Guarantee Number:</h6>
                  <p>{selectedGuarantee.guaranteeNumber}</p>
                </Col>
                <Col md={6}>
                  <h6>Type:</h6>
                  <Badge bg={getGuaranteeTypeColor(selectedGuarantee.type)}>
                    {selectedGuarantee.type}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Amount:</h6>
                  <p>{selectedGuarantee.currency} {selectedGuarantee.amount}</p>
                </Col>
                <Col md={6}>
                  <h6>Status:</h6>
                  <Badge bg={getStatusColor(selectedGuarantee.status)}>
                    {selectedGuarantee.status}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Issue Date:</h6>
                  <p>{selectedGuarantee.issueDate ? new Date(selectedGuarantee.issueDate).toLocaleDateString() : 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h6>Expiry Date:</h6>
                  <p>{selectedGuarantee.expiryDate ? new Date(selectedGuarantee.expiryDate).toLocaleDateString() : 'N/A'}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Provider:</h6>
                  <p>{selectedGuarantee.bankName || selectedGuarantee.authorityName || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h6>Renewable:</h6>
                  <p>{selectedGuarantee.isRenewable ? 'Yes' : 'No'}</p>
                </Col>
              </Row>
              {selectedGuarantee.notes && (
                <Row>
                  <Col md={12}>
                    <h6>Notes:</h6>
                    <p>{selectedGuarantee.notes}</p>
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Files Modal */}
      <Modal show={showFilesModal} onHide={() => setShowFilesModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Guarantee Letter Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedGuarantee && selectedGuarantee.attachments && selectedGuarantee.attachments.length > 0 ? (
            <div>
              <h6>Attached Files:</h6>
              <ListGroup>
                {selectedGuarantee.attachments.map((file, index) => (
                  <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                    <div>
                      <FaFileAlt className="me-2" />
                      {file.name || `File ${index + 1}`}
                      {file.size && (
                        <small className="text-muted ms-2">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </small>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => {
                        // Handle file download
                        if (file.url) {
                          window.open(file.url, '_blank');
                        } else {
                          toast.info('File download not available');
                        }
                      }}
                    >
                      <FaDownload />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          ) : (
            <div className="text-center text-muted">
              <FaFileAlt size={48} className="mb-3" />
              <p>No files attached to this guarantee letter.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFilesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

// Guarantees Table Component
const GuaranteesTable = ({ guarantees, onSelect, selectedGuarantee, onDownloadPdf, onEdit, onDelete, onViewDetails, onViewFiles }) => (
  <div className="stat-card">
    <Table striped bordered hover responsive>
    <thead>
      <tr>
        <th>Type</th>
        <th>Guarantee Number</th>
        <th>Supplier</th>
        <th>Tender</th>
        <th>Winner</th>
        <th>Amount</th>
        <th>Issue Date</th>
        <th>Expiry Date</th>
        <th>Status</th>
        <th>Profit Percentage</th>
        <th>Calculated Profit</th>
        <th>Authority Type</th>
        <th>Approval Number</th>
        <th>Approval Date</th>
        <th>Tax Amount</th>
        <th>Tax Type</th>
        <th>Tax Rate</th>
        <th>Tax Reg. No.</th>
        <th>Tax Included</th>
        <th>Guarantee Terms</th>
        <th>Renewable</th>
        <th>Renewal Period</th>
        <th>Details</th>
        <th>Files</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {guarantees.map(guarantee => (
        <tr 
          key={guarantee.id}
          className={selectedGuarantee?.id === guarantee.id ? 'table-active' : ''}
          onClick={() => onSelect(guarantee)}
          style={{ cursor: 'pointer' }}
        >
          <td>
            <Badge bg={getGuaranteeTypeColor(guarantee.type)}>
              {getGuaranteeTypeIcon(guarantee.type)}
              {' '}{guarantee.type}
            </Badge>
          </td>
          <td>
            <strong>{guarantee.guaranteeNumber}</strong>
            {guarantee.type === 'bank' && guarantee.bankBranch && (
              <>
                <br />
                <small className="text-muted">Bank: {guarantee.bankName} ({guarantee.bankBranch})</small>
              </>
            )}
            {guarantee.type === 'government' && guarantee.authorityName && (
              <>
                <br />
                <small className="text-muted">Authority: {guarantee.authorityName}</small>
              </>
            )}
          </td>
          <td>{guarantee.supplierName}</td>
          <td>
            <div>
              <strong>{guarantee.tenderTitle}</strong>
              <br />
              <small className="text-muted">{guarantee.tenderReferenceNumber}</small>
            </div>
          </td>
          <td>{guarantee.tenderWinnerName}</td>
          <td>{guarantee.amount?.toLocaleString('en-US', { style: 'currency', currency: guarantee.currency || 'USD' })}</td>
          <td>{new Date(guarantee.issueDate).toLocaleDateString()}</td>
          <td>{new Date(guarantee.expiryDate).toLocaleDateString()}</td>
          <td>
            <Badge bg={getGuaranteeStatusColor(guarantee.status)}>{guarantee.status}</Badge>
          </td>
          <td>{(guarantee.profitPercentage * 10)?.toFixed(2)}%</td>
          <td>{guarantee.calculatedProfit?.toLocaleString('en-US', { style: 'currency', currency: guarantee.currency || 'USD' })}</td>
          {guarantee.type === 'government' ? (
            <>
              <td>{guarantee.authorityType}</td>
              <td>{guarantee.approvalNumber}</td>
              <td>{guarantee.approvalDate ? new Date(guarantee.approvalDate).toLocaleDateString() : 'N/A'}</td>
              <td>{guarantee.taxAmount?.toLocaleString('en-US', { style: 'currency', currency: guarantee.currency || 'USD' })}</td>
              <td>{guarantee.taxType}</td>
              <td>{guarantee.taxRate}%</td>
              <td>{guarantee.taxRegistrationNumber}</td>
              <td>{guarantee.isTaxIncluded ? 'Yes' : 'No'}</td>
              <td>{guarantee.guaranteeTerms}</td>
              <td>{guarantee.isRenewable ? 'Yes' : 'No'}</td>
              <td>{guarantee.renewalPeriodDays}</td>
            </>
          ) : (
            <td colSpan="11"></td>
          )}
          <td>
            <div className="d-flex gap-1">
              <Button size="sm" variant="outline-info" onClick={() => onViewDetails(guarantee)}>
                <FaEye />
              </Button>
              <Button size="sm" variant="outline-secondary" onClick={() => onViewFiles(guarantee)}>
                <FaFileAlt />
              </Button>
            </div>
          </td>
          <td>
            <Dropdown as={ButtonGroup}>
              <Button variant="outline-primary" size="sm" onClick={() => onDownloadPdf(guarantee.id)}>
                <FaDownload /> PDF
              </Button>
              <Dropdown.Toggle split variant="outline-primary" size="sm" id={`dropdown-split-button-${guarantee.id}`} />
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onSelect(guarantee)}>View Details</Dropdown.Item>
                <Dropdown.Item onClick={() => onEdit(guarantee)}>Edit</Dropdown.Item>
                <Dropdown.Item onClick={() => onDelete(guarantee)}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
      ))}
      {guarantees.length === 0 && (
        <tr>
          <td colSpan="25" className="text-center">No guarantee letters found.</td>
        </tr>
      )}
    </tbody>
  </Table>
  </div>
);

// Expiring Guarantees Component
const ExpiringGuarantees = ({ guarantees }) => {
  const expiringGuarantees = guarantees.filter(g => 
    isExpiringSoon(g.expiryDate) || isExpired(g.expiryDate)
  );

  return (
    <div>
      <div className="alert-card">
        <Alert variant="warning">
          <FaExclamationTriangle className="me-2" />
          <strong>Warning:</strong> {expiringGuarantees.length} guarantee(s) are expiring soon or have expired.
        </Alert>
      </div>
      
      <div className="stat-card">
        <ListGroup>
          {expiringGuarantees.map(guarantee => (
            <ListGroup.Item 
              key={guarantee.id}
              className={`d-flex justify-content-between align-items-center ${
                isExpired(guarantee.expiryDate) ? 'list-group-item-danger' : 'list-group-item-warning'
              }`}
            >
              <div>
                <strong>{guarantee.guaranteeNumber}</strong>
                <br />
                <small>
                  {guarantee.supplierName} • {guarantee.tenderTitle}
                </small>
              </div>
              <div className="text-end">
                <div>
                  <Badge bg={getGuaranteeTypeColor(guarantee.type)}>
                    {guarantee.type}
                  </Badge>
                </div>
                <small>
                  Expires: {new Date(guarantee.expiryDate).toLocaleDateString()}
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default GuaranteeLetters;






// This comment is added to force a re-compilation.





