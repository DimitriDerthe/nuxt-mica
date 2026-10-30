<script setup lang="ts">
/** Button that goes back one question; disabled on the first. */
import { inject } from 'vue'
import { MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!

defineSlots<{
  /** Button label; defaults to "Previous". */
  default?(): unknown
}>()
</script>

<template>
  <button type="button" class="mi-qn__btn" :disabled="q.index.value <= 0" @click="q.prev()"><slot>Previous</slot></button>
</template>
