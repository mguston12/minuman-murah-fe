<template>
  <div class="bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900 min-h-screen">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 items-start">
      <!-- ==================== SIDEBAR USER ACCOUNT ==================== -->
      <aside
        class="w-full md:w-64 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 shrink-0"
      >
        <!-- USER INFO HEADER -->
        <div class="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div class="overflow-hidden">
            <h3 class="text-sm font-bold text-gray-900 truncate">
              {{ sidebarUser.fullName || "User" }}
            </h3>
            <p class="text-xs text-gray-400 truncate">{{ sidebarUser.email }}</p>
          </div>
        </div>

        <!-- NAVIGATION MENU -->
        <nav class="mt-4 space-y-1">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.name"
            :to="{ name: tab.name }"
            class="block w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors"
            :class="
              isActive(tab.name)
                ? 'text-[#E25C38] bg-[#FFF8F6]'
                : 'text-gray-700 hover:bg-gray-50'
            "
          >
            {{ tab.label }}
          </RouterLink>

          <button
            @click="isLogoutModalOpen = true"
            class="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors pt-2"
          >
            Keluar
          </button>
        </nav>
      </aside>

      <!-- ==================== MAIN CONTENT AREA (diisi oleh masing-masing sub-halaman) ==================== -->
      <main class="flex-1 w-full space-y-4">
        <RouterView />
      </main>
    </div>

    <!-- ==================== MODAL KONFIRMASI LOGOUT ==================== -->
    <div
      v-if="isLogoutModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 relative text-gray-900 text-center"
      >
        <h3 class="text-base font-extrabold text-gray-900">
          Konfirmasi Keluar
        </h3>
        <p class="text-xs text-gray-500">
          Apakah Anda yakin ingin keluar dari akun ini?
        </p>

        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            @click="isLogoutModalOpen = false"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmLogout"
            class="flex-1 px-4 py-2.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authService } from "../services/apiServices";
import { useAuth } from "../composables/useAuth";

const route = useRoute();
const router = useRouter();
const { logout } = useAuth();

const tabs = [
  { name: "account-profile", label: "Profil Saya" },
  { name: "account-orders", label: "Pesanan Saya" },
  { name: "account-address", label: "Alamat" },
  { name: "account-wishlist", label: "Wishlist" },
];

const isActive = (name) => route.name === name;

// Info ringkas untuk header sidebar (nama & email).
// Sengaja fetch terpisah dari ProfileView supaya AccountLayout tetap mandiri
// dan bisa langsung menampilkan nama user begitu masuk ke sub-halaman manapun.
const sidebarUser = reactive({ fullName: "", email: "" });

const fetchSidebarUser = async () => {
  try {
    const res = await authService.getMe();
    const user = res.data?.data?.user || res.data?.user || {};
    sidebarUser.fullName = user.name
      ? `${user.name} ${user.last_name || ""}`.trim()
      : "";
    sidebarUser.email = user.email || "";
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    if (error.response?.status === 401) {
      router.push("/login");
    }
  }
};

onMounted(fetchSidebarUser);

const isLogoutModalOpen = ref(false);

const confirmLogout = async () => {
  try {
    isLogoutModalOpen.value = false;
    await logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    router.push("/login");
  }
};
</script>