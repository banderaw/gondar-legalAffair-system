import api from './axios';

export const getDocuments = async (params = {}) => {
  const response = await api.get('/documents/', { params });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}/`);
  return response.data;
};

export const createDocument = async (data) => {
  const response = await api.post('/documents/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateDocument = async (id, data) => {
  const response = await api.put(`/documents/${id}/`, data);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}/`);
  return response.data;
};

export const downloadDocument = async (id) => {
  const response = await api.get(`/documents/${id}/download/`, {
    responseType: 'blob'
  });
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `document_${id}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return response.data;
};

export const getCaseDocuments = async (caseId) => {
  const response = await api.get(`/documents/`, { params: { case: caseId } });
  return response.data;
};
