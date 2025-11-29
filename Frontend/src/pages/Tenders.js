import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Table, Button, Modal, Form, Container, Row, Col, Dropdown, Card, Alert, Badge, ListGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaSort, FaEye, FaFileAlt, FaDownload } from 'react-icons/fa';
import api from '../services/api';
import FileUpload from '../components/FileUpload';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const Tenders = () => {
  const { t } = useTranslation();
  const [tenders, setTenders] = useState([]);
  const [entities, setEntities] = useState([]);
  const [quotations, setQuotations] = useState([]); // ✅ العروض الخاصة بالتندر
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTender, setEditingTender] = useState(null);
  const [selectingWinner, setSelectingWinner] = useState(false);
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);
  const [selectedTenderQuotations, setSelectedTenderQuotations] = useState([]);
  const [selectedTenderForQuotations, setSelectedTenderForQuotations] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [showFilesModal, setShowFilesModal] = useState(false);

  const initialFormState = {
    title: '',
    referenceNumber: '',
    category: '',
    estimatedBudget: '',
    submissionDeadline: '',
    openingDate: '',
    status: 'draft',
    requirements: '',
    termsConditions: '',
    entityId: null,
    active: true,
    winnerQuotationId: null,
    lowestBidAmount: null,
    description: '',
    awardedDate: '',
    awardedBy: null,
    autoDetermineWinner: false,
    winnerDeterminationMethod: null,
    lowestBidQuotationId: null,
    highestScore: null,
    highestScoreQuotationId: null
  };

  const [form, setForm] = useState(initialFormState);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    entityId: '',
    winnerDeterminationMethod: '',
    dateFrom: '',
    dateTo: '',
    budgetMin: '',
    budgetMax: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [suggestions, setSuggestions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showQuotations, setShowQuotations] = useState({});

  // Status mapping function
  const getStatusString = (statusNumber) => {
    console.log('getStatusString called with:', statusNumber, 'type:', typeof statusNumber);
    const statusMap = {
      0: 'draft',
      1: 'open', 
      2: 'closed',
      3: 'awarded',
      4: 'cancelled'
    };
    const result = statusMap[statusNumber] || 'draft';
    console.log('getStatusString result:', result);
    return result;
  };

  const getStatusNumber = (statusString) => {
    const statusMap = {
      'draft': 0,
      'open': 1,
      'closed': 2,
      'awarded': 3,
      'cancelled': 4
    };
    return statusMap[statusString] || 0;
  };

  // Get suggestions function
  const getSuggestions = async (term) => {
    if (!term || term.length < 2) return [];
    try {
      const response = await api.get('/tendersearch/suggestions', {
        params: { searchTerm: term, maxSuggestions: 10 }
      });
      return response.data.suggestions || [];
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
  }, [searchTerm]);

  // Filter tenders based on search term and filters
  const filteredTenders = tenders.filter(tender => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        tender.title?.toLowerCase().includes(searchLower) ||
        tender.referenceNumber?.toLowerCase().includes(searchLower) ||
        tender.description?.toLowerCase().includes(searchLower) ||
        tender.requirements?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter (use either statusFilter or filters.status)
    const currentStatusFilter = statusFilter || filters.status;
    if (currentStatusFilter) {
      const tenderStatusString = getStatusString(tender.status);
      console.log('Filtering tender:', tender.title, 'Status:', tender.status, 'StatusString:', tenderStatusString, 'Filter:', currentStatusFilter, 'Match:', tenderStatusString === currentStatusFilter);
      if (tenderStatusString !== currentStatusFilter) {
        return false;
      }
    }

    if (filters.category && tender.category !== filters.category) {
      return false;
    }

    if (filters.entityId && tender.entityId !== filters.entityId) {
      return false;
    }

    if (filters.winnerDeterminationMethod && tender.winnerDeterminationMethod !== filters.winnerDeterminationMethod) {
      return false;
    }

    // Date range filters
    if (filters.dateFrom) {
      const tenderDate = new Date(tender.createdAtUtc);
      const fromDate = new Date(filters.dateFrom);
      if (tenderDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const tenderDate = new Date(tender.createdAtUtc);
      const toDate = new Date(filters.dateTo);
      if (tenderDate > toDate) return false;
    }

    // Budget range filters
    if (filters.budgetMin && tender.estimatedBudget && tender.estimatedBudget < parseFloat(filters.budgetMin)) {
      return false;
    }

    if (filters.budgetMax && tender.estimatedBudget && tender.estimatedBudget > parseFloat(filters.budgetMax)) {
      return false;
    }

    return true;
  });

  // Sort filtered tenders
  const sortedTenders = [...filteredTenders].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title?.toLowerCase() || '';
        bValue = b.title?.toLowerCase() || '';
        break;
      case 'referenceNumber':
        aValue = a.referenceNumber?.toLowerCase() || '';
        bValue = b.referenceNumber?.toLowerCase() || '';
        break;
      case 'category':
        aValue = a.category?.toLowerCase() || '';
        bValue = b.category?.toLowerCase() || '';
        break;
      case 'estimatedBudget':
        aValue = a.estimatedBudget || 0;
        bValue = b.estimatedBudget || 0;
        break;
      case 'submissionDeadline':
        aValue = new Date(a.submissionDeadline || 0);
        bValue = new Date(b.submissionDeadline || 0);
        break;
      case 'createdAt':
      default:
        aValue = new Date(a.createdAtUtc || 0);
        bValue = new Date(b.createdAtUtc || 0);
        break;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const toggleQuotationsVisibility = async (tenderId) => {
    const isCurrentlyVisible = showQuotations[tenderId];
    
    if (!isCurrentlyVisible) {
      // Load quotations when showing them
      try {
        const quotations = await fetchTenderQuotations(tenderId);
        // Update the tender with quotations data
        setTenders(prevTenders => 
          prevTenders.map(tender => 
            tender.id === tenderId 
              ? { ...tender, quotations: quotations }
              : tender
          )
        );
      } catch (err) {
        console.error('Error loading quotations:', err);
        toast.error('Failed to load quotations');
        return;
      }
    }
    
    setShowQuotations(prev => ({
      ...prev,
      [tenderId]: !prev[tenderId]
    }));
  };

    const fetchTenders = useCallback(async () => {
        setLoading(true);
        try {
             console.log('Fetching tenders...');
             const response = await api.get('/tenders');
             console.log('Tenders response:', response.data);
            const data = Array.isArray(response.data) ? response.data : response.data.data || [];
             
             // Debug: Check if tenders have winnerQuotationId
             console.log('Tenders with winnerQuotationId:', data.map(t => ({
               id: t.id,
               title: t.title,
               winnerQuotationId: t.winnerQuotationId,
               status: t.status,
               statusType: typeof t.status,
               awardedDate: t.awardedDate
             })));
             
             // Debug: Check if any tender has a winner
             const tendersWithWinners = data.filter(t => t.winnerQuotationId);
             console.log('Tenders with winners found:', tendersWithWinners.length);
             if (tendersWithWinners.length > 0) {
               console.log('Winners details:', tendersWithWinners.map(t => ({
                 id: t.id,
                 title: t.title,
                 winnerQuotationId: t.winnerQuotationId
               })));
             }
             
             
             // Debug: Check specific tender that was just awarded
             const awardedTender = data.find(t => t.id === '05198a15-71f2-4d60-9612-46ffce163f74');
             if (awardedTender) {
               console.log('Awarded tender from server:', {
                 id: awardedTender.id,
                 title: awardedTender.title,
                 winnerQuotationId: awardedTender.winnerQuotationId,
                 status: awardedTender.status,
                 awardedDate: awardedTender.awardedDate
               });
             } else {
               console.log('Awarded tender not found in server response');
               console.log('Available tender IDs:', data.map(t => t.id));
             }
             
             // Debug: Check if any tender has winnerQuotationId
             const tendersWithWinnersFromServer = data.filter(t => t.winnerQuotationId);
             console.log('Tenders with winners from server:', tendersWithWinnersFromServer.length);
             if (tendersWithWinnersFromServer.length > 0) {
               console.log('Winners from server:', tendersWithWinnersFromServer.map(t => ({
                 id: t.id,
                 title: t.title,
                 winnerQuotationId: t.winnerQuotationId
               })));
             }
             
             // Debug: Check all tender properties
             console.log('All tender properties from server:', data.map(t => ({
               id: t.id,
               title: t.title,
               winnerQuotationId: t.winnerQuotationId,
               status: t.status,
               awardedDate: t.awardedDate,
               allProperties: Object.keys(t)
             })));
             
             // Debug: Check if the issue is with property name casing
             console.log('Checking property names:', data.map(t => ({
               id: t.id,
               title: t.title,
               winnerQuotationId: t.winnerQuotationId,
               WinnerQuotationId: t.WinnerQuotationId,
               WINNER_QUOTATION_ID: t.WINNER_QUOTATION_ID
             })));
             
             // تحديث التندرز مع الـ quotations
             const tendersWithQuotations = await Promise.all(
               data.map(async (tender) => {
                 try {
                   const quotations = await fetchTenderQuotations(tender.id);
                   return { ...tender, quotations: quotations };
                 } catch (err) {
                   console.error('Error loading quotations for tender:', tender.id, err);
                   return { ...tender, quotations: [] };
                 }
               })
             );
             
             setTenders(tendersWithQuotations);
            setError(null);
             console.log('Tenders loaded:', tendersWithQuotations.length);
             
             // Debug: Check status mapping
             console.log('Status mapping test:', tendersWithQuotations.map(t => ({
               title: t.title,
               status: t.status,
               statusType: typeof t.status,
               statusString: getStatusString(t.status)
             })));
        } catch (err) {
            setError('Failed to fetch tenders.');
            console.error('Failed to fetch tenders:', err);
        } finally {
            setLoading(false);
        }
    }, [api]);

  const fetchEntities = async () => {
    try {
      const response = await api.get('/entities?active=true&pageSize=1000'); // ✅ جلب الكيانات النشطة فقط
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setEntities(data);
      console.log('Entities loaded:', data.length); // Debug log
    } catch (err) {
      console.error('Error fetching entities:', err);
      setEntities([]);
      const errorMessage = err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to fetch entities';
      setError(errorMessage);
    }
  };

   const fetchTenderQuotations = async (tenderId) => {
     try {
       console.log('Fetching quotations for tender:', tenderId);
       const response = await api.get(`/tenders/${tenderId}/quotations`);
       console.log('Quotations response:', response.data);
       const data = Array.isArray(response.data) ? response.data : response.data.data || [];
       console.log('Processed quotations data:', data);
       
       // تحديث التندر مع الـ quotations
       setTenders(prevTenders => 
         prevTenders.map(tender => 
           tender.id === tenderId 
             ? { ...tender, quotations: data }
             : tender
         )
       );
       
       return data;
     } catch (err) {
       console.error('Error fetching quotations:', err);
       console.error('Error response:', err.response?.data);
       return [];
     }
   };



  useEffect(() => {
    console.log('Tenders component mounted, fetching data...');
    fetchTenders();
    fetchEntities();
  }, [fetchTenders]);

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.title || !form.referenceNumber || !form.category || !form.entityId || !form.submissionDeadline || !form.openingDate) {
          alert(t('Please fill in all required fields including dates.'));
          return;
      }
  
      // تحضير البيانات بالشكل المطلوب للخادم
      console.log('Form status before conversion:', form.status, 'type:', typeof form.status);
      const statusNumber = getStatusNumber(form.status);
      console.log('Status number after conversion:', statusNumber);
      
      const tenderData = {
          entityId: form.entityId, // يجب أن يكون Guid صحيح
          title: form.title.trim(),
          description: form.description?.trim() || null,
          referenceNumber: form.referenceNumber.trim(),
          category: form.category.trim(),
          estimatedBudget: form.estimatedBudget && !isNaN(parseFloat(form.estimatedBudget)) ? parseFloat(form.estimatedBudget) : null,
          submissionDeadline: form.submissionDeadline || null,
          openingDate: form.openingDate || null,
          status: statusNumber, // Convert string to number
          requirements: form.requirements?.trim() || null,
          termsConditions: form.termsConditions?.trim() || null,
          autoDetermineWinner: Boolean(form.autoDetermineWinner),
          winnerDeterminationMethod: form.winnerDeterminationMethod && form.winnerDeterminationMethod !== '' ? form.winnerDeterminationMethod : null,
          winnerQuotationId: form.winnerQuotationId || null,
          lowestBidAmount: form.lowestBidAmount || null,
          awardedDate: form.awardedDate ? new Date(form.awardedDate + 'T00:00:00.000Z').toISOString() : null,
          awardedBy: form.awardedBy || null
      };
      
      console.log('Tender data to be sent:', tenderData);

      // التحقق من صحة البيانات قبل الإرسال
      if (!tenderData.entityId || tenderData.entityId === '') {
          toast.error('Please select an entity');
          return;
      }
      if (!tenderData.submissionDeadline) {
          toast.error('Please select submission deadline');
          return;
      }
      if (!tenderData.openingDate) {
          toast.error('Please select opening date');
          return;
      }

      // التحقق من أن التواريخ في المستقبل
      const now = new Date();
      const submissionDate = new Date(tenderData.submissionDeadline);
      const openingDate = new Date(tenderData.openingDate);

      if (submissionDate <= now) {
          toast.error('Submission deadline must be in the future');
          return;
      }
      if (openingDate <= submissionDate) {
          toast.error('Opening date must be after submission deadline');
          return;
      }

      console.log('Sending tender data:', tenderData); // Debug log
      console.log('EntityId type:', typeof tenderData.entityId);
      console.log('EntityId value:', tenderData.entityId);
      console.log('SubmissionDeadline:', tenderData.submissionDeadline);
      console.log('OpeningDate:', tenderData.openingDate);
      console.log('EstimatedBudget:', tenderData.estimatedBudget);
      console.log('AutoDetermineWinner:', tenderData.autoDetermineWinner);
      console.log('WinnerDeterminationMethod:', tenderData.winnerDeterminationMethod);
      console.log('WinnerQuotationId:', tenderData.winnerQuotationId);
      console.log('Form winnerQuotationId:', form.winnerQuotationId);
      console.log('Quotations length:', quotations.length);
      console.log('EditingTender:', editingTender);
      
      // التحقق من أن جميع الحقول المطلوبة موجودة
      const requiredFields = ['entityId', 'title', 'referenceNumber', 'category', 'submissionDeadline', 'openingDate'];
      const missingFields = requiredFields.filter(field => !tenderData[field]);
      if (missingFields.length > 0) {
          toast.error(`Missing required fields: ${missingFields.join(', ')}`);
          return;
      }

      // التحقق من أن entityId هو Guid صحيح
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!guidRegex.test(tenderData.entityId)) {
          toast.error('Invalid entity ID format');
          return;
      }

      // التحقق من أن estimatedBudget أكبر من 0 إذا كان موجود
      if (tenderData.estimatedBudget !== null && tenderData.estimatedBudget <= 0) {
          toast.error('Estimated budget must be greater than 0');
          return;
      }
  
      try {
          let response;
          if (editingTender) {
              response = await api.put(`/tenders/${editingTender.id}`, tenderData);
              toast.success(t('Tender updated successfully!'));
              
              // إذا كان هناك فائز محدد، قم بمنحه
              console.log('Checking if winner should be awarded...');
              console.log('tenderData.winnerQuotationId:', tenderData.winnerQuotationId);
              console.log('quotations.length:', quotations.length);
              if (tenderData.winnerQuotationId && quotations.length > 0) {
                  try {
                      console.log('Awarding tender in handleSubmit:', editingTender.id, 'with quotation:', tenderData.winnerQuotationId);
                      console.log('Award data being sent:', { WinnerQuotationId: tenderData.winnerQuotationId });
                      console.log('Tender ID:', editingTender.id);
                      console.log('Quotation ID:', tenderData.winnerQuotationId);
                      const awardResponse = await api.patch(`/tenders/${editingTender.id}/award`, { 
                          WinnerQuotationId: tenderData.winnerQuotationId 
                      });
                       console.log('Award response in handleSubmit:', awardResponse);
                       
                       // تحديث التندر في القائمة مع الفائز
                       console.log('Updating tender locally with winner:', tenderData.winnerQuotationId);
                       console.log('Current quotations:', quotations);
                       setTenders(prevTenders => 
                         prevTenders.map(tender => 
                           tender.id === editingTender.id 
                             ? { 
                                 ...tender, 
                                 winnerQuotationId: tenderData.winnerQuotationId,
                                 quotations: quotations.map(q => 
                                   q.id === tenderData.winnerQuotationId 
                                     ? { ...q, status: 'awarded' }
                                     : q
                                 )
                               }
                             : tender
                         )
                       );
                       
                       toast.success('Winner selected and tender updated successfully!');
                  } catch (awardErr) {
                      console.error('Error awarding tender:', awardErr);
                      console.error('Award error response:', awardErr.response?.data);
                      console.error('Award error status:', awardErr.response?.status);
                      
                      let errorMessage = 'Tender updated but failed to select winner. Please try again.';
                      if (awardErr.response?.status === 404) {
                        errorMessage = 'API endpoint not found. Please check if the server is running correctly.';
                      } else if (awardErr.response?.status === 401) {
                        errorMessage = 'Unauthorized. Please check your login status.';
                      } else if (awardErr.response?.status === 403) {
                        errorMessage = 'Forbidden. You need Admin privileges to select winners.';
                      } else if (awardErr.response?.data?.message) {
                        errorMessage = awardErr.response.data.message;
                      }
                      
                      toast.error(errorMessage);
                  }
              }
          } else {
              response = await api.post('/tenders', tenderData);
              toast.success(t('Tender created successfully!'));
          }
          setShowModal(false);
          setForm(initialFormState);
          setEditingTender(null);
          setQuotations([]);
          // لا نحتاج fetchTenders() لأننا حدثنا البيانات محلياً
      } catch (err) {
          console.error('Error saving tender:', err);
          console.error('Error response:', err.response?.data);
          console.error('Error status:', err.response?.status);
          
          let errorMessage = 'Failed to save tender';
          if (err.response?.data) {
              if (typeof err.response.data === 'string') {
                  errorMessage = err.response.data;
              } else if (err.response.data.message) {
                  errorMessage = err.response.data.message;
              } else if (err.response.data.errors) {
                  // معالجة أخطاء التحقق
                  const errors = Object.values(err.response.data.errors).flat();
                  errorMessage = errors.join(', ');
              } else {
                  errorMessage = JSON.stringify(err.response.data);
              }
          }
          toast.error(errorMessage);
      }
  };

  const handleSelectWinner = async (tenderId, quotationId) => {
    if (!tenderId) {
      toast.error('No tender selected for awarding.');
      return;
    }

    // إذا لم يتم تحديد quotationId، افتح modal لاختيار الفائز
    if (!quotationId) {
      try {
        // العثور على بيانات التندر الكاملة
        const tender = tenders.find(t => t.id === tenderId);
        if (!tender) {
          toast.error('Tender not found.');
      return;
    }

        const quotations = await fetchTenderQuotations(tenderId);
        console.log('Quotations loaded for winner selection:', quotations);
        if (quotations.length === 0) {
          toast.error('No quotations available for this tender.');
          return;
        }
        
        // تحضير البيانات للتندر
        const formData = {
          title: tender.title,
          referenceNumber: tender.referenceNumber,
          category: tender.category,
          estimatedBudget: tender.estimatedBudget || '',
          submissionDeadline: tender.submissionDeadline?.split('T')[0] || '',
          openingDate: tender.openingDate?.split('T')[0] || '',
          status: tender.status,
          requirements: tender.requirements || '',
          termsConditions: tender.termsConditions || '',
          entityId: tender.entityId,
          active: tender.active,
          winnerQuotationId: tender.winnerQuotationId,
          lowestBidAmount: tender.lowestBidAmount || '',
          description: tender.description || '',
          awardedDate: tender.awardedDate?.split('T')[0] || '',
          awardedBy: tender.awardedBy,
          autoDetermineWinner: tender.autoDetermineWinner || false,
          winnerDeterminationMethod: tender.winnerDeterminationMethod,
          lowestBidQuotationId: tender.lowestBidQuotationId,
          highestScore: tender.highestScore,
          highestScoreQuotationId: tender.highestScoreQuotationId
        };
        
        console.log('Form data prepared:', formData);
        setForm(formData);
        
         setQuotations(quotations);
         setEditingTender(tender);
         
         // تحديث التندر مع الـ quotations
         setTenders(prevTenders => 
           prevTenders.map(t => 
             t.id === tenderId 
               ? { ...t, quotations: quotations }
               : t
           )
         );
         
         console.log('Setting form data for winner selection:', {
           title: tender.title,
           referenceNumber: tender.referenceNumber,
           winnerQuotationId: tender.winnerQuotationId
         });
         setShowModal(true);
        return;
      } catch (err) {
        console.error('Error loading quotations:', err);
        toast.error('Failed to load quotations for winner selection.');
        return;
      }
    }

     setSelectingWinner(true);
     try {
       console.log('Awarding tender:', tenderId, 'with quotation:', quotationId);
       console.log('Award data being sent:', { WinnerQuotationId: quotationId });
       console.log('Tender ID:', tenderId);
       console.log('Quotation ID:', quotationId);
       const response = await api.patch(`/tenders/${tenderId}/award`, { WinnerQuotationId: quotationId });
       console.log('Award response:', response);
      toast.success('Winner selected successfully!');
       
       // تحديث التندر في القائمة مع الفائز
       console.log('Updating tender locally with winner:', quotationId);
       console.log('Current tender quotations:', tenders.find(t => t.id === tenderId)?.quotations);
       setTenders(prevTenders => 
         prevTenders.map(tender => 
           tender.id === tenderId 
             ? { 
                 ...tender, 
                 winnerQuotationId: quotationId,
                 quotations: tender.quotations?.map(q => 
                   q.id === quotationId 
                     ? { ...q, status: 'awarded' }
                     : q
                 ) || []
               }
             : tender
         )
       );
       
       // لا نحتاج fetchTenders() لأننا حدثنا البيانات محلياً
      setShowModal(false);
    } catch (err) {
      console.error('Error selecting winner:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      let errorMessage = 'Failed to select winner';
      if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check if the server is running correctly.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Unauthorized. Please check your login status.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Forbidden. You need Admin privileges to select winners.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSelectingWinner(false);
    }
  };

  const handleEdit = async (tender) => {
    console.log('Editing tender:', tender);
    console.log('Tender status:', tender.status, 'type:', typeof tender.status);
    const statusString = getStatusString(tender.status);
    console.log('Status string:', statusString);
    setEditingTender(tender);
    const formData = {
      title: tender.title,
      referenceNumber: tender.referenceNumber,
      category: tender.category,
      estimatedBudget: tender.estimatedBudget,
      submissionDeadline: tender.submissionDeadline?.split('T')[0] || '',
      openingDate: tender.openingDate?.split('T')[0] || '',
      status: statusString,
      requirements: tender.requirements || '',
      termsConditions: tender.termsConditions || '',
      entityId: tender.entityId,
      active: tender.active,
      winnerQuotationId: tender.winnerQuotationId || null,
      lowestBidAmount: tender.lowestBidAmount || null,
      description: tender.description || '',
      awardedDate: tender.awardedDate?.split('T')[0] || '',
      awardedBy: tender.awardedBy || null,
      autoDetermineWinner: tender.autoDetermineWinner || false,
      winnerDeterminationMethod: tender.winnerDeterminationMethod || null,
      lowestBidQuotationId: tender.lowestBidQuotationId || null,
      highestScore: tender.highestScore || null,
      highestScoreQuotationId: tender.highestScoreQuotationId || null
    };
    console.log('Form data set:', formData);
    console.log('Form status in formData:', formData.status, 'type:', typeof formData.status);
    setForm(formData);

     // Fetch quotations for this tender
     try {
       const quotations = await fetchTenderQuotations(tender.id);
       console.log('Loaded quotations for tender:', quotations); // Debug log
       setQuotations(quotations);
       
       // تحديث التندر مع الـ quotations
       setTenders(prevTenders => 
         prevTenders.map(t => 
           t.id === tender.id 
             ? { ...t, quotations: quotations }
             : t
         )
       );
     } catch (err) {
       console.error('Error loading quotations for tender:', err);
       setQuotations([]);
     }

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tender?')) {
      try {
        await api.delete(`/tenders/${id}`);
        fetchTenders();
        toast.success('Tender deleted successfully!');
      } catch (err) {
        const errorMessage = err.response?.data?.message || JSON.stringify(err.response?.data) || 'Failed to delete tender';
        setError(errorMessage);
      }
    }
  };

   const handleViewQuotations = async (tenderId) => {
     try {
       console.log('Loading quotations for tender:', tenderId);
       const quotations = await fetchTenderQuotations(tenderId);
       console.log('Loaded quotations:', quotations);
       
       // العثور على بيانات التندر
       const tender = tenders.find(t => t.id === tenderId);
       
       // تحديث التندر مع الـ quotations
       setTenders(prevTenders => 
         prevTenders.map(t => 
           t.id === tenderId 
             ? { ...t, quotations: quotations }
             : t
         )
       );
       
       setSelectedTenderQuotations(quotations);
       setSelectedTenderForQuotations(tender);
       setShowQuotationsModal(true);
     } catch (err) {
       console.error('Error loading quotations:', err);
       toast.error('Failed to load quotations');
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      referenceNumber: '',
      category: '',
      estimatedBudget: '',
      submissionDeadline: '',
      openingDate: '',
      status: 'draft',
      requirements: '',
      termsConditions: '',
      entityId: '',
      active: true,
      winnerQuotationId: null,   // ✅ الفايز
      lowestBidAmount: null,
      description: '',
      awardedDate: '',
      awardedBy: null,
      autoDetermineWinner: false,
      winnerDeterminationMethod: null,
      lowestBidQuotationId: null,
      highestScore: null,
      highestScoreQuotationId: null
    });
    setQuotations([]); // ✅ امسح العروض عند الإنشاء
    setUploadedFiles([]);
  };

  const handleViewDetails = (tender) => {
    setSelectedTender(tender);
    setShowDetailsModal(true);
  };

  const handleViewFiles = (tender) => {
    setSelectedTender(tender);
    setShowFilesModal(true);
  };

  const openCreateModal = () => {
    setEditingTender(null);
    resetForm();
    setShowModal(true);
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
              <h4 className="mb-0">Tenders Management</h4>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Add Tender
              </Button>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Search and Filters */}
              <Row className="mb-3">
                <Col md={8}>
                  <SearchBar
                    placeholder="Search tenders by title, reference number, or description..."
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                      <option value="awarded">Awarded</option>
                      <option value="cancelled">Cancelled</option>
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
              <Card>
                <Card.Header>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>Advanced Filters</span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setFilters({
                          status: '',
                          category: '',
                          entityId: '',
                          winnerDeterminationMethod: '',
                          dateFrom: '',
                          dateTo: '',
                          budgetMin: '',
                          budgetMax: ''
                        });
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    {/* Status Filter */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          value={filters.status || ''}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">All Status</option>
                          <option value="draft">Draft</option>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="awarded">Awarded</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Category Filter */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Category</Form.Label>
                        <Form.Select
                          value={filters.category || ''}
                          onChange={(e) => setFilters({...filters, category: e.target.value})}
                        >
                          <option value="">All Categories</option>
                          <option value="Medical">Medical</option>
                          <option value="IT">IT</option>
                          <option value="Construction">Construction</option>
                          <option value="Services">Services</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Entity Filter */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Entity</Form.Label>
                        <Form.Select
                          value={filters.entityId || ''}
                          onChange={(e) => setFilters({...filters, entityId: e.target.value})}
                        >
                          <option value="">All Entities</option>
                          {entities.map(entity => (
                            <option key={entity.id} value={entity.id}>
                              {entity.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {/* Winner Determination Method Filter */}
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Winner Method</Form.Label>
                        <Form.Select
                          value={filters.winnerDeterminationMethod || ''}
                          onChange={(e) => setFilters({...filters, winnerDeterminationMethod: e.target.value})}
                        >
                          <option value="">All Methods</option>
                          <option value="lowestBid">Lowest Bid</option>
                          <option value="highestScore">Highest Score</option>
                          <option value="bestValue">Best Value</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mt-3">
                    {/* Date Range Filters */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Date Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="date"
                              value={filters.dateFrom || ''}
                              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                              placeholder="From Date"
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="date"
                              value={filters.dateTo || ''}
                              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                              placeholder="To Date"
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                    </Col>

                    {/* Budget Range */}
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Budget Range</Form.Label>
                        <Row>
                          <Col>
                            <Form.Control
                              type="number"
                              placeholder="Min Budget"
                              value={filters.budgetMin || ''}
                              onChange={(e) => setFilters({...filters, budgetMin: e.target.value})}
                            />
                          </Col>
                          <Col>
                            <Form.Control
                              type="number"
                              placeholder="Max Budget"
                              value={filters.budgetMax || ''}
                              onChange={(e) => setFilters({...filters, budgetMax: e.target.value})}
                            />
                          </Col>
                        </Row>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

              {/* Results Count and Clear Filters */}
              <Row className="mb-3">
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <h6 className="mb-0 me-3">
                      Results ({sortedTenders.length} of {tenders.length})
                    </h6>
                    {(searchTerm || statusFilter || Object.values(filters).some(v => v)) && (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('');
                          setFilters({
                            status: '',
                            category: '',
                            entityId: '',
                            winnerDeterminationMethod: '',
                            dateFrom: '',
                            dateTo: '',
                            budgetMin: '',
                            budgetMax: ''
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

              {/* Table */}
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>
                      <div className="d-flex align-items-center">
                        Title
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-1"
                          onClick={() => {
                            const newDirection = sortBy === 'title' && sortDirection === 'asc' ? 'desc' : 'asc';
                            setSortBy('title');
                            setSortDirection(newDirection);
                          }}
                        >
                          <FaSort />
                        </Button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center">
                        Ref #
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-1"
                          onClick={() => {
                            const newDirection = sortBy === 'referenceNumber' && sortDirection === 'asc' ? 'desc' : 'asc';
                            setSortBy('referenceNumber');
                            setSortDirection(newDirection);
                          }}
                        >
                          <FaSort />
                        </Button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center">
                        Category
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-1"
                          onClick={() => {
                            const newDirection = sortBy === 'category' && sortDirection === 'asc' ? 'desc' : 'asc';
                            setSortBy('category');
                            setSortDirection(newDirection);
                          }}
                        >
                          <FaSort />
                        </Button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center">
                        Budget
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-1"
                          onClick={() => {
                            const newDirection = sortBy === 'estimatedBudget' && sortDirection === 'asc' ? 'desc' : 'asc';
                            setSortBy('estimatedBudget');
                            setSortDirection(newDirection);
                          }}
                        >
                          <FaSort />
                        </Button>
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center">
                        Deadline
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 ms-1"
                          onClick={() => {
                            const newDirection = sortBy === 'submissionDeadline' && sortDirection === 'asc' ? 'desc' : 'asc';
                            setSortBy('submissionDeadline');
                            setSortDirection(newDirection);
                          }}
                        >
                          <FaSort />
                        </Button>
                      </div>
                    </th>
                    <th>Status</th>
                    <th>Entity</th>
                    <th>Winning Bid</th>
                    <th>Quotations</th>
                    <th>Details</th>
                    <th>Files</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTenders.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="text-center py-4">
                        <div>
                          <FaSearch className="text-muted mb-2" style={{ fontSize: '2rem' }} />
                          <h6>No Tenders Found</h6>
                          <p className="text-muted mb-0">
                            {searchTerm || statusFilter || Object.values(filters).some(v => v) 
                              ? 'Try adjusting your search criteria or filters.'
                              : 'No tenders available. Create a new tender to get started.'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedTenders.map(tender => (
                    <tr key={tender.id}>
                      <td>{tender.title}</td>
                      <td><Badge bg="secondary">{tender.referenceNumber}</Badge></td>
                      <td>{tender.category}</td>
                      <td>{tender.estimatedBudget || '-'}</td>
                      <td>{tender.submissionDeadline?.split('T')[0]}</td>
                      <td>
                        {(() => {
                          const statusString = getStatusString(tender.status);
                          console.log('Tender:', tender.title, 'Status number:', tender.status, 'Status string:', statusString);
                          return (
                            <Badge bg={
                              statusString === 'open'
                                ? 'success'
                                : statusString === 'closed'
                                ? 'danger'
                                : statusString === 'awarded'
                                ? 'info'
                                : statusString === 'cancelled'
                                ? 'warning'
                                : 'secondary'
                            }>
                              {statusString}
                            </Badge>
                          );
                        })()}
                      </td>
                      <td>{entities.find(e => e.id === tender.entityId)?.name || '-'}
                      </td>
                      <td>
                        {tender.winnerQuotationId ? (
                          <Badge bg="success">
                             🏆 Winner: {tender.quotations?.find(q => q.id === tender.winnerQuotationId)?.supplierName || 'Unknown'} - {tender.quotations?.find(q => q.id === tender.winnerQuotationId)?.currency || '$'} {parseFloat(tender.quotations?.find(q => q.id === tender.winnerQuotationId)?.amount || tender.lowestBidAmount || 0).toLocaleString()}
                          </Badge>
                        ) : (
                           <Badge bg="secondary">No Winner</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Badge bg="info" className="me-2">
                            {tender.quotationCount || 0} Quotations
                          </Badge>
                          {tender.quotationCount > 0 && (
                          <Button
                              variant="outline-primary"
                            size="sm"
                              onClick={() => handleViewQuotations(tender.id)}
                          >
                              View Details
                          </Button>
                        )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-info" onClick={() => handleViewDetails(tender)}>
                            <FaEye />
                          </Button>
                          <Button size="sm" variant="outline-secondary" onClick={() => handleViewFiles(tender)}>
                            <FaFileAlt />
                          </Button>
                        </div>
                      </td>
                      <td>
                          <div className="d-flex gap-1">
                            <Button size="sm" variant="outline-primary" onClick={() => handleEdit(tender)}>
                          <FaEdit />
                        </Button>
                            {tender.quotationCount > 0 && getStatusString(tender.status) !== 'awarded' && (
                              <Button 
                                size="sm" 
                                variant="outline-success" 
                                onClick={() => handleSelectWinner(tender.id, null)}
                                disabled={selectingWinner}
                              >
                                Select Winner
                              </Button>
                            )}
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(tender.id)}>
                          <FaTrash />
                        </Button>
                          </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {sortedTenders.map(tender => showQuotations[tender.id] && (
                <Card key={`quotations-${tender.id}`} className="mt-3 mb-3">
                  <Card.Header>Quotations for Tender: {tender.title}</Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>Supplier</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tender.quotations && tender.quotations.length > 0 ? (
                          tender.quotations.map(quotation => (
                            <tr key={quotation.id}>
                              <td>{quotation.supplierName || 'Unknown Supplier'}</td>
                              <td>{quotation.currency} {quotation.amount}</td>
                              <td>
                                <Badge bg={
                                  quotation.status === 'Awarded' ? 'success' :
                                  quotation.status === 'Rejected' ? 'danger' :
                                  quotation.status === 'UnderReview' ? 'warning' : 'secondary'
                                }>
                                  {quotation.status}
                                </Badge>
                              </td>
                              <td>
                                {getStatusString(tender.status) === 'open' && (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => handleSelectWinner(tender.id, quotation.id)}
                                    disabled={tender.winnerQuotationId === quotation.id || selectingWinner}
                                  >
                                    {selectingWinner ? 'Selecting...' : 
                                     tender.winnerQuotationId === quotation.id ? 'Winner Selected' : 'Select Winner'}
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4">No quotations available for this tender.</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ))}

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTender ? 
              (quotations.length > 0 ? 'Select Winner - Edit Tender' : 'Edit Tender') : 
              'Add Tender'
            }
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Reference Number *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.referenceNumber}
                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated Budget</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.estimatedBudget}
                    onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Submission Deadline *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.submissionDeadline}
                    onChange={(e) => setForm({ ...form, submissionDeadline: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Opening Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.openingDate}
                    onChange={(e) => setForm({ ...form, openingDate: e.target.value })}
                    min={form.submissionDeadline || new Date().toISOString().split('T')[0]}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={form.status}
                onChange={(e) => {
                  console.log('Status changed to:', e.target.value);
                  setForm({ ...form, status: e.target.value });
                }}
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="awarded">Awarded</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Current form status: {form.status} (type: {typeof form.status})
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Terms & Conditions</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.termsConditions}
                onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Entity *</Form.Label>
              <Form.Select
                value={form.entityId}
                onChange={(e) => setForm({ ...form, entityId: e.target.value })}
                required
              >
                <option value="">-- Select Entity --</option>
                {entities && Array.isArray(entities) && entities.length > 0 ? (
                  entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.name}
                  </option>
                  ))
                ) : (
                  <option disabled>No entities available. Please create an entity first.</option>
                )}
              </Form.Select>
              {entities && Array.isArray(entities) && entities.length === 0 && (
                <div>
                  <Form.Text className="text-warning">
                    No entities found. Please create an entity first or check if entities are loaded.
                  </Form.Text>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    className="ms-2"
                    onClick={fetchEntities}
                  >
                    Refresh Entities
                  </Button>
                </div>
              )}
            </Form.Group>

            {/* Winner Selection from Quotations */}
            {quotations.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Winner Supplier *</Form.Label>
                {form.winnerQuotationId && (
                  <Alert variant="success" className="mb-2">
                    <strong>🏆 Current Winner:</strong> {quotations.find(q => q.id === form.winnerQuotationId)?.supplierName || 'Unknown'} - {quotations.find(q => q.id === form.winnerQuotationId)?.currency} {parseFloat(quotations.find(q => q.id === form.winnerQuotationId)?.amount || 0).toLocaleString()}
                  </Alert>
                )}
                <Form.Select
                  value={form.winnerQuotationId || ''}
                  onChange={(e) => setForm({ ...form, winnerQuotationId: e.target.value })}
                  required
                >
                  <option value="">-- Select Winner --</option>
                  {quotations
                    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount)) // ترتيب حسب السعر
                    .map(q => (
                    <option key={q.id} value={q.id}>
                        {q.supplierName || 'Unknown Supplier'} - {q.currency} {parseFloat(q.amount).toLocaleString()}
                        {q.status === 'awarded' ? ' (Already Awarded)' : ''}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  {quotations.length} quotation(s) available. Sorted by price (lowest first).
                </Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Lowest Bid Amount</Form.Label>
              <Form.Control
                type="number"
                value={form.lowestBidAmount || ''}
                onChange={(e) => setForm({ ...form, lowestBidAmount: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Awarded Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.awardedDate}
                    onChange={(e) => setForm({ ...form, awardedDate: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Awarded By</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.awardedBy || ''}
                    onChange={(e) => setForm({ ...form, awardedBy: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Auto Determine Winner"
                checked={form.autoDetermineWinner}
                onChange={(e) => setForm({ ...form, autoDetermineWinner: e.target.checked })}
              />
            </Form.Group>

            {form.autoDetermineWinner && (
              <Form.Group className="mb-3">
                <Form.Label>Winner Determination Method</Form.Label>
                <Form.Select
                  value={form.winnerDeterminationMethod || ''}
                  onChange={(e) => setForm({ ...form, winnerDeterminationMethod: e.target.value })}
                >
                  <option value="">-- Select Method --</option>
                  <option value="lowestBid">Lowest Bid</option>
                  <option value="highestScore">Highest Score</option>
                </Form.Select>
              </Form.Group>
            )}

            {form.winnerDeterminationMethod === 'lowestBid' && (
              <Form.Group className="mb-3">
                <Form.Label>Lowest Bid Quotation ID</Form.Label>
                <Form.Control
                  type="text"
                  value={form.lowestBidQuotationId || ''}
                  onChange={(e) => setForm({ ...form, lowestBidQuotationId: e.target.value })}
                />
              </Form.Group>
            )}

            {form.winnerDeterminationMethod === 'highestScore' && (
              <Form.Group className="mb-3">
                <Form.Label>Highest Score</Form.Label>
                <Form.Control
                  type="number"
                  value={form.highestScore || ''}
                  onChange={(e) => setForm({ ...form, highestScore: e.target.value })}
                />
              </Form.Group>
            )}

            {form.winnerDeterminationMethod === 'highestScore' && (
              <Form.Group className="mb-3">
                <Form.Label>Highest Score Quotation ID</Form.Label>
                <Form.Control
                  type="text"
                  value={form.highestScoreQuotationId || ''}
                  onChange={(e) => setForm({ ...form, highestScoreQuotationId: e.target.value })}
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Attachments</Form.Label>
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingTender ? 
                (quotations.length > 0 ? 'Select Winner & Update' : 'Update') : 
                'Create'
              }
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>


      {/* Quotations Details Modal */}
      <Modal show={showQuotationsModal} onHide={() => setShowQuotationsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Quotations Details
            {selectedTenderForQuotations?.winnerQuotationId && (
              <Badge bg="success" className="ms-2">
                🏆 Winner Selected
              </Badge>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTenderQuotations.length > 0 ? (
            <div>
              <div className="mb-3">
                <Badge bg="info" className="me-2">
                  Total: {selectedTenderQuotations.length} Quotations
                </Badge>
                <Badge bg="success" className="me-2">
                  Lowest: {selectedTenderQuotations.reduce((min, q) => 
                    parseFloat(q.amount) < parseFloat(min.amount) ? q : min
                  ).currency} {Math.min(...selectedTenderQuotations.map(q => parseFloat(q.amount))).toLocaleString()}
                </Badge>
                 {selectedTenderForQuotations?.winnerQuotationId && (
                   <Badge bg="warning" className="me-2">
                     🏆 Winner: {selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.supplierName || 'Unknown'} - {selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.currency || '$'} {parseFloat(selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.amount || 0).toLocaleString()}
                   </Badge>
                 )}
              </div>
              
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Supplier</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTenderQuotations
                    .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount))
                    .map((quotation, index) => {
                      const isWinner = selectedTenderForQuotations?.winnerQuotationId === quotation.id;
                      return (
                        <tr key={quotation.id} className={isWinner ? 'table-success' : quotation.status === 'awarded' ? 'table-success' : ''}>
                          <td>
                            <strong>{quotation.supplierName || 'Unknown Supplier'}</strong>
                            {index === 0 && <Badge bg="warning" className="ms-2">Lowest</Badge>}
                            {isWinner && <Badge bg="success" className="ms-2">🏆 Winner</Badge>}
                          </td>
                        <td>
                          <strong>{parseFloat(quotation.amount).toLocaleString()}</strong>
                        </td>
                        <td>{quotation.currency}</td>
                         <td>
                           <Badge bg={
                             quotation.status === 'awarded' || selectedTenderForQuotations?.winnerQuotationId === quotation.id ? 'success' :
                             quotation.status === 'accepted' ? 'primary' :
                             quotation.status === 'rejected' ? 'danger' :
                             'secondary'
                           }>
                             {selectedTenderForQuotations?.winnerQuotationId === quotation.id ? 'Winner' : quotation.status}
                           </Badge>
                         </td>
                        <td>{quotation.submittedAt ? new Date(quotation.submittedAt).toLocaleDateString() : '-'}</td>
                        <td>{quotation.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          ) : (
            <div>
              <Alert variant="info">No quotations found for this tender.</Alert>
               {selectedTenderForQuotations?.winnerQuotationId && (
                 <Alert variant="success">
                   <strong>🏆 Winner Selected:</strong> {selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.supplierName || 'Unknown'} - {selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.currency || '$'} {parseFloat(selectedTenderQuotations.find(q => q.id === selectedTenderForQuotations.winnerQuotationId)?.amount || 0).toLocaleString()}
                 </Alert>
               )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuotationsModal(false)}>
            Close
          </Button>
          {selectedTenderQuotations.length > 0 && (
            <Button 
              variant="success" 
              onClick={() => {
                setShowQuotationsModal(false);
                // افتح modal اختيار الفائز
                const tender = tenders.find(t => t.id === selectedTenderQuotations[0].tenderId);
                if (tender) {
                  // تأكد من أن التندر موجود في القائمة
                  if (tender) {
                    handleSelectWinner(tender.id, null);
                  } else {
                    toast.error('Tender not found in current list. Please refresh the page.');
                  }
                }
              }}
            >
              Select Winner
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tender Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTender && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Title:</h6>
                  <p>{selectedTender.title}</p>
                </Col>
                <Col md={6}>
                  <h6>Description:</h6>
                  <p>{selectedTender.description}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Status:</h6>
                  <Badge bg={
                    getStatusString(selectedTender.status) === 'open' ? 'success' :
                    getStatusString(selectedTender.status) === 'closed' ? 'danger' :
                    getStatusString(selectedTender.status) === 'awarded' ? 'primary' : 'secondary'
                  }>
                    {getStatusString(selectedTender.status)}
                  </Badge>
                </Col>
                <Col md={6}>
                  <h6>Budget:</h6>
                  <p>{selectedTender.currency} {selectedTender.budget}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Start Date:</h6>
                  <p>{selectedTender.startDate ? new Date(selectedTender.startDate).toLocaleDateString() : 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <h6>End Date:</h6>
                  <p>{selectedTender.endDate ? new Date(selectedTender.endDate).toLocaleDateString() : 'N/A'}</p>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <h6>Quotation Count:</h6>
                  <p>{selectedTender.quotationCount || 0}</p>
                </Col>
                <Col md={6}>
                  <h6>Winner:</h6>
                  <p>{selectedTender.winnerQuotationId ? 
                    selectedTender.quotations?.find(q => q.id === selectedTender.winnerQuotationId)?.supplierName || 'Unknown' : 
                    'No Winner Selected'}</p>
                </Col>
              </Row>
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
          <Modal.Title>Tender Files</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTender && selectedTender.attachments && selectedTender.attachments.length > 0 ? (
            <div>
              <h6>Attached Files:</h6>
              <ListGroup>
                {selectedTender.attachments.map((file, index) => (
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
              <p>No files attached to this tender.</p>
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

export default Tenders;
