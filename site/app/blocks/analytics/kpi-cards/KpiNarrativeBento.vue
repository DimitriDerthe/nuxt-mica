<template>
  <section class="knb" aria-labelledby="knb-title">
    <header class="knb__head">
      <div class="knb__intro">
        <MiText id="knb-title" variant="title3" as="h2" weight="semibold">Monthly business review</MiText>
        <MiText variant="footnote" tone="label2">Tessellate Cloud · closed books, all regions</MiText>
      </div>
      <MiSegmented v-model="period" label="Period" :options="periods" />
    </header>

    <div class="knb__bento">
      <!-- The story: every figure is a citation to the tile it came from. -->
      <article class="knb__tile knb__story" aria-labelledby="knb-story-title">
        <div class="knb__story-top">
          <MiText id="knb-story-title" variant="footnote" weight="semibold" tone="label2" as="h3">{{ d.label }} in one paragraph</MiText>
          <span class="knb__stamp">Written from 5 tiles · {{ d.stamp }}</span>
        </div>
        <p class="knb__prose" aria-live="polite">
          <template v-for="(part, i) in story" :key="i">
            <template v-if="typeof part === 'string'">{{ part }}</template>
            <span v-else class="knb__nb"><button
              type="button" class="knb__ref" :class="{ 'is-lit': active === part.key }"
              :aria-pressed="pinned === part.key" :aria-describedby="`knb-name-${part.key}`"
              @pointerenter="hover = part.key" @pointerleave="hover = null"
              @focus="hover = part.key" @blur="hover = null" @click="pin(part.key)"
            >{{ part.text }}<sup>{{ cite[part.key] }}</sup></button>{{ part.tail }}</span>
          </template>
        </p>
        <MiText variant="caption" tone="label3" class="knb__hint">Point at a figure to find its source. Tap to keep it lit.</MiText>
      </article>

      <article
        v-for="t in tiles" :key="t" class="knb__tile" :class="[`knb__${t}`, { 'is-lit': active === t, 'is-dim': hover !== null && hover !== t }]"
        :aria-labelledby="`knb-name-${t}`" @pointerenter="hover = t" @pointerleave="hover = null"
      >
        <div class="knb__tile-top">
          <MiText :id="`knb-name-${t}`" variant="footnote" weight="semibold" tone="label2" as="h3">{{ names[t] }}</MiText>
          <span class="knb__cite" aria-hidden="true">{{ cite[t] }}</span>
        </div>

        <template v-if="t === 'revenue'">
          <div class="knb__figure">
            <p class="knb__big">{{ money(d.revenue) }}</p>
            <span class="knb__delta" :class="d.revenueDelta >= 0 ? 'is-up' : 'is-down'">{{ signed(d.revenueDelta) }}% vs {{ d.prevShort }}</span>
          </div>
          <div class="knb__rev" role="img" :aria-label="`Net revenue by month, ${d.months[0]} to ${d.months[d.months.length - 1]}: ${d.trend.map(v => '$' + v + 'k').join(', ')}`">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
              <path :d="revArea" class="knb__rev-area" />
              <path :d="revLine" class="knb__rev-line" />
            </svg>
            <div class="knb__months" aria-hidden="true"><span v-for="m in d.months" :key="m">{{ m }}</span></div>
          </div>
        </template>

        <template v-else-if="t === 'region'">
          <ul class="knb__regions">
            <li v-for="r in d.regions" :key="r.name" :class="{ 'is-top': r.name === topRegion.name }">
              <span class="knb__r-name">{{ r.name }}</span>
              <span class="knb__r-val">{{ money(r.value) }}</span>
              <span class="knb__r-delta">{{ signed(r.growth) }}%</span>
              <span class="knb__r-track" aria-hidden="true"><span :style="{ transform: `scaleX(${r.value / maxRegion})` }" /></span>
            </li>
          </ul>
        </template>

        <template v-else-if="t === 'plans'">
          <div class="knb__figure">
            <p class="knb__big">{{ d.annualShare }}%</p>
            <span class="knb__delta" :class="d.annualShare >= d.annualPrev ? 'is-up' : 'is-down'">annual, was {{ d.annualPrev }}%</span>
          </div>
          <MiStackedBar
            :segments="planSegments" :legend="false" :height="14"
            :aria-label="`New bookings: annual ${d.annualShare}%, monthly ${100 - d.annualShare}%`"
          />
          <div class="knb__plan-key">
            <span><i class="is-annual" />Annual · {{ money(d.bookings * d.annualShare / 100) }}</span>
            <span><i class="is-monthly" />Monthly · {{ money(d.bookings * (100 - d.annualShare) / 100) }}</span>
          </div>
        </template>

        <template v-else-if="t === 'churn'">
          <div class="knb__figure">
            <p class="knb__big">{{ d.churn.toFixed(1) }}%</p>
          </div>
          <ol class="knb__cols" :aria-label="`Monthly logo churn: ${d.churnSeries.map((v, i) => d.churnMonths[i] + ' ' + v + '%').join(', ')}`">
            <li v-for="(v, i) in d.churnSeries" :key="i" :class="{ 'is-now': i === d.churnSeries.length - 1 }">
              <span :style="{ transform: `scaleY(${colScale(v)})` }" />
            </li>
          </ol>
          <MiText variant="caption" tone="label2">{{ d.churnNote }}</MiText>
        </template>

        <template v-else>
          <div class="knb__figure">
            <p class="knb__big">{{ d.trial.toFixed(1) }}%</p>
            <span class="knb__delta" :class="d.trial >= d.trialPrev ? 'is-up' : 'is-down'">{{ signed(d.trial - d.trialPrev) }} pt</span>
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

