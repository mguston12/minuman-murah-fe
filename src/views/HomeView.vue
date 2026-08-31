<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ProductCard from "../components/ProductCard.vue";
import { productService, brandService } from "../services/apiServices";

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

// --- DATA SLIDER HERO BANNER ---
const heroSlides = [
  {
    id: 1,
    title: "Minuman Dingin, Harga Selalu Murah",
    description:
      "Ribuan pilihan minuman favorit, diskon hingga 50% untuk pesanan pertama kamu.",
    buttonText: "Belanja Sekarang",
    buttonLink: "/products",
    bgClass: "bg-[#FAF3E0]",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800",
  },
  // {
  //   id: 2,
  //   title: "Koleksi Wine Premium Impor",
  //   description:
  //     "Nikmati kelezatan wine terbaik dari kebun anggur ternama dunia dengan penawaran spesial.",
  //   buttonText: "Lihat Koleksi Wine",
  //   buttonLink: "/products?category=wine",
  //   bgClass: "bg-[#F3E8EE]",
  //   image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800",
  // },
  // {
  //   id: 3,
  //   title: "Pesta Lebih Meriah Bersama Whisky Pilihan",
  //   description:
  //     "Dapatkan promo cashback hingga 100rb untuk setiap pembelian produk sprit pilihan.",
  //   buttonText: "Jelajahi Sekarang",
  //   buttonLink: "/products?category=whisky",
  //   bgClass: "bg-[#EFECE6]",
  //   image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=800",
  // },
];

const currentHeroIndex = ref(0);
let heroTimer = null;

const nextHeroSlide = () => {
  currentHeroIndex.value = (currentHeroIndex.value + 1) % heroSlides.length;
};

const prevHeroSlide = () => {
  currentHeroIndex.value =
    (currentHeroIndex.value - 1 + heroSlides.length) % heroSlides.length;
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

// --- DATA SLIDER PROMO VOUCHER BANNER ---
const promoSlides = [
  {
    id: 1,
    title: "Diskon 25% untuk Pengguna Baru",
    subtitle: "Pakai kode MURAH25 saat checkout pertamamu.",
    bgClass: "bg-[#D4AF37]",
    textColor: "text-black",
  },
  // {
  //   id: 2,
  //   title: "Free Ongkir Seluruh Indonesia",
  //   subtitle: "Tanpa minimum transaksi khusus pembelian hari ini!",
  //   bgClass: "bg-[#E25C38]",
  //   textColor: "text-white",
  // },
  // {
  //   id: 3,
  //   title: "Cashback Hingga 50% Weekend Special",
  //   subtitle: "Gunakan voucher WEEKENDPARTY setiap hari Sabtu & Minggu.",
  //   bgClass: "bg-[#1C1A17]",
  //   textColor: "text-yellow-300",
  // },
];

const currentPromoIndex = ref(0);
let promoTimer = null;

const nextPromoSlide = () => {
  currentPromoIndex.value = (currentPromoIndex.value + 1) % promoSlides.length;
};

const prevPromoSlide = () => {
  currentPromoIndex.value =
    (currentPromoIndex.value - 1 + promoSlides.length) % promoSlides.length;
};

const goToPromoSlide = (index) => {
  currentPromoIndex.value = index;
};

const startPromoAutoSlide = () => {
  stopPromoAutoSlide();
  promoTimer = setInterval(nextPromoSlide, 4000);
};

const stopPromoAutoSlide = () => {
  if (promoTimer) clearInterval(promoTimer);
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
  fetchTopBrands();
  fetchPopularProducts();
  fetchCheapProducts();
  startHeroAutoSlide();
  startPromoAutoSlide();
});

