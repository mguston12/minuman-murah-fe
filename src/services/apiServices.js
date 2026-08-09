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
  getBlogs: (params) => api.get('/blogs/filter', { params }), //[cite: 1]
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`), //[cite: 1]
  getCategories: () => api.get('/category-blogs/active'), //[cite: 1]
};

// Product API
export const productService = {
  getProducts: () => api.get('/products'), //[cite: 1]
  getProductById: (id) => api.get(`/products/${id}`), //[cite: 1]
};