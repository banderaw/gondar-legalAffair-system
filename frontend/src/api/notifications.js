import api from './axios';

export const getNotifications = async () => {
  const response = await api.get('/notifications/');
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.post('/notifications/mark_read/');
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await api.post(`/notifications/${notificationId}/mark_single_read/`);
  return response.data;
};
