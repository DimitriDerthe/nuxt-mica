<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="knb-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div class="mi:grid mi:gap-0.5">
        <MiText id="knb-title" variant="title3" as="h2" weight="semibold">Monthly business review</MiText>
        <MiText variant="footnote" tone="label2">Tessellate Cloud · closed books, all regions</MiText>
      </div>
      <MiSegmented v-model="period" label="Period" :options="periods" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:[grid-template-areas:'story'_'revenue'_'region'_'plans'_'churn'_'trial'] mi:@[560px]:grid-cols-[repeat(2,_minmax(0,_1fr))] mi:@[560px]:[grid-template-areas:'story_story'_'revenue_revenue'_'region_plans'_'churn_trial'] mi:@[900px]:grid-cols-[1.15fr_1.15fr_1fr_1fr] mi:@[900px]:[grid-template-areas:'story_story_revenue_revenue'_'story_story_region_region'_'churn_trial_plans_plans']">
      <!-- The story: every figure is a citation to the tile it came from. -->
      <article class="mi:[grid-area:story] mi:grid mi:gap-4 mi:relative mi:content-start mi:min-w-0 mi:pt-5.5 mi:px-5.5 mi:pb-5 mi:rounded-xl mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--mi-p)_7%,_var(--mi-card)),_var(--mi-card)_55%)] mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:after:content-[''] mi:after:hidden mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-[0_0_0_2px_var(--mi-p),_0_10px_30px_-12px_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:after:opacity-0 mi:after:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none] mi:motion-reduce:after:[transition:none]" aria-labelledby="knb-story-title">
        <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3">
          <MiText id="knb-story-title" variant="footnote" weight="semibold" tone="label2" as="h3">{{ d.label }} in one paragraph</MiText>
          <span class="mi:text-[11px] mi:text-label3 mi:tabular-nums">Written from 5 tiles · {{ d.stamp }}</span>
        </div>
        <p class="mi:m-0 mi:text-[clamp(17px,_2.1cqi,_21px)] mi:leading-[1.62] mi:tracking-[-.012em] mi:text-label mi:text-pretty" aria-live="polite">
          <template v-for="(part, i) in story" :key="i">
            <template v-if="typeof part === 'string'">{{ part }}</template>
            <span v-else class="mi:whitespace-nowrap"><button
              type="button" class="mi:relative mi:inline mi:my-0 mi:-mx-0.5 mi:py-0 mi:px-0.5 mi:[border:0] mi:rounded-[5px] mi:cursor-pointer mi:[font:inherit] mi:font-650 mi:text-p-text mi:tabular-nums mi:[box-decoration-break:clone] mi:[-webkit-box-decoration-break:clone] mi:[background-image:linear-gradient(color-mix(in_srgb,_var(--mi-p)_45%,_transparent),_color-mix(in_srgb,_var(--mi-p)_45%,_transparent))] mi:bg-no-repeat mi:[background-size:100%_1.5px] mi:[background-position:0_100%] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="active === part.key ? 'mi:bg-p-tint' : 'mi:bg-transparent'"
              :aria-pressed="pinned === part.key" :aria-describedby="`knb-name-${part.key}`"
              @pointerenter="hover = part.key" @pointerleave="hover = null"
              @focus="hover = part.key" @blur="hover = null" @click="pin(part.key)"
            >{{ part.text }}<sup class="mi:[vertical-align:.75em] mi:ml-px mi:text-[.52em] mi:font-bold mi:leading-[0]" :class="active === part.key ? 'mi:text-p-text' : 'mi:text-label3'">{{ cite[part.key] }}</sup></button>{{ part.tail }}</span>
          </template>
        </p>
        <MiText variant="caption" tone="label3" class="mi:mt-auto!">Point at a figure to find its source. Tap to keep it lit.</MiText>
      </article>

      <article
        v-for="t in tiles" :key="t" class="mi:grid mi:gap-3 mi:relative mi:content-start mi:min-w-0 mi:pt-4 mi:px-4.5 mi:pb-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:pointer-events-none mi:after:shadow-[0_0_0_2px_var(--mi-p),_0_10px_30px_-12px_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:after:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:motion-reduce:[transition:none] mi:motion-reduce:after:[transition:none]" :class="[t === 'revenue' ? 'mi:[grid-area:revenue]' : t === 'region' ? 'mi:[grid-area:region]' : t === 'plans' ? 'mi:[grid-area:plans]' : t === 'churn' ? 'mi:[grid-area:churn]' : 'mi:[grid-area:trial]', active === t ? 'mi:after:opacity-100' : 'mi:after:opacity-0', hover !== null && hover !== t ? 'mi:opacity-50' : '']"
        :aria-labelledby="`knb-name-${t}`" @pointerenter="hover = t" @pointerleave="hover = null"
      >
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText :id="`knb-name-${t}`" variant="footnote" weight="semibold" tone="label2" as="h3">{{ names[t] }}</MiText>
          <span class="mi:inline-grid mi:place-items-center mi:min-w-5 mi:h-5 mi:py-0 mi:px-[5px] mi:rounded-[999px] mi:text-[11px] mi:font-bold mi:tabular-nums" :class="active === t ? 'mi:text-p-on mi:bg-p' : 'mi:text-label2 mi:bg-fill2'" aria-hidden="true">{{ cite[t] }}</span>
        </div>

        <template v-if="t === 'revenue'">
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <p class="mi:m-0 mi:text-[clamp(30px,_4.4cqi,_40px)] mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ money(d.revenue) }}</p>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="d.revenueDelta >= 0 ? 'mi:text-green-t' : 'mi:text-orange-t'">{{ signed(d.revenueDelta) }}% vs {{ d.prevShort }}</span>
          </div>
          <div class="mi:grid mi:gap-1.5" role="img" :aria-label="`Net revenue by month, ${d.months[0]} to ${d.months[d.months.length - 1]}: ${d.trend.map(v => '$' + v + 'k').join(', ')}`">
            <svg class="mi:block mi:w-full mi:h-16 mi:overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
              <path :d="revArea" class="mi:fill-p/14" />
              <path :d="revLine" class="mi:fill-[color:none] mi:stroke-p mi:[stroke-width:2] mi:[stroke-linejoin:round] mi:[vector-effect:non-scaling-stroke]" />
            </svg>
            <div class="mi:flex mi:justify-between mi:text-[11px] mi:text-label3" aria-hidden="true"><span v-for="m in d.months" :key="m">{{ m }}</span></div>
          </div>
        </template>

        <template v-else-if="t === 'region'">
          <ul class="mi:grid mi:gap-3 mi:mt-0.5 mi:mr-0 mi:mb-0 mi:ml-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:grid-cols-[minmax(0,_1fr)_auto_52px] mi:grid mi:gap-y-1.5 mi:gap-x-2.5 mi:items-baseline" v-for="r in d.regions" :key="r.name">
              <span class="mi:text-[13px] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis" :class="r.name === topRegion.name ? 'mi:text-label mi:font-semibold' : 'mi:text-label2'">{{ r.name }}</span>
              <span class="mi:text-[13px] mi:font-semibold mi:tabular-nums">{{ money(r.value) }}</span>
              <span class="mi:text-[12px] mi:font-semibold mi:text-right mi:tabular-nums" :class="r.name === topRegion.name ? 'mi:text-green-t' : 'mi:text-label2'">{{ signed(r.growth) }}%</span>
              <span class="mi:col-span-full mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true"><span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="r.name === topRegion.name ? 'mi:bg-p' : 'mi:bg-label3'" :style="{ transform: `scaleX(${r.value / maxRegion})` }" /></span>
            </li>
          </ul>
        </template>

        <template v-else-if="t === 'plans'">
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <p class="mi:m-0 mi:text-[30px] mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ d.annualShare }}%</p>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="d.annualShare >= d.annualPrev ? 'mi:text-green-t' : 'mi:text-orange-t'">annual, was {{ d.annualPrev }}%</span>
          </div>
          <MiStackedBar
            :segments="planSegments" :legend="false" :height="14"
            :aria-label="`New bookings: annual ${d.annualShare}%, monthly ${100 - d.annualShare}%`"
          />
          <div class="mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-4 mi:text-[12px] mi:text-label2 mi:tabular-nums">
            <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:[background:var(--mi-p)] mi:w-2 mi:h-2 mi:rounded-[2px]" />Annual · {{ money(d.bookings * d.annualShare / 100) }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:[background:color-mix(in_srgb,_var(--mi-p)_28%,_var(--mi-card))] mi:w-2 mi:h-2 mi:rounded-[2px]" />Monthly · {{ money(d.bookings * (100 - d.annualShare) / 100) }}</span>
          </div>
        </template>

        <template v-else-if="t === 'churn'">
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <p class="mi:m-0 mi:text-[30px] mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ d.churn.toFixed(1) }}%</p>
          </div>
          <ol class="mi:grid mi:grid-flow-col mi:auto-cols-[minmax(0,_1fr)] mi:items-end mi:gap-1 mi:h-10 mi:m-0 mi:p-0 mi:[list-style:none]" :aria-label="`Monthly logo churn: ${d.churnSeries.map((v, i) => d.churnMonths[i] + ' ' + v + '%').join(', ')}`">
            <li class="mi:h-full mi:flex mi:[align-items:flex-end]" v-for="(v, i) in d.churnSeries" :key="i">
              <span class="mi:block mi:w-full mi:h-full mi:rounded-[3px_3px_1px_1px] mi:origin-bottom mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="i === d.churnSeries.length - 1 ? 'mi:bg-p' : 'mi:[background:color-mix(in_srgb,_var(--mi-label)_14%,_var(--mi-card))]'" :style="{ transform: `scaleY(${colScale(v)})` }" />
            </li>
          </ol>
          <MiText variant="caption" tone="label2">{{ d.churnNote }}</MiText>
        </template>

        <template v-else>
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <p class="mi:m-0 mi:text-[30px] mi:leading-none mi:font-bold mi:tracking-[-.035em] mi:tabular-nums">{{ d.trial.toFixed(1) }}%</p>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="d.trial >= d.trialPrev ? 'mi:text-green-t' : 'mi:text-orange-t'">{{ signed(d.trial - d.trialPrev) }} pt</span>
          </div>
          <MiSparkline
            :values="d.trialSeries" :width="150" :height="40" stroke="var(--mi-label2)"
            :color="d.trial >= d.trialPrev ? 'var(--mi-p)' : 'var(--mi-orange)'" :label="`Trial to paid over 8 weeks, ending at ${d.trial}%`"
          />
        </template>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Key = 'revenue' | 'plans' | 'region' | 'churn' | 'trial'
