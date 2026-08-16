import api from './axios';

export const getCampuses = async () => {
  const response = await api.get('/core/campuses/');
  return response.data;
};

export const createCampus = async (data) => {
  const response = await api.post('/core/campuses/', data);
  return response.data;
};

export const updateCampus = async (id, data) => {
  const response = await api.put(`/core/campuses/${id}/`, data);
  return response.data;
};

export const deleteCampus = async (id) => {
  const response = await api.delete(`/core/campuses/${id}/`);
  return response.data;
};

export const getDepartments = async () => {
  const response = await api.get('/core/departments/');
  return response.data;
};

export const createDepartment = async (data) => {
  const response = await api.post('/core/departments/', data);
  return response.data;
};

export const updateDepartment = async (id, data) => {
  const response = await api.put(`/core/departments/${id}/`, data);
  return response.data;
};

export const deleteDepartment = async (id) => {
  const response = await api.delete(`/core/departments/${id}/`);
  return response.data;
};

export const getCaseCategories = async () => {
  const response = await api.get('/core/case-categories/');
  return response.data;
};

export const createCaseCategory = async (data) => {
  const response = await api.post('/core/case-categories/', data);
  return response.data;
};

export const updateCaseCategory = async (id, data) => {
  const response = await api.put(`/core/case-categories/${id}/`, data);
  return response.data;
};

export const deleteCaseCategory = async (id) => {
  const response = await api.delete(`/core/case-categories/${id}/`);
  return response.data;
};
