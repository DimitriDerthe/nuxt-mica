<template>
  <footer class="ft mi:max-w-300 mi:my-0 mi:mx-auto mi:pt-16 mi:px-6 mi:pb-8 mi:border-t mi:border-t-sep">
    <div class="ft__in mi:grid mi:gap-9 mi:grid-cols-[1fr] mi:min-[720px]:grid-cols-[2fr_1fr_1fr]">
      <div class="ft__brand mi:grid mi:gap-2.5 mi:content-start mi:max-w-[36ch]">
        <MiLogo :size="26" />
        <MiText variant="subheadline" tone="label2">{{ t('footer.tagline') }}</MiText>
        <MiText variant="footnote" tone="label3">{{ t('footer.built') }}</MiText>
      </div>
      <nav class="ft__col mi:grid mi:gap-2.5 mi:content-start" :aria-label="t('footer.product')">
        <MiText class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" variant="footnote" weight="semibold">{{ t('footer.product') }}</MiText>
        <NuxtLink class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :to="localePath('/components')">{{ t('nav.components') }}</NuxtLink>
        <NuxtLink class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :to="localePath('/') + '#theming'">{{ t('nav.theming') }}</NuxtLink>
        <NuxtLink class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :to="localePath('/') + '#craft'">{{ t('nav.craft') }}</NuxtLink>
        <a class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :href="config.public.showcaseUrl">{{ t('nav.showcase') }}</a>
      </nav>
      <nav class="ft__col mi:grid mi:gap-2.5 mi:content-start" :aria-label="t('footer.resources')">
        <MiText class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" variant="footnote" weight="semibold">{{ t('footer.resources') }}</MiText>
        <NuxtLink class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :to="localePath('/') + '#start'">{{ t('nav.start') }}</NuxtLink>
        <a class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :href="config.public.repoUrl + '/blob/main/llms.txt'">llms.txt</a>
        <a class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :href="config.public.repoUrl">{{ t('nav.github') }}</a>
        <a class="mi:[.ft__col_a&]:[text-decoration:none] mi:[.ft__col_a&]:w-fit" :href="config.public.repoUrl + '/blob/main/LICENSE'">{{ t('footer.license') }}</a>
      </nav>
    </div>
    <div class="ft__base mi:flex mi:flex-wrap mi:justify-between mi:gap-3 mi:mt-12 mi:pt-5 mi:border-t mi:border-t-sep">
      <MiText variant="caption" tone="label3">{{ t('footer.rights') }}</MiText>
      <NuxtLink :to="switchLocalePath(locale === 'en' ? 'fr' : 'en')" class="ft__lang mi:text-[14px] mi:text-label2 mi:[text-decoration:none] mi:w-fit">{{ t('nav.switchTo') }}</NuxtLink>
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
.ft__col a { font-size: 14px; color: var(--mi-label2); }
.ft__col a:hover, .ft__lang:hover { color: var(--mi-label); }
</style>
