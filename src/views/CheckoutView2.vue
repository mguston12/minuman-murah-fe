<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  authService,
  addressService,
  shippingService,
  orderService,
  publicConfigService,
  cartService,
  productService,
} from "../services/apiServices";
import { useVoucher } from "../composables/useVoucher";

const router = useRouter();

/* ============================================================
 * STATE: CART API
 * ============================================================ */
const cartItems = ref([]);
const outOfStockItems = ref([]);
const cartCalculation = ref({
  sub_total: 0,
  total_cart: 0,
  total_weight: 0,
  product_protection_percent: 10,
  product_protection_amount: 0,
});
const isLoadingCart = ref(false);

const fetchCartData = async () => {
  isLoadingCart.value = true;
  try {
    const res = await cartService.getCart();
    const responseData = res.data?.data || res.data;

    cartItems.value = responseData?.cart || [];
    outOfStockItems.value = responseData?.out_of_stock || [];

    if (responseData?.calculation) {
      cartCalculation.value = responseData.calculation;
    }
  } catch (err) {
    console.error("Gagal mengambil data keranjang:", err);
  } finally {
    isLoadingCart.value = false;
  }
};

const clearCartData = async () => {
  try {
    await cartService.clearCart();
    cartItems.value = [];
    outOfStockItems.value = [];
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.error("Gagal mengosongkan keranjang:", err);
  }
};

/* ============================================================
 * FITUR: STOK PER VARIANT+TOKO UNTUK ITEM DI CART
 *
 * GET /cart tidak mengembalikan info stok per item (lihat
 * routes/api.php: CartController::index tidak punya field itu).
 * Satu-satunya endpoint publik yang punya data stok toko adalah
 * GET /products/{slug} (ProductController::show) — endpoint yang
 * sama dipakai di ProductDetail.vue lewat productService.getProductBySlug.
 *
 * Jadi di sini kita fetch produk untuk setiap product_slug UNIK
 * yang ada di cart (dedup, supaya tidak fetch berkali-kali untuk
 * produk yang sama), lalu simpan sisa stok bersih per kombinasi
 * variant_id + store_id ke dalam sebuah map.
 * ============================================================ */
const stockMap = ref({}); // key: `${variant_id}_${store_id}` -> sisa stok bersih toko
const isLoadingStock = ref(false);

const getAvailableQty = (storeRelation) => {
  if (!storeRelation) return 0;
  const available =
    (storeRelation.qty || 0) - (storeRelation.reserved_qty || 0);
  return available > 0 ? available : 0;
};

const stockKey = (variantId, storeId) => `${variantId}_${storeId ?? "null"}`;

const fetchStockForCartItems = async () => {
  const uniqueSlugs = [
    ...new Set(
      cartItems.value.map((item) => item.product_slug).filter(Boolean),
    ),
  ];

  if (uniqueSlugs.length === 0) {
    stockMap.value = {};
    return;
  }

  isLoadingStock.value = true;
  const nextMap = {};

  try {
    await Promise.all(
      uniqueSlugs.map(async (slug) => {
        try {
          const res = await productService.getProductBySlug(slug);
          const data = res.data;
          if (!data?.success) return;

          const productData = data.data.product;
          const variants = productData?.variants || [];

          for (const variant of variants) {
            const relations = variant.stock_relations || [];
            for (const relation of relations) {
              const storeId = relation.store_id ?? relation.store?.id ?? null;
              nextMap[stockKey(variant.id, storeId)] =
                getAvailableQty(relation);
            }
          }
        } catch (err) {
          console.error(`Gagal mengambil stok untuk produk ${slug}:`, err);
        }
      }),
    );
  } finally {
    stockMap.value = nextMap;
    isLoadingStock.value = false;
  }
};

// Sisa stok bersih toko untuk item cart tertentu.
// null berarti data stoknya belum/tidak berhasil dimuat (fail-open agar
// tidak mengunci tombol kalau memang datanya belum tersedia); jika sudah
// dimuat, batas ini dipakai untuk membatasi tombol tambah qty.
const remainingStockForItem = (item) => {
  const storeId = item.store_id ?? item.store?.id ?? null;
  const key = stockKey(item.variant_id, storeId);
  return key in stockMap.value ? stockMap.value[key] : null;
};

/* ============================================================
 * FITUR: TAMBAH / KURANG QUANTITY & HAPUS ITEM DARI CHECKOUT
 * Menggunakan cartService.updateCartItem / removeCartItem yang
 * sama seperti di CartDrawer.vue. Setelah berhasil, cart di-refetch
 * agar subtotal, ongkir per toko, proteksi, dan voucher (yang semua
 * reaktif terhadap cartItems / groupedByStore) ikut ter-update.
 * ============================================================ */
const updatingQtyVariantId = ref(null);

const changeItemQuantity = async (item, delta) => {
  const currentQty = item.qty || item.quantity || 1;
  const newQty = currentQty + delta;

  if (newQty < 1) return;
  if (updatingQtyVariantId.value !== null) return;

  // Guard di frontend: cegah nambah melebihi sisa stok bersih toko,
  // kalau data stoknya sudah berhasil dimuat.
  if (delta > 0) {
    const remaining = remainingStockForItem(item);
    if (remaining !== null && newQty > remaining) {
      showToast(
        "warning",
        "Stok Tidak Mencukupi",
        `Sisa stok untuk produk ini hanya ${remaining}.`,
      );
      return;
    }
  }

  updatingQtyVariantId.value = item.variant_id;

  try {
    await cartService.updateCartItem(item.variant_id, { qty: newQty });
    await fetchCartData();
    await fetchStockForCartItems();
    window.dispatchEvent(new Event("cart-updated"));
  } catch (err) {
    console.error("Gagal memperbarui jumlah produk:", err);
    const message =
      err.response?.data?.message ||
      "Jumlah melebihi stok yang tersedia atau terjadi kesalahan.";
    showToast("error", "Gagal Memperbarui Jumlah", message);
    // Sinkronkan ulang data cart & stok agar tampilan sesuai kondisi terbaru di server
    await fetchCartData();
    await fetchStockForCartItems();
  } finally {
    updatingQtyVariantId.value = null;
  }
};

