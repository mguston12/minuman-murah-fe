import { ref, computed } from "vue";

const token = ref(localStorage.getItem("auth_token") || null);
const user = ref(JSON.parse(localStorage.getItem("auth_user") || "null"));

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value);

  const setAuthData = (newToken, userData = null) => {
    token.value = newToken;
    user.value = userData;

    if (newToken) {
      localStorage.setItem("auth_token", newToken);
      if (userData) {
        localStorage.setItem("auth_user", JSON.stringify(userData));
      }
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
  };

  const logout = () => {
    setAuthData(null, null);
  };

  return {
    token,
    user,
    isLoggedIn,
    setAuthData,
    logout,
  };
}
