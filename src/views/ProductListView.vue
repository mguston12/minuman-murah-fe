<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ProductCard from "../components/ProductCard.vue";
import {
  taxonomyService,
  brandService,
  attributeService,
  productService,
} from "../services/apiServices";

const priceMin = ref(null);
const priceMax = ref(null);
const sortBy = ref("Paling Sesuai");

const filterSections = ref([
  { id: "kategori", name: "Kategori", open: true, options: [] },
  { id: "brand", name: "Brand", open: true, options: [] },
  { id: "ukuran", name: "Ukuran", open: true, options: [] },
  { id: "harga", name: "Harga", open: true, options: [] },
]);

// --- COMPUTED ACTIVE FILTERS ---
const activeFiltersList = computed(() => {
  const list = [];

  // Checkbox Filters (Kategori, Brand, Ukuran)
  filterSections.value.forEach((section) => {
    if (section.options && section.options.length) {
      section.options.forEach((opt) => {
        if (opt.checked) {
          list.push({
            type: section.id,
            sectionName: section.name,
            id: opt.id,
            label: opt.label,
          });
        }
      });
    }
  });

  // Range Harga
  if (priceMin.value || priceMax.value) {
    let priceLabel = "Harga: ";
    if (priceMin.value && priceMax.value) {
      priceLabel += `Rp ${Number(priceMin.value).toLocaleString("id-ID")} - Rp ${Number(priceMax.value).toLocaleString("id-ID")}`;
    } else if (priceMin.value) {
      priceLabel += `>= Rp ${Number(priceMin.value).toLocaleString("id-ID")}`;
    } else if (priceMax.value) {
      priceLabel += `<= Rp ${Number(priceMax.value).toLocaleString("id-ID")}`;
    }

    list.push({
      type: "harga",
      sectionName: "Harga",
      id: "price_range",
      label: priceLabel,
    });
  }

  return list;
});

// --- STATE PRODUCTS & PAGINATION ---
const products = ref([]);
const isLoadingProducts = ref(false);
const productError = ref(null);

const currentPage = ref(1);
const perPage = ref(15);
const pagination = ref({
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15,
});

// --- LOADING & ERROR STATES SIDEBAR ---
const isLoadingCategories = ref(false);
const categoryError = ref(null);
const isLoadingBrands = ref(false);
const brandError = ref(null);
const isLoadingAttributes = ref(false);
const attributeError = ref(null);

// --- FETCH PRODUCTS API ---
const fetchProducts = async (page = 1) => {
  isLoadingProducts.value = true;
  productError.value = null;

  try {
    // 1. Handling Sorting Parameters
    let sortByParam = "created_at";
    let sortDir = "desc";

    if (sortBy.value === "Harga Terendah") {
      sortByParam = "price";
      sortDir = "asc";
    } else if (sortBy.value === "Harga Tertinggi") {
      sortByParam = "price";
      sortDir = "desc";
    }

    const params = {
      page: page,
      per_page: perPage.value,
      sort_by: sortByParam,
      sort_direction: sortDir,
    };

    const selectedCategories = filterSections.value
      .find((s) => s.id === "kategori")
      ?.options.filter((o) => o.checked)
      .map((o) => o.id);

    if (selectedCategories?.length) {
      params.category_id = selectedCategories.join(",");
      params.categories = selectedCategories.join(",");
    }

    // 3. Filter Brand
    const selectedBrands = filterSections.value
      .find((s) => s.id === "brand")
      ?.options.filter((o) => o.checked)
      .map((o) => o.id);

    if (selectedBrands?.length) {
      params.brand_id = selectedBrands.join(",");
      params.brands = selectedBrands.join(",");
    }

    // 4. Filter Ukuran (Attribute Value IDs)
    const selectedSizes = filterSections.value
      .find((s) => s.id === "ukuran")
      ?.options.filter((o) => o.checked)
      .map((o) => o.id);

    if (selectedSizes?.length) {
      params.attribute_value_ids = selectedSizes.join(",");
      params.attributes = selectedSizes.join(",");
    }

    // 5. Range Harga
    if (priceMin.value !== null && priceMin.value !== "") {
      params.min_price = priceMin.value;
    }
    if (priceMax.value !== null && priceMax.value !== "") {
      params.max_price = priceMax.value;
    }

    const response = await productService.getProducts(params);

    const resData = response?.data?.data || response?.data || response;

    if (resData && Array.isArray(resData.products)) {
      products.value = resData.products;
      if (resData.pagination) {
        pagination.value = resData.pagination;
        currentPage.value = resData.pagination.current_page || page;
      }
    } else if (Array.isArray(resData)) {
      products.value = resData;
    } else {
      products.value = [];
    }
  } catch (err) {
    console.error("Gagal mengambil data produk:", err);
    productError.value = "Gagal memuat produk.";
  } finally {
    isLoadingProducts.value = false;
  }
};

