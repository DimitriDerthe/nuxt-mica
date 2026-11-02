<template>
  <section class="msc" aria-labelledby="msc-title">
    <div class="msc__card">
      <header class="msc__head">
        <div class="msc__intro">
          <MiText id="msc-title" variant="title3" as="h2" weight="semibold">API latency by region</MiText>
          <MiText variant="footnote" tone="label2">Relay gateway · {{ pct }} response time, last 28 days</MiText>
        </div>
        <MiSegmented v-model="percentile" label="Percentile" :options="percentiles" />
      </header>

      <div class="msc__legend" role="group" aria-label="Show or hide regions">
        <button
          v-for="s in series" :key="s.id" type="button" class="msc__toggle" :class="{ 'is-off': !visible[s.id] }"
          :aria-pressed="visible[s.id]" :style="{ '--c': s.color }" @click="toggleSeries(s.id)"
        >
          <span class="msc__swatch" aria-hidden="true" />
          <span class="msc__tname">{{ s.name }}</span>
          <span class="msc__tavg">avg {{ Math.round(avg(s.values)) }} ms</span>
        </button>
      </div>

      <div class="msc__chart">
        <!-- Sorted readout: a strip above the plot when narrow, floating beside the crosshair when wide. -->
        <div class="msc__tip" :class="{ 'is-flip': idx > days.length / 2 }" :style="{ '--xf': xPct(idx) / 100 }" aria-hidden="true">
          <p class="msc__tip-day">{{ days[idx] }}</p>
          <p v-if="eventAt" class="msc__tip-event"><b>{{ eventAt.n }}</b>{{ eventAt.text }}</p>
          <ol>
            <li v-for="r in readout" :key="r.id">
              <i :style="{ background: r.color }" /><span>{{ r.name }}</span><b>{{ r.v }}</b>
            </li>
          </ol>
        </div>

        <div class="msc__yaxis" aria-hidden="true">
          <span v-for="t in ticks" :key="t" :style="{ top: yPct(t) + '%' }">{{ t }}</span>
        </div>

        <div
          class="msc__plot" tabindex="0" role="slider" aria-label="Day under the crosshair" aria-valuemin="0"
          :aria-valuemax="days.length - 1" :aria-valuenow="idx" :aria-valuetext="readoutText" @keydown="onKey"
        >
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="t in ticks" :key="t" x1="0" x2="1000" :y1="yPct(t) * 3" :y2="yPct(t) * 3" class="msc__grid" />
            <line v-for="e in events" :key="e.i" :x1="xPct(e.i) * 10" :x2="xPct(e.i) * 10" y1="0" y2="300" class="msc__guide" />
            <path
              v-for="s in series" :key="s.id" :d="pathOf(s.values)" class="msc__line"
              :class="{ 'is-off': !visible[s.id], 'is-lead': s.id === lead }" :style="{ stroke: s.color }"
            />
          </svg>

          <div class="msc__hits" aria-hidden="true">
            <span v-for="(d, i) in days" :key="d" @pointerenter="idx = i" />
          </div>

          <div class="msc__cross" aria-hidden="true" :style="{ transform: `translateX(${xPct(idx)}%)` }">
            <i class="msc__rule" />
            <span
              v-for="s in series" :key="s.id" class="msc__dotrow" :class="{ 'is-off': !visible[s.id] }"
              :style="{ transform: `translateY(${yPct(at(s.values, idx))}%)` }"
            ><i :style="{ background: s.color }" /></span>
          </div>
        </div>

        <div class="msc__xaxis" aria-hidden="true">
          <span v-for="i in [0, 7, 14, 21, 27]" :key="i" class="msc__xl" :style="{ left: xPct(i) + '%' }">{{ days[i] }}</span>
          <span v-for="e in events" :key="'e' + e.i" class="msc__pin" :class="{ 'is-on': idx === e.i }" :style="{ left: xPct(e.i) + '%' }">{{ e.n }}</span>
        </div>
      </div>

      <ol class="msc__events" aria-label="Annotated events">
        <li v-for="e in events" :key="e.i">
          <button type="button" class="msc__event" :class="{ 'is-on': idx === e.i }" :aria-pressed="idx === e.i" @click="idx = e.i">
            <span class="msc__event-n" aria-hidden="true">{{ e.n }}</span>
            <span class="msc__event-day">{{ days[e.i] }}</span>
            <span class="msc__event-text">{{ e.text }}</span>
          </button>
        </li>
      </ol>
      <p class="msc__sr" aria-live="polite">{{ readoutText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface Series { id: string, name: string, color: string, values: number[] }

const percentiles = [{ value: 'p50', label: 'p50' }, { value: 'p95', label: 'p95' }, { value: 'p99', label: 'p99' }]
const percentile = ref<string | number | null>('p95')
const pct = computed(() => String(percentile.value ?? 'p95'))
const factor: Record<string, number> = { p50: 0.52, p95: 1, p99: 1.7 }

const days = Array.from({ length: 28 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 6 + i))
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
})
const events = [
  { i: 6, n: 1, text: 'Gateway v4.12 rolled out' },
  { i: 13, n: 2, text: 'eu-west-1 failover to Frankfurt' },
  { i: 21, n: 3, text: 'Edge cache enabled for /search' }
]

