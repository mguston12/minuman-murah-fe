<template>
  <div class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
    <!-- LOADING STATE CONTAINER -->
    <div v-if="isLoading" class="max-w-6xl mx-auto py-20 text-center">
      <p class="text-sm font-bold text-gray-500 animate-pulse">
        Memuat data pengguna...
      </p>
    </div>

    <!-- MAIN CONTENT CONTAINER -->
    <div v-else class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start">
      <!-- ==================== SIDEBAR USER ACCOUNT ==================== -->
      <aside class="w-full md:w-64 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 shrink-0">
        <!-- USER INFO HEADER -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <img :src="profile.avatar || 'https://via.placeholder.com/150'" :alt="profile.fullName"
            class="w-12 h-12 rounded-full object-cover border border-gray-200" />
          <div class="overflow-hidden">
            <h3 class="text-sm font-bold text-gray-900 truncate">
              {{ profile.fullName || "User" }}
            </h3>
            <p class="text-xs text-gray-400 truncate">{{ profile.email }}</p>
          </div>
        </div>

        <!-- NAVIGATION MENU -->
        <nav class="mt-4 space-y-1">
          <button @click="activeTab = 'profil'" :class="[
            'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
            activeTab === 'profil'
              ? 'text-[#E25C38] bg-[#FFF8F6]'
              : 'text-gray-700 hover:bg-gray-50',
          ]">
            Profil Saya
          </button>

          <button @click="activeTab = 'pesanan'" :class="[
            'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
            activeTab === 'pesanan'
              ? 'text-[#E25C38] bg-[#FFF8F6]'
              : 'text-gray-700 hover:bg-gray-50',
          ]">
            Pesanan Saya
          </button>

          <button @click="activeTab = 'alamat'" :class="[
            'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
            activeTab === 'alamat'
              ? 'text-[#E25C38] bg-[#FFF8F6]'
              : 'text-gray-700 hover:bg-gray-50',
          ]">
            Alamat
          </button>

          <button @click="activeTab = 'wishlist'" :class="[
            'w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors',
            activeTab === 'wishlist'
              ? 'text-[#E25C38] bg-[#FFF8F6]'
              : 'text-gray-700 hover:bg-gray-50',
          ]">
            Wishlist
          </button>

          <button @click="handleLogout"
            class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors pt-2">
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
            <template v-else-if="activeTab === 'pesanan'">Pesanan Saya</template>
            <template v-else-if="activeTab === 'wishlist'">Wishlist Saya</template>
          </h1>

          <!-- BUTTON TAMBAH ALAMAT -->
          <button v-if="activeTab === 'alamat'" @click="openAddAddressModal"
            class="px-4 py-2 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors">
            + Tambah Alamat
          </button>
        </div>

        <!-- TAB 1: PROFIL SAYA -->
        <div v-if="activeTab === 'profil'" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-sm font-bold text-gray-900 mb-5">Informasi Profil</h2>

          <form @submit.prevent="handleSaveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1">
                  Nama Lengkap
                </label>
                <input type="text" v-model="profile.fullName" required
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1">
                  Email
                </label>
                <input type="email" v-model="profile.email" required
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1">
                  No. Handphone
                </label>
                <input type="text" v-model="profile.phone"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all" />
              </div>

              <div>
                <label class="block text-[11px] font-bold text-gray-400 mb-1">
                  Tanggal Lahir
                </label>
                <input type="date" v-model="profile.birthDate"
                  class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all" />
              </div>
            </div>

            <div class="pt-2">
              <button type="submit" :disabled="isSaving"
                class="px-6 py-3 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50">
                {{ isSaving ? "Menyimpan..." : "Simpan Perubahan" }}
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: PESANAN SAYA -->
        <div v-if="activeTab === 'pesanan'" class="space-y-4">
          <template v-if="orders.length > 0">
            <div v-for="order in orders" :key="order.id"
              class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div class="flex items-center justify-between">
                <h3 class="text-xs font-extrabold text-gray-900">
                  Pesanan {{ order.id }}
                </h3>
                <span :class="[
                  'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                  order.statusColor || 'bg-gray-100 text-gray-700',
                ]">
                  {{ order.status }}
                </span>
              </div>

              <p class="text-[11px] text-gray-400 font-medium mt-1">
                Dipesan {{ order.date }}
              </p>

              <div class="mt-3 space-y-3">
                <div v-for="item in order.items" :key="item.id" class="flex items-center gap-3">
                  <img :src="item.image" :alt="item.title"
                    class="w-10 h-10 object-cover rounded-lg border border-gray-100 shrink-0" />
                  <span class="text-xs font-bold text-gray-800">
                    {{ item.title }} (x{{ item.quantity }})
                  </span>
                </div>
              </div>

              <div class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <p class="text-xs text-gray-900">
                  <span class="font-bold">
                    Total: Rp {{ order.totalPrice.toLocaleString("id-ID") }}
                  </span>
                </p>

                <button @click="handleReorder(order.items)"
                  class="px-5 py-2 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors">
                  Beli Lagi
                </button>
              </div>
            </div>
          </template>

          <div v-else class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <p class="text-xs text-gray-500 font-medium">
              Belum ada riwayat pesanan.
            </p>
          </div>
        </div>

        <!-- TAB 3: ALAMAT SAYA -->
        <div v-if="activeTab === 'alamat'" class="space-y-4">
          <template v-if="addresses.length > 0">
            <div v-for="addr in addresses" :key="addr.id"
              class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-900">
                  {{ addr.label_place || "Alamat" }}
                </span>
                <span v-if="addr.is_primary"
                  class="bg-[#FFF1EB] text-[#E25C38] text-[10px] font-bold px-2 py-0.5 rounded">
                  Utama
                </span>
              </div>

              <p class="text-xs text-gray-700 font-medium">
                <span class="font-bold">
                  {{ addr.first_name }} {{ addr.last_name || "" }}
                </span>
                &middot;
                {{ addr.phone }}
              </p>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ addr.fullAddress }}
              </p>

              <div class="flex items-center gap-3 pt-2">
                <button @click="openEditAddressModal(addr)" class="text-xs font-bold text-[#E25C38] hover:underline">
                  Ubah
                </button>
                <button @click="handleDeleteAddress(addr.id)" class="text-xs font-bold text-red-500 hover:underline">
                  Hapus
                </button>
              </div>
            </div>
          </template>

          <div v-else class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <p class="text-xs text-gray-500 font-medium">
              Belum ada alamat tersimpan.
            </p>
          </div>
        </div>

        <!-- TAB 4: WISHLIST SAYA -->
        <div v-if="activeTab === 'wishlist'">
          <div v-if="wishlist.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div v-for="item in wishlist" :key="item.id"
              class="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all duration-200">
              <div>
                <div class="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
                  <img :src="item.image" :alt="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span v-if="item.badge"
                    class="absolute top-2 left-2 bg-[#E25C38] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md">
                    {{ item.badge }}
                  </span>
                  <button @click="handleRemoveWishlist(item.id)"
                    class="absolute top-2 right-2 w-6 h-6 bg-white/80 hover:bg-white text-gray-600 rounded-full flex items-center justify-center text-xs shadow-sm transition-colors">
                    ✕
                  </button>
                </div>

                <span class="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                  {{ item.category }}
                </span>
                <h3
                  class="text-xs font-bold text-gray-900 mt-0.5 line-clamp-1 group-hover:text-[#E25C38] transition-colors">
                  {{ item.title }}
                </h3>
                <p class="text-xs font-extrabold text-[#E25C38] mt-1">
                  Rp {{ item.price.toLocaleString("id-ID") }}
                </p>
              </div>

              <div class="pt-3 mt-2 border-t border-gray-50 flex items-center justify-start gap-2">
                <router-link :to="`/product/${item.id}`"
                  class="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-black transition-colors">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </router-link>

                <button @click="handleAddToCart(item)"
                  class="p-1.5 rounded-lg bg-[#1C1A17] text-white hover:bg-black transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12">
            <p class="text-xs text-gray-500 font-medium">
              Belum ada produk favorit di wishlist.
            </p>
          </div>
        </div>
      </main>
    </div>

    <!-- ==================== MODAL TAMBAH/EDIT ALAMAT ==================== -->
    <div v-if="isAddressModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto relative text-gray-900">
        <!-- Header & Close Button -->
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold">
            {{ isEditAddress ? "Ubah Alamat" : "Alamat Baru" }}
          </h3>
          <button @click="isAddressModalOpen = false" class="text-gray-400 hover:text-gray-600 text-lg font-bold">
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSaveAddress" class="space-y-4">
          <!-- Tandai Sebagai -->
          <div>
            <label class="block text-xs font-bold mb-2">Tandai Sebagai:</label>
            <div class="flex flex-wrap gap-2">
              <button type="button" v-for="label in labelOptions" :key="label" @click="addressForm.label_place = label"
                :class="[
                  'px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  addressForm.label_place === label
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ]">
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Nama Penerima & No. HP -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Nama Penerima *</label>
              <input type="text" v-model="addressForm.first_name" placeholder="Masukkan nama penerima" required
                class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">Nomor Hp Penerima *</label>
              <input type="text" v-model="addressForm.phone" placeholder="Contoh: 081234567890 atau +628" required
                class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors" />
            </div>
          </div>

          <!-- Cascade Select Region (4 Kolom) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Provinsi -->
            <div>
              <label class="block text-xs font-bold mb-1">Provinsi *</label>
              <select v-model="selectedProvinceId" @change="onProvinceChange" required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900">
                <option :value="null" disabled>Pilih Provinsi</option>
                <option v-for="prov in provinces" :key="prov.id" :value="prov.id">
                  {{ prov.name }}
                </option>
              </select>
            </div>

            <!-- Kota / Kabupaten -->
            <div>
              <label class="block text-xs font-bold mb-1">Kota/Kabupaten *</label>
              <select v-model="selectedCityId" @change="onCityChange" :disabled="!selectedProvinceId || isLoadingCities"
                required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400">
                <option :value="null" disabled>Pilih Kota/Kab</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
              <p v-if="!selectedProvinceId" class="text-[10px] text-gray-400 mt-1">
                Pilih provinsi terlebih dahulu
              </p>
            </div>

            <!-- Kecamatan -->
            <div>
              <label class="block text-xs font-bold mb-1">Kecamatan *</label>
              <select v-model="selectedDistrictId" @change="onDistrictChange"
                :disabled="!selectedCityId || isLoadingDistricts" required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400">
                <option :value="null" disabled>Pilih Kecam...</option>
                <option v-for="dist in districts" :key="dist.id" :value="dist.id">
                  {{ dist.name }}
                </option>
              </select>
              <p v-if="!selectedCityId" class="text-[10px] text-gray-400 mt-1">
                Pilih kota/kabupaten terlebih dahulu
              </p>
            </div>

            <!-- Kelurahan / Sub-district -->
            <div>
              <label class="block text-xs font-bold mb-1">Kelurahan *</label>
              <select v-model="selectedSubDistrictId" @change="onSubDistrictChange"
                :disabled="!selectedDistrictId || isLoadingSubDistricts" required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400">
                <option :value="null" disabled>Pilih Kelura...</option>
                <option v-for="sub in subDistricts" :key="sub.id" :value="sub.id">
                  {{ sub.name }}
                </option>
              </select>
              <p v-if="!selectedDistrictId" class="text-[10px] text-gray-400 mt-1">
                Pilih kecamatan terlebih dahulu
              </p>
            </div>
          </div>

          <!-- Kode Pos -->
          <div>
            <label class="block text-xs font-bold mb-1">Kode Pos *</label>
            <input type="text" v-model="addressForm.postal_code" placeholder="Contoh: 40111" required
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors" />
          </div>

          <!-- Alamat Lengkap & Catatan -->
          <div>
            <label class="block text-xs font-bold mb-1">Alamat Lengkap dan Catatan untuk Kurir</label>
            <textarea v-model="addressForm.address" rows="3"
              placeholder="Masukkan nama jalan, gedung, lantai, nomor, RT/RW, dan catatan untuk kurir (contoh: warna rumah, no. apartemen)"
              required
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"></textarea>
          </div>

          <!-- Checkbox Utama -->
          <div class="flex items-center gap-2 pt-1">
            <input type="checkbox" id="is_primary" v-model="addressForm.is_primary"
              class="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
            <label for="is_primary" class="text-xs text-gray-700 font-medium cursor-pointer">
              Jadikan Alamat Utama
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2">
            <button type="button" @click="isAddressModalOpen = false"
              class="px-5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              Batal
            </button>
            <button type="submit"
              class="px-6 py-2 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl hover:bg-black transition-colors">
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  authService,
  addressService,
  shippingService,
  orderService,
  wishlistService,
} from "../services/apiServices";

