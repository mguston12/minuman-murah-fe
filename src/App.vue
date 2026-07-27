<script setup>
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <div
    class="min-h-screen bg-[#FAF6F0] text-gray-900 font-sans flex flex-col justify-between"
  >
    <Header />

    <RouterView />

    <Footer />
  </div>
</template>
