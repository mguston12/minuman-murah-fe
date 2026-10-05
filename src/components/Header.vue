<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import logoMM from "../assets/logo-3.png";
import { useAuth } from "../composables/useAuth";
import CartDrawer from "./CartDrawer.vue";
import {
  taxonomyService,
  cartService,
  productService,
} from "../services/apiServices";

const router = useRouter();
const searchQuery = ref("");
const isCartOpen = ref(false);
const isProfileMenuOpen = ref(false);
const profileDropdownRef = ref(null);
const isScrolled = ref(false); // untuk menyembunyikan baris kategori di mobile saat scroll

const { isLoggedIn, user, logout, setAuthData } = useAuth();

const categories = ref([]);
const brands = ref([]);
const totalCount = ref(0);

/* ===================== Scroll Kategori (panah kiri/kanan) ===================== */
const navRef = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const updateNavArrows = () => {
  const el = navRef.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
};

const scrollNav = (dir) => {
  const el = navRef.value;
  if (!el) return;
  el.scrollBy({
    left: dir === "next" ? el.clientWidth * 0.7 : -el.clientWidth * 0.7,
    behavior: "smooth",
  });
};

/* ===================== Kategori & Cart ===================== */
const fetchCategories = async () => {
  try {
    const response = await taxonomyService.getTaxoByType(2);
    const rawCategories =
      response?.data?.data?.taxo_lists || response?.data?.data || [];

    const dynamicCategories = rawCategories.map((item) => ({
      name: item.taxonomy_name,
      href: `/products?category_ids=${item.id}`,
      isHighlight: false,
    }));

    categories.value = [
      { name: "Promo", href: "/products?promo=true", isHighlight: true },
      ...dynamicCategories,
      { name: "Guide", href: "/blog", isHighlight: false },
    ];

    // Hitung ulang panah setelah kategori ter-render
    await nextTick();
    updateNavArrows();
  } catch (err) {
    console.error("Gagal memuat kategori navigasi:", err);
  }
};

const fetchCartCount = async () => {
  try {
    const response = await cartService.getCart();
    const resData = response?.data?.data || response?.data || {};
    const items = resData.cart || [];
    totalCount.value =
      resData.calculation?.total_cart ||
      items.reduce((acc, item) => acc + item.qty, 0);
  } catch (err) {
    console.error("Gagal memuat jumlah keranjang:", err);
  }
};

/* ===================== Brand (untuk suggestion) ===================== */
const fetchBrands = async () => {
  try {
    const response = await productService.getBrands();
    const raw =
      response?.data?.data?.brands ||
      response?.data?.data ||
      response?.data ||
      [];
    const list = Array.isArray(raw) ? raw : [];
    // SESUAIKAN nama field kalau berbeda (name / brand_name, slug, logo / image)
    brands.value = list.map((b) => ({
      id: b.id,
      name: b.name || b.brand_name || "",
      slug: b.slug,
      logo: b.logo || b.image || b.logo_url || null,
    }));
  } catch (err) {
    console.error("Gagal memuat brand:", err);
  }
};

/* ===================== Search Suggestion ===================== */
const searchWrapperRef = ref(null);
const isSuggestOpen = ref(false);
const isSuggestLoading = ref(false);
const productSuggestions = ref([]);
const activeIndex = ref(-1);
let debounceTimer = null;
let requestId = 0;

// Brand yang cocok (filter lokal, tanpa request tambahan)
const brandSuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  return brands.value
    .filter((b) => b.name && b.name.toLowerCase().includes(q))
    .slice(0, 4);
});

// Kategori yang cocok (filter lokal dari kategori navigasi)
const categorySuggestions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  return categories.value
    .filter((c) => !c.isHighlight && c.name !== "Guide")
    .filter((c) => c.name.toLowerCase().includes(q))
    .slice(0, 4);
});

// Urutan navigasi keyboard: produk -> brand -> kategori
const flatSuggestions = computed(() => [
  ...productSuggestions.value.map((p) => ({ type: "product", data: p })),
  ...brandSuggestions.value.map((b) => ({ type: "brand", data: b })),
  ...categorySuggestions.value.map((c) => ({ type: "category", data: c })),
]);

