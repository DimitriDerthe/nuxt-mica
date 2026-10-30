import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Sub-path when hosted on GitHub Pages project pages (NUXT_APP_BASE_URL=/nuxt-mica/); '/' everywhere else.
const base = (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/?$/, '/')

// The group guides (docs/*.md), one markdown file per component (docs/api/MiName.md) and llms.txt, so the static build ships the AI docs it links to.
const docRoutes = ['../docs', '../docs/api'].flatMap(d => readdirSync(fileURLToPath(new URL(d, import.meta.url))).filter(f => f.endsWith('.md')).map(f => `${d.replace('..', '')}/${f}`))

// Marketing site of the Mica layer. It consumes the layer exactly like a user project would.
export default defineNuxtConfig({
  extends: ['..'],
  modules: ['@nuxtjs/i18n'],
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  experimental: { viewTransition: true },
  app: {
    baseURL: base,
    head: {
      htmlAttrs: { lang: 'en' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }]
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
    // /demo is the playground bundle, built separately and copied in by scripts/build-pages.mjs.
    prerender: { routes: ['/', '/fr', '/llms.txt', ...docRoutes], ignore: [`${base}demo`, '/demo'] },
    // Expose the layer's generated llms.txt and docs/api/*.md to server routes (useStorage('assets:mica')).
    serverAssets: [{ baseName: 'mica', dir: fileURLToPath(new URL('..', import.meta.url)), pattern: ['llms.txt', 'docs/*.md', 'docs/api/*.md'] }]
  }
})
