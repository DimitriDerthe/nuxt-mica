<template>
  <section class="ssm mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ssm-title">
    <header class="ssm__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-6">
      <div class="mi:[.ssm__head>&:first-child]:flex-[1_1_280px] mi:[.ssm__head>&:first-child]:min-w-0">
        <MiText id="ssm-title" variant="title3" as="h2" weight="semibold">Subscription vitals</MiText>
        <MiText variant="footnote" tone="label2">October, daily · point at any chart or drag the scrubber to read every tile on the same day</MiText>
      </div>
      <div class="ssm__scrub mi:[.ssm__head>&:first-child]:flex-[1_1_280px] mi:[.ssm__head>&:first-child]:min-w-0 mi:flex-[1_1_220px] mi:max-w-80">
        <MiSlider v-model="day" :min="1" :max="N" label="Day" :format="(v) => 'Oct ' + v" />
      </div>
    </header>

    <!-- Small multiples share one cursor: the scrubbed day is marked on every sparkline. -->
    <ul class="ssm__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-2 mi:@[860px]:grid-cols-3" aria-live="polite">
      <li v-for="m in tiles" :key="m.label" class="ssm__tile mi:grid mi:gap-1 mi:min-w-0 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-1">
        <div class="ssm__tile-top mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText variant="footnote" weight="medium" tone="label2" as="h3">{{ m.label }}</MiText>
          <span class="ssm__delta mi:text-[12px] mi:font-semibold mi:tabular-nums mi:text-label2" :class="m.tone">{{ m.delta }}</span>
        </div>
        <p class="ssm__value mi:m-0 mi:text-[26px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ m.value }}</p>
        <div class="ssm__spark mi:relative mi:h-12 mi:mt-1.5 mi:mx-0 mi:mb-0.5 mi:@container">
          <svg class="mi:[.ssm__spark_&]:block mi:[.ssm__spark_&]:w-full mi:[.ssm__spark_&]:h-full mi:[.ssm__spark_&]:overflow-visible" :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
            <path :d="m.area" class="ssm__area mi:fill-p/12" />
            <path :d="m.line" class="ssm__line mi:fill-[color:none] mi:stroke-p mi:[stroke-width:2] mi:[stroke-linejoin:round] mi:[vector-effect:non-scaling-stroke]" />
            <line :x1="m.x" :x2="m.x" y1="0" :y2="H" class="ssm__cursor mi:stroke-label3 mi:[stroke-width:1] mi:[stroke-dasharray:3_3] mi:[vector-effect:non-scaling-stroke]" />
          </svg>
          <span class="ssm__dot mi:absolute mi:-left-1 mi:-top-1 mi:w-2 mi:h-full mi:pointer-events-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:left-0 mi:before:top-0 mi:before:w-2 mi:before:h-2 mi:before:rounded-[50%] mi:before:bg-p mi:before:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ transform: `translate(${m.xPct}cqi, ${m.yPct}%)` }" aria-hidden="true" />
          <!-- Invisible hover zones, one per day: no pointer maths, no layout reads. -->
          <div class="ssm__zones mi:absolute mi:inset-0 mi:grid mi:grid-cols-30" aria-hidden="true">
            <span v-for="d in N" :key="d" @mouseenter="day = d" />
          </div>
        </div>
        <MiText variant="caption2" tone="label3">{{ m.note }}</MiText>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Metric { label: string, goodUp: boolean, format: (v: number) => string, values: number[] }

const N = 30
const W = 200
const H = 48
const day = ref(N)

// Deterministic sample series: trend + weekly wave + weekend dip (Oct 4 is a Saturday). Swap for your metrics API.
function series (base: number, slope: number, wave: number, weekend: number, digits = 0): number[] {
  const f = 10 ** digits
  return Array.from({ length: N }, (_, i) => {
    const dip = i % 7 === 3 || i % 7 === 4 ? weekend : 0
    return Math.round((base + slope * i + wave * Math.sin(i * 0.9) - dip) * f) / f
  })
}
const int = (v: number) => v.toLocaleString('en-US')
const metrics: Metric[] = [
  { label: 'MRR', goodUp: true, format: v => `$${v.toFixed(1)}k`, values: series(412, 0.9, 1.2, 0, 1) },
  { label: 'Trials started', goodUp: true, format: int, values: series(180, 1.2, 14, 60) },
  { label: 'Trial to paid', goodUp: true, format: v => `${v.toFixed(1)}%`, values: series(14.2, 0.04, 0.5, 0, 1) },
  { label: 'Active seats', goodUp: true, format: int, values: series(18400, 42, 60, 900) },
  { label: 'Accounts churned', goodUp: false, format: int, values: series(7, -0.08, 2, 0) },
  { label: 'Support tickets', goodUp: false, format: int, values: series(140, -0.6, 12, 50) }
]

// Geometry is computed once per metric; only the cursor depends on the day.
const shapes = metrics.map((m) => {
  const lo = Math.min(...m.values)
  const span = Math.max(...m.values) - lo || 1
  const pts = m.values.map((v, i) => [(i / (N - 1)) * W, H - 4 - ((v - lo) / span) * (H - 8)] as const)
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')
  return { ...m, pts, line, area: `${line}L${W} ${H}L0 ${H}Z` }
})

const tiles = computed(() => shapes.map((s) => {
  const i = day.value - 1
  const [x, y] = s.pts[i]!
  const change = s.values[i]! - s.values[0]!
  const pct = (change / s.values[0]!) * 100
  const good = change === 0 ? 'is-flat' : (change > 0) === s.goodUp ? 'is-good' : 'is-bad'
  return {
    label: s.label, line: s.line, area: s.area, x, xPct: (x / W) * 100, yPct: (y / H) * 100,
    value: s.format(s.values[i]!), tone: good, delta: `${pct >= 0 ? '+' : '−'}${Math.abs(pct).toFixed(1)}%`,
    note: i === 0 ? 'Oct 1, start of the month' : `Oct ${day.value} vs Oct 1`
  }
}))
</script>

<style scoped>
.ssm__delta.is-good { color: var(--mi-green-t); }
.ssm__delta.is-bad { color: var(--mi-orange-t); }
</style>