const brandOffset = computed(() => productSuggestions.value.length);
const categoryOffset = computed(
  () => productSuggestions.value.length + brandSuggestions.value.length,
);

const hasSideColumn = computed(
  () =>
    brandSuggestions.value.length > 0 || categorySuggestions.value.length > 0,
);

const formatPrice = (val) =>
  "IDR " + new Intl.NumberFormat("id-ID").format(Number(val) || 0);

// Pecah teks jadi bagian bold / tidak (aman dari XSS, tanpa v-html)
const highlightParts = (text) => {
  const q = searchQuery.value.trim();
  if (!q || !text) return [{ text: text || "", bold: false }];
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return [{ text, bold: false }];
  return [
    { text: text.slice(0, idx), bold: false },
    { text: text.slice(idx, idx + q.length), bold: true },
    { text: text.slice(idx + q.length), bold: false },
  ].filter((p) => p.text);
};

const fetchSuggestions = async (q) => {
  const currentId = ++requestId;
  isSuggestLoading.value = true;
  try {
    const response = await productService.getProducts({
      search: q,
      per_page: 20,
    });
    if (currentId !== requestId) return;

    const list = response?.data?.data?.products || [];
    const ql = q.toLowerCase();

    productSuggestions.value = list
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name || "",
        image: p.featured_image?.path || p.images?.[0]?.path || null,
        price: p.final_price ?? p.price ?? 0,
      }))
      .filter((p) => p.name.toLowerCase().includes(ql))
      .sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(ql) ? 0 : 1;
        const bStart = b.name.toLowerCase().startsWith(ql) ? 0 : 1;
        return aStart - bStart;
      })
      .slice(0, 5);
  } catch (err) {
    if (currentId === requestId) productSuggestions.value = [];
    console.error("Gagal memuat suggestion:", err);
  } finally {
    if (currentId === requestId) isSuggestLoading.value = false;
  }
};

watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  activeIndex.value = -1;
  const q = val.trim();
  if (q.length < 1) {
    requestId++;
    productSuggestions.value = [];
    isSuggestLoading.value = false;
    isSuggestOpen.value = false;
    return;
  }
  isSuggestOpen.value = true;
  debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
});

const goToProduct = (p) => {
  isSuggestOpen.value = false;
  router.push({ path: "/products", query: { search: p.name } });
};

const goToBrand = (b) => {
  isSuggestOpen.value = false;
  router.push({ path: "/products", query: { search: b.name } });
};

const goToCategory = (c) => {
  isSuggestOpen.value = false;
  router.push(c.href);
};

const pickSuggestion = (item) => {
  if (item.type === "product") goToProduct(item.data);
  else if (item.type === "brand") goToBrand(item.data);
  else goToCategory(item.data);
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    isSuggestOpen.value = false;
    router.push({
      path: "/products",
      query: { search: searchQuery.value.trim() },
    });
  }
};

const handleSearchKeydown = (e) => {
  const total = flatSuggestions.value.length;
  if (e.key === "ArrowDown" && total) {
    e.preventDefault();
    isSuggestOpen.value = true;
    activeIndex.value = (activeIndex.value + 1) % total;
  } else if (e.key === "ArrowUp" && total) {
    e.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + total) % total;
  } else if (e.key === "Enter") {
    if (activeIndex.value >= 0 && flatSuggestions.value[activeIndex.value]) {
      e.preventDefault();
      pickSuggestion(flatSuggestions.value[activeIndex.value]);
    } else {
      handleSearch();
    }
  } else if (e.key === "Escape") {
    isSuggestOpen.value = false;
  }
};

/* ===================== Global handlers ===================== */
const handleClickOutside = (event) => {
  if (
    profileDropdownRef.value &&
    !profileDropdownRef.value.contains(event.target)
  ) {
    isProfileMenuOpen.value = false;
  }
  if (
    searchWrapperRef.value &&
    !searchWrapperRef.value.contains(event.target)
  ) {
    isSuggestOpen.value = false;
  }
};

const handleCartUpdated = () => {
  fetchCartCount();
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 80;
};

