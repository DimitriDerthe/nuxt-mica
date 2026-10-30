<script setup lang="ts">
/** Single trace row; status styles it as running, error or pending. */
defineProps<{
  /** Row status; omit for a finished row. */
  status?: 'running' | 'error' | 'pending'
}>()

defineSlots<{
  /** MiTraceIcon, MiTraceTitle and MiTraceDescription for the row. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-tr__line" :class="status && `is-${status}`" :data-status="status"><slot /></span>
</template>
