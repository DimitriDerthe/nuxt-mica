<template>
  <section class="fr" aria-labelledby="fr-title">
    <header class="fr__head">
      <div>
        <MiText id="fr-title" variant="title3" as="h2" weight="semibold">Feature adoption ranks</MiText>
        <MiText variant="footnote" tone="label2">Ledgerly · ranked by weekly active teams</MiText>
      </div>
      <MiSegmented v-model="period" label="Compare with" :options="periods" />
    </header>

    <!-- Slope chart: where each feature ranked before (left) and where it ranks now (right). -->
    <div class="fr__card">
      <div class="fr__cols" aria-hidden="true">
        <span>{{ period === 'quarter' ? 'Last quarter' : 'Last month' }}</span>
        <span />
        <span>This month</span>
      </div>
      <div class="fr__chart">
        <ol class="fr__before" aria-hidden="true">
          <li v-for="f in before" :key="f.name" :class="{ 'is-on': f.name === focus }">
            <span class="fr__rank">{{ f.prev }}</span><span class="fr__before-name">{{ f.name }}</span>
          </li>
        </ol>
        <svg class="fr__svg" :viewBox="`0 0 100 ${ranked.length * ROW}`" :height="ranked.length * ROW" preserveAspectRatio="none" aria-hidden="true">
          <line
            v-for="f in ranked" :key="f.name" x1="0" :y1="(f.prev - 1) * ROW + ROW / 2" x2="100" :y2="(f.rank - 1) * ROW + ROW / 2"
            class="fr__line" :class="[f.move > 0 ? 'is-up' : f.move < 0 ? 'is-down' : '', { 'is-on': f.name === focus }]"
          />
        </svg>
        <ol class="fr__now" aria-label="Current ranking">
          <li v-for="f in ranked" :key="f.name">
            <button
              type="button" class="fr__row" :class="{ 'is-on': f.name === focus }" :aria-pressed="f.name === picked"
              :aria-label="`${f.rank}. ${f.name}, ${moveText(f.move)}`"
              @click="picked = f.name" @mouseenter="hovered = f.name" @mouseleave="hovered = ''" @focus="hovered = f.name" @blur="hovered = ''"
            >
              <span class="fr__rank">{{ f.rank }}</span>
              <span class="fr__name">{{ f.name }}</span>
              <span class="fr__move" :class="f.move > 0 ? 'is-up' : f.move < 0 ? 'is-down' : ''">
                {{ f.move > 0 ? '▲' + f.move : f.move < 0 ? '▼' + -f.move : '–' }}
              </span>
            </button>
          </li>
        </ol>
      </div>
    </div>

    <article class="fr__detail" aria-live="polite" aria-labelledby="fr-detail-title">
      <div class="fr__detail-text">
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
.fr { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.fr__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.fr__card { display: grid; gap: 6px; min-width: 0; padding: 16px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fr__cols, .fr__chart { display: grid; grid-template-columns: 28px minmax(40px, 1fr) minmax(0, 2.4fr); column-gap: 10px; }
@container (min-width: 560px) { .fr__cols, .fr__chart { grid-template-columns: minmax(0, 1.2fr) minmax(60px, 1fr) minmax(0, 1.6fr); } }
.fr__cols { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--mi-label3); }
.fr__cols span:last-child { padding-left: 8px; }

.fr__before, .fr__now { display: grid; grid-auto-rows: 44px; margin: 0; padding: 0; list-style: none; min-width: 0; }
.fr__before li { display: flex; align-items: center; gap: 8px; min-width: 0; color: var(--mi-label2); font-size: 13px; }
.fr__before li.is-on { color: var(--mi-label); font-weight: 600; }
.fr__before-name { display: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@container (min-width: 560px) { .fr__before-name { display: inline; } }
.fr__rank { flex: none; width: 22px; font-size: 12px; font-weight: 700; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.fr__svg { display: block; width: 100%; }
.fr__line { stroke: var(--mi-fill); stroke-width: 2; stroke-linecap: round; vector-effect: non-scaling-stroke; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.fr__line.is-up { stroke: color-mix(in srgb, var(--mi-green) 55%, transparent); }
.fr__line.is-down { stroke: color-mix(in srgb, var(--mi-orange) 55%, transparent); }
.fr__line.is-on { stroke: var(--mi-p); stroke-width: 3.5; }

.fr__row {
  display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; align-items: center; gap: 8px; width: 100%; height: 100%; padding: 0 8px;
  border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer;
  transition: background-color var(--mi-dur-2) var(--mi-ease);
}
.fr__row:hover, .fr__row.is-on { background: var(--mi-fill4); }
.fr__row[aria-pressed="true"] { box-shadow: inset 0 0 0 1px var(--mi-sep); }
.fr__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.fr__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500; }
.fr__move { font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.fr__move.is-up { color: var(--mi-green-t); }
.fr__move.is-down { color: var(--mi-orange-t); }

.fr__detail { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.fr__detail-text { display: grid; gap: 2px; min-width: 0; }
</style>
