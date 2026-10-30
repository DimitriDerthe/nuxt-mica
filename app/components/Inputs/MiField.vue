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
  <div class="mi-field" :class="{ 'is-disabled': disabled }">
    <label v-if="label || $slots.label" class="mi-field__label" :for="id">
      <span><slot name="label">{{ label }}</slot><span v-if="required" class="mi-field__req" aria-hidden="true"> *</span></span>
      <span v-if="$slots['label-end']" class="mi-field__end"><slot name="label-end" /></span>
    </label>
    <slot :id="id" :described-by="describedBy" />
    <span v-if="hasMsg" :id="msgId" class="mi-field__msg" :class="`is-${kind}`" :role="kind === 'error' ? 'alert' : undefined">
      <svg v-if="kind === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2v.2" /></svg>
      <svg v-else-if="kind === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M8.4 12.4l2.5 2.5 4.7-5" /></svg>
      <slot name="message">{{ error || success || hint }}</slot>
    </span>
  </div>
</template>

<style scoped>
.mi-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; font-family: var(--mi-font); }
.mi-field__label { display: flex; justify-content: space-between; gap: 8px; font-size: 13px; font-weight: 600; color: var(--mi-label2); letter-spacing: -.01em; }
.mi-field.is-disabled .mi-field__label { color: var(--mi-label3); }
.mi-field__end { font-weight: 500; font-variant-numeric: tabular-nums; }
.mi-field__req { color: var(--mi-red-t); }
.mi-field__msg { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--mi-label2); }
.mi-field__msg svg { flex: none; }
.mi-field__msg.is-error { color: var(--mi-red-t); }
.mi-field__msg.is-success { color: var(--mi-green-t); }
</style>
