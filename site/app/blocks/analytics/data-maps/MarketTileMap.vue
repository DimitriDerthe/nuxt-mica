<template>
  <section class="tm" aria-labelledby="tm-title">
    <header class="tm__head">
      <div>
        <MiText id="tm-title" variant="title3" as="h2" weight="semibold">Where customers are</MiText>
        <MiText variant="footnote" tone="label2">Paying workspaces by market · October</MiText>
      </div>
      <MiSegmented v-model="metricId" label="Metric" :options="metrics" />
    </header>

    <div class="tm__grid">
      <article class="tm__map">
        <div class="tm__map-top">
          <MiSegmented v-model="region" label="Region" :options="regions" />
          <MiChartLegend variant="ramp" :items="ramp" less-label="Fewer" more-label="More" :aria-label="`${metric.label} scale, in fifths`" />
        </div>

        <!-- Tile map: one tile per market, odd rows nudged half a tile for a hex rhythm. No geodata needed. -->
        <div class="tm__tiles" role="group" :aria-label="`${metric.label} by market`">
          <button
            v-for="t in tiles" :key="t.code" type="button" class="tm__tile"
            :class="{ 'is-odd': t.row % 2 === 1, 'is-dim': !t.inRegion, 'is-active': active === t.code, 'is-dark': t.bin >= 3 }"
            :style="{ gridColumn: t.col + 1, gridRow: t.row + 1, background: binColors[t.bin] }"
            :aria-label="`${t.name}, ${metric.format(t.value)}, rank ${t.rank} of ${tiles.length}`" :aria-pressed="pinned === t.code"
            @mouseenter="hover = t.code" @mouseleave="hover = ''" @focus="hover = t.code" @blur="hover = ''" @click="pin(t.code)"
          >
            <span aria-hidden="true">{{ t.code }}</span>
          </button>
        </div>
        <MiText variant="caption" tone="label3">One tile per market, placed by rough geography. Tile size says nothing about country size.</MiText>
      </article>

      <aside class="tm__side">
        <article class="tm__readout" aria-live="polite">
          <template v-if="focus">
            <div class="tm__readout-top">
              <span class="tm__code">{{ focus.code }}</span>
              <MiText variant="headline" as="h3">{{ focus.name }}</MiText>
              <MiText variant="caption" tone="label2" as="span" class="tm__rank">#{{ focus.rank }}</MiText>
            </div>
            <dl class="tm__facts">
              <div v-for="f in focusFacts" :key="f.id" :class="{ 'is-on': f.id === metricId }">
                <dt>{{ f.label }}</dt>
                <dd>{{ f.text }}</dd>
              </div>
            </dl>
          </template>
          <MiText v-else variant="footnote" tone="label2">Hover, focus or tap a tile to compare a market on every metric.</MiText>
        </article>

        <article class="tm__rank-card">
          <div class="tm__rank-head">
            <MiText variant="subheadline" weight="semibold" as="h3">Top markets · {{ regionLabel }}</MiText>
            <MiText variant="caption" tone="label2" as="span">{{ topShare }}% of {{ regionLabel === 'World' ? 'total' : 'region' }}</MiText>
          </div>
          <ol class="tm__list">
            <li v-for="(t, i) in ranked" :key="t.code">
              <button
                type="button" class="tm__row" :class="{ 'is-active': active === t.code }" :aria-pressed="pinned === t.code"
                @mouseenter="hover = t.code" @mouseleave="hover = ''" @focus="hover = t.code" @blur="hover = ''" @click="pin(t.code)"
              >
                <span class="tm__row-n">{{ i + 1 }}</span>
                <span class="tm__row-name">{{ t.name }}</span>
                <span class="tm__row-val">{{ metric.format(t.value) }}</span>
                <span class="tm__row-bar" aria-hidden="true"><span :style="{ transform: `scaleX(${t.value / (ranked[0]?.value || 1)})` }" /></span>
              </button>
            </li>
          </ol>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type MetricId = 'workspaces' | 'arr' | 'growth'
type Region = 'americas' | 'emea' | 'apac'

const metrics: { value: MetricId, label: string, format: (v: number) => string }[] = [
  { value: 'workspaces', label: 'Workspaces', format: v => v.toLocaleString('en-US') },
  { value: 'arr', label: 'ARR', format: v => (v >= 1000 ? '$' + (v / 1000).toFixed(2) + 'M' : '$' + v + 'k') },
  { value: 'growth', label: '90-day growth', format: v => '+' + v + '%' }
]
const metricId = ref<string | number | null>('workspaces')
const metric = computed(() => metrics.find(m => m.value === metricId.value) ?? metrics[0]!)

const regions = [{ value: 'world', label: 'World' }, { value: 'americas', label: 'Americas' }, { value: 'emea', label: 'EMEA' }, { value: 'apac', label: 'APAC' }]
const region = ref<string | number | null>('world')
const regionLabel = computed(() => regions.find(r => r.value === region.value)?.label ?? 'World')

