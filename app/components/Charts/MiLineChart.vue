<script setup lang="ts">
/** Line chart of series over shared categories, with area fills and a chart/table toggle. Series: { name, data, color?, area? }[]. */
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import MiChartCard from './MiChartCard.vue'
import MiChartLegend from './MiChartLegend.vue'
import MiChartTable from './MiChartTable.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import type { MiTableColumn } from './MiChartTable.vue'
import { miChartColor, miChartNeutral } from '../../utils/miChartPalette'
import { miDodge, miLinePath, miNiceScale, miRound1 } from '../../utils/miChartMath'

export interface MiLineSeries {
  name: string
  data: number[]
  color?: string
  /** Fill under the line. Defaults to the chart `area` mode. */
  area?: boolean
}

const props = withDefaults(defineProps<{
  /** X-axis labels, one per data point in each series. */
  categories: string[]
  /** Lines as { name, data: number[], color?, area? }[]. */
  series: MiLineSeries[]
  /** Heading shown above the chart inside the card. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Wraps the chart in the elevated card surface; turn off to embed it in your own container. */
  card?: boolean
  /** Suffix for axis ticks and the default value format, e.g. "K". */
  unit?: string
  /** Fixed bottom of the value axis; defaults to 0. */
  min?: number
  /** Fixed top of the value axis; defaults to a nice scale over the data. */
  max?: number
  /** Number of axis intervals. */
  ticks?: number
  /** Plot height in px. */
  height?: number
  /** Which series get an area fill. */
  area?: 'first' | 'all' | 'none'
  /** Direct labels at the end of each line. */
  endLabels?: boolean
  /** Show the legend (from 2 series up) and the chart/table toggle in the header. */
  toolbar?: boolean
  /** Lets users switch between the chart and an accessible data table. */
  toggle?: boolean
  /** Draws the lines in on mount. */
  animate?: boolean
  /** Header of the first table column, which lists the categories. */
  categoryLabel?: string
  /** Label of the chart option in the view toggle. */
  chartLabel?: string
  /** Label of the table option in the view toggle. */
  tableLabel?: string
  /** Custom text for a value in tooltips, end labels and the table; replaces the default value plus unit. */
  formatValue?: (value: number, series: MiLineSeries) => string
  /** Formats category names in the tooltip and table. */
  formatCategory?: (category: string, index: number) => string
  /** Accessible description of the chart; a generated summary is used when omitted. */
  ariaLabel?: string
}>(), {
  card: true,
  unit: '',
  ticks: 4,
  height: 256,
  area: 'first',
  endLabels: true,
  toolbar: true,
  toggle: true,
  animate: true,
  categoryLabel: 'Category',
  chartLabel: 'Chart',
  tableLabel: 'Table'
})

const emit = defineEmits<{ hover: [index: number] }>()
/** Active view: the `chart` or its data `table`. */
const view = defineModel<'chart' | 'table'>('view', { default: 'chart' })

