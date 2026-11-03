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
    <div class="row mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-4 mi:px-4.5 mi:rounded-[18px] mi:bg-card mi:shadow-1">
      <div>
        <div class="name mi:text-[15px] mi:font-semibold mi:text-label">Delete this project</div>
        <div class="sub mi:text-[13px] mi:text-label2">Permanently remove Atlas and its files.</div>
      </div>
      <MiButton variant="destructive" soft size="small" @click="open = true">Delete…</MiButton>
    </div>
    <p class="note mi:text-[13px] mi:text-label2 mi:min-h-4.5 mi:mt-2.5 mi:mx-1 mi:mb-0" aria-live="polite">{{ last }}</p>
    <MiDialog
      v-model="open" v-bind="p"
      @action="id => (last = 'Action: ' + id)" @close="r => (last = last || 'Closed (' + r + ')')"
      @update:model-value="v => { if (v) last = '' }"
    />
  </div>
</template>

<style scoped>
.ex { width: min(100%, 400px); }
</style>
