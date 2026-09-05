import api from '../../api/axiosConfig';

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getByShop: (shopId) => api.get(`/inventory/shop/${shopId}`),
  create: (data) => api.post('/inventory', data),
  updateStatus: (id, data) => api.put(`/inventory/${id}/status`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
};