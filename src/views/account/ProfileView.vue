<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-extrabold text-gray-900">Akun Saya</h1>
    </div>

    <div
      v-if="isLoading"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12 mt-4"
    >
      <p class="text-xs font-bold text-gray-500 animate-pulse">
        Memuat data profil...
      </p>
    </div>

    <div
      v-else
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-4"
    >
      <h2 class="text-sm font-bold text-gray-900 mb-5">Informasi Profil</h2>

      <form @submit.prevent="handleSaveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-gray-400 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              v-model="profile.fullName"
              required
              class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              v-model="profile.email"
              required
              class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 mb-1">
              No. Handphone
            </label>
            <input
              type="text"
              v-model="profile.phone"
              class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-gray-400 mb-1">
              Tanggal Lahir
            </label>
            <input
              type="date"
              v-model="profile.birthDate"
              class="w-full bg-[#F4F4F4] border border-transparent focus:border-gray-300 focus:bg-white text-xs font-medium text-gray-800 rounded-xl px-4 py-3 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div class="pt-2">
          <button
            type="submit"
            :disabled="isSaving"
            class="px-6 py-3 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {{ isSaving ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { authService } from "../../services/apiServices";

const router = useRouter();

const isLoading = ref(true);
const isSaving = ref(false);

const profile = reactive({
  fullName: "",
  email: "",
  phone: "",
  birthDate: "",
  avatar: "",
});

const fetchProfile = async () => {
  isLoading.value = true;
  try {
    const res = await authService.getMe();
    const user = res.data?.data?.user || res.data?.user || {};
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
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProfile);

const handleSaveProfile = async () => {
  isSaving.value = true;
  try {
    // TODO: panggil authService.updateProfile(profile) saat endpoint tersedia
    alert("Profil berhasil diperbarui!");
  } catch (error) {
    console.error("Gagal menyimpan profil:", error);
  } finally {
    isSaving.value = false;
  }
};
</script>
