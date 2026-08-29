<script setup>
import { ref } from "vue";
import { useCartStore } from "../stores/cart";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const cartStore = useCartStore();
const router = useRouter();
const { isLoggedIn } = useAuth();

// State untuk mengontrol pop-up modal peringatan login
const showLoginModal = ref(false);

const handleCheckout = () => {
  // Pengecekan status login
  if (!isLoggedIn.value) {
    showLoginModal.value = true;
    return;
  }

  // Jika sudah login, tutup drawer dan buka halaman checkout
  emit("close");
  router.push("/checkout");
};

// Fungsi mengarahkan ke page login dengan menyimpan route redirect
const goToLogin = () => {
  showLoginModal.value = false;
  emit("close");
  router.push("/login?redirect=/checkout");
};
</script>

<template>
  <!-- OVERLAY / BACKDROP DRAWER -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 bg-black/50 z-50 transition-opacity backdrop-blur-sm"
    ></div>
  </Transition>

  <!-- DRAWER PANEL SLIDE FROM RIGHT -->
  <Transition name="slide">
    <div
      v-if="isOpen"
      class="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50 font-sans"
    >
      <div
        class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
      >
        <!-- 1. DRAWER HEADER -->
        <div
          class="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <h2 class="text-base font-extrabold text-gray-900">
              Keranjang Belanja
            </h2>
            <span
              v-if="cartStore.totalCount > 0"
              class="bg-[#E25C38] text-white text-xs px-2 py-0.5 rounded-full font-bold"
            >
              {{ cartStore.totalCount }}
            </span>
          </div>

          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- 2. DRAWER BODY (LIST PRODUK) -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-gray-100">
          <div v-if="cartStore.items.length > 0" class="space-y-4">
            <div
              v-for="item in cartStore.items"
              :key="item.id"
              class="flex gap-3 pt-3 first:pt-0"
            >
              <img
                :src="
                  item.featured_image?.path ||
                  item.image ||
                  'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400'
                "
                :alt="item.name || item.title"
                class="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0"
              />

              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-gray-900 truncate">
                  {{ item.title }}
                </h3>
                <p class="text-xs font-extrabold text-[#E25C38] mt-0.5">
                  Rp {{ item.price ? item.price.toLocaleString("id-ID") : 0 }}
                </p>

                <div class="flex items-center gap-2 mt-2">
                  <div
                    class="flex items-center border border-gray-200 rounded-md bg-gray-50"
                  >
                    <button
                      @click="
                        cartStore.updateQuantity(item.id, item.quantity - 1)
                      "
                      class="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span class="px-2 text-xs font-bold text-gray-800">
                      {{ item.quantity }}
                    </span>
                    <button
                      @click="
                        cartStore.updateQuantity(item.id, item.quantity + 1)
                      "
                      class="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>

                  <button
                    @click="cartStore.removeFromCart(item.id)"
                    class="text-gray-400 hover:text-red-500 text-[11px] font-semibold transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="h-full flex flex-col items-center justify-center text-center py-12"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p class="text-xs font-bold text-gray-700">
              Keranjang masih kosong
            </p>
            <p class="text-[11px] text-gray-400 mt-0.5">
              Pilih produk favoritmu dulu yuk!
            </p>
          </div>
        </div>

        <!-- 3. DRAWER FOOTER -->
        <div
          class="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-3"
        >
          <div class="flex justify-between items-center text-xs sm:text-sm">
            <span class="font-medium text-gray-500">Subtotal</span>
            <span class="font-extrabold text-[#E25C38] text-sm sm:text-base">
              Rp {{ cartStore.totalPrice.toLocaleString("id-ID") }}
            </span>
          </div>

          <button
            @click="handleCheckout"
            :disabled="cartStore.items.length === 0"
            class="w-full bg-[#E25C38] hover:bg-[#c94d2c] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Lanjut ke Checkout</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- POP-UP MODAL LOGIN REQUIREMENT -->
  <Transition name="fade">
    <div
      v-if="showLoginModal"
      class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100"
      >
        <!-- Icon Kunci/User -->
        <div
          class="w-12 h-12 bg-orange-100 text-[#E25C38] rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3 class="text-base font-bold text-gray-900 mb-1">Login Diperlukan</h3>
        <p class="text-xs text-gray-500 mb-6">
          Silakan masuk ke akun Anda terlebih dahulu untuk melanjutkan proses
          transaksi checkout.
        </p>

        <!-- Tombol Aksi -->
        <div class="flex flex-col gap-2">
          <button
            @click="goToLogin"
            class="w-full bg-[#E25C38] hover:bg-[#c94d2c] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
          >
            Masuk Sekarang
          </button>
          <button
            @click="showLoginModal = false"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
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
