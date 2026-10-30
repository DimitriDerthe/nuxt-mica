<script setup lang="ts">
/** Label, hint and error wrapper around one form control, laid out on MiForm's two-column grid (use it inside MiForm); the label sits beside the control unless top is set. */
import { computed, provide, useId } from 'vue'
import { MI_FIELD } from '../../utils/miInputs'

const props = defineProps<{
  /** Label shown beside the control (above it when `top` is set). */
  label?: string
  /** Id of the control the label points to. Generated and provided to the control when omitted. */
  for?: string
  /** Align the label to the top (multi-line controls). */
  top?: boolean
  /** Help text under the control. Replaced by `error` when there is one. */
  hint?: string
  /** Error message. Sets the control to its invalid state. */
  error?: string
  /** Marks the label with an asterisk and flags the control as required. */
  required?: boolean
}>()

const uid = useId()
const id = computed(() => props.for ?? `mi-fr-${uid}`)
const msgId = `mi-fr-msg-${uid}`
const has = computed(() => !!(props.error || props.hint))

provide(MI_FIELD, {
  get id() { return id.value },
  describedBy: computed(() => (has.value ? msgId : undefined)),
  invalid: computed(() => !!props.error),
  success: computed(() => false),
  disabled: computed(() => false),
  required: computed(() => !!props.required)
})
defineSlots<{
  /** The control; receives the generated id to set on it. */
  default?(props: { id: string }): unknown
}>()
</script>

<template>
  <label v-if="label" class="mi-fr__label" :class="{ 'is-top': top }" :for="id">{{ label }}<span v-if="required" class="mi-fr__req" aria-hidden="true"> *</span></label>
  <span v-else class="mi-fr__label" aria-hidden="true" />
  <div class="mi-fr__ctl" :class="{ 'has-msg': has }"><slot :id="id" /></div>
  <template v-if="has">
    <span class="mi-fr__gap" aria-hidden="true" />
    <span :id="msgId" class="mi-fr__msg" :class="{ 'is-error': error }" :role="error ? 'alert' : undefined">{{ error || hint }}</span>
  </template>
</template>

<style scoped>
.mi-fr__label { font-size: 15px; font-weight: 500; text-align: right; }
.mi-fr__label.is-top { align-self: start; padding-top: 8px; }
.mi-fr__req { color: var(--mi-red-t); }
.mi-fr__ctl { display: flex; min-width: 0; }
.mi-fr__ctl > :slotted(*) { flex: 1 1 auto; min-width: 0; }
.mi-fr__msg { margin-top: -8px; font-size: 13px; color: var(--mi-label2); }
.mi-fr__msg.is-error { color: var(--mi-red-t); }
@container (max-width: 640px) {
  .mi-fr__label { text-align: left; font-size: 13px; font-weight: 600; color: var(--mi-label2); }
  .mi-fr__label.is-top { padding-top: 0; }
  .mi-fr__gap { display: none; }
  /* Stacked rows keep 10px under their last line, the control or its message, before the next label. */
  .mi-fr__ctl { margin-bottom: 10px; }
  .mi-fr__ctl.has-msg { margin-bottom: 0; }
  .mi-fr__msg { margin: -2px 0 10px; }
}
</style>
