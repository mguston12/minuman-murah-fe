<script setup>
import { ref } from "vue";
import logoMM from "../assets/logo-2.png";
import { useCartStore } from "../stores/cart";
import CartDrawer from "./CartDrawer.vue"; // 1. Import komponen CartDrawer

const searchQuery = ref("");
const isCartOpen = ref(false); // 2. State untuk mengontrol buka/tutup drawer

const categories = [
  { name: "Promo", href: "#", isHighlight: true },
  { name: "Wine", href: "#" },
  { name: "Whisky", href: "#" },
  { name: "Vodka", href: "#" },
  { name: "Gin", href: "#" },
  { name: "Rum", href: "#" },
  { name: "Cognac", href: "#" },
  { name: "Beer", href: "#" },
];

// Inisialisasi Cart Store Pinia
const cartStore = useCartStore();
</script>

<template>
  <header
    class="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40"
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
            class="h-10 md:h-12 w-auto object-contain"
          />
        </router-link>

        <!-- Search Bar -->
        <div class="flex-1 max-w-xl mx-2 md:mx-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari wine, whisky, bir, dan lainnya..."
              class="w-full bg-gray-100/80 text-sm text-gray-800 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-[#E25C38]/50 focus:bg-white transition-all placeholder-gray-400"
            />
            <button
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
          <a
            href="#"
            class="text-gray-700 hover:text-black font-medium px-2 py-1"
          >
            Masuk
          </a>
          <a
            href="#"
            class="bg-[#1C1A17] hover:bg-black text-yellow-300 font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Daftar
          </a>

          <!-- Cart Button (Mengontrol Drawer, bukan Pindah Halaman) -->
          <button
            @click="isCartOpen = true"
            type="button"
            class="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 text-gray-700 font-medium ml-1 transition-colors relative"
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
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span class="hidden sm:inline">Keranjang</span>

            <!-- BADGE CART REAKTIF -->
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
        class="flex items-center gap-6 py-2.5 overflow-x-auto border-t border-gray-100 text-xs font-semibold tracking-wider text-gray-600 no-scrollbar"
      >
        <a
          v-for="category in categories"
          :key="category.name"
          :href="category.href"
          :class="[
            category.isHighlight
              ? 'text-[#E25C38] font-bold'
              : 'hover:text-black',
            'whitespace-nowrap transition-colors',
          ]"
        >
          {{ category.name }}
        </a>
      </nav>
    </div>
  </header>

  <!-- 4. Panggil Cart Drawer Component -->
  <CartDrawer :is-open="isCartOpen" @close="isCartOpen = false" />
</template>
