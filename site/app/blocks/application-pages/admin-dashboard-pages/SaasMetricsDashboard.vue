<template>
  <section class="smd" aria-labelledby="smd-title">
    <div class="smd__in">
      <!-- Shell: a single top bar, no sidebar. The section links scroll inside their own strip on narrow widths. -->
      <header class="smd__bar">
        <div class="smd__brand">
          <span class="smd__mark" aria-hidden="true"><i /><i /><i /></span>
          <MiText as="span" variant="subheadline" weight="bold">Plover</MiText>
        </div>
        <nav class="smd__nav" aria-label="Workspace">
          <a
            v-for="l in links" :key="l" href="#" class="smd__link"
            :aria-current="l === 'Revenue' ? 'page' : undefined" @click.prevent
          >{{ l }}</a>
        </nav>
        <div class="smd__tools">
          <MiIconButton label="Search" variant="plain" size="regular"><MiIcon name="search" :size="18" /></MiIconButton>
          <MiIconButton label="Notifications" variant="plain" size="regular"><MiIcon name="bell" :size="18" /></MiIconButton>
          <MiAvatar name="Noor Haddad" size="sm" tone="auto" />
        </div>
      </header>

      <div class="smd__page">
        <div class="smd__head">
          <div>
            <MiText variant="caption" tone="label2" weight="medium" class="smd__eyebrow">October 2026 · books closed Nov 1</MiText>
            <MiText id="smd-title" as="h2" variant="title2" weight="bold">Revenue</MiText>
          </div>
          <div class="smd__head-actions">
            <MiSegmented v-model="currency" label="Currency" :options="[{ value: 'usd', label: 'USD' }, { value: 'eur', label: 'EUR' }]" />
            <MiButton variant="gray" size="small">
              <template #leading><MiIcon name="share" :size="15" /></template>
              Export
            </MiButton>
          </div>
        </div>

        <!-- Headline figures share one strip with hairline dividers instead of four separate cards. -->
        <dl class="smd__facts">
          <div v-for="f in facts" :key="f.label" class="smd__fact">
            <dt>{{ f.label }}</dt>
            <dd>
              <span class="smd__fact-value">{{ f.value }}</span>
              <span class="smd__fact-delta" :class="f.good ? 'is-good' : 'is-bad'">{{ f.delta }}</span>
            </dd>
          </div>
        </dl>

        <div class="smd__grid">
          <article class="smd__card smd__flow" aria-labelledby="smd-flow">
            <div class="smd__card-head">
              <div>
                <MiText id="smd-flow" as="h3" variant="headline" weight="semibold">MRR movement</MiText>
                <MiText variant="caption" tone="label2">Select a step to see the accounts behind it</MiText>
              </div>
              <MiText variant="caption" tone="label3" tabular>Axis starts at {{ money(DOMAIN[0]) }}</MiText>
            </div>

            <div class="smd__chart">
              <div class="smd__ticks" aria-hidden="true">
                <span v-for="t in ticks" :key="t" :style="{ bottom: pct(t - DOMAIN[0]) }"><em>{{ money(t) }}</em></span>
              </div>
              <div class="smd__cols" role="group" aria-label="MRR movement steps">
                <div v-for="(s, i) in steps" :key="s.id" class="smd__col">
                  <button
                    type="button" class="smd__bar-btn" :class="['is-' + s.kind, { 'is-on': active === s.id }]"
                    :style="{ bottom: pct(s.low - DOMAIN[0]), height: pct(s.high - s.low) }"
                    :aria-pressed="active === s.id" :aria-label="`${s.label}: ${signed(s)}`"
                    @click="active = s.id"
                  >
                    <span class="smd__bar-fill" :style="{ animationDelay: i * 60 + 'ms' }" />
                  </button>
                  <span class="smd__bar-val" :class="['is-' + s.kind, { 'is-on': active === s.id }]" :style="{ bottom: pct(s.high - DOMAIN[0]) }" aria-hidden="true">{{ signed(s) }}</span>
                  <span v-if="i < steps.length - 1" class="smd__join" :style="{ bottom: pct(s.level - DOMAIN[0]) }" aria-hidden="true" />
                </div>
              </div>
              <div class="smd__labels" aria-hidden="true">
                <span v-for="s in steps" :key="s.id" :class="{ 'is-on': active === s.id }">{{ s.short }}</span>
              </div>
            </div>

            <div class="smd__detail" aria-live="polite">
              <div class="smd__detail-head">
                <MiText as="h4" variant="subheadline" weight="semibold">{{ current.label }}</MiText>
                <MiText variant="footnote" tone="label2" tabular>{{ current.note }}</MiText>
              </div>
              <ul class="smd__rows">
                <li v-for="r in current.rows" :key="r.name">
                  <MiAvatar :name="r.name" size="xs" tone="auto" shape="square" decorative />
                  <span class="smd__row-name">{{ r.name }}</span>
                  <span class="smd__row-sub">{{ r.sub }}</span>
                  <span class="smd__row-amt" :class="'is-' + current.kind">{{ r.amount }}</span>
                </li>
              </ul>
            </div>
          </article>

          <article class="smd__card smd__cohort" aria-labelledby="smd-cohort">
            <div class="smd__card-head">
              <div>
                <MiText id="smd-cohort" as="h3" variant="headline" weight="semibold">Retention by signup cohort</MiText>
                <MiText variant="caption" tone="label2">{{ basis === 'revenue' ? 'Net revenue kept, expansion included' : 'Share of customers still paying' }}</MiText>
              </div>
              <MiSegmented v-model="basis" label="Retention basis" :options="[{ value: 'revenue', label: 'Revenue' }, { value: 'logos', label: 'Logos' }]" />
            </div>

            <div class="smd__table-wrap">
              <table class="smd__table">
                <caption class="smd__sr">{{ basis === 'revenue' ? 'Net revenue retention' : 'Logo retention' }} by month since signup</caption>
                <thead>
                  <tr>
                    <th scope="col">Cohort</th>
                    <th v-for="m in 6" :key="m" scope="col">M{{ m - 1 }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in cohortRows" :key="c.month">
                    <th scope="row">
                      <span>{{ c.month }}</span>
                      <small>{{ c.size }}</small>
                    </th>
                    <td v-for="(v, j) in c.cells" :key="j" :class="{ 'is-empty': v === null, 'is-up': v !== null && v > 100 }" :style="v === null ? undefined : { '--smd-shade': shade(v) }">
                      {{ v === null ? '' : v + '%' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="smd__legend">
              <span class="smd__ramp" aria-hidden="true" />
              <MiText variant="caption2" tone="label3" tabular>{{ basis === 'revenue' ? '85%' : '70%' }}</MiText>
              <MiText variant="caption2" tone="label3" tabular>{{ basis === 'revenue' ? '110%+' : '100%' }}</MiText>
              <MiText variant="caption" tone="label2" class="smd__insight">
                {{ basis === 'revenue'
                  ? 'Since July, cohorts pass 100% by month 3: seat add-ons outpace churn.'
                  : 'Logo churn concentrates in month 1, mostly Starter trials that never booked.' }}
              </MiText>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Kind = 'total' | 'gain' | 'loss'
interface Row { name: string, sub: string, amount: string }
interface Step { id: string, label: string, short: string, kind: Kind, delta: number, low: number, high: number, level: number, note: string, rows: Row[] }

const links = ['Overview', 'Revenue', 'Customers', 'Plans', 'Experiments']
const currency = ref<string | number | null>('usd')
const basis = ref<string | number | null>('revenue')

// The rate only re-labels figures; the story is the same in both currencies.
const rate = computed(() => (currency.value === 'eur' ? 0.92 : 1))
const symbol = computed(() => (currency.value === 'eur' ? '€' : '$'))
function money(k: number) {
  const v = k * rate.value
  return `${symbol.value}${v >= 1000 ? (v / 1000).toFixed(2) + 'M' : v.toFixed(v % 1 ? 1 : 0) + 'k'}`
}

// MRR in $ thousands. The chart axis is truncated so the movements read clearly.
const DOMAIN = [340, 440] as const
const ticks = [340, 360, 380, 400, 420, 440]
const pct = (v: number) => `${(v / (DOMAIN[1] - DOMAIN[0])) * 100}%`

const raw: Omit<Step, 'low' | 'high' | 'level'>[] = [
  { id: 'start', label: 'Opening MRR', short: 'Start', kind: 'total', delta: 389.2, note: '1,846 paying workspaces on Oct 1', rows: [
    { name: 'Scale plan', sub: '212 workspaces', amount: '$171.4k' },
    { name: 'Growth plan', sub: '701 workspaces', amount: '$158.6k' },
    { name: 'Starter plan', sub: '933 workspaces', amount: '$59.2k' }
  ] },
  { id: 'new', label: 'New business', short: 'New', kind: 'gain', delta: 28.4, note: '118 new workspaces, $241 average', rows: [
    { name: 'Halden Physio', sub: 'Scale · 42 seats', amount: '+$3.8k' },
    { name: 'Marlowe Dental Group', sub: 'Scale · 30 seats', amount: '+$2.7k' },
    { name: 'Ostra Coworking', sub: 'Growth · 18 seats', amount: '+$1.1k' },
    { name: 'Brightwater Tutors', sub: 'Growth · 12 seats', amount: '+$0.7k' }
  ] },
  { id: 'expansion', label: 'Expansion', short: 'Expand', kind: 'gain', delta: 14.9, note: '63 accounts added seats or upgraded', rows: [
    { name: 'Kinetik Gyms', sub: 'Growth → Scale', amount: '+$2.2k' },
    { name: 'Lumen Eye Clinics', sub: '+24 seats', amount: '+$1.6k' },
    { name: 'Petal & Stem Florists', sub: '+SMS reminders', amount: '+$0.9k' },
    { name: 'Corvo Legal', sub: '+9 seats', amount: '+$0.6k' }
  ] },
  { id: 'contraction', label: 'Contraction', short: 'Contract', kind: 'loss', delta: -6.3, note: '27 accounts removed seats or downgraded', rows: [
    { name: 'Northgate Salons', sub: 'Scale → Growth', amount: '−$1.4k' },
    { name: 'Fieldhouse Climbing', sub: '−11 seats', amount: '−$0.7k' },
    { name: 'Ardent Vets', sub: '−6 seats', amount: '−$0.4k' }
  ] },
  { id: 'churn', label: 'Churn', short: 'Churn', kind: 'loss', delta: -13.3, note: '35 workspaces cancelled, 2 above $1k', rows: [
    { name: 'Tidewell Spa', sub: 'Moved to in-house tool', amount: '−$2.9k' },
    { name: 'Quayside Pilates', sub: 'Closed two studios', amount: '−$1.2k' },
    { name: 'Rowan Music School', sub: 'Price', amount: '−$0.5k' }
  ] },
  { id: 'end', label: 'Closing MRR', short: 'End', kind: 'total', delta: 412.9, note: '1,929 paying workspaces on Oct 31', rows: [
    { name: 'Scale plan', sub: '231 workspaces', amount: '$186.0k' },
    { name: 'Growth plan', sub: '742 workspaces', amount: '$165.1k' },
    { name: 'Starter plan', sub: '956 workspaces', amount: '$61.8k' }
  ] }
]

// Each movement floats from the running level left by the previous step.
const steps = computed<Step[]>(() => {
  let level = 0
  return raw.map((s) => {
    if (s.kind === 'total') {
      level = s.delta
      return { ...s, low: DOMAIN[0], high: s.delta, level }
    }
    const from = level
    level = Math.round((level + s.delta) * 10) / 10
    return { ...s, low: Math.min(from, level), high: Math.max(from, level), level }
  })
})
const active = ref('expansion')
const current = computed(() => steps.value.find(s => s.id === active.value)!)
const signed = (s: Step) => (s.kind === 'total' ? money(s.delta) : (s.delta > 0 ? '+' : '−') + money(Math.abs(s.delta)))

const facts = computed(() => [
  { label: 'MRR', value: money(412.9), delta: '+6.1%', good: true },
  { label: 'ARR run rate', value: money(4954.8), delta: '+6.1%', good: true },
  { label: 'Net revenue retention', value: '108.4%', delta: '+1.2 pt', good: true },
  { label: 'Logo churn', value: '1.9%', delta: '+0.2 pt', good: false }
])

// Months since signup; null marks months that have not happened yet.
const cohorts = {
  revenue: [
    [100, 96, 98, 101, 104, 107],
    [100, 94, 97, 99, 102, null],
    [100, 97, 100, 103, null, null],
    [100, 95, 101, null, null, null],
    [100, 98, null, null, null, null],
    [100, null, null, null, null, null]
  ],
  logos: [
    [100, 91, 87, 85, 84, 83],
    [100, 89, 86, 84, 83, null],
    [100, 92, 89, 88, null, null],
    [100, 90, 88, null, null, null],
    [100, 93, null, null, null, null],
    [100, null, null, null, null, null]
  ]
}
const months = [{ month: 'May', size: 142 }, { month: 'Jun', size: 128 }, { month: 'Jul', size: 151 }, { month: 'Aug', size: 137 }, { month: 'Sep', size: 124 }, { month: 'Oct', size: 118 }]
const cohortRows = computed(() => months.map((m, i) => ({ ...m, cells: cohorts[basis.value === 'logos' ? 'logos' : 'revenue'][i]! })))

// Brand-tinted shading; capped so the label stays readable on the darkest cell in both themes.
function shade(v: number) {
  const [lo, hi] = basis.value === 'logos' ? [70, 100] : [85, 110]
  const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)))
  return `${Math.round(6 + t * 52)}%`
}
</script>