interface Ref { key: Key, text: string, tail?: string }
interface Period {
  label: string, prevLabel: string, prevShort: string, stamp: string, revenue: number, revenueDelta: number, months: string[], trend: number[],
  bookings: number, annualShare: number, annualPrev: number, regions: { name: string, value: number, growth: number }[],
  churn: number, churnSeries: number[], churnMonths: string[], churnNote: string, trial: number, trialPrev: number, trialSeries: number[], trialCause: string
}

const periods = [{ value: 'oct', label: 'October' }, { value: 'q3', label: 'Q3' }]
const period = ref<string | number | null>('oct')

const tiles: Key[] = ['revenue', 'region', 'churn', 'trial', 'plans']
const names: Record<Key, string> = { revenue: 'Net revenue', plans: 'New bookings by plan', region: 'Revenue by region', churn: 'Logo churn', trial: 'Trial to paid' }
const cite: Record<Key, number> = { revenue: 1, plans: 2, region: 3, churn: 4, trial: 5 }

// Sample data per period; the paragraph below is written from these numbers, not stored.
const data: Record<string, Period> = {
  oct: {
    label: 'October', prevLabel: 'September', prevShort: 'Sep', stamp: 'Nov 1, 09:12', revenue: 412300, revenueDelta: 12.4,
    months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], trend: [318, 331, 342, 351, 367, 412],
    bookings: 158000, annualShare: 61, annualPrev: 48,
    regions: [{ name: 'North America', value: 196400, growth: 4.2 }, { name: 'EMEA', value: 158200, growth: 31.0 }, { name: 'APAC', value: 57700, growth: 6.0 }],
    churn: 1.8, churnSeries: [1.7, 2.4, 2.3, 2.5, 2.2, 2.1, 2.0, 1.8], churnMonths: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'], churnNote: 'Lowest since March',
    trial: 14.2, trialPrev: 16.0, trialSeries: [16.4, 16.1, 15.9, 16.2, 15.1, 14.6, 14.4, 14.2], trialCause: 'after the onboarding change on Oct 9'
  },
  q3: {
    label: 'Q3', prevLabel: 'Q2', prevShort: 'Q2', stamp: 'Oct 3, 08:40', revenue: 1060000, revenueDelta: 8.2,
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'], trend: [309, 318, 331, 342, 351, 367],
    bookings: 431000, annualShare: 49, annualPrev: 44,
    regions: [{ name: 'North America', value: 551000, growth: 9.1 }, { name: 'EMEA', value: 352000, growth: 7.4 }, { name: 'APAC', value: 157000, growth: 6.2 }],
    churn: 2.1, churnSeries: [2.6, 2.5, 2.4, 2.4, 2.3, 2.2, 2.2, 2.1], churnMonths: ['Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'], churnNote: 'Seventh quarter in a row of decline',
    trial: 16.0, trialPrev: 15.1, trialSeries: [14.2, 14.6, 14.9, 15.1, 15.3, 15.6, 15.8, 16.0], trialCause: ''
  }
}

