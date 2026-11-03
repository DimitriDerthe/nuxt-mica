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
      <span class="mi-dc-seg mi:relative mi:inline-grid mi:grid-cols-2 mi:gap-0.5 mi:p-0.5 mi:rounded-[8px] mi:bg-fill3" role="radiogroup" aria-label="Display" @keydown="onToggleKey">
        <span class="mi-dc-thumb mi:absolute mi:top-0.5 mi:bottom-0.5 mi:left-0.5 mi:w-[calc((100%_-_6px)_/_2)] mi:rounded-[6px] mi:bg-seg mi:shadow-[0_1px_3px_rgba(0,0,0,.14)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-table]:transform-[translate3d(calc(100%_+_2px),0,0)]" :class="{ 'is-table': view === 'table' }" aria-hidden="true" />
        <button class="mi:[.mi-dc-seg_&]:relative mi:[.mi-dc-seg_&]:z-1 mi:[.mi-dc-seg_&]:h-6.5 mi:[.mi-dc-seg_&]:py-0 mi:[.mi-dc-seg_&]:px-3 mi:[.mi-dc-seg_&]:[border:0] mi:[.mi-dc-seg_&]:rounded-[6px] mi:[.mi-dc-seg_&]:bg-transparent mi:[.mi-dc-seg_&]:text-label mi:[.mi-dc-seg_&]:font-mi mi:[.mi-dc-seg_&]:text-[12px] mi:[.mi-dc-seg_&]:font-semibold" :id="`${uid}-chart`" type="button" role="radio" :aria-checked="view === 'chart'" :tabindex="view === 'chart' ? 0 : -1" @click="view = 'chart'">{{ chartLabel }}</button>
        <button class="mi:[.mi-dc-seg_&]:relative mi:[.mi-dc-seg_&]:z-1 mi:[.mi-dc-seg_&]:h-6.5 mi:[.mi-dc-seg_&]:py-0 mi:[.mi-dc-seg_&]:px-3 mi:[.mi-dc-seg_&]:[border:0] mi:[.mi-dc-seg_&]:rounded-[6px] mi:[.mi-dc-seg_&]:bg-transparent mi:[.mi-dc-seg_&]:text-label mi:[.mi-dc-seg_&]:font-mi mi:[.mi-dc-seg_&]:text-[12px] mi:[.mi-dc-seg_&]:font-semibold" :id="`${uid}-table`" type="button" role="radio" :aria-checked="view === 'table'" :tabindex="view === 'table' ? 0 : -1" @click="view = 'table'">{{ tableLabel }}</button>
      </span>
    </template>

    <div v-if="view === 'chart'" class="mi-dc-host mi:@container mi:min-w-0">
    <div class="mi-dc-body mi:flex mi:flex-col mi:gap-5 mi:items-center mi:min-w-0 mi:font-mi mi:text-label mi:@[560px]:[&.has-legend]:flex-row mi:@[560px]:[&.has-legend]:justify-center mi:@[560px]:[&.has-legend]:gap-8" :class="{ 'has-legend': legend }">
      <div
        class="mi-dc-plot mi:relative mi:@container mi:w-[min(100%,var(--mi-dc-size))] mi:flex-[none] mi:rounded-[50%] mi:touch-pan-y mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[4px] mi:@[560px]:[.mi-dc-body.has-legend_&]:flex-[0_1_var(--mi-dc-size)]"
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
        <svg class="mi-dc-svg mi:block mi:w-full mi:h-auto mi:overflow-visible" :viewBox="`0 0 ${S} ${S}`" role="img" :aria-label="description">
          <circle v-if="!isPie" :cx="C" :cy="C" :r="radius" fill="none" :stroke-width="stroke" class="mi-dc-track mi:stroke-fill3" />
          <circle v-else-if="!total" :cx="C" :cy="C" :r="C - 2" class="mi-dc-track-fill mi:fill-fill3" />
          <g class="mi-dc-ring" :class="{ 'has-active': active >= 0 }" :transform="`rotate(-90 ${C} ${C})`">
            <circle
              v-for="s in segs"
              :key="s.i"
              :data-i="s.i"
              class="mi-dc-seg-c mi:cursor-default mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-on]:transform-[scale(1.045)] mi:[.mi-dc-ring.has-active_&:not(.is-on)]:opacity-40"
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
              <text v-if="s.share >= 7" :x="s.lx" :y="s.ly" text-anchor="middle" dominant-baseline="central" font-size="12" font-weight="600" class="mi-dc-lbl mi:fill-[color:#fff] mi:pointer-events-none mi:tabular-nums">{{ s.text }}</text>
            </template>
          </g>
        </svg>

        <div v-if="!isPie" class="mi-dc-center mi:absolute mi:inset-0 mi:grid mi:place-content-center mi:justify-items-center mi:gap-0.5 mi:text-center mi:pointer-events-none" :style="{ '--mi-dc-hole': hole }">
          <slot name="center" :active="slotActive" :total="total" :total-text="totalText">
            <template v-if="total">
              <span class="mi-dc-big mi:text-[clamp(18px,10cqw,30px)] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums mi:leading-[1.1]">{{ sel ? sel.text : totalText }}</span>
              <span class="mi-dc-cap mi:text-[12px] mi:text-label2 mi:leading-[1.2] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ sel ? sel.d.label : totalLabel }}</span>
            </template>
            <span v-else class="mi-dc-cap mi:text-[12px] mi:text-label2 mi:leading-[1.2] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">No data</span>
          </slot>
        </div>

        <div v-if="isPie && !total" class="mi-dc-center mi:absolute mi:inset-0 mi:grid mi:place-content-center mi:justify-items-center mi:gap-0.5 mi:text-center mi:pointer-events-none"><span class="mi-dc-cap mi:text-[12px] mi:text-label2 mi:leading-[1.2] mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">No data</span></div>

        <div v-if="tipSeg && sel && isPie" class="mi-dc-tip is-on mi:absolute mi:top-0 mi:left-0 mi:pointer-events-none mi:transform-[translate3d(calc(var(--mi-dc-x)_*_100cqw),calc(var(--mi-dc-y)_*_100cqw),0)] mi:z-2" aria-hidden="true" :style="{ '--mi-dc-x': tipSeg.tx, '--mi-dc-y': tipSeg.ty }">
          <div class="mi-dc-tip-in mi:flex mi:items-center mi:gap-2 mi:whitespace-nowrap mi:py-2 mi:px-3 mi:rounded-[10px] mi:bg-elev mi:shadow-2 mi:text-[13px] mi:transform-[translate3d(-50%,calc(-100%_-_8px),0)]">
            <span class="mi-dc-tip-sw mi:w-2.5 mi:h-2.5 mi:rounded-[3px] mi:flex-[none]" :style="{ background: tipSeg.color }" />
            <span class="mi-dc-tip-name mi:text-label2">{{ sel.d.label }}</span>
            <span class="mi-dc-tip-val mi:font-semibold mi:tabular-nums">{{ sel.text }} · {{ sel.share }}%</span>
          </div>
        </div>
        <span class="mi-dc-sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ live }}</span>
      </div>

      <MiChartLegend v-if="legend" v-model:active="active" class="mi-dc-legend" variant="list" :columns="1" :items="legendItems" aria-label="Segments" />
    </div>
    </div>
    <MiChartTable v-else :columns="tableColumns" :rows="tableRows" :caption="description" />
  </MiChartCard>
</template>

<style scoped>
.mi-dc-legend{width:100%;min-width:0}
@container (min-width:560px){
  .mi-dc-legend{flex:1 1 220px;max-width:340px}
}
.mi-dc-seg-c.is-anim{animation:mi-dc-draw 700ms var(--mi-ease) var(--mi-dc-delay) both}
.mi-dc-center > *{max-width:calc(var(--mi-dc-hole,.6) * 90cqw)}
@keyframes mi-dc-draw{from{stroke-dasharray:0 100}to{stroke-dasharray:var(--mi-dc-len) calc(100 - var(--mi-dc-len))}}
@media (prefers-reduced-motion:reduce){.mi-dc-seg-c.is-anim{animation:none}}
</style>
