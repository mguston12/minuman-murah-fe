<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { cartService } from "../services/apiServices";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const router = useRouter();
const { isLoggedIn } = useAuth();

const cartItems = ref([]);
const cartTotal = ref(0);
const totalCount = ref(0);
const isLoading = ref(false);
const showLoginModal = ref(false);

// Fungsi untuk mengambil data keranjang dari API /cart
const fetchCart = async () => {
  isLoading.value = true;
  try {
    const response = await cartService.getCart();
    const resData = response?.data?.data || response?.data || {};

    cartItems.value = resData.cart || [];
    cartTotal.value = resData.calculation?.sub_total || 0;
    totalCount.value = resData.calculation?.total_cart || cartItems.value.reduce((acc, item) => acc + item.qty, 0);
  } catch (err) {
    console.error("Gagal memuat keranjang:", err);
  } finally {
    isLoading.value = false;
  }
};

// Ambil data keranjang setiap kali drawer dibuka
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    fetchCart();
  }
});

const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number || 0);
};

// Handler Update Quantity via API (Menyesuaikan cartService.updateCartItem)
const handleUpdateQuantity = async (cartItemId, newQuantity, variantId, productId) => {
  if (newQuantity < 1) return;
  try {
    // Sesuaikan parameter payload update berdasarkan cartService: updateCartItem(cartItemId, payload)
    await cartService.updateCartItem(cartItemId, {
      qty: newQuantity,
    });
    await fetchCart();
  } catch (err) {
    console.error("Gagal memperbarui kuantitas:", err);
  }
};

// Handler Remove Item via API (Menyesuaikan cartService.removeCartItem)
const handleRemoveItem = async (cartItemId) => {
  try {
    // Menggunakan parameter cartItemId sesuai cartService.removeCartItem(cartItemId)
    await cartService.removeCartItem(cartItemId);
    await fetchCart();
  } catch (err) {
    console.error("Gagal menghapus item:", err);
  }
};

const handleCheckout = () => {
  if (!isLoggedIn.value) {
    showLoginModal.value = true;
    return;
  }

  emit("close");
  router.push("/checkout");
};

const goToLogin = () => {
  showLoginModal.value = false;
  emit("close");
  router.push("/login?redirect=/checkout");
};
</script>

<template>
  <!-- OVERLAY / BACKDROP DRAWER -->
  <Transition name="fade">
    <div v-if="isOpen" @click="$emit('close')"
      class="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"></div>
  </Transition>

  <!-- DRAWER PANEL SLIDE FROM RIGHT -->
  <Transition name="slide">
    <div v-if="isOpen" class="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50 font-sans">
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
        <!-- 1. DRAWER HEADER -->
        <div class="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <h2 class="text-lg sm:text-xl font-extrabold text-gray-900">
              Keranjang Belanja
            </h2>
            <span v-if="totalCount > 0"
              class="bg-[#E25C38] text-white text-xs sm:text-sm px-2.5 py-0.5 rounded-full font-bold">
              {{ totalCount }}
            </span>
          </div>

          <button @click="$emit('close')" aria-label="Tutup Keranjang"
            class="text-gray-400 hover:text-black p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 2. DRAWER BODY (LIST PRODUK) -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 divide-y divide-gray-100 relative">
          <!-- Loading State -->
          <div v-if="isLoading" class="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span class="text-sm text-gray-500 animate-pulse font-medium">Memuat keranjang...</span>
          </div>

          <div v-if="cartItems.length > 0" class="space-y-5">
            <div v-for="item in cartItems" :key="item.variant_id" class="flex gap-4 pt-4 first:pt-0">
              <!-- Gambar Produk -->
              <img :src="item.image || 'https://via.placeholder.com/400'" :alt="item.product_name"
                class="w-20 h-20 object-cover rounded-xl bg-gray-50 flex-shrink-0" />

              <div class="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <!-- Nama Produk -->
                  <h3 class="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {{ item.product_name }}
                  </h3>
                  <!-- Varian Nama -->
                  <p v-if="item.variant_name" class="text-xs text-gray-500 font-medium mt-0.5">
                    Varian: {{ item.variant_name }}
                  </p>
                  <!-- Format Harga Produk Rupiah -->
                  <p class="text-sm sm:text-base font-extrabold text-[#E25C38] mt-0.5">
                    {{ formatRupiah(item.purchase_price) }}
                  </p>
                </div>

                <div class="flex items-center justify-between mt-3 gap-2">
                  <!-- Kontrol Quantity -->
                  <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50 flex-shrink-0">
                    <button
                      @click="handleUpdateQuantity(item.variant_id, item.qty - 1, item.variant_id, item.product_id)"
                      :disabled="item.qty <= 1"
                      class="px-2.5 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent rounded-l-lg transition-colors">
                      -
                    </button>
                    <span class="px-3 text-sm font-bold text-gray-800">
                      {{ item.qty }}
                    </span>
                    <button
                      @click="handleUpdateQuantity(item.variant_id, item.qty + 1, item.variant_id, item.product_id)"
                      class="px-2.5 py-1 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors">
                      +
                    </button>
                  </div>

                  <!-- Tombol Hapus dengan penanganan z-index & pointer-events yang aman -->
                  <button @click="handleRemoveItem(item.variant_id)" type="button"
                    class="text-gray-400 hover:text-red-500 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative z-10 px-2 py-1">
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tampilan Keranjang Kosong -->
          <div v-else-if="!isLoading" class="h-full flex flex-col items-center justify-center text-center py-12 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-sm sm:text-base font-bold text-gray-800">
              Keranjang masih kosong
            </p>
            <p class="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
              Pilih produk favoritmu dulu yuk!
            </p>
            <button @click="$emit('close'); router.push('/products')"
              class="bg-[#E25C38] hover:bg-[#c94d2c] text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm">
              Cari Produk
            </button>
          </div>
        </div>

        <!-- 3. DRAWER FOOTER -->
        <div class="p-5 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
          <div class="flex justify-between items-center">
            <span class="font-medium text-gray-600 text-sm sm:text-base">Subtotal</span>
            <span class="font-extrabold text-[#E25C38] text-lg sm:text-xl">
              {{ formatRupiah(cartTotal) }}
            </span>
          </div>

          <button @click="handleCheckout" :disabled="cartItems.length === 0"
            class="w-full bg-[#E25C38] hover:bg-[#c94d2c] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm sm:text-base py-3.5 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2">
            <span>Lanjut ke Checkout</span>
            <span class="text-lg">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- POP-UP MODAL LOGIN REQUIREMENT -->
  <Transition name="fade">
    <div v-if="showLoginModal"
      class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100">
        <div class="w-14 h-14 bg-orange-100 text-[#E25C38] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 class="text-lg font-bold text-gray-900 mb-2">Login Diperlukan</h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan proses
          transaksi checkout.
        </p>

        <div class="flex flex-col gap-2.5">
          <button @click="goToLogin"
            class="w-full bg-[#E25C38] hover:bg-[#c94d2c] text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors">
            Masuk Sekarang
          </button>
          <button @click="showLoginModal = false"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 px-4 rounded-xl transition-colors">
            Batal
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>