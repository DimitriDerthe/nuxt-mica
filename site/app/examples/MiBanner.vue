<script lang="ts">
export const playground = {
  props: {
    tone: 'warning',
    title: 'Scheduled maintenance',
    message: 'Workspaces will be read-only on Sunday, Nov 2, from 02:00 to 03:00 UTC.',
    actionLabel: 'View status',
    dismissible: true
  },
  controls: ['tone', 'variant', 'title', 'message', 'actionLabel', 'dismissible', 'icon'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const shown = ref(true)
</script>

<template>
  <div class="page">
    <MiBanner v-if="shown" v-bind="p" @dismiss="shown = false" />
    <div class="body">
      <div class="h">Projects</div>
      <div class="line" /><div class="line short" />
      <MiButton v-if="!shown" variant="gray" size="small" @click="shown = true">Show the banner again</MiButton>
    </div>
  </div>
</template>

<style scoped>
.page { overflow: hidden; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.body { display: grid; gap: 10px; justify-items: start; padding: 18px; }
.h { font-size: 20px; font-weight: 700; color: var(--mi-label); }
.line { width: 100%; height: 10px; border-radius: 5px; background: var(--mi-fill3); }
.line.short { width: 60%; }
</style>
