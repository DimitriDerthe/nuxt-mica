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
      <template #inline-start><span class="add mi:text-[14px] mi:opacity-70 mi:py-0 mi:px-1">https://</span></template>
      <template #inline-end><span class="add mi:text-[14px] mi:opacity-70 mi:py-0 mi:px-1">.mica.app</span></template>
      <template #block-end><span class="add mi:text-[14px] mi:opacity-70 mi:py-0 mi:px-1">Your workspace address</span></template>
    </MiInputGroup>
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 340px); }
</style>
