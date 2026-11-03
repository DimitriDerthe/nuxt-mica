<template>
  <section class="sf" aria-labelledby="sf-title">
    <header class="sf__head">
      <div>
        <MiText id="sf-title" variant="title3" as="h2" weight="semibold">Trial sign-ups</MiText>
        <MiText variant="footnote" tone="label2">Fieldnote · self-serve funnel, all regions</MiText>
      </div>
      <MiSegmented v-model="range" label="Range" :options="ranges" />
    </header>

    <div class="sf__grid">
      <article class="sf__plot">
        <div class="sf__plot-top">
          <div class="sf__now">
            <p class="sf__big">{{ fmt(last(data.actual)) }}</p>
            <MiText variant="footnote" tone="label2">sign-ups in {{ data.lastLabel }}</MiText>
          </div>
          <div class="sf__toggles" role="group" aria-label="Compare with">
            <MiChip v-model="showForecast" selectable size="small" tone="secondary" label="Forecast" />
            <MiChip v-model="showLastYear" selectable size="small" tone="neutral" label="Last year" />
          </div>
        </div>
        <MiLineChart
          :key="String(range)" :categories="data.categories" :series="series" :card="false" :height="220"
          :ticks="3" :min="data.min" area="first" :toolbar="false" :format-value="(v) => fmt(v)"
          category-label="Period" :aria-label="`Trial sign-ups by ${data.unit}, ${beats} of ${data.actual.length} periods above forecast`"
        />
      </article>

      <aside class="sf__side">
        <article class="sf__card">
          <MiText variant="subheadline" weight="medium" tone="label2" as="h3">Versus forecast</MiText>
          <p class="sf__mid" :class="variance >= 0 ? 'is-up' : 'is-down'">{{ variance >= 0 ? '+' : '' }}{{ variance.toFixed(1) }}%</p>
          <MiText variant="footnote" tone="label2">{{ fmt(sum(data.actual)) }} actual against {{ fmt(sum(data.forecast)) }} planned</MiText>

          <!-- Beat-or-miss strip: one cell per period, read left to right like the chart. -->
          <ol class="sf__strip" :aria-label="`${beats} of ${data.actual.length} periods above forecast`">
            <li v-for="c in cells" :key="c.label" :class="c.beat ? 'is-beat' : 'is-miss'" :title="c.title">
              <span class="sf__sr">{{ c.label }} {{ c.beat ? 'above' : 'below' }} forecast</span>
            </li>
          </ol>
          <div class="sf__strip-key">
            <span><i class="is-beat" />Above plan · {{ beats }}</span>
            <span><i class="is-miss" />Below · {{ data.actual.length - beats }}</span>
          </div>
        </article>

        <article class="sf__card">
          <MiText variant="subheadline" weight="medium" tone="label2" as="h3">What moved the line</MiText>
          <ul class="sf__moments">
            <li v-for="m in data.moments" :key="m.when">
              <span class="sf__when">{{ m.when }}</span>
              <MiText variant="footnote">{{ m.text }}</MiText>
            </li>
          </ul>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const ranges = [{ value: 'weeks', label: '8 weeks' }, { value: 'months', label: '6 months' }, { value: 'year', label: '12 months' }]
const range = ref<string | number | null>('weeks')
const showForecast = ref(true)
const showLastYear = ref(false)

interface Range { unit: string, min: number, lastLabel: string, categories: string[], actual: number[], forecast: number[], lastYear: number[], moments: { when: string, text: string }[] }

