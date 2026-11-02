<script setup lang="ts">
/** One horizontal bar split into shares of a total, with hover, keyboard and a legend. Segments are { label, value, color? }[]. */
import { computed, onBeforeUnmount, ref } from 'vue'
import MiChartLegend from './MiChartLegend.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miSafeColor } from '../../utils/miSafe'

export interface MiStackSegment {
  label: string
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  /** Segments as { label, value, color? }[]; shares are computed from the total. */
  segments: MiStackSegment[]
  /** Thickness of the bar in px. */
  height?: number
  /** Show the ruled legend with percentages below the bar. */
  legend?: boolean
  /** Number of columns in the legend below the bar. */
  legendColumns?: number
  /** Formats the share (0-100) shown in the legend and live region. */
  formatShare?: (pct: number, seg: MiStackSegment) => string
  /** Accessible description of the bar; each segment label and share is read when omitted. */
  ariaLabel?: string
  /** Grows the segments in on mount. */
  animate?: boolean
}>(), { height: 28, legend: true, legendColumns: 2, animate: true })

/** Highlighted segment index, -1 for none. */
const active = defineModel<number>('active', { default: -1 })

const total = computed(() => props.segments.reduce((a, s) => a + Math.max(0, s.value), 0) || 1)
const shares = computed(() => props.segments.map(s => Math.round((Math.max(0, s.value) / total.value) * 100)))
const fmt = (i: number) => props.formatShare ? props.formatShare(shares.value[i]!, props.segments[i]!) : `${shares.value[i]}%`
const colors = computed(() => props.segments.map((s, i) => miSafeColor(s.color, miChartColor(i))))
const label = computed(() => props.ariaLabel ?? props.segments.map((s, i) => `${s.label} ${fmt(i)}`).join(', '))
const items = computed<MiLegendItem[]>(() => props.segments.map((s, i) => ({ label: s.label, color: colors.value[i]!, value: fmt(i) })))
const live = ref('')

let raf = 0
let pending = -1
function flush() { raf = 0; active.value = pending }
function schedule(i: number) {
  pending = i
  if (!raf) raf = requestAnimationFrame(flush)
}
function onOver(e: PointerEvent) {
  const i = (e.target as HTMLElement).dataset?.i
  if (i !== undefined) schedule(Number(i))
}
function onLeave() { schedule(-1) }
function announce() { live.value = active.value >= 0 ? `${props.segments[active.value]!.label} ${fmt(active.value)}` : '' }

function onKey(e: KeyboardEvent) {
  const n = props.segments.length
  if (!n) return
  let next = active.value
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = active.value < 0 ? 0 : (active.value + 1) % n
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = active.value < 0 ? n - 1 : (active.value - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  else if (e.key === 'Escape') next = -1
  else return
  e.preventDefault()
  active.value = next
  announce()
}

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<template>
  <div class="mi-sb">
    <div
      class="mi-sb-bar"
      :class="{ 'is-anim': animate }"
      role="img"
      tabindex="0"
      :aria-label="label"
      :style="{ height: `${height}px` }"
      @pointerover="onOver"
      @pointerleave="onLeave"
      @keydown="onKey"
      @blur="active = -1"
    >
      <span
        v-for="(s, i) in segments"
        :key="i"
        class="mi-sb-seg"
        :class="{ 'is-dim': active >= 0 && active !== i, 'is-first': i === 0, 'is-last': i === segments.length - 1 }"
        :data-i="i"
        :style="{ flexGrow: Math.max(0, s.value), background: colors[i] }"
      />
    </div>
    <MiChartLegend v-if="legend" v-model:active="active" variant="list" :items="items" :columns="legendColumns" />
    <span class="mi-sb-sr" role="status" aria-live="polite">{{ live }}</span>
  </div>
</template>

<style scoped>
.mi-sb{display:flex;flex-direction:column;gap:18px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-sb-bar{display:flex;gap:2px;border-radius:6px;touch-action:pan-y}
.mi-sb-bar.is-anim{animation:mi-sb-in var(--mi-dur-4) var(--mi-ease) both}
.mi-sb-seg{flex:1 1 0;min-width:0;transition:opacity var(--mi-dur-1) ease}
.mi-sb-seg.is-first{border-radius:6px 0 0 6px}
.mi-sb-seg.is-last{border-radius:0 6px 6px 0}
.mi-sb-seg.is-first.is-last{border-radius:6px}
.mi-sb-seg.is-dim{opacity:.45}
.mi-sb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
@keyframes mi-sb-in{from{clip-path:polygon(0 0,0 0,0 100%,0 100%)}to{clip-path:polygon(0 0,100% 0,100% 100%,0 100%)}}
</style>
