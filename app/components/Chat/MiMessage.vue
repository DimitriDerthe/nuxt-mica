<script setup lang="ts">
/** Conversation row: lays out an avatar, a header (sender), the message surface (usually MiBubble) and a footer (status, actions) on the start or end side. */
withDefaults(defineProps<{
  /** Side of the sender. `end` moves the avatar and footer to the right. */
  align?: 'start' | 'end'
  /** Accessible label of the row, e.g. the sender name. */
  label?: string
}>(), { align: 'start' })

defineSlots<{
  /** Message surface, usually a MiBubble. */
  default?(): unknown
  /** Sender avatar beside the message; leave empty on grouped rows to keep alignment. */
  avatar?(): unknown
  /** Sender name or timestamp shown above the message. */
  header?(): unknown
  /** Status or action row shown below the message, such as delivery state or copy buttons. */
  footer?(): unknown
}>()
</script>

<template>
  <div class="mi-msg mi:[align-items:flex-end] mi:gap-2 mi:font-mi" :class="`mi-msg--${align}`" role="group" :aria-label="label">
    <div v-if="$slots.avatar" class="mi-msg__av mi:flex-[none]"><slot name="avatar" /></div>
    <div class="mi-msg__c mi:flex mi:flex-col mi:gap-0.5 mi:min-w-0 mi:max-w-full">
      <div v-if="$slots.header" class="mi-msg__h mi:[align-self:flex-start] mi:px-1 mi:text-[12px] mi:font-semibold mi:text-label2"><slot name="header" /></div>
      <slot />
      <div v-if="$slots.footer" class="mi-msg__f mi:flex mi:items-center mi:gap-1.5 mi:px-1 mi:text-[12px] mi:text-label2"><slot name="footer" /></div>
    </div>
  </div>
</template>

<style scoped>
.mi-msg{display:flex;max-width:100%}
.mi-msg--end{flex-direction:row-reverse}
.mi-msg--start .mi-msg__c{align-items:flex-start}
.mi-msg--end .mi-msg__c{align-items:flex-end}
</style>
