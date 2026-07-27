<script setup>
import { ref } from "vue";

// --- Data Produk Dummy ---
const product = ref({
  id: 1,
  category: "WHISKY",
  title: "Glenfiddich 18 Year",
  rating: 4.8,
  reviewsCount: 128,
  price: 1450000,
  originalPrice: 1690000,
  sizes: ["350 ml", "750 ml", "1 L"],
  selectedSize: "750 ml",
  stockStatus: "Stok tersedia • Estimasi tiba hari ini",
  description:
    "Glenfiddich 18 Year adalah single malt Scotch whisky yang dimatangkan selama 18 tahun dalam tong sherry Oloroso dan bourbon Amerika. Kaya rasa apel pemanggang, oak, dan sentuhan madu. Nikmat neat, on the rocks, atau sebagai dasar koktail premium.",
  images: [
    "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=300",
    "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=300",
  ],
});

const selectedImage = ref(product.value.images[0]);
const quantity = ref(1);

const incrementQty = () => quantity.value++;
const decrementQty = () => {
  if (quantity.value > 1) quantity.value--;
};

// --- Mock Data Ulasan ---
const selectedFilter = ref("Semua");
const filterOptions = [
  "Semua",
  "5 Bintang",
  "4 Bintang",
  "3 Bintang",
  "2 Bintang",
  "1 Bintang",
];

const reviews = [
  {
    id: 1,
    name: "Andi Pratama",
    avatar: "https://i.pravatar.cc/100?img=12",
    date: "17 Jun 2026",
    rating: 5,
    comment:
      "Barangnya original, rasanya mantap! Pengiriman cepat dan dikemas sangat rapi. Sudah langganan di sini, nggak pernah kecewa. Pasti repeat order lagi.",
  },
  {
    id: 2,
    name: "Siti Nurhaliza",
    avatar: "https://i.pravatar.cc/100?img=47",
    date: "12 Jun 2026",
    rating: 5,
    comment:
      "Sesuai deskripsi, harga paling murah dibanding tempat lain. Recommended banget buat stok di rumah, pengiriman juga cepat!",
  },
  {
    id: 3,
    name: "Budi Hartono",
    avatar: "https://i.pravatar.cc/100?img=33",
    date: "4 Jun 2026",
    rating: 5,
    comment:
      "Pelayanan ramah dan packing aman. Cuma stok kadang cepat habis jadi harus sering cek. Overall sangat puas dengan kualitasnya.",
  },
];

// --- Mock Data Produk Serupa ---
const relatedProducts = [
  {
    id: 101,
    category: "WHISKY",
    name: "Glenfiddich 12 Years",
    price: 725000,
    badge: "Hemat 20%",
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 102,
    category: "COGNAC",
    name: "Hennessy XO 700ml",
    price: 3145000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 103,
    category: "VODKA",
    name: "Absolut Vodka 750ml",
    price: 295000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 104,
    category: "GIN",
    name: "Bombay Sapphire Gin",
    price: 385000,
    badge: "Hemat 20%",
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 105,
    category: "TEQUILA",
    name: "Patrón Silver 750ml",
    price: 1250000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400",
  },
];
</script>

