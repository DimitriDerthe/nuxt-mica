<script setup lang="ts">
/** Submit-on-Enter button that advances to the next question; hidden on the last one. */
import { inject } from 'vue'
import { MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!

defineSlots<{
  /** Button label; defaults to "Next". */
  default?(): unknown
}>()
</script>

<template>
  <button v-if="q.index.value < q.count.value - 1" type="submit" class="mi-qn__btn is-primary"><slot>Next</slot></button>
</template>
