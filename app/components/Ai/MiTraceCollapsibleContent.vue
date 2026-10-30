<script setup lang="ts">
/** Expandable detail of a trace row; unmounted while closed unless keepMounted. */
import { inject } from 'vue'
import { MI_TRACE_KEY } from '../../utils/miAi'

defineProps<{
  /** Keep children mounted (hidden) while closed, preserving nested open state. */
  keepMounted?: boolean
}>()
const ctx = inject(MI_TRACE_KEY, null)

defineSlots<{
  /** Detail shown while the row is expanded. */
  default?(): unknown
}>()
</script>

<template>
  <div v-if="keepMounted || ctx?.open.value" v-show="ctx?.open.value ?? true" :id="ctx?.id" class="mi-tr__content"><slot /></div>
</template>
