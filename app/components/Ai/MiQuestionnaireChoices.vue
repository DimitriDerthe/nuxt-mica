<script setup lang="ts">
/** Container for the choices and optional free-text input of a question. */

defineSlots<{
  /** MiQuestionnaireChoice options and an optional MiQuestionnaireInput. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-qn__opts"><slot /></div>
</template>
