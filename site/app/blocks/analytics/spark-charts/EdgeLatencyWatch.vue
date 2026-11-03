<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="el-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="el-title" variant="title3" as="h2" weight="semibold">Edge latency</MiText>
        <MiText variant="footnote" tone="label2">p95 response time per region · SLO {{ SLO }} ms</MiText>
      </div>
      <MiSegmented v-model="windowId" label="Time window" :options="windows" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[640px]:grid-cols-[minmax(0,_1.4fr)_minmax(0,_1fr)]">
      <div class="mi:rounded-lg mi:bg-card mi:shadow-1 mi:grid mi:gap-1.5 mi:py-4 mi:px-4.5">
        <MiText variant="caption" tone="label2" weight="medium">Fleet p95, {{ win.label }}</MiText>
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-2.5">
          <p class="mi:m-0 mi:text-[36px] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ fleetNow }}<small class="mi:text-[14px] mi:font-medium mi:tracking-[0] mi:text-label2"> ms</small></p>
          <MiSparkline :key="'fleet-' + String(windowId)" :values="fleet" :width="140" :height="40" stroke="var(--mi-p)" label="Fleet p95 trend" />
        </div>
      </div>
      <dl class="mi:rounded-lg mi:bg-card mi:shadow-1 mi:grid mi:grid-cols-[1fr_1fr] mi:m-0">
        <div class="mi:grid mi:content-center mi:gap-1 mi:py-3.5 mi:px-4.5"><dt class="mi:text-[12px] mi:font-medium mi:text-label2">Requests</dt><dd class="mi:text-[24px] mi:font-bold mi:tracking-[-.03em] mi:m-0 mi:tabular-nums">{{ totalRps }}<small class="mi:text-[14px] mi:font-medium mi:tracking-[0] mi:text-label2">/s</small></dd></div>
        <div class="mi:grid mi:content-center mi:gap-1 mi:py-3.5 mi:px-4.5 mi:border-l mi:border-l-sep"><dt class="mi:text-[12px] mi:font-medium mi:text-label2">Degraded</dt><dd class="mi:text-[24px] mi:font-bold mi:tracking-[-.03em] mi:m-0 mi:tabular-nums" :class="degradedCount > 0 ? 'mi:text-orange-t' : ''">{{ degradedCount }}<small class="mi:text-[14px] mi:font-medium mi:tracking-[0] mi:text-label2"> of {{ regions.length }}</small></dd></div>
      </dl>
    </div>

    <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3 mi:items-center">
      <MiSegmented v-model="sort" label="Sort regions" :options="sorts" />
      <div class="mi:inline-flex mi:items-center mi:gap-2">
        <MiSwitch v-model="onlyDegraded" size="compact" label="Show degraded regions only" />
        <MiText variant="footnote" as="span" aria-hidden="true">Degraded only</MiText>
      </div>
    </div>

    <div class="mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden" role="table" aria-label="Regions">
      <div class="mi:grid mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:py-3 mi:px-4 mi:border-t mi:border-t-sep mi:grid-cols-[minmax(0,_1fr)_auto] mi:[grid-template-areas:'region_p95'_'spark_headroom'_'spark_err'] mi:hidden mi:@[720px]:[grid-template-areas:none] mi:@[720px]:gap-4 mi:@[720px]:grid-cols-[minmax(0,_1.5fr)_120px_100px_minmax(110px,_1fr)_64px] mi:@[720px]:grid mi:@[720px]:py-2.5 mi:@[720px]:bg-fill4 mi:@[720px]:text-[12px] mi:@[720px]:font-semibold mi:@[720px]:text-label2" role="row">
        <span class="mi:@[720px]:[grid-area:auto]" role="columnheader">Region</span>
        <span class="mi:@[720px]:[grid-area:auto]" role="columnheader">Trend</span>
        <span class="mi:@[720px]:[grid-area:auto]" role="columnheader">p95</span>
        <span class="mi:@[720px]:[grid-area:auto]" role="columnheader">SLO headroom</span>
        <span class="mi:@[720px]:[grid-area:auto]" role="columnheader">Errors</span>
      </div>
      <TransitionGroup tag="div" move-class="mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:absolute mi:inset-x-0" enter-from-class="mi:opacity-0" leave-to-class="mi:opacity-0" role="rowgroup" class="mi:relative mi:grid">
        <div v-for="r in rows" :key="r.code" class="mi:grid mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:py-3 mi:px-4 mi:border-t mi:border-t-sep mi:grid-cols-[minmax(0,_1fr)_auto] mi:[grid-template-areas:'region_p95'_'spark_headroom'_'spark_err'] mi:first:[border-top:0] mi:@[720px]:first:border-t mi:@[720px]:first:border-t-sep mi:@[720px]:[grid-template-areas:none] mi:@[720px]:gap-4 mi:@[720px]:grid-cols-[minmax(0,_1.5fr)_120px_100px_minmax(110px,_1fr)_64px]"  role="row">
          <span class="mi:[grid-area:region] mi:flex mi:items-center mi:gap-2 mi:min-w-0 mi:@[720px]:[grid-area:auto]" role="cell">
            <i class="mi:flex-[none] mi:w-2 mi:h-2 mi:rounded-[50%]" :class="r.degraded ? 'mi:bg-orange mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-orange)_22%,_transparent)]' : 'mi:bg-green'" aria-hidden="true" />
            <span class="mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[15px] mi:font-semibold">{{ r.city }}</span>
            <span class="mi:flex-[none] mi:py-px mi:px-1.5 mi:rounded-[6px] mi:bg-fill4 mi:[font:600_11px/1.5_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:text-label2">{{ r.code }}</span>
            <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ r.degraded ? 'degraded' : 'healthy' }}</span>
          </span>
          <span class="mi:[grid-area:spark] mi:flex mi:@[720px]:[grid-area:auto]" role="cell">
            <MiSparkline
              :key="r.code + String(windowId)" :values="r.series" :width="112" :height="28"
              :stroke="r.degraded ? 'var(--mi-orange)' : undefined" :color="r.degraded ? 'var(--mi-orange)' : 'var(--mi-p)'"
              :label="`${r.city} p95 trend, ${r.series[0]} to ${r.now} ms`"
            />
          </span>
          <span class="mi:[grid-area:p95] mi:justify-self-end mi:text-[13px] mi:text-label2 mi:tabular-nums mi:whitespace-nowrap mi:@[720px]:[grid-area:auto] mi:@[720px]:justify-self-end" role="cell">
            <b class="mi:text-[15px] mi:font-bold mi:text-label">{{ r.now }}</b> ms
            <small class="mi:text-[11px] mi:font-semibold mi:ml-1.5" :class="r.delta > 0 ? 'mi:text-orange-t' : 'mi:text-green-t'">{{ r.delta > 0 ? '+' : '' }}{{ r.delta }}</small>
          </span>
          <span class="mi:[grid-area:headroom] mi:grid mi:gap-1 mi:justify-items-end mi:w-30 mi:justify-self-end mi:@[720px]:[grid-area:auto] mi:@[720px]:w-auto mi:@[720px]:justify-self-stretch mi:@[720px]:justify-items-start" role="cell">
            <span class="mi:block mi:w-full mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" :aria-label="`${r.city} share of SLO used`" :aria-valuenow="r.used" aria-valuemin="0" aria-valuemax="100">
              <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="r.used >= 100 ? 'mi:bg-red' : r.used >= 80 ? 'mi:bg-orange' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(r.used, 100) / 100})` }" />
            </span>
            <small class="mi:text-[11px] mi:text-label2 mi:tabular-nums">{{ r.used >= 100 ? 'Breach' : (100 - r.used) + '% left' }}</small>
          </span>
          <span class="mi:[grid-area:err] mi:justify-self-end mi:text-[12px] mi:tabular-nums mi:@[720px]:[grid-area:auto] mi:@[720px]:justify-self-end" role="cell" :class="r.errors >= ERR_LIMIT ? 'mi:text-red-t mi:font-semibold' : 'mi:text-label2'">{{ r.errors.toFixed(2) }}%</span>
        </div>
      </TransitionGroup>
      <p v-if="!rows.length" class="mi:m-0 mi:py-6 mi:px-4 mi:text-center mi:text-[14px] mi:text-label2">Every region is inside its SLO for {{ win.label }}.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const SLO = 300
