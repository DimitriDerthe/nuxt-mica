<script lang="ts">
export const playground = {
  props: {},
  controls: ['handle', 'orientation', 'autoScroll', 'disabled'],
  height: 360
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const items = ref([
  { id: 1, title: 'Write the brief', meta: 'Today' },
  { id: 2, title: 'Review the mockups', meta: 'Tomorrow' },
  { id: 3, title: 'Ship the release', meta: 'Friday' },
  { id: 4, title: 'Retrospective', meta: 'Next week' }
])
</script>

<template>
  <MiSortable v-model="items" v-bind="p" class="ex-sort" :item-label="i => i.title">
    <template #default="{ item }">
      <div class="ex-sort__row">
        <MiText variant="body" weight="medium">{{ item.title }}</MiText>
        <MiText variant="footnote" tone="label2">{{ item.meta }}</MiText>
      </div>
    </template>
  </MiSortable>
</template>

<style scoped>
.ex-sort { width: min(100%, 420px); }
.ex-sort__row { display: grid; gap: 2px; white-space: nowrap; }
</style>
