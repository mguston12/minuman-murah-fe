import { ref, computed } from "vue";
import Cookies from "js-cookie";

// Helper fungsi untuk parsing JSON dengan aman
const getInitialUser = () => {
  const savedUser = Cookies.get("auth_user");
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch (e) {
    return null;
  }
};

const token = ref(Cookies.get("auth_token") || null);
const user = ref(getInitialUser());

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value);

  const setAuthData = (newToken, userData = null) => {
    token.value = newToken;
    user.value = userData;

    if (newToken) {
      Cookies.set("auth_token", newToken, {
        expires: 7,
        secure: true,
        sameSite: "Lax",
      });
      if (userData) {
        Cookies.set("auth_user", JSON.stringify(userData), {
          expires: 7,
          secure: true,
          sameSite: "Lax",
        });
      }
    } else {
      Cookies.remove("auth_token");
      Cookies.remove("auth_user");
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