const ERR_LIMIT = 0.5

const windows = [{ value: 'live', label: '30 min' }, { value: 'day', label: '24 h' }]
const windowId = ref<string | number | null>('live')
const sorts = [{ value: 'slow', label: 'Slowest' }, { value: 'errors', label: 'Errors' }, { value: 'name', label: 'A–Z' }]
const sort = ref<string | number | null>('slow')
const onlyDegraded = ref(false)

const win = computed(() => (windowId.value === 'day' ? { label: 'last 24 h', points: 24, step: 0.42 } : { label: 'last 30 min', points: 15, step: 0.9 }))

// Region profiles: base p95, wobble, an optional climb at the end, error rate per window.
const profiles = [
  { code: 'fra1', city: 'Frankfurt', base: 92, amp: 9, climb: 0, rps: 4820, err: [0.08, 0.11] },
  { code: 'ams1', city: 'Amsterdam', base: 104, amp: 11, climb: 0, rps: 3110, err: [0.12, 0.09] },
  { code: 'iad1', city: 'Washington, D.C.', base: 118, amp: 14, climb: 0, rps: 6240, err: [0.21, 0.18] },
  { code: 'sfo1', city: 'San Francisco', base: 131, amp: 12, climb: 22, rps: 3870, err: [0.17, 0.2] },
  { code: 'gru1', city: 'São Paulo', base: 188, amp: 21, climb: 74, rps: 1420, err: [0.64, 0.38] },
  { code: 'bom1', city: 'Mumbai', base: 206, amp: 18, climb: 0, rps: 1980, err: [0.31, 0.27] },
  { code: 'sin1', city: 'Singapore', base: 162, amp: 16, climb: 0, rps: 2650, err: [0.14, 0.16] },
  { code: 'nrt1', city: 'Tokyo', base: 141, amp: 10, climb: 0, rps: 2390, err: [0.09, 0.1] },
  { code: 'syd1', city: 'Sydney', base: 236, amp: 24, climb: 58, rps: 980, err: [0.42, 0.55] }
]

