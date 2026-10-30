<script setup lang="ts">
/** Checkboxes for multi-select, bound to an array v-model. Pass `options` or compose MiCheckbox children; `parentLabel` adds a select-all row. */
import { computed, provide } from 'vue'
import MiCheckbox from './MiCheckbox.vue'
import { MI_CHECKBOX_KEY } from '../../utils/miControls'

export interface MiCheckboxOption {
  value: string | number
  label: string
  description?: string
  disabled?: boolean
}

defineSlots<{
  /** Checkboxes composed by hand, replacing those generated from `options`. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Options rendered as checkboxes. Omit to compose MiCheckbox children yourself. */
  options?: MiCheckboxOption[]
  /** Label of a "select all" parent row with a mixed state. Needs `options`. */
  parentLabel?: string
  /** Accessible name of the group. */
  label?: string
  /** Blocks interaction and dims every checkbox in the group. */
  disabled?: boolean
}>(), {})

/** Values of the checked options. */

const model = defineModel<Array<string | number>>({ default: () => [] })

const enabled = computed(() => (props.options ?? []).filter(o => !o.disabled).map(o => o.value))
const checkedCount = computed(() => enabled.value.filter(v => model.value.includes(v)).length)
const allOn = computed(() => enabled.value.length > 0 && checkedCount.value === enabled.value.length)
const mixed = computed(() => checkedCount.value > 0 && !allOn.value)

provide(MI_CHECKBOX_KEY, {
  isChecked: v => model.value.includes(v as string | number),
  set: (v, on) => {
    const value = v as string | number
    const rest = model.value.filter(x => x !== value)
    model.value = on ? [...rest, value] : rest
  },
  disabled: () => !!props.disabled
})

function setAll(on: boolean) {
  const keep = model.value.filter(v => !enabled.value.includes(v))
  model.value = on ? [...keep, ...enabled.value] : keep
}
</script>

<template>
  <div class="mi-checkbox-group" role="group" :aria-label="label">
    <MiCheckbox
      v-if="parentLabel && options"
      class="mi-checkbox--parent"
      :label="parentLabel"
      :model-value="allOn"
      :indeterminate="mixed"
      :disabled="disabled"
      @update:model-value="setAll"
    />
    <div class="mi-checkbox-group__items" :class="{ 'is-nested': !!parentLabel }">
      <slot>
        <MiCheckbox v-for="o in options" :key="o.value" :value="o.value" :label="o.label" :description="o.description" :disabled="o.disabled" />
      </slot>
    </div>
  </div>
</template>

<style scoped>
.mi-checkbox-group { display: flex; flex-direction: column; gap: 4px; font-family: var(--mi-font); }
.mi-checkbox-group__items { display: flex; flex-direction: column; gap: 4px; }
.mi-checkbox-group__items.is-nested { padding-left: 32px; }
</style>
