<template>
  <section class="msc mi:@container mi:font-mi mi:text-label" aria-labelledby="msc-title">
    <div class="msc__card mi:grid mi:gap-4 mi:pt-5 mi:px-5 mi:pb-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <header class="msc__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
        <div class="msc__intro mi:grid mi:gap-0.5">
          <MiText id="msc-title" variant="title3" as="h2" weight="semibold">API latency by region</MiText>
          <MiText variant="footnote" tone="label2">Relay gateway · {{ pct }} response time, last 28 days</MiText>
        </div>
        <MiSegmented v-model="percentile" label="Percentile" :options="percentiles" />
      </header>

      <div class="msc__legend mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Show or hide regions">
        <button
          v-for="s in series" :key="s.id" type="button" class="msc__toggle mi:inline-flex mi:items-baseline mi:gap-2 mi:pt-1.5 mi:pr-[11px] mi:pb-1.5 mi:pl-2.5 mi:border mi:border-sep mi:rounded-[999px] mi:[background:var(--mi-card)] mi:text-label mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[&.is-off]:opacity-55 mi:motion-reduce:[transition:none]" :class="{ 'is-off': !visible[s.id] }"
          :aria-pressed="visible[s.id]" :style="{ '--c': s.color }" @click="toggleSeries(s.id)"
        >
          <span class="msc__swatch mi:self-center mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:[background:var(--c)] mi:shadow-[inset_0_0_0_2px_var(--c)] mi:[.msc__toggle.is-off_&]:[background:transparent]" aria-hidden="true" />
          <span class="msc__tname mi:font-semibold">{{ s.name }}</span>
          <span class="msc__tavg mi:hidden mi:text-[12px] mi:text-label2 mi:tabular-nums mi:@[560px]:inline">avg {{ Math.round(avg(s.values)) }} ms</span>
        </button>
      </div>

      <div class="msc__chart mi:relative mi:grid mi:grid-cols-[36px_minmax(0,_1fr)] mi:grid-rows-[auto_auto] mi:gap-x-2.5">
        <!-- Sorted readout: a strip above the plot when narrow, floating beside the crosshair when wide. -->
        <div class="msc__tip mi:row-[1] mi:col-span-full mi:grid mi:gap-1.5 mi:mb-3.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)] mi:tabular-nums mi:pointer-events-none mi:@[640px]:absolute mi:@[640px]:z-2 mi:@[640px]:top-2.5 mi:@[640px]:left-[calc(46px_+_(100%_-_46px)_*_var(--xf))] mi:@[640px]:w-47.5 mi:@[640px]:m-0 mi:@[640px]:pt-2.5 mi:@[640px]:px-3 mi:@[640px]:pb-[11px] mi:@[640px]:transform-[translateX(14px)] mi:@[640px]:[background:var(--mi-elev)] mi:@[640px]:shadow-2 mi:@[640px]:border mi:@[640px]:border-sep mi:@[640px]:[&.is-flip]:transform-[translateX(calc(-100%_-_14px))]" :class="{ 'is-flip': idx > days.length / 2 }" :style="{ '--xf': xPct(idx) / 100 }" aria-hidden="true">
          <p class="msc__tip-day mi:text-[12px] mi:font-bold">{{ days[idx] }}</p>
          <p v-if="eventAt" class="msc__tip-event mi:flex mi:gap-1.5 mi:items-center mi:text-[11px] mi:text-label2"><b class="mi:[.msc__tip-event_&]:inline-grid mi:[.msc__tip-event_&]:place-items-center mi:[.msc__tip-event_&]:flex-[none] mi:[.msc__tip-event_&]:rounded-[50%] mi:[.msc__tip-event_&]:text-[9px] mi:[.msc__tip-event_&]:text-p-on mi:[.msc__tip-event_&]:[background:var(--mi-p)]">{{ eventAt.n }}</b>{{ eventAt.text }}</p>
          <ol class="mi:[.msc__tip_&]:flex-wrap mi:[.msc__tip_&]:p-0 mi:[.msc__tip_&]:[list-style:none]">
            <li class="mi:[.msc__tip_&]:items-center mi:[.msc__tip_&]:text-[12px] mi:@[640px]:[.msc__tip_&]:grid-cols-[8px_minmax(0,_1fr)_auto]" v-for="r in readout" :key="r.id">
              <i class="mi:[.msc__tip_li_&]:rounded-[50%] mi:[.msc__tip_li_&]:flex-[none]" :style="{ background: r.color }" /><span>{{ r.name }}</span><b class="mi:[.msc__tip_li_&]:font-650 mi:@[640px]:[.msc__tip_li_&]:text-right">{{ r.v }}</b>
            </li>
          </ol>
        </div>

        <div class="msc__yaxis mi:relative mi:row-[2] mi:h-65 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span class="mi:[.msc__yaxis_&]:right-0" v-for="t in ticks" :key="t" :style="{ top: yPct(t) + '%' }">{{ t }}</span>
        </div>

        <div
          class="msc__plot mi:relative mi:row-[2] mi:col-[2] mi:h-65 mi:overflow-x-clip mi:[overflow-clip-margin:6px] mi:[outline:none] mi:rounded-[4px] mi:touch-pan-y mi:focus-visible:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)]" tabindex="0" role="slider" aria-label="Day under the crosshair" aria-valuemin="0"
          :aria-valuemax="days.length - 1" :aria-valuenow="idx" :aria-valuetext="readoutText" @keydown="onKey"
        >
          <svg class="mi:[.msc__plot_&]:block mi:[.msc__plot_&]:overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="t in ticks" :key="t" x1="0" x2="1000" :y1="yPct(t) * 3" :y2="yPct(t) * 3" class="msc__grid mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
            <line v-for="e in events" :key="e.i" :x1="xPct(e.i) * 10" :x2="xPct(e.i) * 10" y1="0" y2="300" class="msc__guide mi:stroke-label3 mi:[stroke-width:1] mi:[stroke-dasharray:2_4] mi:opacity-70 mi:[vector-effect:non-scaling-stroke]" />
            <path
              v-for="s in series" :key="s.id" :d="pathOf(s.values)" class="msc__line mi:fill-[color:none] mi:[stroke-width:1.75] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-lead]:[stroke-width:2.25] mi:[&.is-off]:opacity-0 mi:motion-reduce:[transition:none]"
              :class="{ 'is-off': !visible[s.id], 'is-lead': s.id === lead }" :style="{ stroke: s.color }"
            />
          </svg>

          <div class="msc__hits mi:absolute mi:inset-0 mi:flex" aria-hidden="true">
            <span class="mi:[.msc__hits_&]:flex-[1_1_0]" v-for="(d, i) in days" :key="d" @pointerenter="idx = i" />
          </div>

          <div class="msc__cross mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" aria-hidden="true" :style="{ transform: `translateX(${xPct(idx)}%)` }">
            <i class="msc__rule mi:absolute mi:left-[-.5px] mi:top-0 mi:bottom-0 mi:w-px mi:[background:var(--mi-label2)] mi:opacity-55" />
            <span
              v-for="s in series" :key="s.id" class="msc__dotrow mi:absolute mi:inset-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-off]:opacity-0 mi:motion-reduce:[transition:none]" :class="{ 'is-off': !visible[s.id] }"
              :style="{ transform: `translateY(${yPct(at(s.values, idx))}%)` }"
            ><i class="mi:[.msc__dotrow_&]:left-[-4.5px] mi:[.msc__dotrow_&]:top-[-4.5px] mi:[.msc__dotrow_&]:rounded-[50%] mi:[.msc__dotrow_&]:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ background: s.color }" /></span>
          </div>
        </div>

        <div class="msc__xaxis mi:relative mi:row-[3] mi:col-[2] mi:h-8.5 mi:mt-1.5 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span v-for="i in [0, 7, 14, 21, 27]" :key="i" class="msc__xl mi:absolute mi:top-0 mi:transform-[translateX(-50%)] mi:whitespace-nowrap" :style="{ left: xPct(i) + '%' }">{{ days[i] }}</span>
          <span v-for="e in events" :key="'e' + e.i" class="msc__pin mi:absolute mi:top-4 mi:grid mi:place-items-center mi:w-[17px] mi:h-[17px] mi:ml-[-8.5px] mi:rounded-[50%] mi:text-[10px] mi:font-bold mi:text-p-text mi:[background:var(--mi-p-tint)] mi:shadow-[0_0_0_2px_var(--mi-card)] mi:[&.is-on]:[background:var(--mi-p)]" :class="{ 'is-on': idx === e.i }" :style="{ left: xPct(e.i) + '%' }">{{ e.n }}</span>
        </div>
      </div>

      <ol class="msc__events mi:grid mi:gap-1 mi:m-0 mi:pt-3 mi:px-0 mi:pb-0 mi:border-t mi:border-t-sep mi:[list-style:none] mi:@[1000px]:grid-cols-3 mi:@[1000px]:gap-2" aria-label="Annotated events">
        <li v-for="e in events" :key="e.i">
          <button type="button" class="msc__event mi:grid mi:grid-cols-[18px_auto_minmax(0,_1fr)] mi:items-baseline mi:gap-2 mi:w-full mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-md mi:[background:none] mi:text-label mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-on': idx === e.i }" :aria-pressed="idx === e.i" @click="idx = e.i">
            <span class="msc__event-n mi:self-center mi:grid mi:place-items-center mi:w-4.5 mi:h-4.5 mi:rounded-[50%] mi:text-[10px] mi:font-bold mi:text-p-text mi:[background:var(--mi-p-tint)] mi:[.msc__event.is-on_&]:text-p-on mi:[.msc__event.is-on_&]:[background:var(--mi-p)]" aria-hidden="true">{{ e.n }}</span>
            <span class="msc__event-day mi:text-[12px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ days[e.i] }}</span>
            <span class="msc__event-text mi:min-w-0 mi:text-pretty">{{ e.text }}</span>
          </button>
        </li>
      </ol>
      <p class="msc__sr mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ readoutText }}</p>
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
.msc__toggle { font: inherit; font-size: 13px;
}
.msc__toggle.is-off .msc__tname { text-decoration: line-through; text-decoration-color: var(--mi-label3); }
.msc__yaxis span { position: absolute; transform: translateY(-50%); }
.msc__plot svg { width: 100%; height: 100%; }
.msc__hits span:first-child, .msc__hits span:last-child { flex-grow: .5; }
.msc__dotrow i { position: absolute; width: 9px; height: 9px; }
.msc__tip p { margin: 0; }
.msc__tip-event b { width: 15px; height: 15px; }
.msc__tip ol { display: flex; gap: 4px 14px; margin: 0; }
.msc__tip li { display: flex; gap: 6px; }
.msc__tip li i { width: 8px; height: 8px; }
.msc__tip li span { color: var(--mi-label2); }

@container (min-width: 640px) {
  .msc__tip ol { display: grid; gap: 5px; }
  .msc__tip li { display: grid; gap: 8px; }
}
.msc__xl:first-child { transform: none; }
.msc__xl:nth-child(5) { transform: translateX(-100%); }
.msc__pin.is-on { color: var(--mi-p-on); }
.msc__event { font: inherit; font-size: 13px;
}
.msc__event:hover { background: var(--mi-fill4); }
.msc__event.is-on { background: var(--mi-p-tint); }
</style>
