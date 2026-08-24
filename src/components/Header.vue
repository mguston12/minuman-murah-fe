<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";
import logoMM from "../assets/logo-3.png";
import { useCartStore } from "../stores/cart";
import { useAuth } from "../composables/useAuth";
import CartDrawer from "./CartDrawer.vue";
import { taxonomyService } from "../services/apiServices"; 

const router = useRouter();
const searchQuery = ref("");
const isCartOpen = ref(false);
const isProfileMenuOpen = ref(false);
const profileDropdownRef = ref(null);

const { isLoggedIn, user, logout, setAuthData } = useAuth();

const categories = ref([]); 

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
    ];
  } catch (err) {
    console.error("Gagal memuat kategori navigasi:", err);
  }
};

const handleClickOutside = (event) => {
  if (
    profileDropdownRef.value &&
    !profileDropdownRef.value.contains(event.target)
  ) {
    isProfileMenuOpen.value = false;
  }
};

onMounted(() => {
  // Ambil token dan data user dari Cookie
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

  // Listener click outside
  document.addEventListener("click", handleClickOutside);

  // 3. Panggil API Kategori saat mounted
  fetchCategories();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const handleLogout = () => {
  isProfileMenuOpen.value = false;

  // Hapus cookie saat logout
  Cookies.remove("auth_token");
  Cookies.remove("auth_user");

  logout();

  window.location.href = "/";
};

// --- HANDLER SEARCH ---
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: "/products",
      query: { q: searchQuery.value.trim() },
    });
  }
};

const cartStore = useCartStore();
</script>

<template>
  <header
    class="w-full bg-black shadow-md border-b border-zinc-800 sticky top-0 z-40"
  >
    <!-- 1. Top Announcement Bar -->
    <div
      class="bg-[#E25C38] text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide"
    >
      Gratis ongkir untuk pembelian min. Rp100.000 &bull; Pesan sekarang, kirim
      hari ini!
    </div>

    <!-- 2. Main Navbar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4 py-2">
        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0 flex items-center h-full">
          <img
            :src="logoMM"
            alt="Minuman Murah Logo"
            class="h-10 md:h-12 w-auto object-contain brightness-110"
          />
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 max-w-xl mx-2 md:mx-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="Cari wine, whisky, bir, dan lainnya..."
              class="w-full bg-zinc-900 border border-zinc-800 text-sm text-gray-100 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-black transition-all placeholder-gray-500"
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
          </div>
        </div>

        <!-- Auth & Cart Action -->
        <div class="flex items-center gap-2 md:gap-3 text-sm flex-shrink-0">
          <!-- JIKA USER SUDAH LOGIN -->
          <div v-if="isLoggedIn" ref="profileDropdownRef" class="relative">
            <button
              @click="isProfileMenuOpen = !isProfileMenuOpen"
              type="button"
              class="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-yellow-400 font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>{{ user?.name || "Profil" }}</span>
            </button>

            <!-- Dropdown Menu Logout / Akun -->
            <div
              v-if="isProfileMenuOpen"
              class="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800 py-1 z-50 text-gray-200"
            >
              <router-link
                to="/account"
                @click="isProfileMenuOpen = false"
                class="block px-4 py-2 hover:bg-zinc-800 text-xs font-medium transition-colors"
              >
                Akun Saya
              </router-link>
              <button
                @click="handleLogout"
                type="button"
                class="w-full text-left px-4 py-2 hover:bg-red-950/40 text-red-400 text-xs font-medium border-t border-zinc-800 transition-colors"
              >
                Keluar (Logout)
              </button>
            </div>
          </div>

          <!-- JIKA USER BELUM LOGIN -->
          <template v-else>
            <router-link
              to="/login"
              class="text-gray-300 hover:text-white font-medium px-2 py-1 transition-colors"
            >
              Masuk
            </router-link>

            <router-link
              to="/register"
              class="bg-[#E25C38] hover:bg-[#c84c2a] text-white font-medium px-4 py-1.5 rounded-lg transition-colors shadow-sm"
            >
              Daftar
            </router-link>
          </template>

          <!-- Cart Button -->
          <button
            @click="isCartOpen = true"
            type="button"
            class="flex items-center gap-1.5 border border-zinc-700 bg-zinc-900/80 rounded-lg px-3 py-1.5 hover:bg-zinc-800 text-gray-200 hover:text-white font-medium ml-1 transition-colors relative"
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <span class="hidden sm:inline">Keranjang</span>

            <span
              v-if="cartStore.totalCount > 0"
              class="ml-1 bg-[#E25C38] text-white text-xs px-1.5 py-0.5 rounded-full font-bold"
            >
              {{ cartStore.totalCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- 3. Navigation Categories -->
      <nav
        class="flex items-center gap-6 py-2.5 overflow-x-auto border-t border-zinc-800/80 text-sm font-bold tracking-wider text-gray-300 no-scrollbar"
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
    </div>
  </header>

  <!-- 4. Cart Drawer Component -->
  <CartDrawer :is-open="isCartOpen" @close="isCartOpen = false" />
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
