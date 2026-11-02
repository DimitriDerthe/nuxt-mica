<script setup lang="ts">
/** Scatter or bubble chart of points on two numeric axes, with nice ticks, optional bubble size, tooltip, keyboard reading and a chart/table toggle. Series: { name, points: { x, y, r? }[], color? }[]. */
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import MiChartCard from './MiChartCard.vue'
import MiChartLegend from './MiChartLegend.vue'
import MiChartTable from './MiChartTable.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import type { MiChartTableColumn } from './MiChartTable.vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miNiceScale, miRound1 } from '../../utils/miChartMath'

export interface MiScatterPoint {
  x: number
  y: number
  /** Bubble size value; mapped to the area of the circle. Omit on all points for a plain scatter. */
  r?: number
}
export interface MiScatterSeries {
  name: string
  points: MiScatterPoint[]
  color?: string
}

const props = withDefaults(defineProps<{
  /** Point groups as { name, points: { x, y, r? }[], color? }[]. */
  series: MiScatterSeries[]
  /** Heading shown above the chart inside the card. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Wraps the chart in the elevated card surface; turn off to embed it in your own container. */
  card?: boolean
  /** Title of the horizontal axis, drawn under it. */
  xLabel?: string
  /** Title of the vertical axis, drawn above it. */
  yLabel?: string
  /** Suffix for horizontal ticks and values, e.g. "kg". */
  xUnit?: string
  /** Suffix for vertical ticks and values, e.g. "%". */
  yUnit?: string
  /** Label for the bubble size in the tooltip and table. */
  sizeLabel?: string
  /** Number of axis intervals. */
  ticks?: number
  /** Plot height in px. */
  height?: number
  /** Radius of a plain point in px when no point has a size. */
  dotSize?: number
  /** Largest bubble radius in px. */
  maxRadius?: number
  /** Show the legend (from 2 series up) and the chart/table toggle in the header. */
  toolbar?: boolean
  /** Lets users switch between the chart and an accessible data table. */
  toggle?: boolean
  /** Fades the points in on mount. */
  animate?: boolean
  /** Header of the series column in the table. */
  seriesLabel?: string
  /** Label of the chart option in the view toggle. */
  chartLabel?: string
  /** Label of the table option in the view toggle. */
  tableLabel?: string
  /** Custom text for a coordinate in the tooltip and table; replaces the default number plus unit. */
  formatValue?: (value: number, axis: 'x' | 'y' | 'r', series: MiScatterSeries) => string
  /** Accessible description of the chart; a generated summary is used when omitted. */
  ariaLabel?: string
}>(), {
  card: true,
  xUnit: '',
  yUnit: '',
  sizeLabel: 'Size',
  ticks: 5,
  height: 300,
  dotSize: 5,
  maxRadius: 22,
  toolbar: true,
  toggle: true,
  animate: true,
  seriesLabel: 'Series',
  chartLabel: 'Chart',
  tableLabel: 'Table'
})

const emit = defineEmits<{ hover: [point: { series: number, index: number } | null] }>()
/** Active view: the `chart` or its data `table`. */
const view = defineModel<'chart' | 'table'>('view', { default: 'chart' })

const uid = useId()
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

interface Flat { k: number, s: number, p: number, x: number, y: number, r?: number }
const flat = computed<Flat[]>(() => {
  const out: Omit<Flat, 'k'>[] = []
  props.series.forEach((s, si) => s.points.forEach((pt, pi) => {
    if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) out.push({ s: si, p: pi, x: pt.x, y: pt.y, r: pt.r })
  }))
  return out.map((f, k) => ({ ...f, k }))
})
/* Reading order for the keyboard: left to right, then bottom to top. */
const reading = computed(() => flat.value.slice().sort((a, b) => a.x - b.x || a.y - b.y).map(f => f.k))

/** Nice axis range covering [lo, hi] with about `n` intervals; includes 0 when the data is non-negative. */
function axis(lo: number, hi: number, n: number) {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return miNiceScale(1, n, 0)
  if (lo >= 0 && lo <= hi * 0.4) lo = 0
  if (hi === lo) hi = lo + 1
  const base = miNiceScale(hi - lo, n, 0)
  const step = base.step
  const min = Math.floor(lo / step + 1e-9) * step
  const intervals = Math.max(1, Math.ceil((hi - min) / step - 1e-9))
  const ticks = Array.from({ length: intervals + 1 }, (_, i) => miRound1(min + i * step))
  return { min: ticks[0]!, max: ticks[intervals]!, step, ticks }
}
const xs = computed(() => axis(Math.min(...flat.value.map(f => f.x)), Math.max(...flat.value.map(f => f.x)), props.ticks))
const ys = computed(() => axis(Math.min(...flat.value.map(f => f.y)), Math.max(...flat.value.map(f => f.y)), props.ticks - 1))

