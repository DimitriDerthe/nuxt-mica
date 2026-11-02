<template>
  <section class="pdl" aria-labelledby="pdl-title">
    <header class="pdl__head">
      <div class="pdl__intro">
        <MiText id="pdl-title" variant="title3" as="h2" weight="semibold">Checkout revenue, period over period</MiText>
        <MiText variant="footnote" tone="label2">Marlow &amp; Finch online store · daily, {{ days[0] }} to {{ days[days.length - 1] }}</MiText>
      </div>
      <MiSegmented v-model="compare" label="Compare with" :options="compares" />
    </header>

    <article class="pdl__card">
      <div class="pdl__top">
        <div class="pdl__cum" aria-live="polite">
          <MiText variant="footnote" weight="medium" tone="label2">Running difference through {{ days[idx] }}</MiText>
          <p class="pdl__big" :class="cum >= 0 ? 'is-gain' : 'is-loss'">{{ money(cum, true) }}</p>
          <MiText variant="footnote" tone="label2" tabular>
            {{ money(sumTo(cur, idx)) }} against {{ money(sumTo(prev, idx)) }} · {{ signedPct(sumTo(cur, idx) / sumTo(prev, idx) - 1) }}
          </MiText>
        </div>
        <dl class="pdl__day">
          <div><dt><i class="pdl__k-cur" />{{ days[idx] }}</dt><dd>{{ money(at(cur, idx)) }}</dd></div>
          <div><dt><i class="pdl__k-prev" />{{ prevDays[idx] }}</dt><dd>{{ money(at(prev, idx)) }}</dd></div>
          <div><dt>Day difference</dt><dd :class="dayDelta >= 0 ? 'is-gain' : 'is-loss'">{{ money(dayDelta, true) }}</dd></div>
        </dl>
      </div>

      <div class="pdl__chart">
        <div class="pdl__yaxis" aria-hidden="true">
          <span v-for="t in ticks" :key="t" :style="{ top: yPct(t) + '%' }">${{ t }}k</span>
          <span class="pdl__ylabel">Running</span>
        </div>

        <div
          class="pdl__plots" tabindex="0" role="slider" aria-label="Day" aria-valuemin="0" :aria-valuemax="days.length - 1"
          :aria-valuenow="idx" :aria-valuetext="valueText" aria-describedby="pdl-summary" @keydown="onKey"
        >
          <svg class="pdl__main" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="t in ticks" :key="t" x1="0" x2="1000" :y1="yPct(t) * 3" :y2="yPct(t) * 3" class="pdl__grid" />
            <path :d="gap.gain" class="pdl__fill is-gain" />
            <path :d="gap.loss" class="pdl__fill is-loss" />
            <path :d="linePath(prev)" class="pdl__line is-prev" />
            <path :d="linePath(cur)" class="pdl__line is-cur" />
          </svg>
          <svg class="pdl__strip" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
            <path :d="cumBands.gain" class="pdl__fill is-gain is-strong" />
            <path :d="cumBands.loss" class="pdl__fill is-loss is-strong" />
            <line x1="0" x2="1000" :y1="cumY(0)" :y2="cumY(0)" class="pdl__zero" />
            <path :d="cumPath" class="pdl__line is-cum" />
          </svg>

          <div class="pdl__hits" aria-hidden="true">
            <span v-for="(d, i) in days" :key="d" @pointerenter="idx = i" />
          </div>
          <div class="pdl__cursor" aria-hidden="true" :style="{ transform: `translateX(${xPct(idx)}%)` }">
            <i class="pdl__rule" />
            <span class="pdl__dotrow" :style="{ transform: `translateY(${yPct(at(prev, idx)) * mainShare}%)` }"><i class="is-prev" /></span>
            <span class="pdl__dotrow" :style="{ transform: `translateY(${yPct(at(cur, idx)) * mainShare}%)` }"><i class="is-cur" /></span>
          </div>
        </div>

        <div class="pdl__xaxis" aria-hidden="true">
          <span v-for="i in [0, 7, 14, 21, 29]" :key="i" :style="{ left: xPct(i) + '%' }">{{ days[i] }}</span>
        </div>
      </div>
      <p id="pdl-summary" class="pdl__sr">{{ summary }}</p>

      <footer class="pdl__foot">
        <div class="pdl__legend" aria-hidden="true">
          <span><i class="pdl__k-cur" />This period</span>
          <span><i class="pdl__k-prev" />{{ compare === 'year' ? 'Last year' : 'Previous 30 days' }}</span>
          <span><i class="pdl__k-gain" />Gain</span>
          <span><i class="pdl__k-loss" />Loss</span>
        </div>
        <div class="pdl__chips" role="group" aria-label="Jump to a day">
          <span class="pdl__stat">Ahead on <b>{{ aheadDays }}</b> of {{ days.length }} days</span>
          <button type="button" class="pdl__jump" @click="idx = best"><span>Best</span> {{ days[best] }} <b class="is-gain">{{ money(diff(best), true) }}</b></button>
          <button type="button" class="pdl__jump" @click="idx = worst"><span>Worst</span> {{ days[worst] }} <b class="is-loss">{{ money(diff(worst), true) }}</b></button>
        </div>
      </footer>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const compares = [{ value: 'prev', label: 'Previous 30 days' }, { value: 'year', label: 'Last year' }]
