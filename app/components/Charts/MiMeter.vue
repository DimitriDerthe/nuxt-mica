<script setup lang="ts">
/** Linear progress meter for one value between min and max, such as quota or budget use, with optional caption and hint. */
import { computed, useId } from 'vue'
import { miChartColor } from '../../utils/miChartPalette'
import { miSafeColor } from '../../utils/miSafe'

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
const safeColor = computed(() => miSafeColor(props.color, undefined))
const tint = computed(() => safeColor.value ? `color-mix(in srgb, ${safeColor.value} 16%, transparent)` : 'var(--mi-p-tint)')

const _slots = defineSlots<{
  /** Replaces the footer; defaults to the caption on the left and the hint on the right. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-mt mi:flex-col">
    <span v-if="label" :id="`${id}-l`" class="mi-mt-label mi:text-[13px] mi:font-semibold mi:text-label2">{{ label }}</span>
    <span
      class="mi-mt-track mi:block mi:rounded-[999px] mi:overflow-hidden mi:[contain:paint]"
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
      <span class="mi-mt-fill mi:block mi:w-full mi:h-full mi:rounded-[999px] mi:[transition:transform_var(--mi-dur-4)_var(--mi-ease)]" :style="{ background: safeColor ?? miChartColor(0), transform: `translate3d(${pct - 100}%,0,0)` }" />
    </span>
    <span v-if="caption || hint || $slots.default" class="mi-mt-foot mi:flex mi:justify-between mi:gap-3 mi:text-[13px] mi:text-label2">
      <slot><span>{{ caption }}</span><span>{{ hint }}</span></slot>
    </span>
  </div>
</template>

<style scoped>
.mi-mt{display:flex;gap:10px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-mt-track.is-sm{height:6px}
.mi-mt-track.is-md{height:10px}
.mi-mt-track.is-lg{height:14px}
@starting-style{.mi-mt-fill{transform:translate3d(-100%,0,0)}}
</style>
