<script lang="ts">
export const playground = {
  props: { label: 'Resume', accept: '.pdf,.doc,.docx', maxSize: 2097152 },
  controls: ['label', 'accept', 'multiple', 'buttonLabel', 'placeholder', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const file = ref<File | File[] | null>(null)
</script>

<template>
  <div class="wrap mi:w-[min(100%,_380px)]">
    <MiFileInput v-model="file" v-bind="p" />
  </div>
</template>
