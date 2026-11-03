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
  <label v-if="label" class="mi-fr__label mi:text-[15px] mi:font-medium mi:text-right mi:[&.is-top]:self-start mi:[&.is-top]:pt-2 mi:@max-[640px]:text-left mi:@max-[640px]:text-[13px] mi:@max-[640px]:font-semibold mi:@max-[640px]:text-label2 mi:@max-[640px]:[&.is-top]:pt-0" :class="{ 'is-top': top }" :for="id">{{ label }}<span v-if="required" class="mi-fr__req mi:text-red-t" aria-hidden="true"> *</span></label>
  <span v-else class="mi-fr__label mi:text-[15px] mi:font-medium mi:text-right mi:[&.is-top]:self-start mi:[&.is-top]:pt-2 mi:@max-[640px]:text-left mi:@max-[640px]:text-[13px] mi:@max-[640px]:font-semibold mi:@max-[640px]:text-label2 mi:@max-[640px]:[&.is-top]:pt-0" aria-hidden="true" />
  <div class="mi-fr__ctl mi:flex mi:min-w-0 mi:@max-[640px]:mb-2.5 mi:@max-[640px]:[&.has-msg]:mb-0" :class="{ 'has-msg': has }"><slot :id="id" /></div>
  <template v-if="has">
    <span class="mi-fr__gap mi:@max-[640px]:hidden" aria-hidden="true" />
    <span :id="msgId" class="mi-fr__msg mi:-mt-2 mi:text-[13px] mi:text-label2 mi:[&.is-error]:text-red-t mi:@max-[640px]:-mt-0.5 mi:@max-[640px]:mx-0 mi:@max-[640px]:mb-2.5" :class="{ 'is-error': error }" :role="error ? 'alert' : undefined">{{ error || hint }}</span>
  </template>
</template>

<style scoped>
.mi-fr__ctl > :slotted(*) { flex: 1 1 auto; min-width: 0; }
</style>
