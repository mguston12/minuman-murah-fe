import Cookies from "js-cookie";

export const useAuthApi = () => {
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "https://api.minumanmurah.com/api";

  const getHeaders = () => {
    // Ambil token dari Cookie 'auth_token'
    const token = Cookies.get("auth_token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const request = async (url, options = {}) => {
    try {
      const res = await fetch(`${baseURL}${url}`, {
        ...options,
        headers: {
          ...getHeaders(),
          ...options.headers,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          data: null,
          error: {
            message: data.message || "An error occurred",
            data: data.data || null,
            errors: data.errors || null,
          },
        };
      }

      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: { message: err?.message || "Network error", errors: null },
      };
    }
  };

  const register = (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) });

  const login = (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) });

  const logout = () => request("/auth/logout", { method: "POST" });

  const getMe = () => request("/auth/me", { method: "GET" });

  const verifyEmail = (emailToken, email) =>
    request(
      `/auth/verify-email/${emailToken}?email=${encodeURIComponent(email)}`,
      { method: "GET" },
    );

  const resendVerificationEmail = (email) =>
    request("/auth/resend-verification-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  const forgotPassword = (email) =>
    request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

  const resetPassword = (token, email, password, passwordConfirmation) =>
    request(`/auth/reset-password/${token}`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        password_confirmation: passwordConfirmation,
      }),
    });

  return {
    register,
    login,
    logout,
    getMe,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
  };
};
