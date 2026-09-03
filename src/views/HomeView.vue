<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { productService, brandService, bannerService, configService } from "../services/apiServices";

// --- HELPER FUNCTIONS UNTUK COOKIES ---
const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name, value, days = 30) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
};

// --- STATE MODAL VERIFIKASI 21+ ---
const showAgeModal = ref(false);
const isUnderAge = ref(false);

const checkAgeVerification = () => {
  const isVerified = getCookie("is_age_verified_21");
  if (!isVerified) {
    showAgeModal.value = true;
  }
};

const handleConfirmAge = () => {
  setCookie("is_age_verified_21", "true", 30);
  showAgeModal.value = false;
};

const handleRejectAge = () => {
  isUnderAge.value = true;
};

// --- DATA SLIDER HERO BANNER (DARI API MAIN BANNERS) ---
const heroSlides = ref([]);
const isLoadingHero = ref(false);
const heroError = ref(null);

const fetchMainBanners = async () => {
  isLoadingHero.value = true;
  heroError.value = null;
  try {
    // Sesuaikan method dengan service API milikmu, misalnya: bannerService.getMainBanners()
    const response = await bannerService.getMainBanners({ per_page: "all" });
    const resData = response?.data?.data || [];
    heroSlides.value = resData.filter((item) => item.status === "ACTIVE");
  } catch (err) {
    console.error("Gagal mengambil data main banner:", err);
    heroError.value = "Gagal memuat banner utama.";
  } finally {
    isLoadingHero.value = false;
  }
};

const currentHeroIndex = ref(0);
let heroTimer = null;

const nextHeroSlide = () => {
  if (!heroSlides.value.length) return;
  currentHeroIndex.value = (currentHeroIndex.value + 1) % heroSlides.value.length;
};

const prevHeroSlide = () => {
  if (!heroSlides.value.length) return;
  currentHeroIndex.value =
    (currentHeroIndex.value - 1 + heroSlides.value.length) % heroSlides.value.length;
};

const goToHeroSlide = (index) => {
  currentHeroIndex.value = index;
};

const startHeroAutoSlide = () => {
  stopHeroAutoSlide();
  heroTimer = setInterval(nextHeroSlide, 5000);
};

const stopHeroAutoSlide = () => {
  if (heroTimer) clearInterval(heroTimer);
};

// --- DATA PROMO / TOP BANNER (DARI API TOPBANNER CONFIG) ---
const topBannerText = ref("Diskon 25% untuk Pengguna Baru");
const isLoadingTopBanner = ref(false);

const fetchTopBannerConfig = async () => {
  isLoadingTopBanner.value = true;
  try {
    const response = await configService.getTopBannerConfig();
    const resData = response?.data?.data || response?.data;
    if (resData) {
      topBannerText.value = typeof resData === "string" ? resData : resData.value || resData.content || topBannerText.value;
    }
  } catch (err) {
    console.error("Gagal mengambil config top banner:", err);
  } finally {
    isLoadingTopBanner.value = false;
  }
};

// --- Data Dummy Kategori ---
const categories = [
  {
    name: "Wine",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300",
  },
  {
    name: "Champagne",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300",
  },
  {
    name: "Whisky",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300",
  },
  {
    name: "Vodka",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=300",
  },
  {
    name: "Gin",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300",
  },
  {
    name: "Rum",
    image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=300",
  },
  {
    name: "Tequila",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300",
  },
  {
    name: "Beer",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300",
  },
];

// --- STATE BRAND DARI API ---
const topBrands = ref([]);
const isLoadingBrands = ref(false);
const brandsError = ref(null);

// --- STATE PRODUK API ---
const popularProducts = ref([]);
const cheapProducts = ref([]);

const isLoadingPopular = ref(false);
const isLoadingCheap = ref(false);

const popularError = ref(null);
const cheapError = ref(null);

// --- REFS CONTAINER UNTUK SLIDER ---
const categoryContainer = ref(null);
const brandsContainer = ref(null);
const popularContainer = ref(null);
const cheapContainer = ref(null);

const scrollContainer = (containerRef, direction) => {
  if (!containerRef) return;
  const scrollAmount = containerRef.clientWidth * 0.8;
  containerRef.scrollBy({
    left: direction === "next" ? scrollAmount : -scrollAmount,
    behavior: "smooth",
  });
};

// --- FETCH TOP BRANDS API ---
const fetchTopBrands = async () => {
  isLoadingBrands.value = true;
  brandsError.value = null;
  try {
    const response = await brandService.getActiveBrands();
    const resData = response?.data?.data;
    topBrands.value = resData?.brands || resData || [];
  } catch (err) {
    console.error("Gagal mengambil data brand:", err);
    brandsError.value = "Gagal memuat brand pilihan.";
  } finally {
    isLoadingBrands.value = false;
  }
};

