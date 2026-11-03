<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="msc-title">
    <div class="mi:grid mi:gap-4 mi:pt-5 mi:px-5 mi:pb-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
        <div class="mi:grid mi:gap-0.5">
          <MiText id="msc-title" variant="title3" as="h2" weight="semibold">API latency by region</MiText>
          <MiText variant="footnote" tone="label2">Relay gateway · {{ pct }} response time, last 28 days</MiText>
        </div>
        <MiSegmented v-model="percentile" label="Percentile" :options="percentiles" />
      </header>

      <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Show or hide regions">
        <button
          v-for="s in series" :key="s.id" type="button" class="mi:[font:inherit] mi:text-[13px] mi:inline-flex mi:items-baseline mi:gap-2 mi:pt-1.5 mi:pr-[11px] mi:pb-1.5 mi:pl-2.5 mi:border mi:border-sep mi:rounded-[999px] mi:[background:var(--mi-card)] mi:text-label mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:motion-reduce:[transition:none]" :class="visible[s.id] ? '' : 'mi:opacity-55'"
          :aria-pressed="visible[s.id]" :style="{ '--c': s.color }" @click="toggleSeries(s.id)"
        >
          <span class="mi:self-center mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:shadow-[inset_0_0_0_2px_var(--c)]" :class="visible[s.id] ? 'mi:[background:var(--c)]' : 'mi:[background:transparent]'" aria-hidden="true" />
          <span class="mi:font-semibold" :class="visible[s.id] ? '' : 'mi:line-through mi:decoration-label3'">{{ s.name }}</span>
          <span class="mi:hidden mi:text-[12px] mi:text-label2 mi:tabular-nums mi:@[560px]:inline">avg {{ Math.round(avg(s.values)) }} ms</span>
        </button>
      </div>

      <div class="mi:relative mi:grid mi:grid-cols-[36px_minmax(0,_1fr)] mi:grid-rows-[auto_auto] mi:gap-x-2.5">
        <!-- Sorted readout: a strip above the plot when narrow, floating beside the crosshair when wide. -->
        <div class="mi:row-[1] mi:col-span-full mi:grid mi:gap-1.5 mi:mb-3.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)] mi:tabular-nums mi:pointer-events-none mi:@[640px]:absolute mi:@[640px]:z-2 mi:@[640px]:top-2.5 mi:@[640px]:left-[calc(46px_+_(100%_-_46px)_*_var(--xf))] mi:@[640px]:w-47.5 mi:@[640px]:m-0 mi:@[640px]:pt-2.5 mi:@[640px]:px-3 mi:@[640px]:pb-[11px] mi:@[640px]:[background:var(--mi-elev)] mi:@[640px]:shadow-2 mi:@[640px]:border mi:@[640px]:border-sep" :class="idx > days.length / 2 ? 'mi:@[640px]:transform-[translateX(calc(-100%_-_14px))]' : 'mi:@[640px]:transform-[translateX(14px)]'" :style="{ '--xf': xPct(idx) / 100 }" aria-hidden="true">
          <p class="mi:m-0 mi:text-[12px] mi:font-bold">{{ days[idx] }}</p>
          <p v-if="eventAt" class="mi:m-0 mi:flex mi:gap-1.5 mi:items-center mi:text-[11px] mi:text-label2"><b class="mi:w-[15px] mi:h-[15px] mi:inline-grid mi:place-items-center mi:flex-[none] mi:rounded-[50%] mi:text-[9px] mi:text-p-on mi:[background:var(--mi-p)]">{{ eventAt.n }}</b>{{ eventAt.text }}</p>
          <ol class="mi:flex mi:gap-[4px_14px] mi:m-0 mi:@[640px]:grid mi:@[640px]:gap-[5px] mi:flex-wrap mi:p-0 mi:[list-style:none]">
            <li class="mi:flex mi:gap-1.5 mi:@[640px]:grid mi:@[640px]:gap-2 mi:items-center mi:text-[12px] mi:@[640px]:grid-cols-[8px_minmax(0,_1fr)_auto]" v-for="r in readout" :key="r.id">
              <i class="mi:w-2 mi:h-2 mi:rounded-[50%] mi:flex-[none]" :style="{ background: r.color }" /><span class="mi:text-label2">{{ r.name }}</span><b class="mi:font-650 mi:@[640px]:text-right">{{ r.v }}</b>
            </li>
          </ol>
        </div>

        <div class="mi:relative mi:row-[2] mi:h-65 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span class="mi:absolute mi:transform-[translateY(-50%)] mi:right-0" v-for="t in ticks" :key="t" :style="{ top: yPct(t) + '%' }">{{ t }}</span>
        </div>

        <div
          class="mi:relative mi:row-[2] mi:col-[2] mi:h-65 mi:overflow-x-clip mi:[overflow-clip-margin:6px] mi:[outline:none] mi:rounded-[4px] mi:touch-pan-y mi:focus-visible:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)]" tabindex="0" role="slider" aria-label="Day under the crosshair" aria-valuemin="0"
          :aria-valuemax="days.length - 1" :aria-valuenow="idx" :aria-valuetext="readoutText" @keydown="onKey"
        >
          <svg class="mi:w-full mi:h-full mi:block mi:overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="t in ticks" :key="t" x1="0" x2="1000" :y1="yPct(t) * 3" :y2="yPct(t) * 3" class="mi:stroke-sep mi:[stroke-width:1] mi:[vector-effect:non-scaling-stroke]" />
            <line v-for="e in events" :key="e.i" :x1="xPct(e.i) * 10" :x2="xPct(e.i) * 10" y1="0" y2="300" class="mi:stroke-label3 mi:[stroke-width:1] mi:[stroke-dasharray:2_4] mi:opacity-70 mi:[vector-effect:non-scaling-stroke]" />
            <path
              v-for="s in series" :key="s.id" :d="pathOf(s.values)" class="mi:fill-[color:none] mi:[stroke-linejoin:round] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none]"
              :class="[visible[s.id] ? '' : 'mi:opacity-0', s.id === lead ? 'mi:[stroke-width:2.25]' : 'mi:[stroke-width:1.75]']" :style="{ stroke: s.color }"
            />
          </svg>

          <div class="mi:absolute mi:inset-0 mi:flex" aria-hidden="true">
            <span class="mi:flex-[1_1_0] mi:first:[flex-grow:.5] mi:last:[flex-grow:.5]" v-for="(d, i) in days" :key="d" @pointerenter="idx = i" />
          </div>

          <div class="mi:absolute mi:inset-0 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" aria-hidden="true" :style="{ transform: `translateX(${xPct(idx)}%)` }">
            <i class="mi:absolute mi:left-[-.5px] mi:top-0 mi:bottom-0 mi:w-px mi:[background:var(--mi-label2)] mi:opacity-55" />
            <span
              v-for="s in series" :key="s.id" class="mi:absolute mi:inset-0 mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:motion-reduce:[transition:none]" :class="visible[s.id] ? '' : 'mi:opacity-0'"
              :style="{ transform: `translateY(${yPct(at(s.values, idx))}%)` }"
            ><i class="mi:absolute mi:w-[9px] mi:h-[9px] mi:left-[-4.5px] mi:top-[-4.5px] mi:rounded-[50%] mi:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ background: s.color }" /></span>
          </div>
        </div>

        <div class="mi:relative mi:row-[3] mi:col-[2] mi:h-8.5 mi:mt-1.5 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
          <span v-for="i in [0, 7, 14, 21, 27]" :key="i" class="mi:absolute mi:top-0 mi:transform-[translateX(-50%)] mi:whitespace-nowrap mi:first:transform-none mi:[&:nth-child(5)]:transform-[translateX(-100%)]" :style="{ left: xPct(i) + '%' }">{{ days[i] }}</span>
          <span v-for="e in events" :key="'e' + e.i" class="mi:absolute mi:top-4 mi:grid mi:place-items-center mi:w-[17px] mi:h-[17px] mi:ml-[-8.5px] mi:rounded-[50%] mi:text-[10px] mi:font-bold mi:shadow-[0_0_0_2px_var(--mi-card)]" :class="idx === e.i ? 'mi:text-p-on mi:[background:var(--mi-p)]' : 'mi:text-p-text mi:[background:var(--mi-p-tint)]'" :style="{ left: xPct(e.i) + '%' }">{{ e.n }}</span>
        </div>
      </div>

      <ol class="mi:grid mi:gap-1 mi:m-0 mi:pt-3 mi:px-0 mi:pb-0 mi:border-t mi:border-t-sep mi:[list-style:none] mi:@[1000px]:grid-cols-3 mi:@[1000px]:gap-2" aria-label="Annotated events">
        <li v-for="e in events" :key="e.i">
          <button type="button" class="mi:[font:inherit] mi:text-[13px] mi:grid mi:grid-cols-[18px_auto_minmax(0,_1fr)] mi:items-baseline mi:gap-2 mi:w-full mi:py-1.5 mi:px-2 mi:[border:0] mi:rounded-md mi:[background:none] mi:text-label mi:text-start mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="idx === e.i ? 'mi:bg-p-tint' : 'mi:hover:bg-fill4'" :aria-pressed="idx === e.i" @click="idx = e.i">
            <span class="mi:self-center mi:grid mi:place-items-center mi:w-4.5 mi:h-4.5 mi:rounded-[50%] mi:text-[10px] mi:font-bold" :class="idx === e.i ? 'mi:text-p-on mi:[background:var(--mi-p)]' : 'mi:text-p-text mi:[background:var(--mi-p-tint)]'" aria-hidden="true">{{ e.n }}</span>
            <span class="mi:text-[12px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ days[e.i] }}</span>
            <span class="mi:min-w-0 mi:text-pretty">{{ e.text }}</span>
          </button>
        </li>
      </ol>
      <p class="mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ readoutText }}</p>
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

