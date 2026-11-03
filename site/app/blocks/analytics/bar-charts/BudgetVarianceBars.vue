<template>
  <section class="bv" aria-labelledby="bv-title">
    <header class="bv__head">
      <div>
        <MiText id="bv-title" variant="title3" as="h2" weight="semibold">Spend against plan</MiText>
        <MiText variant="footnote" tone="label2">Operating budget by department · {{ quarterLabel }} FY25, USD</MiText>
      </div>
      <div class="bv__controls">
        <MiSegmented v-model="quarter" label="Quarter" :options="quarters" />
        <MiSegmented v-model="sort" label="Sort departments by" :options="sorts" />
      </div>
    </header>

    <div class="bv__body">
      <div class="bv__chart">
        <div class="bv__axis" aria-hidden="true">
          <span>Under plan</span>
          <span>Over plan</span>
        </div>
        <!-- Diverging bars: each half of the track grows away from the plan line with scaleX. -->
        <TransitionGroup tag="ul" name="bv-move" class="bv__rows" aria-label="Variance by department">
          <li v-for="r in rows" :key="r.name">
            <button
              type="button" class="bv__row" :class="{ 'is-on': picked === r.name }" :aria-pressed="picked === r.name"
              :aria-label="`${r.name}, ${signedMoney(r.variance)}, ${signedPct(r.pct)} against plan`" @click="picked = r.name"
            >
              <span class="bv__name">{{ r.name }}</span>
              <span class="bv__track" aria-hidden="true">
                <span class="bv__bar" :class="r.over ? 'is-over' : 'is-under'" :style="{ transform: `scaleX(${r.scale})` }" />
              </span>
              <span class="bv__val" :class="r.over ? 'is-over' : 'is-under'">{{ signedPct(r.pct) }}</span>
            </button>
          </li>
        </TransitionGroup>
      </div>

      <aside class="bv__side" aria-labelledby="bv-side-title">
        <article class="bv__total">
          <MiText variant="caption" tone="label2" weight="medium" as="h3">Company net</MiText>
          <p class="bv__big" :class="net > 0 ? 'is-over' : 'is-under'">{{ signedMoney(net) }}</p>
          <MiText variant="footnote" tone="label2">{{ money(totalActual) }} spent of {{ money(totalPlan) }} planned</MiText>
        </article>

        <article class="bv__detail" aria-live="polite">
          <div class="bv__detail-top">
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

<style scoped>
.bv { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.bv__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.bv__controls { display: flex; flex-wrap: wrap; gap: 8px; }
.bv__body { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 820px) { .bv__body { grid-template-columns: minmax(0, 1fr) 300px; } }

.bv__chart { display: grid; gap: 6px; align-content: start; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bv__axis { display: grid; grid-template-columns: 1fr 1fr; padding: 0 10px; font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.bv__axis span:last-child { text-align: end; }
.bv__rows { display: grid; gap: 2px; margin: 0; padding: 0; list-style: none; }

/* Narrow: name and value share a line, the bar runs full width underneath. */
.bv__row {
  display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "name val" "track track"; align-items: center; gap: 6px 12px;
  width: 100%; padding: 10px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer;
  transition: background-color var(--mi-dur-2) var(--mi-ease);
}
@container (min-width: 560px) { .bv__row { grid-template-columns: 140px minmax(0, 1fr) 64px; grid-template-areas: "name track val"; } }
.bv__row:hover, .bv__row.is-on { background: var(--mi-fill4); }
.bv__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.bv__name { grid-area: name; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.bv__val { grid-area: val; text-align: end; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.bv__val.is-over { color: var(--mi-orange-t); }
.bv__val.is-under { color: var(--mi-p-text); }

.bv__track { grid-area: track; position: relative; height: 12px; border-radius: 6px; background: var(--mi-fill4); }
/* The plan line sits in the middle of the track. */
.bv__track::after { content: ""; position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px; margin-left: -1px; border-radius: 1px; background: var(--mi-label3); }
.bv__bar { position: absolute; top: 0; bottom: 0; width: 50%; transition: transform var(--mi-dur-4) var(--mi-spring); }
.bv__bar.is-over { left: 50%; border-radius: 0 6px 6px 0; background: var(--mi-orange); transform-origin: left; }
.bv__bar.is-under { right: 50%; border-radius: 6px 0 0 6px; background: color-mix(in srgb, var(--mi-p) 70%, var(--mi-card)); transform-origin: right; }

.bv-move-move { transition: transform var(--mi-dur-4) var(--mi-spring); }

.bv__side { display: grid; gap: 12px; align-content: start; }
@container (min-width: 560px) and (max-width: 819px) { .bv__side { grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr); } }
.bv__total, .bv__detail { display: grid; gap: 8px; align-content: start; min-width: 0; padding: 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.bv__big { margin: 0; font-size: clamp(30px, 6cqi, 38px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.bv__big.is-over { color: var(--mi-orange-t); }
.bv__detail-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
</style>
