<script lang="ts">
export const playground = {
  props: { label: 'Syncing photos' },
  controls: ['variant', 'size', 'tone']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <MiSpinner v-bind="p" />
    <div>
      <div class="name mi:text-[15px] mi:font-semibold mi:text-label">Syncing 1,204 photos…</div>
      <div class="sub mi:text-[13px] mi:text-label2">Keep the app open to finish faster</div>
    </div>
  </div>
</template>

<style scoped>
.ex { display: flex; align-items: center; gap: 14px; width: min(100%, 320px); padding: 14px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); color: var(--mi-label2); }
</style>
