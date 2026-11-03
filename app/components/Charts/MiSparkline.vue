<script setup lang="ts">
/** Tiny inline line chart for trends inside text or tiles. Decorative unless label is set. Values are number[], oldest first. */
import { computed } from 'vue'
import { miLinePath, miSparkPoints } from '../../utils/miChartMath'
import { miChartColor, miChartNeutral } from '../../utils/miChartPalette'
import { miSafeColor } from '../../utils/miSafe'

const props = withDefaults(defineProps<{
  /** Numbers drawn left to right, oldest first. */
  values: number[]
  /** Width of the drawing in px. */
  width?: number
  /** Height of the drawing in px. */
  height?: number
  /** Line color. Defaults to the neutral chart gray. */
  stroke?: string
  /** End dot color. Defaults to series 1. */
  color?: string
  /** Thickness of the line in px. */
  strokeWidth?: number
  /** Show the end dot. */
  dot?: boolean
  /** Draw the line in on mount. */
  animate?: boolean
  /** Accessible description; the sparkline is decorative when omitted. */
  label?: string
}>(), { width: 84, height: 28, strokeWidth: 2, dot: true, animate: true })

const points = computed(() => miSparkPoints(props.values, props.width, props.height))
const d = computed(() => miLinePath(points.value))
const end = computed(() => points.value[points.value.length - 1])
</script>

<template>
  <svg
    class="mi-spark"
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    focusable="false"
  >
    <path
      v-if="points.length"
      class="mi-spark-line mi:[&.is-anim]:[stroke-dasharray:1_1] mi:[&.is-anim]:will-change-[stroke-dashoffset]"
      :class="{ 'is-anim': animate }"
      :d="d"
      pathLength="1"
      fill="none"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      :style="{ stroke: stroke ?? miChartNeutral }"
    />
    <circle
      v-if="dot && end"
      class="mi-spark-dot mi:[&.is-anim]:[transform-box:fill-box] mi:[&.is-anim]:origin-center"
      :class="{ 'is-anim': animate }"
      :cx="end[0]"
      :cy="end[1]"
      r="4"
      stroke-width="2"
      :style="{ fill: miSafeColor(color, miChartColor(0)), stroke: 'var(--mi-card)' }"
    />
  </svg>
</template>

<style scoped>
.mi-spark{flex:none;overflow:visible;display:block}
.mi-spark-line.is-anim{animation:mi-spark-draw var(--mi-dur-4) var(--mi-ease) both}
.mi-spark-dot.is-anim{animation:mi-spark-pop var(--mi-dur-3) var(--mi-ease) calc(var(--mi-dur-4) * .7) both}
@keyframes mi-spark-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes mi-spark-pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
</style>