const compare = ref<string | number | null>('prev')

const N = 30
const dayLabel = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
const days = Array.from({ length: N }, (_, i) => dayLabel(2026, 9, 3 + i))
const weekday = (i: number) => new Date(Date.UTC(2026, 9, 3 + i)).getUTCDay()
const shape = [0.74, 1.0, 1.03, 1.05, 1.02, 1.12, 0.8] // Sun to Sat

// Sample daily revenue in $k, from a seeded jitter so it is stable between renders.
let seed = 11
const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
const jitter = () => 0.94 + rand() * 0.12
const curData = Array.from({ length: N }, (_, i) => {
  const outage = i === 8 ? 0.62 : 1 // Oct 11: payment provider outage
  const promo = i === 21 ? 1.32 : i === 22 ? 1.14 : 1 // Oct 24: autumn sale
  return 41 * (shape[weekday(i)] ?? 1) * (1 + i * 0.004) * outage * promo * jitter()
})
const prevData = Array.from({ length: N }, (_, i) => 39.5 * (shape[weekday(i)] ?? 1) * (1 + i * 0.002) * jitter())
const yearData = Array.from({ length: N }, (_, i) => 31.5 * (shape[weekday(i)] ?? 1) * (1 + i * 0.003) * jitter())

const cur = curData
const prev = computed(() => compare.value === 'year' ? yearData : prevData)
const prevDays = computed(() => compare.value === 'year'
  ? Array.from({ length: N }, (_, i) => dayLabel(2025, 9, 4 + i) + ', 2025')
  : Array.from({ length: N }, (_, i) => dayLabel(2026, 8, 3 + i)))

const at = (a: number[], i: number) => a[i] ?? 0
const sumTo = (a: number[], i: number) => a.slice(0, i + 1).reduce((x, y) => x + y, 0)
const diff = (i: number) => at(cur, i) - at(prev.value, i)
const money = (k: number, signed = false) => {
  const a = Math.abs(k)
  const s = a >= 1000 ? `$${(a / 1000).toFixed(2)}M` : a >= 100 ? `$${a.toFixed(0)}k` : `$${a.toFixed(1)}k`
  return signed ? `${k >= 0 ? '+' : '−'}${s}` : s
}
const signedPct = (r: number) => `${r >= 0 ? '+' : '−'}${Math.abs(r * 100).toFixed(1)}%`

const idx = ref(N - 1)
const cum = computed(() => sumTo(cur, idx.value) - sumTo(prev.value, idx.value))
const dayDelta = computed(() => diff(idx.value))

// Main plot scale shared by both lines.
const lo = computed(() => Math.floor(Math.min(...cur, ...prev.value) * 0.9 / 10) * 10)
const hi = computed(() => Math.ceil(Math.max(...cur, ...prev.value) * 1.05 / 10) * 10)
const ticks = computed(() => { const out: number[] = []; for (let t = lo.value; t <= hi.value; t += 10) out.push(t); return out })
const yPct = (v: number) => (1 - (v - lo.value) / (hi.value - lo.value)) * 100
const xPct = (i: number) => (i / (N - 1)) * 100
const X = (i: number) => xPct(i) * 10
const linePath = (a: number[]) => 'M' + a.map((v, i) => `${X(i).toFixed(1)} ${(yPct(v) * 3).toFixed(1)}`).join(' L')

