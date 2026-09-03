import api from "../api/axios";

// Auth API
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  verifyEmail: (token, email) =>
    api.get(`/auth/verify-email/${token}`, { params: { email } }),
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

// Banner API (Dibutuhkan untuk Hero Slide)
export const bannerService = {
  getMainBanners: (params = {}) => api.get("/public/main-banners", { params }),
};

// Public Config API
export const publicConfigService = {
  getPublicConfigs: () => api.get("/public-configs"),
  getConfigByKey: (key) => api.get(`/public-configs/${key}`),
  getTopBannerConfig: () => api.get("/public-configs/topbanner"),
  getProtection: () => api.get("/public-configs/product_protection"),
  getMidtransConfig: () => api.get("/public-configs/midtrans"),
};

// Alias / Export Tambahan untuk Kompatibilitas Import
export const configService = publicConfigService;

// Cart API (Tambahan Fitur Keranjang)
export const cartService = {
  getCart: () => api.get("/cart"),
  addToCart: (payload) => api.post("/cart", payload), // { product_id, quantity, variant_id }
  updateCartItem: (cartItemId, payload) =>
    api.put(`/cart/${cartItemId}`, payload), // { quantity }
  removeCartItem: (cartItemId) => api.delete(`/cart/${cartItemId}`),
  clearCart: () => api.delete("/cart/clear"),
};

// Address API
export const addressService = {
  getAddresses: () => api.get("/shipping-addresses"),
  createAddress: (data) => api.post("/shipping-addresses", data),
  updateAddress: (id, data) => api.put(`/shipping-addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/shipping-addresses/${id}`),
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

// Review API (Tambahan Ulasan Produk)
export const reviewService = {
  getProductReviews: (productId, params) =>
    api.get(`/products/${productId}/reviews`, { params }),
  createReview: (payload) => api.post("/reviews", payload),
};
