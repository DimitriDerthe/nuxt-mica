<script lang="ts">
export const playground = {
  props: { name: 'Camille Laurent', tone: 'auto', decorative: true },
  controls: ['name', 'initials', 'shape', 'tone', 'src']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-row">
    <MiAvatar v-bind="p" />
    <div class="ex-who mi:grid mi:gap-0.5 mi:flex-1 mi:min-w-0">
      <span class="ex-name mi:text-[16px] mi:font-semibold mi:text-label mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ p.name || 'Camille Laurent' }}</span>
      <span class="ex-role mi:text-[13px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">Product designer · Paris</span>
    </div>
    <MiButton size="small" variant="tinted">Message</MiButton>
  </div>
</template>

<style scoped>
.ex-row { display: flex; align-items: center; gap: 12px; width: min(100%, 360px); padding: 12px 14px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
