<template>
  <section class="el" aria-labelledby="el-title">
    <header class="el__head">
      <div>
        <MiText id="el-title" variant="title3" as="h2" weight="semibold">Edge latency</MiText>
        <MiText variant="footnote" tone="label2">p95 response time per region · SLO {{ SLO }} ms</MiText>
      </div>
      <MiSegmented v-model="windowId" label="Time window" :options="windows" />
    </header>

    <div class="el__summary">
      <div class="el__fleet">
        <MiText variant="caption" tone="label2" weight="medium">Fleet p95, {{ win.label }}</MiText>
        <div class="el__fleet-row">
          <p class="el__big">{{ fleetNow }}<small> ms</small></p>
          <MiSparkline :key="'fleet-' + String(windowId)" :values="fleet" :width="140" :height="40" stroke="var(--mi-p)" label="Fleet p95 trend" />
        </div>
      </div>
      <dl class="el__facts">
        <div><dt>Requests</dt><dd>{{ totalRps }}<small>/s</small></dd></div>
        <div><dt>Degraded</dt><dd :class="{ 'is-warn': degradedCount > 0 }">{{ degradedCount }}<small> of {{ regions.length }}</small></dd></div>
      </dl>
    </div>

    <div class="el__tools">
      <MiSegmented v-model="sort" label="Sort regions" :options="sorts" />
      <div class="el__switch">
        <MiSwitch v-model="onlyDegraded" size="compact" label="Show degraded regions only" />
        <MiText variant="footnote" as="span" aria-hidden="true">Degraded only</MiText>
      </div>
    </div>

    <div class="el__table" role="table" aria-label="Regions">
      <div class="el__row el__row--head" role="row">
        <span role="columnheader">Region</span>
        <span role="columnheader">Trend</span>
        <span role="columnheader">p95</span>
        <span role="columnheader">SLO headroom</span>
        <span role="columnheader">Errors</span>
      </div>
      <TransitionGroup name="el-row" tag="div" role="rowgroup" class="el__rows">
        <div v-for="r in rows" :key="r.code" class="el__row" :class="{ 'is-degraded': r.degraded }" role="row">
          <span class="el__region" role="cell">
            <i class="el__dot" aria-hidden="true" />
            <span class="el__name">{{ r.city }}</span>
            <span class="el__code">{{ r.code }}</span>
            <span class="el__sr">{{ r.degraded ? 'degraded' : 'healthy' }}</span>
          </span>
          <span class="el__spark" role="cell">
            <MiSparkline
              :key="r.code + String(windowId)" :values="r.series" :width="112" :height="28"
              :stroke="r.degraded ? 'var(--mi-orange)' : undefined" :color="r.degraded ? 'var(--mi-orange)' : 'var(--mi-p)'"
              :label="`${r.city} p95 trend, ${r.series[0]} to ${r.now} ms`"
            />
          </span>
          <span class="el__p95" role="cell">
            <b>{{ r.now }}</b> ms
            <small :class="r.delta > 0 ? 'is-worse' : 'is-better'">{{ r.delta > 0 ? '+' : '' }}{{ r.delta }}</small>
          </span>
          <span class="el__headroom" role="cell">
            <span class="el__track" role="meter" :aria-label="`${r.city} share of SLO used`" :aria-valuenow="r.used" aria-valuemin="0" aria-valuemax="100">
              <span :class="r.used >= 100 ? 'is-breach' : r.used >= 80 ? 'is-warn' : ''" :style="{ transform: `scaleX(${Math.min(r.used, 100) / 100})` }" />
            </span>
            <small>{{ r.used >= 100 ? 'Breach' : (100 - r.used) + '% left' }}</small>
          </span>
          <span class="el__err" role="cell" :class="{ 'is-warn': r.errors >= ERR_LIMIT }">{{ r.errors.toFixed(2) }}%</span>
        </div>
      </TransitionGroup>
      <p v-if="!rows.length" class="el__empty">Every region is inside its SLO for {{ win.label }}.</p>
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

