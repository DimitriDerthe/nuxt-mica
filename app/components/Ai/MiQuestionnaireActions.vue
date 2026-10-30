<script setup lang="ts">
/** Row holding the questionnaire navigation buttons. */

defineSlots<{
  /** Navigation buttons: previous, skip, next and submit. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-qn__nav"><slot /></div>
</template>
