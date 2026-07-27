<script setup>
import { ref, computed } from "vue";

// --- STATE FILTER ---
const activeFilters = ref([
  { id: "cat-1", label: "Air Mineral" },
  { id: "cat-2", label: "Aqua 1L" },
  { id: "cat-3", label: "Diskon" },
]);

const filterSections = ref([
  {
    id: "kategori",
    name: "Kategori",
    open: true,
    options: [
      { id: "air-mineral", label: "Air Mineral", checked: true },
      { id: "soft-drink", label: "Soft Drink", checked: false },
      { id: "kopi", label: "Kopi", checked: false },
      { id: "teh", label: "Teh", checked: false },
      { id: "bir-wine", label: "Bir & Wine", checked: false },
    ],
  },
  { id: "brand", name: "Brand", open: false, options: [] },
  { id: "tipe", name: "Tipe Minuman", open: false, options: [] },
  { id: "rasa", name: "Rasa", open: false, options: [] },
  { id: "ukuran", name: "Ukuran", open: false, options: [] },
  { id: "harga", name: "Harga", open: false, options: [] },
]);

const sortBy = ref("Paling Sesuai");

const removeFilter = (index) => {
  activeFilters.value.splice(index, 1);
};

const clearAllFilters = () => {
  activeFilters.value = [];
};

// --- DUMMY PRODUCTS DATA ---
const products = ref([
  {
    id: 1,
    title: "Jägermeister 700ml",
    category: "LIQUEUR",
    price: 365000,
    badge: "Hemat 25%",
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "Glenfiddich 12 Years",
    category: "WHISKY",
    price: 725000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Hennessy XO 700ml",
    category: "COGNAC",
    price: 3145000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 4,
    title: "Casillero del Diablo",
    category: "WINE",
    price: 420000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 5,
    title: "Patrón Silver 750ml",
    category: "TEQUILA",
    price: 1250000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 6,
    title: "Johnnie Walker Red Label",
    category: "WHISKY",
    price: 385000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 7,
    title: "Smirnoff Vodka 700ml",
    category: "VODKA",
    price: 275000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 8,
    title: "Captain Morgan Spiced",
    category: "RUM",
    price: 288000,
    badge: "Hemat 25%",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 9,
    title: "Bombay Sapphire Gin",
    category: "GIN",
    price: 385000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 10,
    title: "Dom Pérignon 2013",
    category: "CHAMPAGNE",
    price: 4500000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 11,
    title: "Baileys Irish Cream",
    category: "LIQUEUR",
    price: 395000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 12,
    title: "Monkey Shoulder 700ml",
    category: "WHISKY",
    price: 685000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 13,
    title: "Chum Churum Soju",
    category: "SOJU",
    price: 45000,
    badge: "Hemat 15%",
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 14,
    title: "Absolut Vodka 750ml",
    category: "VODKA",
    price: 310000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 15,
    title: "Tanqueray Gin 750ml",
    category: "GIN",
    price: 420000,
    badge: "Hemat 20%",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 16,
    title: "Martell VSOP 700ml",
    category: "COGNAC",
    price: 1850000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400",
  },
]);

