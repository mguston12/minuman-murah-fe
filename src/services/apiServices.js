import api from "../api/axios";

// Auth API
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  verifyEmail: (token, email) =>
    api.get(`/auth/verify-email/${token}`, { params: { email } }),
  // Tambahan untuk alur Lupa Password
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (payload) => api.post("/auth/reset-password", payload),
  updateProfile: (data) => api.put("/auth/profile", data),
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
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getBrands: () => api.get("/brands/all"),
  // Tambahan Search & Related Products jika dibutuhkan
  searchProducts: (query) =>
    api.get("/products/search", { params: { q: query } }),
  getRelatedProducts: (id) => api.get(`/products/${id}/related`),
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

// Address API
export const addressService = {
  getAddresses: () => api.get("/shipping-addresses"),
  createAddress: (data) => api.post("/shipping-addresses", data),
  updateAddress: (id, data) => api.put(`/shipping-addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/shipping-addresses/${id}`),
  // Tambahan untuk mengubah alamat utama
  setPrimaryAddress: (id) => api.patch(`/shipping-addresses/${id}/set-primary`),
};

// Shipping / Region API
export const shippingService = {
  getProvinces: () => api.get("/shipping/provinces"),
  getCities: (provinceId) =>
    api.get("/shipping/cities", { params: { province_id: provinceId } }),
  getDistricts: (cityId) =>
    api.get("/shipping/districts", { params: { city_id: cityId } }),
  getSubDistricts: (districtId) =>
    api.get("/shipping/sub-districts", { params: { district_id: districtId } }),

  getShippingCost: (payload) => api.post("/shipping/cost", payload),
  // Tambahan untuk melacak resi pengiriman
  trackShipping: (waybill, courier) =>
    api.post("/shipping/track", { waybill, courier }),
};

// Order API
export const orderService = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (payload) => api.post("/checkout/create", payload),
  payOrderMidtrans: (orderId, payload) =>
    api.post(`/orders/${orderId}/pay/midtrans`, payload),
  // Tambahan untuk manajemen transaksi user
  cancelOrder: (orderId, reason) =>
    api.post(`/orders/${orderId}/cancel`, { reason }),
  confirmReceived: (orderId) => api.post(`/orders/${orderId}/confirm-received`),
};

// Wishlist API
export const wishlistService = {
  getWishlist: () => api.get("/user/wishlist"),
  addToWishlist: (productId) =>
    api.post("/user/wishlist", { product_id: productId }),
  removeFromWishlist: (id) => api.delete(`/user/wishlist/${id}`),
};

// Voucher API
export const voucherService = {
  getVouchers: () => api.get("/vouchers"),
  getApplicable: (params) => api.post("/vouchers/applicable", params),
  checkVoucher: (code) => api.post("/vouchers/check", { code }),
};

// Public Config API
export const publicConfigService = {
  getPublicConfigs: () => api.get("/public-configs"),
  getConfigByKey: (key) => api.get(`/public-configs/${key}`),
  getProtection: () => api.get("/public-configs/product_protection"),
  // Tambahan untuk mengambil Client Key Midtrans dari Server
  getMidtransConfig: () => api.get("/public-configs/midtrans"),
};

export const bannerService = {
  getMainBanners: () => api.get("/public/main-banners"),
};