<style scoped>
.smd { container-type: inline-size; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.smd__in { display: grid; align-content: start; min-height: 100%; }
.smd__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Top bar */
.smd__bar { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "brand . tools" "nav nav nav"; align-items: center; gap: 4px 12px; padding: 10px 16px 0; background: var(--mi-card); border-bottom: 1px solid var(--mi-sep); }
.smd__brand { grid-area: brand; display: flex; align-items: center; gap: 9px; }
.smd__mark { display: flex; align-items: flex-end; gap: 2px; width: 26px; height: 26px; padding: 6px 5px; border-radius: 8px; background: var(--mi-p); }
.smd__mark i { flex: 1; border-radius: 1.5px; background: var(--mi-p-on); }
.smd__mark i:nth-child(1) { height: 45%; opacity: .6; }
.smd__mark i:nth-child(2) { height: 75%; opacity: .8; }
.smd__mark i:nth-child(3) { height: 100%; }
.smd__tools { grid-area: tools; display: flex; align-items: center; gap: 2px; }
.smd__tools > :last-child { margin-left: 8px; }
.smd__nav { grid-area: nav; display: flex; gap: 22px; overflow-x: auto; scrollbar-width: none; margin-inline: -16px; padding-inline: 16px; }
.smd__link { position: relative; padding: 12px 0 13px; font-size: 14px; font-weight: 500; color: var(--mi-label2); text-decoration: none; white-space: nowrap; border-radius: 4px; }
.smd__link::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; border-radius: 2px; background: var(--mi-p); transform: scaleX(0); transition: transform var(--mi-dur-2) var(--mi-ease); }
.smd__link:hover { color: var(--mi-label); }
.smd__link[aria-current="page"] { color: var(--mi-label); font-weight: 600; }
.smd__link[aria-current="page"]::after { transform: scaleX(1); }
.smd__link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