const handleRemoveCartItem = async (item) => {
  if (updatingQtyVariantId.value !== null) return;

  updatingQtyVariantId.value = item.variant_id;

  try {
    await cartService.removeCartItem(item.variant_id);
    await fetchCartData();
    await fetchStockForCartItems();
    window.dispatchEvent(new Event("cart-updated"));
    showToast("info", "Produk Dihapus", "Produk telah dihapus dari keranjang.");
  } catch (err) {
    console.error("Gagal menghapus produk:", err);
    showToast(
      "error",
      "Gagal Menghapus",
      err.response?.data?.message || "Terjadi kesalahan saat menghapus produk.",
    );
  } finally {
    updatingQtyVariantId.value = null;
  }
};

const subtotal = computed(() => {
  if (cartCalculation.value.sub_total > 0) {
    return cartCalculation.value.sub_total;
  }
  return cartItems.value.reduce((acc, item) => {
    const price =
      item.purchase_price || item.discount_price || item.actual_price || 0;
    const qty = item.qty || item.quantity || 1;
    return acc + price * qty;
  }, 0);
});

/* ============================================================
 * ALGORITMA (dari Code 2): PENGELOMPOKAN PRODUK PER TOKO
 * Setiap toko punya subtotal, total berat, dan ongkir sendiri.
 * Sesuaikan field item.store_id / item.store_name / item.store_city_id
 * dengan struktur respons API cart Anda.
 * ============================================================ */
const groupedByStore = computed(() => {
  const groups = new Map();

  for (const item of cartItems.value) {
    const storeId = item.store_id ?? item.store?.id ?? null;
    const storeName =
      item.store_name || item.store?.name || "Toko Tidak Diketahui";
    const storeCityId = item.store_city_id ?? item.store?.city_id ?? null;
    const key = storeId ?? "null";

    if (!groups.has(key)) {
      groups.set(key, {
        store_id: storeId,
        store_key: key,
        store_name: storeName,
        store_city_id: storeCityId,
        items: [],
        totalWeight: 0,
        subtotal: 0,
      });
    }

    const group = groups.get(key);
    const qty = item.qty || item.quantity || 1;
    const price =
      item.purchase_price || item.discount_price || item.actual_price || 0;

    group.items.push(item);
    group.totalWeight += (item.weight || 1000) * qty;
    group.subtotal += price * qty;
  }

  return Array.from(groups.values());
});

/* ============================================================
 * STATE: USER & ADDRESS
 * ============================================================ */
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

/* ============================================================
 * ALGORITMA (dari Code 2): ONGKIR PER TOKO
 * shippingPerStore disimpan per store_key, masing-masing punya
 * agent/service/cost/etd + daftar opsi kurir (options) untuk modal.
 * ============================================================ */
const shippingPerStore = ref({});
const isFetchingShipping = ref(false);
const shippingError = ref(null);
const showShippingModal = ref(false);
const editingShippingStoreKey = ref(null);

const allCouriers =
  "jne:sicepat:ide:sap:jnt:ninja:tiki:lion:anteraja:pos:ncs:rex:rpx:sentral:star:wahana";

// --- STATE PRODUCT PROTECTION ---
const protectionConfig = ref({
  fee: 10,
  description: "Melindungi barang dari kerusakan & kehilangan.",
});

/* ============================================================
 * ALGORITMA (dari Code 2): PROTEKSI PER ITEM
 * Diganti dari satu checkbox global menjadi per variant_id.
 * ============================================================ */
const protectionPerItem = ref({});

/* ============================================================
 * ALGORITMA (dari Code 2): CATATAN PER ITEM
 * ============================================================ */
const notePerItem = ref({});
const showNoteModal = ref(false);
const currentNoteVariantId = ref(null);
const noteDraft = ref("");

/* ============================================================
 * VOUCHER — sekarang memakai composable useVoucher()
 * useVoucher menghandle: daftar voucher yang applicable
 * (fetchApplicableVouchers), validasi kode voucher manual
 * (validateVoucherCode), dan penghapusan voucher (removeVoucher).
 * Discount tidak lagi dihitung manual di komponen ini — nilainya
 * datang langsung dari response backend (discountAmount).
 * ============================================================ */
const showVoucherModal = ref(false);
const voucherCode = ref("");
const isApplyingVoucher = ref(false);

const {
  selectedVoucher,
  discountAmount,
  applicableVouchers,
  isLoading: isLoadingVouchers,
  errorVoucher: voucherError,
  fetchApplicableVouchers,
  validateVoucherCode,
  removeVoucher,
} = useVoucher(subtotal, () => cartItems.value.map((item) => item.variant_id));

// Alias supaya seluruh template (yang memakai nama `discount`) tetap jalan
// tanpa perlu diganti satu-satu. Nilainya sepenuhnya berasal dari backend.
const discount = discountAmount;

// --- STATE PAYMENT ---
// NOTE: apiServices.js Anda saat ini hanya punya orderService.payOrderMidtrans,
// jadi metode pembayaran dikunci ke Midtrans. Kalau nanti backend menambah
// endpoint Xendit (mis. orderService.payOrderXendit), tinggal tambahkan lagi
// di sini mengikuti pola payOrderMidtrans.
const PAYMENT_GATEWAY = "midtrans";
const isProcessingPayment = ref(false);
const errorMessage = ref("");

/* ============================================================
 * TOAST NOTIFICATION (pengganti alert() browser)
 * ============================================================ */
