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
useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang },
  link: head.value.link,
  meta: head.value.meta,
  title: t('meta.title')
}))
useSeoMeta({ description: () => t('meta.description'), ogTitle: () => t('meta.title'), ogDescription: () => t('meta.description') })
</script>

<style>
html { scroll-behavior: smooth; scroll-padding-top: 88px; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
body { margin: 0; }
.site { min-height: 100dvh; background: var(--mi-page); color: var(--mi-label); font-family: var(--mi-font); -webkit-font-smoothing: antialiased; overflow-x: clip; }
</style>
