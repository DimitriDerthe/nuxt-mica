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
    class="mi-tgroup mi:font-mi mi:[&.is-vertical]:flex-col"
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
      class="mi-tgroup__item mi:inline-flex mi:items-center mi:justify-center mi:gap-1.5 mi:min-w-(--_h) mi:h-(--_h) mi:py-0 mi:px-2.5 mi:[border:.5px_solid_transparent] mi:rounded-[9px] mi:bg-transparent mi:text-label mi:whitespace-nowrap mi:cursor-pointer mi:[-webkit-tap-highlight-color:transparent] mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),_opacity_var(--mi-dur-1)_ease] mi:[&.is-outline]:border-sep mi:[&.is-on]:text-p-text mi:active:transform-[scale(.96)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:z-1 mi:disabled:opacity-40 mi:disabled:cursor-default mi:disabled:pointer-events-none mi:[.is-joined_&]:rounded-none mi:[.is-joined_&:first-child]:rounded-[9px_0_0_9px] mi:[.is-joined_&:last-child]:rounded-[0_9px_9px_0] mi:[.is-joined.is-vertical_&:first-child]:rounded-[9px_9px_0_0] mi:[.is-joined.is-vertical_&:last-child]:rounded-[0_0_9px_9px] mi:[.is-joined:not(.is-vertical)_.mi-tgroup__item.is-outline+&.is-outline]:ms-[-.5px] mi:[.is-joined.is-vertical_.mi-tgroup__item.is-outline+&.is-outline]:mt-[-.5px]"
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
.mi-tgroup { display: inline-flex; gap: var(--_gap); }
.mi-tgroup.is-vertical { align-items: stretch; }
.mi-tgroup__item {
  font: inherit;
  font-size: 14px;
  font-weight: 500;
}
.mi-tgroup__item.is-sm { --_h: 32px; font-size: 13px; padding: 0 8px; }
.mi-tgroup__item.is-default { --_h: 36px; }
.mi-tgroup__item.is-lg { --_h: 44px; font-size: 15px; padding: 0 14px; }
.mi-tgroup__item:hover { background: var(--mi-fill3); }
.mi-tgroup__item.is-on { background: var(--mi-p-tint); }
</style>
