<script lang="ts">
export const playground = {
  props: { variant: 'separator' },
  controls: ['variant', 'as'],
  slot: 'Today',
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-thread">
    <MiBubble align="start" variant="secondary">Did the build go through?</MiBubble>
    <MiMarker v-bind="p" :href="p.as === 'a' ? '#' : undefined">
      <template #icon><MiIcon name="calendar" :size="14" /></template>
      Today
    </MiMarker>
    <MiBubble align="end">Yes, all green.</MiBubble>
  </div>
</template>

<style scoped>
.ex-thread { display: grid; gap: 12px; width: min(100%, 420px); margin-inline: auto; }
</style>
