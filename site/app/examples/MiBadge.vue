<script lang="ts">
export const playground = {
  props: { count: 3 },
  controls: ['count', 'max', 'tone', 'dotOnly', 'dotSize', 'placement', 'offset', 'showZero', 'countNoun']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="bar">
    <span class="title mi:text-[20px] mi:font-bold mi:text-label">Inbox</span>
    <div class="tools mi:flex mi:items-center mi:gap-1.5">
      <MiIconButton label="Search" variant="plain" size="regular"><MiIcon name="search" /></MiIconButton>
      <MiBadge v-bind="p">
        <template #target>
          <MiIconButton label="Notifications" variant="gray" size="regular"><MiIcon name="bell" /></MiIconButton>
        </template>
      </MiBadge>
    </div>
  </div>
</template>

<style scoped>
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; width: min(100%, 320px); padding: 10px 12px 10px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
