<template>
  <section class="ar mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ar-title">
    <header class="ar__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ar-title" variant="title3" as="h2" weight="semibold">Activation review</MiText>
        <MiText variant="footnote" tone="label2">Lumen Notes · new workspaces, weeks 31 to 42</MiText>
      </div>
      <MiSegmented v-model="platform" label="Platform" :options="platforms" />
    </header>

    <div class="ar__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-2">
      <!-- The data story: one generated paragraph that says what the charts below show. -->
      <article class="ar__story mi:@[720px]:col-[span_2] mi:relative mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-auto mi:before:bottom-0 mi:before:left-0 mi:before:w-1 mi:before:[background:linear-gradient(var(--mi-p),_var(--mi-s))] mi:@[1000px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.3fr)] mi:@[1000px]:items-center">
        <div class="ar__story-copy mi:grid mi:gap-2.5 mi:justify-items-start">
          <MiBadge tone="primary" label="This quarter in one paragraph" />
          <p class="ar__lede mi:m-0 mi:text-[17px] mi:leading-[1.55] mi:tracking-[-.01em] mi:text-label2 mi:text-pretty" aria-live="polite">
            Activation on {{ p.name }} averaged <b class="mi:[.ar__lede_&]:font-650 mi:[.ar__lede_&]:tabular-nums">{{ after.toFixed(1) }}%</b> over the six weeks since the onboarding checklist shipped,
            <b class="mi:[.ar__lede_&]:font-650 mi:[.ar__lede_&]:tabular-nums" :class="lift >= 0 ? 'is-up' : 'is-down'">{{ lift >= 0 ? 'up' : 'down' }} {{ Math.abs(lift).toFixed(1) }} pt</b> on the six weeks before.
            It cleared the {{ p.target }}% target in <b class="mi:[.ar__lede_&]:font-650 mi:[.ar__lede_&]:tabular-nums">{{ hits }} of 12</b> weeks, and <b class="mi:[.ar__lede_&]:font-650 mi:[.ar__lede_&]:tabular-nums">{{ topMix.share }}%</b> of new workspaces started by {{ topMix.label.toLowerCase() }}.
          </p>
        </div>
        <div class="ar__tiles mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-3">
          <MiStatTile v-for="t in p.tiles" :key="t.label" v-bind="t" comparison="vs prior 12 weeks" />
        </div>
      </article>

      <article class="ar__card ar__card--wide mi:@[720px]:col-[span_2] mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="ar__card-head mi:grid mi:gap-0.5">
          <MiText variant="headline" as="h3">Weekly activation rate</MiText>
          <MiText variant="footnote" tone="label2">Share of new workspaces that reach 3 shared notes in 7 days</MiText>
        </div>
        <MiLineChart
          :key="'trend-' + String(platform)" :categories="weeks" :series="trend" :card="false" :height="210" :ticks="3"
          unit="%" :min="0" :max="60" area="first" :toolbar="false" :end-labels="false" category-label="Week"
        />
        <MiChartLegend :items="trendLegend" aria-label="Lines" />
      </article>

      <article class="ar__card mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="ar__card-head mi:grid mi:gap-0.5">
          <MiText variant="headline" as="h3">First action</MiText>
          <MiText variant="footnote" tone="label2">What new workspaces did first</MiText>
        </div>
        <MiStackedBar :key="'mix-' + String(platform)" :segments="mix" :height="20" :legend-columns="1" aria-label="First action of new workspaces" />
      </article>

      <article class="ar__card mi:grid mi:gap-3.5 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="ar__card-head mi:grid mi:gap-0.5">
          <MiText variant="headline" as="h3">Time to first value</MiText>
          <MiText variant="footnote" tone="label2">Days until the third shared note, median <b>{{ p.median }}</b></MiText>
        </div>
        <MiBarChart
          :key="'ttv-' + String(platform)" :data="ttv" :card="false" :height="188" :ticks="2" :max-bar-width="30"
          unit="%" value-labels="peak" aria-label="Share of workspaces by days to first value"
        />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const platforms = [{ value: 'web', label: 'Web' }, { value: 'ios', label: 'iOS' }, { value: 'android', label: 'Android' }]
const platform = ref<string | number | null>('web')

const weeks = Array.from({ length: 12 }, (_, i) => 'W' + (31 + i))
const ttvBuckets = ['Day 0', '1', '2', '3', '4–7', '8–14', '15+']
const mixLabels = ['Importing notes', 'Inviting a teammate', 'Using a template', 'Starting blank']
const mixColors = ['var(--mi-p)', 'var(--mi-s)', 'var(--mi-teal)', 'var(--mi-fill)']

interface Platform {
  name: string, target: number, rate: number[], mix: number[], ttv: number[], median: string
  tiles: { label: string, value: string, delta: string, trend?: 'up' | 'down', tone?: 'good' | 'bad' | 'neutral', spark: number[] }[]
}

