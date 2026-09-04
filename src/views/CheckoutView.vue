<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";
import {
  authService,
  addressService,
  shippingService,
  orderService,
  voucherService,
  publicConfigService,
} from "../services/apiServices";

const router = useRouter();
const cartStore = useCartStore();

// --- STATE USER & ADDRESS ---
const userData = ref(null);
const isLoadingUser = ref(false);

const addresses = ref([]);
const isLoadingAddresses = ref(false);
const activeAddressId = ref(null);
const tempSelectedAddressId = ref(null);
const showSelectModal = ref(false);

// --- STATE MODAL TAMBAH ALAMAT ---
const showAddModal = ref(false);
const isSavingAddress = ref(false);
const labelOptions = ["Rumah", "Kantor", "Apartement", "Kost"];

// Options Wilayah
const provinces = ref([]);
const cities = ref([]);
const districts = ref([]);
const subDistricts = ref([]);

const selectedProvinceId = ref(null);
const selectedCityId = ref(null);
const selectedDistrictId = ref(null);
const selectedSubDistrictId = ref(null);

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

// --- STATE ONGKIR & KURIR ---
const shippingFee = ref(0);
const selectedCourier = ref(null);
const courierOptions = ref([]);
const isLoadingOngkir = ref(false);
const showCourierModal = ref(false);

// --- STATE PRODUCT PROTECTION ---
const isProtectionEnabled = ref(false);
const protectionConfig = ref({
  fee: 0,
  description: "Melindungi barang dari kerusakan & kehilangan.",
});

// --- STATE VOUCHER ---
const applicableVouchers = ref([]);
const selectedVoucher = ref(null);
const isLoadingVouchers = ref(false);
const showVoucherModal = ref(false);

// --- STATE PAYMENT ---
const isProcessingPayment = ref(false);

// --- COMPUTED PROPERTIES ---
const subtotal = computed(() => cartStore.totalPrice);

const selectedAddress = computed(() => {
  return (
    addresses.value.find((a) => a.id === activeAddressId.value) ||
    addresses.value[0] ||
    null
  );
});

const discount = computed(() => {
  if (!selectedVoucher.value) return 0;
  const v = selectedVoucher.value;
  if (v.discount_type === "percentage" || v.type === "percentage") {
    const calc = (subtotal.value * (v.discount_amount || v.value)) / 100;
    return v.max_discount ? Math.min(calc, v.max_discount) : calc;
  }
  return v.discount_amount || v.value || 0;
});

const protectionFee = computed(() => {
  return isProtectionEnabled.value
    ? (protectionConfig.value.fee * subtotal.value) / 100
    : 0;
});

const total = computed(() => {
  if (cartStore.items.length === 0) return 0;
  return Math.max(
    0,
    subtotal.value + shippingFee.value + protectionFee.value - discount.value,
  );
});

// --- API FETCHERS WILAYAH VIA SERVICE ---
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
    (item) => item.id === selectedSubDistrictId.value,
  );
  if (sub) {
    addressForm.sub_district_id = sub.id;
    addressForm.sub_district_label = sub.name;
  }
};

// --- API FETCHERS (USER & ADDRESS) ---
const fetchUserProfile = async () => {
  isLoadingUser.value = true;
  try {
    const res = await authService.getMe();
    userData.value = res.data?.data?.user || res.data?.user || null;
  } catch (err) {
    console.error("Gagal mengambil profil user:", err);
  } finally {
    isLoadingUser.value = false;
  }
};

const fetchAddresses = async () => {
  isLoadingAddresses.value = true;
  try {
    const res = await addressService.getAddresses();
    const list = res.data?.data || [];
    addresses.value = list;

    if (list.length > 0) {
      const primary = list.find((a) => a.is_primary);
      const defaultId = primary ? primary.id : list[0].id;
      activeAddressId.value = defaultId;
      tempSelectedAddressId.value = defaultId;
    }
  } catch (err) {
    console.error("Gagal mengambil daftar alamat:", err);
  } finally {
    isLoadingAddresses.value = false;
  }
};

