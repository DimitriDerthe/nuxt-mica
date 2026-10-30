<script setup lang="ts">
/** Final button that validates and emits the questionnaire submit event; shown on the last question. */
import { inject } from 'vue'
import { MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!

defineSlots<{
  /** Button label; defaults to "Submit". */
  default?(): unknown
}>()
</script>

<template>
  <button v-if="q.index.value >= q.count.value - 1" type="submit" class="mi-qn__btn is-primary"><slot>Submit</slot></button>
</template>
