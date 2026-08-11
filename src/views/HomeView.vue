<script setup>
import { ref } from "vue";
import ProductCard from "../components/ProductCard.vue";

// --- Data Dummy ---
const categories = [
  {
    name: "Wine",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150",
  },
  {
    name: "Champagne",
    image: "https://images.unsplash.com/photo-1594488669393-270ed116c21e?w=150",
  },
  {
    name: "Whisky",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=150",
  },
  {
    name: "Vodka",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=150",
  },
  {
    name: "Gin",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=150",
  },
  {
    name: "Rum",
    image: "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=150",
  },
  {
    name: "Tequila",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=150",
  },
  {
    name: "Beer",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=150",
  },
];

const topBrands = [
  {
    name: "Monkey Shoulder",
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400",
  },
  {
    name: "Hennessy",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400",
  },
  {
    name: "Baileys",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400",
  },
  {
    name: "Penfolds",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400",
  },
  {
    name: "Patron",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400",
  },
];

const popularProducts = ref([
  {
    id: 1,
    category: "LIQUEUR",
    name: "Jägermeister 700ml",
    price: 365000,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300",
  },
  {
    id: 2,
    category: "WHISKY",
    name: "Glenfiddich 12 Years",
    price: 725000,
    image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=300",
  },
  {
    id: 3,
    category: "COGNAC",
    name: "Hennessy XO 700ml",
    price: 3145000,
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=300",
  },
  {
    id: 4,
    category: "WINE",
    name: "Casillero del Diablo",
    price: 420000,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300",
  },
  {
    id: 5,
    category: "TEQUILA",
    name: "Patrón Silver 750ml",
    price: 1250000,
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=300",
  },
]);

const cheapProducts = ref([
  {
    id: 6,
    category: "SOJU",
    name: "Chum Churum Soju",
    price: 45000,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300",
  },
  {
    id: 7,
    category: "CHAMPAGNE",
    name: "Moët Impérial 750ml",
    price: 1150000,
    image: "https://images.unsplash.com/photo-1594488669393-270ed116c21e?w=300",
  },
  {
    id: 8,
    category: "LIQUEUR",
    name: "Baileys Irish Cream",
    price: 395000,
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300",
  },
  {
    id: 9,
    category: "WINE",
    name: "Penfolds Koonunga Hill",
    price: 480000,
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=300",
  },
  {
    id: 10,
    category: "COGNAC",
    name: "D'Ussé VSOP 750ml",
    price: 1050000,
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=300",
  },
]);

const handleAddToCart = (product) => {
  console.log("Add to cart:", product);
};

const handleQuickView = (product) => {
  console.log("Quick view:", product);
};
</script>

<template>
  <main
    class="bg-[#FBF7F1] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10"
  >
    <!-- 1. Hero Section -->
    <section
      class="bg-[#FAF3E0] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
    >
      <div class="max-w-md space-y-4 text-center md:text-left">
        <h1
          class="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight"
        >
          Minuman Dingin, Harga Selalu Murah
        </h1>
        <p class="text-xs md:text-sm text-gray-600 leading-relaxed">
          Ribuan pilihan minuman favorit, diskon hingga 50% untuk pesanan
          pertama kamu.
        </p>
        <router-link
          to="/products"
          class="bg-[#1C1A17] hover:bg-black text-yellow-300 px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors inline-block"
        >
          Belanja Sekarang
        </router-link>
      </div>

      <div
        class="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-sm"
      >
        <img
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800"
          alt="Minuman Dingin Banner"
          class="w-full h-full object-cover"
        />
      </div>
    </section>

    <!-- 2. Kategori Pilihan -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-900">Kategori Pilihan</h2>
        <router-link
          to="/products"
          class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
        >
          Lihat semua &rarr;
        </router-link>
      </div>

      <!-- Grid dengan Card Putih (Rounded) -->
      <div class="grid grid-cols-4 sm:grid-cols-8 gap-3">
        <router-link
          v-for="item in categories"
          :key="item.name"
          to="/products"
          class="bg-white rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <!-- Gambar Lingkaran -->
          <div
            class="mt-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0"
          >
            <img
              :src="item.image"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>

          <!-- Nama Kategori -->
          <span
            class="text-[11px] font-medium text-gray-700 text-center line-clamp-1 group-hover:text-[#E25C38] transition-colors"
          >
            {{ item.name }}
          </span>
        </router-link>
      </div>
    </section>

    <!-- 3. Top Brands -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-900">Top Brands</h2>
        <router-link
          to="/products"
          class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
        >
          Lihat semua &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <router-link
          v-for="brand in topBrands"
          :key="brand.name"
          to="/products"
          class="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-all"
        >
          <img
            :src="brand.image"
            :alt="brand.name"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </router-link>
      </div>
    </section>

    <!-- 4. Promo Banner Voucher -->
    <section
      class="bg-[#D4AF37] rounded-xl p-6 text-center text-black space-y-1 shadow-sm"
    >
      <div class="m-5">
        <h3 class="text-lg md:text-xl font-extrabold tracking-wide">
          Diskon 25% untuk Pengguna Baru
        </h3>
        <p class="mt-2 text-xs md:text-sm text-gray-800">
          Pakai kode
          <span>MURAH25</span> saat checkout pertamamu.
        </p>
      </div>
    </section>

    <!-- 5. Produk Terlaris -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-900">Produk Terlaris</h2>
        <router-link
          to="/products"
          class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
        >
          Lihat semua &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <ProductCard
          v-for="product in popularProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
          @quick-view="handleQuickView"
        />
      </div>
    </section>

    <!-- 6. Harga Murah -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-gray-900">Harga Murah</h2>
        <router-link
          to="/products"
          class="text-xs font-semibold text-[#E25C38] hover:underline flex items-center gap-1"
        >
          Lihat semua &rarr;
        </router-link>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <ProductCard
          v-for="product in cheapProducts"
          :key="product.id"
          :product="product"
          @add-to-cart="handleAddToCart"
          @quick-view="handleQuickView"
        />
      </div>
    </section>
  </main>
</template>