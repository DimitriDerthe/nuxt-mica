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
    <div class="card mi:grid mi:gap-2 mi:justify-items-start mi:w-[min(100%,_320px)] mi:p-4 mi:rounded-[14px] mi:bg-card mi:shadow-1 mi:text-[15px]" :dir="p.direction === 'rtl' ? 'rtl' : 'ltr'">
      <strong>Notifications</strong>
      <span>Choose how you want to be reached.</span>
      <MiButton variant="filled" size="small">Save changes</MiButton>
    </div>
  </MiDirection>
</template>

<style scoped>
span { color: var(--mi-label2); }
</style>
