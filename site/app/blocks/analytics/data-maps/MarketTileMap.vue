<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="tm-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="tm-title" variant="title3" as="h2" weight="semibold">Where customers are</MiText>
        <MiText variant="footnote" tone="label2">Paying workspaces by market · October</MiText>
      </div>
      <MiSegmented v-model="metricId" label="Metric" :options="metrics" />
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[900px]:grid-cols-[minmax(0,_1fr)_300px]">
      <article class="mi:grid mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3 mi:items-center">
          <MiSegmented v-model="region" label="Region" :options="regions" />
          <MiChartLegend variant="ramp" :items="ramp" less-label="Fewer" more-label="More" :aria-label="`${metric.label} scale, in fifths`" />
        </div>

        <!-- Tile map: one tile per market, odd rows nudged half a tile for a hex rhythm. No geodata needed. -->
        <div class="mi:[--tm-gap:3px] mi:grid mi:grid-cols-15 mi:auto-rows-[auto] mi:gap-(--tm-gap) mi:py-1.5 mi:px-0 mi:@[520px]:[--tm-gap:5px]" role="group" :aria-label="`${metric.label} by market`">
          <button
            v-for="t in tiles" :key="t.code" type="button" class="mi:grid mi:place-items-center mi:aspect-[1] mi:min-w-0 mi:p-0 mi:[border:0] mi:rounded-[22%] mi:cursor-pointer mi:[font:600_9px/1_var(--mi-font)] mi:tracking-[.02em] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:@[520px]:text-[10px] mi:@[760px]:text-[11px] mi:hover:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-label)] mi:hover:relative mi:hover:z-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:motion-reduce:[transition:none]"
            :class="[t.bin >= 3 ? 'mi:text-p-on' : 'mi:text-label', t.inRegion ? '' : 'mi:opacity-22', active === t.code ? 'mi:shadow-[0_0_0_2px_var(--mi-card),_0_0_0_4px_var(--mi-label)] mi:relative mi:z-1' : '', active === t.code ? (t.row % 2 === 1 ? 'mi:transform-[translateX(calc(50%_+_var(--tm-gap)_/_2))_scale(1.18)]' : 'mi:transform-[scale(1.18)]') : (t.row % 2 === 1 ? 'mi:transform-[translateX(calc(50%_+_var(--tm-gap)_/_2))] mi:hover:transform-[translateX(calc(50%_+_var(--tm-gap)_/_2))_scale(1.18)]' : 'mi:hover:transform-[scale(1.18)]')]"
            :style="{ gridColumn: t.col + 1, gridRow: t.row + 1, background: binColors[t.bin] }"
            :aria-label="`${t.name}, ${metric.format(t.value)}, rank ${t.rank} of ${tiles.length}`" :aria-pressed="pinned === t.code"
            @mouseenter="hover = t.code" @mouseleave="hover = ''" @focus="hover = t.code" @blur="hover = ''" @click="pin(t.code)"
          >
            <span class="mi:hidden mi:@[520px]:block" aria-hidden="true">{{ t.code }}</span>
          </button>
        </div>
        <MiText variant="caption" tone="label3">One tile per market, placed by rough geography. Tile size says nothing about country size.</MiText>
      </article>

      <aside class="mi:grid mi:gap-3 mi:content-start mi:grid-cols-[minmax(0,_1fr)] mi:[@container_(min-width:_600px)_and_(max-width:_899px)]:grid-cols-2">
        <article class="mi:min-w-0 mi:py-4 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:grid mi:gap-3 mi:content-start mi:min-h-33" aria-live="polite">
          <template v-if="focus">
            <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
              <span class="mi:grid mi:place-items-center mi:flex-[none] mi:w-8.5 mi:h-8.5 mi:rounded-[9px] mi:bg-p mi:text-p-on mi:text-[12px] mi:font-bold">{{ focus.code }}</span>
              <MiText class="mi:overflow-hidden mi:whitespace-nowrap mi:flex-1 mi:min-w-0 mi:text-ellipsis" variant="headline" as="h3">{{ focus.name }}</MiText>
              <MiText variant="caption" tone="label2" as="span" class="mi:tabular-nums mi:flex-[none]">#{{ focus.rank }}</MiText>
            </div>
            <dl class="mi:grid mi:gap-0.5 mi:m-0">
              <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-2.5 mi:rounded-md" v-for="f in focusFacts" :key="f.id" :class="f.id === metricId ? 'mi:bg-p-tint' : ''">
                <dt class="mi:text-[13px]" :class="f.id === metricId ? 'mi:text-p-text mi:font-semibold' : 'mi:text-label2'">{{ f.label }}</dt>
                <dd class="mi:tabular-nums mi:m-0 mi:text-[15px] mi:font-bold">{{ f.text }}</dd>
              </div>
            </dl>
          </template>
          <MiText v-else variant="footnote" tone="label2">Hover, focus or tap a tile to compare a market on every metric.</MiText>
        </article>

        <article class="mi:min-w-0 mi:py-4 mi:px-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-2.5 mi:mb-1.5">
            <MiText variant="subheadline" weight="semibold" as="h3">Top markets · {{ regionLabel }}</MiText>
            <MiText variant="caption" tone="label2" as="span">{{ topShare }}% of {{ regionLabel === 'World' ? 'total' : 'region' }}</MiText>
          </div>
          <ol class="mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
            <li v-for="(t, i) in ranked" :key="t.code">
              <button
                type="button" class="mi:grid mi:grid-cols-[18px_minmax(0,_1fr)_auto] mi:[grid-template-areas:'n_name_val'_'._bar_bar'] mi:items-center mi:gap-y-1 mi:gap-x-2.5 mi:w-full mi:py-[7px] mi:px-2 mi:[border:0] mi:rounded-md mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[transition:background-color_var(--mi-dur-2)_var(--mi-ease)] mi:hover:bg-fill4 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :class="active === t.code ? 'mi:bg-fill4' : 'mi:bg-transparent'" :aria-pressed="pinned === t.code"
                @mouseenter="hover = t.code" @mouseleave="hover = ''" @focus="hover = t.code" @blur="hover = ''" @click="pin(t.code)"
              >
                <span class="mi:[grid-area:n] mi:text-[12px] mi:font-semibold mi:text-label3 mi:tabular-nums">{{ i + 1 }}</span>
                <span class="mi:[grid-area:name] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap mi:text-[14px] mi:font-medium">{{ t.name }}</span>
                <span class="mi:[grid-area:val] mi:text-[13px] mi:font-semibold mi:tabular-nums">{{ metric.format(t.value) }}</span>
                <span class="mi:[grid-area:bar] mi:h-[3px] mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true"><span class="mi:block mi:h-full mi:bg-p mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :style="{ transform: `scaleX(${t.value / (ranked[0]?.value || 1)})` }" /></span>
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