const d = computed(() => data[String(period.value ?? 'oct')]!)

const money = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${(n / 1000).toFixed(1)}k`
const signed = (n: number) => `${n >= 0 ? '+' : '−'}${Math.abs(n).toFixed(1)}`

const topRegion = computed(() => [...d.value.regions].sort((a, b) => b.growth - a.growth)[0]!)
const maxRegion = computed(() => Math.max(...d.value.regions.map(r => r.value)))

// Writes the paragraph from the numbers: wording flips with the direction of each change.
const story = computed<(string | Ref)[]>(() => {
  const p = d.value
  const r = topRegion.value
  const up = p.revenueDelta >= 0
  const out: (string | Ref)[] = [
    `Net revenue reached `, { key: 'revenue', text: money(p.revenue) }, ` in ${p.label}, ${up ? 'up' : 'down'} `,
    { key: 'revenue', text: `${Math.abs(p.revenueDelta).toFixed(1)}%` }, ` on ${p.prevLabel}. Most of the ${up ? 'gain' : 'drop'} came from `,
    { key: 'plans', text: 'annual plans' }, `, now `, { key: 'plans', text: `${p.annualShare}%` }, ` of new bookings, and from `,
    { key: 'region', text: r.name }, `, which grew `, { key: 'region', text: `${r.growth.toFixed(0)}%` }, `. Logo churn ${p.churn <= (p.churnSeries[p.churnSeries.length - 2] ?? p.churn) ? 'eased' : 'rose'} to `,
    { key: 'churn', text: `${p.churn.toFixed(1)}%` }, `, ${p.churnNote.charAt(0).toLowerCase() + p.churnNote.slice(1)}. `
  ]
  if (p.trial < p.trialPrev) out.push(`One thing to watch: trial-to-paid slipped to `, { key: 'trial', text: `${p.trial.toFixed(1)}%` }, ` ${p.trialCause}.`)
  else out.push(`Trial-to-paid also improved, to `, { key: 'trial', text: `${p.trial.toFixed(1)}%` }, `.`)
  // Keep punctuation glued to the figure before it, so a line never starts with a comma.
  return out.map((part, i) => {
    const prev = out[i - 1]
    if (typeof part !== 'string' || typeof prev === 'string' || !prev) return part
    const m = part.match(/^[,.;:]+/)
    if (!m) return part
    prev.tail = m[0]
    return part.slice(m[0].length)
  })
})

const hover = ref<Key | null>(null)
const pinned = ref<Key | null>('region')
const active = computed(() => hover.value ?? pinned.value)
const pin = (k: Key) => { pinned.value = pinned.value === k ? null : k }

// Columns read from a floor just under the lowest month, so small moves stay visible.
const colScale = (v: number) => {
  const s = d.value.churnSeries
  const lo = Math.min(...s) * 0.7
  return Math.max(0.12, (v - lo) / (Math.max(...s) - lo))
}

const planSegments = computed(() => [
  { label: 'Annual', value: d.value.annualShare, color: 'var(--mi-p)' },
  { label: 'Monthly', value: 100 - d.value.annualShare, color: 'color-mix(in srgb, var(--mi-p) 28%, var(--mi-card))' }
])

const revPts = computed(() => {
  const t = d.value.trend
  const lo = Math.min(...t) * 0.92
  const hi = Math.max(...t) * 1.04
  return t.map((v, i) => `${((i / (t.length - 1)) * 100).toFixed(2)} ${(40 - ((v - lo) / (hi - lo)) * 40).toFixed(2)}`)
})
const revLine = computed(() => 'M' + revPts.value.join(' L'))
const revArea = computed(() => `${revLine.value} L100 40 L0 40 Z`)
</script>
