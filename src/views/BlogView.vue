<script setup>
import { ref, watch, onMounted } from "vue";
import api from "../api/axios";

const loading = ref(true);
const selectedCategory = ref("Semua");
const categories = ref(["Semua"]);

const featuredArticle = ref(null);
const articles = ref([]);
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
});

// 1. Fetch List Categories dari Backend
const fetchCategories = async () => {
  try {
    const response = await api.get("/category-blogs/active");
    const activeCategories = response.data.data.map((cat) => cat.name);
    categories.value = ["Semua", ...activeCategories];
  } catch (error) {
    console.error("Gagal mengambil kategori:", error);
  }
};

// 2. Fetch Blog List dengan Filter Kategori & Pagination
const fetchArticles = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      page: page,
      per_page: 6,
      status: 1,
    };

    // Filter kategori jika bukan "Semua"
    if (selectedCategory.value !== "Semua") {
      params.category_name = selectedCategory.value;
    }

    const response = await api.get("/blogs/filter", { params });

    const resBlogs = response.data.data?.blogs || [];
    const resPagination = response.data.data?.pagination || {};

    // Map data artikel
    const formattedData = resBlogs.map((item) => ({
      id: item.id,
      slug: item.slug,
      category: item.category?.name || "UMUM",
      title: item.title,
      description: item.short_desc,
      date: new Date(item.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      readTime: "3 menit baca",
      image: item.cover
        ? `http://localhost:8000/storage/${item.cover}`
        : "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=1000",
    }));

    // Pisahkan item pertama sebagai Featured Article jika di halaman pertama
    if (page === 1 && formattedData.length > 0) {
      featuredArticle.value = formattedData[0];
      articles.value = formattedData.slice(1);
    } else {
      featuredArticle.value = null; // Reset featured jika bukan page 1 / data kosong
      articles.value = formattedData;
    }

    // 🔴 DAHULU: resData.current_page
    // 🟢 UBAH MENJADI: resPagination.current_page
    pagination.value = {
      currentPage: resPagination.current_page || 1,
      lastPage: resPagination.last_page || 1,
    };
  } catch (error) {
    console.error("Gagal mengambil daftar artikel:", error);
  } finally {
    loading.value = false;
  }
};

watch(selectedCategory, () => {
  fetchArticles(1);
});

onMounted(() => {
  fetchCategories();
  fetchArticles(1);
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

      <!-- SKELETON / LOADING STATE -->
      <div v-if="loading" class="text-center py-12 text-gray-500 text-sm">
        Memuat artikel...
      </div>

      <template v-else>
        <!-- 2. FEATURED ARTICLE CARD -->
        <section v-if="featuredArticle" class="mb-12">
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
                {{ featuredArticle.date }} &bull; {{ featuredArticle.readTime }}
              </p>

              <div class="mt-4">
                <router-link
                  :to="`/blog/${featuredArticle.slug}`"
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
            v-if="articles.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <router-link
              v-for="article in articles"
              :key="article.id"
              :to="`/blog/${article.slug}`"
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
            v-else-if="!featuredArticle"
            class="bg-white rounded-2xl p-8 text-center border border-gray-100 text-gray-500 text-xs py-12"
          >
            Tidak ada artikel untuk kategori
            <strong>{{ selectedCategory }}</strong> saat ini.
          </div>

          <!-- PAGINATION CONTROL -->
          <div
            v-if="pagination.lastPage > 1"
            class="flex justify-center items-center gap-2 mt-8"
          >
            <button
              :disabled="pagination.currentPage === 1"
              @click="fetchArticles(pagination.currentPage - 1)"
              class="px-3 py-1 bg-white border text-xs font-bold rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span class="text-xs text-gray-600 font-medium">
              {{ pagination.currentPage }} / {{ pagination.lastPage }}
            </span>
            <button
              :disabled="pagination.currentPage === pagination.lastPage"
              @click="fetchArticles(pagination.currentPage + 1)"
              class="px-3 py-1 bg-white border text-xs font-bold rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