// --- FETCH CATEGORIES ---
const fetchCategoryTaxonomy = async () => {
  isLoadingCategories.value = true;
  categoryError.value = null;
  try {
    const response = await taxonomyService.getTaxoByType(2);
    const rawCategories =
      response?.data?.data?.taxo_lists || response?.data?.data || [];
    const categorySection = filterSections.value.find(
      (s) => s.id === "kategori",
    );
    if (categorySection) {
      categorySection.options = (
        Array.isArray(rawCategories) ? rawCategories : []
      ).map((item) => ({
        id: item.id,
        label: item.taxonomy_name || item.name,
        slug: item.taxonomy_slug || item.slug,
        checked: false,
      }));
    }
  } catch (err) {
    categoryError.value = "Gagal memuat kategori.";
  } finally {
    isLoadingCategories.value = false;
  }
};

// --- FETCH BRANDS ---
const fetchBrands = async () => {
  isLoadingBrands.value = true;
  brandError.value = null;
  try {
    const response = await brandService.getActiveBrands();
    const rawBrands =
      response?.data?.data?.brands || response?.data?.data || [];
    const brandSection = filterSections.value.find((s) => s.id === "brand");
    if (brandSection) {
      brandSection.options = (Array.isArray(rawBrands) ? rawBrands : []).map(
        (item) => ({
          id: item.id,
          label: item.name,
          slug: item.slug,
          checked: false,
        }),
      );
    }
  } catch (err) {
    brandError.value = "Gagal memuat brand.";
  } finally {
    isLoadingBrands.value = false;
  }
};

// --- FETCH ATTRIBUTES ---
const fetchAttributes = async () => {
  isLoadingAttributes.value = true;
  attributeError.value = null;
  try {
    const response = await attributeService.getActiveAttributes();
    const rawAttributes =
      response?.data?.data?.attributes || response?.data?.data || [];

    // Cari atribut ukuran yang cocok
    const sizeAttr = Array.isArray(rawAttributes)
      ? rawAttributes.find(
          (attr) =>
            attr.slug === "ukuran-botol" ||
            attr.name?.toLowerCase().includes("ukuran") ||
            attr.slug?.includes("ukuran"),
        )
      : null;

    const ukuranSection = filterSections.value.find((s) => s.id === "ukuran");
    const values = sizeAttr?.attribute_values || sizeAttr?.values || [];

    if (ukuranSection && values.length) {
      ukuranSection.options = values.map((val) => ({
        id: val.id,
        label: val.value || val.name,
        slug: val.slug,
        checked: false,
      }));
    } else if (ukuranSection) {
      ukuranSection.options = [];
    }
  } catch (err) {
    console.error("Error attributes:", err);
    attributeError.value = "Gagal memuat ukuran.";
  } finally {
    isLoadingAttributes.value = false;
  }
};

onMounted(() => {
  fetchCategoryTaxonomy();
  fetchBrands();
  fetchAttributes();
  fetchProducts(1);
});

// Watcher Sort
watch(sortBy, () => {
  fetchProducts(1);
});

// Watcher Price Min & Max (Debounced)
let priceTimeout = null;
watch([priceMin, priceMax], () => {
  clearTimeout(priceTimeout);
  priceTimeout = setTimeout(() => {
    fetchProducts(1);
  }, 400);
});

// Watcher Checkbox Filter
watch(
  filterSections,
  () => {
    fetchProducts(1);
  },
  { deep: true },
);

const changePage = (page) => {
  if (page >= 1 && page <= (pagination.value.last_page || 1)) {
    fetchProducts(page);
  }
};

// Hapus satu active filter
const removeActiveFilter = (item) => {
  if (item.type === "harga") {
    priceMin.value = null;
    priceMax.value = null;
  } else {
    const section = filterSections.value.find((s) => s.id === item.type);
    if (section) {
      const option = section.options.find((o) => o.id === item.id);
      if (option) option.checked = false;
    }
  }
};

