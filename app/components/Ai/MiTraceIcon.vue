<script setup lang="ts">
/** Decorative leading icon of a trace line, hidden from assistive tech. */

defineSlots<{
  /** Status icon, for example a spinner, check or dash. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-tr__icon" aria-hidden="true"><slot /></span>
</template>
