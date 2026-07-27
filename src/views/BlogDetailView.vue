<script setup>
import { ref } from "vue";

// Sample Data Artikel Detail
const article = ref({
  id: 1,
  title: "Mengenal Single Malt Whisky untuk Pemula",
  category: "TIPS",
  author: "Tim Redaksi",
  date: "18 Jun 2026",
  readTime: "5 menit baca",
  featuredImage:
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
  intro:
    "Minuman favoritmu bisa cepat kehilangan rasa dan kesegarannya kalau disimpan sembarangan. Mulai dari suhu penyimpanan, posisi botol, hingga jenis wadah — semuanya berpengaruh besar terhadap kualitas minuman yang kamu konsumsi setiap hari.",
  contentSections: [
    {
      title: "1. Jaga Suhu Penyimpanan",
      text: "Simpan minuman bersoda dan jus di kulkas pada suhu 2–4°C. Hindari menaruhnya di pintu kulkas karena suhunya lebih fluktuatif setiap kali pintu dibuka dan ditutup.",
    },
    {
      title: "2. Perhatikan Posisi Botol",
      text: "Botol kaca sebaiknya disimpan berdiri tegak agar tekanan dan karbonasi tetap terjaga. Untuk wine, posisi miring justru lebih dianjurkan supaya gabus tetap lembap dan kedap udara.",
    },
  ],
});

// Sample Data Artikel Lainnya (Related Posts)
const relatedArticles = ref([
  {
    id: 2,
    title: "Negroni: Cocktail Klasik yang Tak Lekang",
    category: "TIPS",
    date: "12 Jun 2026",
    image:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Tips Food Pairing dengan Red Wine",
    category: "REVIEW",
    date: "10 Jun 2026",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "Sejarah Singkat Scotch Whisky",
    category: "RESEP",
    date: "8 Jun 2026",
    image:
      "https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=300&auto=format&fit=crop",
  },
]);
</script>

<template>
  <!-- Main Container dengan Background Warm Cream khas Minuman Murah -->
  <div class="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      
      <!-- 1. BREADCRUMBS -->
      <nav class="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
        <router-link to="/" class="hover:text-gray-700 transition-colors">Beranda</router-link>
        <span>&rsaquo;</span>
        <router-link to="/blog" class="hover:text-gray-700 transition-colors">Blog</router-link>
        <span>&rsaquo;</span>
        <span class="text-gray-500">Tips</span>
      </nav>

      <!-- 2. ARTICLE HEADER -->
      <header class="mb-6">
        <!-- Category Tag -->
        <span class="text-[11px] font-extrabold text-[#E25C38] tracking-wider uppercase block mb-2">
          {{ article.category }}
        </span>

        <!-- Title -->
        <h1 class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1A17] leading-tight mb-4">
          {{ article.title }}
        </h1>

        <!-- Author & Meta Info -->
        <div class="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>Oleh {{ article.author }}</span>
          <span>&bull;</span>
          <span>{{ article.date }}</span>
          <span>&bull;</span>
          <span>{{ article.readTime }}</span>
        </div>
      </header>

      <!-- 3. FEATURED IMAGE -->
      <div class="mb-8 rounded-2xl overflow-hidden shadow-sm bg-gray-100">
        <img
          :src="article.featuredImage"
          :alt="article.title"
          class="w-full h-[280px] sm:h-[380px] object-cover"
        />
      </div>

      <!-- 4. ARTICLE CONTENT -->
      <article class="prose prose-stone max-w-none space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
        <!-- Intro Paragraph -->
        <p class="font-normal text-gray-600">
          {{ article.intro }}
        </p>

        <!-- Dynamic Sections -->
        <div v-for="(section, index) in article.contentSections" :key="index" class="space-y-2 pt-2">
          <h2 class="text-base sm:text-lg font-bold text-[#1C1A17]">
            {{ section.title }}
          </h2>
          <p class="text-gray-600">
            {{ section.text }}
          </p>
        </div>
      </article>

      <!-- 5. SHARE SECTION -->
      <div class="mt-12 pt-6 border-t border-gray-200/60">
        <p class="text-xs font-bold text-gray-800 mb-2">Bagikan artikel ini</p>
        <div class="flex items-center gap-4 text-xs font-semibold text-[#E25C38]">
          <a href="#" class="hover:underline">Instagram</a>
          <a href="#" class="hover:underline">TikTok</a>
          <a href="#" class="hover:underline">Facebook</a>
          <a href="#" class="hover:underline">X</a>
        </div>
      </div>

      <!-- 6. RELATED ARTICLES SECTION -->
      <section class="mt-12 pt-8 border-t border-gray-200/60">
        <h2 class="text-lg font-extrabold text-[#1C1A17] mb-6">
          Artikel Lainnya
        </h2>

        <div class="space-y-3">
          <router-link
            v-for="item in relatedArticles"
            :key="item.id"
            :to="`/blog/${item.id}`"
            class="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <!-- Thumbnail Image -->
            <img
              :src="item.image"
              :alt="item.title"
              class="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0"
            />

            <!-- Card Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 text-[10px] font-bold">
                <span class="text-gray-400 uppercase tracking-wider">{{ item.category }}</span>
                <span class="text-gray-300">&bull;</span>
                <span class="text-gray-400 font-normal">{{ item.date }}</span>
              </div>
              <h3 class="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#E25C38] transition-colors truncate">
                {{ item.title }}
              </h3>
            </div>
          </router-link>
        </div>
      </section>

    </div>
  </div>
</template>