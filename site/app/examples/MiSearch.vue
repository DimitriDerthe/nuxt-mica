<script lang="ts">
export const playground = {
  props: { placeholder: 'Search projects', size: 'default', shortcut: '⌘K', hotkey: 'k' },
  controls: ['size', 'placeholder', 'cancelable', 'shortcut', 'hotkey', 'disabled'],
  height: 380
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const query = ref('')
const projects = [
  { name: 'Marketing site', meta: 'Updated 2 hours ago' },
  { name: 'Mobile onboarding', meta: 'Updated yesterday' },
  { name: 'Billing migration', meta: 'Updated Oct 24' },
  { name: 'Design tokens v3', meta: 'Updated Oct 19' },
  { name: 'Support inbox', meta: 'Updated Oct 12' }
]
const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? projects.filter(x => x.name.toLowerCase().includes(q)) : projects
})
</script>

<template>
  <div class="panel">
    <MiSearch v-model="query" v-bind="p" />
    <ul class="list" aria-live="polite">
      <li v-for="r in results" :key="r.name">
        <span class="name">{{ r.name }}</span>
        <span class="meta">{{ r.meta }}</span>
      </li>
      <li v-if="!results.length" class="empty">No projects match "{{ query }}"</li>
    </ul>
  </div>
</template>

<style scoped>
.panel { width: min(100%, 340px); padding: 14px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 10px; box-sizing: border-box; }
.list { list-style: none; margin: 0; padding: 0; }
.list li { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 10px 4px; border-top: 1px solid var(--mi-sep); font-size: 15px; }
.list li:first-child { border-top: 0; }
.name { color: var(--mi-label); }
.meta { font-size: 12px; color: var(--mi-label3); white-space: nowrap; }
.empty { color: var(--mi-label2); justify-content: center; }
</style>
