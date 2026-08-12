<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { productService } from "../services/apiServices";
import ProductCard from "../components/ProductCard.vue";

const route = useRoute();

const product = ref(null);
const loading = ref(true);
const error = ref(null);

const selectedVariant = ref(null);
const selectedImage = ref("");
const quantity = ref(1);

const relatedProducts = ref([]);
const loadingRelated = ref(false);

// --- Dummy Data Ulasan Pembeli ---
const dummyReviews = ref([
  {
    id: 1,
    name: "Budi Santoso",
    avatar: "https://i.pravatar.cc/100?img=11",
    date: "12 Mar 2026",
    rating: 5,
    comment:
      "Kualitas produk sangat bagus, pengiriman cepat dan respon penjual sangat ramah. Sangat direkomendasikan!",
  },
  {
    id: 2,
    name: "Siti Rahma",
    avatar: "https://i.pravatar.cc/100?img=5",
    date: "10 Mar 2026",
    rating: 5,
    comment:
      "Bahan sesuai dengan deskripsi, ukurannya pas banget. Bikin ketagihan belanja di sini.",
  },
  {
    id: 3,
    name: "Dian Pratama",
    avatar: "https://i.pravatar.cc/100?img=13",
    date: "05 Mar 2026",
    rating: 4,
    comment:
      "Barang oke, packing rapi pakai bubble wrap tebal. Cuma pengirimannya agak telat sehari dari kurir.",
  },
  {
    id: 4,
    name: "Eko Wijaya",
    avatar: "https://i.pravatar.cc/100?img=60",
    date: "01 Mar 2026",
    rating: 5,
    comment: "Mantap, worth it banget untuk harga segini. Presisi dan elegan.",
  },
  {
    id: 5,
    name: "Rina Kusuma",
    avatar: "https://i.pravatar.cc/100?img=32",
    date: "25 Feb 2026",
    rating: 3,
    comment:
      "Kualitas lumayan untuk harga segini, tapi warnanya sedikit beda dari foto produk.",
  },
]);

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

      if (product.value.variants && product.value.variants.length > 0) {
        selectedVariant.value = product.value.variants[0];
      }

      selectedImage.value =
        product.value.featured_image?.path ||
        product.value.images?.[0]?.path ||
        "";

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

// --- Fetch Related Products (/products) ---
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
  },
);

// --- Handlers ---
const selectVariant = (variant) => {
  selectedVariant.value = variant;
  if (variant.image_path) {
    selectedImage.value = variant.image_path;
  }
};

const incrementQty = () => quantity.value++;
const decrementQty = () => {
  if (quantity.value > 1) quantity.value--;
};

// --- Computed Properties ---
const activePrice = computed(() => {
  if (!product.value) return 0;
  const rawPrice = selectedVariant.value
    ? selectedVariant.value.final_price
    : product.value.final_price;
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

// --- Review Breakdown Computations (Menggunakan Dummy Data) ---
const ratingCounts = computed(() => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dummyReviews.value.forEach((r) => {
    if (counts[r.rating] !== undefined) counts[r.rating]++;
  });
  return counts;
});

const getRatingPercentage = (star) => {
  const total = dummyReviews.value.length;
  if (!total) return 0;
  return Math.round((ratingCounts.value[star] / total) * 100);
};

// --- Review Filter ---
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
  if (selectedFilter.value === "Semua") return dummyReviews.value;

  const targetRating = parseInt(selectedFilter.value.charAt(0));
  return dummyReviews.value.filter((r) => r.rating === targetRating);
});
</script>

