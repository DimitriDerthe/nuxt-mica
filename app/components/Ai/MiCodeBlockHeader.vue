<script setup lang="ts">
/** Header row of a code block holding the title and actions. */

defineSlots<{
  /** MiCodeBlockTitle and MiCodeBlockActions. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-cb__head"><slot /></div>
</template>
