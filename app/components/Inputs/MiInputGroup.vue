<script setup lang="ts">
/** Input or textarea with addons (icons, text, buttons) on any side, sharing one field surface. */
import { computed, inject, useAttrs } from 'vue'
import MiFieldBox from './MiFieldBox.vue'
import { MI_FIELD } from '../../utils/miInputs'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Render a textarea instead of an input; use block-start / block-end addons with it. */
  multiline?: boolean
  /** Textarea rows when multiline. */
  rows?: number
  /** Field height: `sm` is compact, `md` the standard size. */
  size?: 'sm' | 'md'
  /** Overrides the surrounding MiField state when set. */
  invalid?: boolean
  /** Overrides the surrounding MiField disabled state when set. */
  disabled?: boolean
}>(), { rows: 3, size: 'md', invalid: undefined, disabled: undefined })

/** Text value of the field inside the group. */

const model = defineModel<string>({ default: '' })
const attrs = useAttrs()
const field = inject(MI_FIELD, null)
const id = computed(() => (attrs.id as string | undefined) ?? field?.id)
const isInvalid = computed(() => props.invalid ?? field?.invalid.value ?? false)
const isDisabled = computed(() => props.disabled ?? field?.disabled.value ?? false)
const rootAttrs = computed(() => ({ class: attrs.class, style: attrs.style }))
const inAttrs = computed(() => { const { class: _c, style: _s, id: _i, ...rest } = attrs; return rest })
defineSlots<{
  /** Addon at the start of the line (icon, text or button). */
  'inline-start'?(): unknown
  /** Alias of inline-start. */
  leading?(): unknown
  /** Addon at the end of the line (icon, text or button). */
  'inline-end'?(): unknown
  /** Alias of inline-end. */
  trailing?(): unknown
  /** Bar above a multiline field, such as a toolbar. */
  'block-start'?(): unknown
  /** Bar below a multiline field, such as a send button row. */
  'block-end'?(): unknown
}>()
</script>

<template>
  <MiFieldBox class="mi-ig mi:flex-col" :class="{ 'mi-ig--multi': multiline }" v-bind="rootAttrs" role="group" :size="size" :invalid="isInvalid" :disabled="isDisabled">
    <div v-if="$slots['block-start']" class="mi-ig__block mi-ig__block--start mi:flex mi:items-center mi:gap-1.5 mi:py-2 mi:px-3 mi:text-label2 mi:text-[.9em]"><slot name="block-start" /></div>
    <div class="mi-ig__row mi:flex mi:items-center mi:flex-1 mi:min-w-0 mi:min-h-[inherit]">
      <span v-if="$slots['inline-start'] || $slots.leading" class="mi-ig__addon mi:flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:text-label2 mi:text-[.9em]"><slot name="inline-start"><slot name="leading" /></slot></span>
      <textarea
        v-if="multiline" v-bind="inAttrs" :id="id" v-model="model" class="mi-ig__input mi-ig__input--area mi:self-stretch mi:[border:0] mi:[outline:none] mi:resize-none" :rows="rows" :disabled="isDisabled"
        :aria-invalid="isInvalid || undefined" :aria-describedby="field?.describedBy.value"
      />
      <input
        v-else v-bind="inAttrs" :id="id" v-model="model" class="mi-ig__input mi:self-stretch mi:[border:0] mi:[outline:none]" :disabled="isDisabled"
        :aria-invalid="isInvalid || undefined" :aria-describedby="field?.describedBy.value"
      >
      <span v-if="$slots['inline-end'] || $slots.trailing" class="mi-ig__addon mi-ig__addon--end mi:flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:text-label2 mi:text-[.9em]"><slot name="inline-end"><slot name="trailing" /></slot></span>
    </div>
    <div v-if="$slots['block-end']" class="mi-ig__block mi-ig__block--end mi:flex mi:items-center mi:gap-1.5 mi:py-2 mi:px-3 mi:text-label2 mi:text-[.9em]"><slot name="block-end" /></div>
  </MiFieldBox>
</template>

<style scoped>
.mi-ig { align-items: stretch; }
.mi-ig__input { flex: 1; min-width: 0; padding: 0 14px; background: transparent; color: inherit; font: inherit; }
.mi-ig__input--area { padding: 10px 14px; }
.mi-ig__input::placeholder { color: var(--mi-label2); }
.mi-ig__addon { padding: 0 8px 0 12px; }
.mi-ig__addon--end { padding: 0 8px 0 4px; }
</style>