<template>
  <div class="w-full bg-[#FAF6F0] min-h-screen py-6 text-gray-800 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Loading State -->
      <div v-if="loading" class="py-20 text-center space-y-4">
        <div
          class="inline-block w-8 h-8 border-4 border-[#E25C38] border-t-transparent rounded-full animate-spin"
        ></div>
        <p class="text-sm text-gray-500 font-medium">Memuat detail produk...</p>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-3"
      >
        <p class="font-bold text-base">{{ error }}</p>
        <button
          @click="fetchProductDetail"
          class="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Main Content -->
      <template v-else-if="product">
        <!-- Breadcrumb -->
        <nav class="text-xs text-gray-500 flex items-center gap-2">
          <router-link to="/" class="hover:text-black">Beranda</router-link>
          <span>&rsaquo;</span>
          <span class="hover:text-black cursor-pointer">{{
            activeCategoryName
          }}</span>
          <span>&rsaquo;</span>
          <span class="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">
            {{ product.name }}
          </span>
        </nav>

        <!-- SECTION 1: Product Details Section -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <!-- Image Gallery -->
          <div class="space-y-3">
            <div
              class="w-full max-h-[360px] aspect-[4/3] sm:aspect-[14/10] bg-gray-100 rounded-2xl overflow-hidden shadow-sm"
            >
              <img
                :src="
                  selectedImage ||
                  'https://via.placeholder.com/600x800?text=No+Image'
                "
                :alt="product.name"
                class="w-full h-full object-cover transition-all duration-300"
              />
            </div>

            <div
              v-if="product.images && product.images.length > 0"
              class="grid grid-cols-5 gap-3"
            >
              <button
                v-for="img in product.images"
                :key="img.id"
                @click="selectedImage = img.path"
                :class="[
                  'aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all',
                  selectedImage === img.path
                    ? 'border-[#E25C38]'
                    : 'border-transparent hover:opacity-80',
                ]"
              >
                <img :src="img.path" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- Product Info & Actions -->
          <div class="space-y-4">
            <div>
              <span
                class="text-[11px] font-bold tracking-widest text-gray-400 uppercase"
              >
                {{ activeCategoryName }}
              </span>
              <h1
                class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-0.5"
              >
                {{ product.name }}
              </h1>

              <div class="flex items-center gap-2 mt-1.5 text-xs">
                <div class="flex text-xs gap-0.5">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="
                      i <= Math.round(product.average_rating || 4.8)
                        ? 'text-amber-400'
                        : 'text-gray-300'
                    "
                    >★</span
                  >
                </div>
                <span class="font-bold text-gray-700">{{
                  product.average_rating || "4.8"
                }}</span>
                <span class="text-gray-300">&bull;</span>
                <span class="text-gray-400"
                  >{{ dummyReviews.length }} ulasan</span
                >
              </div>
            </div>

            <!-- Price -->
            <div class="flex items-baseline gap-2.5 pt-1">
              <span class="text-2xl sm:text-3xl font-extrabold text-[#E25C38]">
                Rp {{ activePrice.toLocaleString("id-ID") }}
              </span>
              <span
                v-if="activeStrikePrice"
                class="text-xs sm:text-sm text-gray-400 line-through"
              >
                Rp {{ activeStrikePrice.toLocaleString("id-ID") }}
              </span>
            </div>

            <!-- Variants -->
            <div
              v-if="product.variants && product.variants.length > 0"
              class="space-y-1.5 pt-1"
            >
              <label class="text-[11px] font-semibold text-gray-600 block"
                >Pilih Ukuran</label
              >
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  @click="selectVariant(variant)"
                  :class="[
                    'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                    selectedVariant?.id === variant.id
                      ? 'bg-[#E25C38] text-white border-[#E25C38]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
                  ]"
                >
                  {{ variant.variant_name }}
                </button>
              </div>
            </div>

            <!-- Quantity Counter -->
            <div class="space-y-1.5 pt-1">
              <label class="text-[11px] font-semibold text-gray-600 block"
                >Jumlah</label
              >
              <div
                class="inline-flex items-center border border-gray-200 bg-white rounded-lg p-1"
              >
                <button
                  @click="decrementQty"
                  class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black text-sm font-bold"
                >
                  -
                </button>
                <span class="w-8 text-center text-xs font-bold text-gray-800">
                  {{ quantity }}
                </span>
                <button
                  @click="incrementQty"
                  class="w-7 h-7 flex items-center justify-center text-[#E25C38] font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3 pt-2">
              <button
                class="py-2.5 px-4 border border-gray-800 rounded-xl font-bold text-xs text-gray-900 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                + Keranjang
              </button>
              <button
                class="py-2.5 px-4 bg-[#14120E] hover:bg-black text-[#D4B26F] rounded-xl font-bold text-xs transition-colors"
              >
                Beli Sekarang
              </button>
            </div>

            <!-- Stock Status -->
            <p
              class="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5 pt-1"
            >
              <span
                class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
              ></span>
              <span
                v-if="
                  selectedVariant
                    ? selectedVariant.is_available
                    : product.is_available
                "
              >
                Stok tersedia (Sisa
                {{
                  selectedVariant ? selectedVariant.stock : product.total_stock
                }}) &bull; Estimasi tiba hari ini
              </span>
              <span v-else class="text-rose-600">Stok habis</span>
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

          <!-- Summary Ratings Box -->
          <div
            class="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm flex flex-col md:flex-row items-center gap-8"
          >
            <div
              class="text-center md:text-left space-y-1 md:pr-8 md:border-r border-gray-100"
            >
              <div class="text-4xl font-extrabold text-[#E25C38]">
                {{ product.average_rating || "4.8" }}
              </div>
              <p class="text-[11px] text-gray-400">dari 5.0</p>
              <div
                class="flex justify-center md:justify-start text-amber-400 text-sm"
              >
                ★★★★★
              </div>
              <p class="text-xs text-gray-600 font-medium mt-1">
                98% pembeli merasa puas
              </p>
              <p class="text-[10px] text-gray-400">
                {{ dummyReviews.length }} ulasan
              </p>
            </div>

            <!-- Dynamic Rating Progress Bars -->
            <div class="flex-1 w-full space-y-2 text-xs">
              <div
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
                class="flex items-center gap-3"
              >
                <span
                  class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
                >
                  {{ star }} <span class="text-amber-400">★</span>
                </span>
                <div
                  class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden"
                >
                  <div
                    class="bg-[#E25C38] h-full rounded-full transition-all duration-300"
                    :style="{ width: `${getRatingPercentage(star)}%` }"
                  ></div>
                </div>
                <span class="w-6 text-right text-gray-400 text-[11px]">
                  {{ ratingCounts[star] }}
                </span>
              </div>
            </div>
          </div>

          <!-- Rating Filters -->
          <div
            class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
          >
            <button
              v-for="filter in filterOptions"
              :key="filter"
              @click="selectedFilter = filter"
              :class="[
                'px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                selectedFilter === filter
                  ? 'bg-[#E25C38] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60',
              ]"
            >
              {{ filter }}
            </button>
          </div>

          <!-- Review Items -->
          <div v-if="filteredReviews.length > 0" class="space-y-3">
            <div
              v-for="review in filteredReviews"
              :key="review.id"
              class="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm space-y-3"
            >
              <div class="flex items-center gap-3">
                <img
                  :src="review.avatar"
                  :alt="review.name"
                  class="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 class="text-xs font-bold text-gray-900">
                    {{ review.name }}
                  </h4>
                  <p class="text-[10px] text-gray-400">
                    Pembeli Terverifikasi &bull; {{ review.date }}
                  </p>
                </div>
              </div>

              <!-- Star Rating Per Review -->
              <div class="flex text-xs gap-0.5">
                <span
                  v-for="n in 5"
                  :key="n"
                  :class="
                    n <= review.rating ? 'text-amber-400' : 'text-gray-300'
                  "
                  >★</span
                >
              </div>

              <p class="text-xs text-gray-600 leading-relaxed">
                {{ review.comment }}
              </p>
            </div>
          </div>

          <div
            v-else
            class="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400 text-xs"
          >
            Tidak ada ulasan untuk filter rating ini.
          </div>
        </section>

        <!-- SECTION 3: Related Products Section (Menggunakan ProductCard Component) -->
        <section class="space-y-6 pt-8 border-t border-gray-200/60">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-gray-900">Produk Terkait</h2>
            <router-link
              to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline"
            >
              Lihat Semua &rsaquo;
            </router-link>
          </div>

          <!-- Loading Skeleton -->
          <div
            v-if="loadingRelated"
            class="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="bg-white rounded-2xl p-4 h-64 animate-pulse space-y-3"
            >
              <div class="bg-gray-200 h-36 rounded-xl w-full"></div>
              <div class="bg-gray-200 h-4 rounded w-3/4"></div>
              <div class="bg-gray-200 h-4 rounded w-1/2"></div>
            </div>
          </div>

          <!-- Grid ProductCard -->
          <div
            v-else-if="relatedProducts.length > 0"
            class="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            <ProductCard
              v-for="item in relatedProducts"
              :key="item.id"
              :product="item"
            />
          </div>

          <div v-else class="text-center py-8 text-xs text-gray-400">
            Tidak ada produk terkait lainnya.
          </div>
        </section>
      </template>
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