const toast = reactive({
  show: false,
  type: "info", // 'success' | 'error' | 'warning' | 'info'
  title: "",
  message: "",
});
let toastTimer = null;

const toastStyles = {
  success: {
    bg: "bg-white",
    border: "border-green-500",
    icon: "✅",
    iconBg: "bg-green-50",
  },
  error: {
    bg: "bg-white",
    border: "border-red-500",
    icon: "✕",
    iconBg: "bg-red-50",
  },
  warning: {
    bg: "bg-white",
    border: "border-amber-500",
    icon: "⚠️",
    iconBg: "bg-amber-50",
  },
  info: {
    bg: "bg-white",
    border: "border-[#E25C38]",
    icon: "ℹ️",
    iconBg: "bg-[#FFF8F6]",
  },
};

const showToast = (type, title, message = "", duration = 3000) => {
  if (toastTimer) clearTimeout(toastTimer);

  toast.type = type;
  toast.title = title;
  toast.message = message;
  toast.show = true;

  toastTimer = setTimeout(() => {
    toast.show = false;
  }, duration);
};

const closeToast = () => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.show = false;
};

/* ============================================================
 * COMPUTED PROPERTIES
 * ============================================================ */
const selectedAddress = computed(() => {
  return (
    addresses.value.find((a) => a.id === activeAddressId.value) ||
    addresses.value[0] ||
    null
  );
});

const totalProtectionCost = computed(() => {
  let total = 0;
  for (const item of cartItems.value) {
    if (protectionPerItem.value[item.variant_id]) {
      const price =
        item.purchase_price || item.discount_price || item.actual_price || 0;
      const qty = item.qty || item.quantity || 1;
      total += ((price * protectionConfig.value.fee) / 100) * qty;
    }
  }
  return total;
});

const totalShippingCost = computed(() => {
  let total = 0;
  for (const group of groupedByStore.value) {
    const c = shippingPerStore.value[group.store_key];
    if (c?.cost) total += c.cost;
  }
  return total;
});

const total = computed(() => {
  if (cartItems.value.length === 0) return 0;
  return Math.max(
    0,
    subtotal.value +
      totalShippingCost.value +
      totalProtectionCost.value -
      discount.value,
  );
});

const currentStoreShippingOptions = computed(() => {
  if (editingShippingStoreKey.value === null) return [];
  return shippingPerStore.value[editingShippingStoreKey.value]?.options || [];
});

/* ============================================================
 * API FETCHERS WILAYAH (sama seperti Code 1)
 * ============================================================ */
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

/* ============================================================
 * API FETCHERS (USER & ADDRESS) — sama seperti Code 1
 * ============================================================ */
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
    ...addressForm,
    is_primary: Boolean(addressForm.is_primary),
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
          fee: Number(data.fee || data.value || 10),
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

/* ============================================================
 * VOUCHER — pemakaian composable
 * Kode manual & pemilihan dari daftar keduanya lewat
 * validateVoucherCode(code), yang sudah menghitung discountAmount
 * dari response backend.
 * ============================================================ */
const applyVoucherCode = async () => {
  if (cartItems.value.length === 0 || !voucherCode.value) return;

  isApplyingVoucher.value = true;
  const ok = await validateVoucherCode(voucherCode.value);
  isApplyingVoucher.value = false;

  if (ok) voucherCode.value = "";
};

const selectVoucherFromList = async (voucher) => {
  isApplyingVoucher.value = true;
  const ok = await validateVoucherCode(voucher.code);
  isApplyingVoucher.value = false;

  if (ok) showVoucherModal.value = false;
};

/* ============================================================
 * ALGORITMA (dari Code 2): ONGKIR PER TOKO
 * Menghitung ongkir untuk tiap toko berdasarkan berat & kota
 * tujuan (alamat terpilih) serta kota asal masing-masing toko.
 * ============================================================ */
const fetchShippingCostPerStore = async () => {
  if (!selectedAddress.value || groupedByStore.value.length === 0) return;

  const destinationCityId = String(selectedAddress.value.city_id || 136);

  // Skip re-fetch jika semua toko sudah punya opsi ongkir yang valid
  const allValid = groupedByStore.value.every((group) => {
    const c = shippingPerStore.value[group.store_key];
    return c && c.options?.length > 0 && c.agent;
  });
  if (allValid) return;

  isFetchingShipping.value = true;
  shippingError.value = null;

  const next = { ...shippingPerStore.value };

  for (const group of groupedByStore.value) {
    const weight = Math.max(Math.ceil(group.totalWeight), 1000);
    const originCityId = group.store_city_id || undefined;

    const payload = {
      destination: destinationCityId,
      origin: originCityId,
      weight,
      courier: allCouriers,
    };

    try {
      const res = await shippingService.getShippingCost(payload);
      const data = res.data?.data || res.data || [];
      const options = Array.isArray(data) ? data : [];

      if (options.length > 0) {
        const cheapest = options.reduce(
          (prev, curr) =>
            (curr.cost || curr.price || 0) < (prev.cost || prev.price || 0)
              ? curr
              : prev,
          options[0],
        );

        next[group.store_key] = {
          agent: cheapest.name || cheapest.agent || "jne",
          service: cheapest.service || "REG",
          service_desc: cheapest.description || cheapest.service_desc || "",
          etd: cheapest.etd || "-",
          cost: cheapest.cost || cheapest.price || 0,
          options,
        };
      } else {
        next[group.store_key] = { options: [] };
      }
    } catch (err) {
      console.error(
        `Gagal menghitung ongkos kirim untuk toko ${group.store_name}:`,
        err,
      );
      next[group.store_key] = { options: [] };
    }
  }

  shippingPerStore.value = next;
  isFetchingShipping.value = false;
};

