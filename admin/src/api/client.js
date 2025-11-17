import axios from 'axios';

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const isHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
const BASE_URL = (isHttps && RAW_BASE.startsWith('http:')) ? '' : RAW_BASE; // use relative /api when https page + http api

export const api = axios.create({
  baseURL: BASE_URL || undefined, // let axios use relative URLs with Vite proxy
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // auto-logout on unauthorized
      localStorage.removeItem('adminToken');
      if (!location.pathname.includes('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export async function adminLogin({ email, password }) {
  const { data } = await api.post('/api/admin/login', { email, password });
  return data;
}

export async function listProducts(params = {}) {
  const { data } = await api.get('/api/products', { params });
  return data;
}

export async function getProduct(id) {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
}

export async function addProduct(formData) {
  const { data } = await api.post('/api/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateProduct(id, payloadOrFormData, isMultipart = false) {
  const config = isMultipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined;
  const { data } = await api.put(`/api/products/${id}`, payloadOrFormData, config);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/api/products/${id}`);
  return data;
}

export async function exportProducts() {
  const res = await api.get('/api/products/export', { responseType: 'blob' });
  return res;
}

export async function importProducts(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/api/products/import', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}

// Orders
export async function listOrders(params = {}) {
  const { data } = await api.get('/api/orders', { params });
  return data;
}

export async function getOrderDetail(id) {
  const { data } = await api.get(`/api/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id, payload) {
  const { data } = await api.put(`/api/orders/${id}/status`, payload);
  return data;
}

export async function getDashboard() {
  const { data } = await api.get('/api/admin/dashboard');
  return data;
}

// Shipping settings
export async function getShipping() {
  const { data } = await api.get('/api/admin/shipping');
  return data;
}

export async function saveShipping(payload) {
  const { data } = await api.put('/api/admin/shipping', payload);
  return data;
}

export async function quoteShipping(params = {}) {
  const { data } = await api.get('/api/shipping/quote', { params });
  return data;
}

// Customers
export async function listCustomers(params = {}) {
  const { data } = await api.get('/api/admin/customers', { params });
  return data;
}

export async function getCustomerProfile(id) {
  const { data } = await api.get(`/api/admin/customers/${id}`);
  return data;
}

export async function updateCustomerProfile(id, payload) {
  const { data } = await api.put(`/api/admin/customers/${id}`, payload);
  return data;
}

export async function notifyCustomer(id, payload) {
  const { data } = await api.post(`/api/admin/customers/${id}/notify`, payload);
  return data;
}

export async function blacklistCustomer(id) {
  const { data } = await api.post(`/api/admin/customers/${id}/blacklist`);
  return data;
}

// Coupons & Promotions
export async function listCoupons() {
  const { data } = await api.get('/api/admin/coupons');
  return data;
}
export async function saveCouponApi(payload) {
  const method = payload._id ? 'put' : 'post';
  const { data } = await api[method]('/api/admin/coupons', payload);
  return data;
}
export async function deleteCouponApi(id) {
  const { data } = await api.delete(`/api/admin/coupons/${id}`);
  return data;
}
export async function listPromotionsApi() {
  const { data } = await api.get('/api/admin/promotions');
  return data;
}
export async function savePromotionApi(payload) {
  const method = payload._id ? 'put' : 'post';
  const { data } = await api[method]('/api/admin/promotions', payload);
  return data;
}
export async function deletePromotionApi(id) {
  const { data } = await api.delete(`/api/admin/promotions/${id}`);
  return data;
}
export async function applyDiscountsApi(payload) {
  const { data } = await api.post('/api/discounts/apply', payload);
  return data;
}

export async function exportOrders() {
  return api.get('/api/orders/export', { responseType: 'blob' });
}

export async function downloadInvoice(id) {
  return api.get(`/api/orders/${id}/invoice`, { responseType: 'blob' });
}

export async function downloadLabel(id) {
  return api.get(`/api/orders/${id}/label`, { responseType: 'blob' });
}

export async function updateRefund(id, payload) {
  const { data } = await api.put(`/api/orders/${id}/refund`, payload);
  return data;
}

export async function updateReturn(id, payload) {
  const { data } = await api.put(`/api/orders/${id}/return`, payload);
  return data;
}

// CMS: Banners
export async function listBanners() {
  const { data } = await api.get('/api/admin/cms/banners');
  return data;
}
export async function saveBannerApi(formData) {
  const method = formData.get && formData.get('_id') ? 'put' : 'post';
  const { data } = await api[method]('/api/admin/cms/banners', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
export async function deleteBannerApi(id) {
  const { data } = await api.delete(`/api/admin/cms/banners/${id}`);
  return data;
}

// CMS: Posts
export async function listPostsApi() {
  const { data } = await api.get('/api/admin/cms/posts');
  return data;
}
export async function savePostApi(formData) {
  const method = formData.get && formData.get('_id') ? 'put' : 'post';
  const { data } = await api[method]('/api/admin/cms/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
export async function deletePostApi(id) {
  const { data } = await api.delete(`/api/admin/cms/posts/${id}`);
  return data;
}

// CMS: Pages
export async function listPagesApi() {
  const { data } = await api.get('/api/admin/cms/pages');
  return data;
}
export async function savePageApi(payload) {
  const method = payload._id ? 'put' : 'post';
  const { data } = await api[method]('/api/admin/cms/pages', payload);
  return data;
}

// CMS: Media
export async function listMediaApi(params = {}) {
  const { data } = await api.get('/api/admin/cms/media', { params });
  return data;
}
export async function uploadMediaApi(files) {
  const fd = new FormData();
  [...files].forEach((f) => fd.append('files', f));
  const { data } = await api.post('/api/admin/cms/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
}
export async function deleteMediaApi(id) {
  const { data } = await api.delete(`/api/admin/cms/media/${id}`);
  return data;
}