<style scoped>
.el { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.el__head, .el__tools { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.el__tools { align-items: center; }
.el__switch { display: inline-flex; align-items: center; gap: 8px; }
.el__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.el__summary { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 640px) { .el__summary { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); } }
.el__fleet, .el__facts { border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.el__fleet { display: grid; gap: 6px; padding: 16px 18px; }
.el__fleet-row { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px; }
.el__big { margin: 0; font-size: 36px; line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.el__big small, .el__facts small { font-size: 14px; font-weight: 500; letter-spacing: 0; color: var(--mi-label2); }
.el__facts { display: grid; grid-template-columns: 1fr 1fr; margin: 0; }
.el__facts > div { display: grid; align-content: center; gap: 4px; padding: 14px 18px; }
.el__facts > div + div { border-left: 1px solid var(--mi-sep); }
.el__facts dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.el__facts dd { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.el__facts dd.is-warn { color: var(--mi-orange-t); }

.el__table { border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.el__rows { position: relative; display: grid; }
/* Narrow: two lines per region. Wide: one aligned row with every column. */
.el__row {
  display: grid; align-items: center; gap: 6px 12px; padding: 12px 16px; border-top: 1px solid var(--mi-sep);
  grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "region p95" "spark headroom" "spark err";
}
.el__row--head { display: none; }
.el__rows > .el__row:first-child { border-top: 0; }
.el__region { grid-area: region; display: flex; align-items: center; gap: 8px; min-width: 0; }
.el__spark { grid-area: spark; display: flex; }
.el__p95 { grid-area: p95; justify-self: end; font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; white-space: nowrap; }
.el__headroom { grid-area: headroom; display: grid; gap: 4px; justify-items: end; width: 120px; justify-self: end; }
.el__err { grid-area: err; justify-self: end; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }

@container (min-width: 720px) {
  .el__row {
    grid-template-areas: none; gap: 16px;
    grid-template-columns: minmax(0, 1.5fr) 120px 100px minmax(110px, 1fr) 64px;
  }
  .el__row > * { grid-area: auto; }
  .el__row--head { display: grid; padding-block: 10px; background: var(--mi-fill4); font-size: 12px; font-weight: 600; color: var(--mi-label2); }
  .el__row--head + .el__rows > .el__row:first-child { border-top: 1px solid var(--mi-sep); }
  .el__p95, .el__err { justify-self: end; }
  .el__headroom { width: auto; justify-self: stretch; justify-items: start; }
}

.el__dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--mi-green); }
.is-degraded .el__dot { background: var(--mi-orange); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-orange) 22%, transparent); }
.el__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 600; }
.el__code { flex: none; padding: 1px 6px; border-radius: 6px; background: var(--mi-fill4); font: 600 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label2); }
.el__p95 b { font-size: 15px; font-weight: 700; color: var(--mi-label); }
.el__p95 small { margin-left: 6px; font-size: 11px; font-weight: 600; }
.el__p95 small.is-worse { color: var(--mi-orange-t); }
.el__p95 small.is-better { color: var(--mi-green-t); }
.el__track { display: block; width: 100%; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.el__track span { display: block; height: 100%; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.el__track span.is-warn { background: var(--mi-orange); }
.el__track span.is-breach { background: var(--mi-red); }
.el__headroom small { font-size: 11px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.el__err.is-warn { color: var(--mi-red-t); font-weight: 600; }
.el__empty { margin: 0; padding: 24px 16px; text-align: center; font-size: 14px; color: var(--mi-label2); }

/* Re-sorting slides rows into place with transform only. */
.el-row-move { transition: transform var(--mi-dur-4) var(--mi-spring); }
.el-row-enter-active, .el-row-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.el-row-enter-from, .el-row-leave-to { opacity: 0; }
.el-row-leave-active { position: absolute; inset-inline: 0; }
@media (prefers-reduced-motion: reduce) { .el-row-move, .el__track span { transition: none; } }
</style>
