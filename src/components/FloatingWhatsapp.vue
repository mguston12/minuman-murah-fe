<script setup>
import { ref } from "vue";

const phoneNumber = "";
const defaultMessage = encodeURIComponent(
  "Halo Minuman Murah, saya ingin bertanya tentang produk.",
);

const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;
</script>

<template>
  <a
    :href="whatsappUrl"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat via WhatsApp"
    class="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group focus:outline-none"
  >
    <span
      class="absolute right-16 bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
    >
      Chat CS via WhatsApp
    </span>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-7 h-7 fill-current"
      viewBox="0 0 24 24"
    >
      <path
        d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.624zm6.052-4.148l.399.237c1.556.924 3.342 1.412 5.161 1.413 5.395 0 9.784-4.389 9.786-9.786.001-2.613-1.016-5.068-2.862-6.915-1.847-1.846-4.301-2.862-6.914-2.863-5.394 0-9.783 4.389-9.785 9.785-.001 1.884.523 3.719 1.517 5.319l.26.417-1.002 3.662 3.75-.983zm11.396-6.19c-.09-.15-.328-.24-.686-.42-.358-.18-2.119-1.046-2.447-1.165-.328-.12-.567-.18-.806.18-.239.36-.926 1.165-1.135 1.404-.209.24-.418.27-.776.09-.358-.18-1.512-.557-2.88-1.777-1.064-.95-1.783-2.124-1.992-2.483-.209-.36-.022-.554.157-.733.161-.16.358-.42.538-.63.179-.21.239-.36.358-.6.119-.24.06-.45-.03-.63-.09-.18-.806-1.944-1.105-2.665-.291-.702-.587-.606-.806-.617-.209-.011-.448-.011-.687-.011-.239 0-.627.09-.955.45-.328.36-1.254 1.228-1.254 2.997 0 1.769 1.284 3.477 1.463 3.717.179.24 2.527 3.859 6.122 5.411.856.369 1.524.59 2.045.755.859.272 1.641.233 2.259.141.69-.103 2.119-.866 2.417-1.706.299-.84.299-1.557.209-1.707z"
      />
    </svg>
  </a>
</template>
