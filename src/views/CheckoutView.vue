<script setup>
import { ref, computed, onMounted } from "vue";
import Cookies from "js-cookie";
import { useCartStore } from "../stores/cart";
import { useAuthApi } from "../composables/useAuthApi";

const cartStore = useCartStore();
const { getMe } = useAuthApi();

const shippingFee = ref(55000);
const discount = ref(0);

const subtotal = computed(() => cartStore.totalPrice);
const total = computed(() => {
  if (cartStore.items.length === 0) return 0;
  return Math.max(0, subtotal.value + shippingFee.value - discount.value);
});

const userData = ref(null);
const isLoadingUser = ref(false);

const fetchUserProfile = async () => {
  isLoadingUser.value = true;
  try {
    const { data, error } = await getMe();

    if (!error && data) {
      userData.value = data.user || data;

      if (addresses.value.length > 0 && userData.value) {
        addresses.value[0].name =
          userData.value.name ||
          userData.value.username ||
          addresses.value[0].name;
        addresses.value[0].phone =
          userData.value.phone || addresses.value[0].phone;
      }
    }
  } catch (err) {
    console.error("Gagal mengambil data user:", err);
  } finally {
    isLoadingUser.value = false;
  }
};

const loadMidtransSnapScript = (clientKey, isProduction = false) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById("midtrans-script")) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.id = "midtrans-script";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Snap JS Midtrans"));
    document.head.appendChild(script);
  });
};

const initPaymentGatewayConfig = async () => {
  const token = Cookies.get("auth_token");
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  try {
    const response = await fetch(`${baseURL}/payment/midtrans/config`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const config = await response.json();
      if (config.client_key) {
        await loadMidtransSnapScript(config.client_key, config.is_production);
      }
    }
  } catch (err) {
    console.error("Gagal memuat konfigurasi Midtrans:", err);
  }
};

onMounted(() => {
  fetchUserProfile();
  initPaymentGatewayConfig();
});

const selectedGateway = ref("midtrans");
const isProcessingPayment = ref(false);

const paymentGateways = [
  {
    id: "midtrans",
    name: "Midtrans",
    description:
      "Pop-up pembayaran instan (GoPay, ShopeePay, VA, Kartu Kredit)",
  },
  {
    id: "xendit",
    name: "Xendit Gateway",
    description:
      "Redirect ke invoice resmi Xendit (E-Wallet, QRIS, Virtual Account)",
  },
];

const addresses = ref([
  {
    id: 1,
    label: "Rumah",
    isPrimary: true,
    name: "Michael",
    phone: "0812121212",
    address: "Jl. Melati 123 No.7 ",
    city: "Jakarta",
    city_id: 199,
    district_id: 2166,
    sub_district_id: 25983,
    province: "Jakarta BARAT",
    province_id: 5,
    postalCode: "11111",
  },
]);

const activeAddressId = ref(1);
const tempSelectedAddressId = ref(1);

const selectedAddress = computed(() => {
  return (
    addresses.value.find((a) => a.id === activeAddressId.value) ||
    addresses.value[0]
  );
});

const showSelectModal = ref(false);
const showFormModal = ref(false);
const isEditing = ref(false);

const addressForm = ref({
  id: null,
  label: "",
  name: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
});

const openSelectAddressModal = () => {
  tempSelectedAddressId.value = activeAddressId.value;
  showSelectModal.value = true;
};

const confirmAddressSelection = () => {
  activeAddressId.value = tempSelectedAddressId.value;
  showSelectModal.value = false;
};

const openAddModal = () => {
  isEditing.value = false;
  addressForm.value = {
    id: null,
    label: "Alamat Baru",
    name: userData.value?.name || "",
    phone: userData.value?.phone || "",
    address: "",
    city: "",
    postalCode: "",
  };
  showSelectModal.value = false;
  showFormModal.value = true;
};

const openEditModal = (addr) => {
  isEditing.value = true;
  addressForm.value = { ...addr };
  showSelectModal.value = false;
  showFormModal.value = true;
};

const saveAddress = () => {
  if (isEditing.value) {
    const idx = addresses.value.findIndex((a) => a.id === addressForm.value.id);
    if (idx !== -1) {
      addresses.value[idx] = { ...addressForm.value };
    }
  } else {
    const newId = Date.now();
    const newAddress = {
      ...addressForm.value,
      id: newId,
      isPrimary: addresses.value.length === 0,
    };
    addresses.value.push(newAddress);
    tempSelectedAddressId.value = newId;
  }
  showFormModal.value = false;
  showSelectModal.value = true;
};

