import api from "../api/axios";

// Auth API
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

// Blog API
export const blogService = {
  getBlogs: (params) => api.get("/blogs/filter", { params }),
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  getCategories: () => api.get("/category-blogs/active"),
};

// Product API
export const productService = {
  getProducts: (params = {}) => api.get("/products", { params }),
  getProductBySlug(slug) {
    return api.get(`/products/${slug}`);
  },
};

// Taxonomy / Category API
export const taxonomyService = {
  getTaxoByType: (type) => api.get(`/taxo-lists/type/${type}`),
};

export const brandService = {
  getActiveBrands: () => api.get("/brands/active"),
};

export const attributeService = {
  getActiveAttributes: () => api.get("/attributes/active"),
};

// Add: Address API
export const addressService = {
  getAddresses: () => api.get("/shipping-addresses"),
  createAddress: (data) => api.post("/shipping-addresses", data),
  updateAddress: (id, data) => api.put(`/shipping-addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/shipping-addresses/${id}`),
};

// Add: Order API
export const orderService = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
};

// Add: Wishlist API
export const wishlistService = {
  getWishlist: () => api.get("/user/wishlist"),
  addToWishlist: (productId) =>
    api.post("/user/wishlist", { product_id: productId }),
  removeFromWishlist: (id) => api.delete(`/user/wishlist/${id}`),
};
