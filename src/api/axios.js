import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_BASE_URL || "https://api.minumanmurah.com/api",
  baseURL: "https://api.minumanmurah.com/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Ambil token dari Cookie 'auth_token'
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hapus token dan data user dari Cookie jika unauthorized (401)
      Cookies.remove("auth_token");
      Cookies.remove("auth_user");
    }
    return Promise.reject(error);
  },
);

export default api;
