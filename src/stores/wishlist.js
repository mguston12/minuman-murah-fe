import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWishlistStore = defineStore("wishlist", () => {
  // Load data awal dari localStorage
  const items = ref(JSON.parse(localStorage.getItem("user_wishlist") || "[]"));

  // Simpan ke localStorage
  const saveToStorage = () => {
    localStorage.setItem("user_wishlist", JSON.stringify(items.value));
  };

  // Cek apakah produk sudah ada di wishlist berdasarkan ID
  const hasItem = (productId) => {
    return items.value.some((item) => item.id === productId);
  };

  // Tambah produk utuh ke wishlist
  const addItem = (product) => {
    if (!hasItem(product.id)) {
      items.value.push(product);
      saveToStorage();
    }
  };

  // Hapus produk dari wishlist
  const removeItem = (productId) => {
    items.value = items.value.filter((item) => item.id !== productId);
    saveToStorage();
  };

  // Toggle tambah/hapus
  const toggleWishlist = (product) => {
    if (hasItem(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const totalWishlist = computed(() => items.value.length);

  return {
    items,
    hasItem,
    addItem,
    removeItem,
    toggleWishlist,
    totalWishlist,
  };
});
