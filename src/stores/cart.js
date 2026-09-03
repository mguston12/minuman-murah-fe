import { ref, computed } from "vue";
import { defineStore } from "pinia";
import Cookies from "js-cookie";

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
      expires: 7,
      sameSite: "Lax",
    });
  };

  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    if (!product) return;

    console.log(product);

    const activeVariantId =
      selectedVariant?.id ||
      (Array.isArray(product.variants) && product.variants.length > 0
        ? product.variants[0].id
        : null);

    const imageUrl = product.featured_image?.path;
    product.images?.[0]?.path;

    const itemPrice = Number(
      selectedVariant?.price ||
        selectedVariant?.final_price ||
        product.final_price ||
        product.base_price ||
        product.price ||
        0,
    );

    const existingIndex = items.value.findIndex(
      (item) => item.id === product.id && item.variant_id === activeVariantId,
    );

    if (existingIndex > -1) {
      items.value[existingIndex].quantity += quantity;
    } else {
      items.value.push({
        id: product.id,
        variant_id: activeVariantId,
        variant_name:
          selectedVariant?.variant_name || selectedVariant?.name || "",
        title: product.name || product.title,
        price: itemPrice,
        image: imageUrl,
        category:
          product.categories?.[0]?.category_name || product.category || "",
        quantity: quantity,
      });
    }

    saveToCookies();
  };

  const removeFromCart = (productId, variantId = null) => {
    items.value = items.value.filter(
      (item) => !(item.id === productId && item.variant_id === variantId),
    );
    saveToCookies();
  };

  const updateQuantity = (productId, qty, variantId = null) => {
    const item = items.value.find(
      (i) => i.id === productId && i.variant_id === variantId,
    );
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
      (sum, item) => sum + Number(item.price) * item.quantity,
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
