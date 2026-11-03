<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="sf-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="sf-title" variant="title3" as="h2" weight="semibold">Trial sign-ups</MiText>
        <MiText variant="footnote" tone="label2">Fieldnote · self-serve funnel, all regions</MiText>
      </div>
      <MiSegmented v-model="range" label="Range" :options="ranges" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[860px]:grid-cols-[minmax(0,_1fr)_290px]">
      <article class="mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:grid mi:gap-3 mi:p-4.5">
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div class="mi:grid mi:gap-0.5">
            <p class="mi:m-0 mi:text-[clamp(32px,_7cqi,_44px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ fmt(last(data.actual)) }}</p>
            <MiText variant="footnote" tone="label2">sign-ups in {{ data.lastLabel }}</MiText>
          </div>
          <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Compare with">
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

      <aside class="mi:grid mi:gap-3 mi:content-start mi:grid-cols-[minmax(0,_1fr)] mi:[@container_(min-width:_560px)_and_(max-width:_859px)]:grid-cols-2">
        <article class="mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:grid mi:gap-1.5 mi:content-start mi:py-4 mi:px-4.5">
          <MiText variant="subheadline" weight="medium" tone="label2" as="h3">Versus forecast</MiText>
          <p class="mi:mt-0.5 mi:mx-0 mi:mb-0 mi:text-[30px] mi:leading-[1.1] mi:font-bold mi:tracking-[-.035em] mi:tabular-nums" :class="variance >= 0 ? 'mi:text-green-t' : 'mi:text-red-t'">{{ variance >= 0 ? '+' : '' }}{{ variance.toFixed(1) }}%</p>
          <MiText variant="footnote" tone="label2">{{ fmt(sum(data.actual)) }} actual against {{ fmt(sum(data.forecast)) }} planned</MiText>

          <!-- Beat-or-miss strip: one cell per period, read left to right like the chart. -->
          <ol class="mi:grid mi:grid-flow-col mi:auto-cols-[minmax(0,_1fr)] mi:gap-[3px] mi:mt-2.5 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]" :aria-label="`${beats} of ${data.actual.length} periods above forecast`">
            <li v-for="c in cells" :key="c.label" class="mi:h-[22px] mi:rounded-[4px]" :class="c.beat ? 'mi:[background:color-mix(in_srgb,_var(--mi-p)_78%,_var(--mi-card))]' : 'mi:[background:repeating-linear-gradient(135deg,_var(--mi-fill3)_0_3px,_var(--mi-fill)_3px_6px)]'" :title="c.title">
              <span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ c.label }} {{ c.beat ? 'above' : 'below' }} forecast</span>
            </li>
          </ol>
          <div class="mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:text-[12px] mi:text-label2">
            <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:h-2.5 mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-p)_78%,_var(--mi-card))] mi:w-2.5" />Above plan · {{ beats }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5"><i class="mi:h-2.5 mi:rounded-[3px] mi:[background:repeating-linear-gradient(135deg,_var(--mi-fill3)_0_3px,_var(--mi-fill)_3px_6px)] mi:w-2.5" />Below · {{ data.actual.length - beats }}</span>
          </div>
        </article>

        <article class="mi:min-w-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:grid mi:gap-1.5 mi:content-start mi:py-4 mi:px-4.5">
          <MiText variant="subheadline" weight="medium" tone="label2" as="h3">What moved the line</MiText>
          <ul class="mi:grid mi:gap-2.5 mi:mt-1.5 mi:mx-0 mi:mb-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:grid mi:grid-cols-[52px_minmax(0,_1fr)] mi:gap-2.5 mi:items-baseline" v-for="m in data.moments" :key="m.when">
              <span class="mi:text-[12px] mi:font-semibold mi:text-p-text mi:tabular-nums">{{ m.when }}</span>
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

