import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", () => {
  const items = ref(JSON.parse(localStorage.getItem("cart_items") || "[]"));

  const saveToLocalStorage = () => {
    localStorage.setItem("cart_items", JSON.stringify(items.value));
  };

  const addToCart = (product, quantity = 1) => {
    const existingIndex = items.value.findIndex(
      (item) => item.id === product.id,
    );

    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity;
    } else {
      items.value.push({
        id: product.id,
        title: product.title || product.name,
        price: product.price,
        image: product.image,
        category: product.category || "",
        quantity: quantity,
      });
    }

    saveToLocalStorage();
  };

  const removeFromCart = (productId) => {
    items.value = items.value.filter((item) => item.id !== productId);
    saveToLocalStorage();
  };

  const updateQuantity = (productId, qty) => {
    const item = items.value.find((i) => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, qty);
      saveToLocalStorage();
    }
  };

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  });

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    totalCount,
    totalPrice,
  };
});
