<script setup lang="ts">
/** Linear progress meter for one value between min and max, such as quota or budget use, with optional caption and hint. */
import { computed, useId } from 'vue'
import { miChartColor } from '../../utils/miChartPalette'

const props = withDefaults(defineProps<{
  /** Current value, clamped to the min to max range. */
  value: number
  /** Value that maps to an empty track. */
  min?: number
  /** Value that maps to a full track. */
  max?: number
  /** Visible label above the track. */
  label?: string
  /** Accessible name when no visible label is given. */
  ariaLabel?: string
  /** Text left of the footer, e.g. "82 % used". */
  caption?: string
  /** Text right of the footer, e.g. "$1,240 remaining". */
  hint?: string
  /** Fill color. Defaults to series 1 (primary). */
  color?: string
  /** Track thickness: sm, md or lg. */
  size?: 'sm' | 'md' | 'lg'
  /** Text for assistive tech, defaults to the percentage. */
  valueText?: string
}>(), { min: 0, max: 100, size: 'md' })

const id = useId()
const pct = computed(() => {
  const span = props.max - props.min || 1
  return Math.max(0, Math.min(100, ((props.value - props.min) / span) * 100))
})
const tint = computed(() => props.color ? `color-mix(in srgb, ${props.color} 16%, transparent)` : 'var(--mi-p-tint)')

const _slots = defineSlots<{
  /** Replaces the footer; defaults to the caption on the left and the hint on the right. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-mt">
    <span v-if="label" :id="`${id}-l`" class="mi-mt-label">{{ label }}</span>
    <span
      class="mi-mt-track"
      :class="`is-${size}`"
      role="meter"
      :aria-label="label ? undefined : ariaLabel"
      :aria-labelledby="label ? `${id}-l` : undefined"
      :aria-valuenow="value"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuetext="valueText ?? `${Math.round(pct)}%`"
      :style="{ background: tint }"
    >
      <span class="mi-mt-fill" :style="{ background: color ?? miChartColor(0), transform: `translate3d(${pct - 100}%,0,0)` }" />
    </span>
    <span v-if="caption || hint || $slots.default" class="mi-mt-foot">
      <slot><span>{{ caption }}</span><span>{{ hint }}</span></slot>
    </span>
  </div>
</template>

<style scoped>
.mi-mt{display:flex;flex-direction:column;gap:10px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-mt-label{font-size:13px;font-weight:600;color:var(--mi-label2)}
.mi-mt-track{display:block;border-radius:999px;overflow:hidden;contain:paint}
.mi-mt-track.is-sm{height:6px}
.mi-mt-track.is-md{height:10px}
.mi-mt-track.is-lg{height:14px}
.mi-mt-fill{display:block;width:100%;height:100%;border-radius:999px;transition:transform var(--mi-dur-4) var(--mi-ease)}
.mi-mt-foot{display:flex;justify-content:space-between;gap:12px;font-size:13px;color:var(--mi-label2)}
@starting-style{.mi-mt-fill{transform:translate3d(-100%,0,0)}}
</style>
