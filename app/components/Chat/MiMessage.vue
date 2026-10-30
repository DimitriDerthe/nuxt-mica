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
  <div class="mi-msg" :class="`mi-msg--${align}`" role="group" :aria-label="label">
    <div v-if="$slots.avatar" class="mi-msg__av"><slot name="avatar" /></div>
    <div class="mi-msg__c">
      <div v-if="$slots.header" class="mi-msg__h"><slot name="header" /></div>
      <slot />
      <div v-if="$slots.footer" class="mi-msg__f"><slot name="footer" /></div>
    </div>
  </div>
</template>

<style scoped>
.mi-msg{display:flex;align-items:flex-end;gap:8px;max-width:100%;font-family:var(--mi-font)}
.mi-msg--end{flex-direction:row-reverse}
.mi-msg__av{flex:none}
.mi-msg__c{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:100%}
.mi-msg--start .mi-msg__c{align-items:flex-start}
.mi-msg--end .mi-msg__c{align-items:flex-end}
.mi-msg__h{align-self:flex-start;padding-inline:4px;font-size:12px;font-weight:600;color:var(--mi-label2)}
.mi-msg__f{display:flex;align-items:center;gap:6px;padding-inline:4px;font-size:12px;color:var(--mi-label2)}
</style>
