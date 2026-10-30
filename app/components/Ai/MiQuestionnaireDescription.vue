<script setup lang="ts">
/** Helper text under a question title. */

defineSlots<{
  /** Helper text explaining the question. */
  default?(): unknown
}>()
</script>

<template>
  <p class="mi-qn__d"><slot /></p>
</template>
