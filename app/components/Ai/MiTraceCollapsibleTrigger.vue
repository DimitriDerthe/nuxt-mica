<script setup lang="ts">
/** Button that toggles its MiTraceCollapsible parent. */
import { inject } from 'vue'
import { MI_TRACE_KEY } from '../../utils/miAi'

const ctx = inject(MI_TRACE_KEY, null)

defineSlots<{
  /** Row content, usually a MiTraceLine, that toggles the detail when pressed. */
  default?(): unknown
}>()
</script>

<template>
  <button type="button" class="mi-tr__trigger" :aria-expanded="ctx ? ctx.open.value : undefined" :aria-controls="ctx?.id" @click="ctx?.toggle()"><slot /></button>
</template>
