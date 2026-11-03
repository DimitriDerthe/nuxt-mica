<script setup lang="ts">
/** Field wrapper that renders the label, hint, error and success messages and provides id and state to the control inside it. */
import { computed, provide, useId } from 'vue'
import { MI_FIELD } from '../../utils/miInputs'

const props = defineProps<{
  /** Label shown above the control and linked to it for assistive tech. */
  label?: string
  /** Help text under the control. Replaced by `error` when there is one. */
  hint?: string
  /** Error message. Sets the control into its invalid state. */
  error?: string
  /** Positive message, shown with a check mark. */
  success?: string
  /** Marks the label with an asterisk and flags the control as required. */
  required?: boolean
  /** Dims the label and disables the control inside the field. */
  disabled?: boolean
  /** Id of the control. Generated when omitted. */
  for?: string
}>()

const uid = useId()
const id = computed(() => props.for ?? `mi-f-${uid}`)
const msgId = `mi-f-msg-${uid}`
const hasMsg = computed(() => !!(props.error || props.success || props.hint))
const describedBy = computed(() => (hasMsg.value ? msgId : undefined))
const kind = computed(() => (props.error ? 'error' : props.success ? 'success' : 'hint'))

provide(MI_FIELD, {
  get id() { return id.value },
  describedBy,
  invalid: computed(() => !!props.error),
  success: computed(() => !props.error && !!props.success),
  disabled: computed(() => !!props.disabled),
  required: computed(() => !!props.required)
})
defineSlots<{
  /** The control; receives the generated id and the aria-describedby value to wire onto it. */
  default?(props: { id: string, describedBy: string | undefined }): unknown
  /** Replaces the label text. */
  label?(): unknown
  /** Content placed at the end of the label row, such as a "Forgot?" link. */
  'label-end'?(): unknown
  /** Replaces the hint, error or success message text. */
  message?(): unknown
}>()
</script>

<template>
  <div class="mi-field mi:flex-col" :class="{ 'is-disabled': disabled }">
    <label v-if="label || $slots.label" class="mi-field__label mi:flex mi:justify-between mi:gap-2 mi:text-[13px] mi:font-semibold mi:text-label2 mi:tracking-[-.01em] mi:[.mi-field.is-disabled_&]:text-label3" :for="id">
      <span><slot name="label">{{ label }}</slot><span v-if="required" class="mi-field__req mi:text-red-t" aria-hidden="true"> *</span></span>
      <span v-if="$slots['label-end']" class="mi-field__end mi:font-medium mi:tabular-nums"><slot name="label-end" /></span>
    </label>
    <slot :id="id" :described-by="describedBy" />
    <span v-if="hasMsg" :id="msgId" class="mi-field__msg mi:flex mi:items-center mi:gap-1.5 mi:text-[13px] mi:text-label2 mi:[&.is-error]:text-red-t mi:[&.is-success]:text-green-t" :class="`is-${kind}`" :role="kind === 'error' ? 'alert' : undefined">
      <svg class="mi:[.mi-field__msg_&]:flex-[none]" v-if="kind === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2v.2" /></svg>
      <svg class="mi:[.mi-field__msg_&]:flex-[none]" v-else-if="kind === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M8.4 12.4l2.5 2.5 4.7-5" /></svg>
      <slot name="message">{{ error || success || hint }}</slot>
    </span>
  </div>
</template>

<style scoped>
.mi-field { display: flex; gap: 6px; min-width: 0; font-family: var(--mi-font); }
</style>
