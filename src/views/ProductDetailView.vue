<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { productService } from "../services/apiServices";
import { useCartStore } from "../stores/cart";
import { useWishlistStore } from "../stores/wishlist"; // <-- Import Wishlist Store
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore(); // <-- Inisialisasi Wishlist Store

const product = ref(null);
const loading = ref(true);
const error = ref(null);

const selectedVariant = ref(null);
const selectedStore = ref(null);
const selectedImage = ref("");
const quantity = ref(1);

const relatedProducts = ref([]);
const loadingRelated = ref(false);

// --- State Animasi Flying Cart ---
const isAnimating = ref(false);
const flyingStyle = ref({});

// --- Data Ulasan Pembeli ---
const reviews = ref([]);

// --- Helper Stok Bersih ---
const getAvailableQty = (storeRelation) => {
  if (!storeRelation) return 0;
  const available = (storeRelation.qty || 0) - (storeRelation.reserved_qty || 0);
  return available > 0 ? available : 0;
};

// --- Fetch Data Produk Utama ---
const fetchProductDetail = async () => {
  const slug = route.params.slug;
  if (!slug) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await productService.getProductBySlug(slug);
    const data = response.data;

    if (data?.success) {
      product.value = data.data.product;

      // 1. Set varian pertama jika ada
      if (product.value.variants && product.value.variants.length > 0) {
        const firstVariant = product.value.variants[0];
        selectedVariant.value = firstVariant;

        // Auto-select toko pertama yang stok bersihnya > 0
        if (firstVariant.stock_relations && firstVariant.stock_relations.length > 0) {
          const availableStore = firstVariant.stock_relations.find(
            (s) => getAvailableQty(s) > 0
          ) || firstVariant.stock_relations[0];
          selectedStore.value = availableStore;
        } else {
          selectedStore.value = null;
        }
      } else {
        selectedVariant.value = null;
        selectedStore.value = null;
      }

      // 2. Set Gambar Utama
      selectedImage.value =
        product.value.featured_image?.path ||
        product.value.images?.[0]?.path ||
        "";

      // 3. Ambil Ulasan (jika ada)
      reviews.value = product.value.reviews || [];

      fetchRelatedProducts();
    } else {
      error.value = "Gagal memuat detail produk.";
    }
  } catch (err) {
    console.error("Error fetching product detail:", err);
    error.value = err.response?.data?.message || "Terjadi kesalahan jaringan.";
  } finally {
    loading.value = false;
  }
};

// Auto-select toko pertama yang ada stok bersih saat ganti varian & reset quantity
watch(
  selectedVariant,
  (newVariant) => {
    if (newVariant?.stock_relations && newVariant.stock_relations.length > 0) {
      const availableStore = newVariant.stock_relations.find(
        (s) => getAvailableQty(s) > 0
      ) || newVariant.stock_relations[0];
      selectedStore.value = availableStore;
    } else {
      selectedStore.value = null;
    }
    quantity.value = 1;
  }
);

// --- Fetch Related Products ---
const fetchRelatedProducts = async () => {
  loadingRelated.value = true;
  try {
    const response = await productService.getProducts();
    const data = response.data;

    if (data?.success) {
      const items = data.data.products?.data || data.data.products || [];
      relatedProducts.value = items
        .filter((item) => item.slug !== route.params.slug)
        .slice(0, 4);
    }
  } catch (err) {
    console.error("Error fetching related products:", err);
  } finally {
    loadingRelated.value = false;
  }
};

onMounted(() => {
  fetchProductDetail();
});

watch(
  () => route.params.slug,
  () => {
    quantity.value = 1;
    fetchProductDetail();
  }
);

// --- Handlers ---
const selectVariant = (variant) => {
  selectedVariant.value = variant;
  if (variant.image_path) {
    selectedImage.value = variant.image_path;
  }
};

const incrementQty = () => {
  if (quantity.value < maxStock.value) {
    quantity.value++;
  }
};

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--;
};

// --- Wishlist Handler ---
const isInWishlist = computed(() => {
  if (!product.value) return false;
  // Menyesuaikan dengan struktur method store wishlist Anda (misal hasItem atau cek id)
  if (typeof wishlistStore.hasItem === "function") {
    return wishlistStore.hasItem(product.value.id);
  }
  return wishlistStore.items?.some((item) => item.id === product.value.id);
});

const toggleWishlist = () => {
  if (!product.value) return;
  if (typeof wishlistStore.toggleWishlist === "function") {
    wishlistStore.toggleWishlist(product.value);
  } else if (isInWishlist.value) {
    wishlistStore.removeItem(product.value.id);
  } else {
    wishlistStore.addItem(product.value);
  }
};

