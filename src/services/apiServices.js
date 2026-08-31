import api from "../api/axios";

// Auth API
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  verifyEmail: (token, email) =>
    api.get(`/auth/verify-email/${token}`, { params: { email } }),
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
  getBrands: () => api.get("/brands/all"),
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
};

// Order API
export const orderService = {
  getOrders: (params) => api.get("/orders", { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
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
  checkVoucher: (code) => api.post("/vouchers/check", { code }),
};

// Public Config API
export const publicConfigService = {
  getPublicConfigs: () => api.get("/public-configs"),
  getConfigByKey: (key) => api.get(`/public-configs/${key}`),
  getProtection: () => api.get("/public-configs/product_protection"),
};

export const bannerService = {
  getMainBanners() {
    return api.get("/public/main-banners");
  },
};
