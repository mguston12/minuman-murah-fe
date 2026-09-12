<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-extrabold text-gray-900">Alamat Saya</h1>

      <button
        @click="openAddAddressModal"
        class="px-4 py-2 bg-[#14120E] hover:bg-black text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm transition-colors"
      >
        + Tambah Alamat
      </button>
    </div>

    <div
      v-if="isLoading"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12 mt-4"
    >
      <p class="text-xs font-bold text-gray-500 animate-pulse">
        Memuat data alamat...
      </p>
    </div>

    <div v-else class="space-y-4 mt-4">
      <template v-if="addresses.length > 0">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-2"
        >
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-gray-900">
              {{ addr.label_place || "Alamat" }}
            </span>
            <span
              v-if="addr.is_primary"
              class="bg-[#FFF1EB] text-[#E25C38] text-[10px] font-bold px-2 py-0.5 rounded"
            >
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
            <button
              @click="openEditAddressModal(addr)"
              class="text-xs font-bold text-[#E25C38] hover:underline"
            >
              Ubah
            </button>
            <button
              @click="handleDeleteAddress(addr.id)"
              class="text-xs font-bold text-red-500 hover:underline"
            >
              Hapus
            </button>
          </div>
        </div>
      </template>

      <div
        v-else
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12"
      >
        <p class="text-xs text-gray-500 font-medium">
          Belum ada alamat tersimpan.
        </p>
      </div>
    </div>

    <!-- ==================== MODAL TAMBAH/EDIT ALAMAT ==================== -->
    <div
      v-if="isAddressModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto relative text-gray-900"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold">
            {{ isEditAddress ? "Ubah Alamat" : "Alamat Baru" }}
          </h3>
          <button
            @click="isAddressModalOpen = false"
            class="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="handleSaveAddress" class="space-y-4">
          <div>
            <label class="block text-xs font-bold mb-2">Tandai Sebagai:</label>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="label in labelOptions"
                :key="label"
                @click="addressForm.label_place = label"
                :class="[
                  'px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  addressForm.label_place === label
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ]"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1"
                >Nama Penerima *</label
              >
              <input
                type="text"
                v-model="addressForm.first_name"
                placeholder="Masukkan nama penerima"
                required
                class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1"
                >Nomor Hp Penerima *</label
              >
              <input
                type="text"
                v-model="addressForm.phone"
                placeholder="Contoh: 081234567890 atau +628"
                required
                class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1">Provinsi *</label>
              <select
                v-model="selectedProvinceId"
                @change="onProvinceChange"
                required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900"
              >
                <option :value="null" disabled>Pilih Provinsi</option>
                <option
                  v-for="prov in provinces"
                  :key="prov.id"
                  :value="prov.id"
                >
                  {{ prov.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1"
                >Kota/Kabupaten *</label
              >
              <select
                v-model="selectedCityId"
                @change="onCityChange"
                :disabled="!selectedProvinceId || isLoadingCities"
                required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option :value="null" disabled>Pilih Kota/Kab</option>
                <option v-for="city in cities" :key="city.id" :value="city.id">
                  {{ city.name }}
                </option>
              </select>
              <p
                v-if="!selectedProvinceId"
                class="text-[10px] text-gray-400 mt-1"
              >
                Pilih provinsi terlebih dahulu
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1">Kecamatan *</label>
              <select
                v-model="selectedDistrictId"
                @change="onDistrictChange"
                :disabled="!selectedCityId || isLoadingDistricts"
                required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option :value="null" disabled>Pilih Kecam...</option>
                <option
                  v-for="dist in districts"
                  :key="dist.id"
                  :value="dist.id"
                >
                  {{ dist.name }}
                </option>
              </select>
              <p v-if="!selectedCityId" class="text-[10px] text-gray-400 mt-1">
                Pilih kota/kabupaten terlebih dahulu
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold mb-1">Kelurahan *</label>
              <select
                v-model="selectedSubDistrictId"
                @change="onSubDistrictChange"
                :disabled="!selectedDistrictId || isLoadingSubDistricts"
                required
                class="w-full border border-gray-300 rounded-xl px-2.5 py-2 text-xs bg-white focus:outline-none focus:border-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option :value="null" disabled>Pilih Kelura...</option>
                <option
                  v-for="sub in subDistricts"
                  :key="sub.id"
                  :value="sub.id"
                >
                  {{ sub.name }}
                </option>
              </select>
              <p
                v-if="!selectedDistrictId"
                class="text-[10px] text-gray-400 mt-1"
              >
                Pilih kecamatan terlebih dahulu
              </p>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold mb-1">Kode Pos *</label>
            <input
              type="text"
              v-model="addressForm.postal_code"
              placeholder="Contoh: 40111"
              required
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-bold mb-1"
              >Alamat Lengkap dan Catatan untuk Kurir</label
            >
            <textarea
              v-model="addressForm.address"
              rows="3"
              placeholder="Masukkan nama jalan, gedung, lantai, nomor, RT/RW, dan catatan untuk kurir (contoh: warna rumah, no. apartemen)"
              required
              class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_primary"
              v-model="addressForm.is_primary"
              class="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <label
              for="is_primary"
              class="text-xs text-gray-700 font-medium cursor-pointer"
            >
              Jadikan Alamat Utama
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              @click="isAddressModalOpen = false"
              class="px-5 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-2 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl hover:bg-black transition-colors"
            >
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
import { addressService, shippingService } from "../../services/apiServices";

const isLoading = ref(true);
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

const fetchAddresses = async () => {
  isLoading.value = true;
  try {
    const res = await addressService.getAddresses();
    const rawAddresses = res.data?.data || [];
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
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAddresses);

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

  const prov = provinces.value.find(
    (item) => item.id === selectedProvinceId.value,
  );
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

  const d = districts.value.find(
    (item) => item.id === selectedDistrictId.value,
  );
  if (d) {
    addressForm.district_id = d.id;
    addressForm.district_label = d.name;
  }

  if (!selectedDistrictId.value) return;
  isLoadingSubDistricts.value = true;
  try {
    const res = await shippingService.getSubDistricts(
      selectedDistrictId.value,
    );
    subDistricts.value = res.data?.data || res.data || [];
  } catch (err) {
    console.error("Gagal mengambil kelurahan:", err);
  } finally {
    isLoadingSubDistricts.value = false;
  }
};

const onSubDistrictChange = () => {
  const sub = subDistricts.value.find(
    (item) => item.id === selectedSubDistrictId.value,
  );
  if (sub) {
    addressForm.sub_district_id = sub.id;
    addressForm.sub_district_label = sub.name;
  }
};

const resetAddressForm = () => {
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
};

const openAddAddressModal = async () => {
  isEditAddress.value = false;
  editingAddressId.value = null;
  resetAddressForm();
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
    await fetchAddresses();
  } catch (error) {
    console.error("Gagal menyimpan alamat:", error.response?.data || error);
    alert(error.response?.data?.message || "Gagal menyimpan alamat");
  }
};

const handleDeleteAddress = async (id) => {
  if (!confirm("Apakah Anda yakin ingin menghapus alamat ini?")) return;
  try {
    await addressService.deleteAddress(id);
    await fetchAddresses();
  } catch (error) {
    console.error("Gagal menghapus alamat:", error);
  }
};
</script>