const hasSize = computed(() => flat.value.some(f => f.r !== undefined))
const rMax = computed(() => Math.max(0, ...flat.value.map(f => f.r ?? 0)))
const radiusOf = (r: number | undefined) => {
  if (!hasSize.value) return props.dotSize
  if (r === undefined || !rMax.value) return 4
  return miRound1(4 + Math.sqrt(Math.max(0, r) / rMax.value) * (props.maxRadius - 4))
}

const X0 = 48
const yT = computed(() => (props.yLabel ? 28 : 14))
const x1 = computed(() => W.value - 20)
const yB = computed(() => props.height - (props.xLabel ? 46 : 28))
const X = (v: number) => miRound1(X0 + ((v - xs.value.min) / (xs.value.max - xs.value.min || 1)) * (x1.value - X0))
const Y = (v: number) => miRound1(yT.value + (1 - (v - ys.value.min) / (ys.value.max - ys.value.min || 1)) * (yB.value - yT.value))

const colorOf = (i: number) => props.series[i]?.color ?? miChartColor(i)
const fmt = (v: number, axisName: 'x' | 'y' | 'r', s: MiScatterSeries) => {
  if (props.formatValue) return props.formatValue(v, axisName, s)
  const u = axisName === 'x' ? props.xUnit : axisName === 'y' ? props.yUnit : ''
  return `${v.toLocaleString('en-US')}${u}`
}
const tickX = computed(() => xs.value.ticks.map(v => ({ x: X(v), label: `${v.toLocaleString('en-US')}${props.xUnit}` })))
const tickY = computed(() => ys.value.ticks.map(v => ({ y: Y(v), ty: Y(v) + 4, label: `${v.toLocaleString('en-US')}${props.yUnit}` })))

/* Draw big bubbles first so small ones stay visible on top. */
const drawn = computed(() => flat.value.map(f => ({ ...f, cx: X(f.x), cy: Y(f.y), rad: radiusOf(f.r), color: colorOf(f.s) })).sort((a, b) => b.rad - a.rad))
const legendItems = computed<MiLegendItem[]>(() => props.series.map((s, i) => ({ label: s.name, color: colorOf(i), shape: 'dot' })))

const description = computed(() => props.ariaLabel ?? `${hasSize.value ? 'Bubble' : 'Scatter'} chart. ${props.series.map(s => `${s.name}: ${s.points.length} point${s.points.length === 1 ? '' : 's'}`).join('; ')}.`)

const tableColumns = computed<MiChartTableColumn[]>(() => [
  { key: 's', label: props.seriesLabel, align: 'left' },
  { key: 'x', label: props.xLabel || 'X', align: 'right' },
  { key: 'y', label: props.yLabel || 'Y', align: 'right' },
  ...(hasSize.value ? [{ key: 'r', label: props.sizeLabel, align: 'right' as const }] : [])
])
const tableRows = computed(() => flat.value.map((f) => {
  const s = props.series[f.s]!
  const row: Record<string, string | number> = { s: s.name, x: fmt(f.x, 'x', s), y: fmt(f.y, 'y', s) }
  if (hasSize.value) row.r = f.r === undefined ? '' : fmt(f.r, 'r', s)
  return row
}))

/* Hover: one delegated, rAF throttled handler; hit circles carry data-k. */
const hl = ref(-1)
const shown = ref(0)
const live = ref('')
let raf = 0
let pending = -1
const cur = computed(() => flat.value[shown.value])

