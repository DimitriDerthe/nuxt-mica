<script lang="ts">
export const playground = {
  props: { title: 'Delete this project?', description: 'This permanently removes "Atlas redesign" and its 42 files. This action cannot be undone.', confirmLabel: 'Delete project', media: 'trash' },
  controls: ['size', 'destructive', 'hideCancel', 'confirmDisabled', 'confirmLabel', 'cancelLabel'],
  height: 200
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
</script>

<template>
  <MiAlertDialog v-model="open" v-bind="p">
    <template #trigger="{ open: show }">
      <MiButton @click="show()">Delete project</MiButton>
    </template>
  </MiAlertDialog>
</template>