const fetchPopularProducts = async () => {
  isLoadingPopular.value = true;
  popularError.value = null;
  try {
    const response = await productService.getProducts({
      page: 1,
      per_page: 10,
      sort_direction: "desc",
    });
    const resData = response?.data?.data;
    popularProducts.value = resData?.products || [];
  } catch (err) {
    console.error("Gagal mengambil produk terlaris:", err);
    popularError.value = "Gagal memuat produk terlaris.";
  } finally {
    isLoadingPopular.value = false;
  }
};

const fetchCheapProducts = async () => {
  isLoadingCheap.value = true;
  cheapError.value = null;
  try {
    const response = await productService.getProducts({
      page: 1,
      per_page: 10,
      sort_direction: "asc",
    });
    const resData = response?.data?.data;
    cheapProducts.value = resData?.products || [];
  } catch (err) {
    console.error("Gagal mengambil produk termurah:", err);
    cheapError.value = "Gagal memuat produk murah.";
  } finally {
    isLoadingCheap.value = false;
  }
};

onMounted(() => {
  checkAgeVerification();
  fetchMainBanners();
  fetchTopBannerConfig();
  fetchTopBrands();
  fetchPopularProducts();
  fetchCheapProducts();
  startHeroAutoSlide();
});

onUnmounted(() => {
  stopHeroAutoSlide();
});

const handleAddToCart = (product) => {
  console.log("Add to cart:", product);
};

const handleQuickView = (product) => {
  console.log("Quick view:", product);
};
</script>

