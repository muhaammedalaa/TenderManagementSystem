import api from './api';

export const getQuotationsByTender = async (tenderId) => {
  const res = await api.get(`/api/quotations`, { params: { tenderId } });
  return res.data;
};

export const createQuotation = async (payload) => {
  const res = await api.post(`/api/quotations`, payload);
  return res.data;
};
