<template>
  <div>
    <h1 class="text-xl font-extrabold text-gray-900">Pesanan Saya</h1>

    <div
      v-if="isLoading"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12 mt-4"
    >
      <p class="text-xs font-bold text-gray-500 animate-pulse">
        Memuat data pesanan...
      </p>
    </div>

    <div v-else class="space-y-4 mt-4">
      <template v-if="orders.length > 0">
        <div
          v-for="order in paginatedOrders"
          :key="order.id"
          class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-extrabold text-gray-900">
              Pesanan {{ order.orderNumber }}
            </h3>
            <span
              :class="[
                'text-[10px] font-bold px-2.5 py-0.5 rounded-full',
                order.statusColor || 'bg-gray-100 text-gray-700',
              ]"
            >
              {{ order.status }}
            </span>
          </div>

          <p class="text-[11px] text-gray-400 font-medium mt-1">
            Dipesan {{ order.date }}
          </p>

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
              <div class="flex-1 flex items-center justify-between gap-2">
                <span class="text-xs font-bold text-gray-800">
                  {{ item.title }} (x{{ item.quantity }})
                </span>

                <!-- Hanya untuk pesanan COMPLETED -->
                <template v-if="order.status === 'COMPLETED'">
                  <!-- SUDAH ADA ULASAN -->
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
                    <span>Sudah Diulas</span>
                  </div>

                  <!-- BELUM ADA ULASAN -->
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

          <div
            class="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-xs text-gray-900">
                <span class="font-bold">
                  Total: Rp {{ order.totalPrice.toLocaleString("id-ID") }}
                </span>
              </p>

              <!-- NOMOR RESI -->
              <span
                v-if="order.resiNumber"
                class="text-[11px] text-gray-500 font-medium flex items-center gap-1"
              >
                <span class="text-gray-300">&bull;</span>
                No. Resi:
                <span class="font-bold text-gray-700">{{
                  order.resiNumber
                }}</span>
              </span>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="order.status === 'DELIVERED'"
                @click="openCompleteOrderModal(order.id)"
                :disabled="completingOrderId === order.id"
                class="px-5 py-2 bg-white border border-[#14120E] hover:bg-gray-50 text-[#14120E] text-xs font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {{
                  completingOrderId === order.id
                    ? "Memproses..."
                    : "Konfirmasi Diterima"
                }}
              </button>
            </div>
          </div>
        </div>

        <!-- PAGINATION PESANAN -->
        <div
          v-if="orderLastPage > 1"
          class="flex items-center justify-center gap-2 pt-4"
        >
          <button
            @click="changeOrderPage(currentOrderPage - 1)"
            :disabled="currentOrderPage === 1"
            class="px-3 h-8 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            ‹ Sebelumnya
          </button>

          <button
            v-for="p in orderLastPage"
            :key="p"
            @click="changeOrderPage(p)"
            :class="[
              'w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer',
              currentOrderPage === p
                ? 'bg-black text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200',
            ]"
          >
            {{ p }}
          </button>

          <button
            @click="changeOrderPage(currentOrderPage + 1)"
            :disabled="currentOrderPage === orderLastPage"
            class="px-3 h-8 bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Berikutnya ›
          </button>
        </div>
      </template>

      <div
        v-else
        class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center py-12"
      >
        <p class="text-xs text-gray-500 font-medium">
          Belum ada riwayat pesanan.
        </p>
      </div>
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
import { ref, reactive, computed, onMounted } from "vue";
import { orderService, reviewService } from "../../services/apiServices";

const isLoading = ref(true);
const orders = ref([]);

// State Pagination Pesanan (5 per halaman)
const ORDER_PAGE_SIZE = 5;
const currentOrderPage = ref(1);

const orderLastPage = computed(() => {
  if (!orders.value.length) return 1;
  return Math.ceil(orders.value.length / ORDER_PAGE_SIZE);
});

const paginatedOrders = computed(() => {
  const start = (currentOrderPage.value - 1) * ORDER_PAGE_SIZE;
  return orders.value.slice(start, start + ORDER_PAGE_SIZE);
});

const changeOrderPage = (page) => {
  if (page < 1 || page > orderLastPage.value) return;
  currentOrderPage.value = page;
};

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

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const res = await orderService.getOrders();
    const rawOrders = res.data?.data?.orders || res.data?.data || [];
    orders.value = rawOrders.map((order) => ({
      id: order.id,
      orderNumber: order.order_number || `#${order.id}`,
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
      resiNumber: order.courier?.resi_number || null,
      items: (order.order_items || order.items || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        title: item.product_name || item.title,
        quantity: item.qty || item.quantity,
        image: item.featured_image?.path || item.product_image,
        reviewId: item.review_id || item.review?.id || null,
        review: item.review || null,
      })),
    }));

    currentOrderPage.value = 1;
  } catch (error) {
    console.error("Gagal mengambil data pesanan:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

// State Modal Konfirmasi Pesanan Diterima
const isCompleteOrderModalOpen = ref(false);
const orderToCompleteId = ref(null);
const completingOrderId = ref(null);

const openCompleteOrderModal = (orderId) => {
  orderToCompleteId.value = orderId;
  isCompleteOrderModalOpen.value = true;
};

const confirmCompleteOrder = async () => {
  const orderId = orderToCompleteId.value;
  if (!orderId) return;

  isCompleteOrderModalOpen.value = false;
  completingOrderId.value = orderId;

  try {
    await orderService.completeOrder(orderId);

    orders.value = orders.value.map((order) =>
      order.id === orderId
        ? {
            ...order,
            status: "COMPLETED",
            statusColor: getOrderStatusColor("COMPLETED"),
          }
        : order,
    );

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
    completingOrderId.value = null;
    orderToCompleteId.value = null;
  }
};

// State Modal Info (pengganti alert)
const isInfoModalOpen = ref(false);
const infoModalMessage = ref("");
const infoModalTitle = ref("");

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
    const res = await reviewService.createReview(reviewForm.productId, {
      order_item_id: reviewForm.orderItemId,
      rating: reviewForm.rating,
      comment: reviewForm.comment || null,
    });

    const newReviewId = res.data?.data?.id || res.data?.id || true;

    orders.value = orders.value.map((order) => ({
      ...order,
      items: order.items.map((it) =>
        it.id === reviewForm.orderItemId
          ? { ...it, review_id: newReviewId, hasReview: true }
          : it,
      ),
    }));

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