<template>
  <div
    class="min-h-screen bg-black text-white flex flex-col justify-between items-center p-6 font-sans"
  >
    <!-- Header / Logo  -->
    <header class="w-full max-w-xl flex justify-center pt-6 pb-2">
      <div class="w-full max-w-xs sm:max-w-md md:max-w-lg flex justify-center">
        <img
          :src="logoMM"
          alt="Minuman Murah Logo"
          class="w-full h-auto max-h-36 md:max-h-48 object-contain drop-shadow-2xl"
        />
      </div>
    </header>

    <!-- Main Content -->
    <main
      class="w-full max-w-3xl flex flex-col items-center text-center my-auto space-y-8"
    >
      <!-- Headline -->
      <div class="space-y-3">
        <h1
          class="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none"
        >
          Coming <span class="text-brand-gold">Soon</span>
        </h1>
        <p class="text-base sm:text-xl text-brand-muted font-medium">
          Minuman Terbaik Dengan Harga Terbaik Segera Hadir!
        </p>
      </div>

      <!-- Countdown Timer -->
      <div class="grid grid-cols-4 gap-3 sm:gap-4 w-full max-w-lg">
        <div
          class="bg-brand-ink/80 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm shadow-xl"
        >
          <span class="block text-3xl sm:text-5xl font-black text-brand-gold">{{
            formatTime(timeLeft.days)
          }}</span>
          <span
            class="text-xs sm:text-sm font-semibold text-brand-muted tracking-wider uppercase mt-1 block"
            >HARI</span
          >
        </div>
        <div
          class="bg-brand-ink/80 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm shadow-xl"
        >
          <span class="block text-3xl sm:text-5xl font-black text-brand-gold">{{
            formatTime(timeLeft.hours)
          }}</span>
          <span
            class="text-xs sm:text-sm font-semibold text-brand-muted tracking-wider uppercase mt-1 block"
            >JAM</span
          >
        </div>
        <div
          class="bg-brand-ink/80 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm shadow-xl"
        >
          <span class="block text-3xl sm:text-5xl font-black text-brand-gold">{{
            formatTime(timeLeft.minutes)
          }}</span>
          <span
            class="text-xs sm:text-sm font-semibold text-brand-muted tracking-wider uppercase mt-1 block"
            >MENIT</span
          >
        </div>
        <div
          class="bg-brand-ink/80 border border-white/10 rounded-2xl p-3 sm:p-4 text-center backdrop-blur-sm shadow-xl"
        >
          <span class="block text-3xl sm:text-5xl font-black text-brand-gold">{{
            formatTime(timeLeft.seconds)
          }}</span>
          <span
            class="text-xs sm:text-sm font-semibold text-brand-muted tracking-wider uppercase mt-1 block"
            >DETIK</span
          >
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full text-center space-y-2 py-4">
      <div class="flex justify-center space-x-4 text-brand-muted text-sm">
        <a href="#" class="hover:text-brand-gold transition-colors"
          >Instagram</a
        >
        <span>•</span>
        <a href="#" class="hover:text-brand-gold transition-colors">TikTok</a>
        <span>•</span>
        <a href="#" class="hover:text-brand-gold transition-colors">Facebook</a>
      </div>
      <p class="text-xs text-brand-muted">
        &copy;
        2026 Minuman Murah
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import logoMM from "../assets/logo-2.png";

const currentYear = new Date().getFullYear();

const targetDate = new Date(`August 25, ${currentYear} 00:00:00`).getTime();

const timeLeft = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });
let timerInterval = null;

const updateCountdown = () => {
  const now = new Date().getTime();
  const difference = targetDate - now;

  if (difference > 0) {
    timeLeft.value.days = Math.floor(difference / (1000 * 60 * 60 * 24));
    timeLeft.value.hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    timeLeft.value.minutes = Math.floor(
      (difference % (1000 * 60 * 60)) / (1000 * 60),
    );
    timeLeft.value.seconds = Math.floor((difference % (1000 * 60)) / 1000);
  } else {
    clearInterval(timerInterval);
  }
};

const formatTime = (value) => String(value).padStart(2, "0");

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>
