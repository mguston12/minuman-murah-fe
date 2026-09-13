<template>
  <div>
    <div class="flex items-center gap-2 mb-4">
      <router-link
        to="/account/orders"
        class="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1"
      >
        ‹ Kembali ke Pesanan Saya
      </router-link>
    </div>

    <div
      v-if="isLoading"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12"
    >
      <p class="text-xs font-bold text-gray-500 animate-pulse">
        Memuat detail pesanan...
      </p>
    </div>

    <div
      v-else-if="!order"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12"
    >
      <p class="text-xs text-gray-500 font-medium">Pesanan tidak ditemukan.</p>
    </div>

    <!-- SATU CARD UNTUK SEMUA -->
    <div
      v-else
      class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4"
    >
      <!-- HEADER PESANAN -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 class="text-base font-extrabold text-gray-900">
            Pesanan {{ order.orderNumber }}
          </h1>
          <p class="text-[11px] text-gray-400 font-medium mt-1">
            Dipesan {{ order.date }}
          </p>
        </div>
        <span
          :class="[
            'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
            order.statusColor || 'bg-gray-100 text-gray-700',
          ]"
        >
          {{ order.status }}
        </span>
      </div>

      <!-- INFO PENGIRIMAN -->
      <div class="pt-3 border-t border-gray-100">
        <h2 class="text-xs font-extrabold text-gray-900 mb-2">
          Informasi Pengiriman
        </h2>
        <p class="text-xs text-gray-700 font-bold">
          {{ order.shipping.recipientName }}
        </p>
        <p class="text-xs text-gray-500 mt-1 leading-relaxed">
          {{ order.shipping.fullAddress }}
        </p>

        <div
          class="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2"
        >
          <p class="text-[11px] text-gray-500 font-medium">
            {{ order.shipping.courierLabel }}
          </p>
          <p
            v-if="order.shipping.resiNumber"
            class="text-[11px] text-gray-500 font-medium"
          >
            No. Resi:
            <span class="font-bold text-gray-700">{{
              order.shipping.resiNumber
            }}</span>
          </p>
        </div>
      </div>

      <!-- DAFTAR ITEM -->
      <div class="pt-3 border-t border-gray-100">
        <h2 class="text-xs font-extrabold text-gray-900 mb-3">
          Barang Dipesan
        </h2>

        <div class="space-y-3">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center gap-3"
          >
            <img
              :src="item.image"
              :alt="item.title"
              class="w-12 h-12 object-cover rounded-lg border border-gray-100 shrink-0"
            />
            <div class="flex-1">
              <p class="text-xs font-bold text-gray-800">
                {{ item.title }}
              </p>
              <p
                v-if="item.variantDescription"
                class="text-[11px] text-gray-400 mt-0.5"
              >
                {{ item.variantDescription }}
              </p>
              <p class="text-[11px] text-gray-400 mt-0.5">
                {{ item.quantity }} x Rp {{ formatCurrency(item.price) }}
              </p>
            </div>

            <p class="text-xs font-bold text-gray-900 shrink-0">
              Rp {{ formatCurrency(item.subtotal) }}
            </p>

            <!-- Hanya untuk pesanan COMPLETED -->
            <template v-if="order.status === 'COMPLETED'">
              <div
                v-if="item.review"
                class="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg shrink-0"
              >
                <span class="flex">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="
                      star <= item.review.rating
                        ? 'text-[#D4B26F]'
                        : 'text-gray-200'
                    "
                    >★</span
                  >
                </span>
              </div>
              <button
                v-else
                type="button"
                @click="openReviewModal(item)"
                class="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 text-[#E25C38] bg-[#FFF8F6] hover:bg-[#FFEDE6]"
              >
                Beri Ulasan
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- RINGKASAN PEMBAYARAN -->
      <div class="pt-3 border-t border-gray-100">
        <h2 class="text-xs font-extrabold text-gray-900 mb-3">
          Ringkasan Pembayaran
        </h2>

        <div class="space-y-1.5 text-xs">
          <div class="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span>Rp {{ formatCurrency(order.subtotal) }}</span>
          </div>
          <div
            v-if="order.shippingCost"
            class="flex justify-between text-gray-500"
          >
            <span>Ongkos Kirim</span>
            <span>Rp {{ formatCurrency(order.shippingCost) }}</span>
          </div>
          <div
            v-if="order.discount"
            class="flex justify-between text-[#E25C38]"
          >
            <span>Diskon</span>
            <span>- Rp {{ formatCurrency(order.discount) }}</span>
          </div>
          <div
            class="flex justify-between font-bold text-gray-900 pt-2 mt-2 border-t border-gray-100"
          >
            <span>Total</span>
            <span>Rp {{ formatCurrency(order.totalPrice) }}</span>
          </div>
        </div>
      </div>

      <!-- ACTIONS -->
      <!-- <div class="pt-3 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap">
        <button
          v-if="order.status === 'PENDING'"
          @click="continuePayment"
          :disabled="isProcessingPayment"
          class="px-5 py-2 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl shadow-sm hover:bg-black transition-colors disabled:opacity-50"
        >
          {{ isProcessingPayment ? "Memproses..." : "Lanjutkan Pembayaran" }}
        </button>

        <button
          v-if="order.status === 'DELIVERED'"
          @click="openCompleteOrderModal"
          :disabled="isCompletingOrder"
          class="px-5 py-2 bg-white border border-[#14120E] hover:bg-gray-50 text-[#14120E] text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          {{ isCompletingOrder ? "Memproses..." : "Konfirmasi Diterima" }}
        </button>
      </div> -->
    </div>

    <!-- ==================== MODAL KONFIRMASI PESANAN DITERIMA ==================== -->
    <div
      v-if="isCompleteOrderModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 relative text-gray-900 text-center"
      >
        <h3 class="text-base font-extrabold text-gray-900">
          Konfirmasi Pesanan Diterima
        </h3>
        <p class="text-xs text-gray-500">
          Apakah kamu yakin pesanan ini sudah kamu terima? Tindakan ini tidak
          dapat dibatalkan.
        </p>

        <div class="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            @click="isCompleteOrderModalOpen = false"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="confirmCompleteOrder"
            class="flex-1 px-4 py-2.5 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl hover:bg-black transition-colors"
          >
            Ya, Konfirmasi
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL BERI ULASAN ==================== -->
    <div
      v-if="isReviewModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 relative text-gray-900"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-base font-extrabold">Beri Ulasan Produk</h3>
          <button
            @click="isReviewModalOpen = false"
            class="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div class="flex justify-center gap-1">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="reviewForm.rating = star"
            class="text-2xl leading-none focus:outline-none"
          >
            <span
              :class="
                star <= reviewForm.rating ? 'text-[#D4B26F]' : 'text-gray-200'
              "
              >★</span
            >
          </button>
        </div>

        <textarea
          v-model="reviewForm.comment"
          rows="3"
          placeholder="Ceritakan pengalamanmu dengan produk ini..."
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-gray-900 transition-colors"
        ></textarea>

        <div class="flex gap-2 pt-1">
          <button
            type="button"
            @click="isReviewModalOpen = false"
            class="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            @click="submitReview"
            :disabled="isSubmittingReview"
            class="flex-1 px-4 py-2.5 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
          >
            {{ isSubmittingReview ? "Mengirim..." : "Kirim Ulasan" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL INFO (SUKSES/GAGAL) ==================== -->
    <div
      v-if="isInfoModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl space-y-4 relative text-gray-900 text-center"
      >
        <h3 class="text-base font-extrabold text-gray-900">
          {{ infoModalTitle }}
        </h3>
        <p class="text-xs text-gray-500">
          {{ infoModalMessage }}
        </p>

        <button
          type="button"
          @click="isInfoModalOpen = false"
          class="w-full px-4 py-2.5 bg-[#14120E] text-[#D4B26F] text-xs font-bold rounded-xl hover:bg-black transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { orderService, reviewService } from "../../services/apiServices";

const route = useRoute();

const isLoading = ref(true);
const order = ref(null);

const getOrderStatusColor = (status) => {
  switch (status) {
    case "PAID":
    case "DELIVERED":
      return "bg-green-100 text-green-800";
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

const formatCurrency = (value) => Number(value || 0).toLocaleString("id-ID");

const mapOrder = (raw) => {
  const shipping = raw.shipping || {};
  const courier = raw.courier || {};

  return {
    id: raw.id,
    uuid: raw.uuid,
    orderNumber: raw.order_number || `#${raw.id}`,
    status: raw.status,
    statusColor: getOrderStatusColor(raw.status),
    date: raw.created_at
      ? new Date(raw.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    subtotal: raw.subtotal || 0,
    shippingCost: raw.shipping_cost || courier.cost || 0,
    discount: raw.discount_amount || 0,
    totalPrice: raw.total_amount || 0,
    shipping: {
      recipientName:
        `${shipping.first_name || ""} ${shipping.last_name || ""}`.trim(),
      fullAddress: [
        shipping.address,
        shipping.city,
        shipping.province,
        shipping.postal_code,
      ]
        .filter(Boolean)
        .join(", "),
      courierLabel: [courier.agent, courier.service]
        .filter(Boolean)
        .join(" - "),
      resiNumber: courier.resi_number || null,
    },
    items: (raw.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      title: item.product_name,
      variantDescription: item.variant_description || null,
      quantity: item.qty,
      price:
        item.purchase_price || item.discount_price || item.actual_price || 0,
      subtotal: item.subtotal || 0,
      image: item.product_image,
      review: item.review || null,
    })),
  };
};

const fetchOrder = async () => {
  isLoading.value = true;
  try {
    const res = await orderService.getOrderById(route.params.id);
    const raw = res.data?.data?.order;
    order.value = raw ? mapOrder(raw) : null;
  } catch (error) {
    console.error("Gagal mengambil detail pesanan:", error);
    order.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrder);

// State Modal Info (pengganti alert)
const isInfoModalOpen = ref(false);
const infoModalMessage = ref("");
const infoModalTitle = ref("");

// State Konfirmasi Pesanan Diterima
const isCompleteOrderModalOpen = ref(false);
const isCompletingOrder = ref(false);

const openCompleteOrderModal = () => {
  isCompleteOrderModalOpen.value = true;
};

const confirmCompleteOrder = async () => {
  isCompleteOrderModalOpen.value = false;
  isCompletingOrder.value = true;

  try {
    await orderService.completeOrder(order.value.id);
    order.value.status = "COMPLETED";
    order.value.statusColor = getOrderStatusColor("COMPLETED");

    infoModalTitle.value = "Berhasil";
    infoModalMessage.value =
      "Terima kasih! Pesanan telah dikonfirmasi selesai.";
    isInfoModalOpen.value = true;
  } catch (error) {
    console.error("Gagal menyelesaikan pesanan:", error);
    infoModalTitle.value = "Gagal";
    infoModalMessage.value =
      error.response?.data?.message || "Gagal mengkonfirmasi pesanan.";
    isInfoModalOpen.value = true;
  } finally {
    isCompletingOrder.value = false;
  }
};

// State Lanjutkan Pembayaran
const isProcessingPayment = ref(false);

const continuePayment = async () => {
  isProcessingPayment.value = true;
  try {
    const res = await orderService.payOrderMidtrans(order.value.id, {});
    // TODO: sesuaikan dengan integrasi Midtrans Snap kamu, contoh:
    // const snapToken = res.data?.data?.snap_token;
    // window.snap.pay(snapToken, { onSuccess: fetchOrder, ... });
    // atau redirect langsung kalau API mengembalikan redirect_url:
    const redirectUrl = res.data?.data?.redirect_url;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  } catch (error) {
    console.error("Gagal memproses pembayaran:", error);
    infoModalTitle.value = "Gagal";
    infoModalMessage.value =
      error.response?.data?.message || "Gagal memproses pembayaran.";
    isInfoModalOpen.value = true;
  } finally {
    isProcessingPayment.value = false;
  }
};

// State Modal Review
const isReviewModalOpen = ref(false);
const isSubmittingReview = ref(false);
const reviewForm = reactive({
  orderItemId: null,
  productId: null,
  rating: 0,
  comment: "",
});

const openReviewModal = (item) => {
  reviewForm.orderItemId = item.id;
  reviewForm.productId = item.productId;
  reviewForm.rating = 0;
  reviewForm.comment = "";
  isReviewModalOpen.value = true;
};

const submitReview = async () => {
  if (!reviewForm.rating) {
    alert("Silakan pilih rating bintang terlebih dahulu.");
    return;
  }
  if (!reviewForm.productId) {
    alert("Data produk tidak ditemukan, coba muat ulang halaman.");
    return;
  }

  isSubmittingReview.value = true;
  try {
    await reviewService.createReview(reviewForm.productId, {
      order_item_id: reviewForm.orderItemId,
      rating: reviewForm.rating,
      comment: reviewForm.comment || null,
    });

    const item = order.value.items.find(
      (it) => it.id === reviewForm.orderItemId,
    );
    if (item) {
      item.review = { rating: reviewForm.rating, comment: reviewForm.comment };
    }

    isReviewModalOpen.value = false;
    infoModalTitle.value = "Berhasil";
    infoModalMessage.value = "Terima kasih! Ulasan kamu berhasil dikirim.";
    isInfoModalOpen.value = true;
  } catch (error) {
    console.error("Gagal mengirim ulasan:", error);
    alert(error.response?.data?.message || "Gagal mengirim ulasan.");
  } finally {
    isSubmittingReview.value = false;
  }
};
</script>
