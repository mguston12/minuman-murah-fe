<script setup>
import { ref } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore(); // 2. Inisialisasi Store

// Handler Tambah ke Keranjang
const handleAddToCart = (item) => {
  cartStore.addToCart(item);
  // Opsional: beritahu user produk berhasil masuk keranjang
  alert(`${item.title} berhasil ditambahkan ke keranjang!`);
};
// --- STATE NAVIGASI TAB ---
const activeTab = ref("profil"); // Options: 'profil', 'pesanan', 'alamat', 'wishlist'

// --- STATE USER PROFILE ---
const profile = ref({
  fullName: "Budi Santoso",
  email: "budi@email.com",
  phone: "0812-3456-7890",
  birthDate: "12 Agustus 1995",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
});

// --- STATE ALAMAT ---
const addresses = ref([
  {
    id: 1,
    label: "Rumah",
    isPrimary: true,
    recipient: "Budi Santoso",
    phone: "0812-3456-7890",
    fullAddress:
      "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150",
  },
  {
    id: 2,
    label: "Kantor",
    isPrimary: false,
    recipient: "Budi Santoso",
    phone: "0812-3456-7890",
    fullAddress:
      "Jl. Sudirman Kav. 45, Setiabudi, Jakarta Selatan, DKI Jakarta 12930",
  },
]);

// --- MOCK DATA: PESANAN SAYA ---
const orders = ref([
  {
    id: "INV/20260715/MP/0019283",
    date: "15 Juli 2026",
    status: "Selesai",
    statusColor: "bg-green-100 text-green-700",
    totalPrice: 1090000,
    items: [
      {
        id: 1,
        title: "Glenfiddich 12 Years 700ml",
        category: "WHISKY",
        quantity: 1,
        price: 725000,
        image:
          "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200",
      },
      {
        id: 2,
        title: "Jägermeister 700ml",
        category: "LIQUEUR",
        quantity: 1,
        price: 365000,
        image:
          "https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=200",
      },
    ],
  },
  {
    id: "INV/20260722/MP/0020411",
    date: "22 Juli 2026",
    status: "Dalam Pengiriman",
    statusColor: "bg-blue-100 text-blue-700",
    totalPrice: 4500000,
    items: [
      {
        id: 3,
        title: "Dom Pérignon Vintage 2013",
        category: "CHAMPAGNE",
        quantity: 1,
        price: 4500000,
        image:
          "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=200",
      },
    ],
  },
]);

// --- MOCK DATA: WISHLIST SAYA ---
const wishlist = ref([
  {
    id: 101,
    title: "Hennessy XO 700ml",
    category: "COGNAC",
    price: 3145000,
    badge: null,
    image:
      "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 102,
    title: "Patrón Silver 750ml",
    category: "TEQUILA",
    price: 1250000,
    badge: "Hemat 10%",
    image:
      "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 103,
    title: "Tanqueray London Dry Gin 750ml",
    category: "GIN",
    price: 420000,
    badge: "Hemat 20%",
    image:
      "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=400",
  },
]);

// --- HANDLERS ---
const handleSaveProfile = () => {
  alert("Profil berhasil diperbarui!");
};

const handleRemoveWishlist = (id) => {
  wishlist.value = wishlist.value.filter((item) => item.id !== id);
};

