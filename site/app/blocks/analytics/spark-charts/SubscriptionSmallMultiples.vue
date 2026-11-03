<template>
  <section class="ssm" aria-labelledby="ssm-title">
    <header class="ssm__head">
      <div>
        <MiText id="ssm-title" variant="title3" as="h2" weight="semibold">Subscription vitals</MiText>
        <MiText variant="footnote" tone="label2">October, daily · point at any chart or drag the scrubber to read every tile on the same day</MiText>
      </div>
      <div class="ssm__scrub">
        <MiSlider v-model="day" :min="1" :max="N" label="Day" :format="(v) => 'Oct ' + v" />
      </div>
    </header>

    <!-- Small multiples share one cursor: the scrubbed day is marked on every sparkline. -->
    <ul class="ssm__grid" aria-live="polite">
      <li v-for="m in tiles" :key="m.label" class="ssm__tile">
        <div class="ssm__tile-top">
          <MiText variant="footnote" weight="medium" tone="label2" as="h3">{{ m.label }}</MiText>
          <span class="ssm__delta" :class="m.tone">{{ m.delta }}</span>
        </div>
        <p class="ssm__value">{{ m.value }}</p>
        <div class="ssm__spark">
          <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
            <path :d="m.area" class="ssm__area" />
            <path :d="m.line" class="ssm__line" />
            <line :x1="m.x" :x2="m.x" y1="0" :y2="H" class="ssm__cursor" />
          </svg>
          <span class="ssm__dot" :style="{ transform: `translate(${m.xPct}cqi, ${m.yPct}%)` }" aria-hidden="true" />
          <!-- Invisible hover zones, one per day: no pointer maths, no layout reads. -->
          <div class="ssm__zones" aria-hidden="true">
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
.ssm { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.ssm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 24px; }
.ssm__head > div:first-child { flex: 1 1 280px; min-width: 0; }
.ssm__scrub { flex: 1 1 220px; max-width: 320px; }

.ssm__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); margin: 0; padding: 0; list-style: none; }
@container (min-width: 520px) { .ssm__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 860px) { .ssm__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.ssm__tile { display: grid; gap: 4px; min-width: 0; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ssm__tile-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ssm__delta { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--mi-label2); }
.ssm__delta.is-good { color: var(--mi-green-t); }
.ssm__delta.is-bad { color: var(--mi-orange-t); }
.ssm__value { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }

/* The spark wrapper is its own size container so the dot can move in cqi units, transform only. */
.ssm__spark { position: relative; height: 48px; margin: 6px 0 2px; container-type: inline-size; }
.ssm__spark svg { display: block; width: 100%; height: 100%; overflow: visible; }
.ssm__area { fill: color-mix(in srgb, var(--mi-p) 12%, transparent); }
.ssm__line { fill: none; stroke: var(--mi-p); stroke-width: 2; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.ssm__cursor { stroke: var(--mi-label3); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.ssm__dot {
  position: absolute; left: -4px; top: -4px; width: 8px; height: 100%; pointer-events: none;
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.ssm__dot::before { content: ""; position: absolute; left: 0; top: 0; width: 8px; height: 8px; border-radius: 50%; background: var(--mi-p); box-shadow: 0 0 0 2px var(--mi-card); }
.ssm__zones { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(30, minmax(0, 1fr)); }
</style>
