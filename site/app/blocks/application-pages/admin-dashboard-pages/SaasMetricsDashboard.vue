<template>
  <section class="mi:@container mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]" aria-labelledby="smd-title">
    <div class="mi:grid mi:content-start mi:min-h-full">
      <!-- Shell: a single top bar, no sidebar. The section links scroll inside their own strip on narrow widths. -->
      <header class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[grid-template-areas:'brand_._tools'_'nav_nav_nav'] mi:items-center mi:gap-y-1 mi:gap-x-3 mi:pt-2.5 mi:px-4 mi:pb-0 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:@[560px]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:@[560px]:[grid-template-areas:'brand_nav_tools'] mi:@[560px]:py-0 mi:@[560px]:px-5">
        <div class="mi:[grid-area:brand] mi:flex mi:items-center mi:gap-[9px]">
          <span class="mi:flex mi:[align-items:flex-end] mi:gap-0.5 mi:w-6.5 mi:h-6.5 mi:py-1.5 mi:px-[5px] mi:rounded-[8px] mi:[background:var(--mi-p)]" aria-hidden="true"><i class="mi:flex-1 mi:rounded-[1.5px] mi:[background:var(--mi-p-on)] mi:[&:nth-child(1)]:h-[45%] mi:[&:nth-child(1)]:opacity-60 mi:[&:nth-child(2)]:h-[75%] mi:[&:nth-child(2)]:opacity-80 mi:[&:nth-child(3)]:h-full" /><i class="mi:flex-1 mi:rounded-[1.5px] mi:[background:var(--mi-p-on)] mi:[&:nth-child(1)]:h-[45%] mi:[&:nth-child(1)]:opacity-60 mi:[&:nth-child(2)]:h-[75%] mi:[&:nth-child(2)]:opacity-80 mi:[&:nth-child(3)]:h-full" /><i class="mi:flex-1 mi:rounded-[1.5px] mi:[background:var(--mi-p-on)] mi:[&:nth-child(1)]:h-[45%] mi:[&:nth-child(1)]:opacity-60 mi:[&:nth-child(2)]:h-[75%] mi:[&:nth-child(2)]:opacity-80 mi:[&:nth-child(3)]:h-full" /></span>
          <MiText as="span" variant="subheadline" weight="bold">Plover</MiText>
        </div>
        <nav class="mi:[grid-area:nav] mi:flex mi:gap-5.5 mi:overflow-x-auto mi:[scrollbar-width:none] mi:-mx-4 mi:px-4 mi:@[560px]:m-0 mi:@[560px]:pt-0 mi:@[560px]:pr-0 mi:@[560px]:pb-0 mi:@[560px]:pl-5" aria-label="Workspace">
          <a
            v-for="l in links" :key="l" href="#" class="mi:relative mi:pt-3 mi:px-0 mi:pb-[13px] mi:text-[14px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:whitespace-nowrap mi:rounded-[4px] mi:after:content-[''] mi:after:absolute mi:after:left-0 mi:after:right-0 mi:after:-bottom-px mi:after:h-0.5 mi:after:rounded-[2px] mi:after:[background:var(--mi-p)] mi:after:transform-[scaleX(0)] mi:after:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&[aria-current='page']]:font-semibold mi:[&[aria-current='page']]:after:transform-[scaleX(1)] mi:hover:text-label mi:[&[aria-current='page']]:text-label mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:@[560px]:pt-4.5 mi:@[560px]:px-0 mi:@[560px]:pb-[19px]"
            :aria-current="l === 'Revenue' ? 'page' : undefined" @click.prevent
          >{{ l }}</a>
        </nav>
        <div class="mi:[grid-area:tools] mi:flex mi:items-center mi:gap-0.5">
          <MiIconButton label="Search" variant="plain" size="regular"><MiIcon name="search" :size="18" /></MiIconButton>
          <MiIconButton label="Notifications" variant="plain" size="regular"><MiIcon name="bell" :size="18" /></MiIconButton>
          <MiAvatar name="Noor Haddad" size="sm" tone="auto" class="mi:ml-2!" />
        </div>
      </header>

      <div class="mi:grid mi:gap-4.5 mi:pt-5 mi:px-3 mi:pb-6 mi:min-w-0 mi:@[560px]:pt-6 mi:@[560px]:px-5 mi:@[560px]:pb-7 mi:@[1040px]:pt-7 mi:@[1040px]:px-8 mi:@[1040px]:pb-8 mi:@[1040px]:gap-5">
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
          <div>
            <MiText variant="caption" tone="label2" weight="medium" class="mi:mb-0.5!">October 2026 · books closed Nov 1</MiText>
            <MiText id="smd-title" as="h2" variant="title2" weight="bold">Revenue</MiText>
          </div>
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiSegmented v-model="currency" label="Currency" :options="[{ value: 'usd', label: 'USD' }, { value: 'eur', label: 'EUR' }]" />
            <MiButton variant="gray" size="small">
              <template #leading><MiIcon name="share" :size="15" /></template>
              Export
            </MiButton>
          </div>
        </div>

        <!-- Headline figures share one strip with hairline dividers instead of four separate cards. -->
        <dl class="mi:grid mi:grid-cols-2 mi:m-0 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden mi:@[760px]:grid-cols-4">
          <div v-for="f in facts" :key="f.label" class="mi:grid mi:gap-1.5 mi:py-3.5 mi:px-4 mi:even:border-l mi:even:border-l-sep mi:[&:nth-child(n+3)]:border-t mi:[&:nth-child(n+3)]:border-t-sep mi:@[760px]:py-4 mi:@[760px]:px-5 mi:@[760px]:not-first:border-l mi:@[760px]:not-first:border-l-sep mi:@[760px]:[&:nth-child(n+3)]:[border-top:0]">
            <dt class="mi:text-[12px] mi:font-medium mi:text-label2">{{ f.label }}</dt>
            <dd class="mi:m-0 mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2">
              <span class="mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums mi:@[760px]:text-[26px]">{{ f.value }}</span>
              <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="f.good ? 'mi:text-green-t' : 'mi:text-red-t'">{{ f.delta }}</span>
            </dd>
          </div>
        </dl>

        <div class="mi:grid mi:gap-4 mi:min-w-0 mi:@[1040px]:grid-cols-[minmax(0,_1.45fr)_minmax(0,_1fr)] mi:@[1040px]:items-stretch">
          <article class="mi:grid mi:content-start mi:gap-4 mi:min-w-0 mi:py-4 mi:px-3.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:p-4.5 mi:@[1040px]:py-5 mi:@[1040px]:px-5.5" aria-labelledby="smd-flow">
            <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
              <div>
                <MiText id="smd-flow" as="h3" variant="headline" weight="semibold">MRR movement</MiText>
                <MiText variant="caption" tone="label2">Select a step to see the accounts behind it</MiText>
              </div>
              <MiText variant="caption" tone="label3" tabular>Axis starts at {{ money(DOMAIN[0]) }}</MiText>
            </div>

            <div class="mi:relative mi:grid mi:grid-cols-[36px_minmax(0,_1fr)] mi:grid-rows-[220px_auto] mi:@[560px]:grid-cols-[42px_minmax(0,_1fr)]">
              <div class="mi:relative mi:row-[1] mi:col-span-full mi:pointer-events-none" aria-hidden="true">
                <span class="mi:absolute mi:left-9 mi:h-0 mi:@[560px]:left-[42px] mi:right-0 mi:[border-top:1px_dashed_var(--mi-sep)] mi:first:[border-top-style:solid]" v-for="t in ticks" :key="t" :style="{ bottom: pct(t - DOMAIN[0]) }"><em class="mi:absolute mi:left-[-36px] mi:text-end mi:text-[10.5px] mi:text-label3 mi:@[560px]:left-[-42px] mi:w-7.5 mi:-top-1.5 mi:not-italic mi:leading-none mi:tabular-nums mi:@[560px]:w-8.5">{{ money(t) }}</em></span>
              </div>
              <div class="mi:row-[1] mi:col-[2] mi:grid mi:grid-cols-6" role="group" aria-label="MRR movement steps">
                <div v-for="(s, i) in steps" :key="s.id" class="mi:relative">
                  <button
                    type="button" class="mi:absolute mi:left-[20%] mi:right-[20%] mi:p-0 mi:[border:0] mi:rounded-[5px] mi:[background:transparent] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px] mi:group/btn"
                    :style="{ bottom: pct(s.low - DOMAIN[0]), height: pct(s.high - s.low) }"
                    :aria-pressed="active === s.id" :aria-label="`${s.label}: ${signed(s)}`"
                    @click="active = s.id"
                  >
                    <span class="mi:block mi:w-full mi:h-full mi:rounded-[inherit] mi:origin-bottom mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[--mi-in-sx:1] mi:[--mi-in-sy:0] mi:animate-[in_var(--mi-dur-4)_var(--mi-spring)_both] mi:motion-reduce:animate-none mi:group-hover/btn:opacity-100!" :class="[active && active !== s.id ? 'mi:opacity-55' : '', s.kind === 'total' ? 'mi:bg-[image:linear-gradient(180deg,_var(--mi-p),_color-mix(in_srgb,_var(--mi-p)_72%,_var(--mi-card)))]' : s.kind === 'gain' ? 'mi:bg-[color:color-mix(in_srgb,_var(--mi-green)_78%,_var(--mi-card))]' : 'mi:bg-[color:color-mix(in_srgb,_var(--mi-red)_72%,_var(--mi-card))]']" :style="{ animationDelay: i * 60 + 'ms' }" />
                  </button>
                  <span class="mi:absolute mi:left-1/2 mi:mb-1.5 mi:text-[10.5px] mi:font-semibold mi:whitespace-nowrap mi:tabular-nums mi:transform-[translateX(-50%)] mi:pointer-events-none mi:@[560px]:text-[11px]" :class="[s.kind === 'gain' ? 'mi:text-green-t' : s.kind === 'loss' ? 'mi:text-red-t' : 'mi:text-label2', active === s.id ? '' : s.kind === 'total' ? '' : 'mi:opacity-0 mi:@[560px]:opacity-100']" :style="{ bottom: pct(s.high - DOMAIN[0]) }" aria-hidden="true">{{ signed(s) }}</span>
                  <span v-if="i < steps.length - 1" class="mi:absolute mi:left-[80%] mi:right-[-20%] mi:h-0 mi:[border-top:1px_dashed_var(--mi-label3)] mi:opacity-60" :style="{ bottom: pct(s.level - DOMAIN[0]) }" aria-hidden="true" />
                </div>
              </div>
              <div class="mi:row-[2] mi:col-[2] mi:grid mi:grid-cols-6 mi:pt-2" aria-hidden="true">
                <span class="mi:text-[10px] mi:text-center mi:@[560px]:text-[11px] mi:whitespace-nowrap" v-for="s in steps" :key="s.id" :class="active === s.id ? 'mi:text-label mi:font-[650]' : 'mi:text-label2 mi:font-medium'">{{ s.short }}</span>
              </div>
            </div>

            <div class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-fill4)]" aria-live="polite">
              <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-0.5 mi:gap-x-3">
                <MiText as="h4" variant="subheadline" weight="semibold">{{ current.label }}</MiText>
                <MiText variant="footnote" tone="label2" tabular>{{ current.note }}</MiText>
              </div>
              <ul class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:@[560px]:grid-cols-2 mi:@[560px]:gap-x-6">
                <li class="mi:grid mi:items-center mi:py-2 mi:px-0 mi:not-first:border-t mi:not-first:border-t-sep mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[grid-template-areas:'av_name_amt'_'av_sub_amt'] mi:gap-x-2.5 mi:@[560px]:[&:nth-child(2)]:[border-top:0]" v-for="r in current.rows" :key="r.name">
                  <MiAvatar class="mi:[grid-area:av]" :name="r.name" size="xs" tone="auto" shape="square" decorative />
                  <span class="mi:[grid-area:name] mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[13.5px] mi:font-[550]">{{ r.name }}</span>
                  <span class="mi:[grid-area:sub] mi:min-w-0 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[12px] mi:text-label2">{{ r.sub }}</span>
                  <span class="mi:[grid-area:amt] mi:text-[13.5px] mi:font-semibold mi:tabular-nums" :class="[current.kind === 'gain' ? 'mi:text-green-t' : current.kind === 'loss' ? 'mi:text-red-t' : '']">{{ r.amount }}</span>
                </li>
              </ul>
            </div>
          </article>

          <article class="mi:grid mi:content-start mi:gap-4 mi:min-w-0 mi:py-4 mi:px-3.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:@[560px]:p-4.5 mi:@[1040px]:py-5 mi:@[1040px]:px-5.5" aria-labelledby="smd-cohort">
            <div class="mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
              <div>
                <MiText id="smd-cohort" as="h3" variant="headline" weight="semibold">Retention by signup cohort</MiText>
                <MiText variant="caption" tone="label2">{{ basis === 'revenue' ? 'Net revenue kept, expansion included' : 'Share of customers still paying' }}</MiText>
              </div>
              <MiSegmented v-model="basis" label="Retention basis" :options="[{ value: 'revenue', label: 'Revenue' }, { value: 'logos', label: 'Logos' }]" />
            </div>

            <div class="mi:overflow-x-auto mi:-mx-1 mi:px-1">
              <table class="mi:w-full mi:border-separate mi:[border-spacing:2px] mi:tabular-nums mi:@[560px]:[border-spacing:3px]">
                <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">{{ basis === 'revenue' ? 'Net revenue retention' : 'Logo retention' }} by month since signup</caption>
                <thead>
                  <tr>
                    <th class="mi:p-0 mi:pb-1 mi:text-center mi:text-[11px] mi:font-semibold mi:text-label3 mi:first:text-start" scope="col">Cohort</th>
                    <th class="mi:p-0 mi:pb-1 mi:text-center mi:text-[11px] mi:font-semibold mi:text-label3 mi:first:text-start" v-for="m in 6" :key="m" scope="col">M{{ m - 1 }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in cohortRows" :key="c.month">
                    <th class="mi:p-0 mi:pr-1.5 mi:text-start mi:whitespace-nowrap" scope="row">
                      <span class="mi:block mi:text-[13px] mi:font-semibold">{{ c.month }}</span>
                      <small class="mi:block mi:text-[11px] mi:font-normal mi:text-label3">{{ c.size }}</small>
                    </th>
                    <td class="mi:h-9 mi:p-0 mi:text-[11px] mi:text-center mi:text-label mi:@[560px]:h-[38px] mi:@[560px]:py-0 mi:@[560px]:px-1 mi:@[560px]:text-[12px] mi:rounded-[6px] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" v-for="(v, j) in c.cells" :key="j" :class="[v === null ? 'mi:bg-[image:repeating-linear-gradient(135deg,_var(--mi-fill4)_0_4px,_transparent_4px_8px)]' : 'mi:[background:color-mix(in_srgb,_var(--mi-p)_var(--smd-shade,_0%),_transparent)]', v !== null && v > 100 ? 'mi:font-bold' : 'mi:font-[550]']" :style="v === null ? undefined : { '--smd-shade': shade(v) }">
                      {{ v === null ? '' : v + '%' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mi:grid mi:grid-cols-[auto_auto_1fr] mi:[grid-template-areas:'lo_ramp_hi'_'ins_ins_ins'] mi:items-center mi:gap-y-2.5 mi:gap-x-2">
              <span class="mi:[grid-area:ramp] mi:w-24 mi:h-1.5 mi:rounded-[3px] mi:[background:linear-gradient(90deg,_color-mix(in_srgb,_var(--mi-p)_6%,_transparent),_color-mix(in_srgb,_var(--mi-p)_58%,_transparent))]" aria-hidden="true" />
              <MiText variant="caption2" tone="label3" tabular class="mi:[grid-area:lo]">{{ basis === 'revenue' ? '85%' : '70%' }}</MiText>
              <MiText variant="caption2" tone="label3" tabular class="mi:[grid-area:hi]">{{ basis === 'revenue' ? '110%+' : '100%' }}</MiText>
              <MiText variant="caption" tone="label2" class="mi:[grid-area:ins] mi:pt-2.5 mi:border-t mi:border-t-sep mi:@[1040px]:mt-auto!">
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
