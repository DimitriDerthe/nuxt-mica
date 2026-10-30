<script setup lang="ts">
/** Set of toggle buttons sharing one v-model. Single selection by default, `multiple` for an array; variants, sizes, orientation, spacing. */
import { computed, ref } from 'vue'

export interface MiToggleGroupOption {
  value: string | number
  label?: string
  /** Accessible name, required for icon-only items (defaults to `label`). */
  ariaLabel?: string
  disabled?: boolean
}

defineSlots<{
  /** Custom content of each item, replacing `option.label`. */
  default?(props: { option: MiToggleGroupOption, pressed: boolean }): unknown
}>()

const props = withDefaults(defineProps<{
  /** Items in display order. Each option's `value` is what v-model holds. */
  options: MiToggleGroupOption[]
  /** `single` allows one pressed item (v-model is a value or null); `multiple` allows several (v-model is an array). */
  type?: 'single' | 'multiple'
  /** Alias of `type="multiple"`. */
  multiple?: boolean
  /** `outline` adds a hairline border. */
  variant?: 'default' | 'outline'
  /** Height and padding of the items. */
  size?: 'sm' | 'default' | 'lg'
  /** Lays items out in a row or a column and sets the arrow-key axis. */
  orientation?: 'horizontal' | 'vertical'
  /** Gap in 4px steps. `0` joins the items into one connected bar. */
  spacing?: number
  /** Blocks interaction and dims every item. */
  disabled?: boolean
  /** Accessible name of the group. */
  label?: string
}>(), {
  type: 'single',
  variant: 'default',
  size: 'default',
  orientation: 'horizontal',
  spacing: 1
})

/** Single: the pressed value or `null`. Multiple: array of pressed values. */
const model = defineModel<string | number | null | Array<string | number>>({ default: null })
const isMulti = computed(() => props.multiple || props.type === 'multiple')
const root = ref<HTMLElement | null>(null)

const selected = computed<Array<string | number>>(() =>
  Array.isArray(model.value) ? model.value : model.value === null ? [] : [model.value])

function isOn(o: MiToggleGroupOption) {
  return selected.value.includes(o.value)
}

function press(o: MiToggleGroupOption) {
  if (props.disabled || o.disabled) return
  if (isMulti.value) {
    model.value = isOn(o) ? selected.value.filter(v => v !== o.value) : [...selected.value, o.value]
  } else {
    model.value = isOn(o) ? null : o.value
  }
}

function onKeydown(e: KeyboardEvent) {
  const next = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  const prev = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  if (![next, prev, 'Home', 'End'].includes(e.key) || !root.value) return
  const items = Array.from(root.value.querySelectorAll<HTMLElement>('button:not([disabled])'))
  if (!items.length) return
  const cur = items.indexOf(e.target as HTMLElement)
  const to = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
    : (cur + (e.key === next ? 1 : -1) + items.length) % items.length
  e.preventDefault()
  items[to]!.focus()
}
</script>

<template>
  <div
    ref="root"
    class="mi-tgroup"
    :class="[`is-${orientation}`, { 'is-joined': spacing === 0 }]"
    role="group"
    :aria-label="label"
    :aria-orientation="orientation"
    :style="{ '--_gap': `${spacing * 4}px` }"
    @keydown="onKeydown"
  >
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="mi-tgroup__item"
      :class="[`is-${variant}`, `is-${size}`, { 'is-on': isOn(o) }]"
      :aria-pressed="isOn(o)"
      :aria-label="o.ariaLabel ?? (o.label ? undefined : String(o.value))"
      :data-state="isOn(o) ? 'on' : 'off'"
      :disabled="disabled || o.disabled"
      @click="press(o)"
    >
      <slot :option="o" :pressed="isOn(o)">{{ o.label }}</slot>
    </button>
  </div>
</template>

<style scoped>
.mi-tgroup { display: inline-flex; gap: var(--_gap); font-family: var(--mi-font); }
.mi-tgroup.is-vertical { flex-direction: column; align-items: stretch; }
.mi-tgroup__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: var(--_h);
  height: var(--_h);
  padding: 0 10px;
  border: .5px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--mi-label);
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform var(--mi-dur-2) var(--mi-spring), opacity var(--mi-dur-1) ease;
}
.mi-tgroup__item.is-sm { --_h: 32px; font-size: 13px; padding: 0 8px; }
.mi-tgroup__item.is-default { --_h: 36px; }
.mi-tgroup__item.is-lg { --_h: 44px; font-size: 15px; padding: 0 14px; }
.mi-tgroup__item.is-outline { border-color: var(--mi-sep); }
.mi-tgroup__item:hover { background: var(--mi-fill3); }
.mi-tgroup__item.is-on { background: var(--mi-p-tint); color: var(--mi-p-text); }
.mi-tgroup__item:active { transform: scale(.96); }
.mi-tgroup__item:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; z-index: 1; }
.mi-tgroup__item:disabled { opacity: .4; cursor: default; pointer-events: none; }

/* Connected bar: only the outer corners stay round, shared borders overlap. */
.is-joined .mi-tgroup__item { border-radius: 0; }
.is-joined .mi-tgroup__item:first-child { border-radius: 9px 0 0 9px; }
.is-joined .mi-tgroup__item:last-child { border-radius: 0 9px 9px 0; }
.is-joined.is-vertical .mi-tgroup__item:first-child { border-radius: 9px 9px 0 0; }
.is-joined.is-vertical .mi-tgroup__item:last-child { border-radius: 0 0 9px 9px; }
.is-joined:not(.is-vertical) .mi-tgroup__item.is-outline + .mi-tgroup__item.is-outline { margin-inline-start: -.5px; }
.is-joined.is-vertical .mi-tgroup__item.is-outline + .mi-tgroup__item.is-outline { margin-top: -.5px; }
</style>
