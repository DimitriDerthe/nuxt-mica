<script setup lang="ts">
/** Donut or pie chart of labelled values with a center readout, legend, hover and keyboard highlighting, and a chart/table toggle. Data: { label, value, color? }[]. */
import { computed, onBeforeUnmount, ref, useId } from 'vue'
import MiChartCard from './MiChartCard.vue'
import MiChartLegend from './MiChartLegend.vue'
import MiChartTable from './MiChartTable.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import type { MiChartTableColumn } from './MiChartTable.vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miRound1 } from '../../utils/miChartMath'

export interface MiDonutDatum {
  label: string
  value: number
  /** Any CSS color; defaults to the shared chart palette in order. */
  color?: string
}

const props = withDefaults(defineProps<{
  /** Segments as { label, value, color? }[]. Negative values count as 0; zero values get no segment. */
  data: MiDonutDatum[]
  /** donut: ring with a center slot. pie: filled disc. */
  variant?: 'donut' | 'pie'
  /** Heading shown above the chart inside the card. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Wraps the chart in the elevated card surface; turn off to embed it in your own container. */
  card?: boolean
  /** Largest width of the chart in px; it shrinks to fit its container. */
  size?: number
  /** Ring thickness in px on a 220 px grid (donut only). */
  thickness?: number
  /** Gap between segments in px along the ring. */
  gap?: number
  /** Text drawn on the segments: nothing, the share in percent, or the formatted value. Small segments stay unlabeled. */
  valueLabels?: 'none' | 'percent' | 'value'
  /** Suffix for values in the legend, tooltip, table and center, e.g. "$". */
  unit?: string
  /** Show the legend next to or below the chart. */
  legend?: boolean
  /** Lets users switch between the chart and an accessible data table. */
  toggle?: boolean
  /** Draws the segments in on mount. */
  animate?: boolean
  /** Caption under the total in the center when nothing is highlighted. */
  totalLabel?: string
  /** Header of the first table column. */
  categoryLabel?: string
  /** Header of the value column in the table. */
  valueLabel?: string
  /** Header of the share column in the table. */
  shareLabel?: string
  /** Label of the chart option in the view toggle. */
  chartLabel?: string
  /** Label of the table option in the view toggle. */
  tableLabel?: string
  /** Custom text for a value in tooltips, legend, table and center; replaces the default number plus unit. */
  formatValue?: (value: number, datum: MiDonutDatum) => string
  /** Accessible description of the chart; a generated summary is used when omitted. */
  ariaLabel?: string
}>(), {
  variant: 'donut',
  card: true,
  size: 240,
  thickness: 30,
  gap: 3,
  valueLabels: 'none',
  unit: '',
  legend: true,
  toggle: true,
  animate: true,
  totalLabel: 'Total',
  categoryLabel: 'Category',
  valueLabel: 'Value',
  shareLabel: 'Share',
  chartLabel: 'Chart',
  tableLabel: 'Table'
})

const emit = defineEmits<{ hover: [index: number] }>()
/** Active view: the `chart` or its data `table`. */
const view = defineModel<'chart' | 'table'>('view', { default: 'chart' })
/** Index of the highlighted segment, -1 for none. Shared by the chart, the legend and the keyboard. */
const active = defineModel<number>('active', { default: -1 })

const uid = useId()
const S = 220
const C = S / 2

const clean = computed(() => props.data.map(d => ({ ...d, value: Number.isFinite(d.value) && d.value > 0 ? d.value : 0 })))
const total = computed(() => clean.value.reduce((a, d) => a + d.value, 0))
const pct = (v: number) => (total.value ? Math.round((v / total.value) * 1000) / 10 : 0)
const fmt = (v: number, d: MiDonutDatum) => (props.formatValue ? props.formatValue(v, d) : `${v.toLocaleString('en-US')}${props.unit}`)
const colorOf = (i: number) => props.data[i]?.color ?? miChartColor(i)

const isPie = computed(() => props.variant === 'pie')
const stroke = computed(() => (isPie.value ? C - 2 : Math.min(props.thickness, C - 20)))
const radius = computed(() => (isPie.value ? stroke.value / 2 : C - stroke.value / 2 - 4))
const circ = computed(() => 2 * Math.PI * radius.value)
const hole = computed(() => (isPie.value ? 0 : (radius.value - stroke.value / 2) / C))

