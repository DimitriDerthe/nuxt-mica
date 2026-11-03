<script setup lang="ts">
/** Heatmap of daily counts by week, with a legend and keyboard navigation. Data is a flat number[], 7 values per week, Monday first. */
import { computed, onBeforeUnmount, ref } from 'vue'
import MiChartCard from './MiChartCard.vue'
import MiChartLegend from './MiChartLegend.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import { miChartHeat } from '../../utils/miChartPalette'
import { miLevel } from '../../utils/miChartMath'

const props = withDefaults(defineProps<{
  /** Week-major flat list, 7 values per week (Monday first). */
  data: number[]
  /** Heading shown above the heatmap inside the card. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Wraps the heatmap in the elevated card surface; turn off to embed it in your own container. */
  card?: boolean
  /** Seven weekday names, Monday first, used for row labels and tooltips. */
  dayLabels?: string[]
  /** Day rows that get a text label. */
  labelRows?: number[]
  /** Noun shown in the default tooltip, e.g. "reviews". */
  unit?: string
  /** Maximum for the color scale; defaults to the data maximum. */
  max?: number
  /** Side length of each square cell in px. */
  cell?: number
  /** Space between cells in px. */
  gap?: number
  /** Shows the Less to More color scale below the grid. */
  legend?: boolean
  /** Text at the low end of the legend scale. */
  lessLabel?: string
  /** Text at the high end of the legend scale. */
  moreLabel?: string
  /** Custom tooltip text. Week and day are 0-based; day 0 is Monday. */
  formatTip?: (value: number, week: number, day: number) => string
  /** Accessible description of the heatmap; a default summary of days and weeks is used when omitted. */
  ariaLabel?: string
}>(), {
  card: true,
  dayLabels: () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  labelRows: () => [0, 2, 4],
  unit: 'events',
  cell: 14,
  gap: 3,
  legend: true,
  lessLabel: 'Less',
  moreLabel: 'More'
})

const emit = defineEmits<{ hover: [cell: { week: number, day: number, value: number } | null] }>()

const LEFT = 30
const TOP = 10
const pitch = computed(() => props.cell + props.gap)
const weeks = computed(() => Math.ceil(props.data.length / 7))
const width = computed(() => LEFT + weeks.value * pitch.value)
const height = computed(() => TOP + 7 * pitch.value + props.gap)
const peak = computed(() => props.max ?? Math.max(0, ...props.data))
const heat = computed(() => miChartHeat())
const vars = computed(() => Object.fromEntries(heat.value.map((c, i) => [`--mi-h${i}`, c])))
const tip = (v: number, w: number, d: number) => props.formatTip
  ? props.formatTip(v, w, d)
  : `Week ${w + 1}, ${props.dayLabels[d] ?? ''}: ${v} ${props.unit}`
const cells = computed(() => props.data.map((v, k) => {
  const w = Math.floor(k / 7)
  const d = k % 7
  return { k, v, w, d, x: LEFT + w * pitch.value, y: TOP + d * pitch.value, l: miLevel(v, peak.value), t: tip(v, w, d) }
}))
const legendItems = computed<MiLegendItem[]>(() => heat.value.map((c, i) => ({ label: String(i), color: c })))

const hl = ref(-1)
const shown = ref(0)
const live = ref('')
const glide = ref(false)
const cur = computed(() => cells.value[shown.value])

let raf = 0
let pending = -1
function commit(k: number, announce: boolean) {
  glide.value = hl.value >= 0 && k >= 0
  hl.value = k
  if (k >= 0) {
    shown.value = k
    const c = cells.value[k]!
    if (announce) live.value = c.t
    emit('hover', { week: c.w, day: c.d, value: c.v })
  } else {
    emit('hover', null)
  }
}
function flush() { raf = 0; if (pending !== hl.value) commit(pending, false) }
function schedule(k: number) {
  pending = k
  if (!raf) raf = requestAnimationFrame(flush)
}
function onOver(e: PointerEvent) {
  const k = (e.target as SVGElement).dataset?.k
  if (k !== undefined) schedule(Number(k))
}

function onKey(e: KeyboardEvent) {
  const n = props.data.length
  if (!n) return
  let k = hl.value < 0 ? 0 : hl.value
  const has = hl.value >= 0
  switch (e.key) {
    case 'ArrowRight': k = has ? Math.min(n - 1, k + 7) : 0; break
    case 'ArrowLeft': k = has ? Math.max(0, k - 7) : 0; break
    case 'ArrowDown': k = has ? Math.min(n - 1, k + 1) : 0; break
    case 'ArrowUp': k = has ? Math.max(0, k - 1) : 0; break
    case 'Home': k = Math.floor(k / 7) * 7; break
    case 'End': k = Math.min(n - 1, Math.floor(k / 7) * 7 + 6); break
    case 'Escape': e.preventDefault(); commit(-1, false); live.value = ''; return
    default: return
  }
  e.preventDefault()
  commit(k, true)
}

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <MiChartCard :title="title" :subtitle="subtitle" :surface="card">
    <div
      class="mi-hm mi:block mi:rounded-[8px] mi:touch-pan-y mi:font-mi"
      tabindex="0"
      role="group"
      :aria-label="ariaLabel ?? 'Heatmap. Use the arrow keys to read each day.'"
      :style="vars"
      @pointerover="onOver"
      @pointerleave="schedule(-1)"
      @keydown="onKey"
      @blur="commit(-1, false)"
    >
      <svg class="mi-hm-svg mi:block mi:max-w-full" :viewBox="`0 0 ${width} ${height}`" width="100%" :height="height" role="img" :aria-label="ariaLabel ?? `Heatmap of ${data.length} days over ${weeks} weeks`">
        <template v-for="r in labelRows" :key="r">
          <text class="mi-hm-day mi:fill-label2" x="0" :y="TOP + r * pitch + 12" font-size="10">{{ dayLabels[r] }}</text>
        </template>
        <rect
          v-for="c in cells"
          :key="c.k"
          :class="`mi-hm-cell l${c.l}`"
          :data-k="c.k"
          :x="c.x"
          :y="c.y"
          :width="cell"
          :height="cell"
          rx="3"
        ><title>{{ c.t }}</title></rect>
        <rect
          v-if="cur"
          class="mi-hm-ring mi:stroke-label mi:opacity-0 mi:pointer-events-none mi:[&.is-on]:opacity-100 mi:[&.is-glide]:[transition:transform_var(--mi-dur-1)_var(--mi-ease),opacity_var(--mi-dur-1)_ease] mi:[&:not(.is-glide)]:[transition:opacity_var(--mi-dur-1)_ease]"
          :class="{ 'is-on': hl >= 0, 'is-glide': glide }"
          :x="-1.5"
          :y="-1.5"
          :width="cell + 3"
          :height="cell + 3"
          rx="4.5"
          fill="none"
          stroke-width="2"
          :style="{ transform: `translate(${cur.x}px, ${cur.y}px)` }"
        />
      </svg>
    </div>
    <MiChartLegend v-if="legend" variant="ramp" :items="legendItems" :less-label="lessLabel" :more-label="moreLabel" />
    <span class="mi-hm-sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" role="status" aria-live="polite">{{ live }}</span>
  </MiChartCard>
</template>

<style scoped>
.mi-hm-cell{pointer-events:all}
.mi-hm-cell.l0{fill:var(--mi-h0)}
.mi-hm-cell.l1{fill:var(--mi-h1)}
.mi-hm-cell.l2{fill:var(--mi-h2)}
.mi-hm-cell.l3{fill:var(--mi-h3)}
.mi-hm-cell.l4{fill:var(--mi-h4)}
</style>
