<template>
  <section class="kpi mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="kpi-title">
    <header class="kpi__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="kpi-title" variant="title3" as="h2" weight="semibold">Revenue pulse</MiText>
        <MiText variant="footnote" tone="label2">Northwind Studio · updated 4 min ago</MiText>
      </div>
      <MiSegmented v-model="range" label="Period" :options="ranges" />
    </header>

    <div class="kpi__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[560px]:grid-cols-2 mi:@[900px]:grid-cols-[1.4fr_1fr_1fr]">
      <!-- Hero tile: the one number the page is about, with its target as a ring. -->
      <article class="kpi__hero mi:@[560px]:col-[span_2] mi:@[900px]:col-[auto] mi:@[900px]:row-[span_2] mi:relative mi:grid mi:content-start mi:gap-1.5 mi:p-5 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-card)] mi:shadow-1 mi:before:content-[''] mi:before:absolute mi:before:top-[-40%] mi:before:right-[-30%] mi:before:bottom-auto mi:before:left-auto mi:before:w-[70%] mi:before:aspect-[1] mi:before:-z-1 mi:before:rounded-[50%] mi:before:[background:radial-gradient(closest-side,_var(--mi-p-tint),_transparent)]">
        <div class="kpi__hero-top mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText variant="subheadline" weight="medium" tone="label2">Net revenue</MiText>
          <MiBadge tone="success" :label="'+' + data.growth + '%'" dot />
        </div>
        <p class="kpi__big mi:mt-1 mi:mx-0 mi:mb-0 mi:text-[clamp(40px,_9cqi,_64px)] mi:leading-none mi:font-bold mi:tracking-[-.045em] mi:tabular-nums">{{ data.revenue }}</p>
        <MiText variant="footnote" tone="label2">{{ data.target }}% of the {{ data.goal }} goal</MiText>
        <div class="kpi__bar mi:h-1.5 mi:mt-2.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" aria-label="Progress to goal" :aria-valuenow="data.target" aria-valuemin="0" aria-valuemax="100">
          <span class="mi:[.kpi__bar_&]:block mi:[.kpi__bar_&]:h-full mi:[.kpi__bar_&]:rounded-[inherit] mi:[.kpi__bar_&]:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:[.kpi__bar_&]:origin-left mi:[.kpi__bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${data.target / 100})` }" />
        </div>
        <MiSparkline :values="data.trend" :width="320" :height="56" class="kpi__spark mi:max-w-full mi:mt-auto mi:pt-3.5" label="Revenue trend" />
      </article>

      <MiStatTile
        v-for="tile in data.tiles" :key="tile.label" v-bind="tile" :comparison="'vs previous ' + range"
      />

      <!-- Split tile: two linked metrics with a shared baseline. -->
      <article class="kpi__split mi:@[900px]:col-[span_2] mi:grid mi:grid-cols-[1fr_1fr] mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
        <div v-for="s in data.split" :key="s.label" class="kpi__split-cell mi:grid mi:gap-1 mi:py-4 mi:px-4.5 mi:[.kpi__split-cell+&]:border-l mi:[.kpi__split-cell+&]:border-l-sep">
          <MiText variant="caption" tone="label2" weight="medium">{{ s.label }}</MiText>
          <p class="kpi__mid mi:m-0 mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ s.value }}</p>
          <MiText variant="caption2" :tone="s.good ? 'green' : 'red'" weight="semibold">{{ s.delta }}</MiText>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const ranges = [{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'quarter', label: 'Quarter' }]
const range = ref<string | number | null>('month')

interface Tile { label: string, value: string, delta: string, trend?: 'up' | 'down', tone?: 'good' | 'bad' | 'neutral', spark: number[] }
interface Period { revenue: string, growth: number, target: number, goal: string, trend: number[], tiles: Tile[], split: { label: string, value: string, delta: string, good: boolean }[] }

// Sample data per period; swap for your API.
const periods: Record<'week' | 'month' | 'quarter', Period> = {
  week: {
    revenue: '$21.4k', growth: 4.2, target: 38, goal: '$56k',
    trend: [12, 14, 13, 17, 16, 19, 21],
    tiles: [
      { label: 'Active subscriptions', value: '2,318', delta: '1.2%', spark: [2201, 2240, 2262, 2281, 2290, 2302, 2318] },
      { label: 'Churned', value: '14', delta: '3', trend: 'down', tone: 'good', spark: [21, 19, 18, 17, 16, 15, 14] },
      { label: 'Avg. order', value: '$68', delta: '2.1%', trend: 'down', tone: 'bad', spark: [72, 71, 70, 70, 69, 68, 68] }
    ],
    split: [{ label: 'New MRR', value: '$3.1k', delta: '+8%', good: true }, { label: 'Lost MRR', value: '$0.6k', delta: '+2%', good: false }]
  },
  month: {
    revenue: '$84.2k', growth: 12.4, target: 72, goal: '$117k',
    trend: [61, 63, 62, 66, 70, 69, 73, 75, 74, 79, 82, 84],
    tiles: [
      { label: 'Active subscriptions', value: '2,318', delta: '6.8%', spark: [1980, 2020, 2090, 2120, 2160, 2210, 2250, 2318] },
      { label: 'Churned', value: '61', delta: '0.4 pt', trend: 'down', tone: 'good', spark: [88, 82, 80, 76, 72, 70, 66, 61] },
      { label: 'Avg. order', value: '$71', delta: '3.0%', spark: [64, 65, 66, 66, 68, 69, 70, 71] }
    ],
    split: [{ label: 'New MRR', value: '$12.8k', delta: '+14%', good: true }, { label: 'Lost MRR', value: '$2.2k', delta: '-6%', good: true }]
  },
  quarter: {
    revenue: '$241k', growth: 18.9, target: 81, goal: '$298k',
    trend: [180, 186, 195, 201, 214, 222, 230, 241],
    tiles: [
      { label: 'Active subscriptions', value: '2,318', delta: '19.5%', spark: [1740, 1810, 1900, 1980, 2080, 2160, 2240, 2318] },
      { label: 'Churned', value: '174', delta: '1.1 pt', trend: 'down', tone: 'good', spark: [240, 228, 214, 206, 198, 188, 180, 174] },
      { label: 'Avg. order', value: '$69', delta: '0.8%', spark: [66, 67, 67, 68, 68, 69, 69, 69] }
    ],
    split: [{ label: 'New MRR', value: '$36.0k', delta: '+21%', good: true }, { label: 'Lost MRR', value: '$7.4k', delta: '+3%', good: false }]
  }
}

const data = computed(() => periods[(range.value ?? 'month') as keyof typeof periods])
</script>