// Deterministic sample series, so the block renders the same on server and client.
function series (base: number, amp: number, climb: number, seed: number): number[] {
  const { points, step } = win.value
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin(i * step + seed) * amp + Math.sin(i * step * 2.3 + seed * 1.7) * amp * 0.4
    const tail = climb * Math.max(0, (i - points * 0.6) / (points * 0.4))
    return Math.round(base + wave + tail)
  })
}

const regions = computed(() => profiles.map((p, k) => {
  const s = series(p.base, p.amp, windowId.value === 'day' ? p.climb * 0.5 : p.climb, k * 1.3)
  const now = s[s.length - 1] ?? 0
  const errors = p.err[windowId.value === 'day' ? 1 : 0] ?? 0
  const used = Math.round((now / SLO) * 100)
  return { ...p, series: s, now, delta: now - (s[0] ?? 0), errors, used, degraded: used >= 80 || errors >= ERR_LIMIT }
}))

const rows = computed(() => {
  const list = regions.value.filter(r => !onlyDegraded.value || r.degraded)
  if (sort.value === 'name') return [...list].sort((a, b) => a.city.localeCompare(b.city))
  if (sort.value === 'errors') return [...list].sort((a, b) => b.errors - a.errors)
  return [...list].sort((a, b) => b.now - a.now)
})

const fleet = computed(() => {
  const n = regions.value[0]?.series.length ?? 0
  return Array.from({ length: n }, (_, i) => Math.round(regions.value.reduce((t, r) => t + (r.series[i] ?? 0), 0) / regions.value.length))
})
const fleetNow = computed(() => fleet.value[fleet.value.length - 1] ?? 0)
const totalRps = computed(() => profiles.reduce((t, p) => t + p.rps, 0).toLocaleString('en-US'))
const degradedCount = computed(() => regions.value.filter(r => r.degraded).length)
</script>

