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
  <div class="mi-prog" :class="`is-${size}`">
    <div v-if="header" class="mi-prog-head">
      <span class="mi-prog-label">{{ label }}</span>
      <span v-if="showValue !== false && text" class="mi-prog-val">{{ text }}</span>
    </div>
    <span v-if="segmented" class="mi-prog-track is-seg" role="img" :aria-label="summary">
      <span v-for="(s, i) in segs" :key="i" class="mi-prog-seg" :style="{ width: s.width + '%', background: s.color }" />
    </span>
    <span
      v-else
      class="mi-prog-track"
      role="progressbar"
      :aria-label="label"
      :aria-valuemin="indeterminate ? undefined : 0"
      :aria-valuemax="indeterminate ? undefined : max"
      :aria-valuenow="indeterminate ? undefined : value ?? undefined"
      :aria-valuetext="indeterminate ? undefined : text || undefined"
    >
      <span class="mi-prog-fill" :class="{ 'is-indet': indeterminate }" :style="[{ background: COLOR[tone] }, fillStyle]" />
    </span>
    <ul v-if="segmented && legend" class="mi-prog-legend">
      <li v-for="(s, i) in segs" :key="i"><span class="mi-prog-dot" :style="{ background: s.color }" />{{ s.label }}</li>
    </ul>
  </div>
</template>

<style scoped>
.mi-prog{display:flex;flex-direction:column;gap:8px;font-family:var(--mi-font);color:var(--mi-label);--h:6px}
.mi-prog.is-sm{--h:4px}
.mi-prog.is-lg{--h:10px}
.mi-prog-head{display:flex;justify-content:space-between;gap:12px;font-size:13px;line-height:18px}
.mi-prog-label{font-weight:600}
.mi-prog-val{color:var(--mi-label2);font-variant-numeric:tabular-nums;margin-left:auto}
.mi-prog-track{display:block;position:relative;height:var(--h);border-radius:999px;background:var(--mi-fill);overflow:hidden;contain:paint}
.mi-prog-track.is-seg{display:flex;gap:2px}
.mi-prog-fill{display:block;width:100%;height:100%;border-radius:999px;transition:transform var(--mi-dur-4) var(--mi-ease)}
.mi-prog-fill.is-indet{width:36%;transform:translate3d(-110%,0,0);animation:mi-prog-indet 1.3s cubic-bezier(.45,.05,.55,.95) infinite;will-change:transform}
.mi-prog-seg{flex:none;height:100%;border-radius:999px;transform-origin:0 50%;animation:mi-prog-grow var(--mi-dur-4) var(--mi-ease) both}
.mi-prog-legend{display:flex;flex-wrap:wrap;gap:4px 14px;margin:0;padding:0;list-style:none;font-size:12px;line-height:16px;color:var(--mi-label2)}
.mi-prog-legend li{display:inline-flex;align-items:center;gap:5px}
.mi-prog-dot{width:8px;height:8px;border-radius:50%;flex:none}
@keyframes mi-prog-indet{0%{transform:translate3d(-110%,0,0)}100%{transform:translate3d(280%,0,0)}}
@keyframes mi-prog-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
</style>
