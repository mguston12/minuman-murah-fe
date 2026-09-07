import { ref, computed } from "vue";
import { voucherService } from "../services/apiServices";

/**
 * useVoucher
 * -----------------------------------------------------------------------
 * Composable pengelola voucher checkout.
 *
 * CATATAN ADAPTASI:
 * Versi asli composable ini dibuat untuk Nuxt (pakai `useCookie`,
 * `useRuntimeConfig`, dan `$fetch` — semua itu auto-import khusus Nuxt).
 * Project ini bukan Nuxt (pakai vue-router manual + apiServices.js
 * berbasis axios), jadi:
 *  - request HTTP dialihkan lewat `voucherService` (apiServices.js)
 *  - token auth otomatis ditangani oleh axios instance di apiServices.js,
 *    jadi tidak perlu useCookie di sini
 *  - subtotal & daftar produk di keranjang diterima sebagai parameter
 *    (ref atau function) supaya composable ini tidak terikat ke struktur
 *    state cart tertentu
 *
 * PENTING: composable ini memanggil `voucherService.validateVoucher(...)`
 * yang mengarah ke endpoint POST /vouchers/validate. Kalau endpoint itu
 * belum ada di apiServices.js, tambahkan:
 *
 *   validateVoucher: (payload) => apiClient.post("/vouchers/validate", payload),
 *
 * di dalam object voucherService (apiServices.js), sejajar dengan
 * getApplicable & checkVoucher yang sudah ada.
 *
 * @param {import('vue').Ref<number> | (() => number)} getSubTotal
 *        subtotal keranjang, boleh berupa ref atau function.
 * @param {() => Array<number|string>} getProductIds
 *        function yang mengembalikan array variant_id/product_id di cart.
 */
export const useVoucher = (getSubTotal, getProductIds) => {
  const vouchers = ref([]);
  const selectedVoucher = ref(null);
  const discountAmount = ref(0);
  const isLoading = ref(false);
  const error = ref(null);

  const resolveSubTotal = () =>
    typeof getSubTotal === "function"
      ? getSubTotal()
      : (getSubTotal?.value ?? 0);

  const resolveProductIds = () =>
    typeof getProductIds === "function" ? getProductIds() : [];

  const fetchApplicableVouchers = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const res = await voucherService.getApplicable({
        product_ids: resolveProductIds(),
        sub_total: resolveSubTotal(),
      });

      vouchers.value = res.data?.data || res.data || [];
    } catch (err) {
      error.value = err?.response?.data?.message || "Gagal mengambil voucher";
    } finally {
      isLoading.value = false;
    }
  };

  const validateVoucherCode = async (code) => {
    if (!code) return false;

    try {
      isLoading.value = true;
      error.value = null;

      const res = await voucherService.validateVoucher({
        code,
        product_ids: resolveProductIds(),
        sub_total: resolveSubTotal(),
      });

      const data = res.data?.data || res.data;
      const voucher = data?.voucher || data;

      if (!voucher) {
        selectedVoucher.value = null;
        discountAmount.value = 0;
        error.value = "Voucher tidak valid atau sudah kedaluwarsa.";
        return false;
      }

      selectedVoucher.value = voucher;
      discountAmount.value = Number(data?.discount_amount || 0);
      return true;
    } catch (err) {
      selectedVoucher.value = null;
      discountAmount.value = 0;
      error.value = err?.response?.data?.message || "Voucher tidak valid";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const applyVoucher = (voucher, discount) => {
    selectedVoucher.value = voucher;
    discountAmount.value = discount;
  };

  const removeVoucher = () => {
    selectedVoucher.value = null;
    discountAmount.value = 0;
    error.value = null;
  };

  const applicableVouchers = computed(() => vouchers.value);

  return {
    vouchers,
    selectedVoucher,
    discountAmount,
    applicableVouchers,
    isLoading,
    errorVoucher: error,
    fetchApplicableVouchers,
    validateVoucherCode,
    applyVoucher,
    removeVoucher,
  };
};
