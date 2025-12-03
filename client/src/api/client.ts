import axios, { AxiosInstance } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Pokemon routes
export const pokemonAPI = {
  getList: (limit: number = 20, offset: number = 0, generation?: number) =>
    apiClient.get('/pokemon', { params: { limit, offset, ...(generation && { generation }) } }),
  getDetail: (id: number | string) => apiClient.get(`/pokemon/${id}`),
  search: (query: string, limit: number = 20, offset: number = 0) =>
    apiClient.get('/pokemon/search', { params: { q: query, limit, offset } }),
};

// Caught Pokemon routes
export const caughtAPI = {
  getAll: (clientId: string) => apiClient.get('/caught', { params: { clientId } }),
  create: (data: any) => apiClient.post('/caught', data),
  update: (id: string, data: any) => apiClient.put(`/caught/${id}`, data),
  delete: (id: string) => apiClient.delete(`/caught/${id}`),
};

// Teams routes
export const teamsAPI = {
  getAll: (clientId: string) => apiClient.get('/teams', { params: { clientId } }),
  create: (data: any) => apiClient.post('/teams', data),
  update: (id: string, data: any) => apiClient.put(`/teams/${id}`, data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`),
};

export default apiClient;
