<script setup>
import { useCartStore } from "../stores/cart";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(["quick-view"]);

const cartStore = useCartStore();

const handleAddToCart = () => {
  cartStore.addToCart(props.product);
};

// Helper function untuk format rupiah
const formatRupiah = (number) => {
  if (!number) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};
</script>

<template>
  <div
    class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-2 h-full"
  >
    <div class="flex flex-col flex-1 justify-between">
      <div>
        <!-- Product Image -->
        <div
          class="relative aspect-square overflow-hidden bg-gray-50 rounded-xl mb-3"
        >
          <img
            :src="
              product.featured_image?.path ||
              'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400'
            "
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <!-- Product Info -->
        <div>
          <!-- Category -->
          <span
            class="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1"
          >
            {{
              typeof product.category === "object"
                ? product.category?.taxonomy_name
                : product.category || "SPIRITS"
            }}
          </span>
          <!-- Title -->
          <h3
            class="text-sm sm:text-base font text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-[#E25C38] transition-colors leading-snug"
          >
            {{ product.name }}
          </h3>
        </div>
      </div>

      <p class="text-base sm:text-lg font-extrabold text-[#E25C38] mt-3 mb-1">
        {{ formatRupiah(product.price) }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 pt-2 border-t border-gray-50">
      <router-link
        :to="`/product/${product.slug || product.id}`"
        class="p-2.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
        title="Lihat Detail"
      >
        <svg
          class="w-4 h-4"
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

      <button
        @click="handleAddToCart"
        class="p-2.5 rounded-lg bg-[#1C1A17] text-white hover:bg-black transition-colors flex items-center justify-center flex-1 gap-2 text-xs font-semibold"
        title="Tambah ke Keranjang"
      >
        <svg
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
