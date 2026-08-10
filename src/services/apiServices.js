import api from '../api/axios';

// Auth API
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials), 
  register: (data) => api.post('/auth/register', data), 
  getMe: () => api.get('/auth/me'), 
  logout: () => api.post('/auth/logout'), 
};

// Blog API
export const blogService = {
  getBlogs: (params) => api.get('/blogs/filter', { params }), 
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`), 
  getCategories: () => api.get('/category-blogs/active'),
};

// Product API
export const productService = {
  getProducts: () => api.get('/products'),
  getProductById: (id) => api.get(`/products/${id}`), 
};