<template>
  <div>
    <!-- POP-UP VERIFIKASI USIA 21+ -->
    <div v-if="showAgeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div
        class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
        <!-- Badge Icon 21+ -->
        <div
          class="mx-auto w-16 h-16 rounded-full bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center text-2xl font-black border-2 border-[#E25C38]">
          21+
        </div>

        <template v-if="!isUnderAge">
          <div class="space-y-2">
            <h3 class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
              Konfirmasi Usia Pengunjung
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Situs web ini berisi produk minuman beralkohol. Anda harus berusia
              minimal <strong>21 tahun</strong> untuk dapat mengakses situs ini.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <button @click="handleConfirmAge"
              class="w-full bg-[#1C1A17] hover:bg-black text-yellow-300 font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-[0.98]">
              Saya Berusia 21+ (Masuk)
            </button>
            <button @click="handleRejectAge"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200">
              Belum 21 Tahun
            </button>
          </div>
        </template>

        <!-- Peringatan Jika Belum Cukup Umur -->
        <template v-else>
          <div class="space-y-3">
            <h3 class="text-xl font-bold text-red-600">Akses Ditolak</h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Maaf, Anda belum cukup umur untuk mengakses situs web ini sesuai
              dengan peraturan hukum yang berlaku.
            </p>
          </div>
          <button @click="isUnderAge = false" class="text-xs text-gray-400 hover:text-gray-600 underline pt-2">
            Kembali ke pilihan
          </button>
        </template>
      </div>
    </div>

    <!-- MAIN CONTENT WEBSITE -->
    <main class="bg-[#FBF7F1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      <!-- 1. Hero Section Slide Carousel (Gambar Main Banner API) -->
      <section v-if="heroSlides.length > 0" class="relative rounded-2xl overflow-hidden shadow-sm group w-full"
        @mouseenter="stopHeroAutoSlide" @mouseleave="startHeroAutoSlide">
        <div class="flex w-full transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentHeroIndex * 100}%)` }">
          <div v-for="slide in heroSlides" :key="slide.id" class="w-full flex-shrink-0">
            <router-link to="/products" class="block w-full">
              <img :src="slide.image" :alt="slide.title || 'Main Banner'"
                class="w-full h-auto max-h-[420px] object-cover rounded-2xl" />
            </router-link>
          </div>
        </div>

        <!-- Tombol Navigasi Prev/Next Hero -->
        <button v-if="heroSlides.length > 1" @click="prevHeroSlide" aria-label="Previous Slide"
          class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          &#10094;
        </button>
        <button v-if="heroSlides.length > 1" @click="nextHeroSlide" aria-label="Next Slide"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          &#10095;
        </button>

        <!-- Indikator Dots Hero -->
        <div v-if="heroSlides.length > 1"
          class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10">
          <button v-for="(slide, index) in heroSlides" :key="slide.id" @click="goToHeroSlide(index)"
            :aria-label="`Go to slide ${index + 1}`" :class="[
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              currentHeroIndex === index
                ? 'bg-[#1C1A17] w-6'
                : 'bg-gray-400/60 hover:bg-gray-600',
            ]"></button>
        </div>
      </section>

      <!-- Skeleton Loading untuk Hero Banner -->
      <div v-else-if="isLoadingHero" class="w-full h-64 sm:h-80 bg-gray-200 animate-pulse rounded-2xl"></div>

      <!-- 2. Kategori Pilihan Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Kategori Pilihan
          </h2>
          <div class="flex items-center gap-3">
            <router-link to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1">
              Lihat semua &rarr;
            </router-link>

            <div class="hidden sm:flex items-center">
              <button @click="scrollContainer(categoryContainer, 'prev')" aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10094;
              </button>
              <button @click="scrollContainer(categoryContainer, 'next')" aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div ref="categoryContainer"
          class="flex gap-1 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1">
          <router-link v-for="item in categories" :key="item.name" to="/products"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0 bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group border border-gray-100/80">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-50">
              <img :src="item.image" :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span
              class="text-xs sm:text-sm font-semibold text-gray-800 text-center line-clamp-1 group-hover:text-[#E25C38] transition-colors">
              {{ item.name }}
            </span>
          </router-link>
        </div>
      </section>

      <!-- 3. Top Brands Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Top Brands
          </h2>
          <div class="flex items-center gap-3">
            <router-link to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1">
              Lihat semua &rarr;
            </router-link>

            <div class="hidden sm:flex items-center gap-1">
              <button @click="scrollContainer(brandsContainer, 'prev')" aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10094;
              </button>
              <button @click="scrollContainer(brandsContainer, 'next')" aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div ref="brandsContainer" class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1">
          <router-link v-for="brand in topBrands" :key="brand.name" to="/products"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0 aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all">
            <img :src="brand.logo" :alt="brand.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </router-link>
        </div>
      </section>

      <!-- 4. Promo Banner Voucher (Top Banner dari API) -->
      <section class="relative rounded-xl overflow-hidden shadow-sm bg-[#D4AF37] text-black p-6 text-center space-y-1">
        <div class="my-3">
          <h3 class="text-lg md:text-md font-bold tracking-wide">
            {{ topBannerText }}
          </h3>
        </div>
      </section>

      <!-- 5. Produk Terlaris Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Produk Terlaris
          </h2>
          <div class="flex items-center gap-3">
            <router-link to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1">
              Lihat semua &rarr;
            </router-link>

            <div v-if="popularProducts.length" class="hidden sm:flex items-center gap-1">
              <button @click="scrollContainer(popularContainer, 'prev')" aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10094;
              </button>
              <button @click="scrollContainer(popularContainer, 'next')" aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div v-if="isLoadingPopular" class="bg-white rounded-2xl p-8 text-center text-xs text-gray-400">
          Memuat produk terlaris...
        </div>

        <div v-else-if="popularError" class="bg-white rounded-2xl p-8 text-center text-xs text-red-500">
          {{ popularError }}
        </div>

        <div v-else-if="!popularProducts.length" class="bg-white rounded-2xl p-8 text-center text-xs text-gray-500">
          Belum ada produk terlaris.
        </div>

        <div v-else ref="popularContainer"
          class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1">
          <div v-for="product in popularProducts" :key="product.id"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0">
            <ProductCard :product="product" @add-to-cart="handleAddToCart" @quick-view="handleQuickView" />
          </div>
        </div>
      </section>

      <!-- 6. Harga Murah Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Harga Murah
          </h2>
          <div class="flex items-center gap-3">
            <router-link to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1">
              Lihat semua &rarr;
            </router-link>

            <div v-if="cheapProducts.length" class="hidden sm:flex items-center gap-1">
              <button @click="scrollContainer(cheapContainer, 'prev')" aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10094;
              </button>
              <button @click="scrollContainer(cheapContainer, 'next')" aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors">
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div v-if="isLoadingCheap" class="bg-white rounded-2xl p-8 text-center text-xs text-gray-400">
          Memuat produk harga murah...
        </div>

        <div v-else-if="cheapError" class="bg-white rounded-2xl p-8 text-center text-xs text-red-500">
          {{ cheapError }}
        </div>

        <div v-else-if="!cheapProducts.length" class="bg-white rounded-2xl p-8 text-center text-xs text-gray-500">
          Belum ada produk murah.
        </div>

        <div v-else ref="cheapContainer"
          class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1">
          <div v-for="product in cheapProducts" :key="product.id"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0">
            <ProductCard :product="product" @add-to-cart="handleAddToCart" @quick-view="handleQuickView" />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}

.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>