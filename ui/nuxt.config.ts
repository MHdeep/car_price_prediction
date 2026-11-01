// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    // Proxy API requests to backend for cookie handling
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          // Don't rewrite path - keep /api prefix
        },
      },
    },
  },
  runtimeConfig: {
    public: {
      // Use relative URL since we're proxying through Vite
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
      appName: 'قیمت‌یاب خودرو',
    },
  },
  typescript: {
    strict: true,
  },
})