// Hapus Semua Filter
const clearAllFilters = () => {
  priceMin.value = null;
  priceMax.value = null;
  filterSections.value.forEach((section) => {
    section.options?.forEach((opt) => {
      opt.checked = false;
    });
  });
};
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

        <div class="space-y-3">
          <div
            v-for="section in filterSections"
            :key="section.id"
            class="border-b border-gray-50 pb-3 last:border-none last:pb-0"
          >
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

            <div v-if="section.open" class="mt-2.5 pl-0.5">
              <!-- HARGA INPUT -->
              <div
                v-if="section.id === 'harga'"
                class="flex items-center gap-2"
              >
                <input
                  type="number"
                  v-model="priceMin"
                  placeholder="Min"
                  class="w-1/2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#E25C38]"
                />
                <input
                  type="number"
                  v-model="priceMax"
                  placeholder="Max"
                  class="w-1/2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#E25C38]"
                />
              </div>

              <!-- LOADERS -->
              <div
                v-else-if="section.id === 'kategori' && isLoadingCategories"
                class="text-[11px] text-gray-400 py-1"
              >
                Memuat kategori...
              </div>
              <div
                v-else-if="section.id === 'kategori' && categoryError"
                class="text-[11px] text-red-500 py-1"
              >
                {{ categoryError }}
              </div>

              <div
                v-else-if="section.id === 'brand' && isLoadingBrands"
                class="text-[11px] text-gray-400 py-1"
              >
                Memuat brand...
              </div>
              <div
                v-else-if="section.id === 'brand' && brandError"
                class="text-[11px] text-red-500 py-1"
              >
                {{ brandError }}
              </div>

              <div
                v-else-if="section.id === 'ukuran' && isLoadingAttributes"
                class="text-[11px] text-gray-400 py-1"
              >
                Memuat ukuran...
              </div>
              <div
                v-else-if="section.id === 'ukuran' && attributeError"
                class="text-[11px] text-red-500 py-1"
              >
                {{ attributeError }}
              </div>

              <!-- CHECKBOX -->
              <div v-else class="space-y-2 max-h-48 overflow-y-auto pr-1">
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
        </div>
      </aside>

      <main class="flex-1 w-full space-y-4">
        <!-- TOP INFO & SORTING -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100"
        >
          <p class="text-xs text-gray-500 font-medium">
            Menampilkan
            <span class="font-bold text-gray-800">{{
              pagination.total || products.length
            }}</span>
            produk
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
            </select>
          </div>
        </div>

        <!-- ACTIVE FILTERS BADGES (NEW) -->
        <div
          v-if="activeFiltersList.length"
          class="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
        >
          <span class="text-xs font-bold text-gray-400 mr-1"
            >Filter Aktif:</span
          >

          <div
            v-for="item in activeFiltersList"
            :key="item.type + '-' + item.id"
            class="inline-flex items-center gap-1.5 bg-orange-50 text-[#E25C38] border border-orange-200 px-2.5 py-1 rounded-lg text-xs font-semibold"
          >
            <span>{{ item.label }}</span>
            <button
              @click="removeActiveFilter(item)"
              class="hover:text-red-600 font-bold ml-0.5 focus:outline-none"
            >
              ✕
            </button>
          </div>

          <button
            @click="clearAllFilters"
            class="text-xs text-gray-500 hover:text-red-500 font-bold underline ml-auto"
          >
            Hapus Semua
          </button>
        </div>

        <!-- STATE LOADING / ERROR / EMPTY -->
        <div
          v-if="isLoadingProducts"
          class="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 shadow-sm"
        >
          Memuat produk...
        </div>
        <div
          v-else-if="productError"
          class="bg-white rounded-2xl p-12 text-center text-xs text-red-500 shadow-sm"
        >
          {{ productError }}
        </div>
        <div
          v-else-if="!products.length"
          class="bg-white rounded-2xl p-12 text-center text-xs text-gray-500 shadow-sm"
        >
          Tidak ada produk ditemukan.
        </div>

        <!-- PRODUCT GRID -->
        <div
          v-else
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- PAGINATION -->
        <div
          v-if="pagination.last_page > 1"
          class="flex items-center justify-center gap-2 pt-6"
        >
          <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 h-8 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            ‹ Sebelumnya
          </button>

          <button
            v-for="p in pagination.last_page"
            :key="p"
            @click="changePage(p)"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer',
              currentPage === p
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            ]"
          >
            {{ p }}
          </button>

          <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === pagination.last_page"
            class="px-3 h-8 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Berikutnya ›
          </button>
        </div>
      </main>
    </div>
  </div>
</template>
