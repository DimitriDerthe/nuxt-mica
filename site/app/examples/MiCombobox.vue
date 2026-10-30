<script lang="ts">
export const playground = {
  props: {
    placeholder: 'Select a framework',
    searchPlaceholder: 'Search frameworks...',
    options: [
      { value: 'nuxt', label: 'Nuxt', group: 'Vue' },
      { value: 'vite', label: 'Vite', group: 'Vue' },
      { value: 'next', label: 'Next.js', group: 'React' },
      { value: 'remix', label: 'Remix', group: 'React' },
      { value: 'astro', label: 'Astro', group: 'Other' },
      { value: 'svelte', label: 'SvelteKit', group: 'Other', description: 'Compiler-first' }
    ]
  },
  controls: ['multiple', 'clearable', 'size', 'disabled', 'invalid', 'placeholder'],
  height: 360
}
</script>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const value = ref<string | number | (string | number)[] | null>(null)
watch(() => props.p.multiple, (m) => { value.value = m ? [] : null }, { immediate: true })
</script>

<template>
  <div class="wrap">
    <MiCombobox v-model="value" v-bind="p" />
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 300px); }
</style>