// Pagination State
const currentPage = ref(1);
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF6F0] py-6 px-4 sm:px-6 lg:px-8 font-sans text-gray-900"
  >
    <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      <!-- ==================== SIDEBAR FILTER ==================== -->
      <aside
        class="w-full lg:w-64 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 shrink-0"
      >
        <div
          class="flex items-center justify-between pb-3 border-b border-gray-100 mb-3"
        >
          <h2
            class="text-xs font-extrabold text-gray-900 tracking-wide uppercase"
          >
            Filter
          </h2>
          <button
            @click="clearAllFilters"
            class="text-[11px] text-[#E25C38] font-bold hover:underline"
          >
            Reset
          </button>
        </div>

        <!-- ACCORDION SECTIONS -->
        <div class="space-y-3">
          <div
            v-for="section in filterSections"
            :key="section.id"
            class="border-b border-gray-50 pb-3 last:border-none last:pb-0"
          >
            <!-- SECTION HEADER -->
            <button
              @click="section.open = !section.open"
              class="w-full flex items-center justify-between py-1 text-left"
            >
              <span class="text-xs font-bold text-gray-800">{{
                section.name
              }}</span>
              <svg
                class="w-3.5 h-3.5 text-gray-400 transition-transform duration-200"
                :class="section.open ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- SECTION CONTENT (CHECKBOXES) -->
            <div v-if="section.open" class="mt-2.5 space-y-2 pl-0.5">
              <label
                v-for="opt in section.options"
                :key="opt.id"
                class="flex items-center gap-2.5 cursor-pointer text-xs text-gray-600 hover:text-gray-900"
              >
                <input
                  type="checkbox"
                  v-model="opt.checked"
                  class="w-3.5 h-3.5 rounded border-gray-300 text-[#E25C38] focus:ring-0 cursor-pointer"
                />
                <span>{{ opt.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </aside>

      <!-- ==================== MAIN PRODUCT LIST ==================== -->
      <main class="flex-1 w-full space-y-4">
        <!-- HEADER TOP INFO & SORTING -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan <span class="font-bold text-gray-800">320</span> produk
            untuk <span class="font-bold text-gray-800">"Minuman"</span>
          </p>

          <div class="flex items-center gap-2 shrink-0">
            <span class="text-xs text-gray-500">Urutkan:</span>
            <select
              v-model="sortBy"
              class="text-xs font-bold bg-white border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#E25C38] cursor-pointer"
            >
              <option value="Paling Sesuai">Paling Sesuai</option>
              <option value="Harga Terendah">Harga Terendah</option>
              <option value="Harga Tertinggi">Harga Tertinggi</option>
              <option value="Terbaru">Terbaru</option>
            </select>
          </div>
        </div>

        <!-- FILTER PILLS / CHIPS -->
        <div
          v-if="activeFilters.length"
          class="flex flex-wrap items-center gap-2"
        >
          <div
            v-for="(filter, idx) in activeFilters"
            :key="filter.id"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E25C38]/30 bg-[#FFF8F6] text-[11px] font-bold text-[#E25C38]"
          >
            <span>{{ filter.label }}</span>
            <button @click="removeFilter(idx)" class="hover:opacity-75">
              ✕
            </button>
          </div>

          <button
            @click="clearAllFilters"
            class="w-6 h-6 rounded-full border border-gray-200 bg-white text-xs text-gray-400 flex items-center justify-center hover:bg-gray-50"
          >
            ✕
          </button>
        </div>

        <!-- PRODUCT GRID (4 COLUMNS) -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="product in products"
            :key="product.id"
            class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-200"
          >
            <div>
              <!-- IMAGE CONTAINER WITH BADGE -->
              <div
                class="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3"
              >
                <img
                  :src="product.image"
                  :alt="product.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <!-- PROMO BADGE -->
                <span
                  v-if="product.badge"
                  class="absolute top-2 left-2 bg-[#E25C38] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md"
                >
                  {{ product.badge }}
                </span>
              </div>

              <!-- CATEGORY & TITLE -->
              <span
                class="text-[9px] font-bold tracking-wider text-gray-400 uppercase"
              >
                {{ product.category }}
              </span>
              <h3
                class="text-xs font-bold text-gray-900 mt-0.5 line-clamp-1 group-hover:text-[#E25C38] transition-colors"
              >
                {{ product.title }}
              </h3>

              <!-- PRICE -->
              <p class="text-xs font-extrabold text-[#E25C38] mt-1">
                Rp {{ product.price.toLocaleString("id-ID") }}
              </p>
            </div>

            <!-- ACTION BUTTONS (Preview & Add to Cart) -->
            <div
              class="flex items-center gap-1.5 pt-3 mt-2 border-t border-gray-50"
            >
              <router-link
                :to="`/product/${product.id}`"
                class="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-black transition-colors"
                title="Lihat Detail"
              >
                <svg
                  class="w-3.5 h-3.5"
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
              </router-link>

              <button
                @click="$emit('add-to-cart', product)"
                class="p-1.5 rounded-lg bg-[#1C1A17] text-white hover:bg-black transition-colors flex items-center justify-center"
                title="Tambah ke Keranjang"
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
              </button>
            </div>
          </div>
        </div>

        <!-- PAGINATION -->
        <div class="flex items-center justify-center gap-2 pt-6">
          <button
            @click="currentPage = 1"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
              currentPage === 1
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            ]"
          >
            1
          </button>
          <button
            @click="currentPage = 2"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
              currentPage === 2
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            ]"
          >
            2
          </button>
          <button
            @click="currentPage = 3"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition-all',
              currentPage === 3
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            ]"
          >
            3
          </button>
          <button
            class="px-3 h-8 bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold transition-all"
          >
            Berikutnya ›
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
