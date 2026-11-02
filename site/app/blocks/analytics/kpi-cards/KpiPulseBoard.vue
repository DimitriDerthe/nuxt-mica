<template>
  <section class="kpi" aria-labelledby="kpi-title">
    <header class="kpi__head">
      <div>
        <MiText id="kpi-title" variant="title3" as="h2" weight="semibold">Revenue pulse</MiText>
        <MiText variant="footnote" tone="label2">Northwind Studio · updated 4 min ago</MiText>
      </div>
      <MiSegmented v-model="range" label="Period" :options="ranges" />
    </header>

    <div class="kpi__grid">
      <!-- Hero tile: the one number the page is about, with its target as a ring. -->
      <article class="kpi__hero">
        <div class="kpi__hero-top">
          <MiText variant="subheadline" weight="medium" tone="label2">Net revenue</MiText>
          <MiBadge tone="success" :label="'+' + data.growth + '%'" dot />
        </div>
        <p class="kpi__big">{{ data.revenue }}</p>
        <MiText variant="footnote" tone="label2">{{ data.target }}% of the {{ data.goal }} goal</MiText>
        <div class="kpi__bar" role="meter" aria-label="Progress to goal" :aria-valuenow="data.target" aria-valuemin="0" aria-valuemax="100">
          <span :style="{ transform: `scaleX(${data.target / 100})` }" />
        </div>
        <MiSparkline :values="data.trend" :width="320" :height="56" class="kpi__spark" label="Revenue trend" />
      </article>

      <MiStatTile
        v-for="tile in data.tiles" :key="tile.label" v-bind="tile" :comparison="'vs previous ' + range"
      />

      <!-- Split tile: two linked metrics with a shared baseline. -->
      <article class="kpi__split">
        <div v-for="s in data.split" :key="s.label" class="kpi__split-cell">
          <MiText variant="caption" tone="label2" weight="medium">{{ s.label }}</MiText>
          <p class="kpi__mid">{{ s.value }}</p>
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

<style scoped>
.kpi { container-type: inline-size; display: grid; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.kpi__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.kpi__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) { .kpi__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .kpi__hero { grid-column: span 2; } }
@container (min-width: 900px) { .kpi__grid { grid-template-columns: 1.4fr 1fr 1fr; } .kpi__hero { grid-column: auto; grid-row: span 2; } .kpi__split { grid-column: span 2; } }

.kpi__hero {
  position: relative; display: grid; align-content: start; gap: 6px; padding: 20px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-card); box-shadow: var(--mi-sh1);
}
/* Soft brand glow in the corner: a static gradient, nothing animated. */
.kpi__hero::before { content: ""; position: absolute; inset: -40% -30% auto auto; width: 70%; aspect-ratio: 1; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, var(--mi-p-tint), transparent); }
.kpi__hero-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.kpi__big { margin: 4px 0 0; font-size: clamp(40px, 9cqi, 64px); line-height: 1; font-weight: 700; letter-spacing: -.045em; font-variant-numeric: tabular-nums; }
.kpi__bar { height: 6px; margin-top: 10px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.kpi__bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.kpi__spark { max-width: 100%; margin-top: auto; padding-top: 14px; }

.kpi__split { display: grid; grid-template-columns: 1fr 1fr; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.kpi__split-cell { display: grid; gap: 4px; padding: 16px 18px; }
.kpi__split-cell + .kpi__split-cell { border-left: 1px solid var(--mi-sep); }
.kpi__mid { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
</style>