const openAddModal = async () => {
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

  showAddModal.value = true;
  await fetchProvinces();
};

const submitAddAddress = async () => {
  if (!addressForm.first_name || !addressForm.phone || !addressForm.address) {
    alert("Mohon lengkapi semua field yang wajib diisi (*)");
    return;
  }

  isSavingAddress.value = true;

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

  try {
    const res = await addressService.createAddress(payload);
    const newAddress = res.data?.data || res.data;

    await fetchAddresses();
    if (newAddress?.id) {
      activeAddressId.value = newAddress.id;
    }

    showAddModal.value = false;
    showSelectModal.value = false;
  } catch (err) {
    console.error("Gagal menyimpan alamat baru:", err);
    alert(err.response?.data?.message || "Gagal menyimpan alamat baru.");
  } finally {
    isSavingAddress.value = false;
  }
};

const fetchProtectionConfig = async () => {
  try {
    if (publicConfigService?.getProtection) {
      const res = await publicConfigService.getProtection();
      const data = res.data?.data || res.data;
      if (data) {
        protectionConfig.value = {
          fee: Number(data.fee || data.value || 0),
          description:
            data.description ||
            "Melindungi barang dari kerusakan & kehilangan.",
        };
      }
    }
  } catch (err) {
    console.error("Gagal memuat proteksi produk:", err);
  }
};

const fetchApplicableVouchers = async () => {
  isLoadingVouchers.value = true;
  try {
    if (voucherService?.getApplicable) {
      const res = await voucherService.getApplicable({
        subtotal: subtotal.value,
        items: cartStore.items,
      });
      applicableVouchers.value = res.data?.data || res.data || [];
    }
  } catch (err) {
    console.error("Gagal mengambil voucher:", err);
  } finally {
    isLoadingVouchers.value = false;
  }
};

const fetchShippingCost = async () => {
  if (!selectedAddress.value) return;

  isLoadingOngkir.value = true;
  courierOptions.value = [];
  selectedCourier.value = null;
  shippingFee.value = 0;

  try {
    const totalWeight = cartStore.items.reduce(
      (acc, item) => acc + (item.weight || 1000) * item.quantity,
      0,
    );

    const payload = {
      destination: String(selectedAddress.value.city_id || 143),
      weight: totalWeight,
      courier:
        "jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana",
    };

    const res = await shippingService.getShippingCost(payload);
    const data = res.data?.data || res.data || [];
    courierOptions.value = Array.isArray(data) ? data : [];

    if (courierOptions.value.length > 0) {
      selectCourierOption(courierOptions.value[0]);
    }
  } catch (err) {
    console.error("Gagal menghitung ongkos kirim:", err);
  } finally {
    isLoadingOngkir.value = false;
  }
};

// --- HANDLERS & ACTIONS ---
const selectCourierOption = (option) => {
  selectedCourier.value = option;
  shippingFee.value = option.cost || option.price || 0;
};

const selectCourierOptionFromModal = (option) => {
  selectCourierOption(option);
  showCourierModal.value = false;
};

const applyVoucher = (voucher) => {
  if (selectedVoucher.value?.id === voucher.id) {
    selectedVoucher.value = null;
  } else {
    selectedVoucher.value = voucher;
  }
  showVoucherModal.value = false;
};

const openSelectAddressModal = () => {
  tempSelectedAddressId.value = activeAddressId.value;
  showSelectModal.value = true;
};

const saveSelectedAddress = () => {
  activeAddressId.value = tempSelectedAddressId.value;
  showSelectModal.value = false;
};

