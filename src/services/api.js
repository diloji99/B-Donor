import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5179/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👇 Auth helper hook
export const useAuth = () => {
  const token = localStorage.getItem('token');

  return {
    isAuthenticated: !!token,
    token
  };
};

export default api;
