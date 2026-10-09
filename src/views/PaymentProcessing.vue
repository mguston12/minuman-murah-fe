<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";

const KEY = "pending_invoice_url";
const timedOut = ref(false);
let timer = null;

const goToInvoice = (url) => {
    if (!url) return;
    localStorage.removeItem(KEY);
    window.location.replace(url);
};

const onStorage = (e) => {
    if (e.key === KEY && e.newValue) goToInvoice(e.newValue);
};

onMounted(() => {
    // Kalau URL sudah siap sebelum halaman ini selesai dimuat
    goToInvoice(localStorage.getItem(KEY));

    // Kalau URL baru siap setelah halaman ini tampil
    window.addEventListener("storage", onStorage);

    // Pengaman kalau proses terlalu lama
    timer = setTimeout(() => {
        timedOut.value = true;
    }, 30000);
});

onBeforeUnmount(() => {
    window.removeEventListener("storage", onStorage);
    clearTimeout(timer);
});
</script>

<template>
    <div class="min-h-[60vh] bg-[#FAF6F0] flex items-center justify-center px-4 py-16">
        <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
            <div class="w-14 h-14 mx-auto mb-6 rounded-full border-4 border-[#FFE6DE] border-t-[#E25C38] animate-spin">
            </div>
            <h1 class="text-xl font-extrabold text-gray-900">Memproses pembayaran...</h1>
            <p class="text-sm text-gray-500 mt-2 leading-relaxed">
                Mohon tunggu sebentar, kamu akan segera diarahkan ke halaman pembayaran yang aman.
            </p>
            <p v-if="timedOut" class="text-xs text-red-500 mt-4">
                Proses memakan waktu lebih lama dari biasanya. Cek tab checkout atau buka
                <router-link to="/account/orders?tab=unpaid" class="underline font-semibold">daftar
                    pesanan</router-link>.
            </p>
            <p class="text-xs text-gray-400 mt-6 pt-5 border-t border-gray-100">🔒 Transaksi aman &amp; terenkripsi</p>
        </div>
    </div>
</template>