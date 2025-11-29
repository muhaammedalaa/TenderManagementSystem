// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("tms_auth_state_v1");
  if (raw) {
    try {
      const { token } = JSON.parse(raw);
      if (token && typeof token === "string" && token.includes(".")) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        // console.log("Authorization Header:", config.headers.Authorization);
      }
    } catch (err) {
      console.warn("Invalid auth state in localStorage:", err);
    }
  }
  return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on 401
      localStorage.removeItem("tms_auth_state_v1");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const seederAPI = {
  seed: () => api.post('/seeder/seed'),
  clear: () => api.post('/seeder/clear'),
  reset: () => api.post('/seeder/reset'),
  getStats: () => api.get('/seeder/stats'),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const suppliersAPI = {
  getAll: (params) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (supplierData) => api.post('/suppliers', supplierData),
  update: (id, supplierData) => api.put(`/suppliers/${id}`, supplierData),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const tendersAPI = {
  getAll: (params) => api.get('/tenders', { params }),
  getById: (id) => api.get(`/tenders/${id}`),
  create: (tenderData) => api.post('/tenders', tenderData),
  update: (id, tenderData) => api.put(`/tenders/${id}`, tenderData),
  delete: (id) => api.delete(`/tenders/${id}`),
};

export const quotationsAPI = {
  getAll: (params) => api.get('/quotations', { params }),
  getById: (id) => api.get(`/quotations/${id}`),
  create: (quotationData) => api.post('/quotations', quotationData),
  update: (id, quotationData) => api.put(`/quotations/${id}`, quotationData),
  delete: (id) => api.delete(`/quotations/${id}`),
};

export const contractsAPI = {
  getAll: (params) => api.get('/contracts', { params }),
  getById: (id) => api.get(`/contracts/${id}`),
  create: (contractData) => api.post('/contracts', contractData),
  update: (id, contractData) => api.put(`/contracts/${id}`, contractData),
  delete: (id) => api.delete(`/contracts/${id}`),
};

export const entitiesAPI = {
  getAll: (params) => api.get('/entities', { params }),
  getById: (id) => api.get(`/entities/${id}`),
  create: (entityData) => api.post('/entities', entityData),
  update: (id, entityData) => api.put(`/entities/${id}`, entityData),
  delete: (id) => api.delete(`/entities/${id}`),
};

export const bankGuaranteesAPI = {
  getAll: (params) => api.get('/bankguarantees', { params }),
  getById: (id) => api.get(`/bankguarantees/${id}`),
  create: (guaranteeData) => api.post('/bankguarantees', guaranteeData),
  update: (id, guaranteeData) => api.put(`/bankguarantees/${id}`, guaranteeData),
  delete: (id) => api.delete(`/bankguarantees/${id}`),
};

export const governmentGuaranteesAPI = {
  getAll: (params) => api.get('/governmentguarantees', { params }),
  getById: (id) => api.get(`/governmentguarantees/${id}`),
  create: (guaranteeData) => api.post('/governmentguarantees', guaranteeData),
  update: (id, guaranteeData) => api.put(`/governmentguarantees/${id}`, guaranteeData),
  delete: (id) => api.delete(`/governmentguarantees/${id}`),
};

export const supportMattersAPI = {
  getAll: (params) => api.get('/supportmatters', { params }),
  getById: (id) => api.get(`/supportmatters/${id}`),
  create: (matterData) => api.post('/supportmatters', matterData),
  update: (id, matterData) => api.put(`/supportmatters/${id}`, matterData),
  delete: (id) => api.delete(`/supportmatters/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notificationData) => api.post('/notifications', notificationData),
  update: (id, notificationData) => api.put(`/notifications/${id}`, notificationData),
  delete: (id) => api.delete(`/notifications/${id}`),
};
// بعد كل exports، ضيف ده:

export const supplyDeliveriesAPI = {
  getAll: (params) => api.get('/supplydeliveries', { params }),
  getById: (id) => api.get(`/supplydeliveries/${id}`),
  create: (data) => api.post('/supplydeliveries', data),
  update: (id, data) => api.put(`/supplydeliveries/${id}`, data),
  delete: (id) => api.delete(`/supplydeliveries/${id}`),
  updateStatus: (id, statusDto) => api.patch(`/supplydeliveries/${id}/status`, statusDto),
};

export const filesAPI = {
  upload: (file, entityType, entityId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entityType', entityType);
    formData.append('entityId', entityId);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/files/${id}`),
  getAll: (params) => api.get('/files', { params }),
};

export const financialAPI = {
  // Invoices
  getInvoices: (params) => api.get('/financial/invoices', { params }),
  getInvoiceById: (id) => api.get(`/financial/invoices/${id}`),
  createInvoice: (invoiceData) => api.post('/financial/invoices', invoiceData),
  updateInvoice: (id, invoiceData) => api.put(`/financial/invoices/${id}`, invoiceData),
  deleteInvoice: (id) => api.delete(`/financial/invoices/${id}`),
  getInvoicesByContract: (contractId) => api.get(`/financial/invoices/contract/${contractId}`),
  
  // Payments
  getPayments: (params) => api.get('/financial/payments', { params }),
  getPaymentById: (id) => api.get(`/financial/payments/${id}`),
  createPayment: (paymentData) => api.post('/financial/payments', paymentData),
  updatePayment: (id, paymentData) => api.put(`/financial/payments/${id}`, paymentData),
  confirmPayment: (id, confirmationData) => api.post(`/financial/payments/${id}/confirm`, confirmationData),
  deletePayment: (id) => api.delete(`/financial/payments/${id}`),
  getPaymentsByInvoice: (invoiceId) => api.get(`/financial/payments/invoice/${invoiceId}`),
  
  // Payment Schedules
  getPaymentSchedules: (params) => api.get('/financial/payment-schedules', { params }),
  getPaymentScheduleById: (id) => api.get(`/financial/payment-schedules/${id}`),
  createPaymentSchedule: (scheduleData) => api.post('/financial/payment-schedules', scheduleData),
  updatePaymentSchedule: (id, scheduleData) => api.put(`/financial/payment-schedules/${id}`, scheduleData),
  deletePaymentSchedule: (id) => api.delete(`/financial/payment-schedules/${id}`),
  getPaymentSchedulesByContract: (contractId) => api.get(`/financial/payment-schedules/contract/${contractId}`),
  
  // Financial Reports
  getContractFinancialSummary: (contractId) => api.get(`/financial/contracts/${contractId}/summary`),
  generateFinancialReport: (reportRequest) => api.post('/financial/reports', reportRequest),
  getOverduePayments: () => api.get('/financial/overdue-payments'),
  getPaymentAnalytics: () => api.get('/financial/analytics'),
};

export const approvalWorkflowAPI = {
  // Workflows
  getWorkflows: () => api.get('/approvalworkflow/workflows'),
  getWorkflowById: (id) => api.get(`/approvalworkflow/workflows/${id}`),
  createWorkflow: (workflowData) => api.post('/approvalworkflow/workflows', workflowData),
  updateWorkflow: (id, workflowData) => api.put(`/approvalworkflow/workflows/${id}`, workflowData),
  deleteWorkflow: (id) => api.delete(`/approvalworkflow/workflows/${id}`),
  activateWorkflow: (id) => api.post(`/approvalworkflow/workflows/${id}/activate`),
  deactivateWorkflow: (id) => api.post(`/approvalworkflow/workflows/${id}/deactivate`),
  
  // Steps
  getWorkflowSteps: (workflowId) => api.get(`/approvalworkflow/workflows/${workflowId}/steps`),
  createStep: (workflowId, stepData) => api.post(`/approvalworkflow/workflows/${workflowId}/steps`, stepData),
  updateStep: (stepId, stepData) => api.put(`/approvalworkflow/steps/${stepId}`, stepData),
  deleteStep: (stepId) => api.delete(`/approvalworkflow/steps/${stepId}`),
  
  // Requests
  getRequests: (params) => api.get('/approvalworkflow/requests', { params }),
  getRequestById: (id) => api.get(`/approvalworkflow/requests/${id}`),
  createRequest: (requestData) => api.post('/approvalworkflow/requests', requestData),
  getMyPendingApprovals: (userId) => api.get(`/approvalworkflow/requests/my-pending/${userId}`),
  getOverdueRequests: () => api.get('/approvalworkflow/requests/overdue'),
  
  // Actions
  processAction: (actionData) => api.post('/approvalworkflow/actions', actionData),
  getRequestActions: (requestId) => api.get(`/approvalworkflow/requests/${requestId}/actions`),
  getUserActions: (userId) => api.get(`/approvalworkflow/actions/user/${userId}`),
  
  // Workflow Processing
  startWorkflow: (requestId) => api.post(`/approvalworkflow/requests/${requestId}/start`),
  moveToNextStep: (requestId) => api.post(`/approvalworkflow/requests/${requestId}/next-step`),
  returnToPreviousStep: (requestId) => api.post(`/approvalworkflow/requests/${requestId}/previous-step`),
  completeWorkflow: (requestId, completionNotes) => api.post(`/approvalworkflow/requests/${requestId}/complete`, completionNotes),
  rejectWorkflow: (requestId, rejectionReason) => api.post(`/approvalworkflow/requests/${requestId}/reject`, rejectionReason),
  
  // Statistics
  getStatistics: () => api.get('/approvalworkflow/statistics'),
  getUserStatistics: (userId) => api.get(`/approvalworkflow/statistics/user/${userId}`),
};


export { api };
export default api;