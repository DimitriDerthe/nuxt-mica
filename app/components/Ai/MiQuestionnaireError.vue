<script setup lang="ts">
/** Validation message of its item, announced as an alert. */
import { inject } from 'vue'
import { MI_QN_ITEM_KEY, MI_QN_KEY } from '../../utils/miAi'

const q = inject(MI_QN_KEY)!
const item = inject(MI_QN_ITEM_KEY)!
</script>

<template>
  <p v-if="q.errors.value[item.name]" class="mi-qn__err" role="alert">{{ q.errors.value[item.name] }}</p>
</template>