// Sample data per platform; the checklist shipped in week 37 (index 6).
const data: Record<string, Platform> = {
  web: {
    name: 'Web', target: 45, median: '2 days',
    rate: [31, 32, 31, 33, 34, 33, 38, 40, 41, 43, 44, 46],
    mix: [38, 27, 21, 14], ttv: [18, 24, 17, 11, 15, 9, 6],
    tiles: [
      { label: 'New workspaces', value: '8,412', delta: '14%', spark: [610, 640, 655, 630, 690, 702, 715, 720, 735, 748, 760, 787] },
      { label: 'Week-4 retention', value: '61%', delta: '3.2 pt', spark: [56, 57, 57, 58, 58, 59, 60, 60, 61, 61, 61, 61] },
      { label: 'Setup drop-off', value: '22%', delta: '5.1 pt', trend: 'down', tone: 'good', spark: [29, 28, 28, 27, 27, 26, 24, 24, 23, 23, 22, 22] }
    ]
  },
  ios: {
    name: 'iOS', target: 40, median: '3 days',
    rate: [24, 25, 27, 26, 27, 28, 30, 33, 34, 34, 36, 37],
    mix: [12, 22, 31, 35], ttv: [11, 17, 15, 14, 19, 14, 10],
    tiles: [
      { label: 'New workspaces', value: '3,106', delta: '9%', spark: [232, 238, 241, 249, 250, 255, 258, 262, 264, 270, 285, 302] },
      { label: 'Week-4 retention', value: '54%', delta: '1.8 pt', spark: [51, 51, 52, 52, 52, 53, 53, 53, 54, 54, 54, 54] },
      { label: 'Setup drop-off', value: '31%', delta: '2.4 pt', trend: 'down', tone: 'good', spark: [34, 34, 33, 33, 33, 33, 32, 32, 32, 31, 31, 31] }
    ]
  },
  android: {
    name: 'Android', target: 35, median: '4 days',
    rate: [21, 22, 21, 23, 22, 24, 25, 27, 26, 29, 30, 31],
    mix: [9, 18, 28, 45], ttv: [8, 13, 12, 13, 21, 18, 15],
    tiles: [
      { label: 'New workspaces', value: '2,248', delta: '1.2%', trend: 'down', tone: 'bad', spark: [196, 192, 190, 188, 191, 186, 185, 188, 184, 186, 181, 181] },
      { label: 'Week-4 retention', value: '47%', delta: '0.6 pt', spark: [46, 46, 46, 46, 47, 46, 47, 47, 47, 47, 47, 47] },
      { label: 'Setup drop-off', value: '36%', delta: '1.1 pt', trend: 'down', tone: 'good', spark: [38, 38, 37, 37, 37, 37, 37, 36, 36, 36, 36, 36] }
    ]
  }
}

const p = computed(() => data[String(platform.value ?? 'web')]!)
const trend = computed(() => [
  { name: 'Activation', data: p.value.rate, color: 'var(--mi-p)', area: true },
  { name: 'Target', data: p.value.rate.map(() => p.value.target), color: 'var(--mi-s)', area: false }
])
const trendLegend = computed(() => [
  { label: `Activation, ${p.value.rate[p.value.rate.length - 1]}% in W42`, color: 'var(--mi-p)', shape: 'line' as const },
  { label: `Target, ${p.value.target}%`, color: 'var(--mi-s)', shape: 'line' as const }
])
const mix = computed(() => p.value.mix.map((value, i) => ({ label: mixLabels[i]!, value, color: mixColors[i] })))
const ttv = computed(() => p.value.ttv.map((value, i) => ({
  label: ttvBuckets[i]!, value, color: i <= 2 ? 'var(--mi-p)' : 'color-mix(in srgb, var(--mi-p) 38%, var(--mi-card))'
})))

const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
const after = computed(() => avg(p.value.rate.slice(6)))
const lift = computed(() => after.value - avg(p.value.rate.slice(0, 6)))
const hits = computed(() => p.value.rate.filter(r => r >= p.value.target).length)
const topMix = computed(() => {
  const i = p.value.mix.indexOf(Math.max(...p.value.mix))
  return { label: mixLabels[i] ?? '', share: p.value.mix[i] ?? 0 }
})
</script>

<style scoped>
.ar__lede b { color: var(--mi-label); }
.ar__lede b.is-up { color: var(--mi-green-t); }
.ar__lede b.is-down { color: var(--mi-red-t); }
/* The last hover column of the chart reaches past the plot; keep it inside the card. */
.ar__card :deep(.mi-lc-svg) { overflow: hidden; }
.ar__card-head b { color: var(--mi-label); font-weight: 600; }
</style>
