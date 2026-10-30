import { join } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  components: [{ path: join(import.meta.dirname, 'app/components'), pathPrefix: false }],
  css: [join(import.meta.dirname, 'app/assets/css/mi.css')],
  runtimeConfig: {
    public: {
      mi: { primary: '#0071E3', secondary: '#BF4800', mode: 'system' }
    }
  },
  app: {
    head: {
      meta: [{ name: 'color-scheme', content: 'light dark' }]
    }
  }
})
