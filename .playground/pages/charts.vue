<script setup lang="ts">
import MiStatTile from '../../app/components/Charts/MiStatTile.vue'
import MiLineChart from '../../app/components/Charts/MiLineChart.vue'
import MiBarChart from '../../app/components/Charts/MiBarChart.vue'
import MiStackedBar from '../../app/components/Charts/MiStackedBar.vue'
import MiMeter from '../../app/components/Charts/MiMeter.vue'
import MiRings from '../../app/components/Charts/MiRings.vue'
import MiHeatmap from '../../app/components/Charts/MiHeatmap.vue'
import MiChartCard from '../../app/components/Charts/MiChartCard.vue'
import MiChartLegend from '../../app/components/Charts/MiChartLegend.vue'
import MiChartTable from '../../app/components/Charts/MiChartTable.vue'
import { miChartCategorical, miChartColor, miChartDiverging, miChartSequential } from '../../app/utils/miChartPalette'

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const users = [
  { name: 'Web', data: [42, 48, 51, 55, 53, 60, 66, 71, 69, 76, 82, 88] },
  { name: 'Mobile', data: [30, 32, 35, 34, 38, 41, 40, 45, 49, 52, 55, 58] }
]
const tiles = [
  { label: 'Active users', value: '8,812', delta: '12%', trend: 'up', tone: 'good', spark: [52, 55, 54, 58, 61, 60, 64, 66, 65, 70, 73, 78] },
  { label: 'Avg. session', value: '6m 42s', delta: '4%', trend: 'up', tone: 'good', spark: [40, 42, 41, 43, 42, 44, 45, 44, 46, 45, 47, 48] },
  { label: 'Conversion', value: '3.8%', delta: '0.4 pt', trend: 'down', tone: 'bad', spark: [48, 47, 49, 46, 45, 46, 44, 43, 44, 42, 41, 40] },
  { label: 'Churn', value: '1.2%', delta: '0.3 pt', trend: 'down', tone: 'good', spark: [30, 29, 30, 28, 27, 27, 26, 25, 25, 24, 23, 22] }
] as const
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => ({ label, value: [62, 74, 70, 81, 90, 48, 40][i]! }))
const sources = [
  { label: 'Direct', value: 42 },
  { label: 'Search', value: 31 },
  { label: 'Social', value: 17 },
  { label: 'Referral', value: 10 }
]
const rings = [
  { label: 'Tasks', sub: 'Completed this week', value: 0.72 },
  { label: 'Reviews', sub: 'Given to teammates', value: 0.54 },
  { label: 'Focus', sub: 'Hours without meetings', value: 0.88 }
]
const heat: number[] = []
for (let w = 0; w < 20; w++) {
  for (let d = 0; d < 7; d++) {
    const lvl = d > 4 ? ((w * 7 + d) % 3 === 0 ? 1 : 0) : (w * 37 + d * 17 + ((w * d) % 11) + Math.floor(w / 4)) % 5
    heat.push(lvl * 2)
  }
}
const cat = miChartCategorical.map((c, i) => ({ c, label: String(i + 1) }))
const seq = miChartSequential()
const div = miChartDiverging()
const themes = [{ cls: 'mi-light', name: 'Light' }, { cls: 'mi-dark', name: 'Dark' }]
</script>