/* Segments use pathLength=100: lengths and offsets are percentages of the full circle. */
const segs = computed(() => {
  const drawn = clean.value.filter(d => d.value > 0).length
  const gapPct = drawn > 1 ? (Math.max(0, props.gap) / circ.value) * 100 : 0
  let acc = 0
  return clean.value.flatMap((d, i) => {
    if (d.value <= 0) return []
    const share = (d.value / total.value) * 100
    const len = Math.max(0.4, share - gapPct)
    const start = acc
    acc += share
    const mid = ((start + share / 2) / 100) * Math.PI * 2
    const lr = isPie.value ? radius.value * 0.95 : radius.value
    const lx = C + Math.sin(mid) * (isPie.value ? lr * 0.62 : lr)
    const ly = C - Math.cos(mid) * (isPie.value ? lr * 0.62 : lr)
    return [{
      i, share, len: miRound1(len * 100) / 100, offset: miRound1((start + gapPct / 2) * 100) / 100,
      color: colorOf(i), delay: Math.round(start * 9), lx: miRound1(lx), ly: miRound1(ly),
      text: props.valueLabels === 'value' ? fmt(d.value, d) : `${pct(d.value)}%`,
      /* Mid-point as 0..1 of the chart box, for the tooltip. */
      tx: miRound1(lx) / S, ty: miRound1(ly) / S
    }]
  })
})
const order = computed(() => segs.value.map(s => s.i))

const legendItems = computed<MiLegendItem[]>(() => props.data.map((d, i) => ({
  label: d.label,
  color: colorOf(i),
  value: `${fmt(clean.value[i]!.value, d)} · ${pct(clean.value[i]!.value)}%`
})))

const description = computed(() => props.ariaLabel ?? (total.value
  ? `${isPie.value ? 'Pie' : 'Donut'} chart. ${props.data.map((d, i) => `${d.label} ${pct(clean.value[i]!.value)}%`).join(', ')}.`
  : `${isPie.value ? 'Pie' : 'Donut'} chart with no data.`))

const tableColumns = computed<MiChartTableColumn[]>(() => [
  { key: 'c', label: props.categoryLabel, align: 'left' },
  { key: 'v', label: props.valueLabel, align: 'right' },
  { key: 's', label: props.shareLabel, align: 'right' }
])
const tableRows = computed(() => props.data.map((d, i) => ({ c: d.label, v: fmt(clean.value[i]!.value, d), s: `${pct(clean.value[i]!.value)}%` })))

const sel = computed(() => {
  const i = active.value
  const d = props.data[i]
  return d ? { i, d, text: fmt(clean.value[i]!.value, d), share: pct(clean.value[i]!.value) } : null
})
const tipSeg = computed(() => segs.value.find(s => s.i === active.value))
const live = ref('')

/* Hover: one delegated, rAF throttled handler on the plot; segments carry data-i. */
let raf = 0
let pending = -1
function commit(i: number, announce: boolean) {
  if (i === active.value) return
  active.value = i
  if (i >= 0 && announce) {
    const d = props.data[i]!
    live.value = `${d.label}: ${fmt(clean.value[i]!.value, d)}, ${pct(clean.value[i]!.value)}%`
  }
  emit('hover', i)
}
function flush() { raf = 0; commit(pending, false) }
function schedule(i: number) {
  pending = i
  if (!raf) raf = requestAnimationFrame(flush)
}
function onMove(e: PointerEvent) {
  const i = (e.target as SVGElement).dataset?.i
  if (i !== undefined) schedule(Number(i))
}
function onKey(e: KeyboardEvent) {
  const o = order.value
  if (!o.length) return
  const at = o.indexOf(active.value)
  let next: number
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = at < 0 ? 0 : (at + 1) % o.length
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = at < 0 ? o.length - 1 : (at - 1 + o.length) % o.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = o.length - 1
  else if (e.key === 'Escape') { e.preventDefault(); commit(-1, false); live.value = ''; return }
  else return
  e.preventDefault()
  commit(o[next]!, true)
}

function onToggleKey(e: KeyboardEvent) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
  e.preventDefault()
  view.value = view.value === 'chart' ? 'table' : 'chart'
  queueMicrotask(() => document.getElementById(`${uid}-${view.value}`)?.focus())
}

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })

const _slots = defineSlots<{
  /** Content in the hole of the donut. Receives the highlighted segment (or null), the total and its formatted text. */
  center?(props: { active: { index: number, label: string, value: number, text: string, share: number } | null, total: number, totalText: string }): unknown
}>()
const totalText = computed(() => (props.formatValue ? props.formatValue(total.value, { label: props.totalLabel, value: total.value }) : `${total.value.toLocaleString('en-US')}${props.unit}`))
const slotActive = computed(() => (sel.value ? { index: sel.value.i, label: sel.value.d.label, value: clean.value[sel.value.i]!.value, text: sel.value.text, share: sel.value.share } : null))
</script>

<template>
  <MiChartCard :title="title" :subtitle="subtitle" :surface="card">
    <template v-if="toggle" #actions>
      <span class="mi-dc-seg" role="radiogroup" aria-label="Display" @keydown="onToggleKey">
        <span class="mi-dc-thumb" :class="{ 'is-table': view === 'table' }" aria-hidden="true" />
        <button :id="`${uid}-chart`" type="button" role="radio" :aria-checked="view === 'chart'" :tabindex="view === 'chart' ? 0 : -1" @click="view = 'chart'">{{ chartLabel }}</button>
        <button :id="`${uid}-table`" type="button" role="radio" :aria-checked="view === 'table'" :tabindex="view === 'table' ? 0 : -1" @click="view = 'table'">{{ tableLabel }}</button>
      </span>
    </template>

    <div v-if="view === 'chart'" class="mi-dc-host">
    <div class="mi-dc-body" :class="{ 'has-legend': legend }">
      <div
        class="mi-dc-plot"
        :style="{ '--mi-dc-size': `${size}px` }"
        tabindex="0"
        role="group"
        :aria-label="`${description} Use the arrow keys to read each segment.`"
        @pointermove="onMove"
        @pointerdown="onMove"
        @pointerleave="schedule(-1)"
        @keydown="onKey"
        @blur="commit(-1, false)"
      >
        <svg class="mi-dc-svg" :viewBox="`0 0 ${S} ${S}`" role="img" :aria-label="description">
          <circle v-if="!isPie" :cx="C" :cy="C" :r="radius" fill="none" :stroke-width="stroke" class="mi-dc-track" />
          <circle v-else-if="!total" :cx="C" :cy="C" :r="C - 2" class="mi-dc-track-fill" />
          <g class="mi-dc-ring" :class="{ 'has-active': active >= 0 }" :transform="`rotate(-90 ${C} ${C})`">
            <circle
              v-for="s in segs"
              :key="s.i"
              :data-i="s.i"
              class="mi-dc-seg-c"
              :class="{ 'is-on': active === s.i, 'is-anim': animate }"
              :cx="C"
              :cy="C"
              :r="radius"
              fill="none"
              pathLength="100"
              :stroke-width="stroke"
              :stroke-dasharray="`${s.len} ${100 - s.len}`"
              :stroke-dashoffset="-s.offset"
              :style="{ stroke: s.color, '--mi-dc-len': s.len, '--mi-dc-delay': `${s.delay}ms`, transformOrigin: `${C}px ${C}px` }"
            />
          </g>
          <g v-if="valueLabels !== 'none'" class="mi-dc-labels" aria-hidden="true">
            <template v-for="s in segs" :key="`l${s.i}`">
              <text v-if="s.share >= 7" :x="s.lx" :y="s.ly" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" class="mi-dc-lbl">{{ s.text }}</text>
            </template>
          </g>
        </svg>

        <div v-if="!isPie" class="mi-dc-center" :style="{ '--mi-dc-hole': hole }">
          <slot name="center" :active="slotActive" :total="total" :total-text="totalText">
            <template v-if="total">
              <span class="mi-dc-big">{{ sel ? sel.text : totalText }}</span>
              <span class="mi-dc-cap">{{ sel ? sel.d.label : totalLabel }}</span>
            </template>
            <span v-else class="mi-dc-cap">No data</span>
          </slot>
        </div>

        <div v-if="isPie && !total" class="mi-dc-center"><span class="mi-dc-cap">No data</span></div>

        <div v-if="tipSeg && sel && isPie" class="mi-dc-tip is-on" aria-hidden="true" :style="{ '--mi-dc-x': tipSeg.tx, '--mi-dc-y': tipSeg.ty }">
          <div class="mi-dc-tip-in">
            <span class="mi-dc-tip-sw" :style="{ background: tipSeg.color }" />
            <span class="mi-dc-tip-name">{{ sel.d.label }}</span>
            <span class="mi-dc-tip-val">{{ sel.text }} · {{ sel.share }}%</span>
          </div>
        </div>
        <span class="mi-dc-sr" role="status" aria-live="polite">{{ live }}</span>
      </div>

      <MiChartLegend v-if="legend" v-model:active="active" class="mi-dc-legend" variant="list" :columns="1" :items="legendItems" aria-label="Segments" />
    </div>
    </div>
    <MiChartTable v-else :columns="tableColumns" :rows="tableRows" :caption="description" />
  </MiChartCard>
