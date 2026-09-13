<script setup>
import { ref, onMounted } from "vue";
import { brandService } from "../services/apiServices";

// --- STATE BRAND DARI API ---
const featuredBrands = ref([]);
const isLoadingBrands = ref(false);
const brandsError = ref(null);

const fetchFeaturedBrands = async () => {
  isLoadingBrands.value = true;
  brandsError.value = null;
  try {
    const response = await brandService.getActiveBrands();
    const resData = response?.data?.data;
    const rawBrands = resData?.brands || resData || [];

    featuredBrands.value = rawBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      category: brand.category || brand.taxonomy_name || "",
      image: brand.logo || brand.image,
    }));
  } catch (err) {
    console.error("Gagal mengambil data brand:", err);
    brandsError.value = "Gagal memuat brand pilihan.";
  } finally {
    isLoadingBrands.value = false;
  }
};

onMounted(() => {
  fetchFeaturedBrands();
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF6F0] font-sans text-gray-900 pb-16">
    <!-- 1. HERO BANNER IMAGE -->
    <div
      class="w-full h-[280px] sm:h-[360px] md:h-[420px] overflow-hidden relative"
    >
      <img
        src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1600"
        alt="Hero Minuman"
        class="w-full h-full object-cover object-center"
      />
    </div>

    <!-- 2. HEADER TENTANG KAMI -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-12 pb-12">
      <span
        class="text-[11px] sm:text-xs font-bold tracking-widest text-[#E25C38] uppercase"
      >
        Tentang Kami
      </span>
      <h1
        class="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 tracking-tight"
      >
        Minuman Murah
      </h1>
      <p
        class="text-xs sm:text-sm text-gray-500 max-w-2xl mx-auto mt-4 leading-relaxed"
      >
        To become the leader of the wine and spirits distributor in nation that
        excels in services, product ranges and competitive pricing and to
        educate the community to become attentive for wine and spirit culture
      </p>
    </section>

    <!-- 3. SECTION VISI & MISI -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <!-- GAMBAR FEATURING -->
        <div class="rounded-3xl overflow-hidden aspect-[4/3] shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
            alt="Suasana Cafe/Bar"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- TEKS VISI & MISI -->
        <div class="space-y-6 md:pl-4">
          <div>
            <h2 class="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
              Our Vision
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              To redefine wine and spirit culture and to become the most
              preferred distributor in Indonesia
            </p>
          </div>

          <div>
            <h2 class="text-base sm:text-lg font-bold text-gray-900 mb-1.5">
              Mission
            </h2>
            <p class="text-xs sm:text-sm text-gray-500 leading-relaxed">
              To become the leader of the wine and spirits distributor in nation
              that excels in services, product ranges and competitive pricing
              and to educate the community to become attentive for wine and
              spirit culture
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. SECTION BRAND KAMI -->
    <section class="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-8 text-center">
      <span
        class="text-[11px] sm:text-xs font-bold tracking-widest text-[#E25C38] uppercase"
      >
        Brand Kami
      </span>
      <h2
        class="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mt-2"
      >
        Rangkaian Brand untuk Beragam Kebutuhan
      </h2>
      <p class="text-xs sm:text-sm text-gray-500 mt-2 mb-8">
        Kami menghadirkan brand pilihan untuk setiap kategori minuman favoritmu.
      </p>

      <!-- LOADING STATE -->
      <div v-if="isLoadingBrands" class="text-xs text-gray-400 py-4">
        Memuat brand...
      </div>

      <!-- ERROR STATE -->
      <div v-else-if="brandsError" class="text-xs text-red-500 py-4">
        {{ brandsError }}
      </div>

      <!-- EMPTY STATE -->
      <div
        v-else-if="!featuredBrands.length"
        class="text-xs text-gray-400 py-4"
      >
        Belum ada brand yang tersedia.
      </div>

      <!-- BRAND CARDS GRID -->
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto"
      >
        <div
          v-for="brand in featuredBrands"
          :key="brand.id"
          class="bg-white rounded-2xl p-3.5 flex items-center gap-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 text-left"
        >
          <!-- AVATAR BRAND -->
          <img
            :src="brand.image"
            :alt="brand.name"
            class="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <!-- INFO BRAND -->
          <div>
            <h3 class="text-xs sm:text-sm font-bold text-gray-900">
              {{ brand.name }}
            </h3>
            <p
              v-if="brand.category"
              class="text-[10px] sm:text-xs text-gray-400 font-medium mt-0.5"
            >
              {{ brand.category }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
