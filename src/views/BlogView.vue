<script setup>
import { ref, computed } from "vue";

// Active Category Filter
const selectedCategory = ref("Semua");

// Categories List
const categories = ["Semua", "Tips", "Resep", "Review", "Promo"];

// Featured Article Data
const featuredArticle = ref({
  id: 1,
  category: "TIPS",
  title: "Panduan Menyimpan Wine & Whisky di Rumah",
  description:
    "Suhu, posisi botol, dan wadah yang tepat bikin minumanmu tetap segar lebih lama. Simak panduan lengkapnya di sini.",
  author: "Tim Redaksi",
  date: "18 Jun 2026",
  readTime: "5 menit baca",
  image:
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000",
});

// Latest Articles Data List
const articles = ref([
  {
    id: 2,
    category: "RESEP",
    title: "Resep Negroni Klasik ala Rumahan",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    category: "TIPS",
    title: "Cara Memilih Whisky Single Malt",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 4,
    category: "REVIEW",
    title: "Review 5 Red Wine Paling Laris Bulan Ini",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 5,
    category: "PROMO",
    title: "Promo 11.11: Diskon Bir & Wine 50%",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 6,
    category: "TIPS",
    title: "Cara Tepat Menyajikan Champagne",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 7,
    category: "RESEP",
    title: "3 Resep Cocktail Signature ala Bartender",
    date: "12 Jun 2026",
    readTime: "4 menit baca",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600",
  },
]);

// Computed property to filter articles based on selected category
const filteredArticles = computed(() => {
  if (selectedCategory.value === "Semua") {
    return articles.value;
  }
  return articles.value.filter(
    (art) =>
      art.category.toLowerCase() === selectedCategory.value.toLowerCase(),
  );
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF6F0] font-sans text-gray-900 pt-8 pb-16">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- 1. HEADER SECTION -->
      <section class="mb-6">
        <h1
          class="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight"
        >
          Blog Minuman Murah
        </h1>
        <p class="text-xs sm:text-sm text-gray-500 font-medium mt-1">
          Tips, resep, dan inspirasi seputar minuman favoritmu.
        </p>

        <!-- CATEGORY FILTERS -->
        <div class="flex flex-wrap items-center gap-2 mt-5">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200',
              selectedCategory === cat
                ? 'bg-[#E25C38] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100',
            ]"
          >
            {{ cat }}
          </button>
        </div>
      </section>

      <!-- 2. FEATURED ARTICLE CARD -->
      <section class="mb-12">
        <div
          class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-12 group hover:shadow-md transition-shadow duration-300"
        >
          <!-- IMAGE LEFT -->
          <div class="md:col-span-5 h-64 md:h-auto overflow-hidden relative">
            <img
              :src="featuredArticle.image"
              :alt="featuredArticle.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <!-- CONTENT RIGHT -->
          <div
            class="md:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-center"
          >
            <span
              class="text-[11px] font-extrabold tracking-wider text-[#E25C38] uppercase mb-2"
            >
              {{ featuredArticle.category }}
            </span>
            <h2
              class="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug group-hover:text-[#E25C38] transition-colors"
            >
              {{ featuredArticle.title }}
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 mt-3 leading-relaxed">
              {{ featuredArticle.description }}
            </p>

            <p class="text-[11px] text-gray-400 font-medium mt-6">
              Oleh {{ featuredArticle.author }} &bull;
              {{ featuredArticle.date }} &bull; {{ featuredArticle.readTime }}
            </p>

            <div class="mt-4">
              <router-link
                :to="`/blog/${featuredArticle.id}`"
                class="inline-flex items-center gap-1 text-xs font-extrabold text-[#E25C38] hover:gap-2 transition-all"
              >
                Baca Selengkapnya
                <span>&rarr;</span>
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. LATEST ARTICLES SECTION -->
      <section>
        <h2 class="text-lg sm:text-xl font-extrabold text-gray-900 mb-6">
          Artikel Terbaru
        </h2>

        <!-- ARTICLES GRID -->
        <div
          v-if="filteredArticles.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <router-link
            v-for="article in filteredArticles"
            :key="article.id"
            :to="`/blog/${article.id}`"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group hover:shadow-md transition-all duration-200"
          >
            <!-- CARD IMAGE -->
            <div
              class="w-full aspect-[16/9] overflow-hidden bg-gray-50 relative"
            >
              <img
                :src="article.image"
                :alt="article.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <!-- CARD CONTENT -->
            <div class="p-5 flex flex-col flex-grow justify-between">
              <div>
                <span
                  class="text-[10px] font-extrabold tracking-wider text-[#E25C38] uppercase"
                >
                  {{ article.category }}
                </span>
                <h3
                  class="text-sm font-extrabold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#E25C38] transition-colors leading-snug"
                >
                  {{ article.title }}
                </h3>
              </div>

              <p class="text-[10px] text-gray-400 font-medium mt-4">
                {{ article.date }} &bull; {{ article.readTime }}
              </p>
            </div>
          </router-link>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else
          class="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500 text-xs py-12"
        >
          Tidak ada artikel untuk kategori
          <strong>{{ selectedCategory }}</strong> saat ini.
        </div>
      </section>
    </div>
  </div>
</template>
