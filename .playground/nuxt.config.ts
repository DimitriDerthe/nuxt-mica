export default defineNuxtConfig({
  extends: ['..'],
  // Sub-path when the demos are hosted next to the site (see scripts/build-pages.mjs).
  app: { baseURL: (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/?$/, '/') },
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  experimental: { viewTransition: true }
})
