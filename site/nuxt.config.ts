import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Layer version, read from package.json (bumped together with the git tag by scripts/release.mjs).
const { version } = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as { version: string }

// Sub-path when hosted on GitHub Pages project pages (NUXT_APP_BASE_URL=/nuxt-mica/); '/' everywhere else.
const base = (process.env.NUXT_APP_BASE_URL ?? '/').replace(/\/?$/, '/')

// The group guides (docs/*.md), one markdown file per component (docs/api/MiName.md) and llms.txt, so the static build ships the AI docs it links to.
const docRoutes = ['../docs', '../docs/api'].flatMap(d => readdirSync(fileURLToPath(new URL(d, import.meta.url))).filter(f => f.endsWith('.md')).map(f => `${d.replace('..', '')}/${f}`))

// Absolute origin for hreflang, canonical tags, the sitemap and robots.txt (production: NUXT_PUBLIC_I18N_BASE_URL).
const origin = (process.env.NUXT_PUBLIC_I18N_BASE_URL ?? 'http://localhost:3010').replace(/\/$/, '')

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
  hooks: {
    // Writes sitemap.xml (every prerendered page, with its en/fr alternates) and robots.txt next to the static build.
    'nitro:init'(nitro) {
      const pages = new Set<string>()
      nitro.hooks.hook('prerender:route', (r) => {
        if (r.error || !r.contentType?.startsWith('text/html') || /\/(200|404)\.html$/.test(r.route)) return
        const route = r.route.startsWith(base) ? r.route : base + r.route.slice(1)
        pages.add(route.replace(/\/$/, '') || '/')
      })
      nitro.hooks.hook('prerender:done', () => {
        const url = (p: string) => `${origin}${p}`.replace(/&/g, '&amp;')
        const fr = `${base}fr`
        const entries = [...pages].filter(p => p !== fr && !p.startsWith(fr + '/')).sort().map((p) => {
          const rest = (p + '/').slice(base.length).replace(/\/$/, '')
          const alt = rest ? `${fr}/${rest}` : fr
          const links = [['en', p], ['fr', alt], ['x-default', p]].map(([l, h]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(h!)}"/>`).join('')
          return [p, alt].map(loc => `<url><loc>${url(loc)}</loc>${links}</url>`).join('\n')
        })
        const dir = nitro.options.output.publicDir
        writeFileSync(join(dir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`)
        writeFileSync(join(dir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}${base}sitemap.xml\n`)
      })
    }
  },
  runtimeConfig: {
    public: {
      // Where the interactive demos (the layer playground) are served. Override with NUXT_PUBLIC_SHOWCASE_URL.
      showcaseUrl: 'http://localhost:3000/showcase',
      repoUrl: 'https://github.com/DimitriDerthe/nuxt-mica',
      version
    }
  },
  // Blocks are shown as source; in the built site their composed elements drop the class names nothing selects.
  miAtomic: { strip: ['app/blocks'] },
  i18n: {
    defaultLocale: 'en',
    // Runtime value comes from NUXT_PUBLIC_I18N_BASE_URL; the build-time origin above feeds the sitemap.
    baseUrl: origin,
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
