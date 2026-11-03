<template>
  <header class="hd mi:sticky mi:top-0 mi:z-40 mi:pt-2.5 mi:px-3 mi:pb-0">
    <div class="hd__in mi:flex mi:items-center mi:gap-4 mi:max-w-300 mi:my-0 mi:mx-auto mi:h-14 mi:pt-0 mi:pr-2.5 mi:pb-0 mi:pl-4.5 mi:rounded-[18px] mi:bg-mat mi:shadow-[0_0_0_.5px_var(--mi-mat-b),_var(--mi-sh1)]">
      <NuxtLink :to="localePath('/')" class="hd__logo mi:inline-flex mi:text-inherit mi:rounded-[6px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" aria-label="Mica">
        <MiLogo :size="24" decorative />
      </NuxtLink>
      <nav class="hd__nav mi:hidden mi:gap-1 mi:my-0 mi:mx-auto mi:min-[960px]:flex" :aria-label="t('nav.label')">
        <NuxtLink class="mi:[.hd__nav_a&]:py-1.5 mi:[.hd__nav_a&]:px-3 mi:[.hd__nav_a&]:rounded-[999px] mi:[.hd__nav_a&]:text-[14px] mi:[.hd__nav_a&]:font-medium mi:[.hd__nav_a&]:[text-decoration:none] mi:[.hd__nav_a&]:[transition:color_var(--mi-dur-1)_var(--mi-ease),_background-color_var(--mi-dur-1)_var(--mi-ease)] mi:[.hd__nav_a&:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:[.hd__nav_a&:focus-visible]:outline-offset-[2px]" :to="localePath('/components')" :class="{ on: inExplorer }" :aria-current="inExplorer ? 'page' : undefined">{{ t('nav.components') }}</NuxtLink>
        <NuxtLink class="mi:[.hd__nav_a&]:py-1.5 mi:[.hd__nav_a&]:px-3 mi:[.hd__nav_a&]:rounded-[999px] mi:[.hd__nav_a&]:text-[14px] mi:[.hd__nav_a&]:font-medium mi:[.hd__nav_a&]:[text-decoration:none] mi:[.hd__nav_a&]:[transition:color_var(--mi-dur-1)_var(--mi-ease),_background-color_var(--mi-dur-1)_var(--mi-ease)] mi:[.hd__nav_a&:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:[.hd__nav_a&:focus-visible]:outline-offset-[2px]" :to="localePath('/blocks')" :class="{ on: inBlocks }" :aria-current="inBlocks ? 'page' : undefined">{{ t('nav.blocks') }}</NuxtLink>
        <NuxtLink class="mi:[.hd__nav_a&]:py-1.5 mi:[.hd__nav_a&]:px-3 mi:[.hd__nav_a&]:rounded-[999px] mi:[.hd__nav_a&]:text-[14px] mi:[.hd__nav_a&]:font-medium mi:[.hd__nav_a&]:[text-decoration:none] mi:[.hd__nav_a&]:[transition:color_var(--mi-dur-1)_var(--mi-ease),_background-color_var(--mi-dur-1)_var(--mi-ease)] mi:[.hd__nav_a&:focus-visible]:[outline:2px_solid_var(--mi-p)] mi:[.hd__nav_a&:focus-visible]:outline-offset-[2px]" v-for="l in links" :key="l.id" :to="localePath('/') + '#' + l.id">{{ t('nav.' + l.id) }}</NuxtLink>
      </nav>
      <div class="hd__end mi:flex mi:items-center mi:gap-2 mi:ml-auto mi:min-[960px]:ml-0">
        <NuxtLink :to="switchLocalePath(otherLocale)" class="hd__lang mi:grid mi:place-items-center mi:min-w-9 mi:h-7.5 mi:py-0 mi:px-2 mi:box-border mi:rounded-[9px] mi:text-[13px] mi:font-semibold mi:text-label2 mi:[text-decoration:none] mi:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :hreflang="otherLocale" :aria-label="t('nav.switchTo')">
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
const inBlocks = computed(() => /^\/(fr\/)?blocks/.test(route.path))
</script>

<style scoped>
.hd__in {
  -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%);
}
.hd__nav a { color: var(--mi-label2); }
.hd__nav a:hover { color: var(--mi-label); background: var(--mi-fill4); }
.hd__nav a.on { color: var(--mi-label); background: var(--mi-fill4); }
.hd__lang:hover { color: var(--mi-label); }
@media (max-width: 420px) { .hd__cta { display: none; } }
</style>
