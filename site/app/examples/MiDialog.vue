<script lang="ts">
export const playground = {
  props: {
    variant: 'alert',
    title: 'Delete “Atlas”?',
    message: 'This removes the project, its 24 files and every share link. You can’t undo this.',
    icon: 'trash',
    actions: [
      { id: 'cancel', label: 'Cancel', kind: 'cancel' },
      { id: 'delete', label: 'Delete project', kind: 'destructive' }
    ]
  },
  controls: ['variant', 'title', 'message', 'icon', 'persistent', 'closeOnAction'],
  height: 280
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const last = ref('')
</script>

<template>
  <div class="ex">
    <div class="row">
      <div>
        <div class="name">Delete this project</div>
        <div class="sub">Permanently remove Atlas and its files.</div>
      </div>
      <MiButton variant="destructive" soft size="small" @click="open = true">Delete…</MiButton>
    </div>
    <p class="note" aria-live="polite">{{ last }}</p>
    <MiDialog
      v-model="open" v-bind="p"
      @action="id => (last = 'Action: ' + id)" @close="r => (last = last || 'Closed (' + r + ')')"
      @update:model-value="v => { if (v) last = '' }"
    />
  </div>
</template>

<style scoped>
.ex { width: min(100%, 400px); }
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.name { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub, .note { font-size: 13px; color: var(--mi-label2); }
.note { min-height: 18px; margin: 10px 4px 0; }
</style>
