<script setup>
import { useCartStore } from "../stores/cart"; // Sesuaikan path relatif ke cart store kamu

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(["quick-view"]);

// Inisialisasi Cart Store
const cartStore = useCartStore();

const handleAddToCart = () => {
  cartStore.addToCart(props.product);
};
</script>

<template>
  <div
    class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
  >
    <div>
      <!-- Product Image -->
      <div class="relative aspect-square overflow-hidden bg-gray-50">
        <img
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <!-- Product Info -->
      <div class="p-3">
        <span
          class="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5"
        >
          {{ product.category }}
        </span>
        <h3
          class="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-[#E25C38] transition-colors"
        >
          {{ product.name }}
        </h3>
        <p class="text-xs font-bold text-[#E25C38] mt-1">
          Rp {{ product.price ? product.price.toLocaleString("id-ID") : 0 }}
        </p>
      </div>
    </div>

    <!-- Actions (Quick View & Add to Cart) -->
    <div
      class="pb-3 px-3 flex items-center gap-1.5 border-t border-gray-50 pt-2"
    >
      <router-link
        :to="`/product/${product.id}`"
        class="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
        title="Lihat Detail"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </router-link>

      <!-- TOMBOL DENGAN HANDLER LANGSUNG KE STORE -->
      <button
        @click="handleAddToCart"
        class="p-1.5 rounded-lg bg-[#1C1A17] text-white hover:bg-black transition-colors flex items-center justify-center"
        title="Tambah ke Keranjang"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