const handleLogout = () => {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    alert("Berhasil keluar.");
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900"
  >
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start">
      <!-- ==================== SIDEBAR USER ACCOUNT ==================== -->
      <aside
        class="w-full md:w-64 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 shrink-0"
      >
        <!-- USER INFO HEADER -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <img
            :src="profile.avatar"
            :alt="profile.fullName"
            class="w-12 h-12 rounded-full object-cover border border-gray-200"
          />
          <div class="overflow-hidden">
            <h3 class="text-sm font-bold text-gray-900 truncate">
              {{ profile.fullName }}
            </h3>
            <p class="text-xs text-gray-400 truncate">{{ profile.email }}</p>
          </div>
        </div>

        <!-- NAVIGATION MENU -->
        <nav class="mt-4 space-y-1">
          <button
            @click="activeTab = 'profil'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              activeTab === 'profil'
                ? 'text-[#E25C38] bg-[#FFF8F6]'
                : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            Profil Saya
          </button>

          <button
            @click="activeTab = 'pesanan'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              activeTab === 'pesanan'
                ? 'text-[#E25C38] bg-[#FFF8F6]'
                : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            Pesanan Saya
          </button>

          <button
            @click="activeTab = 'alamat'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              activeTab === 'alamat'
                ? 'text-[#E25C38] bg-[#FFF8F6]'
                : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            Alamat
          </button>

          <button
            @click="activeTab = 'wishlist'"
            :class="[
              'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
              activeTab === 'wishlist'
                ? 'text-[#E25C38] bg-[#FFF8F6]'
                : 'text-gray-700 hover:bg-gray-50',
            ]"
          >
            Wishlist
          </button>

          <button
            @click="handleLogout"
            class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors pt-2"
          >
            Keluar
          </button>
        </nav>
      </aside>

      <!-- ==================== MAIN CONTENT AREA ==================== -->
      <main class="flex-1 w-full space-y-4">
        <!-- PAGE TITLE HEADER -->
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-extrabold text-gray-900">
            <template v-if="activeTab === 'profil'">Akun Saya</template>
            <template v-else-if="activeTab === 'alamat'">Alamat Saya</template>
            <template v-else-if="activeTab === 'pesanan'"
              >Pesanan Saya</template
            >
            <template v-else-if="activeTab === 'wishlist'"
              >Wishlist Saya</template
            >
          </h1>

          <!-- BUTTON TAMBAH ALAMAT (Only on Alamat tab) -->
          <button
            v-if="activeTab === 'alamat'"
            class="px-4 py-2 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            + Tambah Alamat
          </button>
        </div>

        <!-- TAB 1: PROFIL SAYA -->
        <div
          v-if="activeTab === 'profil'"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 class="text-sm font-bold text-gray-900 mb-5">Informasi Profil</h2>

          <form @submit.prevent="handleSaveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- NAMA LENGKAP -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1"
                  >Nama Lengkap</label
                >
                <input
                  type="text"
                  v-model="profile.fullName"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
                />
              </div>

              <!-- EMAIL -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1"
                  >Email</label
                >
                <input
                  type="email"
                  v-model="profile.email"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
                />
              </div>

              <!-- NO HANDPHONE -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1"
                  >No. Handphone</label
                >
                <input
                  type="text"
                  v-model="profile.phone"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
                />
              </div>

              <!-- TANGGAL LAHIR -->
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1"
                  >Tanggal Lahir</label
                >
                <input
                  type="text"
                  v-model="profile.birthDate"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
                />
              </div>
            </div>

            <!-- BUTTON SIMPAN -->
            <div class="pt-2">
              <button
                type="submit"
                class="px-6 py-3 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>

        <!-- TAB: PESANAN SAYA -->
        <div v-if="activeTab === 'pesanan'" class="space-y-4">
          <div
            v-for="order in orders"
            :key="order.id"
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between"
          >
            <!-- HEADER PESANAN (Judul + Badge Status) -->
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold text-gray-900">
                Pesanan {{ order.id }}
              </h3>
              <span
                :class="[
                  'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                  order.statusClass,
                ]"
              >
                {{ order.status }}
              </span>
            </div>

            <!-- TANGGAL DIPESAN -->
            <p class="text-[11px] text-gray-400 font-medium mt-1">
              Dipesan {{ order.date }}
            </p>

            <!-- LIST PRODUK -->
            <div class="mt-3 space-y-3">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center gap-3"
              >
                <img
                  :src="item.image"
                  :alt="item.title"
                  class="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0"
                />
                <span class="text-xs font-bold text-gray-800">
                  {{ item.title }}
                </span>
              </div>
            </div>

            <!-- FOOTER PESANAN (Total + Tombol Beli Lagi) -->
            <div
              class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between"
            >
              <p class="text-xs text-gray-900">
                <span class="font-bold"
                  >Total: Rp
                  {{ order.totalPrice.toLocaleString("id-ID") }}</span
                >
              </p>

              <button
                class="px-5 py-2 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                Beli Lagi
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 3: ALAMAT SAYA -->
        <div v-if="activeTab === 'alamat'" class="space-y-4">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2"
          >
            <!-- HEADER ALAMAT -->
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-gray-900">{{
                addr.label
              }}</span>
              <span
                v-if="addr.isPrimary"
                class="bg-[#FFF1EB] text-[#E25C38] text-[10px] font-bold px-2 py-0.5 rounded"
              >
                Utama
              </span>
            </div>

            <!-- DETAIL ALAMAT -->
            <p class="text-xs text-gray-700 font-medium">
              <span class="font-bold">{{ addr.recipient }}</span> &middot;
              {{ addr.phone }}
            </p>
            <p class="text-xs text-gray-500 leading-relaxed">
              {{ addr.fullAddress }}
            </p>

            <!-- ACTION LINKS -->
            <div class="flex items-center gap-3 pt-2">
              <button class="text-xs font-bold text-[#E25C38] hover:underline">
                Ubah
              </button>
              <button class="text-xs font-bold text-red-500 hover:underline">
                Hapus
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 4: WISHLIST SAYA -->
        <div v-if="activeTab === 'wishlist'">
          <div
            v-if="wishlist.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <div
              v-for="item in wishlist"
              :key="item.id"
              class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-200"
            >
              <div>
                <!-- IMAGE CONTAINER WITH BADGE & REMOVE BUTTON -->
                <div
                  class="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3"
                >
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  <span
                    v-if="item.badge"
                    class="absolute top-2 left-2 bg-[#E25C38] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md"
                  >
                    {{ item.badge }}
                  </span>

                  <!-- TOMBOL HAPUS DARI WISHLIST -->
                  <button
                    @click="handleRemoveWishlist(item.id)"
                    class="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white text-gray-600 rounded-full flex items-center justify-center text-xs shadow-sm transition-colors"
                    title="Hapus dari Wishlist"
                  >
                    ✕
                  </button>
                </div>

                <!-- CATEGORY & TITLE -->
                <span
                  class="text-[9px] font-bold tracking-wider text-gray-400 uppercase"
                >
                  {{ item.category }}
                </span>
                <h3
                  class="text-xs font-bold text-gray-900 mt-0.5 line-clamp-1 group-hover:text-[#E25C38] transition-colors"
                >
                  {{ item.title }}
                </h3>

                <!-- PRICE -->
                <p class="text-xs font-extrabold text-[#E25C38] mt-1">
                  Rp {{ item.price.toLocaleString("id-ID") }}
                </p>
              </div>

              <!-- ACTION BUTTON -->
              <div
                class="pt-3 mt-2 border-t border-gray-50 flex items-center justify-start gap-2"
              >
                <router-link
                  :to="`/product/${item.id}`"
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
                  @click="handleAddToCart(item)"
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

          <!-- IF WISHLIST EMPTY -->
          <div
            v-else
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12"
          >
            <p class="text-xs text-gray-500 font-medium">
              Belum ada produk favorit di wishlist.
            </p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