// --- MIDTRANS SDK LOADER ---
// --- MIDTRANS SDK LOADER (SANDBOX) ---
const loadSnapScript = (clientKey = "Mid-client-5LwdNZy4xj2fsl_X") => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

    // PAKSA GUNAKAN URL SANDBOX SESUAI DENGAN PENGATURAN BACKEND
    const snapUrl = "https://app.sandbox.midtrans.com/snap/snap.js";

    const existingScript = document.getElementById("midtrans-snap-script");
    if (existingScript) {
      existingScript.onload = () => resolve(window.snap);
      existingScript.onerror = () =>
        reject(new Error("Gagal memuat script Midtrans"));
      return;
    }

    const script = document.createElement("script");
    script.src = snapUrl;
    script.id = "midtrans-snap-script";
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => resolve(window.snap);
    script.onerror = () =>
      reject(new Error("Gagal memuat script Midtrans Sandbox"));

    document.head.appendChild(script);
  });
};
// --- PAYMENT INTEGRATION ---
const handleCheckout = async () => {
  if (cartStore.items.length === 0) return;
  if (!selectedAddress.value) {
    alert("Silakan tambahkan atau pilih alamat pengiriman terlebih dahulu.");
    return;
  }
  if (!selectedCourier.value) {
    alert("Silakan pilih opsi kurir pengiriman.");
    return;
  }

  isProcessingPayment.value = true;
  const addr = selectedAddress.value;

  const createOrderPayload = {
    data: {
      billing: {
        address: addr.address,
        city: addr.city,
        city_id: addr.city_id,
        district_id: addr.district_id,
        email: userData.value?.email || "user@example.com",
        first_name: addr.first_name || userData.value?.name || "Customer",
        label_place: addr.label_place || "Rumah",
        last_name: addr.last_name || "",
        note_address: addr.note_address || "",
        phone: addr.phone || userData.value?.phone || "",
        postal_code: addr.postal_code || "",
        province: addr.province,
        province_id: addr.province_id,
        same_as_shipping: true,
        sub_district_id: addr.sub_district_id,
      },
      courier: {
        agent: selectedCourier.value.agent || "pos",
        cost: shippingFee.value,
        etd: selectedCourier.value.etd || "2-3 hari",
        service: selectedCourier.value.service || "Pos Reguler",
        service_desc: selectedCourier.value.description || "",
      },
      delivery_order_note: null,
      invoice_note: null,
      payment_method: "midtrans",
      products: cartStore.items.map((item) => {
        const variantsArray =
          item.variants || item.product?.variants || item.product_variants;

        const selectedVariantId =
          item.variant_id ||
          item.selectedVariant?.id ||
          item.id_variant ||
          (Array.isArray(variantsArray) && variantsArray.length > 0
            ? variantsArray[0].id
            : null);

        return {
          is_protected: isProtectionEnabled.value,
          note: item.note || null,
          qty: item.quantity || item.qty || 1,
          variant_id: selectedVariantId,
        };
      }),
      shipping: {
        address: addr.address,
        city: addr.city,
        city_id: addr.city_id || 199,
        district_id: addr.district_id || 2166,
        email: userData.value?.email || "user@example.com",
        first_name: addr.first_name || userData.value?.name || "Customer",
        label_place: addr.label_place || "Rumah",
        last_name: addr.last_name || "",
        note_address: addr.note_address || "",
        phone: addr.phone || userData.value?.phone || "",
        postal_code: addr.postal_code || "",
        province: addr.province || "JAWA BARAT",
        province_id: addr.province_id || 5,
        sub_district_id: addr.sub_district_id || 25983,
      },
      use_points: false,
      voucher_discount: discount.value,
      voucher_id: selectedVoucher.value?.id || null,
    },
  };

  try {
    const resOrder = await orderService.createOrder(createOrderPayload);
    const orderId =
      resOrder.data?.data?.order?.id ||
      resOrder.data?.order?.id ||
      resOrder.data?.id;

    if (!orderId) throw new Error("Order ID tidak ditemukan.");

    const resPay = await orderService.payOrderMidtrans(orderId, {
      payment_method: "midtrans",
    });

    const snapToken =
      resPay?.data?.data?.snap_token ||
      resPay?.data?.snap_token ||
      resPay?.snap_token;

    if (!snapToken) {
      alert("Gagal mendapatkan token pembayaran dari server.");
      return;
    }

    await loadSnapScript();

    if (!window.snap) {
      alert("Script Midtrans Snap gagal dimuat.");
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: (result) => {
        alert("Pembayaran Berhasil!");
        cartStore.clearCart();
        router.push("/profile");
      },
      onPending: (result) => {
        alert("Menunggu Pembayaran!");
        cartStore.clearCart();
        router.push("/profile");
      },
      onError: (result) => {
        alert("Pembayaran Gagal!");
      },
      onClose: () => {
        alert("Kamu menutup popup tanpa menyelesaikan pembayaran.");
      },
    });
  } catch (err) {
    console.error("Checkout error:", err);
    alert(
      err.response?.data?.message || err.message || "Terjadi kesalahan sistem.",
    );
  } finally {
    isProcessingPayment.value = false;
  }
};

