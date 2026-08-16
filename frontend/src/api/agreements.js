import api from './axios';

export const getAgreements = async (params = {}) => {
  const response = await api.get('/agreements/', { params });
  return response.data;
};

export const getAgreement = async (id) => {
  const response = await api.get(`/agreements/${id}/`);
  return response.data;
};

export const createAgreement = async (data) => {
  const response = await api.post('/agreements/', data);
  return response.data;
};

export const updateAgreement = async (id, data) => {
  const response = await api.put(`/agreements/${id}/`, data);
  return response.data;
};

export const deleteAgreement = async (id) => {
  const response = await api.delete(`/agreements/${id}/`);
  return response.data;
};
