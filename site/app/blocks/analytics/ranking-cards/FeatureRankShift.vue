<template>
  <section class="fr mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="fr-title">
    <header class="fr__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="fr-title" variant="title3" as="h2" weight="semibold">Feature adoption ranks</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · ranked by weekly active teams</MiText>
      </div>
      <MiSegmented v-model="period" label="Compare with" :options="periods" />
    </header>

    <!-- Slope chart: where each feature ranked before (left) and where it ranks now (right). -->
    <div class="fr__card mi:grid mi:gap-1.5 mi:min-w-0 mi:py-4 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
      <div class="fr__cols mi:grid mi:grid-cols-[28px_minmax(40px,_1fr)_minmax(0,_2.4fr)] mi:gap-x-2.5 mi:@[560px]:grid-cols-[minmax(0,_1.2fr)_minmax(60px,_1fr)_minmax(0,_1.6fr)] mi:text-[11px] mi:font-semibold mi:tracking-[.04em] mi:uppercase mi:text-label3" aria-hidden="true">
        <span class="mi:[.fr__cols_&:last-child]:pl-2">{{ period === 'quarter' ? 'Last quarter' : 'Last month' }}</span>
        <span class="mi:[.fr__cols_&:last-child]:pl-2" />
        <span class="mi:[.fr__cols_&:last-child]:pl-2">This month</span>
      </div>
      <div class="fr__chart mi:grid mi:grid-cols-[28px_minmax(40px,_1fr)_minmax(0,_2.4fr)] mi:gap-x-2.5 mi:@[560px]:grid-cols-[minmax(0,_1.2fr)_minmax(60px,_1fr)_minmax(0,_1.6fr)]">
        <ol class="fr__before mi:grid mi:auto-rows-[44px] mi:m-0 mi:p-0 mi:[list-style:none] mi:min-w-0" aria-hidden="true">
          <li class="mi:[.fr__before_&]:flex mi:[.fr__before_&]:items-center mi:[.fr__before_&]:gap-2 mi:[.fr__before_&]:min-w-0 mi:[.fr__before_&]:text-label2 mi:[.fr__before_&]:text-[13px]" v-for="f in before" :key="f.name" :class="{ 'is-on': f.name === focus }">
            <span class="fr__rank mi:flex-[none] mi:w-5.5 mi:text-[12px] mi:font-bold mi:text-label3 mi:tabular-nums">{{ f.prev }}</span><span class="fr__before-name mi:hidden mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:@[560px]:inline">{{ f.name }}</span>
          </li>
        </ol>
        <svg class="fr__svg mi:block mi:w-full" :viewBox="`0 0 100 ${ranked.length * ROW}`" :height="ranked.length * ROW" preserveAspectRatio="none" aria-hidden="true">
          <line
            v-for="f in ranked" :key="f.name" x1="0" :y1="(f.prev - 1) * ROW + ROW / 2" x2="100" :y2="(f.rank - 1) * ROW + ROW / 2"
            class="fr__line mi:stroke-fill mi:[stroke-width:2] mi:[stroke-linecap:round] mi:[vector-effect:non-scaling-stroke] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-on]:[stroke-width:3.5]" :class="[f.move > 0 ? 'is-up' : f.move < 0 ? 'is-down' : '', { 'is-on': f.name === focus }]"
          />
        </svg>
        <ol class="fr__now mi:grid mi:auto-rows-[44px] mi:m-0 mi:p-0 mi:[list-style:none] mi:min-w-0" aria-label="Current ranking">
          <li v-for="f in ranked" :key="f.name">
            <button
              type="button" class="fr__row mi:grid mi:grid-cols-[22px_minmax(0,_1fr)_auto] mi:items-center mi:gap-2 mi:w-full mi:h-full mi:py-0 mi:px-2 mi:[border:0] mi:rounded-md mi:bg-transparent mi:text-inherit mi:text-start mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease)] mi:hover:bg-fill4 mi:[&.is-on]:bg-fill4 mi:aria-pressed:shadow-[inset_0_0_0_1px_var(--mi-sep)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :class="{ 'is-on': f.name === focus }" :aria-pressed="f.name === picked"
              :aria-label="`${f.rank}. ${f.name}, ${moveText(f.move)}`"
              @click="picked = f.name" @mouseenter="hovered = f.name" @mouseleave="hovered = ''" @focus="hovered = f.name" @blur="hovered = ''"
            >
              <span class="fr__rank mi:flex-[none] mi:w-5.5 mi:text-[12px] mi:font-bold mi:text-label3 mi:tabular-nums">{{ f.rank }}</span>
              <span class="fr__name mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:font-medium">{{ f.name }}</span>
              <span class="fr__move mi:text-[12px] mi:font-semibold mi:text-label3 mi:tabular-nums" :class="f.move > 0 ? 'is-up' : f.move < 0 ? 'is-down' : ''">
                {{ f.move > 0 ? '▲' + f.move : f.move < 0 ? '▼' + -f.move : '–' }}
              </span>
            </button>
          </li>
        </ol>
      </div>
    </div>

    <article class="fr__detail mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:py-4 mi:px-4.5 mi:rounded-lg mi:bg-card mi:shadow-1" aria-live="polite" aria-labelledby="fr-detail-title">
      <div class="fr__detail-text mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="fr-detail-title" variant="headline" as="h3">{{ current.name }}</MiText>
        <MiText variant="footnote" tone="label2">
          Rank {{ current.rank }}, {{ moveText(current.move) }} · {{ current.teams.toLocaleString('en-US') }} weekly active teams
        </MiText>
      </div>
      <MiSparkline :values="current.weeks" :width="160" :height="40" color="var(--mi-p)" :label="`${current.name} weekly active teams, last 8 weeks`" />
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Feature { name: string, teams: number, prev: { month: number, quarter: number }, weeks: number[] }

