<script setup lang="ts">
/** Circular progress: `ring` shows a value or an indeterminate arc; `stop` adds a stop square and can emit `stop`. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Current value. `null` spins an indeterminate arc (`ring`) or shows a full ring (`stop`). */
  value?: number | null
  /** Value that corresponds to a full ring. */
  max?: number
  /** Outer size in px. */
  size?: number
  /** Stroke width in px. Derived from the size when omitted. */
  stroke?: number
  /** Colour of the arc. */
  tone?: 'primary' | 'secondary'
  /** `ring` is a circular progress indicator, `stop` a ring with a stop square inside. */
  variant?: 'ring' | 'stop'
  /** Show the percentage in the centre. Defaults to true for rings of 56px and above. */
  showValue?: boolean
  /** Accessible name. */
  label?: string
  /** Make the `stop` variant a button that emits `stop`. */
  stoppable?: boolean
}>(), {
  value: null,
  max: 100,
  size: 64,
  showValue: undefined,
  tone: 'primary',
  variant: 'ring',
  label: 'Progress'
})

const emit = defineEmits<{ stop: [] }>()

const sw = computed(() => props.stroke ?? (props.variant === 'stop' ? 2 : props.size >= 56 ? 7 : props.size >= 36 ? 6 : Math.max(3, Math.round(props.size / 8))))
const r = computed(() => (props.variant === 'stop' ? (props.size - sw.value) / 2 : (props.size - sw.value) / 2 - 1.5))
const circ = computed(() => 2 * Math.PI * r.value)
const determinate = computed(() => props.value !== null && props.value !== undefined)
const pct = computed(() => (determinate.value ? Math.min(100, Math.max(0, ((props.value as number) / props.max) * 100)) : 0))
const centre = computed(() => props.showValue ?? (props.variant === 'ring' && props.size >= 56))
const color = computed(() => (props.tone === 'secondary' ? 'var(--mi-s)' : 'var(--mi-p)'))
const offset = computed(() => circ.value * (1 - pct.value / 100))
const square = computed(() => Math.max(6, Math.round(props.size * 0.32)))
const tag = computed(() => (props.variant === 'stop' && props.stoppable ? 'button' : 'span'))

defineSlots<{
  /** Centre content; replaces the percentage text. */
  default?(): unknown
}>()
</script>

<template>
  <component
    :is="tag"
    class="mi-ring"
    :class="[`is-${variant}`, { 'is-btn': tag === 'button' }]"
    :style="{ width: size + 'px', height: size + 'px', color }"
    :type="tag === 'button' ? 'button' : undefined"
    :role="tag === 'button' ? undefined : 'progressbar'"
    :aria-label="tag === 'button' ? `Stop ${label}`.trim() : label"
    :aria-valuemin="determinate && tag !== 'button' ? 0 : undefined"
    :aria-valuemax="determinate && tag !== 'button' ? max : undefined"
    :aria-valuenow="determinate && tag !== 'button' ? (value as number) : undefined"
    @click="tag === 'button' ? emit('stop') : undefined"
  >
    <svg class="mi-ring-svg mi:absolute mi:inset-0 mi:transform-[rotate(-90deg)] mi:[&.is-spin]:will-change-transform" :class="{ 'is-spin': !determinate && variant === 'ring' }" :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true" focusable="false">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke-width="sw" class="mi-ring-track mi:stroke-fill mi:[&.is-hidden]:opacity-0" :class="{ 'is-hidden': variant === 'stop' && !determinate }" />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="r"
        fill="none"
        stroke="currentColor"
        :stroke-width="sw"
        stroke-linecap="round"
        class="mi-ring-bar mi:[&.is-hidden]:opacity-0 mi:[transition:stroke-dashoffset_var(--mi-dur-4)_var(--mi-ease),opacity_var(--mi-dur-2)_var(--mi-ease)]"
        :class="{ 'is-hidden': determinate && pct <= 0 }"
        :stroke-dasharray="circ"
        :stroke-dashoffset="determinate ? offset : variant === 'stop' ? 0 : circ * 0.72"
      />
    </svg>
    <span v-if="variant === 'stop'" class="mi-ring-stop mi:relative mi:rounded-[2px] mi:bg-current" :style="{ width: square + 'px', height: square + 'px' }" />
    <span v-else-if="centre" class="mi-ring-val mi:relative mi:text-[14px] mi:font-bold mi:tabular-nums mi:text-label"><slot>{{ determinate ? Math.round(pct) + '%' : '' }}</slot></span>
  </component>
</template>

<style scoped>
.mi-ring{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:0;margin:0;border:0;background:transparent;font-family:var(--mi-font);color:var(--mi-p)}
.mi-ring.is-btn{cursor:pointer;border-radius:50%}
.mi-ring.is-btn:active{opacity:.6}
.mi-ring-svg.is-spin{animation:mi-ring-spin .9s linear infinite}
@keyframes mi-ring-spin{from{transform:rotate(-90deg)}to{transform:rotate(270deg)}}
</style>
