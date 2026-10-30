<script lang="ts">
export const playground = {
  controls: ['multiline', 'size', 'invalid', 'disabled', 'rows']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const value = ref('')
</script>

<template>
  <div class="wrap">
    <MiInputGroup v-model="value" v-bind="p">
      <template #inline-start><span class="add">https://</span></template>
      <template #inline-end><span class="add">.mica.app</span></template>
      <template #block-end><span class="add">Your workspace address</span></template>
    </MiInputGroup>
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 340px); }
.add { font-size: 14px; opacity: .7; padding: 0 4px; }
</style>
