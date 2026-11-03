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
  <div class="page mi:overflow-hidden mi:rounded-[18px] mi:bg-card mi:shadow-1">
    <MiBanner v-if="shown" v-bind="p" @dismiss="shown = false" />
    <div class="body mi:grid mi:gap-2.5 mi:justify-items-start mi:p-4.5">
      <div class="h mi:text-[20px] mi:font-bold mi:text-label">Projects</div>
      <div class="line mi:w-full mi:h-2.5 mi:rounded-[5px] mi:bg-fill3 mi:[&.short]:w-[60%]" /><div class="line short mi:w-full mi:h-2.5 mi:rounded-[5px] mi:bg-fill3 mi:[&.short]:w-[60%]" />
      <MiButton v-if="!shown" variant="gray" size="small" @click="shown = true">Show the banner again</MiButton>
    </div>
  </div>
</template>
