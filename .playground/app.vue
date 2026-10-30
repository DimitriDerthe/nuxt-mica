<template>
  <div class="mi shell">
    <div class="bar">
      <MiLocalNav v-model="current" class="nav" :items="items" aria-label="Playground pages">
        <template #title>
          <NuxtLink to="/" class="shell-brand" aria-label="Mica, home">
            <MiLogo class="shell-logo" :size="24" decorative />
            <MiLogo class="shell-logo shell-logo--short" variant="short" :size="20" decorative />
          </NuxtLink>
        </template>
        <template #action>
          <MiThemeSwitcher icon-only />
        </template>
      </MiLocalNav>
    </div>
    <main class="shell-main" :class="{ 'shell-main--full': fullBleed }">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({ link: [{ rel: 'icon', type: 'image/svg+xml', href: `${useRuntimeConfig().app.baseURL}favicon.svg` }] })

const route = useRoute()
const pages = ['index', 'buttons', 'controls', 'inputs', 'navigation', 'feedback', 'content', 'charts', 'showcase']
const items = pages.map(id => ({ id, label: id === 'index' ? 'Foundations' : id[0]!.toUpperCase() + id.slice(1) }))

// The dashboard, landing and blog demos are whole screens of their own and keep the full viewport; the status page is a regular page.
const fullBleed = computed(() => /^\/showcase\/(dashboard|landing|blog)/.test(route.path))

const current = computed({
  get: () => (route.path === '/' ? 'index' : route.path.split('/')[1] ?? 'index'),
  set: id => navigateTo(id === 'index' ? '/' : '/' + id)
})
</script>

<style>
body { margin: 0; }
.shell { min-height: 100dvh; background: var(--mi-page); color: var(--mi-label); }
.bar { position: sticky; top: 0; z-index: 50; max-width: 1232px; margin: 0 auto; padding: 12px 16px 0; box-sizing: border-box; }
/* backdrop-filter must live on the outermost animated element: an animated/view-transition ancestor becomes the backdrop root and kills the blur */
.bar .nav { top: 0; view-transition-name: mi-bar; -webkit-backdrop-filter: blur(28px) saturate(190%); backdrop-filter: blur(28px) saturate(190%); animation: mi-drop var(--mi-dur-4) var(--mi-ease) backwards; }
.shell-brand { display: inline-flex; align-items: center; min-height: 44px; border-radius: 8px; color: var(--mi-label); }
.shell-brand:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 4px; }
.shell-brand .shell-logo--short { display: none; }
@media (max-width: 640px) { .shell-brand .shell-logo { display: none; } .shell-brand .shell-logo--short { display: inline-block; } }

/* Load: header drops in, page content rises. Transform + opacity only. */
@keyframes mi-drop { from { opacity: 0; transform: translate3d(0, -14px, 0) } }
@keyframes mi-rise { from { opacity: 0; transform: translate3d(0, 14px, 0) } }
.shell-main { max-width: 1232px; margin: 0 auto; padding-inline: 16px; box-sizing: border-box; animation: mi-rise var(--mi-dur-4) var(--mi-ease) 80ms backwards; } /* backwards, not both: a filled transform would trap position:fixed children */
/* Same measure as the site: a 1200px navbar over 1200px of content. */
.shell > .shell-main:not(.shell-main--full) > * { padding-inline: 0 !important; margin-inline: 0 !important; max-width: none !important; } /* the page gutter lives here, so every page lines up with the navbar */
.shell > .shell-main.shell-main--full { max-width: none; padding-inline: 0; }

/* Route changes: native View Transitions (compositor-only), header stays put. */
::view-transition-group(mi-bar) { animation-duration: 0s; }
::view-transition-old(root) { animation: mi-out 160ms var(--mi-ease-in-out) both; }
::view-transition-new(root) { animation: mi-in 320ms var(--mi-ease) 60ms both; }
@keyframes mi-out { to { opacity: 0; transform: translate3d(0, -6px, 0) } }
@keyframes mi-in { from { opacity: 0; transform: translate3d(0, 12px, 0) } }
@media (prefers-reduced-motion: reduce) {
  .bar .nav, .shell-main { animation: none; }
  ::view-transition-old(root), ::view-transition-new(root) { animation: none; }
}
</style>