<template>
  <div class="w-full bg-[#FAF6F0] min-h-screen py-6 text-gray-800 font-sans">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <!-- Breadcrumb Navigation -->
      <nav class="text-xs text-gray-500 flex items-center gap-2">
        <a href="#" class="hover:text-black">Beranda</a>
        <span>&rsaquo;</span>
        <a href="#" class="hover:text-black">Bir & Wine</a>
        <span>&rsaquo;</span>
        <span class="text-gray-900 font-medium truncate max-w-xs sm:max-w-md">
          {{ product.title }}
        </span>
      </nav>

      <!-- SECTION 1: Detail Utama Produk -->
      <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- Galeri Gambar (Sisi Kiri) -->
        <div class="space-y-3">
          <!-- Gambar Utama dengan Aspek Rasio Pas -->
          <div
            class="w-full max-h-[360px] aspect-[4/3] sm:aspect-[14/10] bg-gray-100 rounded-2xl overflow-hidden shadow-sm"
          >
            <img
              :src="selectedImage"
              :alt="product.title"
              class="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          <!-- 4 Thumbnail di Bawah -->
          <div class="grid grid-cols-4 gap-3">
            <button
              v-for="(img, idx) in product.images.slice(1, 5)"
              :key="idx"
              @click="selectedImage = img"
              :class="[
                'aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all',
                selectedImage === img
                  ? 'border-[#E25C38]'
                  : 'border-transparent hover:opacity-80',
              ]"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>

        <!-- Info & Action Produk (Sisi Kanan) -->
        <div class="space-y-4">
          <!-- Kategori & Judul -->
          <div>
            <span
              class="text-[11px] font-bold tracking-widest text-gray-400 uppercase"
            >
              {{ product.category }}
            </span>
            <h1
              class="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-0.5"
            >
              {{ product.title }}
            </h1>

            <!-- Rating & Review Count -->
            <div class="flex items-center gap-2 mt-1.5 text-xs">
              <div class="flex text-amber-400 text-xs gap-0.5">
                <span v-for="i in 5" :key="i">★</span>
              </div>
              <span class="font-bold text-gray-700">{{ product.rating }}</span>
              <span class="text-gray-300">&bull;</span>
              <span class="text-gray-400"
                >{{ product.reviewsCount }} ulasan</span
              >
            </div>
          </div>

          <!-- Pricing -->
          <div class="flex items-baseline gap-2.5 pt-1">
            <span class="text-2xl sm:text-3xl font-extrabold text-[#E25C38]">
              Rp {{ product.price.toLocaleString("id-ID") }}
            </span>
            <span
              v-if="product.originalPrice"
              class="text-xs sm:text-sm text-gray-400 line-through"
            >
              Rp {{ product.originalPrice.toLocaleString("id-ID") }}
            </span>
          </div>

          <!-- Pilih Ukuran -->
          <div class="space-y-1.5 pt-1">
            <label class="text-[11px] font-semibold text-gray-600 block"
              >Pilih Ukuran</label
            >
            <div class="flex flex-wrap gap-2">
              <button
                v-for="size in product.sizes"
                :key="size"
                @click="product.selectedSize = size"
                :class="[
                  'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all border',
                  product.selectedSize === size
                    ? 'bg-[#E25C38] text-white border-[#E25C38]'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
                ]"
              >
                {{ size }}
              </button>
            </div>
          </div>

          <!-- Jumlah Counter -->
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

          <!-- Tombol Aksi -->
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
            {{ product.stockStatus }}
          </p>

          <!-- Description -->
          <p class="text-[11px] text-gray-500 leading-relaxed pt-1">
            {{ product.description }}
          </p>
        </div>
      </section>

      <!-- SECTION 2: Ulasan Pembeli -->
      <section class="space-y-6 pt-6">
        <h2 class="text-lg font-bold text-gray-900">Ulasan Pembeli</h2>

        <!-- Box Summary Rating -->
        <div
          class="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm flex flex-col md:flex-row items-center gap-8"
        >
          <!-- Skor Utama -->
          <div
            class="text-center md:text-left space-y-1 md:pr-8 md:border-r border-gray-100"
          >
            <div class="text-4xl font-extrabold text-[#E25C38]">4.8</div>
            <p class="text-[11px] text-gray-400">dari 5.0</p>
            <div
              class="flex justify-center md:justify-start text-amber-400 text-sm"
            >
              ★★★★★
            </div>
            <p class="text-xs text-gray-600 font-medium mt-1">
              98% pembeli merasa puas
            </p>
            <p class="text-[10px] text-gray-400">128 ulasan</p>
          </div>

          <!-- Progress Bar Bintang -->
          <div class="flex-1 w-full space-y-2 text-xs">
            <div class="flex items-center gap-3">
              <!-- Diubah: tambahkan whitespace-nowrap dan flex items-center agar angka & bintang sejajar -->
              <span
                class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
              >
                5 <span class="text-amber-400">★</span>
              </span>
              <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-[#E25C38] h-full w-[85%] rounded-full"></div>
              </div>
              <span class="w-6 text-right text-gray-400 text-[11px]">112</span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
              >
                4 <span class="text-amber-400">★</span>
              </span>
              <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-[#E25C38] h-full w-[12%] rounded-full"></div>
              </div>
              <span class="w-6 text-right text-gray-400 text-[11px]">12</span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
              >
                3 <span class="text-amber-400">★</span>
              </span>
              <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-[#E25C38] h-full w-[3%] rounded-full"></div>
              </div>
              <span class="w-6 text-right text-gray-400 text-[11px]">3</span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
              >
                2 <span class="text-amber-400">★</span>
              </span>
              <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-[#E25C38] h-full w-[1%] rounded-full"></div>
              </div>
              <span class="w-6 text-right text-gray-400 text-[11px]">1</span>
            </div>

            <div class="flex items-center gap-3">
              <span
                class="w-8 text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap"
              >
                1 <span class="text-amber-400">★</span>
              </span>
              <div class="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div class="bg-[#E25C38] h-full w-[0%] rounded-full"></div>
              </div>
              <span class="w-6 text-right text-gray-400 text-[11px]">0</span>
            </div>
          </div>
        </div>

        <!-- Filter Tab Bintang -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
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

        <!-- List Cards Review -->
        <div class="space-y-3">
          <div
            v-for="review in reviews"
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

            <div class="text-amber-400 text-xs">
              <span v-for="n in review.rating" :key="n">★</span>
            </div>

            <p class="text-xs text-gray-600 leading-relaxed">
              {{ review.comment }}
            </p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="flex items-center justify-center gap-2 pt-4">
          <button
            class="w-8 h-8 rounded-lg bg-[#1C1A17] text-white font-bold text-xs"
          >
            1
          </button>
          <button
            class="w-8 h-8 rounded-lg bg-white text-gray-600 border border-gray-200 text-xs hover:bg-gray-50"
          >
            2
          </button>
          <button
            class="w-8 h-8 rounded-lg bg-white text-gray-600 border border-gray-200 text-xs hover:bg-gray-50"
          >
            3
          </button>
          <button
            class="w-8 h-8 rounded-lg bg-white text-gray-600 border border-gray-200 text-xs hover:bg-gray-50"
          >
            4
          </button>
          <button
            class="w-8 h-8 rounded-lg bg-white text-gray-600 border border-gray-200 text-xs hover:bg-gray-50"
          >
            5
          </button>
          <button
            class="w-8 h-8 rounded-lg bg-white text-gray-600 border border-gray-200 text-xs hover:bg-gray-50"
          >
            &rsaquo;
          </button>
        </div>
      </section>

      <!-- SECTION 3: Produk Serupa -->
      <section class="space-y-4 pt-6 pb-8">
        <h2 class="text-lg font-bold text-gray-900">Produk Serupa</h2>

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div
            v-for="item in relatedProducts"
            :key="item.id"
            class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <!-- Image container dengan badge -->
              <div class="relative aspect-square overflow-hidden bg-gray-50">
                <span
                  v-if="item.badge"
                  class="absolute top-2 left-2 z-10 bg-[#E25C38] text-white text-[9px] font-bold px-2 py-0.5 rounded-full"
                >
                  {{ item.badge }}
                </span>
                <img
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <!-- Product Info -->
              <div class="p-3">
                <span
                  class="text-[9px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5"
                >
                  {{ item.category }}
                </span>
                <h3
                  class="text-xs font-bold text-gray-800 line-clamp-1 group-hover:text-[#E25C38] transition-colors"
                >
                  {{ item.name }}
                </h3>
                <p class="text-xs font-extrabold text-[#E25C38] mt-1">
                  Rp {{ item.price.toLocaleString("id-ID") }}
                </p>
              </div>
            </div>

            <!-- Action buttons konsisten ukuran simetris -->
            <div class="px-3 pb-3 pt-1 flex items-center gap-2">
              <button
                class="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-black hover:bg-gray-50 transition-colors flex items-center justify-center"
                title="Detail Produk"
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

              <button
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
      </section>
    </div>
  </div>
</template>

<style scoped>
/* Utility menghapus scrollbar untuk tab filter */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
