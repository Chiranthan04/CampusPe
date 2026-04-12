import api from './axios';
export const fetchItems = () => api.get('/items');
export const fetchItem = (id) => api.get(`/items/${id}`);
export const createItem = (data) => api.post('/items', data);
export const updateItem = (id, data) => api.put(`/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const fetchStats = () => api.get('/items/stats');