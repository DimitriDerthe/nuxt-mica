<script setup lang="ts">
/** Button that skips the current question; hidden for required questions. */
import { inject } from 'vue'
import { MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!

defineSlots<{
  /** Button label; defaults to "Skip". */
  default?(): unknown
}>()
</script>

<template>
  <button v-if="!q.required(q.active.value)" type="button" class="mi-qn__btn" @click="q.skip()"><slot>Skip</slot></button>
</template>