// Splits the gap between two lines into gain and loss polygons, cutting at each crossing.
const bands = (top: number[], base: number[], y: (v: number) => number) => {
  const gain: string[] = []
  const loss: string[] = []
  for (let i = 0; i < top.length - 1; i++) {
    const a0 = at(top, i), a1 = at(top, i + 1), b0 = at(base, i), b1 = at(base, i + 1)
    const d0 = a0 - b0, d1 = a1 - b1
    const x0 = X(i), x1 = X(i + 1)
    const poly = (pts: [number, number][]) => 'M' + pts.map(([px, py]) => `${px.toFixed(1)} ${y(py).toFixed(1)}`).join(' L') + ' Z'
    if (d0 * d1 >= 0) {
      ;(d0 + d1 >= 0 ? gain : loss).push(poly([[x0, a0], [x1, a1], [x1, b1], [x0, b0]]))
    } else {
      const t = d0 / (d0 - d1)
      const xm = x0 + t * (x1 - x0)
      const ym = a0 + t * (a1 - a0)
      ;(d0 > 0 ? gain : loss).push(poly([[x0, a0], [xm, ym], [x0, b0]]))
      ;(d1 > 0 ? gain : loss).push(poly([[xm, ym], [x1, a1], [x1, b1]]))
    }
  }
  return { gain: gain.join(' '), loss: loss.join(' ') }
}
const gap = computed(() => bands(cur, prev.value, v => yPct(v) * 3))

// Running difference strip below the main plot.
const cumSeries = computed(() => cur.map((_, i) => sumTo(cur, i) - sumTo(prev.value, i)))
const cumLo = computed(() => Math.min(0, ...cumSeries.value))
const cumHi = computed(() => Math.max(0, ...cumSeries.value))
const cumY = (v: number) => {
  const span = cumHi.value - cumLo.value || 1
  return 92 - ((v - cumLo.value) / span) * 84
}
const cumPath = computed(() => 'M' + cumSeries.value.map((v, i) => `${X(i).toFixed(1)} ${cumY(v).toFixed(1)}`).join(' L'))
const cumBands = computed(() => bands(cumSeries.value, cumSeries.value.map(() => 0), cumY))

// The cursor spans both plots; dots live in the main plot's share of that height.
const mainShare = 240 / (240 + 12 + 64)

const aheadDays = computed(() => cur.filter((v, i) => v >= at(prev.value, i)).length)
const best = computed(() => cur.reduce((b, _, i) => diff(i) > diff(b) ? i : b, 0))
const worst = computed(() => cur.reduce((w, _, i) => diff(i) < diff(w) ? i : w, 0))

const valueText = computed(() => `${days[idx.value]}: ${money(at(cur, idx.value))} against ${money(at(prev.value, idx.value))}, `
  + `day ${money(dayDelta.value, true)}, running ${money(cum.value, true)}`)
const summary = computed(() => `Daily checkout revenue for the last 30 days against ${compare.value === 'year' ? 'the same days last year' : 'the previous 30 days'}. `
  + `Ahead on ${aheadDays.value} of ${N} days, ${money(cumSeries.value[N - 1] ?? 0, true)} over the period. Use arrow keys to move between days.`)

const onKey = (e: KeyboardEvent) => {
  const last = N - 1
  const next = { ArrowLeft: idx.value - 1, ArrowDown: idx.value - 1, ArrowRight: idx.value + 1, ArrowUp: idx.value + 1, Home: 0, End: last, PageDown: idx.value - 7, PageUp: idx.value + 7 }[e.key]
  if (next === undefined) return
  e.preventDefault()
  idx.value = Math.min(last, Math.max(0, next))
}
</script>

