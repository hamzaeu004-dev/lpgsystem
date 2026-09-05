import api from '../../api/axiosConfig';

export const salesAPI = {
  getAll: () => api.get('/sales'),
  getByShop: (shopId) => api.get(`/sales/shop/${shopId}`),
  create: (data) => api.post('/sales', data),
  getStats: () => api.get('/sales/stats'),
};