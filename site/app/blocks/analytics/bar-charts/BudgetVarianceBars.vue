<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="bv-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="bv-title" variant="title3" as="h2" weight="semibold">Spend against plan</MiText>
        <MiText variant="footnote" tone="label2">Operating budget by department · {{ quarterLabel }} FY25, USD</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:gap-2">
        <MiSegmented v-model="quarter" label="Quarter" :options="quarters" />
        <MiSegmented v-model="sort" label="Sort departments by" :options="sorts" />
      </div>
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[820px]:grid-cols-[minmax(0,_1fr)_300px]">
      <div class="mi:grid mi:gap-1.5 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:py-0 mi:px-2.5 mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-label3" aria-hidden="true">
          <span class="mi:[&:last-child]:text-end">Under plan</span>
          <span class="mi:[&:last-child]:text-end">Over plan</span>
        </div>
        <!-- Diverging bars: each half of the track grows away from the plan line with scaleX. -->
        <TransitionGroup tag="ul" move-class="mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" class="mi:grid mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Variance by department">
          <li v-for="r in rows" :key="r.name">
            <button
              type="button" class="mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:[grid-template-areas:'name_val'_'track_track'] mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:w-full mi:p-2.5 mi:[border:0] mi:rounded-md mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease)] mi:@[560px]:grid-cols-[140px_minmax(0,_1fr)_64px] mi:@[560px]:[grid-template-areas:'name_track_val'] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="picked === r.name ? 'mi:bg-fill4' : 'mi:bg-transparent mi:hover:bg-fill4'" :aria-pressed="picked === r.name"
              :aria-label="`${r.name}, ${signedMoney(r.variance)}, ${signedPct(r.pct)} against plan`" @click="picked = r.name"
            >
              <span class="mi:[grid-area:name] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:font-medium">{{ r.name }}</span>
              <span class="mi:[grid-area:track] mi:relative mi:h-3 mi:rounded-[6px] mi:bg-fill4 mi:after:content-[''] mi:after:absolute mi:after:left-1/2 mi:after:top-[-3px] mi:after:bottom-[-3px] mi:after:w-0.5 mi:after:-ml-px mi:after:rounded-[1px] mi:after:bg-label3" aria-hidden="true">
                <span class="mi:absolute mi:top-0 mi:bottom-0 mi:w-1/2 mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="r.over ? 'mi:left-1/2 mi:rounded-[0_6px_6px_0] mi:origin-left mi:bg-orange' : 'mi:right-1/2 mi:rounded-[6px_0_0_6px] mi:origin-right mi:[background:color-mix(in_srgb,_var(--mi-p)_70%,_var(--mi-card))]'" :style="{ transform: `scaleX(${r.scale})` }" />
              </span>
              <span class="mi:[grid-area:val] mi:text-end mi:text-[13px] mi:font-semibold mi:tabular-nums" :class="r.over ? 'mi:text-orange-t' : 'mi:text-p-text'">{{ signedPct(r.pct) }}</span>
            </button>
          </li>
        </TransitionGroup>
      </div>

      <aside class="mi:grid mi:gap-3 mi:content-start mi:[@container_(min-width:_560px)_and_(max-width:_819px)]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.4fr)]" aria-labelledby="bv-side-title">
        <article class="mi:grid mi:gap-2 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-lg mi:bg-card mi:shadow-1">
          <MiText variant="caption" tone="label2" weight="medium" as="h3">Company net</MiText>
          <p class="mi:m-0 mi:text-[clamp(30px,_6cqi,_38px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums" :class="net > 0 ? 'mi:text-orange-t' : ''">{{ signedMoney(net) }}</p>
          <MiText variant="footnote" tone="label2">{{ money(totalActual) }} spent of {{ money(totalPlan) }} planned</MiText>
        </article>

        <article class="mi:grid mi:gap-2 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-lg mi:bg-card mi:shadow-1" aria-live="polite">
          <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2">
            <MiText id="bv-side-title" variant="headline" as="h3">{{ current.name }}</MiText>
            <MiBadge :tone="current.over ? 'warning' : 'success'" :label="current.over ? 'Over plan' : 'Under plan'" dot />
          </div>
          <MiMeter
            :value="current.actual" :max="Math.max(current.plan, current.actual)" :color="current.over ? 'var(--mi-orange)' : 'var(--mi-p)'"
            :aria-label="`${current.name} spend against plan`" :caption="`${money(current.actual)} actual`" :hint="`${money(current.plan)} plan`"
          />
          <MiText variant="footnote" tone="label2">{{ current.note }}</MiText>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Department { name: string, note: string, plan: [number, number, number], actual: [number, number, number] }
