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
</script>
<template>
  <div
    class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-1 h-full"
  >
    <div class="flex flex-col flex-1 justify-between">
      <div>
        <!-- Product Image -->
        <div
          class="relative aspect-square overflow-hidden bg-gray-50 rounded-xl mb-3"
        >
          <img
            :src="
              product.featured_image ||
              'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400'
            "
            :alt="product.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <!-- <span
            v-if="product.is_freeshiping === 'ACTIVE'"
            class="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md"
          >
            Bebas Ongkir
          </span> -->
        </div>

        <!-- Product Info -->
        <div>
          <span
            class="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5"
          >
            {{
              typeof product.category === "object"
                ? product.category?.taxonomy_name
                : product.category || "SPIRITS"
            }}
          </span>
          <h3
            class="text-xs font-bold text-gray-900 line-clamp-2 h-8 group-hover:text-[#E25C38] transition-colors leading-snug"
          >
            {{ product.name }}
          </h3>
        </div>
      </div>

      <p class="text-xs font-extrabold text-[#E25C38] mt-2">
        Rp {{ product.price ? product.price.toLocaleString("id-ID") : 0 }}
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1.5 pt-1 border-t border-gray-50">
      <router-link
        :to="`/product/${product.slug || product.id}`"
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

      <button
        @click="handleAddToCart"
        class="p-1.5 rounded-lg bg-[#1C1A17] text-white hover:bg-black transition-colors flex items-center justify-center flex-1"
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