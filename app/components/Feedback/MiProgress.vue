<script lang="ts">
export interface MiProgressSegment {
  value: number
  label?: string
  tone?: 'primary' | 'secondary' | 'neutral'
}
</script>

<script setup lang="ts">
/** Linear progress bar: determinate with `value`, indeterminate when `value` is null, or multi-part with `segments` and a legend. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Current value. `null` or `undefined` renders the indeterminate bar. */
  value?: number | null
  /** Value that corresponds to a full bar. */
  max?: number
  /** Text on the left of the header; also the accessible name. */
  label?: string
  /** Text on the right of the header. Defaults to the percentage when `value` is set. */
  valueText?: string
  /** Show the header value. Defaults to true whenever a label or value text exists. */
  showValue?: boolean
  /** Bar thickness. */
  size?: 'sm' | 'md' | 'lg'
  /** Fill colour of the bar. */
  tone?: 'primary' | 'secondary'
  /** Multi-part bar (such as storage by category). Overrides `value`. */
  segments?: MiProgressSegment[]
  /** Show a legend below the segments. */
  legend?: boolean
}>(), {
  value: null,
  max: 100,
  showValue: undefined,
  size: 'md',
  tone: 'primary',
  legend: true
})

const COLOR = { primary: 'var(--mi-p)', secondary: 'var(--mi-s)', neutral: 'var(--mi-ctl,var(--mi-label2))' } as const

const segmented = computed(() => !!props.segments?.length)
const indeterminate = computed(() => !segmented.value && (props.value === null || props.value === undefined))
const pct = computed(() => {
  if (indeterminate.value || props.value == null) return 0
  return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})
const text = computed(() => props.valueText ?? (indeterminate.value || segmented.value ? '' : `${Math.round(pct.value)} %`))
const header = computed(() => !!props.label || (props.showValue !== false && !!text.value))
const segs = computed(() => (props.segments ?? []).map(s => ({
  ...s,
  width: Math.min(100, Math.max(0, (s.value / props.max) * 100)),
  color: COLOR[s.tone ?? 'primary']
})))
const summary = computed(() => {
  const parts = segs.value.map(s => `${s.label ?? ''} ${Math.round(s.width)} %`.trim())
  return [props.label, parts.join(', ')].filter(Boolean).join(': ')
})
const fillStyle = computed(() => (indeterminate.value ? undefined : { transform: `translate3d(${pct.value - 100}%,0,0)` }))
</script>

<template>
  <div class="mi-prog mi:flex-col mi:[--h:6px]" :class="`is-${size}`">
    <div v-if="header" class="mi-prog-head mi:flex mi:justify-between mi:gap-3 mi:text-[13px] mi:leading-[18px]">
      <span class="mi-prog-label mi:font-semibold">{{ label }}</span>
      <span v-if="showValue !== false && text" class="mi-prog-val mi:text-label2 mi:tabular-nums mi:ml-auto">{{ text }}</span>
    </div>
    <span v-if="segmented" class="mi-prog-track is-seg mi:block mi:relative mi:h-(--h) mi:rounded-[999px] mi:bg-fill mi:overflow-hidden mi:[contain:paint] mi:[&.is-seg]:flex mi:[&.is-seg]:gap-0.5" role="img" :aria-label="summary">
      <span v-for="(s, i) in segs" :key="i" class="mi-prog-seg mi:flex-[none] mi:h-full mi:rounded-[999px] mi:origin-[0_50%]" :style="{ width: s.width + '%', background: s.color }" />
    </span>
    <span
      v-else
      class="mi-prog-track mi:block mi:relative mi:h-(--h) mi:rounded-[999px] mi:bg-fill mi:overflow-hidden mi:[contain:paint] mi:[&.is-seg]:flex mi:[&.is-seg]:gap-0.5"
      role="progressbar"
      :aria-label="label"
      :aria-valuemin="indeterminate ? undefined : 0"
      :aria-valuemax="indeterminate ? undefined : max"
      :aria-valuenow="indeterminate ? undefined : value ?? undefined"
      :aria-valuetext="indeterminate ? undefined : text || undefined"
    >
      <span class="mi-prog-fill mi:block mi:w-full mi:h-full mi:rounded-[999px] mi:[transition:transform_var(--mi-dur-4)_var(--mi-ease)] mi:[&.is-indet]:w-[36%] mi:[&.is-indet]:transform-[translate3d(-110%,0,0)] mi:[&.is-indet]:will-change-transform" :class="{ 'is-indet': indeterminate }" :style="[{ background: COLOR[tone] }, fillStyle]" />
    </span>
    <ul v-if="segmented && legend" class="mi-prog-legend mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:leading-4 mi:text-label2">
      <li class="mi:[.mi-prog-legend_&]:inline-flex mi:[.mi-prog-legend_&]:items-center mi:[.mi-prog-legend_&]:gap-[5px]" v-for="(s, i) in segs" :key="i"><span class="mi-prog-dot mi:w-2 mi:h-2 mi:rounded-[50%] mi:flex-[none]" :style="{ background: s.color }" />{{ s.label }}</li>
    </ul>
  </div>
</template>

<style scoped>
.mi-prog{display:flex;gap:8px;font-family:var(--mi-font);color:var(--mi-label)}
.mi-prog.is-sm{--h:4px}
.mi-prog.is-lg{--h:10px}
.mi-prog-fill.is-indet{animation:mi-prog-indet 1.3s cubic-bezier(.45,.05,.55,.95) infinite}
.mi-prog-seg{animation:mi-prog-grow var(--mi-dur-4) var(--mi-ease) both}
@keyframes mi-prog-indet{0%{transform:translate3d(-110%,0,0)}100%{transform:translate3d(280%,0,0)}}
@keyframes mi-prog-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
</style>