const deleteAddress = (id) => {
  if (addresses.value.length <= 1) {
    alert("Minimal harus ada 1 alamat pengiriman.");
    return;
  }
  addresses.value = addresses.value.filter((a) => a.id !== id);
  if (tempSelectedAddressId.value === id) {
    tempSelectedAddressId.value = addresses.value[0].id;
  }
  if (activeAddressId.value === id) {
    activeAddressId.value = addresses.value[0].id;
  }
};

const handleCheckout = async () => {
  if (cartStore.items.length === 0) return;

  isProcessingPayment.value = true;
  const token = Cookies.get("auth_token");
  const baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  const createOrderPayload = {
    data: {
      billing: {
        address: selectedAddress.value.address,
        city: selectedAddress.value.city,
        city_id: selectedAddress.value.city_id || 199,
        district_id: selectedAddress.value.district_id || 2166,
        email: userData.value?.email || "mikegusto0@gmail.com",
        first_name: selectedAddress.value.name || userData.value?.name || "Michael",
        label_place: selectedAddress.value.label || "Rumah",
        last_name: "",
        note_address: "",
        phone: selectedAddress.value.phone !== "-" ? selectedAddress.value.phone : "081808710868",
        postal_code: selectedAddress.value.postalCode || "16512",
        province: selectedAddress.value.province || "JAWA BARAT",
        province_id: selectedAddress.value.province_id || 5,
        same_as_shipping: true,
        sub_district_id: selectedAddress.value.sub_district_id || 25983,
      },
      courier: {
        agent: "pos",
        cost: shippingFee.value,
        etd: "10 day",
        service: "Pos Reguler",
        service_desc: "240",
      },
      delivery_order_note: null,
      invoice_note: null,
      payment_method: selectedGateway.value,
      products: cartStore.items.map((item) => ({
        is_protected: false,
        note: null,
        qty: item.quantity,
        variant_id: item.variant_id || item.variantId || item.id,
      })),
      shipping: {
        address: selectedAddress.value.address,
        city: selectedAddress.value.city,
        city_id: selectedAddress.value.city_id || 199,
        district_id: selectedAddress.value.district_id || 2166,
        email: userData.value?.email || "mikegusto0@gmail.com",
        first_name: selectedAddress.value.name || userData.value?.name || "Michael",
        label_place: selectedAddress.value.label || "Rumah",
        last_name: "",
        note_address: "",
        phone: selectedAddress.value.phone !== "-" ? selectedAddress.value.phone : "081808710868",
        postal_code: selectedAddress.value.postalCode || "16512",
        province: selectedAddress.value.province || "JAWA BARAT",
        province_id: selectedAddress.value.province_id || 5,
        sub_district_id: selectedAddress.value.sub_district_id || 25983,
      },
      use_points: false,
      voucher_discount: discount.value,
      voucher_id: null,
    },
  };

  try {
    const createOrderResponse = await fetch(`${baseURL}/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(createOrderPayload),
    });

    const createOrderResult = await createOrderResponse.json();

    if (!createOrderResponse.ok || !createOrderResult.success) {
      throw new Error(createOrderResult.message || "Gagal membuat order.");
    }

    const orderId = createOrderResult.data?.order?.id;

    if (!orderId) {
      throw new Error("Order ID tidak ditemukan.");
    }

    const payResponse = await fetch(`${baseURL}/orders/${orderId}/pay/${selectedGateway.value}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        payment_method: selectedGateway.value,
      }),
    });

    const payResult = await payResponse.json();

    if (!payResponse.ok) {
      throw new Error(payResult.message || "Gagal memproses pembayaran.");
    }

    if (selectedGateway.value === "midtrans") {
      if (window.snap && payResult.snap_token) {
        window.snap.pay(payResult.snap_token, {
          onSuccess: (result) => {
            alert("Pembayaran Berhasil!");
            cartStore.items = [];
            Cookies.remove("cart_items");
            console.log(result);
          },
          onPending: (result) => {
            alert("Menunggu Pembayaran!");
            console.log(result);
          },
          onError: (result) => {
            alert("Pembayaran Gagal!");
            console.error(result);
          },
          onClose: () => {
            alert("Kamu menutup popup tanpa menyelesaikan pembayaran.");
          },
        });
      } else {
        alert("Gagal memuat Snap Token Midtrans.");
      }
    } else if (selectedGateway.value === "xendit") {
      if (payResult.invoice_url) {
        window.location.href = payResult.invoice_url;
      } else {
        alert("Gagal mendapatkan invoice URL Xendit.");
      }
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert(err.message || "Terjadi kesalahan sistem.");
  } finally {
    isProcessingPayment.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900"
  >
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Checkout
        </h1>
        <p class="text-xs text-gray-500 mt-1">
          Tinjau pesanan dan selesaikan pembayaran kamu.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-8 space-y-5">
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <h2 class="text-sm font-bold text-gray-900 mb-4">
              Keranjang Belanja ({{ cartStore.totalCount }})
            </h2>

            <div
              v-if="cartStore.items.length > 0"
              class="divide-y divide-gray-100"
            >
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="py-3 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                  <div>
                    <h3 class="text-xs font-bold text-gray-800">
                      {{ item.title }}
                    </h3>
                    <p class="text-[11px] text-gray-400 mt-0.5">
                      {{ item.quantity }} × Rp
                      {{ item.price ? item.price.toLocaleString("id-ID") : 0 }}
                    </p>
                  </div>
                </div>
                <span class="text-xs font-bold text-gray-900">
                  Rp
                  {{
                    ((item.price || 0) * item.quantity).toLocaleString("id-ID")
                  }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-6 text-gray-400 text-xs">
              Keranjang kamu kosong. Silakan pilih produk terlebih dahulu.
            </div>
          </div>

          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-bold text-gray-900">Alamat Pengiriman</h2>
              <button
                @click="openSelectAddressModal"
                class="text-xs font-bold text-[#E25C38] hover:underline cursor-pointer"
              >
                Ubah
              </button>
            </div>

            <div
              v-if="isLoadingUser"
              class="text-xs text-gray-400 animate-pulse"
            >
              Memuat data pengguna...
            </div>

            <div
              v-else-if="selectedAddress"
              class="text-xs text-gray-600 space-y-1"
            >
              <p class="font-bold text-gray-800">
                {{ selectedAddress.name }}
                <span class="font-normal text-gray-400"
                  >· {{ selectedAddress.phone }}</span
                >
              </p>
              <p class="text-gray-500 leading-relaxed">
                {{ selectedAddress.address }}
              </p>
            </div>
          </div>

          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3"
          >
            <h2 class="text-sm font-bold text-gray-900">
              Pilih Payment Gateway
            </h2>

            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="gateway in paymentGateways"
                :key="gateway.id"
                @click="selectedGateway = gateway.id"
                :class="[
                  'p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3',
                  selectedGateway === gateway.id
                    ? 'border-[#E25C38] bg-[#FFF8F6]'
                    : 'border-gray-200 hover:border-gray-300',
                ]"
              >
                <div
                  class="w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0"
                  :class="
                    selectedGateway === gateway.id
                      ? 'border-[#E25C38]'
                      : 'border-gray-300'
                  "
                >
                  <div
                    v-if="selectedGateway === gateway.id"
                    class="w-2 h-2 rounded-full bg-[#E25C38]"
                  ></div>
                </div>
                <div>
                  <h3 class="text-xs font-bold text-gray-900">
                    {{ gateway.name }}
                  </h3>
                  <p class="text-[11px] text-gray-500 mt-0.5">
                    {{ gateway.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-4">
          <div
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
          >
            <h2 class="text-sm font-bold text-gray-900">Ringkasan Pesanan</h2>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between text-gray-500">
                <span>Subtotal ({{ cartStore.totalCount }} item)</span>
                <span class="font-bold text-gray-800"
                  >Rp {{ subtotal.toLocaleString("id-ID") }}</span
                >
              </div>
              <div class="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span class="font-bold text-gray-800"
                  >Rp {{ shippingFee.toLocaleString("id-ID") }}</span
                >
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold text-gray-900">Total</span>
              <span class="text-lg font-extrabold text-[#E25C38]"
                >Rp {{ total.toLocaleString("id-ID") }}</span
              >
            </div>

            <button
              @click="handleCheckout"
              :disabled="cartStore.items.length === 0 || isProcessingPayment"
              class="w-full py-3 bg-[#14120E] hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 text-[#D4B26F] font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="isProcessingPayment" class="animate-spin text-sm"
                >🌀</span
              >
              <span>{{
                isProcessingPayment ? "Memproses..." : "Bayar Sekarang"
              }}</span>
            </button>

            <p
              class="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1"
            >
              <span>🔒</span> Transaksi aman & terenkripsi
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showSelectModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-bold text-gray-900">
          Pilih Alamat Pengiriman
        </h3>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div
            v-for="addr in addresses"
            :key="addr.id"
            @click="tempSelectedAddressId = addr.id"
            :class="[
              'p-4 rounded-xl border transition-all cursor-pointer relative',
              tempSelectedAddressId === addr.id
                ? 'border-[#E25C38] bg-[#FFF8F6]'
                : 'border-gray-200 hover:border-gray-300',
            ]"
          >
            <div class="flex items-center gap-2 mb-1">
              <div
                class="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                :class="
                  tempSelectedAddressId === addr.id
                    ? 'border-[#E25C38]'
                    : 'border-gray-300'
                "
              >
                <div
                  v-if="tempSelectedAddressId === addr.id"
                  class="w-1.5 h-1.5 rounded-full bg-[#E25C38]"
                ></div>
              </div>
              <span class="text-xs font-bold text-gray-900">
                {{ addr.label }}
                <span v-if="addr.isPrimary" class="text-gray-400 font-normal"
                  >· Utama</span
                >
              </span>
            </div>

            <div class="pl-5 text-xs text-gray-500 space-y-1">
              <p class="font-semibold text-gray-800">
                {{ addr.name }} · {{ addr.phone }}
              </p>
              <p class="text-[11px] leading-relaxed">{{ addr.address }}</p>

              <div class="flex gap-3 pt-1">
                <button
                  @click.stop="openEditModal(addr)"
                  class="text-[11px] font-bold text-[#E25C38] hover:underline cursor-pointer"
                >
                  Ubah
                </button>
                <button
                  @click.stop="deleteAddress(addr.id)"
                  class="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-2 pt-2">
          <button
            @click="openAddModal"
            class="w-full py-2.5 border border-gray-800 rounded-xl font-bold text-xs text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            + Tambah Alamat Baru
          </button>
          <button
            @click="confirmAddressSelection"
            class="w-full py-2.5 bg-[#14120E] hover:bg-black text-[#D4B26F] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Gunakan Alamat Ini
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showFormModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-bold text-gray-900">
          {{ isEditing ? "Ubah Alamat" : "Tambah Alamat Baru" }}
        </h3>

        <form @submit.prevent="saveAddress" class="space-y-3 text-xs">
          <div>
            <label class="block text-gray-500 font-medium mb-1"
              >Nama Penerima</label
            >
            <input
              v-model="addressForm.name"
              type="text"
              required
              placeholder="Budi Santoso"
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
            />
          </div>

          <div>
            <label class="block text-gray-500 font-medium mb-1"
              >No. Handphone</label
            >
            <input
              v-model="addressForm.phone"
              type="text"
              required
              placeholder="0812-3456-7890"
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
            />
          </div>

          <div>
            <label class="block text-gray-500 font-medium mb-1"
              >Alamat Lengkap</label
            >
            <textarea
              v-model="addressForm.address"
              rows="3"
              required
              placeholder="Jl. Melati No. 12, RT 04 / RW 06, Kebayoran Baru"
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38] resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-gray-500 font-medium mb-1"
                >Kota / Kabupaten</label
              >
              <input
                v-model="addressForm.city"
                type="text"
                required
                placeholder="Jakarta Selatan"
                class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
              />
            </div>
            <div>
              <label class="block text-gray-500 font-medium mb-1"
                >Kode Pos</label
              >
              <input
                v-model="addressForm.postalCode"
                type="text"
                required
                placeholder="12150"
                class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
              />
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              @click="
                showFormModal = false;
                showSelectModal = true;
              "
              class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 py-2.5 bg-[#14120E] hover:bg-black text-[#D4B26F] font-bold rounded-xl transition-colors cursor-pointer"
            >
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>