<style scoped>
.pdl { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.pdl__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.pdl__intro { display: grid; gap: 2px; }
.pdl__card { display: grid; gap: 18px; padding: 20px 20px 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.pdl__top { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 28px; }
.pdl__cum { display: grid; gap: 4px; }
.pdl__big { margin: 2px 0; font-size: clamp(34px, 6.5cqi, 46px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.is-gain { color: var(--mi-p-text); }
.is-loss { color: var(--mi-red-t); }
.pdl__day { display: grid; grid-template-columns: repeat(3, auto); gap: 20px; margin: 0; }
.pdl__day div { display: grid; gap: 3px; }
.pdl__day div + div { padding-left: 20px; border-left: 1px solid var(--mi-sep); }
.pdl__day dt { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--mi-label2); white-space: nowrap; }
.pdl__day dt i { flex: none; width: 12px; }
.pdl__day dd { margin: 0; font-size: 17px; font-weight: 650; letter-spacing: -.015em; font-variant-numeric: tabular-nums; }

.pdl__chart { display: grid; grid-template-columns: 40px minmax(0, 1fr); column-gap: 10px; }
.pdl__yaxis { position: relative; height: 240px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.pdl__yaxis span { position: absolute; right: 0; transform: translateY(-50%); white-space: nowrap; }
.pdl__yaxis .pdl__ylabel { top: calc(240px + 12px + 32px); }
.pdl__plots { position: relative; display: grid; gap: 12px; overflow-x: clip; overflow-clip-margin: 8px; outline: none; border-radius: 4px; touch-action: pan-y; }
.pdl__plots:focus-visible { box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-p); }
.pdl__plots svg { display: block; width: 100%; }
.pdl__main { height: 240px; overflow: visible; }
.pdl__strip { height: 64px; border-radius: 6px; background: var(--mi-fill4); }
.pdl__grid { stroke: var(--mi-sep); stroke-width: 1; vector-effect: non-scaling-stroke; }
.pdl__zero { stroke: var(--mi-label3); stroke-width: 1; stroke-dasharray: 2 3; vector-effect: non-scaling-stroke; }
.pdl__fill.is-gain { fill: color-mix(in srgb, var(--mi-p) 20%, transparent); }
.pdl__fill.is-loss { fill: color-mix(in srgb, var(--mi-red) 24%, transparent); }
.pdl__fill.is-strong.is-gain { fill: color-mix(in srgb, var(--mi-p) 30%, transparent); }
.pdl__fill.is-strong.is-loss { fill: color-mix(in srgb, var(--mi-red) 32%, transparent); }
.pdl__line { fill: none; stroke-linejoin: round; stroke-linecap: round; vector-effect: non-scaling-stroke; }
.pdl__line.is-cur { stroke: var(--mi-p); stroke-width: 2.25; }
.pdl__line.is-prev { stroke: var(--mi-label2); stroke-width: 1.5; stroke-dasharray: 4 3; }
.pdl__line.is-cum { stroke: var(--mi-label); stroke-width: 1.5; }

.pdl__hits { position: absolute; inset: 0; display: flex; }
.pdl__hits span { flex: 1 1 0; }
.pdl__hits span:first-child, .pdl__hits span:last-child { flex-grow: .5; }
.pdl__cursor { position: absolute; inset: 0; pointer-events: none; transition: transform var(--mi-dur-2) var(--mi-ease); }
.pdl__rule { position: absolute; left: -.5px; top: 0; bottom: 0; width: 1px; background: var(--mi-label2); opacity: .6; }
.pdl__dotrow { position: absolute; inset: 0; transition: transform var(--mi-dur-2) var(--mi-ease); }
.pdl__dotrow i { position: absolute; left: -4.5px; top: -4.5px; width: 9px; height: 9px; border-radius: 50%; box-shadow: 0 0 0 2px var(--mi-card); }
.pdl__dotrow .is-cur { background: var(--mi-p); }
.pdl__dotrow .is-prev { background: var(--mi-label2); }

.pdl__xaxis { position: relative; grid-column: 2; height: 16px; margin-top: 8px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.pdl__xaxis span { position: absolute; top: 0; transform: translateX(-50%); white-space: nowrap; }
.pdl__xaxis span:first-child { transform: none; }
.pdl__xaxis span:last-child { transform: translateX(-100%); }

.pdl__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 20px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.pdl__legend { display: flex; flex-wrap: wrap; gap: 6px 16px; font-size: 12px; color: var(--mi-label2); }
.pdl__legend span { display: inline-flex; align-items: center; gap: 6px; }
.pdl__k-cur { width: 16px; height: 2.5px; border-radius: 2px; background: var(--mi-p); }
.pdl__k-prev { width: 16px; height: 0; border-top: 1.5px dashed var(--mi-label2); }
.pdl__k-gain, .pdl__k-loss { width: 12px; height: 10px; border-radius: 3px; }
.pdl__k-gain { background: color-mix(in srgb, var(--mi-p) 26%, transparent); }
.pdl__k-loss { background: color-mix(in srgb, var(--mi-red) 30%, transparent); }
.pdl__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; font-size: 12px; font-variant-numeric: tabular-nums; }
.pdl__stat { margin-right: 4px; color: var(--mi-label2); }
.pdl__stat b { color: var(--mi-label); font-weight: 650; }
.pdl__jump {
  display: inline-flex; align-items: baseline; gap: 6px; padding: 5px 10px; border: 1px solid var(--mi-sep); border-radius: 999px;
  background: var(--mi-card); color: var(--mi-label); font: inherit; font-size: 12px; cursor: pointer;
}
.pdl__jump:hover { background: var(--mi-fill4); }
.pdl__jump:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.pdl__jump span { color: var(--mi-label2); }
.pdl__jump b { font-weight: 650; }
.pdl__sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

@media (prefers-reduced-motion: reduce) { .pdl__cursor, .pdl__dotrow { transition: none; } }
</style>