// --- Cart Handlers & Flying Animation ---
const handleAddToCart = (event) => {
  if (!product.value || isAnimating.value || maxStock.value <= 0) return;

  const buttonRect = event.currentTarget.getBoundingClientRect();
  const cartIcon = document.getElementById("cart-icon");

  cartStore.addToCart(
    product.value,
    quantity.value,
    selectedVariant.value,
    selectedStore.value
  );

  if (cartIcon) {
    const cartRect = cartIcon.getBoundingClientRect();

    flyingStyle.value = {
      top: `${buttonRect.top + buttonRect.height / 2 - 16}px`,
      left: `${buttonRect.left + buttonRect.width / 2 - 16}px`,
      opacity: 1,
      transform: "scale(1)",
    };

    isAnimating.value = true;

    requestAnimationFrame(() => {
      flyingStyle.value = {
        top: `${cartRect.top + cartRect.height / 2 - 12}px`,
        left: `${cartRect.left + cartRect.width / 2 - 12}px`,
        opacity: 0.2,
        transform: "scale(0.3)",
        transition: "all 0.65s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
      };
    });

    setTimeout(() => {
      isAnimating.value = false;
      cartIcon.classList.add("animate-bounce-cart");
      setTimeout(() => cartIcon.classList.remove("animate-bounce-cart"), 400);
    }, 650);
  }
};

const handleBuyNow = () => {
  if (!product.value || maxStock.value <= 0) return;

  cartStore.addToCart(
    product.value,
    quantity.value,
    selectedVariant.value,
    selectedStore.value
  );

  router.push("/checkout");
};

// --- Computed Properties ---
const activePrice = computed(() => {
  if (!product.value) return 0;
  const rawPrice = selectedVariant.value
    ? selectedVariant.value.price || selectedVariant.value.final_price
    : product.value.base_price || product.value.final_price;
  return parseFloat(rawPrice || 0);
});

const activeStrikePrice = computed(() => {
  if (!product.value) return null;
  const rawPrice = selectedVariant.value
    ? selectedVariant.value.strike_price
    : product.value.base_strike_price;
  return rawPrice ? parseFloat(rawPrice) : null;
});

const activeCategoryName = computed(() => {
  return product.value?.categories?.[0]?.category_name || "PRODUK";
});

// Hitung max stock berdasarkan stok bersih toko terpilih
const maxStock = computed(() => {
  if (selectedStore.value) {
    return getAvailableQty(selectedStore.value);
  }
  if (selectedVariant.value && selectedVariant.value.stock > 0) {
    return selectedVariant.value.stock;
  }
  return product.value?.total_stock || 0;
});

// --- Review Computations ---
const ratingCounts = computed(() => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.value.forEach((r) => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });
  return counts;
});

const getRatingPercentage = (star) => {
  const total = reviews.value.length;
  if (!total) return 0;
  return Math.round((ratingCounts.value[star] / total) * 100);
};

const selectedFilter = ref("Semua");
const filterOptions = [
  "Semua",
  "5 Bintang",
  "4 Bintang",
  "3 Bintang",
  "2 Bintang",
  "1 Bintang",
];

const filteredReviews = computed(() => {
  if (selectedFilter.value === "Semua") return reviews.value;
  const targetRating = parseInt(selectedFilter.value.charAt(0));
  return reviews.value.filter((r) => r.rating === targetRating);
});
</script>

