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
    <ul class="list mi:[list-style:none] mi:m-0 mi:p-0" aria-live="polite">
      <li class="mi:[.list_&]:flex mi:[.list_&]:justify-between mi:[.list_&]:items-baseline mi:[.list_&]:gap-3 mi:[.list_&]:py-2.5 mi:[.list_&]:px-1 mi:[.list_&]:border-t mi:[.list_&]:border-t-sep mi:[.list_&]:text-[15px] mi:[.list_&:first-child]:[border-top:0]" v-for="r in results" :key="r.name">
        <span class="name mi:text-label">{{ r.name }}</span>
        <span class="meta mi:text-[12px] mi:text-label3 mi:whitespace-nowrap">{{ r.meta }}</span>
      </li>
      <li v-if="!results.length" class="empty mi:[.list_&]:flex mi:[.list_&]:justify-between mi:[.list_&]:items-baseline mi:[.list_&]:gap-3 mi:[.list_&]:py-2.5 mi:[.list_&]:px-1 mi:[.list_&]:border-t mi:[.list_&]:border-t-sep mi:[.list_&]:text-[15px] mi:[.list_&:first-child]:[border-top:0] mi:text-label2 mi:justify-center">No projects match "{{ query }}"</li>
    </ul>
  </div>
</template>

<style scoped>
.panel { width: min(100%, 340px); padding: 14px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 10px; box-sizing: border-box; }
</style>
