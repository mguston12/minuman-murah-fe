<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../api/axios";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const error = ref(false);
const article = ref(null);
const relatedArticles = ref([]);

// 1. Fetch Detail Artikel berdasarkan Slug
const fetchBlogDetail = async (slug) => {
  if (!slug) return;

  loading.value = true;
  error.value = false;

  try {
    const response = await api.get(`/blogs/slug/${slug}`);

    // Debugging: Cek isi response dari backend di Console Browser
    console.log("Response Full:", response);
    console.log("Data Blog:", response.data?.data);

    const item = response.data.data?.blog || response.data?.data;

    if (!item) {
      console.warn("Item blog tidak ditemukan dalam response!");
      error.value = true;
      return;
    }

    article.value = {
      id: item.id,
      title: item.title,
      category: item.category?.name || "UMUM",
      author: item.author || "Tim Redaksi",
      date: item.created_at
        ? new Date(item.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-",
      readTime: "3 menit baca",
      featuredImage: item.cover
        ? `http://localhost:8000/storage/${item.cover}`
        : "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1200&auto=format&fit=crop",
      intro: item.short_desc || "",
      content: item.long_desc || item.short_desc || "",
    };

    fetchRelatedArticles(slug);
  } catch (err) {
    console.error("Gagal memuat detail artikel (Catch Error):", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

// 2. Fetch Artikel Lainnya (Related Posts)
const fetchRelatedArticles = async (currentSlug) => {
  try {
    const response = await api.get("/blogs/filter", {
      params: { page: 1, per_page: 4, status: 1 },
    });

    const resBlogs = response.data.data?.blogs || [];

    // Filter agar artikel yang sedang dibuka tidak muncul di list
    relatedArticles.value = resBlogs
      .filter((b) => b.slug !== currentSlug)
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        category: b.category?.name || "UMUM",
        date: b.created_at
          ? new Date(b.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "-",
        image: b.cover
          ? `http://localhost:8000/storage/${b.cover}`
          : "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=300&auto=format&fit=crop",
      }));
  } catch (err) {
    console.error("Gagal memuat artikel terkait:", err);
  }
};

// Watcher dengan { immediate: true } untuk eksekusi saat pertama kali komponen di-mount / di-refresh
watch(
  () => route.params.slug,
  (newSlug) => {
    if (newSlug) {
      fetchBlogDetail(newSlug);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF8F5] text-[#1A1A1A] font-sans py-8 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-3xl mx-auto">
      <!-- 1. BREADCRUMBS -->
      <nav
        class="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium"
      >
        <router-link to="/" class="hover:text-gray-700 transition-colors"
          >Beranda</router-link
        >
        <span>&rsaquo;</span>
        <router-link to="/blog" class="hover:text-gray-700 transition-colors"
          >Blog</router-link
        >
        <template v-if="article">
          <span>&rsaquo;</span>
          <span class="text-gray-500 truncate max-w-[150px] sm:max-w-none">{{
            article.title
          }}</span>
        </template>
      </nav>

      <!-- SKELETON / LOADING STATE -->
      <div v-if="loading" class="text-center py-20 text-gray-400 text-sm">
        Memuat artikel...
      </div>

      <!-- ERROR / NOT FOUND STATE -->
      <div
        v-else-if="error || !article"
        class="bg-white rounded-2xl p-8 text-center border border-gray-100 my-8 shadow-sm"
      >
        <h2 class="text-lg font-bold text-gray-800">Artikel Tidak Ditemukan</h2>
        <p class="text-xs text-gray-500 mt-1">
          Artikel yang kamu cari mungkin sudah dihapus atau dipindahkan.
        </p>
        <router-link
          to="/blog"
          class="inline-block mt-4 px-4 py-2 bg-[#E25C38] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#c84d2d] transition-colors"
        >
          Kembali ke Blog
        </router-link>
      </div>

      <!-- MAIN ARTICLE CONTENT -->
      <template v-else>
        <!-- 2. ARTICLE HEADER -->
        <header class="mb-6">
          <span
            class="text-[11px] font-extrabold text-[#E25C38] tracking-wider uppercase block mb-2"
          >
            {{ article.category }}
          </span>

          <h1
            class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1C1A17] leading-tight mb-4"
          >
            {{ article.title }}
          </h1>

          <div
            class="flex items-center gap-2 text-xs text-gray-400 font-medium"
          >
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

        <!-- 4. ARTICLE CONTENT (Render HTML dari WYSIWYG) -->
        <article
          class="prose prose-stone max-w-none text-sm sm:text-base text-gray-700 leading-relaxed space-y-4 [&_p]:mb-4 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#1C1A17] [&_h2]:mt-6 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
        >
          <div v-html="article.content"></div>
        </article>

        <!-- 5. SHARE SECTION -->
        <div class="mt-12 pt-6 border-t border-gray-200/60">
          <p class="text-xs font-bold text-gray-800 mb-2">
            Bagikan artikel ini
          </p>
          <div
            class="flex items-center gap-4 text-xs font-semibold text-[#E25C38]"
          >
            <a href="#" class="hover:underline">Instagram</a>
            <a href="#" class="hover:underline">TikTok</a>
            <a href="#" class="hover:underline">Facebook</a>
            <a href="#" class="hover:underline">X</a>
          </div>
        </div>

        <!-- 6. RELATED ARTICLES SECTION -->
        <section
          v-if="relatedArticles.length > 0"
          class="mt-12 pt-8 border-t border-gray-200/60"
        >
          <h2 class="text-lg font-extrabold text-[#1C1A17] mb-6">
            Artikel Lainnya
          </h2>

          <div class="space-y-3">
            <router-link
              v-for="item in relatedArticles"
              :key="item.id"
              :to="`/blog/${item.slug}`"
              class="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <img
                :src="item.image"
                :alt="item.title"
                class="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 text-[10px] font-bold">
                  <span class="text-gray-400 uppercase tracking-wider">{{
                    item.category
                  }}</span>
                  <span class="text-gray-300">&bull;</span>
                  <span class="text-gray-400 font-normal">{{ item.date }}</span>
                </div>
                <h3
                  class="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#E25C38] transition-colors truncate"
                >
                  {{ item.title }}
                </h3>
              </div>
            </router-link>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
