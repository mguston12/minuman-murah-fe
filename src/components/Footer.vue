<script setup>
import logoMM from "../assets/logo-3.png";

const currentYear = new Date().getFullYear();

const footerNav = {
  belanja: [
    { name: "Wine", href: "/blog" },
    { name: "Whisky", href: "/blog" },
    { name: "Beer & Cider", href: "/blog" },
    { name: "Promo Spesial", href: "/blog" },
  ],
  bantuan: [
    { name: "Cara Belanja", href: "/privacy-policy" },
    { name: "Pengiriman", href: "#" },
    { name: "Pembayaran", href: "#" },
    { name: "Hubungi Kami", href: "/about-us" },
  ],
  sosmed: [
    { name: "Instagram", href: "#" },
    { name: "TikTok", href: "#" },
    { name: "Facebook", href: "#" },
    { name: "Twitter / X", href: "#" },
  ],
};
</script>

<template>
  <footer
    class="w-full bg-[#FAF6F0] pt-12 pb-6 border-t border-gray-200/60 text-gray-700"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Top Grid Section -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-8 pb-10">
        <!-- Col 1 & 2: Logo & Deskripsi -->
        <div class="md:col-span-2 space-y-3 pr-4">
          <a href="#" class="inline-block">
            <img
              :src="logoMM"
              alt="Minuman Murah"
              class="h-12 w-auto object-contain"
            />
          </a>
          <p class="text-xs text-gray-500 leading-relaxed max-w-sm">
            Belanja minuman murah, lengkap, dan cepat <br></br> sampai ke rumahmu.
          </p>
        </div>

        <!-- Col 3: Belanja -->
        <div>
          <h4 class="font-bold text-gray-900 text-xs mb-3.5">Belanja</h4>
          <ul class="space-y-2 text-xs text-gray-600">
            <li v-for="item in footerNav.belanja" :key="item.name">
              <a :href="item.href" class="hover:text-black transition-colors">{{
                item.name
              }}</a>
            </li>
          </ul>
        </div>

        <!-- Col 4: Bantuan -->
        <div>
          <h4 class="font-bold text-gray-900 text-xs mb-3.5">Bantuan</h4>
          <ul class="space-y-2 text-xs text-gray-600">
            <li v-for="item in footerNav.bantuan" :key="item.name">
              <a :href="item.href" class="hover:text-black transition-colors">{{
                item.name
              }}</a>
            </li>
          </ul>
        </div>

        <!-- Col 5: Ikuti Kami -->
        <div>
          <h4 class="font-bold text-gray-900 text-xs mb-3.5">Ikuti Kami</h4>
          <ul class="space-y-2 text-xs text-gray-600">
            <li v-for="item in footerNav.sosmed" :key="item.name">
              <a :href="item.href" class="hover:text-black transition-colors">{{
                item.name
              }}</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar Divider -->
      <div
        class="border-t border-gray-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3"
      >
        <p>&copy; {{ currentYear }} Minuman Murah — Semua hak dilindungi.</p>
        <p class="text-gray-500">
          Pembayaran:
          <span class="font-medium text-gray-600"
            >VISA &bull; Mastercard &bull; BCA &bull; OVO &bull; GoPay</span
          >
        </p>
      </div>
    </div>
  </footer>
</template>
