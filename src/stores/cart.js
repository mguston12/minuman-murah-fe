import { ref, computed } from "vue";
import { defineStore } from "pinia";
import Cookies from "js-cookie";

// Helper fungsi untuk membaca data cart dari Cookie
const getInitialCart = () => {
  const savedCart = Cookies.get("cart_items");
  if (!savedCart) return [];
  try {
    return JSON.parse(savedCart);
  } catch (e) {
    return [];
  }
};

export const useCartStore = defineStore("cart", () => {
  const items = ref(getInitialCart());

  const saveToCookies = () => {
    Cookies.set("cart_items", JSON.stringify(items.value), {
      expires: 7, // Bertahan selama 7 hari
      sameSite: "Lax",
    });
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
        image: product.featured_image?.path || product.image,
        category: product.category || "",
        quantity: quantity,
      });
    }

    saveToCookies();
  };

  const removeFromCart = (productId) => {
    items.value = items.value.filter((item) => item.id !== productId);
    saveToCookies();
  };

  const updateQuantity = (productId, qty) => {
    const item = items.value.find((i) => i.id === productId);
    if (item) {
      item.quantity = Math.max(1, qty);
      saveToCookies();
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
