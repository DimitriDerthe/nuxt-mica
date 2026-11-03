<template>
  <section class="crt" aria-labelledby="crt-title">
    <header class="crt__head">
      <div>
        <MiText id="crt-title" variant="title3" as="h2" weight="semibold">Weekly signup retention</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · cohorts by signup week · {{ plan === 'all' ? 'all plans' : planName + ' plan' }}</MiText>
      </div>
      <div class="crt__controls">
        <MiSegmented v-model="plan" label="Plan" :options="plans" />
        <MiSegmented v-model="metric" label="Show" :options="metrics" />
      </div>
    </header>

    <!-- Retention triangle: each row is a cohort, each column the weeks since signup. -->
    <div class="crt__scroll">
      <table class="crt__table">
        <caption class="crt__sr">Share of each signup cohort still active, by week since signup</caption>
        <thead>
          <tr>
            <th scope="col" class="crt__cohort">Cohort</th>
            <th scope="col" class="crt__size">Signups</th>
            <th v-for="w in weeks" :key="w" scope="col" :class="{ 'is-col': active?.week === w }">W{{ w }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, c) in rows" :key="row.label">
            <th scope="row" class="crt__cohort">{{ row.label }}</th>
            <td class="crt__size">{{ row.size.toLocaleString('en-US') }}</td>
            <td v-for="(v, w) in row.cells" :key="w" :class="{ 'is-col': active?.week === w }">
              <button
                v-if="v !== null" type="button" class="crt__cell"
                :class="{ 'is-on': active?.cohort === c && active?.week === w, 'is-dark': v > 52 }"
                :style="{ '--heat': Math.round(v * 0.8) + '%' }"
                :aria-label="describe(c, w)" @mouseenter="active = { cohort: c, week: w }" @focus="active = { cohort: c, week: w }"
              >
                {{ format(row, w) }}
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" class="crt__cohort">Average</th>
            <td class="crt__size">{{ totalSignups.toLocaleString('en-US') }}</td>
            <td v-for="w in weeks" :key="w" class="crt__avg" :class="{ 'is-col': active?.week === w }">{{ averages[w]?.toFixed(1) }}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p class="crt__readout" aria-live="polite">
      <MiIcon name="info-circle" :size="16" class="crt__readout-icon" />
      {{ active ? describe(active.cohort, active.week) : 'Point at a cell to read its cohort. Later cohorts hold on longer since the new onboarding checklist shipped on Sep 22.' }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Cohort { label: string, size: number, values: number[], cells: (number | null)[] }
type Plan = 'all' | 'starter' | 'pro'

const plans = [{ value: 'all', label: 'All' }, { value: 'starter', label: 'Starter' }, { value: 'pro', label: 'Pro' }]
const metrics = [{ value: 'pct', label: '%' }, { value: 'users', label: 'Users' }]
const plan = ref<string | number | null>('all')
const metric = ref<string | number | null>('pct')
const active = ref<{ cohort: number, week: number } | null>(null)
const planName = computed(() => plans.find(p => p.value === plan.value)?.label ?? '')

const weeks = [0, 1, 2, 3, 4, 5, 6, 7]
// Shared decay curve, lifted per cohort by onboarding changes and per plan by stickiness.
const curve = [100, 58, 46, 41, 38, 36, 35, 34]
const cohorts = [
  { label: 'Sep 1', size: 1180, lift: 0.9 }, { label: 'Sep 8', size: 1242, lift: 0.93 },
  { label: 'Sep 15', size: 1204, lift: 0.95 }, { label: 'Sep 22', size: 1391, lift: 1.04 },
  { label: 'Sep 29', size: 1458, lift: 1.07 }, { label: 'Oct 6', size: 1512, lift: 1.09 },
  { label: 'Oct 13', size: 1376, lift: 1.12 }, { label: 'Oct 20', size: 1603, lift: 1.14 }
]
const planShape: Record<Plan, { share: number, lift: number }> = { all: { share: 1, lift: 1 }, starter: { share: 0.68, lift: 0.86 }, pro: { share: 0.32, lift: 1.27 } }

const rows = computed<Cohort[]>(() => {
  const p = planShape[(plan.value ?? 'all') as Plan]
  return cohorts.map((c, i) => {
    const values = curve.slice(0, curve.length - i).map((v, w) => (w === 0 ? 100 : Math.min(96, Math.round(v * c.lift * p.lift * 10) / 10)))
    return { label: c.label, size: Math.round(c.size * p.share), values, cells: weeks.map(w => values[w] ?? null) }
  })
})

const totalSignups = computed(() => rows.value.reduce((t, r) => t + r.size, 0))
// Signup-weighted average of every cohort that has reached that week.
const averages = computed(() => weeks.map((w) => {
  const reached = rows.value.filter(r => r.values[w] !== undefined)
  const size = reached.reduce((t, r) => t + r.size, 0)
  return reached.reduce((t, r) => t + r.values[w]! * r.size, 0) / size
}))

const users = (r: Cohort, w: number) => Math.round(r.size * r.values[w]! / 100)
const format = (r: Cohort, w: number) => (metric.value === 'users' ? users(r, w).toLocaleString('en-US') : r.values[w]!.toFixed(w === 0 ? 0 : 1))
function describe(c: number, w: number) {
  const r = rows.value[c]!
  const gap = r.values[w]! - averages.value[w]!
  return `${r.label} cohort, week ${w}: ${r.values[w]!.toFixed(1)}% of ${r.size.toLocaleString('en-US')} signups still active (${users(r, w).toLocaleString('en-US')} people), ${Math.abs(gap).toFixed(1)} pts ${gap >= 0 ? 'above' : 'below'} average.`
}
</script>

<style scoped>
.crt { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.crt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.crt__controls { display: flex; flex-wrap: wrap; gap: 8px; }

.crt__scroll { min-width: 0; overflow-x: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.crt__table { width: 100%; min-width: 600px; border-collapse: separate; border-spacing: 3px; padding: 8px; font-size: 12px; font-variant-numeric: tabular-nums; }
.crt__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.crt__table th { font-weight: 600; color: var(--mi-label2); text-align: center; padding: 6px 2px; }
.crt__table th.is-col, .crt__avg.is-col { color: var(--mi-p-text); }
.crt__table .crt__cohort { text-align: start; padding-inline: 8px 4px; white-space: nowrap; color: var(--mi-label); }
.crt__size { text-align: end; padding-inline-end: 10px; color: var(--mi-label2); }
.crt__table td { padding: 0; }

.crt__cell {
  display: block; width: 100%; min-width: 48px; padding: 9px 4px; border: 0; border-radius: 7px; font: inherit; font-weight: 600; cursor: default; color: var(--mi-label);
  background: color-mix(in srgb, var(--mi-p) var(--heat), var(--mi-card)); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.crt__cell.is-dark { color: var(--mi-p-on); }
.crt__cell.is-on { transform: scale(1.08); box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-p); }
.crt__cell:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.crt__avg { text-align: center; padding-block: 8px; font-weight: 600; color: var(--mi-label2); border-top: 1px solid var(--mi-sep); }

.crt__readout { display: flex; align-items: flex-start; gap: 8px; margin: 0; min-height: 40px; font-size: 13px; color: var(--mi-label2); }
.crt__readout-icon { flex: none; margin-top: 1px; color: var(--mi-p); }
@container (min-width: 720px) { .crt__table { font-size: 13px; } }
</style>