<style scoped>
.knb { container-type: inline-size; display: grid; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.knb__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.knb__intro { display: grid; gap: 2px; }

.knb__bento {
  display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "story" "revenue" "region" "plans" "churn" "trial";
}
@container (min-width: 560px) {
  .knb__bento { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-areas: "story story" "revenue revenue" "region plans" "churn trial"; }
}
@container (min-width: 900px) {
  .knb__bento {
    grid-template-columns: 1.15fr 1.15fr 1fr 1fr;
    grid-template-areas: "story story revenue revenue" "story story region region" "churn trial plans plans";
  }
}
.knb__story { grid-area: story; }
.knb__revenue { grid-area: revenue; }
.knb__region { grid-area: region; }
.knb__plans { grid-area: plans; }
.knb__churn { grid-area: churn; }
.knb__trial { grid-area: trial; }

.knb__tile {
  position: relative; display: grid; gap: 12px; align-content: start; min-width: 0; padding: 16px 18px 18px;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
  transition: opacity var(--mi-dur-3) var(--mi-ease);
}
/* Link ring: pre-drawn and faded in, so highlighting never repaints layout. */
.knb__tile::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: 0 0 0 2px var(--mi-p), 0 10px 30px -12px color-mix(in srgb, var(--mi-p) 45%, transparent);
  opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease);
}
.knb__tile.is-lit::after { opacity: 1; }
.knb__tile.is-dim { opacity: .5; }

