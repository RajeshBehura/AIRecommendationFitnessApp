import axios from 'axios';
import keycloak from './keycloak';

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL;

const api = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    if (keycloak.authenticated) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (userData) => api.put('/api/auth/profile', userData),
  syncUser: (userData) => api.post('/api/auth/sync-user', userData)
};

export const workoutService = {
  getAll: () => api.get('/api/workouts'),
  getById: (id) => api.get(`/api/workouts/${id}`),
  create: (workout) => api.post('/api/workouts', workout),
  update: (id, workout) => api.put(`/api/workouts/${id}`, workout),
  delete: (id) => api.delete(`/api/workouts/${id}`),
  getByUserId: (userId) => api.get(`/api/workouts/user/${userId}`)
};

export const nutritionService = {
  getAll: () => api.get('/api/nutrition'),
  getById: (id) => api.get(`/api/nutrition/${id}`),
  create: (nutrition) => api.post('/api/nutrition', nutrition),
  update: (id, nutrition) => api.put(`/api/nutrition/${id}`, nutrition),
  delete: (id) => api.delete(`/api/nutrition/${id}`),
  getByUserId: (userId) => api.get(`/api/nutrition/user/${userId}`)
};

export const goalService = {
  getAll: () => api.get('/api/goals'),
  getById: (id) => api.get(`/api/goals/${id}`),
  create: (goal) => api.post('/api/goals', goal),
  update: (id, goal) => api.put(`/api/goals/${id}`, goal),
  delete: (id) => api.delete(`/api/goals/${id}`),
  getByUserId: (userId) => api.get(`/api/goals/user/${userId}`)
};

export default api;