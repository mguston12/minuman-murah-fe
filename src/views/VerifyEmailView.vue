<template>
  <div class="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
    <div class="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-md border border-gray-100">
      
      <!-- STATE LOADING -->
      <div v-if="status === 'loading'" class="py-6">
        <div class="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 class="text-xl font-bold text-gray-800">Memverifikasi Email...</h2>
        <p class="text-gray-500 text-sm mt-2">Mohon tunggu sebentar, kami sedang memproses akun kamu.</p>
      </div>

      <!-- STATE SUCCESS -->
      <div v-else-if="status === 'success'" class="py-4">
        <div class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">Email Berhasil Diverifikasi!</h2>
        <p class="text-gray-600 text-sm mt-2 mb-6">
          {{ message || 'Akun kamu telah aktif. Silakan login untuk mulai berbelanja.' }}
        </p>
        <router-link
          to="/login"
          class="inline-block w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          Lanjut ke Halaman Login
        </router-link>
      </div>

      <!-- STATE ERROR -->
      <div v-else-if="status === 'error'" class="py-4">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800">Verifikasi Gagal</h2>
        <p class="text-red-500 text-sm mt-2 mb-6">
          {{ message || 'Token verifikasi tidak valid atau sudah kadaluwarsa.' }}
        </p>
        <div class="space-y-3">
          <router-link
            to="/login"
            class="block w-full py-3 px-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors"
          >
            Kembali ke Login
          </router-link>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { authService } from '../services/apiServices';

const route = useRoute();

const status = ref('loading'); 
const message = ref('');

const processVerification = async () => {
  const token = route.query.token;
  const email = route.query.email;

  if (!token || !email) {
    status.value = 'error';
    message.value = 'Parameter token atau email tidak ditemukan pada URL.';
    return;
  }

  try {
    const response = await authService.verifyEmail({ token, email });
    
    status.value = 'success';
    message.value = response?.data?.message || 'Email kamu berhasil diverifikasi.';
  } catch (error) {
    console.error('Email verification error:', error);
    status.value = 'error';
    message.value = error.response?.data?.message || 'Gagal memverifikasi email. Token mungkin sudah tidak berlaku.';
  }
};

onMounted(() => {
  processVerification();
});
</script>