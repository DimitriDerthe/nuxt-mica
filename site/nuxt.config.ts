import { fileURLToPath } from 'node:url'

// Marketing site of the Mica layer. It consumes the layer exactly like a user project would.
export default defineNuxtConfig({
  extends: ['..'],
  modules: ['@nuxtjs/i18n'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  experimental: { viewTransition: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
    }
  },
  runtimeConfig: {
    public: {
      // Where the interactive demos (the layer playground) are served. Override with NUXT_PUBLIC_SHOWCASE_URL.
      showcaseUrl: 'http://localhost:3000/showcase',
      repoUrl: 'https://github.com/DimitriDerthe/nuxt-mica'
    }
  },
  i18n: {
    defaultLocale: 'en',
    // Absolute origin for hreflang and canonical tags. Override in production with NUXT_PUBLIC_I18N_BASE_URL.
    baseUrl: 'http://localhost:3010',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' }
    ],
    detectBrowserLanguage: { useCookie: true, cookieKey: 'mi-lang', redirectOn: 'root' }
  },
  nitro: {
    prerender: { routes: ['/', '/fr'] },
    // Expose the layer's generated llms.txt and docs/api/*.md to server routes (useStorage('assets:mica')).
    serverAssets: [{ baseName: 'mica', dir: fileURLToPath(new URL('..', import.meta.url)), pattern: ['llms.txt', 'docs/api/*.md'] }]
  }
})