function describePoint(f: Flat): string {
  const s = props.series[f.s]!
  return `${s.name}: ${fmt(f.x, 'x', s)}, ${fmt(f.y, 'y', s)}${f.r !== undefined ? `, ${props.sizeLabel.toLowerCase()} ${fmt(f.r, 'r', s)}` : ''}`
}
function commit(k: number, announce: boolean) {
  if (k === hl.value) return
  hl.value = k
  const f = flat.value[k]
  if (f) {
    shown.value = k
    if (announce) live.value = describePoint(f)
  }
  emit('hover', f ? { series: f.s, index: f.p } : null)
}
function flush() { raf = 0; commit(pending, false) }
function schedule(k: number) {
  pending = k
  if (!raf) raf = requestAnimationFrame(flush)
}
function onMove(e: PointerEvent) {
  const k = (e.target as SVGElement).dataset?.k
  schedule(k === undefined ? -1 : Number(k))
}
function onKey(e: KeyboardEvent) {
  const o = reading.value
  if (!o.length) return
  const at = o.indexOf(hl.value)
  let next: number
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = at < 0 ? 0 : Math.min(o.length - 1, at + 1)
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = at < 0 ? o.length - 1 : Math.max(0, at - 1)
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = o.length - 1
  else if (e.key === 'Escape') { e.preventDefault(); commit(-1, false); live.value = ''; return }
  else return
  e.preventDefault()
  commit(o[next]!, true)
}

const tipLeft = computed(() => (cur.value ? X(cur.value.x) / W.value : 0))
const tipTop = computed(() => (cur.value ? Y(cur.value.y) - (hl.value >= 0 ? radiusOf(cur.value.r) : 0) : 0))
const flip = computed(() => tipLeft.value > 0.6)

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
      <span v-if="toggle" class="mi-sc-seg" role="radiogroup" aria-label="Display" @keydown="onToggleKey">
        <span class="mi-sc-thumb" :class="{ 'is-table': view === 'table' }" aria-hidden="true" />
        <button :id="`${uid}-chart`" type="button" role="radio" :aria-checked="view === 'chart'" :tabindex="view === 'chart' ? 0 : -1" @click="view = 'chart'">{{ chartLabel }}</button>
        <button :id="`${uid}-table`" type="button" role="radio" :aria-checked="view === 'table'" :tabindex="view === 'table' ? 0 : -1" @click="view = 'table'">{{ tableLabel }}</button>
      </span>
    </template>

    <div
      v-if="view === 'chart'"
      ref="plotEl"
      class="mi-sc-plot"
      tabindex="0"
      role="group"
      :aria-label="`${description} Use the arrow keys to read each point.`"
      @pointermove="onMove"
      @pointerdown="onMove"
      @pointerleave="schedule(-1)"
      @keydown="onKey"
      @blur="commit(-1, false)"
    >
      <svg class="mi-sc-svg" :viewBox="`0 0 ${W} ${height}`" width="100%" role="img" :aria-label="description">
        <g>
          <template v-for="(t, i) in tickY" :key="`y${i}`">
            <line :x1="X0" :x2="x1" :y1="t.y" :y2="t.y" stroke-width="1" class="mi-sc-grid" />
            <text :x="X0 - 10" :y="t.ty" text-anchor="end" font-size="11" class="mi-sc-axis">{{ t.label }}</text>
          </template>
          <template v-for="(t, i) in tickX" :key="`x${i}`">
            <line :x1="t.x" :x2="t.x" :y1="yT" :y2="yB" stroke-width="1" class="mi-sc-grid mi-sc-grid--v" />
            <text :x="t.x" :y="yB + 18" text-anchor="middle" font-size="11" class="mi-sc-axis">{{ t.label }}</text>
          </template>
          <text v-if="yLabel" :x="X0 - 38" y="12" font-size="11" font-weight="600" class="mi-sc-axis">{{ yLabel }}</text>
          <text v-if="xLabel" :x="(X0 + x1) / 2" :y="height - 8" text-anchor="middle" font-size="11" font-weight="600" class="mi-sc-axis">{{ xLabel }}</text>
        </g>
        <g class="mi-sc-pts">
          <circle
            v-for="d in drawn"
            :key="d.k"
            class="mi-sc-dot"
            :class="{ 'is-on': hl === d.k, 'is-anim': animate }"
            :cx="d.cx"
            :cy="d.cy"
            :r="d.rad"
            stroke-width="1.5"
            :style="{ fill: d.color, stroke: d.color, '--mi-sc-delay': `${Math.min(d.k, 40) * 12}ms` }"
          />
        </g>
        <g class="mi-sc-hits">
          <circle v-for="d in drawn" :key="`h${d.k}`" :data-k="d.k" :cx="d.cx" :cy="d.cy" :r="Math.max(d.rad, 9)" fill="transparent" />
        </g>
      </svg>
      <div v-if="cur" class="mi-sc-tip" :class="{ 'is-on': hl >= 0 }" aria-hidden="true" :style="{ '--mi-sc-l': tipLeft, '--mi-sc-t': `${tipTop}px` }">
        <div class="mi-sc-tip-in" :class="{ 'is-flip': flip }">
          <span class="mi-sc-tip-title"><span class="mi-sc-tip-sw" :style="{ background: colorOf(cur.s) }" />{{ series[cur.s]!.name }}</span>
          <span class="mi-sc-tip-row"><span class="mi-sc-tip-name">{{ xLabel || 'X' }}</span><span class="mi-sc-tip-val">{{ fmt(cur.x, 'x', series[cur.s]!) }}</span></span>
          <span class="mi-sc-tip-row"><span class="mi-sc-tip-name">{{ yLabel || 'Y' }}</span><span class="mi-sc-tip-val">{{ fmt(cur.y, 'y', series[cur.s]!) }}</span></span>
          <span v-if="cur.r !== undefined" class="mi-sc-tip-row"><span class="mi-sc-tip-name">{{ sizeLabel }}</span><span class="mi-sc-tip-val">{{ fmt(cur.r, 'r', series[cur.s]!) }}</span></span>
        </div>
      </div>
      <span class="mi-sc-sr" role="status" aria-live="polite">{{ live }}</span>
    </div>
    <MiChartTable v-else :columns="tableColumns" :rows="tableRows" :caption="description" />
  </MiChartCard>
