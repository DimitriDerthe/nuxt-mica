<script setup lang="ts">
/** Container for attachment action buttons, kept above the full-card trigger. */

defineSlots<{
  /** MiAttachmentAction buttons shown at the card edge. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-att__actions"><slot /></div>
</template>
