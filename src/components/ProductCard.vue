<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

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
  <router-link
    :to="`/product/${product.slug || product.id}`"
    class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between p-2 h-full cursor-pointer"
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

          <!-- Container Badge / Flag -->
          <div class="absolute top-2 left-2 flex flex-col gap-1 items-start">
            <!-- Badge Low Stock (< 3) -->
            <span
              v-if="product.total_stock > 0 && product.total_stock <= 3"
              class="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider"
            >
              Low Stock
            </span>

            <!-- Badge Out of Stock (0) -->
            <span
              v-else-if="product.total_stock <= 0"
              class="bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider"
            >
              Out of Stock
            </span>

            <!-- Badge Diskon -->
            <span
              v-if="product.discount_percent || product.base_discount_percent"
              class="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm"
            >
              -{{
                Math.round(
                  product.discount_percent || product.base_discount_percent,
                )
              }}%
            </span>
          </div>
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
                : product.categories && product.categories.length > 0
                  ? product.categories[0].category_name
                  : product.category || "SPIRITS"
            }}
          </span>
          <!-- Title -->
          <h3
            class="text-sm sm:text-base text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-[#E25C38] transition-colors leading-snug font-medium"
          >
            {{ product.name }}
          </h3>
        </div>
      </div>

      <!-- Price Section -->
      <div class="mt-3 mb-1">
        <!-- Harga Coret (Strike Price) -->
        <span
          v-if="
            product.base_strike_price &&
            Number(product.base_strike_price) > Number(product.price)
          "
          class="text-xs sm:text-sm text-gray-400 line-through block leading-tight"
        >
          {{ formatRupiah(product.base_strike_price) }}
        </span>

        <!-- Harga Final (Discount Price) -->
        <p
          class="text-base sm:text-lg font-extrabold text-[#E25C38] leading-tight"
        >
          {{ formatRupiah(product.price) }}
        </p>
      </div>
      <!-- Rating Section -->
      <div class="flex items-center gap-1 mt-1">
        <div class="flex items-center">
          <svg
            v-for="star in 5"
            :key="star"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            :fill="
              star <= Math.round(product.average_rating || 0)
                ? '#FBBF24'
                : '#E5E7EB'
            "
            class="w-3.5 h-3.5 sm:w-4 sm:h-4"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.176 0l-3.367 2.446c-.783.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.958z"
            />
          </svg>
        </div>
        <span class="text-[10px] sm:text-xs text-gray-500">
          {{
            product.average_rating ? product.average_rating.toFixed(1) : "0.0"
          }}
          <span v-if="product.review_count">({{ product.review_count }})</span>
        </span>
      </div>
    </div>
  </router-link>
</template>