<template>
  <div class="w-full bg-[#FAF6F0] min-h-screen py-6 text-gray-800 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Loading State -->
      <div v-if="loading" class="py-20 text-center space-y-4">
        <div class="inline-block w-8 h-8 border-4 border-[#E25C38] border-t-transparent rounded-full animate-spin">
        </div>
        <p class="text-sm text-gray-500 font-medium">Memuat detail produk...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3">
        <p class="font-bold text-base">{{ error }}</p>
        <button @click="fetchProductDetail"
          class="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors">
          Coba Lagi
        </button>
      </div>

      <!-- Main Content -->
      <template v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="text-xs text-gray-500 flex items-center gap-2">
          <router-link to="/" class="hover:text-black">Beranda</router-link>
          <span>&rsaquo;</span>
          <span class="hover:text-black cursor-pointer">{{ activeCategoryName }}</span>
          <span>&rsaquo;</span>
          <span class="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">
            {{ product.name }}
          </span>
        </nav>

        <!-- SECTION 1: Product Details Section -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Image Gallery -->
          <div class="flex gap-3 items-start">
            <!-- Side Thumbnails -->
            <div v-if="product.images && product.images.length > 0"
              class="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1 no-scrollbar w-16 sm:w-20 shrink-0">
              <button v-for="img in product.images" :key="img.id" @click="selectedImage = img.path" :class="[
                'w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all shrink-0',
                selectedImage === img.path ? 'border-[#E25C38]' : 'border-transparent opacity-70 hover:opacity-100'
              ]">
                <img :src="img.path" :alt="product.name" class="w-full h-full object-cover" />
              </button>
            </div>

            <!-- Main Image -->
            <div
              class="relative flex-1 bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-[3/4] max-h-[480px]">
              <img :src="selectedImage || product.featured_image?.path || 'https://placehold.co/600x800?text=No+Image'"
                :alt="product.name" class="w-full h-full object-cover transition-all duration-300" />
              <div
                class="absolute bottom-3 right-3 bg-white/80 backdrop-blur border border-gray-300 px-2 py-0.5 rounded-md text-xs font-bold text-gray-800">
                21+
              </div>
            </div>
          </div>

          <!-- Product Info & Actions -->
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <span class="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  {{ activeCategoryName }}
                </span>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-0.5">
                  {{ product.name }}
                </h1>
              </div>

              <!-- Wishlist Toggle Button -->
            <button @click="toggleWishlist" type="button" :class="[
    'px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2',
    isInWishlist
      ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
      : 'bg-white border-gray-200 text-gray-700 hover:text-rose-500 hover:border-rose-200'
  ]" :title="isInWishlist ? 'Remove From Wishlist' : 'Add To Wishlist'">
  <svg class="w-4 h-4 shrink-0" :fill="isInWishlist ? 'currentColor' : 'none'" stroke="currentColor"
    viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
  <span>{{ isInWishlist ? 'Remove From Wishlist' : 'Add To Wishlist' }}</span>
