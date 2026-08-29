import api from './axios';

export const getCases = async (params = {}) => {
  const response = await api.get('/cases/', { params });
  return response.data;
};

export const getCase = async (id) => {
  const response = await api.get(`/cases/${id}/`);
  return response.data;
};

export const createCase = async (data, isMultipart = false) => {
  const config = isMultipart ? {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  } : {};
  const response = await api.post('/cases/', data, config);
  return response.data;
};

export const updateCase = async (id, data) => {
  const response = await api.put(`/cases/${id}/`, data);
  return response.data;
};

export const deleteCase = async (id) => {
  const response = await api.delete(`/cases/${id}/`);
  return response.data;
};

export const assignCase = async (id, officerId) => {
  const response = await api.post(`/cases/${id}/assign/`, { officer_id: officerId });
  return response.data;
};

export const updateCaseStatus = async (id, status) => {
  const response = await api.post(`/cases/${id}/update_status/`, { status });
  return response.data;
};

export const reviewCase = async (id, decision, reason = null) => {
  const data = { decision };
  if (reason) {
    data.reason = reason;
  }
  const response = await api.post(`/cases/${id}/review/`, data);
  return response.data;
};

export const getCaseHistory = async (id) => {
  const response = await api.get(`/cases/${id}/history/`);
  return response.data;
};

export const getCampuses = async () => {
  const response = await api.get('/core/campuses/');
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/core/departments/');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/core/case-categories/');
  return response.data;
};
