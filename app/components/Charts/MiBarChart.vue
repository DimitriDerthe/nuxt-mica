<script setup lang="ts">
/** Column chart for comparing values across categories. Data is { label, value, color? }[]; valueLabels is peak, all or none. */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import MiChartCard from './MiChartCard.vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miBarPath, miNiceScale, miRound1 } from '../../utils/miChartMath'

export interface MiBarDatum {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  /** Columns as { label, value, color? }[], in display order. */
  data: MiBarDatum[]
  /** Heading shown above the chart inside the card. */
  title?: string
  /** Secondary line under the title, for context such as period or unit. */
  subtitle?: string
  /** Wraps the chart in the elevated card surface; turn off to embed it in your own container. */
  card?: boolean
  /** Suffix added to tick labels and values, e.g. "%". */
  unit?: string
  /** Fixed top of the value axis; defaults to a nice scale over the data. */
  max?: number
  /** Number of axis intervals. */
  ticks?: number
  /** Total chart height in px, including the axis labels. */
  height?: number
  /** Widest a column may be, in px. */
  maxBarWidth?: number
  /** Corner radius in px of the top of each column. */
  radius?: number
  /** peak: label the tallest column (or the hovered one). all: label every column. none: tooltip only. */
  valueLabels?: 'peak' | 'all' | 'none'
  /** Grows the columns in on mount. */
  animate?: boolean
  /** Custom text for a column value in labels and tooltips; replaces the default value plus unit. */
  formatValue?: (value: number, datum: MiBarDatum) => string
  /** Accessible description of the chart; a summary of highest and lowest columns is generated when omitted. */
  ariaLabel?: string
}>(), {
  card: true,
  unit: '',
  ticks: 2,
  height: 216,
  maxBarWidth: 24,
  radius: 4,
  valueLabels: 'peak',
  animate: true
})

const emit = defineEmits<{ hover: [index: number] }>()

/* Plot width in px, tracked with one ResizeObserver so labels keep their real size at any width. */
const W = ref(360)
const plotEl = ref<HTMLElement | null>(null)
let ro: ResizeObserver | null = null
watch(plotEl, (el) => {
  ro?.disconnect()
  if (!el || typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver((entries) => {
    const w = Math.round(entries[0]?.contentRect.width ?? 0)
    if (w >= 160 && w !== W.value) W.value = Math.min(w, 1200)
  })
  ro.observe(el)
})
const LEFT = 34
const RIGHT = computed(() => W.value - 4)
const TOP = 16
const base = computed(() => props.height - 26)
const slot = computed(() => (RIGHT.value - LEFT) / Math.max(1, props.data.length))
const dataMax = computed(() => Math.max(0, ...props.data.map(d => d.value)))
const scale = computed(() => (props.max !== undefined
  ? { min: 0, max: props.max, ticks: Array.from({ length: props.ticks + 1 }, (_, i) => miRound1((i * props.max!) / props.ticks)) }
  : miNiceScale(dataMax.value, props.ticks)))
const Y = (v: number) => miRound1(TOP + (1 - Math.max(0, v) / (scale.value.max || 1)) * (base.value - TOP))
const fmt = (d: MiBarDatum) => (props.formatValue ? props.formatValue(d.value, d) : `${d.value}${props.unit}`)
const peak = computed(() => props.data.reduce((best, d, i, a) => (d.value > a[best]!.value ? i : best), 0))

const hl = ref(-1)
const live = ref('')
const bars = computed(() => props.data.map((d, i) => {
  const cx = miRound1(LEFT + slot.value * (i + 0.5))
  const w = Math.min(props.maxBarWidth, slot.value * 0.7)
  const y = Y(d.value)
  return {
    i,
    cx,
    y,
    label: d.label,
    text: fmt(d),
    color: d.color ?? miChartColor(0),
    path: miBarPath(miRound1(cx - w / 2), y, miRound1(w), base.value, props.radius),
    hx: miRound1(LEFT + slot.value * i),
    hw: miRound1(slot.value)
  }
}))
const tickRows = computed(() => scale.value.ticks.map(v => ({ y: Y(v), ty: Y(v) + 4, label: v ? `${v}${props.unit}` : '0' })))
const showLabel = (i: number) => {
  if (props.valueLabels === 'all') return true
  if (props.valueLabels === 'none') return hl.value === i
  return hl.value < 0 ? i === peak.value : hl.value === i
}
const description = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (!props.data.length) return 'Column chart'
  const hi = props.data[peak.value]!
  const lo = props.data.reduce((b, d) => (d.value < b.value ? d : b), props.data[0]!)
  return `Column chart. ${hi.label} is highest at ${fmt(hi)}, ${lo.label} lowest at ${fmt(lo)}.`
})