// Sample p95 readings in ms, built from a seeded jitter so the data is stable between renders.
let seed = 7
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
const base = [
  { id: 'use', name: 'US East', color: 'var(--mi-p)', ms: 142 },
  { id: 'euw', name: 'EU West', color: 'var(--mi-s)', ms: 168 },
  { id: 'aps', name: 'AP Southeast', color: 'var(--mi-teal)', ms: 236 },
  { id: 'sae', name: 'SA East', color: 'var(--mi-label3)', ms: 281 }
]
const raw = base.map(b => ({
  ...b,
  values: days.map((_, i) => {
    const weekend = i % 7 === 5 || i % 7 === 6 ? 0.9 : 1
    const deploy = i >= 6 && i <= 8 ? 1.2 - (i - 6) * 0.07 : 1
    const failover = b.id === 'euw' && i === 13 ? 2.45 : b.id === 'euw' && i === 14 ? 1.7 : b.id === 'euw' && i === 15 ? 1.2 : 1
    const cache = i >= 21 ? 0.84 : 1
    return b.ms * weekend * deploy * failover * cache * (0.95 + rand() * 0.1)
  })
}))

const series = computed<Series[]>(() => raw.map(r => ({ id: r.id, name: r.name, color: r.color, values: r.values.map(v => v * (factor[pct.value] ?? 1)) })))
const visible = reactive<Record<string, boolean>>({ use: true, euw: true, aps: true, sae: true })
const toggleSeries = (id: string) => {
  const on = Object.values(visible).filter(Boolean).length
  if (visible[id] && on === 1) return
  visible[id] = !visible[id]
}

const at = (a: number[], i: number) => a[i] ?? 0
const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
const idx = ref(13)

// Scale follows the visible regions; hidden lines fade out but keep their place.
const top = computed(() => {
  const vals = series.value.filter(s => visible[s.id]).flatMap(s => s.values)
  const step = pct.value === 'p50' ? 50 : 100
  return Math.ceil((Math.max(...vals) * 1.08) / step) * step
})
const ticks = computed(() => {
  const n = 4
  return Array.from({ length: n + 1 }, (_, i) => Math.round((top.value / n) * i))
})
const yPct = (v: number) => (1 - v / top.value) * 100
const xPct = (i: number) => (i / (days.length - 1)) * 100
const pathOf = (vals: number[]) => 'M' + vals.map((v, i) => `${(xPct(i) * 10).toFixed(1)} ${(yPct(v) * 3).toFixed(1)}`).join(' L')

const lead = computed(() => readout.value[0]?.id)
const readout = computed(() => series.value
  .filter(s => visible[s.id])
  .map(s => ({ id: s.id, name: s.name, color: s.color, raw: at(s.values, idx.value), v: `${Math.round(at(s.values, idx.value))} ms` }))
  .sort((a, b) => b.raw - a.raw))
const eventAt = computed(() => events.find(e => e.i === idx.value))
const readoutText = computed(() => `${days[idx.value]}${eventAt.value ? ', ' + eventAt.value.text : ''}: `
  + readout.value.map(r => `${r.name} ${r.v}`).join(', '))

const onKey = (e: KeyboardEvent) => {
  const last = days.length - 1
  const next = { ArrowLeft: idx.value - 1, ArrowRight: idx.value + 1, ArrowDown: idx.value - 1, ArrowUp: idx.value + 1, Home: 0, End: last, PageDown: idx.value - 7, PageUp: idx.value + 7 }[e.key]
  if (next === undefined) return
  e.preventDefault()
  idx.value = Math.min(last, Math.max(0, next))
}
</script>

