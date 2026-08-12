<script setup>
import { ref, computed, onMounted } from "vue";
import { useCartStore } from "../stores/cart";

const cartStore = useCartStore();

// --- CONFIG MIDTRANS ---
const MIDTRANS_CLIENT_KEY = "SB-Mid-client-xxxxxxxxxxxx"; 
const IS_PRODUCTION = false;

const snapUrl = IS_PRODUCTION
  ? "https://app.midtrans.com/snap/snap.js"
  : "https://app.sandbox.midtrans.com/snap/snap.js";

// State UI
const isSubmitting = ref(false);

// State Voucher & Pengiriman
const voucherInput = ref("");
const appliedVoucher = ref(null);
const shippingFee = ref(15000);

const applyVoucher = () => {
  const code = voucherInput.value.trim().toUpperCase();
  if (code === "MURAH25") {
    appliedVoucher.value = { code: "MURAH25", discount: 36000 };
  } else {
    alert("Kode voucher tidak valid!");
  }
};

const removeVoucher = () => {
  appliedVoucher.value = null;
  voucherInput.value = "";
};

// Perhitungan Total Dinamis
const discountAmount = computed(() => appliedVoucher.value?.discount || 0);

const finalTotal = computed(() => {
  const calc = cartStore.totalPrice + shippingFee.value - discountAmount.value;
  return calc > 0 ? calc : 0;
});

// State Alamat Pengiriman
const selectedAddress = ref({
  id: 1,
  name: "Budi Santoso",
  phone: "0812-3456-7890",
  address:
    "Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150",
});

// Load Script Snap Midtrans
onMounted(() => {
  if (!document.getElementById("midtrans-script")) {
    const script = document.createElement("script");
    script.src = snapUrl;
    script.id = "midtrans-script";
    script.setAttribute("data-client-key", MIDTRANS_CLIENT_KEY);
    document.head.appendChild(script);
  }
});

