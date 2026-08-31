<script setup>
import { ref, onMounted } from "vue";
import logoMM from "../assets/logo-3.png";
import { publicConfigService } from "../services/apiServices";

const currentYear = new Date().getFullYear();

const socialLinks = ref({
  instagram: "#",
  tiktok: "#",
  facebook: "#",
});

const footerNav = {
  bantuan: [
    { name: "Tentang Kami", href: "/about-us" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms and Conditions", href: "#" },
    { name: "Hubungi Kami", href: "/about-us" },
  ],
};

const fetchSocialConfigs = async () => {
  try {
    const [igRes, ttRes, fbRes] = await Promise.allSettled([
      publicConfigService.getConfigByKey("social_instagram"),
      publicConfigService.getConfigByKey("social_tiktok"),
      publicConfigService.getConfigByKey("social_facebook"),
    ]);

    if (igRes.status === "fulfilled") {
      socialLinks.value.instagram =
        igRes.value?.data?.data?.casted_value ||
        igRes.value?.data?.data?.value ||
        "#";
    }
    if (ttRes.status === "fulfilled") {
      socialLinks.value.tiktok =
        ttRes.value?.data?.data?.casted_value ||
        ttRes.value?.data?.data?.value ||
        "#";
    }
    if (fbRes.status === "fulfilled") {
      socialLinks.value.facebook =
        fbRes.value?.data?.data?.casted_value ||
        fbRes.value?.data?.data?.value ||
        "#";
    }
  } catch (error) {
    console.error("Gagal mengambil konfigurasi media sosial:", error);
  }
};

onMounted(() => {
  fetchSocialConfigs();
});
</script>

<template>
  <footer
    class="w-full bg-black pt-12 pb-6 border-t border-gray-800 text-gray-300"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10">
        <!-- Kolom 1: Branding -->
        <div class="md:col-span-2 space-y-3 md:pr-12">
          <a href="#" class="inline-flex items-center gap-3 group">
            <img
              :src="logoMM"
              alt="Minuman Murah"
              class="h-12 w-auto object-contain"
            />
            <span
              class="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity"
            >
              Minuman Murah
            </span>
          </a>

          <p class="text-xs text-gray-400 leading-relaxed max-w-sm">
            Belanja minuman murah, lengkap, dan cepat <br />
            sampai ke rumahmu.
          </p>
        </div>

        <!-- Kolom 2: Bantuan -->
        <div class="md:col-span-1">
          <h4 class="font-bold text-white text-xs mb-3.5">Bantuan</h4>
          <ul class="space-y-2 text-xs text-gray-400">
            <li v-for="item in footerNav.bantuan" :key="item.name">
              <a :href="item.href" class="hover:text-white transition-colors">
                {{ item.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Kolom 3: Socials & Store Hours -->
        <div class="md:col-span-1 space-y-5">
          <div>
            <h4 class="font-bold text-white text-xs mb-3">OUR SOCIALS</h4>
            <div class="flex items-center gap-3.5 text-white">
              <!-- Instagram -->
              <a
                :href="socialLinks.instagram"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#D4AF37] transition-colors"
                title="Instagram"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>

              <!-- TikTok -->
              <a
                :href="socialLinks.tiktok"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#D4AF37] transition-colors"
                title="TikTok"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12.525 0h3.08c.12 1.424.73 2.747 1.722 3.693.978.932 2.278 1.464 3.673 1.493V8.3c-1.89-.009-3.64-.633-5.06-1.714v7.711c0 4.19-3.41 7.589-7.616 7.589-4.205 0-7.615-3.399-7.615-7.589 0-4.19 3.41-7.589 7.615-7.589 1.05 0 2.05.21 2.96.592V10.8c-.85-.45-1.83-.7-2.96-.7-2.61 0-4.73 2.11-4.73 4.7 0 2.59 2.12 4.7 4.73 4.7 2.61 0 4.73-2.11 4.73-4.7V0z"
                  />
                </svg>
              </a>

              <!-- Facebook -->
              <a
                :href="socialLinks.facebook"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-[#D4AF37] transition-colors"
                title="Facebook"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- STORE HOURS -->
          <div>
            <h4 class="font-bold text-white text-xs mb-1">STORE HOURS</h4>
            <p class="text-xs text-gray-400">Mon-Sun: 10:00 - 22:00</p>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-3"
      >
        <p>&copy; {{ currentYear }} Minuman Murah — Semua hak dilindungi.</p>
        <p class="text-gray-500">
          Pembayaran:
          <span class="font-medium text-gray-400"
            >VISA &bull; Mastercard &bull; BCA &bull; OVO &bull; GoPay</span
          >
        </p>
      </div>
    </div>
  </footer>
</template>
