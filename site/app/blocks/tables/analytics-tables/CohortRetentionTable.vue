<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="crt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="crt-title" variant="title3" as="h2" weight="semibold">Weekly signup retention</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · cohorts by signup week · {{ plan === 'all' ? 'all plans' : planName + ' plan' }}</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:gap-2">
        <MiSegmented v-model="plan" label="Plan" :options="plans" />
        <MiSegmented v-model="metric" label="Show" :options="metrics" />
      </div>
    </header>

    <!-- Retention triangle: each row is a cohort, each column the weeks since signup. -->
    <div class="mi:min-w-0 mi:overflow-x-auto mi:rounded-xl mi:bg-card mi:shadow-1">
      <table class="mi:w-full mi:min-w-150 mi:border-separate mi:[border-spacing:3px] mi:p-2 mi:text-[12px] mi:tabular-nums mi:@[720px]:text-[13px]">
        <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Share of each signup cohort still active, by week since signup</caption>
        <thead>
          <tr>
            <th scope="col" class="mi:pt-1.5 mi:pb-1.5 mi:ps-2 mi:pe-1 mi:text-label mi:font-semibold mi:text-start mi:whitespace-nowrap">Cohort</th>
            <th scope="col" class="mi:py-1.5 mi:px-0.5 mi:font-semibold mi:text-center mi:text-label2">Signups</th>
            <th class="mi:py-1.5 mi:px-0.5 mi:font-semibold mi:text-center" v-for="w in weeks" :key="w" scope="col" :class="active?.week === w ? 'mi:text-p-text' : 'mi:text-label2'">W{{ w }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, c) in rows" :key="row.label">
            <th scope="row" class="mi:pt-1.5 mi:pb-1.5 mi:ps-2 mi:pe-1 mi:text-label mi:font-semibold mi:text-start mi:whitespace-nowrap">{{ row.label }}</th>
            <td class="mi:p-0 mi:text-end mi:text-label2">{{ row.size.toLocaleString('en-US') }}</td>
            <td v-for="(v, w) in row.cells" :key="w" class="mi:p-0">
              <button
                v-if="v !== null" type="button" class="mi:[font:inherit] mi:font-semibold mi:block mi:w-full mi:min-w-12 mi:py-[9px] mi:px-1 mi:[border:0] mi:rounded-[7px] mi:cursor-default mi:[background:color-mix(in_srgb,_var(--mi-p)_var(--heat),_var(--mi-card))] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
                :class="[v > 52 ? 'mi:text-p-on' : 'mi:text-label', active?.cohort === c && active?.week === w ? 'mi:transform-[scale(1.08)] mi:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-p)]' : '']"
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
            <th scope="row" class="mi:pt-1.5 mi:pb-1.5 mi:ps-2 mi:pe-1 mi:text-label mi:font-semibold mi:text-start mi:whitespace-nowrap">Average</th>
            <td class="mi:p-0 mi:text-end mi:text-label2">{{ totalSignups.toLocaleString('en-US') }}</td>
            <td v-for="w in weeks" :key="w" class="mi:p-0 mi:text-center mi:font-semibold mi:border-t mi:border-t-sep" :class="active?.week === w ? 'mi:text-p-text' : 'mi:text-label2'">{{ averages[w]?.toFixed(1) }}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p class="mi:flex mi:[align-items:flex-start] mi:gap-2 mi:m-0 mi:min-h-10 mi:text-[13px] mi:text-label2" aria-live="polite">
      <MiIcon name="info-circle" :size="16" class="mi:flex-none mi:mt-px mi:text-p" />
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

