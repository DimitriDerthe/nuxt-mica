<script lang="ts">
export const playground = {
  props: {
    footerLabel: 'New project',
    groups: [
      {
        id: 'main',
        items: [
          { id: 'inbox', label: 'Inbox', icon: 'inbox', badge: 12 },
          { id: 'today', label: 'Today', icon: 'calendar', badge: 4 },
          { id: 'docs', label: 'Documents', icon: 'document' },
          { id: 'people', label: 'Team', icon: 'people' }
        ]
      },
      {
        id: 'projects',
        label: 'Projects',
        collapsible: true,
        items: [
          { id: 'site', label: 'Marketing site', color: 'blue' },
          { id: 'mobile', label: 'Mobile app', color: 'orange', badge: 3 },
          { id: 'billing', label: 'Billing migration', color: 'green' },
          { id: 'archive', label: 'Brand refresh', color: 'purple', disabled: true }
        ]
      },
      {
        id: 'account',
        label: 'Account',
        collapsible: true,
        items: [
          { id: 'settings', label: 'Settings', icon: 'settings' },
          { id: 'plan', label: 'Billing', icon: 'billing' }
        ]
      }
    ]
  },
  controls: ['footerLabel', 'collapsed'],
  layout: 'fill',
  height: 520
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const selected = ref<string | undefined>('inbox')

type Item = { id: string, label: string }
const current = computed(() => {
  const groups = (props.p.groups ?? []) as { items: Item[] }[]
  return groups.flatMap(g => g.items).find(i => i.id === selected.value)?.label ?? 'Nothing selected'
})
</script>

<template>
  <div class="panel">
    <MiSidebar v-model="selected" v-bind="p" class="side" />
    <section class="main">
      <h3>{{ current }}</h3>
      <p>Pick a row in the sidebar; collapsible groups remember their state.</p>
    </section>
  </div>
</template>

<style scoped>
.panel { display: flex; height: 460px; border-radius: 20px; overflow: hidden; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.side { flex: 0 0 auto; }
.main { flex: 1; min-width: 0; padding: 24px; border-left: 1px solid var(--mi-sep); }
.main h3 { margin: 0; font-size: 22px; font-weight: 700; color: var(--mi-label); }
.main p { margin: 6px 0 0; font-size: 14px; color: var(--mi-label2); }
@media (max-width: 560px) { .main { display: none; } }
</style>
