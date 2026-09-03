<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthApi } from "../composables/useAuthApi";

const router = useRouter();
const { register: registerApi } = useAuthApi();

// States
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const errorMessage = ref("");
const successMessage = ref("");
const alertType = ref("error"); // 'error' | 'warning' | 'success'

let isMounted = true;

const formData = ref({
  name: "",
  last_name: "",
  email: "",
  phone: "",
  dob: "",
  gender: "",
  password: "",
  password_confirmation: "",
  agreeTerms: false,
});

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const clearAlerts = () => {
  errorMessage.value = "";
  successMessage.value = "";
};

onMounted(() => {
  isMounted = true;
  clearAlerts();
});

onBeforeUnmount(() => {
  isMounted = false;
  isLoading.value = false;
});

const handleRegister = async () => {
  clearAlerts();

  // Client-side validations
  if (formData.value.password !== formData.value.password_confirmation) {
    alertType.value = "error";
    errorMessage.value = "Password dan konfirmasi password tidak cocok.";
    return;
  }

  if (!formData.value.agreeTerms) {
    alertType.value = "warning";
    errorMessage.value =
      "Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan.";
    return;
  }

  isLoading.value = true;

  try {
    const { data, error: apiError } = await registerApi({
      name: formData.value.name,
      last_name: formData.value.last_name,
      email: formData.value.email,
      phone: formData.value.phone,
      dob: formData.value.dob,
      gender: formData.value.gender,
      password: formData.value.password,
      password_confirmation: formData.value.password_confirmation,
    });

    if (!isMounted) return;

    if (apiError || !data?.success) {
      alertType.value = "error";
      errorMessage.value =
        apiError?.message ||
        data?.message ||
        "Registrasi gagal. Silakan coba lagi.";
    } else {
      successMessage.value = `Akun berhasil dibuat! Silakan periksa email (${formData.value.email}) untuk verifikasi.`;

      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        if (isMounted) {
          router.push({ path: "/login", query: { registered: "true" } });
        }
      }, 3000);
    }
  } catch (err) {
    if (isMounted) {
      alertType.value = "error";
      errorMessage.value =
        err?.message || "Terjadi kesalahan sistem saat registrasi.";
    }
  } finally {
    if (isMounted) {
      isLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
    <div class="w-full max-w-lg space-y-6">
      <!-- Heading -->

      <!-- Card Form -->
      <div class="bg-white py-8 px-6 shadow-sm border border-gray-100 rounded-2xl sm:px-8 space-y-5">
        <div class="text-center">
          <h2 class="text-2xl font-bold tracking-tight text-gray-900">
            Buat Akun Baru
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Lengkapi formulir di bawah ini untuk mendaftar.
          </p>
        </div>
        <!-- Alert Success -->
        <div v-if="successMessage"
          class="rounded-lg bg-green-50 p-3.5 text-xs text-green-700 border border-green-200 flex items-center justify-between"
          role="alert">
          <span>{{ successMessage }}</span>
          <button @click="successMessage = ''" type="button" class="text-green-600 font-bold ml-2">
            &times;
          </button>
        </div>

        <!-- Alert Error / Warning -->
        <div v-if="errorMessage" :class="[
          'rounded-lg p-3.5 text-xs border flex items-center justify-between',
          alertType === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-red-50 text-red-700 border-red-200',
        ]" role="alert">
          <span>{{ errorMessage }}</span>
          <button @click="errorMessage = ''" type="button" class="font-bold ml-2">
            &times;
          </button>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <!-- Name Group (First Name & Last Name) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-xs font-medium text-gray-700 mb-1">Nama Depan</label>
              <input id="firstName" v-model="formData.name" type="text" required :disabled="isLoading"
                placeholder="John"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
            </div>
            <div>
              <label for="lastName" class="block text-xs font-medium text-gray-700 mb-1">Nama Belakang</label>
              <input id="lastName" v-model="formData.last_name" type="text" required :disabled="isLoading"
                placeholder="Doe"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-xs font-medium text-gray-700 mb-1">Alamat Email</label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input id="email" v-model="formData.email" type="email" required :disabled="isLoading"
                placeholder="nama@email.com"
                class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
            </div>
          </div>

          <!-- Phone -->
          <div>
            <label for="phone" class="block text-xs font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input id="phone" v-model="formData.phone" type="tel" required :disabled="isLoading"
                placeholder="+62812345678"
                class="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
            </div>
          </div>

          <!-- DOB & Gender -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="dob" class="block text-xs font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input id="dob" v-model="formData.dob" type="date" required :disabled="isLoading"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
            </div>
            <div>
              <label for="gender" class="block text-xs font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select id="gender" v-model="formData.gender" required :disabled="isLoading"
                class="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100">
                <option value="" disabled selected>Pilih jenis kelamin</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-xs font-medium text-gray-700 mb-1">Kata Sandi</label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'" minlength="8"
                required :disabled="isLoading" placeholder="Minimal 8 karakter"
                class="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
              <button type="button" @click="togglePassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <svg v-if="!showPassword" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.982 8.982 0 013.122-.722c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.029m-5.858 5.908a3 3 0 11-4.243-4.243" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="passwordConfirm" class="block text-xs font-medium text-gray-700 mb-1">Konfirmasi Kata
              Sandi</label>
            <div class="relative rounded-lg shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input id="passwordConfirm" v-model="formData.password_confirmation"
                :type="showConfirmPassword ? 'text' : 'password'" required :disabled="isLoading"
                placeholder="Ulangi kata sandi"
                class="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-800 focus:border-gray-800 disabled:bg-gray-100" />
              <button type="button" @click="toggleConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                <svg v-if="!showConfirmPassword" class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.982 8.982 0 013.122-.722c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-1.563 3.029m-5.858 5.908a3 3 0 11-4.243-4.243" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Terms Checkbox -->
          <div class="flex items-center pt-1">
            <input id="agreeTerms" v-model="formData.agreeTerms" type="checkbox" required
              class="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-800" />
            <label for="agreeTerms" class="ml-2 block text-xs text-gray-600">
              Saya menyetujui
              <a href="/terms-conditions" target="_blank" rel="noopener noreferrer"
                class="text-gray-900 font-medium hover:underline">
                syarat & ketentuan
              </a>
              yang berlaku
            </label>
          </div>

          <!-- Submit Button -->
          <button type="submit" :disabled="isLoading || !formData.agreeTerms"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1C1A17] hover:bg-black focus:outline-none transition-colors disabled:opacity-50 mt-2">
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
              </path>
            </svg>
            {{ isLoading ? "Membuat Akun..." : "Daftar Akun" }}
          </button>
        </form>

        <!-- Link Back to Login -->
        <div class="text-center text-xs text-gray-500 pt-2">
          Sudah memiliki akun?
          <router-link to="/login" class="font-semibold text-[#E25C38] hover:underline ml-1">
            Masuk di sini
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