onUnmounted(() => {
  stopHeroAutoSlide();
  stopPromoAutoSlide();
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
    <div
      v-if="showAgeModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
    >
      <div
        class="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl space-y-6 relative overflow-hidden"
      >
        <!-- Badge Icon 21+ -->
        <div
          class="mx-auto w-16 h-16 rounded-full bg-[#E25C38]/10 text-[#E25C38] flex items-center justify-center text-2xl font-black border-2 border-[#E25C38]"
        >
          21+
        </div>

        <template v-if="!isUnderAge">
          <div class="space-y-2">
            <h3
              class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug"
            >
              Konfirmasi Usia Pengunjung
            </h3>
            <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Situs web ini berisi produk minuman beralkohol. Anda harus berusia
              minimal <strong>21 tahun</strong> untuk dapat mengakses situs ini.
            </p>
          </div>

          <div class="space-y-3 pt-2">
            <button
              @click="handleConfirmAge"
              class="w-full bg-[#1C1A17] hover:bg-black text-yellow-300 font-bold py-3 px-6 rounded-xl text-sm transition-all duration-200 shadow-md active:scale-[0.98]"
            >
              Saya Berusia 21+ (Masuk)
            </button>
            <button
              @click="handleRejectAge"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl text-sm transition-all duration-200"
            >
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
          <button
            @click="isUnderAge = false"
            class="text-xs text-gray-400 hover:text-gray-600 underline pt-2"
          >
            Kembali ke pilihan
          </button>
        </template>
      </div>
    </div>

    <!-- MAIN CONTENT WEBSITE -->
    <main
      class="bg-[#FBF7F1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10"
    >
      <!-- 1. Hero Section Slide Carousel -->
      <section
        class="relative rounded-2xl overflow-hidden shadow-sm group w-full"
        @mouseenter="stopHeroAutoSlide"
        @mouseleave="startHeroAutoSlide"
      >
        <div
          class="flex w-full transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentHeroIndex * 100}%)` }"
        >
          <div
            v-for="slide in heroSlides"
            :key="slide.id"
            class="w-full flex-shrink-0"
          >
            <div
              :class="[
                slide.bgClass,
                'w-full p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 min-h-[320px]',
              ]"
            >
              <div class="max-w-md space-y-4 text-center md:text-left">
                <h1
                  class="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
                >
                  {{ slide.title }}
                </h1>
                <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
                  {{ slide.description }}
                </p>
                <router-link
                  :to="slide.buttonLink"
                  class="bg-[#1C1A17] hover:bg-black text-yellow-300 px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors inline-block"
                >
                  {{ slide.buttonText }}
                </router-link>
              </div>

              <div
                class="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-sm"
              >
                <img
                  :src="slide.image"
                  :alt="slide.title"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Tombol Navigasi Prev/Next Hero -->
        <button
          @click="prevHeroSlide"
          aria-label="Previous Slide"
          class="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          &#10094;
        </button>
        <button
          @click="nextHeroSlide"
          aria-label="Next Slide"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          &#10095;
        </button>

        <!-- Indikator Dots Hero -->
        <div
          class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-10"
        >
          <button
            v-for="(slide, index) in heroSlides"
            :key="slide.id"
            @click="goToHeroSlide(index)"
            :aria-label="`Go to slide ${index + 1}`"
            :class="[
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              currentHeroIndex === index
                ? 'bg-[#1C1A17] w-6'
                : 'bg-gray-400/60 hover:bg-gray-600',
            ]"
          ></button>
        </div>
      </section>

      <!-- 2. Kategori Pilihan Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Kategori Pilihan
          </h2>
          <div class="flex items-center gap-3">
            <router-link
              to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
            >
              Lihat semua &rarr;
            </router-link>

            <div class="hidden sm:flex items-center">
              <button
                @click="scrollContainer(categoryContainer, 'prev')"
                aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10094;
              </button>
              <button
                @click="scrollContainer(categoryContainer, 'next')"
                aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div
          ref="categoryContainer"
          class="flex gap-1 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1"
        >
          <router-link
            v-for="item in categories"
            :key="item.name"
            to="/products"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0 bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group border border-gray-100/80"
          >
            <div
              class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-50"
            >
              <img
                :src="item.image"
                :alt="item.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span
              class="text-xs sm:text-sm font-semibold text-gray-800 text-center line-clamp-1 group-hover:text-[#E25C38] transition-colors"
            >
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
            <router-link
              to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
            >
              Lihat semua &rarr;
            </router-link>

            <div class="hidden sm:flex items-center gap-1">
              <button
                @click="scrollContainer(brandsContainer, 'prev')"
                aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10094;
              </button>
              <button
                @click="scrollContainer(brandsContainer, 'next')"
                aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div
          ref="brandsContainer"
          class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1"
        >
          <router-link
            v-for="brand in topBrands"
            :key="brand.name"
            to="/products"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0 aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all"
          >
            <img
              :src="brand.logo"
              :alt="brand.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </router-link>
        </div>
      </section>

      <!-- 4. Promo Banner Voucher Slide Carousel -->
      <section
        class="relative rounded-xl overflow-hidden shadow-sm group"
        @mouseenter="stopPromoAutoSlide"
        @mouseleave="startPromoAutoSlide"
      >
        <div
          class="flex transition-transform duration-500 ease-in-out"
          :style="{ transform: `translateX(-${currentPromoIndex * 100}%)` }"
        >
          <div
            v-for="promo in promoSlides"
            :key="promo.id"
            :class="[
              promo.bgClass,
              promo.textColor,
              'min-w-full p-6 text-center space-y-1 flex-shrink-0',
            ]"
          >
            <div class="my-3">
              <h3 class="text-lg md:text-xl font-extrabold tracking-wide">
                {{ promo.title }}
              </h3>
              <p class="mt-2 text-xs md:text-sm opacity-90">
                {{ promo.subtitle }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tombol Navigasi Prev/Next Promo -->
        <button
          @click="prevPromoSlide"
          aria-label="Previous Promo"
          class="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          &#10094;
        </button>
        <button
          @click="nextPromoSlide"
          aria-label="Next Promo"
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
        >
          &#10095;
        </button>

        <!-- Indikator Dots Promo -->
        <div
          class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 z-10"
        >
          <button
            v-for="(promo, index) in promoSlides"
            :key="promo.id"
            @click="goToPromoSlide(index)"
            :aria-label="`Go to promo ${index + 1}`"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              currentPromoIndex === index
                ? 'bg-white w-5'
                : 'bg-white/50 hover:bg-white/80',
            ]"
          ></button>
        </div>
      </section>

      <!-- 5. Produk Terlaris Slide Carousel -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">
            Produk Terlaris
          </h2>
          <div class="flex items-center gap-3">
            <router-link
              to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
            >
              Lihat semua &rarr;
            </router-link>

            <div
              v-if="popularProducts.length"
              class="hidden sm:flex items-center gap-1"
            >
              <button
                @click="scrollContainer(popularContainer, 'prev')"
                aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10094;
              </button>
              <button
                @click="scrollContainer(popularContainer, 'next')"
                aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="isLoadingPopular"
          class="bg-white rounded-2xl p-8 text-center text-xs text-gray-400"
        >
          Memuat produk terlaris...
        </div>

        <div
          v-else-if="popularError"
          class="bg-white rounded-2xl p-8 text-center text-xs text-red-500"
        >
          {{ popularError }}
        </div>

        <div
          v-else-if="!popularProducts.length"
          class="bg-white rounded-2xl p-8 text-center text-xs text-gray-500"
        >
          Belum ada produk terlaris.
        </div>

        <div
          v-else
          ref="popularContainer"
          class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1"
        >
          <div
            v-for="product in popularProducts"
            :key="product.id"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0"
          >
            <ProductCard
              :product="product"
              @add-to-cart="handleAddToCart"
              @quick-view="handleQuickView"
            />
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
            <router-link
              to="/products"
              class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
            >
              Lihat semua &rarr;
            </router-link>

            <div
              v-if="cheapProducts.length"
              class="hidden sm:flex items-center gap-1"
            >
              <button
                @click="scrollContainer(cheapContainer, 'prev')"
                aria-label="Scroll left"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10094;
              </button>
              <button
                @click="scrollContainer(cheapContainer, 'next')"
                aria-label="Scroll right"
                class="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
              >
                &#10095;
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="isLoadingCheap"
          class="bg-white rounded-2xl p-8 text-center text-xs text-gray-400"
        >
          Memuat produk harga murah...
        </div>

        <div
          v-else-if="cheapError"
          class="bg-white rounded-2xl p-8 text-center text-xs text-red-500"
        >
          {{ cheapError }}
        </div>

        <div
          v-else-if="!cheapProducts.length"
          class="bg-white rounded-2xl p-8 text-center text-xs text-gray-500"
        >
          Belum ada produk murah.
        </div>

        <div
          v-else
          ref="cheapContainer"
          class="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 -mx-1 px-1"
        >
          <div
            v-for="product in cheapProducts"
            :key="product.id"
            class="w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(20%-13px)] flex-shrink-0"
          >
            <ProductCard
              :product="product"
              @add-to-cart="handleAddToCart"
              @quick-view="handleQuickView"
            />
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
