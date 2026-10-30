<script setup lang="ts">
/** Text column of an attachment holding the title and description. */

defineSlots<{
  /** MiAttachmentTitle and MiAttachmentDescription stacked in a column. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-att__text"><slot /></div>
</template>
