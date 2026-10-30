<script setup lang="ts">
/** Scrollable snapping row of attachments. */

defineSlots<{
  /** MiAttachment cards laid out in a scrollable row. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-att-group"><slot /></div>
</template>
