import api from './axios';

export const login = async (username, password) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register/', userData);
  return response.data;
};

export const refreshToken = async (refresh) => {
  const response = await api.post('/auth/token/refresh/', { refresh });
  return response.data;
};

export const logout = async () => {
  // Note: JWT tokens are stateless, so logout is mainly client-side
  // We'll clear tokens from storage in the auth context
  return Promise.resolve();
};
