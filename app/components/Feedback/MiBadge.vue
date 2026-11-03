<script lang="ts">
export type MiBadgePlacement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
</script>

<script setup lang="ts">
/** Status marker: a count, a dot or a label badge, optionally anchored to a `target` slot (`dotOnly` for a bare dot). */
import { computed, useSlots } from 'vue'
import { miFeedbackToneVars, type MiFeedbackTone } from '../../utils/miOverlay'

const props = withDefaults(defineProps<{
  /** Defaults to `danger` for counts and `primary` otherwise. */
  tone?: MiFeedbackTone
  /** `tint` is soft, `solid` filled, `outline` a hairline tag. */
  variant?: 'solid' | 'tint' | 'outline'
  /** Corner style of label badges. Outline badges default to `rounded`. */
  shape?: 'pill' | 'rounded'
  /** Leading status dot inside a label badge. */
  dot?: boolean
  /** Numeric count; switches the badge to count mode. Hidden at 0 unless `showZero`. */
  count?: number
  /** Cap for the displayed count; above it the badge shows `max+`. */
  max?: number
  /** Keeps a count badge visible when `count` is 0 instead of hiding it. */
  showZero?: boolean
  /** Status dot only, no text. Usually combined with the `target` slot. */
  dotOnly?: boolean
  /** Diameter of the `dotOnly` badge in px. */
  dotSize?: number
  /** Where the badge sits on the `target` slot. */
  placement?: MiBadgePlacement
  /** Distance outside the target corner in px. */
  offset?: number
  /** Colour of the cut-out ring around anchored badges. */
  ringColor?: string
  /** Text for label badges, as an alternative to the default slot. */
  label?: string
  /** Accessible name; defaults to `<count> <countNoun>`. */
  ariaLabel?: string
  /** Noun in the accessible label, e.g. `unread` gives "3 unread". */
  countNoun?: string
}>(), {
  variant: 'tint',
  max: 99,
  dotSize: 10,
  placement: 'top-right',
  ringColor: 'var(--mi-card)',
  countNoun: 'unread'
})

const slots = useSlots()
const anchored = computed(() => !!slots.target)
const mode = computed<'count' | 'dot' | 'label'>(() => (props.count !== undefined ? 'count' : props.dotOnly ? 'dot' : 'label'))
const tone = computed<MiFeedbackTone>(() => props.tone ?? (mode.value === 'count' ? 'danger' : 'primary'))
const vars = computed(() => miFeedbackToneVars(tone.value))
const hidden = computed(() => mode.value === 'count' && !props.showZero && (props.count ?? 0) <= 0)
const countText = computed(() => ((props.count ?? 0) > props.max ? `${props.max}+` : String(props.count ?? 0)))
const shape = computed(() => props.shape ?? (props.variant === 'outline' ? 'rounded' : 'pill'))
const name = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (mode.value === 'count') return `${(props.count ?? 0) > props.max ? `${props.max} or more` : props.count} ${props.countNoun}`
  return undefined
})

const posStyle = computed(() => {
  if (!anchored.value) return undefined
  const [v, h] = props.placement.split('-') as ['top' | 'bottom', 'left' | 'right']
  let oy: number
  let ox: number
  if (props.offset !== undefined) {
    oy = ox = -props.offset
  } else if (mode.value === 'dot') {
    oy = v === 'top' ? -3 : 0
    ox = v === 'top' ? -3 : 0
  } else {
    oy = -6
    ox = countText.value.length > 2 ? -10 : -6
  }
  return { [v]: `${oy}px`, [h]: `${ox}px`, '--ring': props.ringColor }
})

defineSlots<{
  /** Element the badge is anchored to; the badge is positioned on its corner per `placement`. */
  target?(): unknown
  /** Badge text, replacing `label`; used in label mode only. */
  default?(): unknown
}>()
</script>

<template>
  <span v-if="anchored" class="mi-badge-host">
    <slot name="target" />
    <span
      v-if="!hidden"
      class="mi-badge is-anchored"
      :class="[`m-${mode}`, `v-${variant}`]"
      :style="[vars, posStyle]"
      :role="name ? 'img' : undefined"
      :aria-label="name"
      :aria-hidden="mode === 'dot' && !name ? 'true' : undefined"
    >
      <template v-if="mode === 'count'">{{ countText }}</template>
      <template v-else-if="mode === 'label'"><slot>{{ label }}</slot></template>
      <span v-if="mode === 'dot'" class="mi-badge-dotfill mi:block mi:rounded-[50%] mi:[background:var(--t-dot)] mi:flex-[none] mi:[.mi-badge.m-dot.is-anchored_&]:shadow-[0_0_0_2px_var(--ring,var(--mi-card))]" :style="{ width: dotSize + 'px', height: dotSize + 'px' }" />
    </span>
  </span>
  <span
    v-else-if="!hidden"
    class="mi-badge"
    :class="[`m-${mode}`, `v-${variant}`, `s-${shape}`, { 'has-dot': dot }]"
    :style="vars"
    :role="name ? 'img' : undefined"
    :aria-label="name"
  >
    <span v-if="dot && mode === 'label'" class="mi-badge-dot mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[background:var(--t-dot)] mi:flex-[none]" aria-hidden="true" />
    <template v-if="mode === 'count'">{{ countText }}</template>
    <template v-else-if="mode === 'label'"><slot>{{ label }}</slot></template>
    <span v-else class="mi-badge-dotfill mi:block mi:rounded-[50%] mi:[background:var(--t-dot)] mi:flex-[none] mi:[.mi-badge.m-dot.is-anchored_&]:shadow-[0_0_0_2px_var(--ring,var(--mi-card))]" :style="{ width: dotSize + 'px', height: dotSize + 'px' }" />
  </span>
</template>

<style scoped>
.mi-badge-host{position:relative;display:inline-flex;font-family:var(--mi-font)}
.mi-badge{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;gap:6px;font-family:var(--mi-font);white-space:nowrap;letter-spacing:-.005em}
.mi-badge.is-anchored{position:absolute;box-shadow:0 0 0 2px var(--ring,var(--mi-card))}
.mi-badge.m-label{height:24px;padding:0 10px;font-size:12px;line-height:16px;font-weight:600;border-radius:999px}
.mi-badge.m-label.s-rounded{border-radius:6px}
.mi-badge.m-label.v-tint{background:var(--t-bg);color:var(--t-text)}
.mi-badge.m-label.v-solid{background:var(--t-solid);color:var(--t-on);font-weight:700}
.mi-badge.m-label.v-outline{color:var(--mi-label2);box-shadow:inset 0 0 0 1px var(--mi-sep2)}
.mi-badge.m-count{min-width:20px;height:20px;padding:0 6px;border-radius:999px;font-size:12px;line-height:16px;font-weight:700;background:var(--t-solid);color:var(--t-on);font-variant-numeric:tabular-nums}
.mi-badge.m-count:not(.is-anchored){box-shadow:none}
.mi-badge.m-dot{padding:0;background:transparent;border-radius:50%}
.mi-badge.m-dot.is-anchored{background:transparent}
.mi-badge.m-dot.is-anchored{box-shadow:none}
.mi-badge.m-label.is-anchored{height:20px;padding:0 6px}
</style>
