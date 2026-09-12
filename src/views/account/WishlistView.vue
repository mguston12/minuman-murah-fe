<template>
  <div>
    <h1 class="text-xl font-extrabold text-gray-900">Wishlist Saya</h1>

    <div
      v-if="wishlist.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4"
    >
      <div v-for="item in wishlist" :key="item.id" class="relative group">
        <button
          @click.prevent="handleRemoveWishlist(item.id)"
          class="absolute top-3 right-3 z-10 w-7 h-7 bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 rounded-full flex items-center justify-center text-xs shadow-md transition-colors"
          title="Hapus dari Wishlist"
        >
          ✕
        </button>

        <ProductCard :product="item" />
      </div>
    </div>

    <div
      v-else
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12 mt-4"
    >
      <p class="text-xs text-gray-500 font-medium">
        Belum ada produk favorit di wishlist.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useWishlistStore } from "../../stores/wishlist";
import ProductCard from "../../components/ProductCard.vue";

const wishlistStore = useWishlistStore();
const wishlist = computed(() => wishlistStore.items);

const handleRemoveWishlist = (id) => {
  wishlistStore.removeItem(id);
};
</script>