onMounted(() => {
  const currentToken = Cookies.get("auth_token");
  const currentUser = Cookies.get("auth_user");

  if (currentToken) {
    let parsedUser = null;
    try {
      parsedUser = currentUser ? JSON.parse(currentUser) : null;
    } catch (e) {
      parsedUser = null;
    }
    setAuthData(currentToken, parsedUser);
  }

  document.addEventListener("click", handleClickOutside);
  window.addEventListener("cart-updated", handleCartUpdated);
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", updateNavArrows);

  fetchCategories();
  fetchBrands();
  fetchCartCount();
});

onUnmounted(() => {
  clearTimeout(debounceTimer);
  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("cart-updated", handleCartUpdated);
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", updateNavArrows);
});

const handleLogout = () => {
  isProfileMenuOpen.value = false;
  Cookies.remove("auth_token");
  Cookies.remove("auth_user");
  logout();
  window.location.href = "/";
};
</script>

<template>
  <header
    class="w-full bg-black shadow-md border-b border-zinc-800 sticky top-0 z-40"
  >
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
      <div
        class="flex flex-wrap md:flex-nowrap items-center justify-between gap-x-3 md:gap-x-4 gap-y-2 pt-2.5 pb-2 md:py-2 md:h-20"
      >
        <!-- Logo -->
        <router-link
          to="/"
          class="order-1 flex-shrink-0 flex items-center md:h-full"
        >
          <img
            :src="logoMM"
            alt="Minuman Murah Logo"
            class="h-9 md:h-12 w-auto object-contain brightness-110"
          />
        </router-link>

        <!-- Search Bar -->
        <div
          class="order-3 md:order-2 w-full md:w-auto md:flex-1 md:max-w-xl md:mx-4"
        >
          <div ref="searchWrapperRef" class="relative">
            <input
              v-model="searchQuery"
              @keydown="handleSearchKeydown"
              @focus="searchQuery.trim().length >= 1 && (isSuggestOpen = true)"
              type="search"
              enterkeyhint="search"
              autocomplete="off"
              placeholder="Cari wine, whisky, bir, dan lainnya..."
              class="w-full bg-zinc-900 border border-zinc-800 text-base md:text-sm text-gray-100 rounded-full py-2.5 md:py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-black transition-all placeholder-gray-500 [&::-webkit-search-cancel-button]:appearance-none"
            />
            <button
              @click="handleSearch"
              aria-label="Cari Produk"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <!-- Dropdown Suggestion -->
            <div
              v-if="isSuggestOpen"
              class="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-gray-200"
            >
              <div
                class="flex flex-col md:flex-row max-h-[65vh] md:max-h-[70vh] overflow-y-auto"
              >
                <!-- Kolom Produk -->
                <div class="flex-1 py-2 min-w-0">
                  <div
                    v-if="isSuggestLoading && !productSuggestions.length"
                    class="px-4 py-6 text-xs text-gray-500"
                  >
                    Mencari...
                  </div>

                  <button
                    v-for="(p, i) in productSuggestions"
                    :key="p.id"
                    type="button"
                    @click="goToProduct(p)"
                    @mouseenter="activeIndex = i"
                    :class="[
                      'w-full flex items-center gap-3 px-4 py-2.5 md:py-2 text-left transition-colors',
                      activeIndex === i ? 'bg-zinc-800' : 'hover:bg-zinc-800',
                    ]"
                  >
                    <div
                      class="w-10 h-12 flex-shrink-0 flex items-center justify-center bg-zinc-800 rounded"
                    >
                      <img
                        v-if="p.image"
                        :src="p.image"
                        :alt="p.name"
                        class="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm truncate text-gray-300">
                        <template
                          v-for="(part, k) in highlightParts(p.name)"
                          :key="k"
                        >
                          <span
                            :class="part.bold ? 'font-bold text-white' : ''"
                            >{{ part.text }}</span
                          >
                        </template>
                      </p>
                      <p class="text-xs font-bold text-[#E25C38]">
                        {{ formatPrice(p.price) }}
                      </p>
                    </div>
                  </button>

                  <div
                    v-if="!isSuggestLoading && !productSuggestions.length"
                    class="px-4 py-6 text-xs text-gray-500"
                  >
                    Produk tidak ditemukan
                  </div>
                </div>

                <!-- Kolom Brand & Kategori -->
                <div
                  v-if="hasSideColumn"
                  class="md:w-56 flex-shrink-0 border-t md:border-t-0 md:border-l border-zinc-800 py-2"
                >
                  <!-- Brand -->
                  <template v-if="brandSuggestions.length">
                    <p class="px-4 py-2 text-xs font-bold text-white">Brand</p>
                    <button
                      v-for="(b, j) in brandSuggestions"
                      :key="'brand-' + (b.id ?? b.name)"
                      type="button"
                      @click="goToBrand(b)"
                      @mouseenter="activeIndex = brandOffset + j"
                      :class="[
                        'w-full flex items-center gap-2 text-left px-4 py-2.5 md:py-2 text-sm text-gray-300 transition-colors',
                        activeIndex === brandOffset + j
                          ? 'bg-zinc-800'
                          : 'hover:bg-zinc-800',
                      ]"
                    >
                      <img
                        v-if="b.logo"
                        :src="b.logo"
                        :alt="b.name"
                        class="h-5 w-5 object-contain flex-shrink-0"
                      />
                      <span class="truncate">
                        <template
                          v-for="(part, k) in highlightParts(b.name)"
                          :key="k"
                        >
                          <span
                            :class="part.bold ? 'font-bold text-white' : ''"
                            >{{ part.text }}</span
                          >
                        </template>
                      </span>
                    </button>
                  </template>

                  <!-- Kategori -->
                  <template v-if="categorySuggestions.length">
                    <p class="px-4 py-2 text-xs font-bold text-white">
                      Kategori
                    </p>
                    <button
                      v-for="(c, j) in categorySuggestions"
                      :key="'cat-' + c.name"
                      type="button"
                      @click="goToCategory(c)"
                      @mouseenter="activeIndex = categoryOffset + j"
                      :class="[
                        'w-full text-left px-4 py-2.5 md:py-2 text-sm text-gray-300 transition-colors',
                        activeIndex === categoryOffset + j
                          ? 'bg-zinc-800'
                          : 'hover:bg-zinc-800',
                      ]"
                    >
                      <template
                        v-for="(part, k) in highlightParts(c.name)"
                        :key="k"
                      >
                        <span
                          :class="part.bold ? 'font-bold text-white' : ''"
                          >{{ part.text }}</span
                        >
                      </template>
                    </button>
                  </template>
                </div>
              </div>

              <!-- Lihat semua hasil -->
              <button
                type="button"
                @click="handleSearch"
                class="w-full px-4 py-3 md:py-2.5 text-xs font-medium text-[#E25C38] hover:bg-zinc-800 border-t border-zinc-800 text-left"
              >
                Lihat semua hasil untuk "{{ searchQuery.trim() }}"
              </button>
            </div>
          </div>
        </div>

        <!-- Auth & Cart Action -->
        <div
          class="order-2 md:order-3 ml-auto md:ml-0 flex items-center gap-1.5 md:gap-3 text-sm flex-shrink-0"
        >
          <!-- JIKA USER SUDAH LOGIN -->
          <div v-if="isLoggedIn" ref="profileDropdownRef" class="relative">
            <button
              @click="isProfileMenuOpen = !isProfileMenuOpen"
              type="button"
              aria-label="Menu akun"
              class="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-yellow-400 font-medium h-9 px-2.5 sm:px-4 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span class="hidden sm:inline max-w-[120px] truncate">{{
                user?.name || "Profil"
              }}</span>
            </button>

            <!-- Dropdown Menu Logout / Akun -->
            <div
              v-if="isProfileMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 py-1 z-50 text-gray-200"
            >
              <div
                class="sm:hidden px-4 py-2 text-xs text-gray-400 border-b border-zinc-800 truncate"
              >
                {{ user?.name || "Profil" }}
              </div>
              <router-link
                to="/account"
                @click="isProfileMenuOpen = false"
                class="block px-4 py-2.5 hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                Akun Saya
              </router-link>
              <button
                @click="handleLogout"
                type="button"
                class="w-full text-left px-4 py-2.5 hover:bg-red-950/40 text-red-400 text-xs font-medium border-t border-zinc-800 transition-colors"
              >
                Keluar (Logout)
              </button>
            </div>
          </div>

          <!-- JIKA USER BELUM LOGIN -->
          <template v-else>
            <router-link
              to="/login"
              class="text-gray-300 hover:text-white text-[13px] md:text-sm font-medium px-2 h-9 inline-flex items-center transition-colors"
            >
              Masuk
            </router-link>

            <router-link
              to="/register"
              class="bg-[#E25C38] hover:bg-[#c84c2a] text-white text-[13px] md:text-sm font-medium px-3 md:px-4 h-9 inline-flex items-center rounded-lg transition-colors shadow-sm"
            >
              Daftar
            </router-link>
          </template>

          <!-- Cart Button -->
          <button
            id="cart-icon"
            @click="isCartOpen = true"
            type="button"
            aria-label="Buka keranjang"
            class="flex items-center gap-1.5 border border-zinc-700 bg-zinc-900/80 rounded-lg h-9 px-2.5 sm:px-3 hover:bg-zinc-800 text-gray-200 hover:text-white font-medium transition-colors relative"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-[18px] w-[18px] sm:h-4 sm:w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <span class="hidden sm:inline">Keranjang</span>

            <span
              v-if="totalCount > 0"
              class="absolute -top-1.5 -right-1.5 sm:static sm:ml-1 bg-[#E25C38] text-white text-[10px] sm:text-xs min-w-[18px] text-center px-1 sm:px-1.5 py-0.5 rounded-full font-bold leading-none sm:leading-normal"
            >
              {{ totalCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Navigation Categories (di mobile otomatis mengecil saat scroll ke bawah) -->
      <div
        :class="[
          isScrolled
            ? 'max-h-0 py-0 opacity-0 md:max-h-12 md:py-2.5 md:opacity-100'
            : 'max-h-12 py-2.5 opacity-100',
        ]"
        class="relative -mx-3 sm:mx-0 border-t border-zinc-800/80 overflow-hidden transition-all duration-200"
      >
        <!-- Fade + tombol kiri (desktop saja) -->
        <div
          v-if="canScrollLeft"
          class="hidden md:flex absolute left-0 top-0 bottom-0 z-10 items-center pr-8 bg-gradient-to-r from-black via-black/90 to-transparent"
        >
          <button
            @click="scrollNav('prev')"
            type="button"
            aria-label="Scroll kategori ke kiri"
            class="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 text-gray-200 hover:bg-zinc-800 hover:text-white flex items-center justify-center transition-colors"
          >
            &#10094;
          </button>
        </div>

        <nav
          ref="navRef"
          @scroll.passive="updateNavArrows"
          class="flex items-center gap-5 md:gap-6 px-3 sm:px-0 overflow-x-auto text-xs md:text-sm font-bold tracking-wider text-gray-300 no-scrollbar"
        >
          <router-link
            v-for="category in categories"
            :key="category.name"
            :to="category.href"
            :class="[
              category.isHighlight
                ? 'text-[#E25C38] font-bold'
                : 'hover:text-yellow-400',
              'whitespace-nowrap transition-colors',
            ]"
          >
            {{ category.name }}
          </router-link>
        </nav>

        <!-- Fade + tombol kanan (desktop saja) -->
        <div
          v-if="canScrollRight"
          class="hidden md:flex absolute right-0 top-0 bottom-0 z-10 items-center justify-end pl-8 bg-gradient-to-l from-black via-black/90 to-transparent"
        >
          <button
            @click="scrollNav('next')"
            type="button"
            aria-label="Scroll kategori ke kanan"
            class="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-700 text-gray-200 hover:bg-zinc-800 hover:text-white flex items-center justify-center transition-colors"
          >
            &#10095;
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Cart Drawer Component -->
  <CartDrawer
    :is-open="isCartOpen"
    @close="
      isCartOpen = false;
      fetchCartCount();
    "
  />
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