interface Row { name: string, note: string, plan: number, actual: number, variance: number, pct: number, over: boolean, scale: number }

const quarters = [{ value: 0, label: 'Q1' }, { value: 1, label: 'Q2' }, { value: 2, label: 'Q3' }]
const quarter = ref<string | number | null>(2)
const sorts = [{ value: 'variance', label: 'Variance' }, { value: 'size', label: 'Budget' }]
const sort = ref<string | number | null>('variance')
const picked = ref('Marketing')

// Sample budget in $k per quarter; swap for your finance export.
const departments: Department[] = [
  { name: 'Engineering', plan: [1800, 1840, 1880], actual: [1762, 1902, 1991], note: 'Contractor ramp for the mobile rewrite landed a quarter earlier than planned.' },
  { name: 'Sales', plan: [1320, 1360, 1400], actual: [1288, 1331, 1352], note: 'Two account executive seats open since August; commissions track bookings.' },
  { name: 'Marketing', plan: [760, 820, 900], actual: [801, 898, 1012], note: 'Paid search costs per click rose 22% after a competitor launch in September.' },
  { name: 'Customer success', plan: [540, 560, 580], actual: [529, 566, 571], note: 'On plan: onboarding specialists were hired on the forecast dates.' },
  { name: 'Data platform', plan: [410, 430, 450], actual: [436, 472, 518], note: 'Warehouse scans grew with the new usage-based billing reports.' },
  { name: 'G&A', plan: [380, 380, 390], actual: [362, 371, 366], note: 'External audit fees move to Q4 after the auditor changed its schedule.' },
  { name: 'Facilities', plan: [290, 290, 300], actual: [271, 268, 262], note: 'Two floors of the Lisbon office have been sublet since July.' }
]
// Fixed scale: a bar reaching the end of its half means 20% off plan, in every quarter.
const SCALE_PCT = 20

const q = computed(() => Number(quarter.value ?? 2))
const quarterLabel = computed(() => 'Q' + (q.value + 1))

const all = computed<Row[]>(() => departments.map((d) => {
  const plan = d.plan[q.value]!
  const actual = d.actual[q.value]!
  const pct = ((actual - plan) / plan) * 100
  return { name: d.name, note: d.note, plan, actual, variance: actual - plan, pct, over: actual > plan, scale: Math.min(Math.abs(pct) / SCALE_PCT, 1) }
}))
const rows = computed(() => [...all.value].sort((a, b) => (sort.value === 'size' ? b.plan - a.plan : b.pct - a.pct)))
const current = computed(() => all.value.find(r => r.name === picked.value) ?? all.value[0]!)

const totalPlan = computed(() => all.value.reduce((n, r) => n + r.plan, 0))
const totalActual = computed(() => all.value.reduce((n, r) => n + r.actual, 0))
const net = computed(() => totalActual.value - totalPlan.value)

const money = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(2)}M` : `$${k}k`)
const signedMoney = (k: number) => (k > 0 ? '+' : k < 0 ? '−' : '') + money(Math.abs(k))
const signedPct = (p: number) => (p > 0 ? '+' : p < 0 ? '−' : '') + Math.abs(p).toFixed(1) + '%'
</script>