// Market grid: [code, name, column, row, region]. Columns 0 to 13, rows 0 to 6.
const layout: [string, string, number, number, Region][] = [
  ['CA', 'Canada', 1, 0, 'americas'], ['IS', 'Iceland', 5, 0, 'emea'], ['NO', 'Norway', 7, 0, 'emea'], ['SE', 'Sweden', 8, 0, 'emea'], ['FI', 'Finland', 9, 0, 'emea'],
  ['US', 'United States', 1, 1, 'americas'], ['IE', 'Ireland', 4, 1, 'emea'], ['GB', 'United Kingdom', 5, 1, 'emea'], ['NL', 'Netherlands', 6, 1, 'emea'], ['DE', 'Germany', 7, 1, 'emea'], ['PL', 'Poland', 8, 1, 'emea'], ['UA', 'Ukraine', 9, 1, 'emea'],
  ['MX', 'Mexico', 1, 2, 'americas'], ['PT', 'Portugal', 4, 2, 'emea'], ['ES', 'Spain', 5, 2, 'emea'], ['FR', 'France', 6, 2, 'emea'], ['IT', 'Italy', 7, 2, 'emea'], ['TR', 'Türkiye', 8, 2, 'emea'], ['KZ', 'Kazakhstan', 9, 2, 'apac'], ['CN', 'China', 11, 2, 'apac'], ['KR', 'South Korea', 12, 2, 'apac'], ['JP', 'Japan', 13, 2, 'apac'],
  ['CO', 'Colombia', 2, 3, 'americas'], ['MA', 'Morocco', 5, 3, 'emea'], ['EG', 'Egypt', 7, 3, 'emea'], ['SA', 'Saudi Arabia', 8, 3, 'emea'], ['AE', 'United Arab Emirates', 9, 3, 'emea'], ['IN', 'India', 10, 3, 'apac'], ['TH', 'Thailand', 11, 3, 'apac'], ['PH', 'Philippines', 13, 3, 'apac'],
  ['PE', 'Peru', 2, 4, 'americas'], ['BR', 'Brazil', 3, 4, 'americas'], ['NG', 'Nigeria', 5, 4, 'emea'], ['KE', 'Kenya', 8, 4, 'emea'], ['SG', 'Singapore', 11, 4, 'apac'], ['ID', 'Indonesia', 12, 4, 'apac'],
  ['CL', 'Chile', 2, 5, 'americas'], ['AR', 'Argentina', 3, 5, 'americas'], ['ZA', 'South Africa', 7, 5, 'emea'], ['AU', 'Australia', 12, 5, 'apac'],
  ['NZ', 'New Zealand', 13, 6, 'apac']
]

// Sample figures per market: workspaces, ARR in $k, 90-day growth in %.
const raw: Record<string, Record<MetricId, number>> = Object.fromEntries(([
  ['US', 4820, 3120, 8], ['CA', 760, 410, 11], ['MX', 310, 120, 24], ['CO', 140, 48, 31], ['PE', 60, 18, 12], ['BR', 690, 260, 19], ['CL', 120, 44, 9], ['AR', 180, 52, 6],
  ['IS', 40, 22, 4], ['NO', 410, 290, 7], ['SE', 820, 560, 9], ['FI', 380, 240, 5], ['IE', 520, 380, 14], ['GB', 2960, 2140, 10], ['NL', 1240, 880, 12], ['DE', 3410, 2460, 15],
  ['PL', 640, 260, 22], ['UA', 380, 90, 28], ['PT', 450, 170, 18], ['ES', 1120, 540, 16], ['FR', 2780, 1790, 13], ['IT', 980, 470, 11], ['TR', 340, 110, 26], ['MA', 110, 30, 21],
  ['EG', 160, 40, 27], ['SA', 210, 160, 38], ['AE', 360, 290, 33], ['NG', 260, 60, 36], ['KE', 150, 40, 29], ['ZA', 300, 140, 14],
  ['KZ', 70, 20, 35], ['CN', 120, 80, 3], ['KR', 410, 260, 17], ['JP', 980, 840, 9], ['IN', 1460, 380, 41], ['TH', 190, 60, 19], ['PH', 230, 50, 24], ['SG', 520, 470, 20],
  ['ID', 340, 90, 30], ['AU', 1080, 860, 12], ['NZ', 240, 170, 10]
] as [string, number, number, number][]).map(([c, workspaces, arr, growth]) => [c, { workspaces, arr, growth }]))

// Five-step ramp from the brand color, mixed into the card so it follows light and dark.
const binColors = [14, 30, 50, 74, 100].map(p => `color-mix(in srgb, var(--mi-p) ${p}%, var(--mi-card))`)
const ramp = binColors.map((color, i) => ({ label: `Fifth ${i + 1}`, color }))

