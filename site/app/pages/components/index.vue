<template>
  <main class="cx wrap">
    <header class="cx__head">
      <p class="eyebrow">{{ t('explorer.api') }}</p>
      <h1 class="cx__title">{{ t('explorer.title') }}</h1>
      <p class="cx__lead">{{ t('explorer.lead') }}</p>
    </header>

    <div class="cx__tools">
      <MiSearch v-model="q" :placeholder="t('explorer.search')" :aria-label="t('explorer.search')" hotkey="k" :cancelable="false" class="cx__search" />
      <div class="cx__chips" role="group" :aria-label="t('explorer.group')">
        <MiChip :model-value="group === ''" selectable tone="neutral" :label="t('explorer.all')" @update:model-value="group = ''" />
        <MiChip
          v-for="g in groups" :key="g" :model-value="group === g" selectable tone="neutral" :label="t('explorer.groups.' + g)"
          @update:model-value="on => (group = on ? g : '')"
        />
      </div>
    </div>

    <p class="cx__count" aria-live="polite">{{ t('explorer.count', { n: filtered.length }) }}</p>

    <template v-for="g in visibleGroups" :key="g">
      <section :id="g.toLowerCase()" class="cx__group" :aria-labelledby="'g-' + g">
        <h2 :id="'g-' + g" class="cx__gtitle">{{ t('explorer.groups.' + g) }} <span>{{ filtered.filter(c => c.group === g).length }}</span>
          <a :href="`${base}docs/${guideOf(g)}.md`" target="_blank" rel="noopener" class="cx__guide">{{ t('explorer.guide') }}</a>
        </h2>
        <ul class="cx__grid">
          <li v-for="c in filtered.filter(x => x.group === g)" :key="c.name">
            <NuxtLink :to="localePath('/components/' + toSlug(c.name))" class="card">
              <span class="card__name">
                <code>{{ c.name }}</code>
                <MiBadge v-if="c.vmodel" :label="t('explorer.vmodel')" tone="neutral" variant="outline" />
              </span>
              <span class="card__sum">{{ c.summary }}</span>
              <MiIcon name="arrow-right" :size="16" class="card__go" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>

    <MiEmptyState v-if="!filtered.length" icon="search" :title="t('explorer.noMatch', { q })" />
  </main>
</template>

<script setup lang="ts">
import { toSlug } from '~/utils/explorer'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { data } = await useFetch('/api/components', { query: { lang: locale } })
const list = computed(() => data.value ?? [])
const groups = computed(() => [...new Set(list.value.map(c => c.group))])

/** Guide file of a group (docs/<name>.md); Base is documented in foundations.md. */
const guideOf = (g: string) => (g === 'Base' ? 'foundations' : g.toLowerCase())

const base = useRuntimeConfig().app.baseURL
const q = ref(typeof route.query.q === 'string' ? route.query.q : '')
const group = ref(typeof route.query.group === 'string' ? route.query.group : '')
const filtered = computed(() => {
  const s = q.value.trim().toLowerCase()
  return list.value.filter(c => (!group.value || c.group === group.value)
    && (!s || c.name.toLowerCase().includes(s) || c.summary.toLowerCase().includes(s)))
})
const visibleGroups = computed(() => groups.value.filter(g => filtered.value.some(c => c.group === g)))

useSiteSeo(() => `${t('explorer.title')} · Mica`, () => t('explorer.lead'))
</script>

<style scoped>
.wrap { max-width: 1224px; margin: 0 auto; padding: 0 12px; box-sizing: border-box; }
.cx { padding-top: clamp(40px, 7vw, 88px); padding-bottom: 96px; }
.cx__head { display: grid; gap: 12px; max-width: 720px; animation: cx-in var(--mi-dur-4) var(--mi-ease) backwards; }
.eyebrow { margin: 0; font-size: 14px; font-weight: 600; color: var(--mi-p-text); }
.cx__title { margin: 0; font-size: clamp(40px, 6vw, 72px); line-height: 1; letter-spacing: -.05em; font-weight: 700; }
.cx__lead { margin: 0; font-size: clamp(16px, 1.5vw, 19px); line-height: 1.55; color: var(--mi-label2); max-width: 58ch; }
.cx__tools { position: sticky; top: 72px; z-index: 5; display: grid; gap: 12px; margin: 36px -12px 0; padding: 12px; border-radius: 18px; background: var(--mi-mat); box-shadow: 0 0 0 .5px var(--mi-mat-b); -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); }
@media (min-width: 900px) { .cx__tools { grid-template-columns: 320px 1fr; align-items: center; } }
.cx__chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 2px; }
.cx__chips > * { flex: none; }
.cx__count { margin: 18px 0 0; font-size: 13px; color: var(--mi-label3); }
.cx__group { padding-top: 40px; }
.cx__gtitle { display: flex; align-items: baseline; gap: 10px; margin: 0 0 14px; font-size: 22px; letter-spacing: -.02em; }
.cx__guide { margin-left: auto; font-size: 13px; font-weight: 500; color: var(--mi-p-text); text-decoration: none; }
.cx__guide:hover { text-decoration: underline; }
.cx__gtitle span { font-size: 13px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.cx__grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(min(100%, 270px), 1fr)); list-style: none; margin: 0; padding: 0; }
.card { position: relative; display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; padding: 18px 44px 18px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); color: inherit; text-decoration: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.card:hover { transform: translate3d(0, -2px, 0); }
.card:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.card__name { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.card__name code { font: 600 14px/1.3 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); }
.card__sum { font-size: 13px; line-height: 1.45; color: var(--mi-label2); display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
.card__go { position: absolute; top: 18px; right: 16px; color: var(--mi-label3); transition: transform var(--mi-dur-2) var(--mi-ease); }
.card:hover .card__go { transform: translate3d(3px, 0, 0); color: var(--mi-p-text); }
@keyframes cx-in { from { opacity: 0; transform: translate3d(0, 14px, 0); } }
@media (prefers-reduced-motion: reduce) { .cx__head { animation: none; } .card:hover, .card:hover .card__go { transform: none; } }
</style>