<style scoped>
.msc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.msc__card { display: grid; gap: 16px; padding: 20px 20px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.msc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.msc__intro { display: grid; gap: 2px; }

.msc__legend { display: flex; flex-wrap: wrap; gap: 6px; }
.msc__toggle {
  display: inline-flex; align-items: baseline; gap: 8px; padding: 6px 11px 6px 10px; border: 1px solid var(--mi-sep); border-radius: 999px;
  background: var(--mi-card); color: var(--mi-label); font: inherit; font-size: 13px; cursor: pointer;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.msc__toggle:hover { background: var(--mi-fill4); }
.msc__toggle:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.msc__toggle.is-off { opacity: .55; }
.msc__swatch { align-self: center; width: 10px; height: 10px; border-radius: 3px; background: var(--c); box-shadow: inset 0 0 0 2px var(--c); }
.msc__toggle.is-off .msc__swatch { background: transparent; }
.msc__tname { font-weight: 600; }
.msc__tavg { display: none; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
@container (min-width: 560px) { .msc__tavg { display: inline; } }
.msc__toggle.is-off .msc__tname { text-decoration: line-through; text-decoration-color: var(--mi-label3); }

.msc__chart { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); grid-template-rows: auto auto; column-gap: 10px; }
.msc__yaxis { position: relative; grid-row: 2; height: 260px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.msc__yaxis span { position: absolute; right: 0; transform: translateY(-50%); }
.msc__plot { position: relative; grid-row: 2; grid-column: 2; height: 260px; overflow-x: clip; overflow-clip-margin: 6px; outline: none; border-radius: 4px; touch-action: pan-y; }
.msc__plot:focus-visible { box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-p); }
.msc__plot svg { display: block; width: 100%; height: 100%; overflow: visible; }
.msc__grid { stroke: var(--mi-sep); stroke-width: 1; vector-effect: non-scaling-stroke; }
.msc__guide { stroke: var(--mi-label3); stroke-width: 1; stroke-dasharray: 2 4; opacity: .7; vector-effect: non-scaling-stroke; }
.msc__line { fill: none; stroke-width: 1.75; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.msc__line.is-lead { stroke-width: 2.25; }
.msc__line.is-off { opacity: 0; }

.msc__hits { position: absolute; inset: 0; display: flex; }
.msc__hits span { flex: 1 1 0; }
.msc__hits span:first-child, .msc__hits span:last-child { flex-grow: .5; }

.msc__cross { position: absolute; inset: 0; pointer-events: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.msc__rule { position: absolute; left: -.5px; top: 0; bottom: 0; width: 1px; background: var(--mi-label2); opacity: .55; }
.msc__dotrow { position: absolute; inset: 0; transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease); }
.msc__dotrow.is-off { opacity: 0; }
.msc__dotrow i { position: absolute; left: -4.5px; top: -4.5px; width: 9px; height: 9px; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-card); }

/* Narrow: the readout is a compact strip above the plot. */
.msc__tip { grid-row: 1; grid-column: 1 / -1; display: grid; gap: 6px; margin-bottom: 14px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); font-variant-numeric: tabular-nums; pointer-events: none; }
.msc__tip p { margin: 0; }
.msc__tip-day { font-size: 12px; font-weight: 700; }
.msc__tip-event { display: flex; gap: 6px; align-items: center; font-size: 11px; color: var(--mi-label2); }
.msc__tip-event b { display: inline-grid; place-items: center; flex: none; width: 15px; height: 15px; border-radius: 50%; font-size: 9px; color: var(--mi-p-on); background: var(--mi-p); }
.msc__tip ol { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 0; list-style: none; }
.msc__tip li { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.msc__tip li i { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.msc__tip li span { color: var(--mi-label2); }
.msc__tip li b { font-weight: 650; }

@container (min-width: 640px) {
  .msc__tip {
    position: absolute; z-index: 2; top: 10px; left: calc(46px + (100% - 46px) * var(--xf)); width: 190px; margin: 0; padding: 10px 12px 11px;
    transform: translateX(14px); background: var(--mi-elev); box-shadow: var(--mi-sh2); border: 1px solid var(--mi-sep);
  }
  .msc__tip.is-flip { transform: translateX(calc(-100% - 14px)); }
  .msc__tip ol { display: grid; gap: 5px; }
  .msc__tip li { display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; gap: 8px; }
  .msc__tip li b { text-align: right; }
}

.msc__xaxis { position: relative; grid-row: 3; grid-column: 2; height: 34px; margin-top: 6px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.msc__xl { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
.msc__xl:first-child { transform: none; }
.msc__xl:nth-child(5) { transform: translateX(-100%); }
.msc__pin {
  position: absolute; top: 16px; display: grid; place-items: center; width: 17px; height: 17px; margin-left: -8.5px; border-radius: 50%;
  font-size: 10px; font-weight: 700; color: var(--mi-p-text); background: var(--mi-p-tint); box-shadow: 0 0 0 2px var(--mi-card);
}
.msc__pin.is-on { color: var(--mi-p-on); background: var(--mi-p); }

.msc__events { display: grid; gap: 4px; margin: 0; padding: 12px 0 0; border-top: 1px solid var(--mi-sep); list-style: none; }
@container (min-width: 1000px) { .msc__events { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; } }
.msc__event {
  display: grid; grid-template-columns: 18px auto minmax(0, 1fr); align-items: baseline; gap: 8px; width: 100%; padding: 6px 8px; border: 0;
  border-radius: var(--mi-radius-m); background: none; color: var(--mi-label); font: inherit; font-size: 13px; text-align: start; cursor: pointer;
}
.msc__event:hover { background: var(--mi-fill4); }
.msc__event.is-on { background: var(--mi-p-tint); }
.msc__event:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.msc__event-n { align-self: center; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; font-size: 10px; font-weight: 700; color: var(--mi-p-text); background: var(--mi-p-tint); }
.msc__event.is-on .msc__event-n { color: var(--mi-p-on); background: var(--mi-p); }
.msc__event-day { font-size: 12px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.msc__event-text { min-width: 0; text-wrap: pretty; }
.msc__sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) { .msc__cross, .msc__dotrow, .msc__line, .msc__toggle { transition: none; } }
</style>
