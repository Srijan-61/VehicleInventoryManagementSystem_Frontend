import apiClient from './axiosConfig';

export const customerApi = {
  getProfile: () => apiClient.get('/customer/profile'),
  updateProfile: (data) => apiClient.put('/customer/profile', data),
  getHistory: () => apiClient.get('/customer/history'),
  selfServiceRequest: (data) => apiClient.post('/customer/self-service', data),
};
