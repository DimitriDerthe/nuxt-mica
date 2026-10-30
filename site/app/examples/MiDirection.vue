<script lang="ts">
export const playground = {
  props: { direction: 'rtl' },
  controls: ['direction'],
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiDirection v-bind="p">
    <div class="card" :dir="p.direction === 'rtl' ? 'rtl' : 'ltr'">
      <strong>Notifications</strong>
      <span>Choose how you want to be reached.</span>
      <MiButton variant="filled" size="small">Save changes</MiButton>
    </div>
  </MiDirection>
</template>

<style scoped>
.card { display: grid; gap: 8px; justify-items: start; width: min(100%, 320px); padding: 16px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 15px; }
span { color: var(--mi-label2); }
</style>