// Bins and ranks are world-wide, so switching region never re-colors a tile: it only dims the others.
const tiles = computed(() => {
  const id = (metricId.value ?? 'workspaces') as MetricId
  const sorted = [...layout].sort((a, b) => raw[b[0]]![id] - raw[a[0]]![id])
  return layout.map(([code, name, col, row, reg]) => {
    const rank = sorted.findIndex(s => s[0] === code) + 1
    const bin = 4 - Math.min(4, Math.floor(((rank - 1) / layout.length) * 5))
    return { code, name, col, row, region: reg, value: raw[code]![id], rank, bin, inRegion: region.value === 'world' || region.value === reg }
  })
})

const ranked = computed(() => tiles.value.filter(t => t.inRegion).sort((a, b) => b.value - a.value).slice(0, 7))
const topShare = computed(() => {
  const all = tiles.value.filter(t => t.inRegion).reduce((n, t) => n + t.value, 0)
  return Math.round((ranked.value.reduce((n, t) => n + t.value, 0) / (all || 1)) * 100)
})

// Hover previews a market, a click pins it.
const hover = ref('')
const pinned = ref('DE')
const active = computed(() => hover.value || pinned.value)
const focus = computed(() => tiles.value.find(t => t.code === active.value))
const focusFacts = computed(() => {
  const row = focus.value ? raw[focus.value.code] : undefined
  return row ? metrics.map(m => ({ id: m.value, label: m.label, text: m.format(row[m.value]) })) : []
})
function pin (code: string) { pinned.value = pinned.value === code ? '' : code }
</script>

<style scoped>
.tm { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.tm__head, .tm__map-top { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.tm__map-top { align-items: center; }
.tm__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 900px) { .tm__grid { grid-template-columns: minmax(0, 1fr) 300px; } }

.tm__map { display: grid; gap: 14px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
/* 15 columns: 14 for markets plus room for the half-tile nudge of odd rows. */
.tm__tiles { --tm-gap: 3px; display: grid; grid-template-columns: repeat(15, minmax(0, 1fr)); grid-auto-rows: auto; gap: var(--tm-gap); padding: 6px 0; }
@container (min-width: 520px) { .tm__tiles { --tm-gap: 5px; } }
.tm__tile {
  display: grid; place-items: center; aspect-ratio: 1; min-width: 0; padding: 0; border: 0; border-radius: 22%; cursor: pointer;
  color: var(--mi-label); font: 600 9px/1 var(--mi-font); letter-spacing: .02em;
  transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease);
}
.tm__tile span { display: none; }
@container (min-width: 520px) { .tm__tile span { display: block; } .tm__tile { font-size: 10px; } }
@container (min-width: 760px) { .tm__tile { font-size: 11px; } }
.tm__tile.is-dark { color: var(--mi-p-on); }
.tm__tile.is-odd { transform: translateX(calc(50% + var(--tm-gap) / 2)); }
.tm__tile.is-dim { opacity: .22; }
.tm__tile:hover, .tm__tile.is-active { transform: scale(1.18); box-shadow: 0 0 0 2px var(--mi-card), 0 0 0 4px var(--mi-label); position: relative; z-index: 1; }
.tm__tile.is-odd:hover, .tm__tile.is-odd.is-active { transform: translateX(calc(50% + var(--tm-gap) / 2)) scale(1.18); }
.tm__tile:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

.tm__side { display: grid; gap: 12px; align-content: start; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 600px) and (max-width: 899px) { .tm__side { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.tm__readout, .tm__rank-card { min-width: 0; padding: 16px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tm__readout { display: grid; gap: 12px; align-content: start; min-height: 132px; }
.tm__readout-top { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tm__readout-top > h3 { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tm__code { display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 9px; background: var(--mi-p); color: var(--mi-p-on); font-size: 12px; font-weight: 700; }
.tm__rank { flex: none; font-variant-numeric: tabular-nums; }
.tm__facts { display: grid; gap: 2px; margin: 0; }
.tm__facts > div { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 10px; border-radius: var(--mi-radius-m); }
.tm__facts > div.is-on { background: var(--mi-p-tint); }
.tm__facts dt { font-size: 13px; color: var(--mi-label2); }
.tm__facts > div.is-on dt { color: var(--mi-p-text); font-weight: 600; }
.tm__facts dd { margin: 0; font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }

.tm__rank-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 10px; margin-bottom: 6px; }
.tm__list { display: grid; margin: 0; padding: 0; list-style: none; }
.tm__row {
  display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; grid-template-areas: "n name val" ". bar bar"; align-items: center; gap: 4px 10px;
  width: 100%; padding: 7px 8px; border: 0; border-radius: var(--mi-radius-m); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer;
  transition: background-color var(--mi-dur-2) var(--mi-ease);
}
.tm__row:hover, .tm__row.is-active { background: var(--mi-fill4); }
.tm__row:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.tm__row-n { grid-area: n; font-size: 12px; font-weight: 600; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.tm__row-name { grid-area: name; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
.tm__row-val { grid-area: val; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.tm__row-bar { grid-area: bar; height: 3px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.tm__row-bar span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
@media (prefers-reduced-motion: reduce) { .tm__tile, .tm__row-bar span { transition: none; } }
</style>