const selectCourierOptionForStore = (option, storeKey) => {
  shippingPerStore.value = {
    ...shippingPerStore.value,
    [storeKey]: {
      ...shippingPerStore.value[storeKey],
      agent: option.name || option.agent || "jne",
      service: option.service || "REG",
      service_desc: option.description || option.service_desc || "",
      etd: option.etd || "-",
      cost: option.cost || option.price || 0,
    },
  };
};

const selectCourierOptionFromModal = (option) => {
  if (editingShippingStoreKey.value === null) return;
  selectCourierOptionForStore(option, editingShippingStoreKey.value);
  showShippingModal.value = false;
};

const openShippingModalForStore = async (storeKey) => {
  editingShippingStoreKey.value = storeKey;
  try {
    await fetchShippingCostPerStore();
  } catch (err) {
    console.error("Gagal memuat opsi ongkir sebelum membuka modal:", err);
  }
  showShippingModal.value = true;
};

watch(showShippingModal, (open) => {
  if (!open) editingShippingStoreKey.value = null;
});

/* ============================================================
 * ALGORITMA (dari Code 2): PROTEKSI & CATATAN PER ITEM
 * ============================================================ */
const toggleProtectionForItem = (variantId) => {
  protectionPerItem.value = {
    ...protectionPerItem.value,
    [variantId]: !protectionPerItem.value[variantId],
  };
};

const openNoteModal = (item) => {
  currentNoteVariantId.value = item.variant_id;
  noteDraft.value = notePerItem.value[item.variant_id] || "";
  showNoteModal.value = true;
};

const saveNote = () => {
  if (currentNoteVariantId.value !== null) {
    notePerItem.value = {
      ...notePerItem.value,
      [currentNoteVariantId.value]: noteDraft.value,
    };
  }
  showNoteModal.value = false;
  noteDraft.value = "";
  currentNoteVariantId.value = null;
};

/* ============================================================
 * HANDLERS ALAMAT
 * ============================================================ */
const openSelectAddressModal = () => {
  tempSelectedAddressId.value = activeAddressId.value;
  showSelectModal.value = true;
};

const saveSelectedAddress = () => {
  activeAddressId.value = tempSelectedAddressId.value;
  showSelectModal.value = false;
};

/* ============================================================
 * MIDTRANS SDK LOADER (sama seperti Code 1)
 * ============================================================ */
const loadSnapScript = (clientKey = "Mid-client-5LwdNZy4xj2fsl_X") => {
  return new Promise((resolve, reject) => {
    if (window.snap) {
      resolve(window.snap);
      return;
    }

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

const payWithMidtrans = async (orderId, onDone) => {
  await loadSnapScript();

  const resPay = await orderService.payOrderMidtrans(orderId, {
    payment_method: PAYMENT_GATEWAY,
  });
  const snapToken =
    resPay?.data?.data?.snap_token ||
    resPay?.data?.snap_token ||
    resPay?.snap_token;

  if (!snapToken) {
    alert("Gagal mendapatkan token pembayaran dari server.");
    return;
  }

  if (!window.snap) {
    alert("Script Midtrans Snap gagal dimuat.");
    return;
  }

  window.snap.pay(snapToken, {
    onSuccess: async () => {
      showToast(
        "success",
        "Pembayaran Berhasil!",
        "Terima kasih, pesanan kamu sedang diproses.",
      );
      await onDone();
      setTimeout(() => router.push("/account/orders"), 1200);
    },
    onPending: async () => {
      showToast(
        "warning",
        "Menunggu Pembayaran",
        "Selesaikan pembayaran sesuai instruksi yang diberikan.",
      );
      await onDone();
      setTimeout(() => router.push("/account/orders"), 1200);
    },
    onError: () => {
      showToast(
        "error",
        "Pembayaran Gagal",
        "Silakan coba lagi atau gunakan metode pembayaran lain.",
      );
    },
    onClose: () => {
      showToast(
        "info",
        "Pembayaran Dibatalkan",
        "Kamu menutup popup tanpa menyelesaikan pembayaran.",
      );
    },
  });
};

const canSubmit = computed(() => {
  if (cartItems.value.length === 0) return false;
  if (!selectedAddress.value) return false;

  for (const group of groupedByStore.value) {
    const c = shippingPerStore.value[group.store_key];
    if (!c?.agent) return false;
  }
  return true;
});

// Menggabungkan info ongkir dari semua toko menjadi satu ringkasan
// courier untuk dikirim ke /checkout/create (backend hanya menerima
// satu objek courier per order). Total biaya tetap akurat (dijumlah),
// sementara nama agent/service digabung jadi deskripsi yang mudah dibaca.
const buildCombinedCourier = () => {
  const groups = groupedByStore.value;
  const totalCost = totalShippingCost.value;

  if (groups.length === 1) {
    const key = groups[0].store_key;
    const c = shippingPerStore.value[key];
    return {
      agent: c?.agent || "pos",
      cost: totalCost,
      etd: c?.etd || "2-3 hari",
      service: c?.service || "Pos Reguler",
      service_desc: c?.service_desc || "",
    };
  }

  // Lebih dari satu toko: gabungkan jadi satu deskripsi ongkir gabungan
  const perStoreDesc = groups
    .map((group) => {
      const c = shippingPerStore.value[group.store_key];
      if (!c?.agent) return null;
      return `${group.store_name}: ${c.agent.toUpperCase()} ${c.service} (${formatPrice(
        c.cost,
      )})`;
    })
    .filter(Boolean)
    .join(" | ");

  const maxEtd = groups
    .map((group) => shippingPerStore.value[group.store_key]?.etd)
    .filter(Boolean)
    .join("-");

  return {
    agent: "multi",
    cost: totalCost,
    etd: maxEtd || "2-3 hari",
    service: "Gabungan Multi Toko",
    service_desc: perStoreDesc,
  };
};

const handleCheckout = async () => {
  if (cartItems.value.length === 0) return;

  if (!selectedAddress.value) {
    alert("Silakan tambahkan atau pilih alamat pengiriman terlebih dahulu.");
    return;
  }

  for (const group of groupedByStore.value) {
    const c = shippingPerStore.value[group.store_key];
    if (!c?.agent) {
      alert(`Silakan pilih opsi kurir untuk toko: ${group.store_name}`);
      return;
    }
  }

  isProcessingPayment.value = true;
  errorMessage.value = "";

  const addr = selectedAddress.value;

  try {
    const combinedCourier = buildCombinedCourier();

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
        courier: combinedCourier,
        delivery_order_note: null,
        invoice_note: null,
        payment_method: PAYMENT_GATEWAY,
        // Seluruh produk dari semua toko dikirim dalam satu array (satu order)
        products: cartItems.value.map((item) => ({
          is_protected: protectionPerItem.value[item.variant_id] ? 1 : 0,
          note: notePerItem.value[item.variant_id] || null,
          qty: item.qty || item.quantity || 1,
          variant_id: item.variant_id,
        })),
        shipping: {
          address: addr.address,
          city: addr.city,
          city_id: addr.city_id || 136,
          district_id: addr.district_id || 0,
          email: userData.value?.email || "user@example.com",
          first_name: addr.first_name || userData.value?.name || "Customer",
          label_place: addr.label_place || "Rumah",
          last_name: addr.last_name || "",
          note_address: addr.note_address || "",
          phone: addr.phone || userData.value?.phone || "",
          postal_code: addr.postal_code || "",
          province: addr.province || "",
          province_id: addr.province_id || 0,
          sub_district_id: addr.sub_district_id || 0,
        },
        use_points: false,
        voucher_discount: discount.value,
        voucher_id: selectedVoucher.value?.id || null,
      },
    };

    const resOrder = await orderService.createOrder(createOrderPayload);
    const orderId =
      resOrder.data?.data?.order?.id ||
      resOrder.data?.order?.id ||
      resOrder.data?.id;

    if (!orderId) throw new Error("Order ID tidak ditemukan.");

    await payWithMidtrans(orderId, clearCartData);
  } catch (err) {
    console.error("Checkout error:", err);
    errorMessage.value =
      err.response?.data?.message || err.message || "Terjadi kesalahan sistem.";
    alert(errorMessage.value);
  } finally {
    isProcessingPayment.value = false;
  }
};

/* ============================================================
 * FORMAT HELPER
 * ============================================================ */
const formatPrice = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price || 0);
};

