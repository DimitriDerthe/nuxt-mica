<script lang="ts">
export const playground = {
  props: { label: 'Rate this article', showValue: true },
  controls: ['max', 'half', 'size', 'clearable', 'readonly', 'disabled', 'showValue']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const rating = ref(3.5)
</script>

<template>
  <MiRating v-model="rating" v-bind="p" />
</template>