const uid = useId()
/* Plot width in px, tracked with one ResizeObserver so text keeps its real size on narrow screens. */
const W = ref(780)
const plotEl = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
watch(plotEl, (el) => {
  ro?.disconnect()
  if (!el || typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver((entries) => {
    const w = Math.round(entries[0]?.contentRect.width ?? 0)
    if (w >= 200 && w !== W.value) W.value = Math.min(w, 1200)
  })
  ro.observe(el)
})
const X0 = 44
const yT = 12
const x1 = computed(() => (props.endLabels ? W.value - 80 : W.value - 16))
const yB = computed(() => props.height - 28)
const n = computed(() => props.categories.length)
const step = computed(() => (n.value > 1 ? (x1.value - X0) / (n.value - 1) : 0))
const X = (i: number) => miRound1(n.value > 1 ? X0 + i * step.value : (X0 + x1.value) / 2)

const dataMax = computed(() => Math.max(0, ...props.series.flatMap(s => s.data)))
const scale = computed(() => {
  const lo = props.min ?? 0
  if (props.max === undefined) return miNiceScale(dataMax.value, props.ticks, lo)
  const hi = props.max
  return { min: lo, max: hi, ticks: Array.from({ length: props.ticks + 1 }, (_, i) => miRound1(lo + (i * (hi - lo)) / props.ticks)) }
})
const Y = (v: number) => {
  const span = scale.value.max - scale.value.min || 1
  return miRound1(yT + (1 - (v - scale.value.min) / span) * (yB.value - yT))
}

const fmt = (v: number, s: MiLineSeries) => (props.formatValue ? props.formatValue(v, s) : `${v}${props.unit}`)
const colorOf = (i: number) => props.series[i]?.color ?? miChartColor(i)
const tickRows = computed(() => scale.value.ticks.map(v => ({ y: Y(v), ty: Y(v) + 4, label: v ? `${v}${props.unit}` : '0' })))
const catX = computed(() => {
  const every = Math.max(1, Math.ceil(40 / (step.value || 40)))
  const last = props.categories.length - 1
  /* Thin the labels so they never collide; keep the last one and drop its neighbours. */
  return props.categories.flatMap((c, i) => (i % every === 0 && (every === 1 || i === last || last - i >= every) ? [{ x: X(i), label: c }] : []))
})
const lines = computed(() => props.series.map((s, i) => {
  const pts = s.data.map((v, k) => [X(k), Y(v)] as [number, number])
  const d = miLinePath(pts)
  const wantsArea = s.area ?? (props.area === 'all' || (props.area === 'first' && i === 0))
  const last = pts[pts.length - 1]
  return {
    name: s.name,
    color: colorOf(i),
    d,
    area: wantsArea && pts.length ? `${d} L${X(s.data.length - 1)} ${yB.value} L${X(0)} ${yB.value} Z` : '',
    endX: last?.[0] ?? 0,
    endY: last?.[1] ?? 0,
    endText: s.data.length ? `${s.name} ${fmt(s.data[s.data.length - 1]!, s)}` : s.name
  }
}))
const labelYs = computed(() => miDodge(lines.value.map(l => l.endY + 4), 15, yT + 4, yB.value))
const cols = computed(() => props.categories.map((_, i) => ({ x: miRound1(X(i) - step.value / 2), w: miRound1(step.value || x1.value - X0) })))
const legendItems = computed<MiLegendItem[]>(() => props.series.map((s, i) => ({ label: s.name, color: colorOf(i), shape: 'line' })))

const description = computed(() => props.ariaLabel ?? `Line chart. ${props.series.map(s => (s.data.length ? `${s.name} goes from ${fmt(s.data[0]!, s)} to ${fmt(s.data[s.data.length - 1]!, s)}` : s.name)).join('; ')}.`)
const tableColumns = computed<MiTableColumn[]>(() => [
  { key: 'c', label: props.categoryLabel, align: 'left' },
  ...props.series.map((s, i) => ({ key: `s${i}`, label: s.name, align: 'right' as const }))
])
const tableRows = computed(() => props.categories.map((c, i) => {
  const row: Record<string, string | number> = { c: props.formatCategory ? props.formatCategory(c, i) : c }
  props.series.forEach((s, k) => { row[`s${k}`] = s.data[i] === undefined ? '' : fmt(s.data[i]!, s) })
  return row
}))

/* Hover: one delegated handler, rAF throttled; the crosshair moves with transforms only. */
const hl = ref(-1)
const shown = ref(0)
const glide = ref(false)
const live = ref('')
let raf = 0
let pending = -1

const tipTitle = computed(() => {
  const i = shown.value
  const c = props.categories[i] ?? ''
  return props.formatCategory ? props.formatCategory(c, i) : c
})

function commit(i: number, announce: boolean) {
  glide.value = hl.value >= 0 && i >= 0
  hl.value = i
  if (i >= 0) {
    shown.value = i
    if (announce) live.value = `${tipTitle.value}: ${props.series.map(s => `${s.name} ${s.data[i] === undefined ? '' : fmt(s.data[i]!, s)}`).join(', ')}`
  }
  emit('hover', i)
}
function flush() { raf = 0; if (pending !== hl.value) commit(pending, false) }
function schedule(i: number) {
  pending = i
  if (!raf) raf = requestAnimationFrame(flush)
}
function onMove(e: PointerEvent) {
  const i = (e.target as SVGElement).dataset?.i
  if (i !== undefined) schedule(Number(i))
}
function onKey(e: KeyboardEvent) {
  const last = n.value - 1
  if (last < 0) return
  let i = hl.value
  if (e.key === 'ArrowRight') i = i < 0 ? 0 : Math.min(last, i + 1)
  else if (e.key === 'ArrowLeft') i = i < 0 ? last : Math.max(0, i - 1)
  else if (e.key === 'Home') i = 0
  else if (e.key === 'End') i = last
  else if (e.key === 'Escape') { e.preventDefault(); commit(-1, false); live.value = ''; return }
  else return
  e.preventDefault()
  commit(i, true)
}

const tipRatio = computed(() => X(shown.value) / W.value)
const flip = computed(() => shown.value > (n.value - 1) / 2)

function onToggleKey(e: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
  e.preventDefault()
  view.value = view.value === 'chart' ? 'table' : 'chart'
  queueMicrotask(() => document.getElementById(`${uid}-${view.value}`)?.focus())
}

onBeforeUnmount(() => { ro?.disconnect(); if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <MiChartCard :title="title" :subtitle="subtitle" :surface="card">
    <template v-if="toolbar && (series.length > 1 || toggle)" #actions>
      <MiChartLegend v-if="series.length > 1" :items="legendItems" />
      <span v-if="toggle" class="mi-lc-seg" role="radiogroup" aria-label="Display" @keydown="onToggleKey">
        <span class="mi-lc-thumb" :class="{ 'is-table': view === 'table' }" aria-hidden="true" />
        <button :id="`${uid}-chart`" type="button" role="radio" :aria-checked="view === 'chart'" :tabindex="view === 'chart' ? 0 : -1" @click="view = 'chart'">{{ chartLabel }}</button>
        <button :id="`${uid}-table`" type="button" role="radio" :aria-checked="view === 'table'" :tabindex="view === 'table' ? 0 : -1" @click="view = 'table'">{{ tableLabel }}</button>
      </span>
    </template>

    <div
      v-if="view === 'chart'"
      ref="plotEl"
      class="mi-lc-plot"
      tabindex="0"
      role="group"
      :aria-label="`${description} Use the left and right arrow keys to read each point.`"
      @pointermove="onMove"
      @pointerdown="onMove"
      @pointerleave="schedule(-1)"
      @keydown="onKey"
      @blur="commit(-1, false)"
    >
      <svg class="mi-lc-svg" :viewBox="`0 0 ${W} ${height}`" width="100%" role="img" :aria-label="description">
        <g>
          <template v-for="(t, i) in tickRows" :key="i">
            <line :x1="X0" :x2="x1" :y1="t.y" :y2="t.y" stroke-width="1" class="mi-lc-gridline" />
            <text :x="X0 - 10" :y="t.ty" text-anchor="end" font-size="11" class="mi-lc-axis">{{ t.label }}</text>
          </template>
          <text v-for="(c, i) in catX" :key="i" :x="c.x" :y="height - 6" text-anchor="middle" font-size="11" class="mi-lc-axis">{{ c.label }}</text>
        </g>
        <template v-for="(l, i) in lines" :key="`a${i}`">
          <path v-if="l.area" class="mi-lc-area" :class="{ 'is-anim': animate }" :d="l.area" :style="{ fill: l.color }" fill-opacity=".1" />
        </template>
        <path
          v-for="(l, i) in lines.slice().reverse()"
          :key="`l${i}`"
          class="mi-lc-line"
          :class="{ 'is-anim': animate }"
          :d="l.d"
          pathLength="1"
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
          :style="{ stroke: l.color }"
        />
        <g class="mi-lc-ends" :class="{ 'is-anim': animate }">
          <circle v-for="(l, i) in lines" :key="`e${i}`" :cx="l.endX" :cy="l.endY" r="4" stroke-width="2" :style="{ fill: l.color, stroke: 'var(--mi-card)' }" />
          <template v-if="endLabels">
            <text v-for="(l, i) in lines" :key="`t${i}`" :x="x1 + 12" :y="labelYs[i]" font-size="12" font-weight="600" class="mi-lc-endtext">{{ l.endText }}</text>
          </template>
        </g>
        <g class="mi-lc-cross" :class="{ 'is-on': hl >= 0, 'is-glide': glide }" :style="{ transform: `translateX(${X(shown)}px)` }">
          <line x1="0" x2="0" :y1="yT" :y2="yB" stroke-width="1" :style="{ stroke: miChartNeutral }" />
          <circle
            v-for="(l, i) in lines"
            :key="`h${i}`"
            class="mi-lc-dot"
            cx="0"
            cy="0"
            r="5"
            stroke-width="2"
            :style="{ fill: l.color, stroke: 'var(--mi-card)', transform: `translateY(${Y(series[i]!.data[shown] ?? 0)}px)` }"
          />
        </g>
        <rect v-for="(c, i) in cols" :key="`c${i}`" :data-i="i" :x="c.x" y="0" :width="c.w" :height="yB + 4" fill="transparent" />
      </svg>
      <div class="mi-lc-tip" :class="{ 'is-on': hl >= 0 }" aria-hidden="true" :style="{ '--mi-lc-r': tipRatio }">
        <div class="mi-lc-tip-in" :class="{ 'is-flip': flip }">
          <span class="mi-lc-tip-title">{{ tipTitle }}</span>
          <span v-for="(s, i) in series" :key="i" class="mi-lc-tip-row">
            <span class="mi-lc-tip-sw" :style="{ background: colorOf(i) }" />
            <span class="mi-lc-tip-name">{{ s.name }}</span>
            <span class="mi-lc-tip-val">{{ s.data[shown] === undefined ? '' : fmt(s.data[shown]!, s) }}</span>
          </span>
        </div>
      </div>
      <span class="mi-lc-sr" role="status" aria-live="polite">{{ live }}</span>
    </div>
    <MiChartTable v-else :columns="tableColumns" :rows="tableRows" :caption="description" />
  </MiChartCard>
</template>

<style scoped>
.mi-lc-seg{position:relative;display:inline-grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;padding:2px;border-radius:8px;background:var(--mi-fill3)}
.mi-lc-seg button{position:relative;z-index:1;height:26px;padding:0 12px;border:0;border-radius:6px;background:transparent;color:var(--mi-label);font-family:var(--mi-font);font-size:12px;font-weight:600}
.mi-lc-thumb{position:absolute;top:2px;bottom:2px;left:2px;width:calc((100% - 6px) / 2);border-radius:6px;background:var(--mi-seg);box-shadow:0 1px 3px rgba(0,0,0,.14);transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-lc-thumb.is-table{transform:translate3d(calc(100% + 2px),0,0)}
.mi-lc-plot{position:relative;container-type:inline-size;border-radius:10px;touch-action:pan-y;font-family:var(--mi-font);color:var(--mi-label)}
.mi-lc-svg{display:block;overflow:visible;height:auto}
.mi-lc-gridline{stroke:var(--mi-sep)}
.mi-lc-axis{fill:var(--mi-label2)}
.mi-lc-endtext{fill:var(--mi-label)}
.mi-lc-line.is-anim{stroke-dasharray:1 1;animation:mi-lc-draw 900ms var(--mi-ease) both}
.mi-lc-area.is-anim,.mi-lc-ends.is-anim{animation:mi-lc-fade var(--mi-dur-4) var(--mi-ease) 400ms both}
.mi-lc-cross{opacity:0;pointer-events:none;transition:opacity var(--mi-dur-1) ease}
.mi-lc-cross.is-on{opacity:1}
.mi-lc-cross.is-glide{transition:transform var(--mi-dur-1) var(--mi-ease),opacity var(--mi-dur-1) ease}
.mi-lc-cross.is-glide .mi-lc-dot{transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-lc-tip{position:absolute;top:-6px;left:0;pointer-events:none;opacity:0;transform:translate3d(calc(var(--mi-lc-r) * 100cqw),0,0);transition:opacity var(--mi-dur-1) ease}
.mi-lc-tip.is-on{opacity:1}
.mi-lc-tip-in{min-width:150px;padding:10px 12px;border-radius:10px;background:var(--mi-elev);box-shadow:var(--mi-sh2);display:flex;flex-direction:column;gap:6px;font-size:13px;transform:translate3d(12px,0,0)}
.mi-lc-tip-in.is-flip{transform:translate3d(calc(-100% - 12px),0,0)}
.mi-lc-tip-title{font-weight:600}
.mi-lc-tip-row{display:flex;align-items:center;gap:8px}
.mi-lc-tip-sw{width:10px;height:3px;border-radius:2px;flex:none}
.mi-lc-tip-name{flex:1;color:var(--mi-label2)}
.mi-lc-tip-val{font-weight:600;font-variant-numeric:tabular-nums}
.mi-lc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes mi-lc-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes mi-lc-fade{from{opacity:0}to{opacity:1}}
</style>