// --- WATCHERS & LIFECYCLE ---
watch(
  selectedAddress,
  (newAddress) => {
    if (newAddress) {
      fetchShippingCost();
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  fetchUserProfile();
  fetchAddresses();
  fetchProtectionConfig();
  fetchApplicableVouchers();
  loadSnapScript(); // Preload SDK saat mounted
});
</script>

<template>
  <div class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Checkout
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Tinjau pesanan dan selesaikan pembayaran kamu.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Kolom Kiri -->
        <div class="lg:col-span-8 space-y-5">
          <!-- Keranjang Belanja -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-gray-900 mb-4">
              Keranjang Belanja ({{ cartStore.totalCount }})
            </h2>

            <div v-if="cartStore.items.length > 0" class="divide-y divide-gray-100">
              <div v-for="item in cartStore.items" :key="item.id"
                class="py-4 flex items-center justify-between first:pt-0">
                <div class="flex items-center gap-4">
                  <img :src="item.image" :alt="item.title" class="w-14 h-14 rounded-lg object-cover bg-gray-100" />
                  <div>
                    <h3 class="text-sm font-bold text-gray-800">
                      {{ item.title }}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1">
                      {{ item.quantity }} × Rp
                      {{ item.price ? item.price.toLocaleString("id-ID") : 0 }}
                    </p>
                  </div>
                </div>
                <span class="text-sm font-bold text-gray-900">
                  Rp
                  {{
                    ((item.price || 0) * item.quantity).toLocaleString("id-ID")
                  }}
                </span>
              </div>

              <!-- Proteksi Produk -->
              <div class="pt-4">
                <div
                  class="flex items-start justify-between gap-3 bg-[#FAF6F0]/50 p-4 rounded-xl border border-dashed border-gray-200">
                  <div class="flex items-start gap-3">
                    <input type="checkbox" id="protection" v-model="isProtectionEnabled"
                      class="mt-1 w-4 h-4 text-[#E25C38] accent-[#E25C38] rounded cursor-pointer" />
                    <label for="protection" class="cursor-pointer">
                      <span class="text-sm font-bold text-gray-900 block">Proteksi Produk</span>
                      <span class="text-xs text-gray-500 block mt-1">
                        {{ protectionConfig.description }}
                      </span>
                    </label>
                  </div>
                  <span class="text-sm font-bold text-gray-900 shrink-0">
                    Rp
                    {{
                      ((protectionConfig.fee * subtotal) / 100).toLocaleString(
                        "id-ID",
                      )
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-400 text-sm">
              Keranjang kamu kosong. Silakan pilih produk terlebih dahulu.
            </div>
          </div>

          <!-- Alamat Pengiriman -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold text-gray-900">
                Alamat Pengiriman
              </h2>
              <button v-if="addresses.length > 0" @click="openSelectAddressModal"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer">
                Ubah
              </button>
            </div>

            <div v-if="isLoadingAddresses || isLoadingUser" class="text-sm text-gray-400 animate-pulse">
              Memuat data alamat pengiriman...
            </div>

            <div v-else-if="selectedAddress" class="text-sm text-gray-600 space-y-1">
              <p class="font-bold text-gray-800">
                {{ selectedAddress.first_name || selectedAddress.name }}
                <span class="font-normal text-gray-500">· {{ selectedAddress.phone }}</span>
              </p>
              <p class="text-gray-600 leading-relaxed">
                {{ selectedAddress.address }}, {{ selectedAddress.city }},
                {{ selectedAddress.province }}
                {{ selectedAddress.postal_code }}
              </p>
            </div>

            <div v-else class="text-sm text-gray-400 space-y-2 py-2">
              <p>Belum ada alamat pengiriman yang tersimpan.</p>
              <button @click="openAddModal" class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer">
                + Tambah Alamat
              </button>
            </div>
          </div>

          <!-- Pilihan Kurir Pengiriman -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-bold text-gray-900">
                Metode Pengiriman
              </h2>
              <button v-if="selectedAddress" @click="showCourierModal = true"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer">
                {{ selectedCourier ? "Ganti Kurir" : "Pilih Kurir" }}
              </button>
            </div>

            <div v-if="isLoadingOngkir" class="text-sm text-gray-400 animate-pulse">
              Menghitung ongkos kirim...
            </div>

            <div v-else-if="selectedCourier"
              class="p-4 rounded-xl border border-[#E25C38] bg-[#FFF8F6] flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-900">
                    {{ selectedCourier.name?.toUpperCase() || "POS" }} -
                    {{ selectedCourier.service }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Estimasi tiba: {{ selectedCourier.etd || "-" }} hari
                </p>
              </div>
              <span class="text-sm font-bold text-[#E25C38]">
                Rp
                {{
                  (
                    selectedCourier.cost ||
                    selectedCourier.price ||
                    0
                  ).toLocaleString("id-ID")
                }}
              </span>
            </div>

            <div v-else-if="selectedAddress" class="text-sm text-gray-500 flex items-center justify-between">
              <span>Silakan pilih kurir dan layanan pengiriman.</span>
              <button @click="showCourierModal = true"
                class="px-4 py-2 bg-[#E25C38] text-white rounded-lg font-bold text-xs hover:bg-[#c94d2b]">
                Pilih Ongkir
              </button>
            </div>

            <div v-else class="text-sm text-gray-400">
              Pilih alamat terlebih dahulu untuk melihat opsi ongkos kirim.
            </div>
          </div>

          <!-- VOUCHER UI -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xl">🎟️</span>
              <div>
                <h2 class="text-sm font-bold text-gray-900">Voucher Diskon</h2>
                <p class="text-xs text-gray-500 mt-0.5">
                  {{
                    selectedVoucher
                      ? selectedVoucher.name || selectedVoucher.code
                      : "Makin hemat dengan voucher"
                  }}
                </p>
              </div>
            </div>
            <button @click="showVoucherModal = true"
              class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer">
              {{ selectedVoucher ? "Ganti Voucher" : "Gunakan Voucher" }}
            </button>
          </div>
        </div>

        <!-- Kolom Kanan: Ringkasan Pesanan -->
        <div class="lg:col-span-4">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 class="text-base font-bold text-gray-900">Ringkasan Pesanan</h2>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal ({{ cartStore.totalCount }} item)</span>
                <span class="font-bold text-gray-800">Rp {{ subtotal.toLocaleString("id-ID") }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Ongkos Kirim</span>
                <span class="font-bold text-gray-800">Rp {{ shippingFee.toLocaleString("id-ID") }}</span>
              </div>
              <div v-if="isProtectionEnabled" class="flex justify-between text-gray-600">
                <span>Proteksi Produk</span>
                <span class="font-bold text-gray-800">Rp {{ protectionFee.toLocaleString("id-ID") }}</span>
              </div>
              <div v-if="discount > 0" class="flex justify-between text-[#E25C38]">
                <span>Diskon Voucher</span>
                <span class="font-bold">- Rp {{ discount.toLocaleString("id-ID") }}</span>
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="flex justify-between items-baseline">
              <span class="text-sm font-bold text-gray-900">Total</span>
              <span class="text-xl font-extrabold text-[#E25C38]">Rp {{ total.toLocaleString("id-ID") }}</span>
            </div>

            <button @click="handleCheckout" :disabled="cartStore.items.length === 0 ||
              isProcessingPayment ||
              !selectedAddress ||
              !selectedCourier
              "
              class="w-full py-3.5 bg-[#14120E] hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-[#D4B26F] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <span v-if="isProcessingPayment" class="animate-spin text-base">🌀</span>
              <span>{{
                isProcessingPayment ? "Memproses..." : "Bayar Sekarang"
              }}</span>
            </button>

            <p class="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
              <span>🔒</span> Transaksi aman & terenkripsi
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PILIH ONGKIR / KURIR -->
    <div v-if="showCourierModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Pilih Opsi Pengiriman
          </h3>
          <button @click="showCourierModal = false" class="text-gray-400 hover:text-gray-600 text-base">
            ✕
          </button>
        </div>

        <div v-if="isLoadingOngkir" class="text-sm text-gray-400 animate-pulse text-center py-6">
          Menghitung ongkos kirim...
        </div>

        <div v-else-if="courierOptions.length > 0" class="space-y-2 max-h-72 overflow-y-auto pr-1">
          <div v-for="(opt, idx) in courierOptions" :key="idx" @click="selectCourierOptionFromModal(opt)" :class="[
            'p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
            selectedCourier?.service === opt.service
              ? 'border-[#E25C38] bg-[#FFF8F6]'
              : 'border-gray-200 hover:border-gray-300',
          ]">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-900">
                  {{ opt.name?.toUpperCase() || "POS" }} - {{ opt.service }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Estimasi tiba: {{ opt.etd || "-" }} hari
              </p>
            </div>
            <span class="text-sm font-bold text-[#E25C38]">
              Rp {{ (opt.cost || opt.price || 0).toLocaleString("id-ID") }}
            </span>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400 text-center py-6">
          Tidak ada opsi pengiriman yang tersedia untuk alamat ini.
        </div>

        <div class="flex justify-end pt-3 border-t">
          <button @click="showCourierModal = false"
            class="px-4 py-2 text-xs bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PILIH ALAMAT -->
    <div v-if="showSelectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Pilih Alamat Pengiriman
          </h3>
          <button @click="showSelectModal = false" class="text-gray-400 hover:text-gray-600 text-base">
            ✕
          </button>
        </div>

        <div v-if="addresses.length > 0" class="space-y-3 max-h-72 overflow-y-auto pr-1">
          <div v-for="addr in addresses" :key="addr.id" @click="tempSelectedAddressId = addr.id" :class="[
            'p-4 rounded-xl border transition-all cursor-pointer space-y-1',
            tempSelectedAddressId === addr.id
              ? 'border-[#E25C38] bg-[#FFF8F6]'
              : 'border-gray-200 hover:border-gray-300',
          ]">
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-gray-900">
                {{ addr.first_name || addr.name }}
              </span>
              <span v-if="addr.label_place || addr.label"
                class="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md font-medium">
                {{ addr.label_place || addr.label }}
              </span>
            </div>
            <p class="text-xs text-gray-600">
              {{ addr.address }}, {{ addr.city }}, {{ addr.province }}
              {{ addr.postal_code }}
            </p>
            <p class="text-xs text-gray-400">{{ addr.phone }}</p>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400 text-center py-6">
          Belum ada alamat tersimpan.
        </div>

        <div class="flex items-center justify-between pt-3 border-t">
          <button @click="openAddModal" class="text-xs font-bold text-[#E25C38] hover:underline cursor-pointer">
            + Tambah Alamat Baru
          </button>
          <div class="flex gap-2">
            <button @click="showSelectModal = false"
              class="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg">
              Batal
            </button>
            <button @click="saveSelectedAddress"
              class="px-4 py-2 text-xs bg-[#E25C38] text-white font-bold rounded-lg hover:bg-[#c94d2b]">
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH ALAMAT BARU -->
    <div v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-gray-900">Alamat Baru</h2>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 text-xl font-bold">
            ✕
          </button>
        </div>

        <form @submit.prevent="submitAddAddress" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Label Alamat</label>
            <div class="flex gap-2">
              <button type="button" v-for="opt in labelOptions" :key="opt" @click="addressForm.label_place = opt"
                :class="[
                  'px-3.5 py-1.5 text-xs rounded-xl border font-medium transition-all',
                  addressForm.label_place === opt
                    ? 'border-[#E25C38] bg-[#FFF8F6] text-[#E25C38]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                ]">
                {{ opt }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Nama Depan *</label>
              <input v-model="addressForm.first_name" type="text" required placeholder="Nama Depan"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Nama Belakang</label>
              <input v-model="addressForm.last_name" type="text" placeholder="Nama Belakang"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Nomor Telepon *</label>
              <input v-model="addressForm.phone" type="tel" required placeholder="08123456789"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Kode Pos</label>
              <input v-model="addressForm.postal_code" type="text" placeholder="12345"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]" />
            </div>
          </div>

          <!-- Cascading Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Provinsi *</label>
              <select v-model="selectedProvinceId" @change="onProvinceChange"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]">
                <option :value="null" disabled>Pilih Provinsi</option>
                <option v-for="p in provinces" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Kota / Kabupaten *</label>
              <select v-model="selectedCityId" @change="onCityChange" :disabled="!selectedProvinceId || isLoadingCities"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100">
                <option :value="null" disabled>Pilih Kota/Kab</option>
                <option v-for="c in cities" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Kecamatan *</label>
              <select v-model="selectedDistrictId" @change="onDistrictChange"
                :disabled="!selectedCityId || isLoadingDistricts"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100">
                <option :value="null" disabled>Pilih Kecamatan</option>
                <option v-for="d in districts" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Kelurahan *</label>
              <select v-model="selectedSubDistrictId" @change="onSubDistrictChange"
                :disabled="!selectedDistrictId || isLoadingSubDistricts"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100">
                <option :value="null" disabled>Pilih Kelurahan</option>
                <option v-for="sd in subDistricts" :key="sd.id" :value="sd.id">
                  {{ sd.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5">Alamat Lengkap *</label>
            <textarea v-model="addressForm.address" rows="3" required placeholder="Nama jalan, nomor rumah, RT/RW..."
              class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input type="checkbox" id="is_primary" v-model="addressForm.is_primary"
              class="w-4 h-4 text-[#E25C38] accent-[#E25C38] rounded" />
            <label for="is_primary" class="text-xs font-medium text-gray-700 cursor-pointer">
              Jadikan Alamat Utama
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button type="button" @click="showAddModal = false"
              class="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl">
              Batal
            </button>
            <button type="submit" :disabled="isSavingAddress"
              class="px-5 py-2 text-xs bg-[#E25C38] text-white font-bold rounded-xl hover:bg-[#c94d2b] disabled:bg-gray-300">
              {{ isSavingAddress ? "Menyimpan..." : "Simpan Alamat" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL PILIH VOUCHER -->
    <div v-if="showVoucherModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Gunakan Voucher Diskon
          </h3>
          <button @click="showVoucherModal = false" class="text-gray-400 hover:text-gray-600 text-base">
            ✕
          </button>
        </div>

        <div v-if="isLoadingVouchers" class="text-sm text-gray-400 animate-pulse text-center py-4">
          Memuat voucher...
        </div>

        <div v-else-if="applicableVouchers.length > 0" class="space-y-2 max-h-60 overflow-y-auto pr-1">
          <div v-for="v in applicableVouchers" :key="v.id" @click="applyVoucher(v)" :class="[
            'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
            selectedVoucher?.id === v.id
              ? 'border-[#E25C38] bg-[#FFF8F6]'
              : 'border-gray-200 hover:border-gray-300',
          ]">
            <div>
              <p class="text-sm font-bold text-gray-900">
                {{ v.name || v.code }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">
                {{ v.description || "Potongan harga khusus transaksi ini" }}
              </p>
            </div>
            <span class="text-xs font-bold text-[#E25C38]">
              {{ selectedVoucher?.id === v.id ? "Terpasang" : "Gunakan" }}
            </span>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400 text-center py-6">
          Tidak ada voucher yang dapat digunakan untuk transaksi ini.
        </div>

        <div class="flex justify-end pt-3 border-t">
          <button @click="showVoucherModal = false"
            class="px-4 py-2 text-xs bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
