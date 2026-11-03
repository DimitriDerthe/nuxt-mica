<template>
  <section class="pdl mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="pdl-title">
    <header class="pdl__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div class="pdl__intro mi:grid mi:gap-0.5">
        <MiText id="pdl-title" variant="title3" as="h2" weight="semibold">Checkout revenue, period over period</MiText>
        <MiText variant="footnote" tone="label2">Marlow &amp; Finch online store · daily, {{ days[0] }} to {{ days[days.length - 1] }}</MiText>
      </div>
      <MiSegmented v-model="compare" label="Compare with" :options="compares" />
    </header>

    <article class="pdl__card mi:grid mi:gap-4.5 mi:pt-5 mi:px-5 mi:pb-4 mi:rounded-xl mi:bg-card mi:shadow-1">
      <div class="pdl__top mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-4 mi:gap-x-7">
        <div class="pdl__cum mi:grid mi:gap-1" aria-live="polite">
          <MiText variant="footnote" weight="medium" tone="label2">Running difference through {{ days[idx] }}</MiText>
          <p class="pdl__big mi:my-0.5 mi:mx-0 mi:text-[clamp(34px,_6.5cqi,_46px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums" :class="cum >= 0 ? 'is-gain mi:text-p-text' : 'is-loss mi:text-red-t'">{{ money(cum, true) }}</p>
          <MiText variant="footnote" tone="label2" tabular>
            {{ money(sumTo(cur, idx)) }} against {{ money(sumTo(prev, idx)) }} · {{ signedPct(sumTo(cur, idx) / sumTo(prev, idx) - 1) }}
          </MiText>
        </div>
        <dl class="pdl__day mi:grid mi:grid-cols-[repeat(3,_auto)] mi:gap-5 mi:m-0">
          <div><dt class="mi:[.pdl__day_&]:items-center mi:[.pdl__day_&]:text-[12px] mi:[.pdl__day_&]:text-label2 mi:[.pdl__day_&]:whitespace-nowrap"><i class="pdl__k-cur mi:[.pdl__day_dt_&]:flex-[none] mi:w-4 mi:h-[2.5px] mi:rounded-[2px] mi:bg-p" />{{ days[idx] }}</dt><dd class="mi:[.pdl__day_&]:m-0 mi:[.pdl__day_&]:text-[17px] mi:[.pdl__day_&]:font-650 mi:[.pdl__day_&]:tracking-[-.015em] mi:[.pdl__day_&]:tabular-nums">{{ money(at(cur, idx)) }}</dd></div>
          <div><dt class="mi:[.pdl__day_&]:items-center mi:[.pdl__day_&]:text-[12px] mi:[.pdl__day_&]:text-label2 mi:[.pdl__day_&]:whitespace-nowrap"><i class="pdl__k-prev mi:[.pdl__day_dt_&]:flex-[none] mi:w-4 mi:h-0 mi:[border-top:1.5px_dashed_var(--mi-label2)]" />{{ prevDays[idx] }}</dt><dd class="mi:[.pdl__day_&]:m-0 mi:[.pdl__day_&]:text-[17px] mi:[.pdl__day_&]:font-650 mi:[.pdl__day_&]:tracking-[-.015em] mi:[.pdl__day_&]:tabular-nums">{{ money(at(prev, idx)) }}</dd></div>
          <div><dt class="mi:[.pdl__day_&]:items-center mi:[.pdl__day_&]:text-[12px] mi:[.pdl__day_&]:text-label2 mi:[.pdl__day_&]:whitespace-nowrap">Day difference</dt><dd class="mi:[.pdl__day_&]:m-0 mi:[.pdl__day_&]:text-[17px] mi:[.pdl__day_&]:font-650 mi:[.pdl__day_&]:tracking-[-.015em] mi:[.pdl__day_&]:tabular-nums" :class="dayDelta >= 0 ? 'is-gain mi:text-p-text' : 'is-loss mi:text-red-t'">{{ money(dayDelta, true) }}</dd></div>
        </dl>
      </div>

      <div class="pdl__chart mi:grid mi:grid-cols-[40px_minmax(0,_1fr)] mi:gap-x-2.5">
        <div class="pdl__yaxis mi:relative mi:h-60 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span class="mi:[.pdl__yaxis_&]:right-0" v-for="t in ticks" :key="t" :style="{ top: yPct(t) + '%' }">${{ t }}k</span>
          <span class="pdl__ylabel mi:[.pdl__yaxis_&]:right-0 mi:[.pdl__yaxis_&]:top-[calc(240px_+_12px_+_32px)]">Running</span>
        </div>

        <div
          class="pdl__plots mi:relative mi:grid mi:gap-3 mi:overflow-x-clip mi:[overflow-clip-margin:8px] mi:[outline:none] mi:rounded-[4px] mi:touch-pan-y mi:focus-visible:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)]" tabindex="0" role="slider" aria-label="Day" aria-valuemin="0" :aria-valuemax="days.length - 1"
          :aria-valuenow="idx" :aria-valuetext="valueText" aria-describedby="pdl-summary" @keydown="onKey"
        >
          <svg class="pdl__main mi:h-60 mi:overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="t in ticks" :key="t" x1="0" x2="1000" :y1="yPct(t) * 3" :y2="yPct(t) * 3" class="pdl__grid mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
            <path :d="gap.gain" class="pdl__fill is-gain mi:text-p-text mi:[&.is-gain]:fill-p/20 mi:[&.is-loss]:fill-red/24 mi:[&.is-strong.is-gain]:fill-p/30 mi:[&.is-strong.is-loss]:fill-red/32" />
            <path :d="gap.loss" class="pdl__fill is-loss mi:text-red-t mi:[&.is-gain]:fill-p/20 mi:[&.is-loss]:fill-red/24 mi:[&.is-strong.is-gain]:fill-p/30 mi:[&.is-strong.is-loss]:fill-red/32" />
            <path :d="linePath(prev)" class="pdl__line is-prev mi:fill-[color:none] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[&.is-cur]:stroke-p mi:[&.is-cur]:[stroke-width:2.25] mi:[&.is-prev]:stroke-label2 mi:[&.is-prev]:[stroke-width:1.5] mi:[&.is-prev]:[stroke-dasharray:4_3] mi:[&.is-cum]:stroke-label mi:[&.is-cum]:[stroke-width:1.5] mi:[.pdl__dotrow_&]:bg-label2" />
            <path :d="linePath(cur)" class="pdl__line is-cur mi:fill-[color:none] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[&.is-cur]:stroke-p mi:[&.is-cur]:[stroke-width:2.25] mi:[&.is-prev]:stroke-label2 mi:[&.is-prev]:[stroke-width:1.5] mi:[&.is-prev]:[stroke-dasharray:4_3] mi:[&.is-cum]:stroke-label mi:[&.is-cum]:[stroke-width:1.5] mi:[.pdl__dotrow_&]:bg-p" />
          </svg>
          <svg class="pdl__strip mi:h-16 mi:rounded-[6px] mi:bg-fill4" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
            <path :d="cumBands.gain" class="pdl__fill is-gain is-strong mi:text-p-text mi:[&.is-gain]:fill-p/20 mi:[&.is-loss]:fill-red/24 mi:[&.is-strong.is-gain]:fill-p/30 mi:[&.is-strong.is-loss]:fill-red/32" />
            <path :d="cumBands.loss" class="pdl__fill is-loss is-strong mi:text-red-t mi:[&.is-gain]:fill-p/20 mi:[&.is-loss]:fill-red/24 mi:[&.is-strong.is-gain]:fill-p/30 mi:[&.is-strong.is-loss]:fill-red/32" />
            <line x1="0" x2="1000" :y1="cumY(0)" :y2="cumY(0)" class="pdl__zero mi:stroke-label3 mi:[stroke-width:1] mi:[stroke-dasharray:2_3] mi:[vector-effect:non-scaling-stroke]" />
            <path :d="cumPath" class="pdl__line is-cum mi:fill-[color:none] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[&.is-cur]:stroke-p mi:[&.is-cur]:[stroke-width:2.25] mi:[&.is-prev]:stroke-label2 mi:[&.is-prev]:[stroke-width:1.5] mi:[&.is-prev]:[stroke-dasharray:4_3] mi:[&.is-cum]:stroke-label mi:[&.is-cum]:[stroke-width:1.5]" />
          </svg>

          <div class="pdl__hits mi:absolute mi:inset-0 mi:flex" aria-hidden="true">
            <span class="mi:[.pdl__hits_&]:flex-[1_1_0]" v-for="(d, i) in days" :key="d" @pointerenter="idx = i" />
          </div>
          <div class="pdl__cursor mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" aria-hidden="true" :style="{ transform: `translateX(${xPct(idx)}%)` }">
            <i class="pdl__rule mi:absolute mi:left-[-.5px] mi:top-0 mi:bottom-0 mi:w-px mi:bg-label2 mi:opacity-60" />
            <span class="pdl__dotrow mi:absolute mi:inset-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" :style="{ transform: `translateY(${yPct(at(prev, idx)) * mainShare}%)` }"><i class="is-prev mi:[.pdl__dotrow_&]:left-[-4.5px] mi:[.pdl__dotrow_&]:top-[-4.5px] mi:[.pdl__dotrow_&]:h-[9px] mi:[.pdl__dotrow_&]:rounded-[50%] mi:[.pdl__dotrow_&]:shadow-[0_0_0_2px_var(--mi-card)] mi:[.pdl__dotrow_&]:bg-label2" /></span>
            <span class="pdl__dotrow mi:absolute mi:inset-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" :style="{ transform: `translateY(${yPct(at(cur, idx)) * mainShare}%)` }"><i class="is-cur mi:[.pdl__dotrow_&]:left-[-4.5px] mi:[.pdl__dotrow_&]:top-[-4.5px] mi:[.pdl__dotrow_&]:h-[9px] mi:[.pdl__dotrow_&]:rounded-[50%] mi:[.pdl__dotrow_&]:shadow-[0_0_0_2px_var(--mi-card)] mi:[.pdl__dotrow_&]:bg-p" /></span>
          </div>
        </div>

        <div class="pdl__xaxis mi:relative mi:col-[2] mi:h-4 mi:mt-2 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span class="mi:[.pdl__xaxis_&]:top-0 mi:[.pdl__xaxis_&:first-child]:transform-none mi:[.pdl__xaxis_&:last-child]:transform-[translateX(-100%)]" v-for="i in [0, 7, 14, 21, 29]" :key="i" :style="{ left: xPct(i) + '%' }">{{ days[i] }}</span>
        </div>
      </div>
      <p id="pdl-summary" class="pdl__sr mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ summary }}</p>

      <footer class="pdl__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-3 mi:gap-x-5 mi:pt-3.5 mi:border-t mi:border-t-sep">
        <div class="pdl__legend mi:flex mi:flex-wrap mi:gap-y-1.5 mi:gap-x-4 mi:text-[12px] mi:text-label2" aria-hidden="true">
          <span class="mi:[.pdl__legend_&]:items-center"><i class="pdl__k-cur mi:w-4 mi:h-[2.5px] mi:rounded-[2px] mi:bg-p" />This period</span>
          <span class="mi:[.pdl__legend_&]:items-center"><i class="pdl__k-prev mi:w-4 mi:h-0 mi:[border-top:1.5px_dashed_var(--mi-label2)]" />{{ compare === 'year' ? 'Last year' : 'Previous 30 days' }}</span>
          <span class="mi:[.pdl__legend_&]:items-center"><i class="pdl__k-gain mi:w-3 mi:h-2.5 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_26%,_transparent)]" />Gain</span>
          <span class="mi:[.pdl__legend_&]:items-center"><i class="pdl__k-loss mi:w-3 mi:h-2.5 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-red)_30%,_transparent)]" />Loss</span>
        </div>
        <div class="pdl__chips mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2 mi:text-[12px] mi:tabular-nums" role="group" aria-label="Jump to a day">
          <span class="pdl__stat mi:mr-1 mi:text-label2">Ahead on <b>{{ aheadDays }}</b> of {{ days.length }} days</span>
          <button type="button" class="pdl__jump mi:inline-flex mi:items-baseline mi:gap-1.5 mi:py-[5px] mi:px-2.5 mi:border mi:border-sep mi:rounded-[999px] mi:bg-card mi:text-label mi:cursor-pointer mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="idx = best"><span>Best</span> {{ days[best] }} <b class="is-gain mi:text-p-text">{{ money(diff(best), true) }}</b></button>
          <button type="button" class="pdl__jump mi:inline-flex mi:items-baseline mi:gap-1.5 mi:py-[5px] mi:px-2.5 mi:border mi:border-sep mi:rounded-[999px] mi:bg-card mi:text-label mi:cursor-pointer mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="idx = worst"><span>Worst</span> {{ days[worst] }} <b class="is-loss mi:text-red-t">{{ money(diff(worst), true) }}</b></button>
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
.pdl__day div { display: grid; gap: 3px; }
.pdl__day div + div { padding-left: 20px; border-left: 1px solid var(--mi-sep); }
.pdl__day dt { display: flex; gap: 6px; }
.pdl__day dt i { width: 12px; }
.pdl__yaxis span { position: absolute; transform: translateY(-50%); white-space: nowrap; }
.pdl__plots svg { display: block; width: 100%; }
.pdl__hits span:first-child, .pdl__hits span:last-child { flex-grow: .5; }
.pdl__dotrow i { position: absolute; width: 9px; }
.pdl__xaxis span { position: absolute; transform: translateX(-50%); white-space: nowrap; }
.pdl__legend span { display: inline-flex; gap: 6px; }
.pdl__stat b { color: var(--mi-label); font-weight: 650; }
.pdl__jump { font: inherit; font-size: 12px;
}
.pdl__jump span { color: var(--mi-label2); }
.pdl__jump b { font-weight: 650; }
</style>
