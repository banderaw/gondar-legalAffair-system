import api from './axios';

export const getHearings = async (params = {}) => {
  const response = await api.get('/hearings/hearings/', { params });
  return response.data;
};

export const getHearing = async (id) => {
  const response = await api.get(`/hearings/hearings/${id}/`);
  return response.data;
};

export const createHearing = async (data) => {
  const response = await api.post('/hearings/hearings/', data);
  return response.data;
};

export const updateHearing = async (id, data) => {
  const response = await api.put(`/hearings/hearings/${id}/`, data);
  return response.data;
};

export const deleteHearing = async (id) => {
  const response = await api.delete(`/hearings/hearings/${id}/`);
  return response.data;
};

export const getDeadlines = async (params = {}) => {
  const response = await api.get('/hearings/deadlines/', { params });
  return response.data;
};

export const getDeadline = async (id) => {
  const response = await api.get(`/hearings/deadlines/${id}/`);
  return response.data;
};

export const createDeadline = async (data) => {
  const response = await api.post('/hearings/deadlines/', data);
  return response.data;
};

export const updateDeadline = async (id, data) => {
  const response = await api.put(`/hearings/deadlines/${id}/`, data);
  return response.data;
};

export const deleteDeadline = async (id) => {
  const response = await api.delete(`/hearings/deadlines/${id}/`);
  return response.data;
};

export const markDeadlineResolved = async (id) => {
  const response = await api.patch(`/hearings/deadlines/${id}/mark_resolved/`);
  return response.data;
};
