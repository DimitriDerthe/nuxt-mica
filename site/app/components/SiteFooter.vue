<template>
  <footer class="ft">
    <div class="ft__in">
      <div class="ft__brand">
        <MiLogo :size="26" />
        <MiText variant="subheadline" tone="label2">{{ t('footer.tagline') }}</MiText>
        <MiText variant="footnote" tone="label3">{{ t('footer.built') }}</MiText>
      </div>
      <nav class="ft__col" :aria-label="t('footer.product')">
        <MiText variant="footnote" weight="semibold">{{ t('footer.product') }}</MiText>
        <NuxtLink :to="localePath('/components')">{{ t('nav.components') }}</NuxtLink>
        <NuxtLink :to="localePath('/') + '#theming'">{{ t('nav.theming') }}</NuxtLink>
        <NuxtLink :to="localePath('/') + '#craft'">{{ t('nav.craft') }}</NuxtLink>
        <a :href="config.public.showcaseUrl">{{ t('nav.showcase') }}</a>
      </nav>
      <nav class="ft__col" :aria-label="t('footer.resources')">
        <MiText variant="footnote" weight="semibold">{{ t('footer.resources') }}</MiText>
        <NuxtLink :to="localePath('/') + '#start'">{{ t('nav.start') }}</NuxtLink>
        <a :href="config.public.repoUrl + '/blob/main/llms.txt'">llms.txt</a>
        <a :href="config.public.repoUrl">{{ t('nav.github') }}</a>
        <a :href="config.public.repoUrl + '/blob/main/LICENSE'">{{ t('footer.license') }}</a>
      </nav>
    </div>
    <div class="ft__base">
      <MiText variant="caption" tone="label3">{{ t('footer.rights') }}</MiText>
      <NuxtLink :to="switchLocalePath(locale === 'en' ? 'fr' : 'en')" class="ft__lang">{{ t('nav.switchTo') }}</NuxtLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const config = useRuntimeConfig()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
</script>

<style scoped>
.ft { max-width: 1200px; margin: 0 auto; padding: 64px 24px 32px; border-top: 1px solid var(--mi-sep); }
.ft__in { display: grid; gap: 36px; grid-template-columns: 1fr; }
@media (min-width: 720px) { .ft__in { grid-template-columns: 2fr 1fr 1fr; } }
.ft__brand { display: grid; gap: 10px; align-content: start; max-width: 36ch; }
.ft__col { display: grid; gap: 10px; align-content: start; }
.ft__col a, .ft__lang { font-size: 14px; color: var(--mi-label2); text-decoration: none; width: fit-content; }
.ft__col a:hover, .ft__lang:hover { color: var(--mi-label); }
.ft__base { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; margin-top: 48px; padding-top: 20px; border-top: 1px solid var(--mi-sep); }
</style>
