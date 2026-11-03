<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="mt-title">
    <header class="mi:grid mi:gap-0.5">
      <MiText id="mt-title" variant="title3" as="h2" weight="semibold">Storefront this week</MiText>
      <MiText variant="footnote" tone="label2">Mon 3 – Sun 9 March, compared with the week before</MiText>
    </header>

    <!-- The tabs are the metrics themselves: each card is a tab, the chart is its panel. -->
    <div class="mi:grid mi:grid-cols-2 mi:gap-2 mi:@[720px]:grid-cols-4 mi:@[720px]:gap-2.5" role="tablist" aria-label="Metric" @keydown="onKey">
      <button
        v-for="(m, i) in metrics" :id="'mt-tab-' + m.id" :key="m.id" :ref="setTab(i)" type="button" role="tab" class="mi:group mi:relative mi:grid mi:justify-items-start mi:gap-0.5 mi:pt-3.5 mi:px-3.5 mi:pb-3 mi:overflow-hidden mi:[border:0] mi:rounded-lg mi:[font:inherit] mi:text-inherit mi:text-start mi:[background:var(--mi-fill4)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.98)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:aria-selected:[background:var(--mi-card)] mi:@[720px]:pt-4 mi:@[720px]:px-4.5 mi:@[720px]:pb-3.5"
        :class="current === m.id ? 'mi:shadow-1' : 'mi:shadow-[inset_0_0_0_1px_transparent] mi:hover:shadow-[inset_0_0_0_1px_var(--mi-sep)]'" :aria-selected="current === m.id" :aria-controls="'mt-panel'" :tabindex="current === m.id ? 0 : -1" @click="current = m.id"
      >
        <span class="mi:absolute mi:top-0 mi:left-0 mi:right-0 mi:h-[3px] mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:transform-[scaleX(0)] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:group-aria-selected:transform-[scaleX(1)]" aria-hidden="true" />
        <MiText as="span" variant="caption" tone="label2" weight="medium">{{ m.label }}</MiText>
        <span class="mi:text-[24px] mi:font-bold mi:leading-[1.15] mi:tracking-[-.035em] mi:tabular-nums mi:@[720px]:text-[28px]">{{ m.value }}</span>
        <MiText as="span" variant="caption2" :tone="m.good ? 'green' : 'red'" weight="semibold">
          {{ m.up ? '↑' : '↓' }} {{ m.delta }}
        </MiText>
      </button>
    </div>

    <div id="mt-panel" class="mi:[&_.mi-lc-svg]:overflow-hidden! mi:grid mi:gap-2.5 mi:pt-4.5 mi:px-4 mi:pb-3 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:@[720px]:pt-5.5 mi:@[720px]:px-6 mi:@[720px]:pb-3.5" role="tabpanel" :aria-labelledby="'mt-tab-' + current" tabindex="0">
      <div class="mi:grid mi:gap-0.5">
        <MiText as="h3" variant="headline">{{ metric.label }} by day</MiText>
        <MiText variant="footnote" tone="label2">{{ metric.note }}</MiText>
      </div>
      <MiLineChart
        :key="metric.id" :categories="days" :series="series" :card="false" :height="200" :ticks="3" :end-labels="false"
        :unit="metric.unit" :format-value="metric.format" :aria-label="metric.label + ' by day, this week against last week'"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const money = (v: number) => '$' + (v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toString())

const metrics = [
  {
    id: 'revenue', label: 'Revenue', value: '$48.2k', delta: '12.4%', up: true, good: true, unit: '', format: money,
    note: 'Saturday’s spike is the spring collection email.',
    now: [5200, 5900, 6100, 6400, 7300, 9800, 7500], before: [5100, 5300, 5600, 5800, 6200, 7100, 6500]
  },
  {
    id: 'orders', label: 'Orders', value: '1,286', delta: '8.1%', up: true, good: true, unit: '', format: undefined,
    note: 'Orders grew a little slower than revenue: baskets got bigger.',
    now: [148, 162, 170, 176, 191, 247, 192], before: [140, 151, 158, 164, 177, 220, 180]
  },
  {
    id: 'conversion', label: 'Conversion', value: '3.4%', delta: '0.3 pt', up: true, good: true, unit: '%', format: undefined,
    note: 'Mobile checkout fixes shipped on Tuesday.',
    now: [3.0, 3.3, 3.4, 3.4, 3.5, 3.8, 3.5], before: [3.0, 3.1, 3.1, 3.2, 3.1, 3.3, 3.2]
  },
  {
    id: 'returns', label: 'Return rate', value: '6.8%', delta: '1.1 pt', up: true, good: false, unit: '%', format: undefined,
    note: 'Most returns are the linen shirt in size M; check the size chart.',
    now: [5.9, 6.2, 6.6, 7.0, 7.1, 7.3, 7.4], before: [5.6, 5.7, 5.8, 5.6, 5.9, 5.7, 5.8]
  }
]

const current = ref('revenue')
const metric = computed(() => metrics.find(m => m.id === current.value)!)
const series = computed(() => [
  { name: 'This week', data: metric.value.now, area: true },
  { name: 'Last week', data: metric.value.before, color: 'var(--mi-label3)', area: false }
])

// Roving focus: arrows move between cards and select them, Home and End jump to the ends.
const tabEls: (HTMLButtonElement | undefined)[] = []
const setTab = (i: number) => (el: unknown) => { tabEls[i] = el instanceof HTMLButtonElement ? el : undefined }
function onKey(e: KeyboardEvent) {
  const i = metrics.findIndex(m => m.id === current.value)
  const moves: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: metrics.length - 1 }
  const to = moves[e.key]
  if (to === undefined) return
  e.preventDefault()
  const n = (to + metrics.length) % metrics.length
  current.value = metrics[n]!.id
  tabEls[n]?.focus()
}
</script>
