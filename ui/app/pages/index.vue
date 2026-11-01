<template>
  <main dir="rtl" class="text-gray-900">
    <!-- Hero -->
    <section
      class="flex flex-col items-center justify-center px-4 pt-16 pb-20 gap-10 text-center"
    >
      <div class="relative w-72 sm:w-96">
        <svg
          viewBox="0 0 200 100"
          class="w-full h-auto text-gray-800"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linejoin="round"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path
            d="M20 60 L35 40 Q40 32 52 32 L120 32 Q132 32 140 40 L178 52 Q188 56 188 64 L188 68 L12 68 L12 64 Q12 60 20 60 Z"
          />
          <path d="M58 40 L72 22 L118 22 L132 40" />
          <g class="wheel" style="transform-origin: 52px 70px">
            <circle cx="52" cy="70" r="11" fill="white" />
            <path d="M52 62 V78 M44 70 H60" stroke-width="2" />
          </g>
          <g class="wheel" style="transform-origin: 148px 70px">
            <circle cx="148" cy="70" r="11" fill="white" />
            <path d="M148 62 V78 M140 70 H156" stroke-width="2" />
          </g>
          <line
            x1="0"
            y1="86"
            x2="200"
            y2="86"
            class="road"
            stroke="#d1d5db"
            stroke-width="2"
            stroke-dasharray="10 12"
          />
        </svg>
      </div>

      <div class="flex flex-col items-center gap-4">
        <h1 class="text-3xl sm:text-5xl font-bold leading-tight text-gray-900">
          ماشینت واقعاً چقدر می‌ارزه؟
        </h1>
        <p class="text-base sm:text-lg text-gray-500 max-w-lg leading-8">
          مشخصات خودرو را وارد کنید تا مدل هوش مصنوعی در چند ثانیه قیمت
          تقریبی آن را برایتان پیش‌بینی کند. قبل از خرید یا فروش، با اطلاعات
          تصمیم بگیرید.
        </p>
        <div class="flex items-center gap-3 mt-2">
          <a
            href="/predict"
            class="px-7 py-3 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            >قیمت ماشینم را بگو</a
          >
          <a
            href="#demo"
            class="px-5 py-3 rounded-md text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >اول یک نمونه ببینم</a
          >
        </div>
      </div>
    </section>

    <!-- Interactive demo -->
    <section id="demo" class="px-4 py-16 bg-gray-50">
      <div class="max-w-3xl mx-auto flex flex-col gap-10">
        <div class="text-center flex flex-col gap-2">
          <h2 class="text-2xl font-semibold">اسلایدر را حرکت بدهید</h2>
          <p class="text-gray-500">
            ببینید سن و کارکرد خودرو چقدر روی قیمت اثر می‌گذارد.
          </p>
        </div>

        <div
          class="grid md:grid-cols-2 gap-8 items-center bg-white rounded-2xl border border-gray-200 p-6 sm:p-8"
        >
          <div class="flex flex-col gap-7">
            <label class="flex flex-col gap-3">
              <span class="flex justify-between text-sm">
                <span class="text-gray-500">سال ساخت</span>
                <span class="font-semibold">{{ fa(year) }}</span>
              </span>
              <input
                v-model.number="year"
                type="range"
                min="1390"
                max="1405"
                step="1"
                class="w-full accent-gray-900"
              />
            </label>

            <label class="flex flex-col gap-3">
              <span class="flex justify-between text-sm">
                <span class="text-gray-500">کارکرد</span>
                <span class="font-semibold">{{ fa(km) }} کیلومتر</span>
              </span>
              <input
                v-model.number="km"
                type="range"
                min="0"
                max="300000"
                step="5000"
                class="w-full accent-gray-900"
              />
            </label>
          </div>

          <div
            class="flex flex-col items-center justify-center gap-1 rounded-xl bg-gray-900 text-white py-8 px-4 text-center"
          >
            <span class="text-sm text-gray-400">قیمت تقریبی نمونه</span>
            <span class="text-3xl font-bold tabular-nums">{{ priceText }}</span>
            <span class="text-xs text-gray-400 mt-2"
              >برای مدل دقیق‌تر، مشخصات کامل را وارد کنید</span
            >
          </div>
        </div>
        <p class="text-xs text-gray-400 text-center -mt-6">
          این بخش فقط یک نمایش ساده است و قیمت واقعی را نشان نمی‌دهد.
        </p>
      </div>
    </section>

    <!-- Feature slider -->
    <section class="px-4 py-20">
      <div class="max-w-2xl mx-auto flex flex-col gap-8">
        <h2 class="text-2xl font-semibold text-center">
          چرا قیمت‌گذاری با هوش مصنوعی؟
        </h2>

        <div
          class="relative"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
          @focusin="paused = true"
          @focusout="paused = false"
        >
          <div
            class="overflow-hidden rounded-2xl border border-gray-200 touch-pan-y select-none"
            @pointerdown="onDown"
            @pointerup="onUp"
          >
            <div
              class="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
              :style="{ transform: `translateX(${index * 100}%)` }"
            >
              <article
                v-for="(s, i) in slides"
                :key="s.title"
                class="w-full shrink-0 flex flex-col items-center text-center gap-4 px-8 py-12"
                :aria-hidden="i !== index"
              >
                <span
                  class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="w-6 h-6 text-gray-800"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path :d="s.icon" />
                  </svg>
                </span>
                <h3 class="text-xl font-semibold">{{ s.title }}</h3>
                <p class="text-gray-500 leading-8 max-w-md">{{ s.text }}</p>
              </article>
            </div>
          </div>

          <div class="flex items-center justify-between mt-5">
            <button
              type="button"
              class="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
              aria-label="اسلاید قبلی"
              @click="go(index - 1)"
            >
              ›
            </button>

            <div class="flex gap-2">
              <button
                v-for="(s, i) in slides"
                :key="s.title"
                type="button"
                class="h-2 rounded-full transition-all duration-300"
                :class="i === index ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'"
                :aria-label="`رفتن به اسلاید ${fa(i + 1)}`"
                @click="go(i)"
              />
            </div>

            <button
              type="button"
              class="w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
              aria-label="اسلاید بعدی"
              @click="go(index + 1)"
            >
              ‹
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Steps -->
    <section class="px-4 pb-20">
      <div class="max-w-3xl mx-auto flex flex-col gap-10">
        <h2 class="text-2xl font-semibold text-center">
          سه قدم تا قیمت واقعی
        </h2>
        <ol class="grid sm:grid-cols-3 gap-6">
          <li
            v-for="(st, i) in steps"
            :key="st.title"
            class="flex flex-col gap-2 p-5 rounded-xl border border-gray-200"
          >
            <span class="text-sm text-gray-400">قدم {{ fa(i + 1) }}</span>
            <h3 class="font-semibold">{{ st.title }}</h3>
            <p class="text-sm text-gray-500 leading-7">{{ st.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="px-4 pb-24">
      <div
        class="max-w-3xl mx-auto flex flex-col items-center gap-5 text-center rounded-2xl bg-gray-900 text-white px-6 py-14"
      >
        <h2 class="text-2xl sm:text-3xl font-semibold">
          ده ثانیه وقت دارید؟
        </h2>
        <p class="text-gray-400 max-w-md leading-8">
          همین حالا مشخصات خودرو را وارد کنید و بدانید قیمت منصفانه‌اش چقدر است.
        </p>
        <a
          href="/predict"
          class="px-7 py-3 rounded-md bg-white text-gray-900 text-sm font-medium hover:bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >شروع پیش‌بینی</a
        >
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";


const fa = (n: number) => n.toLocaleString("fa-IR", { useGrouping: false });
const faSep = (n: number) => n.toLocaleString("fa-IR");


const year = ref(1400);
const km = ref(60000);

const priceText = computed(() => {
  const age = 1405 - year.value;
  const base = 1800; // میلیون تومان، فقط برای نمایش
  const ageFactor = Math.pow(0.92, age);
  const kmFactor = 1 - (km.value / 300000) * 0.35;
  const mid = base * ageFactor * kmFactor;
  const low = Math.round(mid * 0.95);
  const high = Math.round(mid * 1.05);
  const fmt = (v: number) =>
    v >= 1000 ? `${faSep(Math.round(v / 10) / 100)} میلیارد` : faSep(v);
  return `${fmt(low)} تا ${fmt(high)} میلیون`.replace(
    "میلیارد میلیون",
    "میلیارد"
  );
});

const slides = [
  {
    title: "جواب در چند ثانیه",
    text: "دیگر لازم نیست ساعت‌ها آگهی‌ها را بالا و پایین کنید. مشخصات را بنویسید و قیمت را همان لحظه ببینید.",
    icon: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  },
  {
    title: "بر پایه داده، نه حدس",
    text: "مدل از روی هزاران خودروی واقعی یاد گرفته که سال، کارکرد و وضعیت چطور روی قیمت اثر می‌گذارند.",
    icon: "M3 3v18h18 M7 14v3 M12 9v8 M17 5v12",
  },
  {
    title: "چانه‌زنی با پشتوانه",
    text: "وقتی قیمت منصفانه را می‌دانید، هم موقع خرید دست‌تان پر است و هم موقع فروش.",
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4",
  },
  {
    title: "ساده و بدون ثبت‌نام",
    text: "فرم کوتاه، نتیجه روشن. بدون حساب کاربری و بدون پیچیدگی.",
    icon: "M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  },
];

const index = ref(0);
const paused = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

const go = (i: number) => {
  index.value = (i + slides.length) % slides.length;
};

let startX = 0;
const onDown = (e: PointerEvent) => {
  startX = e.clientX;
};
const onUp = (e: PointerEvent) => {
  const dx = e.clientX - startX;
 
  if (dx < -40) go(index.value + 1);
  else if (dx > 40) go(index.value - 1);
};

onMounted(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  timer = setInterval(() => {
    if (!paused.value) go(index.value + 1);
  }, 5000);
});
onBeforeUnmount(() => clearInterval(timer));

/* ---------- steps ---------- */
const steps = [
  {
    title: "مشخصات را وارد کنید",
    text: "برند، مدل، سال ساخت و کارکرد خودرو را انتخاب کنید.",
  },
  {
    title: "مدل تحلیل می‌کند",
    text: "هوش مصنوعی مشخصات شما را با داده‌های بازار مقایسه می‌کند.",
  },
  {
    title: "قیمت را ببینید",
    text: "یک بازه قیمت منصفانه دریافت کنید و با اطمینان تصمیم بگیرید.",
  },
];
</script>

<style scoped>
.wheel {
  transform-box: view-box;
  animation: spin 2.4s linear infinite;
}
.road {
  animation: drive 1s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes drive {
  to {
    stroke-dashoffset: 22;
  }
}
@media (prefers-reduced-motion: reduce) {
  .wheel,
  .road {
    animation: none;
  }
}
</style>