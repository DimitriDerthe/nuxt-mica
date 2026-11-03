<script setup lang="ts">
/** Segmented control to switch between a few mutually exclusive views or modes. Segments use text or icons; `tinted` variant for emphasis. */
import { computed, ref } from 'vue'
import { miRovingKey } from '../../utils/miControls'

export interface MiSegmentedOption {
  value: string | number
  label?: string
  /** Built-in glyph: `list`, `grid` or `columns`. Use the `icon` slot for anything else. */
  icon?: 'list' | 'grid' | 'columns'
  /** Accessible name, required for icon-only segments (defaults to `label`). */
  ariaLabel?: string
  disabled?: boolean
}

defineSlots<{
  /** Custom icon for a segment, replacing the built-in glyph of `option.icon`. */
  icon?(props: { option: MiSegmentedOption, active: boolean }): unknown
}>()

const props = withDefaults(defineProps<{
  /** Segments in display order. Each option's `value` is what v-model holds. */
  options: MiSegmentedOption[]
  /** `regular` is the neutral 30px control, `tinted` the pill filled with the primary color. */
  variant?: 'regular' | 'tinted'
  /** Accessible name of the group. */
  label?: string
  /** Blocks interaction and dims the whole control. */
  disabled?: boolean
}>(), {
  variant: 'regular'
})

/** Value of the selected segment, or null when none is. */

const model = defineModel<string | number | null>({ default: null })
const root = ref<HTMLElement | null>(null)

const index = computed(() => props.options.findIndex(o => o.value === model.value))
const firstEnabled = computed(() => props.options.findIndex(o => !o.disabled))
const iconOnly = computed(() => props.options.length > 0 && props.options.every(o => !o.label))

function tabindex(i: number) {
  return (index.value >= 0 ? index.value : firstEnabled.value) === i ? 0 : -1
}

function pick(o: MiSegmentedOption) {
  if (!props.disabled && !o.disabled) model.value = o.value
}

function onKeydown(e: KeyboardEvent) {
  miRovingKey(e, root.value, '[role="radio"]')
}
</script>

<template>
  <div
    ref="root"
    class="mi-segmented mi:[--_pad:2px] mi:[--_gap:2px] mi:[--_h:30px] mi:[--_r:9px] mi:isolate mi:[&.is-tinted]:[--_pad:3px] mi:[&.is-tinted]:[--_h:36px] mi:[&.is-tinted]:[--_r:999px] mi:[&.is-icons]:[align-self:flex-start]"
    :class="[`is-${variant}`, { 'is-icons': iconOnly, 'is-disabled': disabled }]"
    role="radiogroup"
    :aria-label="label"
    :style="{ '--_n': options.length, '--_i': Math.max(index, 0) }"
    @keydown="onKeydown"
  >
    <span class="mi-segmented__thumb mi:absolute mi:top-(--_pad) mi:bottom-(--_pad) mi:left-(--_pad) mi:z-0 mi:w-[calc((100%_-_2_*_var(--\_pad)_-_(var(--\_n)_-_1)_*_var(--\_gap))_/_var(--\_n))] mi:rounded-[calc(var(--\_r)_-_var(--\_pad))] mi:bg-seg mi:shadow-[0_3px_8px_rgba(0,_0,_0,_.12),_0_3px_1px_rgba(0,_0,_0,_.04)] mi:transform-[translateX(calc(var(--\_i)_*_(100%_+_var(--\_gap))))] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring),_opacity_var(--mi-dur-1)_ease] mi:pointer-events-none mi:[.is-tinted_&]:bg-p mi:[.is-tinted_&]:shadow-none mi:[&.is-empty]:opacity-0" :class="{ 'is-empty': index < 0 }" aria-hidden="true" />
    <button
      v-for="(o, i) in options"
      :key="o.value"
      type="button"
      role="radio"
      class="mi-segmented__seg mi:relative mi:z-1 mi:flex mi:items-center mi:justify-center mi:h-(--_h) mi:min-w-0 mi:py-0 mi:px-1.5 mi:[border:0] mi:rounded-[calc(var(--\_r)_-_var(--\_pad))] mi:bg-transparent mi:text-label mi:whitespace-nowrap mi:[-webkit-tap-highlight-color:transparent] mi:[.is-tinted_&.is-on]:text-p-on mi:disabled:opacity-40 mi:disabled:cursor-default"
      :class="{ 'is-on': i === index }"
      :aria-checked="i === index"
      :aria-label="o.ariaLabel ?? (o.label ? undefined : String(o.value))"
      :tabindex="tabindex(i)"
      :disabled="disabled || o.disabled"
      @click="pick(o)"
    >
      <slot name="icon" :option="o" :active="i === index">
        <svg v-if="o.icon === 'list'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r=".8" /><circle cx="4.5" cy="12" r=".8" /><circle cx="4.5" cy="18" r=".8" /></svg>
        <svg v-else-if="o.icon === 'grid'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>
        <svg v-else-if="o.icon === 'columns'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="14" rx="2.5" /><path d="M9.2 5v14M14.8 5v14" /></svg>
      </slot>
      <span v-if="o.label" class="mi-segmented__text mi:inline-flex mi:flex-col mi:items-center mi:overflow-hidden mi:text-ellipsis mi:after:content-[attr(data-text)] mi:after:h-0 mi:after:overflow-hidden mi:after:invisible mi:after:font-semibold" :data-text="o.label">{{ o.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.mi-segmented {
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--_n), minmax(0, 1fr));
  gap: var(--_gap);
  padding: var(--_pad);
  border-radius: var(--_r);
  background: var(--mi-fill3);
  font-family: var(--mi-font);
  font-size: 13px;
}
.mi-segmented.is-tinted { font-size: 15px; }
.mi-segmented.is-icons { display: inline-grid; width: max-content; grid-template-columns: repeat(var(--_n), 56px); }
.mi-segmented.is-disabled { opacity: .4; }

.mi-segmented__seg {
  font: inherit;
  font-weight: 500;
}
.is-tinted .mi-segmented__seg { font-weight: 600; }
.mi-segmented__seg.is-on { font-weight: 600; }
</style>