const router = useRouter();

// State UI
const activeTab = ref("profil");
const isLoading = ref(true);
const isSaving = ref(false);

// State Profil
const profile = reactive({
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  avatar: "",
});

const orders = ref([]);
const wishlist = ref([]);
const addresses = ref([]);

// State Modal Alamat
const isAddressModalOpen = ref(false);
const isEditAddress = ref(false);
const editingAddressId = ref(null);
const labelOptions = ["Rumah", "Kantor", "Apartement", "Kost"];

// State Data Wilayah Dropdown
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const subDistricts = ref([]);

// State Tracking Selection (ID)
const selectedProvinceId = ref(null);
const selectedCityId = ref(null);
const selectedDistrictId = ref(null);
const selectedSubDistrictId = ref(null);

// Loading State Region
const isLoadingCities = ref(false);
const isLoadingDistricts = ref(false);
const isLoadingSubDistricts = ref(false);

const addressForm = reactive({
  label_place: "Rumah",
  first_name: "",
  last_name: null,
  phone: "",
  email: null,
  address: "",
  note_address: null,
  postal_code: "",
  is_primary: false,

  // Text labels & IDs payload
  province: "",
  province_id: null,
  province_label: "",
  city: "",
  city_id: null,
  city_label: "",
  district_id: null,
  district_label: "",
  sub_district_id: null,
  sub_district_label: "",
});

