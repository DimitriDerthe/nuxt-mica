<template>
  <header class="hd">
    <div class="hd__in">
      <NuxtLink :to="localePath('/')" class="hd__logo" aria-label="Mica">
        <MiLogo :size="24" decorative />
      </NuxtLink>
      <nav class="hd__nav" :aria-label="t('nav.label')">
        <NuxtLink :to="localePath('/components')" :class="{ on: inExplorer }" :aria-current="inExplorer ? 'page' : undefined">{{ t('nav.components') }}</NuxtLink>
        <NuxtLink v-for="l in links" :key="l.id" :to="localePath('/') + '#' + l.id">{{ t('nav.' + l.id) }}</NuxtLink>
      </nav>
      <div class="hd__end">
        <NuxtLink :to="switchLocalePath(otherLocale)" class="hd__lang" :hreflang="otherLocale" :aria-label="t('nav.switchTo')">
          {{ t('nav.switchShort') }}
        </NuxtLink>
        <MiThemeSwitcher icon-only :label="t('theme.label')" :labels="{ light: t('theme.light'), dark: t('theme.dark'), system: t('theme.system') }" />
        <MiButton size="small" :href="siteHref('/') + '#start'" class="hd__cta">{{ t('nav.start') }}</MiButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const siteHref = useSiteHref()
const switchLocalePath = useSwitchLocalePath()
const otherLocale = computed(() => (locale.value === 'en' ? 'fr' : 'en'))
const links = [{ id: 'theming' }, { id: 'craft' }, { id: 'ai' }, { id: 'showcase' }]
const route = useRoute()
const inExplorer = computed(() => /^\/(fr\/)?components/.test(route.path))
</script>

<style scoped>
.hd { position: sticky; top: 0; z-index: 40; padding: 10px 12px 0; }
.hd__in {
  display: flex; align-items: center; gap: 16px; max-width: 1200px; margin: 0 auto; height: 56px; padding: 0 10px 0 18px;
  border-radius: 18px; background: var(--mi-mat); box-shadow: 0 0 0 .5px var(--mi-mat-b), var(--mi-sh1);
  -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%);
}
.hd__logo { display: inline-flex; color: inherit; border-radius: 6px; }
.hd__nav { display: none; gap: 4px; margin: 0 auto; }
.hd__nav a { padding: 6px 12px; border-radius: 999px; font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none; transition: color var(--mi-dur-1) var(--mi-ease), background-color var(--mi-dur-1) var(--mi-ease); }
.hd__nav a:hover { color: var(--mi-label); background: var(--mi-fill4); }
.hd__nav a.on { color: var(--mi-label); background: var(--mi-fill4); }
.hd__end { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.hd__lang { display: grid; place-items: center; min-width: 36px; height: 30px; padding: 0 8px; box-sizing: border-box; border-radius: 9px; font-size: 13px; font-weight: 600; color: var(--mi-label2); text-decoration: none; background: var(--mi-fill4); }
.hd__lang:hover { color: var(--mi-label); }
.hd__logo:focus-visible, .hd__nav a:focus-visible, .hd__lang:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
@media (min-width: 960px) { .hd__nav { display: flex; } .hd__end { margin-left: 0; } }
@media (max-width: 420px) { .hd__cta { display: none; } }
</style>