.smd__page { display: grid; gap: 18px; padding: 20px 12px 24px; min-width: 0; }
.smd__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.smd__eyebrow { margin-bottom: 2px; }
.smd__head-actions { display: flex; align-items: center; gap: 10px; }

/* Facts strip */
.smd__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin: 0; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.smd__fact { display: grid; gap: 6px; padding: 14px 16px; }
.smd__fact:nth-child(even) { border-left: 1px solid var(--mi-sep); }
.smd__fact:nth-child(n+3) { border-top: 1px solid var(--mi-sep); }
.smd__fact dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.smd__fact dd { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 8px; margin: 0; }
.smd__fact-value { font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.smd__fact-delta { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.smd__fact-delta.is-good { color: var(--mi-green-t); }
.smd__fact-delta.is-bad { color: var(--mi-red-t); }

.smd__grid { display: grid; gap: 16px; min-width: 0; }
.smd__card { display: grid; align-content: start; gap: 16px; min-width: 0; padding: 16px 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.smd__card-head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 10px; }

/* Waterfall */
.smd__chart { position: relative; display: grid; grid-template-columns: 36px minmax(0, 1fr); grid-template-rows: 220px auto; }
.smd__ticks { position: relative; grid-row: 1; grid-column: 1 / -1; pointer-events: none; }
.smd__ticks span { position: absolute; left: 36px; right: 0; height: 0; border-top: 1px dashed var(--mi-sep); }
.smd__ticks span:first-child { border-top-style: solid; }
.smd__ticks em { position: absolute; left: -36px; width: 30px; text-align: end; top: -6px; font-size: 10.5px; font-style: normal; line-height: 1; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.smd__cols { grid-row: 1; grid-column: 2; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
.smd__col { position: relative; }
.smd__bar-btn { position: absolute; left: 20%; right: 20%; padding: 0; border: 0; border-radius: 5px; background: transparent; cursor: pointer; }
.smd__bar-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 3px; }
.smd__bar-fill { display: block; width: 100%; height: 100%; border-radius: inherit; transform-origin: bottom; animation: smd-rise var(--mi-dur-4) var(--mi-spring) both; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.smd__bar-btn.is-total .smd__bar-fill { background: linear-gradient(180deg, var(--mi-p), color-mix(in srgb, var(--mi-p) 72%, var(--mi-card))); }
.smd__bar-btn.is-gain .smd__bar-fill { background: color-mix(in srgb, var(--mi-green) 78%, var(--mi-card)); }
.smd__bar-btn.is-loss .smd__bar-fill { background: color-mix(in srgb, var(--mi-red) 72%, var(--mi-card)); }
.smd__cols:has(.is-on) .smd__bar-btn:not(.is-on) .smd__bar-fill { opacity: .55; }
.smd__bar-btn:hover .smd__bar-fill { opacity: 1 !important; }
.smd__bar-val { position: absolute; left: 50%; margin-bottom: 6px; font-size: 10.5px; font-weight: 600; white-space: nowrap; color: var(--mi-label2); font-variant-numeric: tabular-nums; transform: translateX(-50%); pointer-events: none; }
.smd__bar-val.is-gain { color: var(--mi-green-t); }
.smd__bar-val.is-loss { color: var(--mi-red-t); }
.smd__join { position: absolute; left: 80%; right: -20%; height: 0; border-top: 1px dashed var(--mi-label3); opacity: .6; }
.smd__labels { grid-row: 2; grid-column: 2; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); padding-top: 8px; }
.smd__labels span { font-size: 10px; font-weight: 500; text-align: center; color: var(--mi-label2); white-space: nowrap; }
.smd__labels span.is-on { color: var(--mi-label); font-weight: 650; }
.smd__bar-val.is-gain:not(.is-on), .smd__bar-val.is-loss:not(.is-on) { opacity: 0; }
@keyframes smd-rise { from { transform: scaleY(0); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .smd__bar-fill { animation: none; } }

.smd__detail { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.smd__detail-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 2px 12px; }
.smd__rows { display: grid; margin: 0; padding: 0; list-style: none; }
.smd__rows li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "av name amt" "av sub amt"; align-items: center; column-gap: 10px; padding: 8px 0; }
.smd__rows li + li { border-top: 1px solid var(--mi-sep); }
.smd__rows li > :first-child { grid-area: av; }
.smd__row-name { grid-area: name; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13.5px; font-weight: 550; }
.smd__row-sub { grid-area: sub; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: var(--mi-label2); }
.smd__row-amt { grid-area: amt; font-size: 13.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.smd__row-amt.is-gain { color: var(--mi-green-t); }
.smd__row-amt.is-loss { color: var(--mi-red-t); }

/* Cohort heatmap */
.smd__table-wrap { overflow-x: auto; margin-inline: -4px; padding-inline: 4px; }
.smd__table { width: 100%; border-collapse: separate; border-spacing: 2px; font-variant-numeric: tabular-nums; }
.smd__table thead th { padding: 0 0 4px; font-size: 11px; font-weight: 600; color: var(--mi-label3); text-align: center; }
.smd__table thead th:first-child { text-align: start; }
.smd__table tbody th { padding: 0 6px 0 0; text-align: start; white-space: nowrap; }
.smd__table tbody th span { display: block; font-size: 13px; font-weight: 600; }
.smd__table tbody th small { display: block; font-size: 11px; font-weight: 400; color: var(--mi-label3); }
.smd__table td { height: 36px; padding: 0; border-radius: 6px; font-size: 11px; font-weight: 550; text-align: center; color: var(--mi-label); background: color-mix(in srgb, var(--mi-p) var(--smd-shade, 0%), transparent); transition: opacity var(--mi-dur-2) var(--mi-ease); }
.smd__table td.is-up { font-weight: 700; }
.smd__table td.is-empty { background: repeating-linear-gradient(135deg, var(--mi-fill4) 0 4px, transparent 4px 8px); }

.smd__legend { display: grid; grid-template-columns: auto auto 1fr; grid-template-areas: "lo ramp hi" "ins ins ins"; align-items: center; gap: 10px 8px; }
.smd__legend > :nth-child(2) { grid-area: lo; }
.smd__ramp { grid-area: ramp; width: 96px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, color-mix(in srgb, var(--mi-p) 6%, transparent), color-mix(in srgb, var(--mi-p) 58%, transparent)); }
.smd__legend > :nth-child(3) { grid-area: hi; }
.smd__insight { grid-area: ins; padding-top: 10px; border-top: 1px solid var(--mi-sep); }

@container (min-width: 560px) {
  .smd__bar { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "brand nav tools"; padding: 0 20px; }
  .smd__nav { margin: 0; padding: 0 0 0 20px; }
  .smd__link { padding: 18px 0 19px; }
  .smd__page { padding: 24px 20px 28px; }
  .smd__rows { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; }
  .smd__rows li:nth-child(2) { border-top: 0; }
  .smd__card { padding: 18px; }
  .smd__chart { grid-template-columns: 42px minmax(0, 1fr); }
  .smd__ticks span { left: 42px; }
  .smd__ticks em { left: -42px; width: 34px; }
  .smd__bar-val { font-size: 11px; }
  .smd__bar-val.is-gain:not(.is-on), .smd__bar-val.is-loss:not(.is-on) { opacity: 1; }
  .smd__labels span { font-size: 11px; }
  .smd__table { border-spacing: 3px; }
  .smd__table td { padding: 0 4px; font-size: 12px; height: 38px; }
}
@container (min-width: 760px) {
  .smd__facts { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .smd__fact { padding: 16px 20px; }
  .smd__fact + .smd__fact { border-left: 1px solid var(--mi-sep); }
  .smd__fact:nth-child(n+3) { border-top: 0; }
  .smd__fact-value { font-size: 26px; }
}
@container (min-width: 1040px) {
  .smd__page { padding: 28px 32px 32px; gap: 20px; }
  .smd__grid { grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); align-items: stretch; }
  .smd__card { padding: 20px 22px; }
  .smd__cohort .smd__insight { margin-top: auto; }
}
</style>
