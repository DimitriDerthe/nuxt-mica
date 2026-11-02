export default defineNuxtConfig({
  extends: ['..'],
  // Sub-path when the demos are hosted next to the site (see scripts/build-pages.mjs).
  app: { baseURL: (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/?$/, '/') },
  runtimeConfig: {
    // The marketing site, linked from the navbar. Override with NUXT_PUBLIC_SITE_URL.
    public: { siteUrl: 'http://localhost:3010' }
  },
  // The site link points outside this app: keep the crawler from prerendering it as a demo route.
  nitro: { prerender: { ignore: [(path: string) => path === process.env.NUXT_PUBLIC_SITE_URL] } },
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  experimental: { viewTransition: true }
})