// Sample data per range; swap for your API.
const sets: Record<string, Range> = {
  weeks: {
    unit: 'week', min: 300, lastLabel: 'the week of Oct 20',
    categories: ['Sep 1', 'Sep 8', 'Sep 15', 'Sep 22', 'Sep 29', 'Oct 6', 'Oct 13', 'Oct 20'],
    actual: [412, 438, 465, 451, 508, 547, 529, 586],
    forecast: [420, 430, 445, 460, 475, 490, 505, 520],
    lastYear: [350, 362, 371, 380, 377, 402, 410, 421],
    moments: [
      { when: 'Sep 29', text: 'Templates gallery launched on the homepage.' },
      { when: 'Oct 13', text: 'Paid search paused for 3 days during the budget review.' },
      { when: 'Oct 20', text: 'Product Hunt feature: best week of the year so far.' }
    ]
  },
  months: {
    unit: 'month', min: 1200, lastLabel: 'October',
    categories: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    actual: [1620, 1710, 1580, 1840, 1905, 2210],
    forecast: [1650, 1700, 1750, 1800, 1850, 1900],
    lastYear: [1310, 1355, 1290, 1420, 1500, 1610],
    moments: [
      { when: 'Jul', text: 'Summer dip, deeper than planned after the pricing page rewrite.' },
      { when: 'Aug', text: 'Reverted the pricing page; trials recovered within two weeks.' },
      { when: 'Oct', text: 'Templates gallery and Product Hunt stacked into a record month.' }
    ]
  },
  year: {
    unit: 'month', min: 800, lastLabel: 'October',
    categories: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    actual: [1180, 1090, 1320, 1410, 1495, 1530, 1620, 1710, 1580, 1840, 1905, 2210],
    forecast: [1200, 1150, 1300, 1380, 1450, 1550, 1650, 1700, 1750, 1800, 1850, 1900],
    lastYear: [905, 860, 1010, 1080, 1150, 1230, 1310, 1355, 1290, 1420, 1500, 1610],
    moments: [
      { when: 'Jan', text: 'Free plan raised to 3 projects; sign-ups beat plan for 3 months.' },
      { when: 'Jul', text: 'Pricing page rewrite cost about 170 trials before the revert.' },
      { when: 'Oct', text: 'Year closes 37% above last October.' }
    ]
  }
}

const data = computed(() => sets[String(range.value ?? 'weeks')]!)

const series = computed(() => [
  { name: 'Sign-ups', data: data.value.actual, color: 'var(--mi-p)', area: true },
  ...(showForecast.value ? [{ name: 'Forecast', data: data.value.forecast, color: 'var(--mi-s)', area: false }] : []),
  ...(showLastYear.value ? [{ name: 'Last year', data: data.value.lastYear, color: 'var(--mi-label3)', area: false }] : [])
])

const fmt = (n: number) => n.toLocaleString('en-US')
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const last = (a: number[]) => a[a.length - 1] ?? 0
const variance = computed(() => (sum(data.value.actual) / sum(data.value.forecast) - 1) * 100)
const cells = computed(() => data.value.categories.map((label, i) => {
  const a = data.value.actual[i] ?? 0
  const f = data.value.forecast[i] ?? 0
  return { label, beat: a >= f, title: `${label}: ${fmt(a)} vs ${fmt(f)} planned` }
}))
const beats = computed(() => cells.value.filter(c => c.beat).length)
</script>

<style scoped>
.sf { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.sf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sf__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 860px) { .sf__grid { grid-template-columns: minmax(0, 1fr) 290px; } }

.sf__plot, .sf__card { min-width: 0; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.sf__plot { display: grid; gap: 12px; padding: 18px; }
.sf__plot-top { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.sf__now { display: grid; gap: 2px; }
.sf__big { margin: 0; font-size: clamp(32px, 7cqi, 44px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.sf__toggles { display: flex; flex-wrap: wrap; gap: 6px; }

.sf__side { display: grid; gap: 12px; align-content: start; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 560px) and (max-width: 859px) { .sf__side { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.sf__card { display: grid; gap: 6px; align-content: start; padding: 16px 18px; }
.sf__mid { margin: 2px 0 0; font-size: 30px; line-height: 1.1; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.sf__mid.is-up { color: var(--mi-green-t); }
.sf__mid.is-down { color: var(--mi-red-t); }

.sf__strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 3px; margin: 10px 0 0; padding: 0; list-style: none; }
.sf__strip li { height: 22px; border-radius: 4px; }
.sf__strip .is-beat, .sf__strip-key .is-beat { background: color-mix(in srgb, var(--mi-p) 78%, var(--mi-card)); }
.sf__strip .is-miss, .sf__strip-key .is-miss { background: repeating-linear-gradient(135deg, var(--mi-fill3) 0 3px, var(--mi-fill) 3px 6px); }
.sf__strip-key { display: flex; flex-wrap: wrap; gap: 4px 14px; font-size: 12px; color: var(--mi-label2); }
.sf__strip-key span { display: inline-flex; align-items: center; gap: 6px; }
.sf__strip-key i { width: 10px; height: 10px; border-radius: 3px; }
.sf__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.sf__moments { display: grid; gap: 10px; margin: 6px 0 0; padding: 0; list-style: none; }
.sf__moments li { display: grid; grid-template-columns: 52px minmax(0, 1fr); gap: 10px; align-items: baseline; }
.sf__when { font-size: 12px; font-weight: 600; color: var(--mi-p-text); font-variant-numeric: tabular-nums; }
</style>
