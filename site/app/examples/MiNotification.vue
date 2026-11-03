<script lang="ts">
export const playground = {
  props: {
    title: 'Maya Chen commented on Onboarding v3',
    message: 'Love the new welcome flow. Can we ship it to beta users on Thursday?',
    time: '2 min ago',
    icon: 'comment',
    tone: 'primary',
    dismissible: true
  },
  controls: ['tone', 'icon', 'title', 'message', 'time', 'dismissible', 'interactive']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const shown = ref(true)
</script>

<template>
  <section class="ex" aria-label="Notifications">
    <div class="head mi:flex mi:justify-between mi:py-0 mi:px-1.5 mi:text-[13px] mi:font-semibold mi:text-label2"><span>Today</span><span class="count mi:font-medium">{{ shown ? 1 : 0 }} new</span></div>
    <MiNotification v-if="shown" v-bind="p" @dismiss="shown = false" />
    <div v-else class="done mi:flex mi:items-center mi:justify-between mi:gap-3 mi:py-3.5 mi:px-4 mi:rounded-[18px] mi:bg-card mi:shadow-1 mi:text-[14px] mi:text-label2">
      You’re all caught up.
      <MiButton variant="plain" size="small" @click="shown = true">Undo</MiButton>
    </div>
  </section>
</template>

<style scoped>
.ex { display: grid; gap: 10px; width: min(100%, 380px); }
</style>
