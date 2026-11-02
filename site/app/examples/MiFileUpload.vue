<script lang="ts">
export const playground = {
  props: { label: 'Drop files here or browse', hint: 'PNG, JPG or PDF up to 5 MB', accept: 'image/*,.pdf', multiple: true, maxSize: 5242880, maxFiles: 4 },
  controls: ['label', 'hint', 'accept', 'multiple', 'maxFiles', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const files = ref<File[]>([])
</script>

<template>
  <div class="wrap">
    <MiFileUpload v-model="files" v-bind="p" :progress="Object.fromEntries(files.map((f, i) => [f.name, i === 0 ? 0.62 : 1]))" />
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 420px); }
</style>
