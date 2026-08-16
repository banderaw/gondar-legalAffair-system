import api from './axios';

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary/');
  return response.data;
};

export const getAdminDashboard = async () => {
  const response = await api.get('/dashboard/admin/');
  return response.data;
};

export const getHeadDashboard = async () => {
  const response = await api.get('/dashboard/head/');
  return response.data;
};

export const getOfficerDashboard = async () => {
  const response = await api.get('/dashboard/officer/');
  return response.data;
};

export const getReporterDashboard = async () => {
  const response = await api.get('/dashboard/reporter/');
  return response.data;
};

export const getLegalOfficers = async () => {
  const response = await api.get('/auth/legal_officers/');
  return response.data;
};