.knb__story { gap: 16px; padding: 22px 22px 20px; background: linear-gradient(160deg, color-mix(in srgb, var(--mi-p) 7%, var(--mi-card)), var(--mi-card) 55%); }
.knb__story::after { display: none; }
.knb__story-top { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
.knb__stamp { font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.knb__prose {
  margin: 0; font-size: clamp(17px, 2.1cqi, 21px); line-height: 1.62; letter-spacing: -.012em; color: var(--mi-label); text-wrap: pretty;
}
.knb__ref {
  position: relative; display: inline; margin: 0 -2px; padding: 0 2px; border: 0; border-radius: 5px; cursor: pointer;
  font: inherit; font-weight: 650; color: var(--mi-p-text); font-variant-numeric: tabular-nums;
  background-color: transparent; box-decoration-break: clone; -webkit-box-decoration-break: clone;
  background-image: linear-gradient(color-mix(in srgb, var(--mi-p) 45%, transparent), color-mix(in srgb, var(--mi-p) 45%, transparent));
  background-repeat: no-repeat; background-size: 100% 1.5px; background-position: 0 100%;
}
.knb__ref.is-lit { background-color: var(--mi-p-tint); }
.knb__ref:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.knb__ref sup { margin-left: 1px; font-size: .52em; font-weight: 700; vertical-align: .75em; line-height: 0; color: var(--mi-label3); }
.knb__ref.is-lit sup { color: var(--mi-p-text); }
.knb__hint { margin-top: auto; }
.knb__nb { white-space: nowrap; }

.knb__tile-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.knb__cite {
  display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border-radius: 999px;
  font-size: 11px; font-weight: 700; color: var(--mi-label2); background: var(--mi-fill2); font-variant-numeric: tabular-nums;
}
.knb__tile.is-lit .knb__cite { color: var(--mi-p-on); background: var(--mi-p); }

.knb__figure { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.knb__big { margin: 0; font-size: 30px; line-height: 1; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.knb__revenue .knb__big { font-size: clamp(30px, 4.4cqi, 40px); }
.knb__delta { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.knb__delta.is-up { color: var(--mi-green-t); }
.knb__delta.is-down { color: var(--mi-orange-t); }

.knb__rev { display: grid; gap: 6px; }
.knb__rev svg { display: block; width: 100%; height: 64px; overflow: visible; }
.knb__rev-area { fill: color-mix(in srgb, var(--mi-p) 14%, transparent); }
.knb__rev-line { fill: none; stroke: var(--mi-p); stroke-width: 2; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
.knb__months { display: flex; justify-content: space-between; font-size: 11px; color: var(--mi-label3); }

.knb__regions { display: grid; gap: 12px; margin: 2px 0 0; padding: 0; list-style: none; }
.knb__regions li { display: grid; grid-template-columns: minmax(0, 1fr) auto 52px; gap: 6px 10px; align-items: baseline; }
.knb__r-name { font-size: 13px; color: var(--mi-label2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.knb__r-val { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.knb__r-delta { font-size: 12px; font-weight: 600; text-align: right; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.knb__regions li.is-top .knb__r-name { color: var(--mi-label); font-weight: 600; }
.knb__regions li.is-top .knb__r-delta { color: var(--mi-green-t); }
.knb__r-track { grid-column: 1 / -1; height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.knb__r-track span { display: block; height: 100%; border-radius: inherit; background: var(--mi-label3); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.knb__regions li.is-top .knb__r-track span { background: var(--mi-p); }

.knb__plan-key { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.knb__plan-key span { display: inline-flex; align-items: center; gap: 6px; }
.knb__plan-key i { width: 8px; height: 8px; border-radius: 2px; }
.knb__plan-key .is-annual { background: var(--mi-p); }
.knb__plan-key .is-monthly { background: color-mix(in srgb, var(--mi-p) 28%, var(--mi-card)); }

.knb__cols { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); align-items: end; gap: 4px; height: 40px; margin: 0; padding: 0; list-style: none; }
.knb__cols li { height: 100%; display: flex; align-items: flex-end; }
.knb__cols span { display: block; width: 100%; height: 100%; border-radius: 3px 3px 1px 1px; background: color-mix(in srgb, var(--mi-label) 14%, var(--mi-card)); transform-origin: bottom; transition: transform var(--mi-dur-4) var(--mi-spring); }
.knb__cols li.is-now span { background: var(--mi-p); }

@media (prefers-reduced-motion: reduce) { .knb__tile, .knb__tile::after, .knb__r-track span, .knb__cols span { transition: none; } }
</style>