</template>

<style scoped>
.mi-dc-seg{position:relative;display:inline-grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px;padding:2px;border-radius:8px;background:var(--mi-fill3)}
.mi-dc-seg button{position:relative;z-index:1;height:26px;padding:0 12px;border:0;border-radius:6px;background:transparent;color:var(--mi-label);font-family:var(--mi-font);font-size:12px;font-weight:600}
.mi-dc-thumb{position:absolute;top:2px;bottom:2px;left:2px;width:calc((100% - 6px) / 2);border-radius:6px;background:var(--mi-seg);box-shadow:0 1px 3px rgba(0,0,0,.14);transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-dc-thumb.is-table{transform:translate3d(calc(100% + 2px),0,0)}
.mi-dc-body{display:flex;flex-direction:column;gap:20px;align-items:center;min-width:0;font-family:var(--mi-font);color:var(--mi-label)}
.mi-dc-plot{position:relative;container-type:inline-size;width:min(100%,var(--mi-dc-size));flex:none;border-radius:50%;touch-action:pan-y}
.mi-dc-plot:focus-visible{outline:2px solid var(--mi-p);outline-offset:4px}
.mi-dc-legend{width:100%;min-width:0}
.mi-dc-host{container-type:inline-size;min-width:0}
@container (min-width:560px){
  .mi-dc-body.has-legend{flex-direction:row;justify-content:center;gap:32px}
  .mi-dc-body.has-legend .mi-dc-plot{flex:0 1 var(--mi-dc-size)}
  .mi-dc-legend{flex:1 1 220px;max-width:340px}
}
.mi-dc-svg{display:block;width:100%;height:auto;overflow:visible}
.mi-dc-track{stroke:var(--mi-fill3)}
.mi-dc-track-fill{fill:var(--mi-fill3)}
.mi-dc-seg-c{cursor:default;transition:transform var(--mi-dur-2) var(--mi-spring),opacity var(--mi-dur-2) var(--mi-ease)}
.mi-dc-seg-c.is-on{transform:scale(1.045)}
.mi-dc-ring.has-active .mi-dc-seg-c:not(.is-on){opacity:.4}
.mi-dc-seg-c.is-anim{animation:mi-dc-draw 700ms var(--mi-ease) var(--mi-dc-delay) both}
.mi-dc-lbl{fill:#fff;pointer-events:none;font-variant-numeric:tabular-nums}
.mi-dc-center{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:2px;text-align:center;pointer-events:none}
.mi-dc-center > *{max-width:calc(var(--mi-dc-hole,.6) * 90cqw)}
.mi-dc-big{font-size:clamp(18px,10cqw,30px);font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.1}
.mi-dc-cap{font-size:12px;color:var(--mi-label2);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mi-dc-tip{position:absolute;top:0;left:0;pointer-events:none;transform:translate3d(calc(var(--mi-dc-x) * 100cqw),calc(var(--mi-dc-y) * 100cqw),0);z-index:2}
.mi-dc-tip-in{display:flex;align-items:center;gap:8px;white-space:nowrap;padding:8px 12px;border-radius:10px;background:var(--mi-elev);box-shadow:var(--mi-sh2);font-size:13px;transform:translate3d(-50%,calc(-100% - 8px),0)}
.mi-dc-tip-sw{width:10px;height:10px;border-radius:3px;flex:none}
.mi-dc-tip-name{color:var(--mi-label2)}
.mi-dc-tip-val{font-weight:600;font-variant-numeric:tabular-nums}
.mi-dc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes mi-dc-draw{from{stroke-dasharray:0 100}to{stroke-dasharray:var(--mi-dc-len) calc(100 - var(--mi-dc-len))}}
@media (prefers-reduced-motion:reduce){.mi-dc-seg-c.is-anim{animation:none}}
</style>