/* ============================================================
 * WATCHERS & LIFECYCLE
 * ============================================================ */
watch(
  selectedAddress,
  (newAddress) => {
    if (newAddress) {
      fetchShippingCostPerStore();
    }
  },
  { immediate: true, deep: true },
);

watch(groupedByStore, () => {
  if (selectedAddress.value) {
    fetchShippingCostPerStore();
  }
});

// Voucher butuh product_ids dari cart, jadi baru di-fetch setelah
// cartItems terisi (bukan bersamaan dengan fetchCartData yang async).
watch(cartItems, (items) => {
  if (items.length > 0) {
    fetchApplicableVouchers();
  }
});

onMounted(async () => {
  fetchUserProfile();
  fetchAddresses();
  fetchProtectionConfig();
  loadSnapScript();
  await fetchCartData();
  await fetchStockForCartItems();
});
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900"
  >
    <!-- TOAST NOTIFICATION -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0 translate-y-[-8px] sm:translate-y-0 sm:translate-x-4"
      enter-to-class="opacity-100 translate-y-0 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast.show"
        class="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100]"
      >
        <div
          :class="[
            'flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg',
            toastStyles[toast.type].bg,
            toastStyles[toast.type].border,
          ]"
        >
          <div
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm',
              toastStyles[toast.type].iconBg,
            ]"
          >
            {{ toastStyles[toast.type].icon }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs text-gray-500 mt-0.5">
              {{ toast.message }}
            </p>
          </div>
          <button
            @click="closeToast"
            class="text-gray-300 hover:text-gray-500 shrink-0 cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>

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
          <!-- Alamat Pengiriman -->
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-base font-bold text-gray-900">
                Alamat Pengiriman
              </h2>
              <button
                v-if="addresses?.length > 0"
                @click="openSelectAddressModal"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer"
              >
                Ubah
              </button>
            </div>

            <div
              v-if="isLoadingAddresses || isLoadingUser"
              class="text-sm text-gray-400 animate-pulse"
            >
              Memuat data alamat pengiriman...
            </div>

            <div
              v-else-if="selectedAddress"
              class="text-sm text-gray-600 space-y-1"
            >
              <p class="font-bold text-gray-800">
                {{ selectedAddress.first_name || selectedAddress.name }}
                <span class="font-normal text-gray-500"
                  >· {{ selectedAddress.phone }}</span
                >
              </p>
              <p class="text-gray-600 leading-relaxed">
                {{ selectedAddress.address }}, {{ selectedAddress.city }},
                {{ selectedAddress.province }} {{ selectedAddress.postal_code }}
              </p>
            </div>

            <div v-else class="text-sm text-gray-400 space-y-2 py-2">
              <p>Belum ada alamat pengiriman yang tersimpan.</p>
              <button
                @click="openAddModal"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer"
              >
                + Tambah Alamat
              </button>
            </div>
          </div>

          <!-- Keranjang: dikelompokkan PER TOKO -->
          <div
            v-if="cartItems.length > 0"
            v-for="group in groupedByStore"
            :key="`store-${group.store_key}`"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
          >
            <div class="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span class="text-lg">🏪</span>
              <h2 class="text-base font-bold text-gray-900">
                Store : {{ group.store_name }}
              </h2>
            </div>

            <div
              v-for="item in group.items"
              :key="item.id || item.variant_id"
              class="pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div class="flex items-start justify-between mb-3 gap-3">
                <div class="flex items-start gap-4 min-w-0">
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div class="min-w-0">
                    <h3 class="text-sm font-bold text-gray-800 truncate">
                      {{ item.product_name }}
                    </h3>
                    <p class="text-xs text-gray-400 mt-0.5">
                      Rp
                      {{
                        (
                          item.purchase_price ||
                          item.discount_price ||
                          item.price ||
                          0
                        ).toLocaleString("id-ID")
                      }}
                      / item
                    </p>

                    <!-- Kontrol Tambah / Kurang Quantity -->
                    <div class="flex items-center gap-3 mt-2 flex-wrap">
                      <div
                        class="flex items-center border border-gray-200 rounded-lg bg-gray-50"
                      >
                        <button
                          type="button"
                          @click="changeItemQuantity(item, -1)"
                          :disabled="
                            (item.qty || item.quantity || 1) <= 1 ||
                            updatingQtyVariantId !== null
                          "
                          class="w-7 h-7 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent rounded-l-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span
                          class="w-9 text-center text-xs font-bold text-gray-800"
                        >
                          <span
                            v-if="updatingQtyVariantId === item.variant_id"
                            class="inline-block animate-pulse text-gray-400"
                            >...</span
                          >
                          <span v-else>{{
                            item.qty || item.quantity || 1
                          }}</span>
                        </span>
                        <button
                          type="button"
                          @click="changeItemQuantity(item, 1)"
                          :disabled="updatingQtyVariantId !== null"
                          class="w-7 h-7 flex items-center justify-center text-sm font-bold text-[#E25C38] hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent rounded-r-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        @click="handleRemoveCartItem(item)"
                        :disabled="updatingQtyVariantId !== null"
                        class="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>

                    <button
                      type="button"
                      @click="openNoteModal(item)"
                      class="text-xs text-[#E25C38] hover:underline mt-2 cursor-pointer block"
                    >
                      {{
                        notePerItem[item.variant_id]
                          ? "Ubah Catatan"
                          : "Tambah Catatan"
                      }}
                    </button>
                    <p
                      v-if="notePerItem[item.variant_id]"
                      class="text-xs text-gray-400 mt-1 italic"
                    >
                      Catatan: {{ notePerItem[item.variant_id] }}
                    </p>
                  </div>
                </div>
                <span
                  class="text-sm font-bold text-gray-900 shrink-0 whitespace-nowrap"
                >
                  Rp
                  {{
                    (
                      (item.purchase_price ||
                        item.discount_price ||
                        item.price ||
                        0) * (item.quantity || item.qty || 1)
                    ).toLocaleString("id-ID")
                  }}
                </span>
              </div>

              <!-- Proteksi per item -->
              <div
                class="flex items-center justify-between gap-3 bg-[#FAF6F0]/50 p-3 rounded-xl border border-dashed border-gray-200"
              >
                <label class="flex items-center gap-2 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    :checked="protectionPerItem[item.variant_id]"
                    @change="toggleProtectionForItem(item.variant_id)"
                    class="w-4 h-4 text-[#E25C38] accent-[#E25C38] rounded cursor-pointer"
                  />
                  <span class="text-xs sm:text-sm text-gray-900">
                    Proteksi Produk ({{ protectionConfig?.fee ?? 0 }}%)
                  </span>
                </label>
                <span
                  class="text-xs sm:text-sm font-bold text-gray-900 shrink-0"
                >
                  Rp
                  {{
                    (
                      (((item.purchase_price ||
                        item.discount_price ||
                        item.price ||
                        0) *
                        protectionConfig.fee) /
                        100) *
                      (item.quantity || item.qty || 1)
                    ).toLocaleString("id-ID")
                  }}
                </span>
              </div>
            </div>

            <!-- Ongkir per toko -->
            <div
              class="flex items-center justify-between pt-2 border-t border-gray-100"
            >
              <div>
                <p class="text-xs text-gray-500 mb-0.5">
                  Ongkos kirim ({{ group.items.length }} produk)
                </p>
                <p
                  v-if="shippingPerStore[group.store_key]?.agent"
                  class="text-sm font-semibold text-gray-900"
                >
                  {{ shippingPerStore[group.store_key].agent?.toUpperCase() }}
                  - {{ shippingPerStore[group.store_key].service }} ·
                  {{ formatPrice(shippingPerStore[group.store_key].cost) }}
                </p>
                <p v-else class="text-sm text-gray-400">
                  {{
                    isFetchingShipping
                      ? "Menghitung ongkos kirim..."
                      : "Belum memilih kurir"
                  }}
                </p>
              </div>
              <button
                type="button"
                @click="openShippingModalForStore(group.store_key)"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer"
              >
                {{
                  shippingPerStore[group.store_key]?.agent
                    ? "Ganti Kurir"
                    : "Pilih Kurir"
                }}
              </button>
            </div>
          </div>

          <div
            v-else-if="!isLoadingCart"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-6 text-gray-400 text-sm"
          >
            Keranjang kamu kosong. Silakan pilih produk terlebih dahulu.
          </div>

          <!-- VOUCHER -->
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-gray-900">Voucher Diskon</h2>
              <button
                @click="showVoucherModal = true"
                class="text-sm font-bold text-[#E25C38] hover:underline cursor-pointer"
              >
                {{ selectedVoucher ? "Ganti Voucher" : "Pilih Voucher" }}
              </button>
            </div>

            <!-- <div v-if="voucherError" class="text-xs text-red-600">
              {{ voucherError }}
            </div> -->

            <div class="flex gap-2">
              <input
                v-model="voucherCode"
                type="text"
                placeholder="Masukkan kode voucher"
                class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#E25C38]"
              />
              <button
                @click="applyVoucherCode"
                :disabled="isApplyingVoucher || !voucherCode"
                class="px-4 py-2 rounded-lg bg-[#14120E] text-white text-sm font-bold hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                Terapkan
              </button>
            </div>

            <div
              v-if="selectedVoucher"
              class="border border-[#E25C38] bg-[#FFF8F6] rounded-xl px-4 py-3 text-sm flex flex-col gap-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-gray-900">{{
                      selectedVoucher.name || selectedVoucher.code
                    }}</span>
                    <span
                      class="text-xs font-bold text-[#E25C38] bg-[#FFE6E6] border border-[#E25C38] px-2 py-0.5 rounded"
                    >
                      <span
                        v-if="selectedVoucher.discount_type === 'PERCENTAGE'"
                      >
                        {{ Number(selectedVoucher.discount_value) }}%
                      </span>
                      <span v-else>
                        Rp{{
                          Number(selectedVoucher.discount_value).toLocaleString(
                            "id-ID",
                          )
                        }}
                      </span>
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ selectedVoucher.description || "" }}
                  </p>
                </div>
                <button
                  @click="removeVoucher"
                  class="text-[#E25C38] hover:underline cursor-pointer text-xs shrink-0"
                >
                  Hapus
                </button>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">Diskon</span>
                <span class="text-sm font-bold text-gray-900"
                  >- {{ formatPrice(discount) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Kolom Kanan: Ringkasan Pesanan -->
        <div class="lg:col-span-4">
          <div
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4"
          >
            <h2 class="text-base font-bold text-gray-900">Ringkasan Pesanan</h2>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span class="font-bold text-gray-800">{{
                  formatPrice(subtotal)
                }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Ongkos Kirim ({{ groupedByStore.length }} toko)</span>
                <span class="font-bold text-gray-800">{{
                  formatPrice(totalShippingCost)
                }}</span>
              </div>
              <div
                v-if="totalProtectionCost > 0"
                class="flex justify-between text-gray-600"
              >
                <span>Proteksi Produk</span>
                <span class="font-bold text-gray-800">{{
                  formatPrice(totalProtectionCost)
                }}</span>
              </div>
              <div
                v-if="discount > 0"
                class="flex justify-between text-[#E25C38]"
              >
                <span>Diskon Voucher</span>
                <span class="font-bold">- {{ formatPrice(discount) }}</span>
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="flex justify-between items-baseline">
              <span class="text-sm font-bold text-gray-900">Total</span>
              <span class="text-xl font-extrabold text-[#E25C38]">{{
                formatPrice(total)
              }}</span>
            </div>

            <button
              @click="handleCheckout"
              :disabled="
                !cartItems.length ||
                isProcessingPayment ||
                !canSubmit ||
                updatingQtyVariantId !== null
              "
              class="w-full py-3.5 bg-[#14120E] hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-[#D4B26F] font-bold text-sm rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="isProcessingPayment" class="animate-spin text-base"
                >🌀</span
              >
              <span>{{
                isProcessingPayment ? "Memproses..." : "Bayar Sekarang"
              }}</span>
            </button>

            <p v-if="errorMessage" class="text-xs text-red-600 text-center">
              {{ errorMessage }}
            </p>

            <p
              class="text-xs text-gray-400 text-center flex items-center justify-center gap-1"
            >
              <span>🔒</span> Transaksi aman & terenkripsi
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL PILIH ONGKIR / KURIR (per toko) -->
    <div
      v-if="showShippingModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Pilih Opsi Pengiriman
          </h3>
          <button
            @click="showShippingModal = false"
            class="text-gray-400 hover:text-gray-600 text-base"
          >
            ✕
          </button>
        </div>

        <div
          v-if="isFetchingShipping"
          class="text-sm text-gray-400 animate-pulse text-center py-6"
        >
          Menghitung ongkos kirim...
        </div>

        <div
          v-else-if="currentStoreShippingOptions?.length > 0"
          class="space-y-2 max-h-72 overflow-y-auto pr-1"
        >
          <div
            v-for="(opt, idx) in currentStoreShippingOptions"
            :key="idx"
            @click="selectCourierOptionFromModal(opt)"
            :class="[
              'p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
              shippingPerStore[editingShippingStoreKey]?.service === opt.service
                ? 'border-[#E25C38] bg-[#FFF8F6]'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
            <div>
              <span class="text-sm font-bold text-gray-900">
                {{ (opt.name || opt.agent || "POS").toUpperCase() }} -
                {{ opt.service }}
              </span>
              <p class="text-xs text-gray-500 mt-1">
                Estimasi tiba: {{ opt.etd || "-" }} hari
              </p>
            </div>
            <span class="text-sm font-bold text-[#E25C38]">
              {{ formatPrice(opt.cost || opt.price || 0) }}
            </span>
          </div>
        </div>

        <div v-else class="text-sm text-gray-400 text-center py-6">
          Tidak ada opsi pengiriman yang tersedia untuk toko ini.
        </div>

        <div class="flex justify-end pt-3 border-t">
          <button
            @click="showShippingModal = false"
            class="px-4 py-2 text-xs bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PILIH ALAMAT -->
    <div
      v-if="showSelectModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Pilih Alamat Pengiriman
          </h3>
          <button
            @click="showSelectModal = false"
            class="text-gray-400 hover:text-gray-600 text-base"
          >
            ✕
          </button>
        </div>

        <div
          v-if="addresses?.length > 0"
          class="space-y-3 max-h-72 overflow-y-auto pr-1"
        >
          <div
            v-for="addr in addresses"
            :key="addr.id"
            @click="tempSelectedAddressId = addr.id"
            :class="[
              'p-4 rounded-xl border transition-all cursor-pointer space-y-1',
              tempSelectedAddressId === addr.id
                ? 'border-[#E25C38] bg-[#FFF8F6]'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm font-bold text-gray-900">{{
                addr.first_name || addr.name
              }}</span>
              <span
                v-if="addr.label_place || addr.label"
                class="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md font-medium"
              >
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
          <button
            @click="openAddModal"
            class="text-xs font-bold text-[#E25C38] hover:underline cursor-pointer"
          >
            + Tambah Alamat Baru
          </button>
          <div class="flex gap-2">
            <button
              @click="showSelectModal = false"
              class="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Batal
            </button>
            <button
              @click="saveSelectedAddress"
              class="px-4 py-2 text-xs bg-[#E25C38] text-white font-bold rounded-lg hover:bg-[#c94d2b]"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH ALAMAT BARU -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
    >
      <div
        class="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-extrabold text-gray-900">Alamat Baru</h2>
          <button
            @click="showAddModal = false"
            class="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitAddAddress" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5"
              >Label Alamat</label
            >
            <div class="flex gap-2">
              <button
                type="button"
                v-for="opt in labelOptions"
                :key="opt"
                @click="addressForm.label_place = opt"
                :class="[
                  'px-3.5 py-1.5 text-xs rounded-xl border font-medium transition-all',
                  addressForm.label_place === opt
                    ? 'border-[#E25C38] bg-[#FFF8F6] text-[#E25C38]'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                ]"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Nama Depan *</label
              >
              <input
                v-model="addressForm.first_name"
                type="text"
                required
                placeholder="Nama Depan"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Nama Belakang</label
              >
              <input
                v-model="addressForm.last_name"
                type="text"
                placeholder="Nama Belakang"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Nomor Telepon *</label
              >
              <input
                v-model="addressForm.phone"
                type="tel"
                required
                placeholder="08123456789"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Kode Pos</label
              >
              <input
                v-model="addressForm.postal_code"
                type="text"
                placeholder="12345"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
              />
            </div>
          </div>

          <!-- Cascading Dropdowns -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Provinsi *</label
              >
              <select
                v-model="selectedProvinceId"
                @change="onProvinceChange"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
              >
                <option :value="null" disabled>Pilih Provinsi</option>
                <option v-for="p in provinces" :key="p.id" :value="p.id">
                  {{ p.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Kota / Kabupaten *</label
              >
              <select
                v-model="selectedCityId"
                @change="onCityChange"
                :disabled="!selectedProvinceId || isLoadingCities"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100"
              >
                <option :value="null" disabled>Pilih Kota/Kab</option>
                <option v-for="c in cities" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Kecamatan *</label
              >
              <select
                v-model="selectedDistrictId"
                @change="onDistrictChange"
                :disabled="!selectedCityId || isLoadingDistricts"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100"
              >
                <option :value="null" disabled>Pilih Kecamatan</option>
                <option v-for="d in districts" :key="d.id" :value="d.id">
                  {{ d.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5"
                >Kelurahan *</label
              >
              <select
                v-model="selectedSubDistrictId"
                @change="onSubDistrictChange"
                :disabled="!selectedDistrictId || isLoadingSubDistricts"
                class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38] disabled:bg-gray-100"
              >
                <option :value="null" disabled>Pilih Kelurahan</option>
                <option v-for="sd in subDistricts" :key="sd.id" :value="sd.id">
                  {{ sd.name }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-gray-700 mb-1.5"
              >Alamat Lengkap *</label
            >
            <textarea
              v-model="addressForm.address"
              rows="3"
              required
              placeholder="Nama jalan, nomor rumah, RT/RW..."
              class="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#E25C38]"
            ></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_primary"
              v-model="addressForm.is_primary"
              class="w-4 h-4 text-[#E25C38] accent-[#E25C38] rounded"
            />
            <label
              for="is_primary"
              class="text-xs font-medium text-gray-700 cursor-pointer"
            >
              Jadikan Alamat Utama
            </label>
          </div>

          <div class="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSavingAddress"
              class="px-5 py-2 text-xs bg-[#E25C38] text-white font-bold rounded-xl hover:bg-[#c94d2b] disabled:bg-gray-300"
            >
              {{ isSavingAddress ? "Menyimpan..." : "Simpan Alamat" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL PILIH VOUCHER -->
    <div
      v-if="showVoucherModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b pb-3">
          <h3 class="text-base font-bold text-gray-900">
            Gunakan Voucher Diskon
          </h3>
          <button
            @click="showVoucherModal = false"
            class="text-gray-400 hover:text-gray-600 text-base"
          >
            ✕
          </button>
        </div>

        <div
          v-if="isLoadingVouchers"
          class="text-sm text-gray-400 animate-pulse text-center py-4"
        >
          Memuat voucher...
        </div>

        <div
          v-else-if="applicableVouchers?.length > 0"
          class="space-y-2 max-h-60 overflow-y-auto pr-1"
        >
          <div
            v-for="v in applicableVouchers"
            :key="v.id"
            @click="selectVoucherFromList(v)"
            :class="[
              'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between',
              selectedVoucher?.id === v.id
                ? 'border-[#E25C38] bg-[#FFF8F6]'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
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
          <button
            @click="showVoucherModal = false"
            class="px-4 py-2 text-xs bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL CATATAN PER PRODUK -->
    <div
      v-if="showNoteModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
        <h3 class="text-base font-bold text-gray-900">Catatan untuk Produk</h3>

        <textarea
          v-model="noteDraft"
          rows="4"
          class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#E25C38]"
          placeholder="Tulis catatan untuk produk ini..."
        ></textarea>

        <div class="flex justify-end gap-2">
          <button
            @click="showNoteModal = false"
            class="px-4 py-2 text-xs text-gray-600 border rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Batal
          </button>
          <button
            @click="saveNote"
            class="px-4 py-2 text-xs bg-[#E25C38] text-white font-bold rounded-lg hover:bg-[#c94d2b] cursor-pointer"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
