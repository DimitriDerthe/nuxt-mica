<script setup lang="ts">
/** Action buttons of a code block header. */

defineSlots<{
  /** Buttons such as MiCodeBlockCopyButton, pushed to the end of the header. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-cb__actions"><slot /></div>
</template>
