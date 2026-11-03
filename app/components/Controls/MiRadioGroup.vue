<script setup lang="ts">
/** Radio group for one choice, bound to a v-model value with arrow-key navigation. Pass `options` or compose MiRadio children. */
import { provide, ref } from 'vue'
import MiRadio from './MiRadio.vue'
import { MI_RADIO_KEY, miRovingKey } from '../../utils/miControls'

export interface MiRadioOption {
  value: string | number | boolean
  label: string
  description?: string
  disabled?: boolean
}

defineSlots<{
  /** Radios composed by hand, replacing those generated from `options`. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Options rendered as radios. Omit to compose MiRadio children yourself. */
  options?: MiRadioOption[]
  /** Accessible name of the group. */
  label?: string
  /** Lays radios out in a column or a row and sets the arrow-key axis. */
  orientation?: 'vertical' | 'horizontal'
  /** Blocks interaction and dims every radio in the group. */
  disabled?: boolean
}>(), {
  orientation: 'vertical'
})

/** Value of the selected radio, or null when none is. */

const model = defineModel<string | number | boolean | null>({ default: null })
const root = ref<HTMLElement | null>(null)

provide(MI_RADIO_KEY, {
  name: '',
  isSelected: v => model.value === v,
  hasSelection: () => model.value !== null && model.value !== undefined,
  select: (v) => { model.value = v as string | number | boolean },
  disabled: () => !!props.disabled
})

function onKeydown(e: KeyboardEvent) {
  miRovingKey(e, root.value, '[role="radio"]')
}
</script>

<template>
  <div ref="root" class="mi-radio-group mi:flex-col mi:[&.is-horizontal]:flex-row" :class="`is-${orientation}`" role="radiogroup" :aria-label="label" :aria-orientation="orientation" @keydown="onKeydown">
    <slot>
      <MiRadio v-for="o in options" :key="String(o.value)" :value="o.value" :label="o.label" :description="o.description" :disabled="o.disabled" />
    </slot>
  </div>
</template>

<style scoped>
.mi-radio-group { display: flex; gap: 4px; font-family: var(--mi-font); }
.mi-radio-group.is-horizontal { flex-wrap: wrap; gap: 4px 24px; }
.is-horizontal :deep(.mi-radio) { width: auto; }
</style>
