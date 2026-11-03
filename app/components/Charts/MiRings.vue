<script setup lang="ts">
/** Concentric progress rings, one per item, with a legend. Rings are { label, sub?, value (0 to 1), color? }[]. */
import { computed } from 'vue'
import MiChartCard from './MiChartCard.vue'
import MiChartLegend from './MiChartLegend.vue'
import type { MiLegendItem } from './MiChartLegend.vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miRound1 } from '../../utils/miChartMath'
import { miSafeColor } from '../../utils/miSafe'

export interface MiRing {
  label: string
  /** Secondary line in the legend. */
  sub?: string
  /** Progress from 0 to 1. */
  value: number
  color?: string
}

const props = withDefaults(defineProps<{
  /** Rings as { label, sub?, value (0 to 1), color? }[], outermost first. */
  rings: MiRing[]
  /** Heading shown above the rings inside the card. */
  title?: string
  /** Secondary line under the title. */
  subtitle?: string
  /** Wrap in the elevated card surface. */
  card?: boolean
  /** Outer diameter of the ring stack in px. */
  size?: number
  /** Thickness of each ring in px. */
  strokeWidth?: number
  /** Space between concentric rings. */
  gap?: number
  /** Shows a legend with each ring label and percentage beside the rings. */
  legend?: boolean
  /** Sweeps the rings to their values on mount. */
  animate?: boolean
  /** Accessible description of the rings; label and percentage of each ring are read when omitted. */
  ariaLabel?: string
}>(), { card: true, size: 180, strokeWidth: 14, gap: 4, legend: true, animate: true })

/** Highlighted ring index (legend hover), -1 for none. */
const active = defineModel<number>('active', { default: -1 })

const clamp = (v: number) => Math.max(0, Math.min(1, v))
const colors = computed(() => props.rings.map((r, i) => miSafeColor(r.color, miChartColor(i))))
const geo = computed(() => props.rings.map((r, i) => {
  const radius = props.size / 2 - props.strokeWidth / 2 - 5 - i * (props.strokeWidth + props.gap)
  const c = 2 * Math.PI * Math.max(radius, 1)
  return { r: miRound1(radius), c: miRound1(c), offset: miRound1(c * (1 - clamp(r.value))) }
}))
const pct = (v: number) => `${Math.round(clamp(v) * 100)}%`
const label = computed(() => props.ariaLabel ?? props.rings.map(r => `${r.label} ${pct(r.value)}`).join(', '))
const items = computed<MiLegendItem[]>(() => props.rings.map((r, i) => ({ label: r.label, sub: r.sub, color: colors.value[i]!, value: pct(r.value) })))

const _slots = defineSlots<{
  /** Content centered inside the rings, such as a total. */
  default?(): unknown
}>()
</script>

<template>
  <MiChartCard :title="title" :subtitle="subtitle" :surface="card">
    <div class="mi-rg mi:flex mi:items-center mi:gap-7 mi:flex-wrap mi:font-mi">
      <div class="mi-rg-fig mi:relative mi:flex-[none]" :style="{ width: `${size}px`, height: `${size}px` }">
        <svg class="mi-rg-svg mi:block mi:transform-[rotate(-90deg)]" :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" role="img" :aria-label="label">
          <g v-for="(r, i) in rings" :key="i" class="mi-rg-ring mi:[transition:opacity_var(--mi-dur-2)_ease] mi:[&.is-dim]:opacity-40" :class="{ 'is-dim': active >= 0 && active !== i }">
            <circle :cx="size / 2" :cy="size / 2" :r="geo[i]!.r" fill="none" :stroke-width="strokeWidth" :style="{ stroke: colors[i] }" stroke-opacity=".2" />
            <circle
              class="mi-rg-arc mi:[transition:stroke-dashoffset_var(--mi-dur-4)_var(--mi-ease)]"
              :class="{ 'is-anim': animate }"
              :cx="size / 2"
              :cy="size / 2"
              :r="geo[i]!.r"
              fill="none"
              :stroke-width="strokeWidth"
              stroke-linecap="round"
              :stroke-dasharray="geo[i]!.c"
              :style="{ stroke: colors[i], strokeDashoffset: geo[i]!.offset, '--mi-rg-c': geo[i]!.c, '--mi-rg-i': i }"
            />
          </g>
        </svg>
        <div v-if="$slots.default" class="mi-rg-center mi:absolute mi:inset-0 mi:flex mi:flex-col mi:items-center mi:justify-center mi:text-center mi:pointer-events-none"><slot /></div>
      </div>
      <MiChartLegend v-if="legend" v-model:active="active" variant="stat" :items="items" />
    </div>
  </MiChartCard>
</template>

<style scoped>
.mi-rg-arc.is-anim{animation:mi-rg-in 900ms var(--mi-ease) calc(var(--mi-rg-i) * 90ms) both}
@keyframes mi-rg-in{from{stroke-dashoffset:var(--mi-rg-c)}}
</style>
