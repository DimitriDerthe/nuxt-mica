<script setup lang="ts">
/** Icon button inside attachment actions; give it an aria-label. */
defineEmits<{
  /** Fired on press. */
  click: [e: MouseEvent]
}>()

defineSlots<{
  /** Button content, usually an icon. */
  default?(): unknown
}>()
</script>

<template>
  <button type="button" class="mi-att__act" @click="$emit('click', $event)"><slot /></button>
</template>
