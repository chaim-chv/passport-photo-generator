export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  devtools: { enabled: false },
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
  },
})
