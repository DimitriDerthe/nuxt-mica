<template>
  <main class="cx wrap mi:max-w-306 mi:my-0 mi:mx-auto mi:py-0 mi:px-3 mi:box-border mi:pt-[clamp(40px,_7vw,_88px)] mi:pb-24">
    <header class="cx__head mi:grid mi:gap-3 mi:max-w-180">
      <p class="eyebrow mi:m-0 mi:text-[14px] mi:font-semibold mi:text-p-text">{{ t('explorer.api') }}</p>
      <h1 class="cx__title mi:m-0 mi:text-[clamp(40px,_6vw,_72px)] mi:leading-none mi:tracking-[-.05em] mi:font-bold">{{ t('explorer.title') }}</h1>
      <p class="cx__lead mi:m-0 mi:text-[clamp(16px,_1.5vw,_19px)] mi:leading-[1.55] mi:text-label2 mi:max-w-[58ch]">{{ t('explorer.lead') }}</p>
    </header>

    <div class="cx__tools mi:sticky mi:top-18 mi:z-5 mi:grid mi:gap-3 mi:mt-9 mi:-mx-3 mi:mb-0 mi:p-3 mi:rounded-[18px] mi:bg-mat mi:shadow-[0_0_0_.5px_var(--mi-mat-b)] mi:min-[900px]:grid-cols-[320px_1fr] mi:min-[900px]:items-center">
      <MiSearch v-model="q" :placeholder="t('explorer.search')" :aria-label="t('explorer.search')" hotkey="k" :cancelable="false" class="cx__search" />
      <div class="cx__chips mi:flex mi:gap-1.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:p-0.5" role="group" :aria-label="t('explorer.group')">
        <MiChip :model-value="group === ''" selectable tone="neutral" :label="t('explorer.all')" @update:model-value="group = ''" />
        <MiChip
          v-for="g in groups" :key="g" :model-value="group === g" selectable tone="neutral" :label="t('explorer.groups.' + g)"
          @update:model-value="on => (group = on ? g : '')"
        />
      </div>
    </div>

    <p class="cx__count mi:mt-4.5 mi:mx-0 mi:mb-0 mi:text-[13px] mi:text-label3" aria-live="polite">{{ t('explorer.count', { n: filtered.length }) }}</p>

    <template v-for="g in visibleGroups" :key="g">
      <section :id="g.toLowerCase()" class="cx__group mi:pt-10" :aria-labelledby="'g-' + g">
        <h2 :id="'g-' + g" class="cx__gtitle mi:flex mi:items-baseline mi:gap-2.5 mi:mt-0 mi:mx-0 mi:mb-3.5 mi:text-[22px] mi:tracking-[-.02em]">{{ t('explorer.groups.' + g) }} <span class="mi:[.cx__gtitle_&]:text-[13px] mi:[.cx__gtitle_&]:font-semibold mi:[.cx__gtitle_&]:text-label3 mi:[.cx__gtitle_&]:tabular-nums">{{ filtered.filter(c => c.group === g).length }}</span>
          <a :href="`${base}docs/${guideOf(g)}.md`" target="_blank" rel="noopener" class="cx__guide mi:ml-auto mi:text-[13px] mi:font-medium mi:text-p-text mi:[text-decoration:none] mi:hover:[text-decoration:underline]">{{ t('explorer.guide') }}</a>
        </h2>
        <ul class="cx__grid mi:grid mi:gap-3 mi:grid-cols-[repeat(auto-fill,_minmax(min(100%,_270px),_1fr))] mi:[list-style:none] mi:m-0 mi:p-0">
          <li v-for="c in filtered.filter(x => x.group === g)" :key="c.name">
            <NuxtLink :to="localePath('/components/' + toSlug(c.name))" class="card mi:relative mi:flex mi:flex-col mi:gap-2 mi:h-full mi:box-border mi:pt-4.5 mi:pr-11 mi:pb-4.5 mi:pl-4.5 mi:rounded-[18px] mi:bg-card mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:text-inherit mi:[text-decoration:none] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translate3d(0,_-2px,_0)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:motion-reduce:hover:transform-none">
              <span class="card__name mi:flex mi:flex-wrap mi:items-center mi:gap-2">
                <span class="card__title mi:text-[16px] mi:font-semibold mi:tracking-[-.01em] mi:text-label">{{ toTitle(c.name) }}</span>
                <MiBadge v-if="c.vmodel" :label="t('explorer.vmodel')" tone="neutral" variant="outline" />
              </span>
              <code class="card__id mi:-mt-1 mi:[font:12px/1.3_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label3">{{ c.name }}</code>
              <span class="card__sum mi:mb-2.5 mi:text-[13px] mi:leading-[1.45] mi:text-label2 mi:[display:-webkit-box] mi:[-webkit-box-orient:vertical] mi:overflow-hidden">{{ c.summary }}</span>
              <ComponentCardPreview :name="c.name" />
              <MiIcon name="arrow-right" :size="16" class="card__go mi:absolute mi:top-4.5 mi:right-4 mi:text-label3 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.card:hover_&]:text-p-text" />
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>

    <MiEmptyState v-if="!filtered.length" icon="search" :title="t('explorer.noMatch', { q })" />
  </main>
</template>

<script setup lang="ts">
import { toSlug, toTitle } from '~/utils/explorer'

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
.cx__head { animation: cx-in var(--mi-dur-4) var(--mi-ease) backwards; }
.cx__tools { -webkit-backdrop-filter: blur(20px) saturate(180%); backdrop-filter: blur(20px) saturate(180%); }
.cx__chips > * { flex: none; }
.card__sum { -webkit-line-clamp: 3; line-clamp: 3; }
.card:hover .card__go { transform: translate3d(3px, 0, 0); }
@keyframes cx-in { from { opacity: 0; transform: translate3d(0, 14px, 0); } }
@media (prefers-reduced-motion: reduce) { .cx__head { animation: none; } .card:hover .card__go { transform: none; } }
</style>
