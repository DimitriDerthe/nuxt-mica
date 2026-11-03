<template>
  <section class="mt" aria-labelledby="mt-title">
    <header class="mt__head">
      <MiText id="mt-title" variant="title3" as="h2" weight="semibold">Storefront this week</MiText>
      <MiText variant="footnote" tone="label2">Mon 3 – Sun 9 March, compared with the week before</MiText>
    </header>

    <!-- The tabs are the metrics themselves: each card is a tab, the chart is its panel. -->
    <div class="mt__tabs" role="tablist" aria-label="Metric" @keydown="onKey">
      <button
        v-for="(m, i) in metrics" :id="'mt-tab-' + m.id" :key="m.id" :ref="setTab(i)" type="button" role="tab" class="mt__tab"
        :aria-selected="current === m.id" :aria-controls="'mt-panel'" :tabindex="current === m.id ? 0 : -1" @click="current = m.id"
      >
        <span class="mt__bar" aria-hidden="true" />
        <MiText as="span" variant="caption" tone="label2" weight="medium">{{ m.label }}</MiText>
        <span class="mt__value">{{ m.value }}</span>
        <MiText as="span" variant="caption2" :tone="m.good ? 'green' : 'red'" weight="semibold">
          {{ m.up ? '↑' : '↓' }} {{ m.delta }}
        </MiText>
      </button>
    </div>

    <div id="mt-panel" class="mt__panel" role="tabpanel" :aria-labelledby="'mt-tab-' + current" tabindex="0">
      <div class="mt__panel-head">
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

<style scoped>
.mt { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.mt__head { display: grid; gap: 2px; }

.mt__tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.mt__tab {
  position: relative; display: grid; justify-items: start; gap: 2px; padding: 14px 14px 12px; overflow: hidden; border: 0; border-radius: var(--mi-radius-l);
  font: inherit; color: inherit; text-align: start; background: var(--mi-fill4); cursor: pointer; box-shadow: inset 0 0 0 1px transparent;
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.mt__tab:hover { box-shadow: inset 0 0 0 1px var(--mi-sep); }
.mt__tab:active { transform: scale(.98); }
.mt__tab:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.mt__tab[aria-selected="true"] { background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mt__bar {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--mi-p), var(--mi-s));
  transform: scaleX(0); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring);
}
.mt__tab[aria-selected="true"] .mt__bar { transform: scaleX(1); }
.mt__value { font-size: 24px; font-weight: 700; line-height: 1.15; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }

.mt__panel { display: grid; gap: 10px; padding: 18px 16px 12px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mt__panel:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
/* The last hover column of the chart reaches past the plot; keep it inside the card. */
.mt__panel :deep(.mi-lc-svg) { overflow: hidden; }
.mt__panel-head { display: grid; gap: 2px; }

@container (min-width: 720px) {
  .mt__tabs { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .mt__tab { padding: 16px 18px 14px; }
  .mt__value { font-size: 28px; }
  .mt__panel { padding: 22px 24px 14px; }
}
</style>