let raf = 0
let pending = -1
function commit(i: number, announce: boolean) {
  hl.value = i
  if (i >= 0 && announce) live.value = `${props.data[i]!.label}: ${fmt(props.data[i]!)}`
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
  const last = props.data.length - 1
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
onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf); ro?.disconnect() })
</script>

<template>
  <MiChartCard :title="title" :subtitle="subtitle" :surface="card">
    <div
      ref="plotEl"
      class="mi-bc"
      tabindex="0"
      role="group"
      :aria-label="`${description} Use the left and right arrow keys to read each column.`"
      @pointermove="onMove"
      @pointerdown="onMove"
      @pointerleave="schedule(-1)"
      @keydown="onKey"
      @blur="commit(-1, false)"
    >
      <svg class="mi-bc-svg" :viewBox="`0 0 ${W} ${height}`" width="100%" role="img" :aria-label="description">
        <template v-for="(t, i) in tickRows" :key="i">
          <line :x1="LEFT" :x2="RIGHT" :y1="t.y" :y2="t.y" stroke-width="1" class="mi-bc-gridline" />
          <text :x="LEFT - 8" :y="t.ty" text-anchor="end" font-size="11" class="mi-bc-axis">{{ t.label }}</text>
        </template>
        <g v-for="b in bars" :key="b.i">
          <path
            class="mi-bc-bar"
            :class="{ 'is-anim': animate, 'is-dim': hl >= 0 && hl !== b.i }"
            :d="b.path"
            :style="{ fill: b.color, '--mi-bc-i': b.i }"
          />
          <text :x="b.cx" :y="height - 6" text-anchor="middle" font-size="11" class="mi-bc-axis">{{ b.label }}</text>
          <text :x="b.cx" :y="b.y - 8" text-anchor="middle" font-size="12" font-weight="600" class="mi-bc-val" :class="{ 'is-on': showLabel(b.i) }">{{ b.text }}</text>
        </g>
        <rect v-for="b in bars" :key="`h${b.i}`" :data-i="b.i" :x="b.hx" y="0" :width="b.hw" :height="base + 6" fill="transparent" />
      </svg>
      <span class="mi-bc-sr" role="status" aria-live="polite">{{ live }}</span>
    </div>
  </MiChartCard>
</template>

<style scoped>
.mi-bc{border-radius:10px;touch-action:pan-y;font-family:var(--mi-font);color:var(--mi-label)}
.mi-bc-svg{display:block;overflow:visible;height:auto}
.mi-bc-gridline{stroke:var(--mi-sep)}
.mi-bc-axis{fill:var(--mi-label2)}
.mi-bc-val{fill:var(--mi-label);opacity:0;transition:opacity var(--mi-dur-1) ease;pointer-events:none}
.mi-bc-val.is-on{opacity:1}
.mi-bc-bar{transition:opacity var(--mi-dur-1) ease}
.mi-bc-bar.is-dim{opacity:.45}
.mi-bc-bar.is-anim{transform-box:fill-box;transform-origin:50% 100%;animation:mi-bc-grow var(--mi-dur-4) var(--mi-ease) calc(var(--mi-bc-i) * 30ms) both}
.mi-bc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes mi-bc-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
</style>
