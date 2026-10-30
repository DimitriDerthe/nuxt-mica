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
    <div class="ex-who">
      <span class="ex-name">{{ p.name || 'Camille Laurent' }}</span>
      <span class="ex-role">Product designer · Paris</span>
    </div>
    <MiButton size="small" variant="tinted">Message</MiButton>
  </div>
</template>

<style scoped>
.ex-row { display: flex; align-items: center; gap: 12px; width: min(100%, 360px); padding: 12px 14px; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-who { display: grid; gap: 2px; flex: 1; min-width: 0; }
.ex-name { font-size: 16px; font-weight: 600; color: var(--mi-label); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-role { font-size: 13px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