<template>
  <div class="mi mi-cp">
    <section v-for="th in themes" :key="th.cls" :class="['mi-cp-theme', th.cls]">
      <header class="mi-cp-head">
        <div>
          <p class="mi-cp-eyebrow">Charts</p>
          <h1>Charts</h1>
          <p class="mi-cp-lead">Stat tiles, line, column, composition, rings and heatmap. Thin marks, one axis, hover on every chart. All figures are sample data.</p>
        </div>
        <span class="mi-cp-pill">{{ th.name }} appearance</span>
      </header>

      <div class="mi-cp-tiles">
        <MiStatTile v-for="t in tiles" :key="t.label" v-bind="t" :spark="[...t.spark]" />
      </div>

      <MiLineChart
        title="Active users"
        subtitle="Monthly, in thousands · line with area, crosshair tooltip"
        unit="K"
        :categories="months"
        :series="users"
        :format-category="(c: string) => `${c} 2026`"
        category-label="Month"
      />

      <div class="mi-cp-pair">
        <MiBarChart title="Sessions by weekday" subtitle="Thousands · columns ≤ 24 px, rounded data end" unit="K" :max="100" :data="weekdays" />
        <MiChartCard title="Traffic sources" subtitle="Share of visits · stacked bar with 2 px surface gaps">
          <MiStackedBar :segments="sources" />
          <MiMeter label="Monthly budget" aria-label="Budget used" :value="82" caption="82 % used" hint="$1,240 remaining" />
        </MiChartCard>
      </div>

      <div class="mi-cp-pair">
        <MiRings title="Goal rings" subtitle="Concentric progress toward weekly goals" :rings="rings" />
        <MiHeatmap title="Activity heatmap" subtitle="Reviews per day, last 20 weeks · one hue, light to dark" unit="reviews" :data="heat" />
      </div>

      <MiChartCard title="Chart palette" subtitle="Assign series in this order, never cycled. Defaults pass colorblind and contrast checks in both appearances; re-check after changing the brand colors.">
        <div class="mi-cp-pal">
          <span class="mi-cp-pl">Categorical</span>
          <span class="mi-cp-cats"><span v-for="c in cat" :key="c.label" class="mi-cp-cat"><span class="mi-cp-sw" :style="{ background: c.c }" /><span class="mi-cp-cl">Series {{ c.label }}</span></span></span>
          <span class="mi-cp-pl">Sequential</span>
          <span class="mi-cp-ramp"><span v-for="(c, i) in seq" :key="i" :style="{ background: c }" /></span>
          <span class="mi-cp-pl">Diverging</span>
          <span class="mi-cp-ramp"><span v-for="(c, i) in div" :key="i" :style="{ background: c }" /></span>
        </div>
      </MiChartCard>

      <MiChartLegend variant="inline" :items="[{ label: 'Line', color: miChartColor(0) }, { label: 'Square', color: miChartColor(1), shape: 'square' }, { label: 'Dot', color: miChartColor(2), shape: 'dot' }]" />
      <MiChartTable
        :columns="[{ key: 'm', label: 'Month' }, { key: 'a', label: 'Web' }]"
        :rows="[{ m: 'Jan', a: '42K' }, { m: 'Feb', a: '48K' }, { m: 'Mar', a: '51K' }]"
        caption="Standalone chart table"
      />
    </section>
  </div>
</template>

<style scoped>
.mi-cp{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));font-family:var(--mi-font)}
.mi-cp-theme{background:var(--mi-page);color:var(--mi-label);padding:48px 32px;display:flex;flex-direction:column;gap:32px;min-width:0}
@media (max-width:1100px){.mi-cp{grid-template-columns:minmax(0,1fr)}.mi-cp-theme{padding:32px 16px}}
.mi-cp-head{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap}
.mi-cp-eyebrow{margin:0 0 12px;font-size:15px;font-weight:600;color:var(--mi-p-text)}
h1{margin:0 0 12px;font-size:48px;line-height:1.05;font-weight:700;letter-spacing:-.035em}
.mi-cp-lead{margin:0;max-width:560px;font-size:17px;line-height:1.5;color:var(--mi-label2)}
.mi-cp-pill{display:inline-flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;background:var(--mi-fill3);font-size:13px;font-weight:600}
.mi-cp-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.mi-cp-pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.mi-cp-pal{display:grid;grid-template-columns:96px minmax(0,1fr);gap:14px 20px;align-items:center}
.mi-cp-pl{font-size:13px;font-weight:600;color:var(--mi-label2)}
.mi-cp-cats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.mi-cp-cat{display:flex;flex-direction:column;gap:6px}
.mi-cp-sw{height:32px;border-radius:8px}
.mi-cp-cl{font-size:12px;color:var(--mi-label2)}
.mi-cp-ramp{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;border-radius:8px;overflow:hidden}
.mi-cp-ramp span{height:28px}
</style>
