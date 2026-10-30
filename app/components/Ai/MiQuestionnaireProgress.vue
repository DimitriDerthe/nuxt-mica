<script setup lang="ts">
/** Progress bar and "n of N" label for the questionnaire. */
import { inject } from 'vue'
import { MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!
</script>

<template>
  <div class="mi-qn__prog">
    <span aria-hidden="true">{{ q.index.value + 1 }} of {{ q.count.value }}</span>
    <div class="mi-qn__bar" role="progressbar" aria-valuemin="1" :aria-valuemax="q.count.value" :aria-valuenow="q.index.value + 1" :aria-label="`Question ${q.index.value + 1} of ${q.count.value}`">
      <span class="mi-qn__fill" :style="{ transform: `scaleX(${q.count.value ? (q.index.value + 1) / q.count.value : 0})` }" />
    </div>
  </div>
</template>
