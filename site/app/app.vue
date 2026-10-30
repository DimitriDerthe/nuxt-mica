<template>
  <div class="mi site">
    <SiteHeader />
    <NuxtPage />
    <SiteFooter />
    <MiToaster position="bottom-center" />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const head = useLocaleHead()
const config = useRuntimeConfig()
// Social crawlers need absolute URLs: i18n base origin + app base path (GitHub Pages sub-path).
const siteUrl = `${config.public.i18n.baseUrl.replace(/\/$/, '')}${config.app.baseURL}`
const ogImage = `${siteUrl}og-image.png`
const canonical = computed(() => head.value.link?.find(l => l.rel === 'canonical')?.href ?? siteUrl)

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: [...(head.value.link ?? []), { rel: 'apple-touch-icon', href: `${config.app.baseURL}apple-touch-icon.png` }],
  meta: head.value.meta,
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareSourceCode',
      name: 'Mica',
      description: t('meta.description'),
      url: siteUrl,
      image: ogImage,
      codeRepository: config.public.repoUrl,
      programmingLanguage: ['Vue', 'TypeScript'],
      runtimePlatform: 'Nuxt 4',
      license: 'https://opensource.org/licenses/MIT',
      author: { '@type': 'Person', name: 'Dimitri Derthe' }
    })
  }]
}))
// Defaults for every page; pages call useSiteSeo again to override title and description.
useSiteSeo(() => t('meta.title'), () => t('meta.description'))
useSeoMeta({
  ogType: 'website',
  ogSiteName: 'Mica',
  ogUrl: () => canonical.value,
  ogImage,
  ogImageSecureUrl: ogImage,
  ogImageType: 'image/png',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => t('meta.ogImageAlt'),
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
  twitterImageAlt: () => t('meta.ogImageAlt'),
  robots: 'index, follow, max-image-preview:large',
  author: 'Dimitri Derthe',
  colorScheme: 'light dark',
  themeColor: [
    { content: '#F5F5F7', media: '(prefers-color-scheme: light)' },
    { content: '#000000', media: '(prefers-color-scheme: dark)' }
  ]
})
</script>

<style>
html { scroll-behavior: smooth; scroll-padding-top: 88px; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; }
.site { min-height: 100dvh; background: var(--mi-page); color: var(--mi-label); font-family: var(--mi-font); -webkit-font-smoothing: antialiased; overflow-x: clip; }
</style>
