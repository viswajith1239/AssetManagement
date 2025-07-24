import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
   
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


export const assetCategoriesAPI = {
  getAll: (params) => api.get('/asset-categories', { params }),
  getById: (id) => api.get(`/asset-categories/${id}`),
  create: (data) => api.post('/asset-categories', data),
  update: (id, data) => api.put(`/asset-categories/${id}`, data),
  delete: (id) => api.delete(`/asset-categories/${id}`),
  exportExcel: () => api.get('/asset-categories/export/excel', { responseType: 'blob' }),
  importExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/asset-categories/import/excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};


export const assetSubcategoriesAPI = {
  getAll: (params) => api.get('/asset-subcategories', { params }),
  getById: (id) => api.get(`/asset-subcategories/${id}`),
  create: (data) => api.post('/asset-subcategories', data),
  update: (id, data) => api.put(`/asset-subcategories/${id}`, data),
  delete: (id) => api.delete(`/asset-subcategories/${id}`),
};


export const branchesAPI = {
  getAll: (params) => api.get('/branches', { params }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
};


export const vendorsAPI = {
  getAll: (params) => api.get('/vendors', { params }),
  getById: (id) => api.get(`/vendors/${id}`),
  create: (data) => api.post('/vendors', data),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};


export const manufacturersAPI = {
  getAll: (params) => api.get('/manufacturers', { params }),
  getById: (id) => api.get(`/manufacturers/${id}`),
  create: (data) => api.post('/manufacturers', data),
  update: (id, data) => api.put(`/manufacturers/${id}`, data),
  delete: (id) => api.delete(`/manufacturers/${id}`),
};


export const grnsAPI = {
  getAll: (params) => api.get('/grns', { params }),
  getById: (id) => api.get(`/grns/${id}`),
  create: (data) => api.post('/grns', data),
  update: (id, data) => api.put(`/grns/${id}`, data),
  delete: (id) => api.delete(`/grns/${id}`),
  

  addLineItem: (grnId, data) => api.post(`/grns/${grnId}/line-items`, data),
  updateLineItem: (grnId, lineItemId, data) => api.put(`/grns/${grnId}/line-items/${lineItemId}`, data),
  deleteLineItem: (grnId, lineItemId) => api.delete(`/grns/${grnId}/line-items/${lineItemId}`),
  

  generateReport: (params) => api.get('/grns/report/register', { params }),
  exportReport: (params) => api.get('/grns/report/register', { 
    params: { ...params, format: 'excel' },
    responseType: 'blob' 
  }),
};

export default api; 