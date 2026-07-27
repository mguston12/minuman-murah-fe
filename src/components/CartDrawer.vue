<script setup>
import { useCartStore } from "../stores/cart";
import { useRouter } from "vue-router";

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);
const cartStore = useCartStore();
const router = useRouter();

const handleCheckout = () => {
  emit("close"); // Tutup drawer
  router.push("/checkout"); // Pindah ke halaman Checkout
};
</script>

<template>
  <!-- OVERLAY / BACKDROP -->
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
      <div class="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
        
        <!-- 1. DRAWER HEADER -->
        <div class="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
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

          <!-- Tombol Close (X) -->
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-black p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
              <!-- Gambar -->
              <img
                :src="item.image"
                :alt="item.title"
                class="w-16 h-16 object-cover rounded-xl bg-gray-50 flex-shrink-0"
              />

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-gray-900 truncate">
                  {{ item.title }}
                </h3>
                <p class="text-xs font-extrabold text-[#E25C38] mt-0.5">
                  Rp {{ item.price ? item.price.toLocaleString("id-ID") : 0 }}
                </p>

                <!-- Qty Control -->
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex items-center border border-gray-200 rounded-md bg-gray-50">
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span class="px-2 text-xs font-bold text-gray-800">
                      {{ item.quantity }}
                    </span>
                    <button
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
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

          <!-- Empty State -->
          <div v-else class="h-full flex flex-col items-center justify-center text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-xs font-bold text-gray-700">Keranjang masih kosong</p>
            <p class="text-[11px] text-gray-400 mt-0.5">Pilih produk favoritmu dulu yuk!</p>
          </div>
        </div>

        <!-- 3. DRAWER FOOTER (SUBTOTAL & BUTTON CHECKOUT) -->
        <div class="p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 space-y-3">
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
</template>

<style scoped>
/* Animasi Fade Backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animasi Slide Drawer dari Kanan */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>