</button>
            </div>

            <div class="flex items-center gap-2 mt-1.5 text-xs">
              <div class="flex text-xs gap-0.5">
                <span v-for="i in 5" :key="i"
                  :class="i <= Math.round(product.average_rating || 0) ? 'text-amber-400' : 'text-gray-300'">★</span>
              </div>
              <span class="font-bold text-gray-700">{{ product.average_rating || "0" }}</span>
              <span class="text-gray-300">&bull;</span>
              <span class="text-gray-400">{{ reviews.length }} ulasan</span>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-2.5 pt-1">
              <span class="text-2xl sm:text-3xl font-extrabold text-[#E25C38]">
                Rp {{ activePrice.toLocaleString("id-ID") }}
              </span>
              <span v-if="activeStrikePrice" class="text-xs sm:text-sm text-gray-400 line-through">
                Rp {{ activeStrikePrice.toLocaleString("id-ID") }}
              </span>
            </div>

            <!-- Variants -->
            <div v-if="product.variants && product.variants.length > 0" class="space-y-1.5 pt-1">
              <label class="text-[11px] font-semibold text-gray-600 block">Pilih Ukuran</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="variant in product.variants" :key="variant.id" @click="selectVariant(variant)" :class="[
                  'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                  selectedVariant?.id === variant.id ? 'bg-[#E25C38] text-white border-[#E25C38]' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                ]">
                  {{ variant.variant_name }}
                </button>
              </div>
            </div>

            <!-- Store Selection (Lokasi Toko) -->
            <div v-if="selectedVariant?.stock_relations?.length" class="space-y-1.5 pt-1">
              <label class="text-[11px] font-semibold text-gray-600 block">Pilih Lokasi Toko</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="item in selectedVariant.stock_relations" :key="item.id" type="button"
                  @click="selectedStore = item" :disabled="getAvailableQty(item) <= 0" :class="[
                    'px-3.5 py-1.5 rounded-lg text-xs transition-all border flex items-center gap-1.5',
                    selectedStore?.id === item.id
                      ? 'border-[#E25C38] bg-[#E25C38]/10 text-[#E25C38] font-semibold'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
                    getAvailableQty(item) <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
                  ]">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{{ item.store?.name }}</span>
                  <span class="text-[10px] text-gray-400">({{ getAvailableQty(item) }} stok)</span>
                </button>
              </div>
            </div>

            <!-- Quantity Counter -->
            <div class="space-y-1.5 pt-1">
              <label class="text-[11px] font-semibold text-gray-600 block">Jumlah</label>
              <div class="inline-flex items-center border border-gray-200 bg-white rounded-lg p-1">
                <button @click="decrementQty"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black text-sm font-bold">
                  -
                </button>
                <span class="w-8 text-center text-xs font-bold text-gray-800">
                  {{ quantity }}
                </span>
                <button @click="incrementQty" :disabled="quantity >= maxStock" :class="[
                  'w-7 h-7 flex items-center justify-center font-bold text-sm',
                  quantity >= maxStock ? 'text-gray-300 cursor-not-allowed' : 'text-[#E25C38]'
                ]">
                  +
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button @click="handleAddToCart($event)" :disabled="maxStock <= 0"
                class="py-2.5 px-4 border border-gray-800 rounded-xl font-bold text-xs text-gray-900 bg-white hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                + Keranjang
              </button>
              <button @click="handleBuyNow" :disabled="maxStock <= 0"
                class="py-2.5 px-4 bg-[#14120E] hover:bg-black text-[#D4B26F] rounded-xl font-bold text-xs transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                Beli Sekarang
              </button>
            </div>

            <!-- Stock Status -->
            <p class="text-[11px] font-medium flex items-center gap-1.5 pt-1"
              :class="maxStock > 0 ? 'text-emerald-600' : 'text-rose-600'">
              <span class="w-1.5 h-1.5 rounded-full inline-block"
                :class="maxStock > 0 ? 'bg-emerald-500' : 'bg-rose-500'"></span>
              <span v-if="maxStock > 0">
                Stok tersedia (Sisa {{ maxStock }} di toko {{ selectedStore?.store?.name }}) &bull; Estimasi tiba hari
                ini
              </span>
              <span v-else>Stok habis</span>
            </p>

            <!-- Product Description -->
            <p class="text-[11px] text-gray-500 leading-relaxed pt-1">
              {{ product.product_information }}
            </p>
          </div>
        </section>

        <!-- SECTION 2: Reviews Section -->
        <section class="space-y-6 pt-6">
          <h2 class="text-lg font-bold text-gray-900">Ulasan Pembeli</h2>

          <div
            class="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div class="text-center md:text-left space-y-1 md:pr-8 md:border-r border-gray-100">
              <div class="text-4xl font-extrabold text-[#E25C38]">
                {{ product.average_rating || "0" }}
              </div>
              <p class="text-[11px] text-gray-400">dari 5.0</p>
              <div class="flex justify-center md:justify-start text-amber-400 text-sm">
                <span v-for="i in 5" :key="i">
                  {{ i <= Math.round(product.average_rating || 0) ? '★' : '☆' }} </span>
              </div>
              <p class="text-[10px] text-gray-400 mt-1">
                {{ reviews.length }} ulasan
              </p>
            </div>

            <div class="flex-1 w-full space-y-2 text-xs">
              <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-3">
                <span class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap">
                  {{ star }} <span class="text-amber-400">★</span>
                </span>
                <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-[#E25C38] h-full rounded-full transition-all duration-300"
                    :style="{ width: `${getRatingPercentage(star)}%` }"></div>
                </div>
                <span class="w-6 text-right text-gray-400 text-[11px]">
                  {{ ratingCounts[star] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Review Filters -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button v-for="filter in filterOptions" :key="filter" @click="selectedFilter = filter" :class="[
              'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
              selectedFilter === filter
                ? 'bg-[#E25C38] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            ]">
              {{ filter }}
            </button>
          </div>

          <!-- Review List -->
          <div class="space-y-4">
            <div v-if="filteredReviews.length === 0" class="bg-white rounded-xl p-8 text-center text-gray-400 text-xs">
              Belum ada ulasan untuk kategori filter ini.
            </div>
            <div v-for="review in filteredReviews" :key="review.id"
              class="bg-white rounded-xl p-4 border border-gray-100 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-gray-800">{{ review.user_name || 'Pembeli' }}</span>
                <span class="text-[10px] text-gray-400">{{ review.created_at }}</span>
              </div>
              <div class="flex text-amber-400 text-xs">
                <span v-for="i in 5" :key="i">{{ i <= review.rating ? '★' : '☆' }}</span>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed">{{ review.comment }}</p>
            </div>
          </div>
        </section>

        <!-- SECTION 3: Related Products -->
        <section v-if="relatedProducts.length > 0" class="space-y-4 pt-6">
          <h2 class="text-lg font-bold text-gray-900">Produk Serupa</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <ProductCard v-for="item in relatedProducts" :key="item.id" :product="item" />
          </div>
        </section>
      </template>
    </div>

    <!-- Flying Badge Element untuk Animasi -->
    <div v-if="isAnimating" :style="flyingStyle"
      class="fixed w-8 h-8 bg-[#E25C38] text-white rounded-full flex items-center justify-center font-bold text-xs pointer-events-none z-50 shadow-lg">
      +{{ quantity }}
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>