</template>

<style scoped>
.mi-sc-seg{position:relative;display:inline-grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;padding:2px;border-radius:8px;background:var(--mi-fill3)}
.mi-sc-seg button{position:relative;z-index:1;height:26px;padding:0 12px;border:0;border-radius:6px;background:transparent;color:var(--mi-label);font-family:var(--mi-font);font-size:12px;font-weight:600}
.mi-sc-thumb{position:absolute;top:2px;bottom:2px;left:2px;width:calc((100% - 6px) / 2);border-radius:6px;background:var(--mi-seg);box-shadow:0 1px 3px rgba(0,0,0,.14);transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-sc-thumb.is-table{transform:translate3d(calc(100% + 2px),0,0)}
.mi-sc-plot{position:relative;container-type:inline-size;border-radius:10px;touch-action:pan-y;font-family:var(--mi-font);color:var(--mi-label)}
.mi-sc-plot:focus-visible{outline:2px solid var(--mi-p);outline-offset:4px}
.mi-sc-svg{display:block;overflow:visible;height:auto}
.mi-sc-grid{stroke:var(--mi-sep)}
.mi-sc-grid--v{stroke-dasharray:2 4;opacity:.7}
.mi-sc-axis{fill:var(--mi-label2)}
.mi-sc-dot{fill-opacity:.5;transform-box:fill-box;transform-origin:center;pointer-events:none;transition:transform var(--mi-dur-2) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease)}
.mi-sc-dot.is-on{transform:scale(1.25);fill-opacity:.8}
.mi-sc-dot.is-anim{animation:mi-sc-in var(--mi-dur-4) var(--mi-ease) var(--mi-sc-delay) backwards}
.mi-sc-tip{position:absolute;top:0;left:0;pointer-events:none;opacity:0;transform:translate3d(calc(var(--mi-sc-l) * 100cqw),var(--mi-sc-t),0);transition:opacity var(--mi-dur-1) ease;z-index:2}
.mi-sc-tip.is-on{opacity:1}
.mi-sc-tip-in{min-width:140px;padding:10px 12px;border-radius:10px;background:var(--mi-elev);box-shadow:var(--mi-sh2);display:flex;flex-direction:column;gap:5px;font-size:13px;transform:translate3d(14px,calc(-100% - 6px),0)}
.mi-sc-tip-in.is-flip{transform:translate3d(calc(-100% - 14px),calc(-100% - 6px),0)}
.mi-sc-tip-title{display:flex;align-items:center;gap:8px;font-weight:600}
.mi-sc-tip-sw{width:10px;height:10px;border-radius:50%;flex:none}
.mi-sc-tip-row{display:flex;justify-content:space-between;gap:16px}
.mi-sc-tip-name{color:var(--mi-label2)}
.mi-sc-tip-val{font-weight:600;font-variant-numeric:tabular-nums}
.mi-sc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes mi-sc-in{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.mi-sc-dot.is-anim{animation:none}}
</style>
