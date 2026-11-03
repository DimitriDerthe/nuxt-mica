<script setup lang="ts">
/** Styled native select element with optional option groups; v-model holds the chosen option value. */
import { computed, inject, useAttrs } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { MI_FIELD } from '../../utils/miInputs'
import type { MiSelectOption } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

export interface MiNativeSelectOption extends MiSelectOption {
  /** Group label; options sharing it render inside one optgroup. */
  group?: string
}

const props = withDefaults(defineProps<{
  /** Options; omit and use the default slot for raw option / optgroup elements. */
  options?: MiNativeSelectOption[]
  /** Disabled empty first option shown while nothing is chosen. */
  placeholder?: string
  /** Field height: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Overrides the surrounding MiField state when set. */
  invalid?: boolean
  /** Overrides the surrounding MiField disabled state when set. */
  disabled?: boolean
  /** Name submitted with the surrounding native form. */
  name?: string
}>(), { options: () => [], size: 'md', invalid: undefined, disabled: undefined })

/** Value of the selected option, or null when none is. */

const model = defineModel<string | number | null>({ default: null })
const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const id = computed(() => (attrs.id as string | undefined) ?? field?.id)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const selAttrs = computed(() => { const { class: _c, style: _s, id: _i, ...rest } = attrs; return rest })
const ungrouped = computed(() => props.options.filter(o => !o.group))
const groups = computed(() => {
  const map = new Map<string, MiNativeSelectOption[]>()
  for (const o of props.options) if (o.group) map.set(o.group, [...(map.get(o.group) ?? []), o])
  return [...map]
})

function onChange(e: Event) {
  const raw = (e.target as HTMLSelectElement).value
  const o = props.options.find(x => String(x.value) === raw)
  model.value = o ? o.value : raw
}
defineSlots<{
  /** Raw option and optgroup elements, used when `options` is omitted. */
  default?(): unknown
}>()
</script>

<template>
  <MiFieldBox class="mi-ns" v-bind="rootAttrs" :size="size" :invalid="isInvalid" :disabled="isDisabled">
    <select
      v-bind="selAttrs" :id="id" class="mi-ns__select mi:min-h-[inherit] mi:appearance-none" :name="name" :disabled="isDisabled" :value="model ?? ''"
      :aria-invalid="isInvalid || undefined" :aria-describedby="field?.describedBy.value" @change="onChange"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="o in ungrouped" :key="o.value" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      <optgroup v-for="[label, items] in groups" :key="label" :label="label">
        <option v-for="o in items" :key="o.value" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      </optgroup>
      <slot />
    </select>
    <svg class="mi-ns__chev mi:absolute mi:right-3 mi:top-1/2 mi:-mt-1.5 mi:text-label2 mi:pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 9l5-5 5 5M7 15l5 5 5-5" /></svg>
  </MiFieldBox>
</template>

<style scoped>
.mi-ns__select { flex: 1; min-width: 0; height: 100%; padding: 0 36px 0 14px; border: 0; background: transparent; color: inherit; font: inherit; outline: none; cursor: pointer; }
.mi-ns__select:disabled { cursor: not-allowed; color: var(--mi-label3); }
</style>