// Trigger Modal Midtrans Snap
const handleCheckout = async () => {
  if (cartStore.items.length === 0) {
    alert("Keranjang belanja Anda kosong.");
    return;
  }

  isSubmitting.value = true;

  const payload = {
    items: cartStore.items.map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
    address: selectedAddress.value,
    voucher: appliedVoucher.value?.code || null,
    summary: {
      subtotal: cartStore.totalPrice,
      shippingFee: shippingFee.value,
      discount: discountAmount.value,
      total: finalTotal.value,
    },
  };

  try {
    // 1. Minta Snap Token dari backend
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const snapToken = data.snap_token;

    // 2. Tampilkan Modal Snap Pop-up
    if (window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: function (result) {
          console.log("Payment success:", result);
          alert("Pembayaran Berhasil!");
          cartStore.clearCart(); 
        },
        onPending: function (result) {
          console.log("Waiting for payment:", result);
          alert("Menunggu pembayaran...");
        },
        onError: function (result) {
          console.error("Payment failed:", result);
          alert("Pembayaran Gagal!");
        },
        onClose: function () {
          console.log("Customer closed the modal without finishing payment");
        },
      });
    } else {
      alert("Gagal mendapatkan token pembayaran dari server.");
    }
  } catch (error) {
    console.error("Gagal melakukan checkout:", error);
    alert("Terjadi kesalahan sistem saat membuat transaksi.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#FAF6F0] text-gray-900 font-sans">
    <main class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900">Checkout</h1>
        <p class="text-xs text-gray-500 mt-1">
          Tinjau pesanan dan selesaikan pembayaran kamu.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- KOLOM KIRI: LIST ITEM & ALAMAT PENGIRIMAN -->
        <div class="lg:col-span-8 space-y-5">
          <!-- KERANJANG BELANJA -->
          <div
            class="bg-white rounded-2xl p-6 shadow-xs border border-gray-100"
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
                class="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
              >
                <div class="flex items-center gap-4">
                  <img
                    :src="item.image"
                    :alt="item.title"
                    class="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                  />
                  <div>
                    <h3 class="text-xs font-bold text-gray-900">
                      {{ item.title }}
                    </h3>
                    <p class="text-[11px] text-gray-400 mt-0.5">
                      {{ item.quantity }} x Rp
                      {{ item.price.toLocaleString("id-ID") }}
                    </p>

                    <!-- Kontrol Qty -->
                    <div class="flex items-center gap-2 mt-2">
                      <div
                        class="flex items-center border border-gray-200 rounded-md"
                      >
                        <button
                          @click="
                            cartStore.updateQuantity(item.id, item.quantity - 1)
                          "
                          class="px-2 py-0.5 text-xs hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span class="px-2 text-xs font-bold">{{
                          item.quantity
                        }}</span>
                        <button
                          @click="
                            cartStore.updateQuantity(item.id, item.quantity + 1)
                          "
                          class="px-2 py-0.5 text-xs hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <button
                        @click="cartStore.removeFromCart(item.id)"
                        class="text-[11px] text-gray-400 hover:text-red-500 hover:underline ml-1"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>

                <span class="text-xs font-bold text-gray-900 shrink-0">
                  Rp {{ (item.price * item.quantity).toLocaleString("id-ID") }}
                </span>
              </div>
            </div>

            <div v-else class="text-center py-8 text-xs text-gray-400">
              Keranjang belanja kamu kosong.
            </div>
          </div>

          <!-- ALAMAT PENGIRIMAN -->
          <div
            class="bg-white rounded-2xl p-6 shadow-xs border border-gray-100"
          >
            <h2 class="text-sm font-bold text-gray-900 mb-2">
              Alamat Pengiriman
            </h2>
            <div class="text-xs text-gray-600 space-y-1">
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
        </div>

        <!-- KOLOM KANAN: RINGKASAN PESANAN -->
        <div class="lg:col-span-4">
          <div
            class="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-4 sticky top-6"
          >
            <h2 class="text-sm font-bold text-gray-900">Ringkasan Pesanan</h2>

            <!-- VOUCHER -->
            <div class="space-y-2">
              <div v-if="!appliedVoucher" class="flex gap-2">
                <input
                  v-model="voucherInput"
                  type="text"
                  placeholder="Kode Voucher (MURAH25)"
                  class="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs uppercase focus:outline-none"
                />
                <button
                  @click="applyVoucher"
                  class="px-3 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black"
                >
                  Pakai
                </button>
              </div>

              <div
                v-else
                class="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800"
              >
                <span class="font-bold"
                  >Voucher: {{ appliedVoucher.code }}</span
                >
                <button
                  @click="removeVoucher"
                  class="text-red-500 font-bold hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>

            <!-- RINCIAN HARGA -->
            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between text-gray-500">
                <span>Subtotal ({{ cartStore.totalCount }} item)</span>
                <span class="font-bold text-gray-800"
                  >Rp {{ cartStore.totalPrice.toLocaleString("id-ID") }}</span
                >
              </div>
              <div class="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span class="font-bold text-gray-800"
                  >Rp {{ shippingFee.toLocaleString("id-ID") }}</span
                >
              </div>
              <div
                v-if="discountAmount > 0"
                class="flex justify-between text-emerald-600"
              >
                <span>Diskon</span>
                <span class="font-bold"
                  >- Rp {{ discountAmount.toLocaleString("id-ID") }}</span
                >
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold text-gray-900">Total</span>
              <span class="text-xl font-black text-[#E25C38]"
                >Rp {{ finalTotal.toLocaleString("id-ID") }}</span
              >
            </div>

            <!-- TOMBOL BAYAR (MEMICU MODAL SNAP) -->
            <button
              @click="handleCheckout"
              :disabled="cartStore.items.length === 0 || isSubmitting"
              class="w-full py-3.5 bg-[#14120E] text-[#D4B26F] disabled:bg-gray-200 disabled:text-gray-400 font-bold text-xs rounded-xl hover:bg-black transition-all cursor-pointer"
            >
              {{ isSubmitting ? "Memproses..." : "Lanjut ke Pembayaran" }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