const ROW = 44
const periods = [{ value: 'month', label: 'vs last month' }, { value: 'quarter', label: 'vs last quarter' }]
const period = ref<string | number | null>('month')

// Sample product analytics, already sorted by current usage; swap for your event data.
const features: Feature[] = [
  { name: 'Bank sync', teams: 4820, prev: { month: 1, quarter: 1 }, weeks: [4510, 4580, 4620, 4660, 4700, 4740, 4790, 4820] },
  { name: 'Receipt capture', teams: 3970, prev: { month: 4, quarter: 6 }, weeks: [2810, 3020, 3240, 3410, 3580, 3720, 3860, 3970] },
  { name: 'Invoices', teams: 3640, prev: { month: 2, quarter: 2 }, weeks: [3810, 3790, 3760, 3730, 3700, 3680, 3660, 3640] },
  { name: 'Expense rules', teams: 3210, prev: { month: 3, quarter: 3 }, weeks: [3300, 3290, 3270, 3260, 3240, 3230, 3220, 3210] },
  { name: 'Cash forecast', teams: 2580, prev: { month: 7, quarter: 8 }, weeks: [1420, 1630, 1840, 2010, 2190, 2330, 2470, 2580] },
  { name: 'Approvals', teams: 2410, prev: { month: 5, quarter: 4 }, weeks: [2620, 2590, 2560, 2530, 2490, 2460, 2430, 2410] },
  { name: 'Payroll export', teams: 2190, prev: { month: 6, quarter: 5 }, weeks: [2350, 2330, 2300, 2280, 2250, 2230, 2210, 2190] },
  { name: 'Multi-currency', teams: 1870, prev: { month: 8, quarter: 7 }, weeks: [1790, 1800, 1810, 1820, 1840, 1850, 1860, 1870] }
]

const ranked = computed(() => features.map((f, i) => {
  const prev = f.prev[(period.value ?? 'month') as 'month' | 'quarter']
  return { ...f, rank: i + 1, prev, move: prev - (i + 1) }
}))
const before = computed(() => [...ranked.value].sort((a, b) => a.prev - b.prev))

// Hover previews a feature, a click pins it.
const picked = ref('Receipt capture')
const hovered = ref('')
const focus = computed(() => hovered.value || picked.value)
const current = computed(() => ranked.value.find(f => f.name === focus.value) ?? ranked.value[0]!)

const moveText = (m: number) => (m === 0 ? 'no change' : `${m > 0 ? 'up' : 'down'} ${Math.abs(m)} ${Math.abs(m) === 1 ? 'place' : 'places'}`)
</script>

<style scoped>
.fr__before li.is-on { color: var(--mi-label); font-weight: 600; }
.fr__line.is-up { stroke: color-mix(in srgb, var(--mi-green) 55%, transparent); }
.fr__line.is-down { stroke: color-mix(in srgb, var(--mi-orange) 55%, transparent); }
.fr__line.is-on { stroke: var(--mi-p); }

.fr__row { font: inherit; font-size: 14px;
}
.fr__move.is-up { color: var(--mi-green-t); }
.fr__move.is-down { color: var(--mi-orange-t); }
</style>