// Fetch Data User saat pertama di-load
const fetchUserData = async () => {
  isLoading.value = true;

  // 1. Fetch Profile User
  try {
    const resProfile = await authService.getMe();
    const user = resProfile.data?.data?.user || resProfile.data?.user || {};

    profile.fullName = user.name
      ? `${user.name} ${user.last_name || ""}`.trim()
      : "";
    profile.email = user.email || "";
    profile.phone = user.phone || "";
    profile.birthDate = user.dob || "";
    profile.avatar = user.avatar || "";
  } catch (error) {
    console.error("Gagal mengambil data profil:", error);
    if (error.response?.status === 401) {
      router.push("/login");
      return;
    }
  }

  // 2. Fetch Shipping Addresses
  try {
    const resAddresses = await addressService.getAddresses();
    const rawAddresses = resAddresses.data?.data || [];
    addresses.value = rawAddresses.map((addr) => ({
      ...addr,
      fullAddress: [
        addr.address,
        addr.sub_district_label,
        addr.district_label,
        addr.city_label || addr.city,
        addr.province_label || addr.province,
        addr.postal_code,
      ]
        .filter(Boolean)
        .join(", "),
    }));
  } catch (error) {
    console.error("Gagal mengambil data alamat:", error);
  }

  // 3. Fetch Orders
  try {
    const resOrders = await orderService.getOrders();
    const rawOrders =
      resOrders.data?.data?.orders || resOrders.data?.data || [];
    orders.value = rawOrders.map((order) => ({
      id: order.order_number || `#${order.id}`,
      status: order.status,
      statusColor: getOrderStatusColor(order.status),
      date: order.created_at
        ? new Date(order.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
        : "",
      totalPrice: order.total_amount || order.grand_total || 0,
      items: (order.order_items || order.items || []).map((item) => ({
        id: item.id,
        title: item.product_name || item.title,
        quantity: item.qty || item.quantity,
        image: item.featured_image?.path || item.image,
      })),
    }));
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
  }

  // 4. Fetch Wishlist
  try {
    const resWishlist = await wishlistService.getWishlist();
    const rawWishlist = resWishlist.data?.data || [];
    wishlist.value = rawWishlist.map((item) => ({
      id: item.id || item.product_id,
      title: item.name || item.title,
      category: item.category?.name || item.category || "PRODUK",
      price: item.price || 0,
      image: item.image || item.cover_url,
      badge: item.badge || null,
    }));
  } catch (error) {
    console.warn("Wishlist endpoint error atau belum tersedia:", error);
    wishlist.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchUserData();
});

// Helper Status Color
const getOrderStatusColor = (status) => {
  switch (status) {
    case "PAID":
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "PACKING":
    case "SHIPPED":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "CANCELLED":
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Fetch Region Handlers via shippingService
const fetchProvinces = async () => {
  try {
    const res = await shippingService.getProvinces();
    provinces.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Gagal mengambil provinsi:", err);
  }
};

const onProvinceChange = async () => {
  selectedCityId.value = null;
  selectedDistrictId.value = null;
  selectedSubDistrictId.value = null;
  cities.value = [];
  districts.value = [];
  subDistricts.value = [];

  const prov = provinces.value.find((item) => item.id === selectedProvinceId.value);
  if (prov) {
    addressForm.province_id = prov.id;
    addressForm.province = prov.name;
    addressForm.province_label = prov.name;
  }

  if (!selectedProvinceId.value) return;
  isLoadingCities.value = true;
  try {
    const res = await shippingService.getCities(selectedProvinceId.value);
    cities.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Gagal mengambil kota:", err);
  } finally {
    isLoadingCities.value = false;
  }
};

const onCityChange = async () => {
  selectedDistrictId.value = null;
  selectedSubDistrictId.value = null;
  districts.value = [];
  subDistricts.value = [];

  const c = cities.value.find((item) => item.id === selectedCityId.value);
  if (c) {
    addressForm.city_id = c.id;
    addressForm.city = c.name;
    addressForm.city_label = c.name;
  }

  if (!selectedCityId.value) return;
  isLoadingDistricts.value = true;
  try {
    const res = await shippingService.getDistricts(selectedCityId.value);
    districts.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Gagal mengambil kecamatan:", err);
  } finally {
    isLoadingDistricts.value = false;
  }
};

const onDistrictChange = async () => {
  selectedSubDistrictId.value = null;
  subDistricts.value = [];

  const d = districts.value.find((item) => item.id === selectedDistrictId.value);
  if (d) {
    addressForm.district_id = d.id;
    addressForm.district_label = d.name;
  }

  if (!selectedDistrictId.value) return;
  isLoadingSubDistricts.value = true;
  try {
    const res = await shippingService.getSubDistricts(selectedDistrictId.value);
    subDistricts.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Gagal mengambil kelurahan:", err);
  } finally {
    isLoadingSubDistricts.value = false;
  }
};

const onSubDistrictChange = () => {
  const sub = subDistricts.value.find(
    (item) => item.id === selectedSubDistrictId.value
  );
  if (sub) {
    addressForm.sub_district_id = sub.id;
    addressForm.sub_district_label = sub.name;
  }
};

// Actions & Handlers
const handleSaveProfile = async () => {
  isSaving.value = true;
  try {
    alert("Profil berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal menyimpan profil:", error);
  } finally {
    isSaving.value = false;
  }
};

const openAddAddressModal = async () => {
  isEditAddress.value = false;
  editingAddressId.value = null;

  Object.assign(addressForm, {
    label_place: "Rumah",
    first_name: "",
    last_name: null,
    phone: "",
    email: null,
    address: "",
    note_address: null,
    postal_code: "",
    is_primary: false,
    province: "",
    province_id: null,
    province_label: "",
    city: "",
    city_id: null,
    city_label: "",
    district_id: null,
    district_label: "",
    sub_district_id: null,
    sub_district_label: "",
  });

  selectedProvinceId.value = null;
  selectedCityId.value = null;
  selectedDistrictId.value = null;
  selectedSubDistrictId.value = null;

  isAddressModalOpen.value = true;
  await fetchProvinces();
};

const openEditAddressModal = async (addr) => {
  isEditAddress.value = true;
  editingAddressId.value = addr.id;

  Object.assign(addressForm, {
    label_place: addr.label_place || "Rumah",
    first_name: addr.first_name || "",
    last_name: addr.last_name || null,
    phone: addr.phone || "",
    email: addr.email || null,
    address: addr.address || "",
    note_address: addr.note_address || null,
    postal_code: addr.postal_code || "",
    is_primary: Boolean(addr.is_primary),
    province: addr.province || "",
    province_id: addr.province_id || null,
    province_label: addr.province_label || addr.province || "",
    city: addr.city || "",
    city_id: addr.city_id || null,
    city_label: addr.city_label || addr.city || "",
    district_id: addr.district_id || null,
    district_label: addr.district_label || "",
    sub_district_id: addr.sub_district_id || null,
    sub_district_label: addr.sub_district_label || "",
  });

  isAddressModalOpen.value = true;
  await fetchProvinces();

  if (addr.province_id) {
    selectedProvinceId.value = addr.province_id;
    await onProvinceChange();
  }
  if (addr.city_id) {
    selectedCityId.value = addr.city_id;
    await onCityChange();
  }
  if (addr.district_id) {
    selectedDistrictId.value = addr.district_id;
    await onDistrictChange();
  }
  if (addr.sub_district_id) {
    selectedSubDistrictId.value = addr.sub_district_id;
  }
};

const handleSaveAddress = async () => {
  try {
    const payload = {
      address: addressForm.address,
      city: addressForm.city,
      city_id: addressForm.city_id,
      city_label: addressForm.city_label,
      district_id: addressForm.district_id,
      district_label: addressForm.district_label,
      email: addressForm.email,
      first_name: addressForm.first_name,
      is_primary: Boolean(addressForm.is_primary),
      label_place: addressForm.label_place,
      last_name: addressForm.last_name,
      note_address: addressForm.note_address,
      phone: addressForm.phone,
      postal_code: addressForm.postal_code,
      province: addressForm.province,
      province_id: addressForm.province_id,
      province_label: addressForm.province_label,
      sub_district_id: addressForm.sub_district_id,
      sub_district_label: addressForm.sub_district_label,
    };

    if (isEditAddress.value) {
      await addressService.updateAddress(editingAddressId.value, payload);
    } else {
      await addressService.createAddress(payload);
    }

    isAddressModalOpen.value = false;
    await fetchUserData();
  } catch (error) {
    console.error("Gagal menyimpan alamat:", error.response?.data || error);
    alert(error.response?.data?.message || "Gagal menyimpan alamat");
  }
};

const handleDeleteAddress = async (id) => {
  if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;
  try {
    await addressService.deleteAddress(id);
    await fetchUserData();
  } catch (error) {
    console.error("Gagal menghapus alamat:", error);
  }
};

const handleRemoveWishlist = async (id) => {
  try {
    await wishlistService.removeFromWishlist(id);
    wishlist.value = wishlist.value.filter((item) => item.id !== id);
  } catch (error) {
    console.error("Gagal menghapus dari wishlist:", error);
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    router.push("/login");
  }
};
</script>

<style scoped></style>