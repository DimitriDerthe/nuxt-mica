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
    class="mi-segmented"
    :class="[`is-${variant}`, { 'is-icons': iconOnly, 'is-disabled': disabled }]"
    role="radiogroup"
    :aria-label="label"
    :style="{ '--_n': options.length, '--_i': Math.max(index, 0) }"
    @keydown="onKeydown"
  >
    <span class="mi-segmented__thumb" :class="{ 'is-empty': index < 0 }" aria-hidden="true" />
    <button
      v-for="(o, i) in options"
      :key="o.value"
      type="button"
      role="radio"
      class="mi-segmented__seg"
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
      <span v-if="o.label" class="mi-segmented__text" :data-text="o.label">{{ o.label }}</span>
    </button>
  </div>
</template>

<style scoped>
.mi-segmented {
  --_pad: 2px;
  --_gap: 2px;
  --_h: 30px;
  --_r: 9px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(var(--_n), minmax(0, 1fr));
  gap: var(--_gap);
  padding: var(--_pad);
  border-radius: var(--_r);
  background: var(--mi-fill3);
  font-family: var(--mi-font);
  font-size: 13px;
  isolation: isolate;
}
.mi-segmented.is-tinted { --_pad: 3px; --_h: 36px; --_r: 999px; font-size: 15px; }
.mi-segmented.is-icons { display: inline-grid; width: max-content; align-self: flex-start; grid-template-columns: repeat(var(--_n), 56px); }
.mi-segmented.is-disabled { opacity: .4; }

/* The thumb never changes size: it slides with a transform, one cell plus one gap per index. */
.mi-segmented__thumb {
  position: absolute;
  top: var(--_pad);
  bottom: var(--_pad);
  left: var(--_pad);
  z-index: 0;
  width: calc((100% - 2 * var(--_pad) - (var(--_n) - 1) * var(--_gap)) / var(--_n));
  border-radius: calc(var(--_r) - var(--_pad));
  background: var(--mi-seg);
  box-shadow: 0 3px 8px rgba(0, 0, 0, .12), 0 3px 1px rgba(0, 0, 0, .04);
  transform: translateX(calc(var(--_i) * (100% + var(--_gap))));
  transition: transform var(--mi-dur-3) var(--mi-spring), opacity var(--mi-dur-1) ease;
  pointer-events: none;
}
.is-tinted .mi-segmented__thumb { background: var(--mi-p); box-shadow: none; }
.mi-segmented__thumb.is-empty { opacity: 0; }

.mi-segmented__seg {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--_h);
  min-width: 0;
  padding: 0 6px;
  border: 0;
  border-radius: calc(var(--_r) - var(--_pad));
  background: transparent;
  color: var(--mi-label);
  font: inherit;
  font-weight: 500;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
}
.is-tinted .mi-segmented__seg { font-weight: 600; }
.mi-segmented__seg.is-on { font-weight: 600; }
.is-tinted .mi-segmented__seg.is-on { color: var(--mi-p-on); }
.mi-segmented__seg:disabled { opacity: .4; cursor: default; }

/* A hidden bold copy reserves the widest width so the weight change never shifts layout. */
.mi-segmented__text { display: inline-flex; flex-direction: column; align-items: center; overflow: hidden; text-overflow: ellipsis; }
.mi-segmented__text::after {
  content: attr(data-text);
  height: 0;
  overflow: hidden;
  visibility: hidden;
  font-weight: 600;
}
</style>
