<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useAuth } from "../composables/useAuth";
import { authService } from "../services/apiServices";

const route = useRoute();
const router = useRouter();

const { setAuthData } = useAuth();

const showPassword = ref(false);
const isLoading = ref(false);
const error = ref("");
const successMessage = ref("");

let isMounted = true;

const formData = ref({
  email: "",
  password: "",
  rememberMe: false,
});

const localError = computed(() => error.value || "");

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const clearError = () => {
  error.value = "";
};

onMounted(() => {
  isMounted = true;
  clearError();

  if (route.query.registered === "true") {
    successMessage.value =
      "Pendaftaran berhasil! Silakan login dengan akun Anda.";
    setTimeout(() => {
      if (isMounted) successMessage.value = "";
    }, 5000);
  }

  const savedEmail = localStorage.getItem("remembered_email");
  if (savedEmail) {
    formData.value.email = savedEmail;
    formData.value.rememberMe = true;
  }
});

onBeforeUnmount(() => {
  isMounted = false;
  isLoading.value = false;
});

const handleLogin = async () => {
  if (!formData.value.email || !formData.value.password) return;
  if (!isMounted) return;

  isLoading.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const response = await authService.login({
      email: formData.value.email,
      password: formData.value.password,
    });

    if (!isMounted) return;

    const token =
      response.data.auth_token ||
      response.data.token ||
      response.data.data?.token;
    const user =
      response.data.auth_user || response.data.user || response.data.data?.user;

    if (token) {
      setAuthData(token, user);

      if (formData.value.rememberMe) {
        localStorage.setItem("remembered_email", formData.value.email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      isLoading.value = false;

      const redirect = route.query.redirect || "/";
      router.push(redirect);
    } else {
      error.value = "Format respon server tidak valid (Token tidak ditemukan).";
      isLoading.value = false;
    }
  } catch (err) {
    if (isMounted) {
      error.value =
        err.response?.data?.message ||
        err?.message ||
        "Login gagal. Periksa kembali email dan kata sandi Anda.";
      isLoading.value = false;
    }
  }
};
</script>

<template>
  <div
    class="py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center"
  >
    <div class="w-full max-w-md space-y-6">
      <!-- Card Form Login -->
      <div
        class="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-2xl sm:px-8 space-y-5"
      >
        <div class="text-center">
          <h2 class="text-2xl font-bold tracking-tight text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Masukkan email dan kata sandi untuk melanjutkan
          </p>
        </div>

        <!-- Alert Success -->
        <div
          v-if="successMessage"
          class="rounded-lg bg-green-50 p-3.5 text-xs text-green-700 border border-green-200 flex items-center justify-between"
          role="alert"
        >
          <span>{{ successMessage }}</span>
          <button
            @click="successMessage = ''"
            type="button"
            class="text-green-600 font-bold ml-2"
          >
            &times;
          </button>
        </div>

        <!-- Alert Error -->
        <div
          v-if="localError"
          class="rounded-lg bg-red-50 p-3.5 text-xs text-red-700 border border-red-200 flex items-center justify-between"
          role="alert"
        >
          <span>{{ localError }}</span>
          <button
            @click="clearError"
            type="button"
            class="text-red-600 font-bold ml-2"
          >
            &times;
          </button>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Input Email -->
          <div>
            <label
              for="email"
              class="block text-xs font-medium text-gray-700 mb-1"
            >
              Alamat Email
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                :disabled="isLoading"
                placeholder="nama@email.com"
                class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Input Password -->
          <div>
            <label
              for="password"
              class="block text-xs font-medium text-gray-700 mb-1"
            >
              Kata Sandi
            </label>
            <div class="relative rounded-lg shadow-sm">
              <div
                class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
              >
                <svg
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                :disabled="isLoading"
                placeholder="Masukkan kata sandi"
                class="block w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100"
              />
              <button
                type="button"
                @click="togglePassword"
                :disabled="isLoading"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg
                  v-if="!showPassword"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 012.122-.363c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.692-4.692a3 3 0 00-4.243-4.243"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 3l18 18"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember & Forgot -->
          <div class="flex items-center justify-between text-xs">
            <label
              class="flex items-center gap-1.5 cursor-pointer text-gray-600"
            >
              <input
                id="rememberMe"
                v-model="formData.rememberMe"
                type="checkbox"
                class="h-3.5 w-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
              />
              <span>Ingat saya</span>
            </label>

            <router-link
              to="/forgot-password"
              class="font-medium text-[#E25C38] hover:underline"
            >
              Lupa kata sandi?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1C1A17] hover:bg-black focus:outline-none transition-colors disabled:opacity-50"
          >
            <svg
              v-if="isLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ isLoading ? "Memproses..." : "Masuk" }}
          </button>
        </form>

        <!-- Register Link -->
        <div class="text-center text-xs text-gray-500 pt-2">
          Belum punya akun?
          <router-link
            to="/register"
            class="font-semibold text-[#E25C38] hover:underline ml-1"
          >
            Daftar sekarang
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
