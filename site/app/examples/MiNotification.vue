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
    <div class="head"><span>Today</span><span class="count">{{ shown ? 1 : 0 }} new</span></div>
    <MiNotification v-if="shown" v-bind="p" @dismiss="shown = false" />
    <div v-else class="done">
      You’re all caught up.
      <MiButton variant="plain" size="small" @click="shown = true">Undo</MiButton>
    </div>
  </section>
</template>

<style scoped>
.ex { display: grid; gap: 10px; width: min(100%, 380px); }
.head { display: flex; justify-content: space-between; padding: 0 6px; font-size: 13px; font-weight: 600; color: var(--mi-label2); }
.count { font-weight: 500; }
.done { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 14px; color: var(--mi-label2); }
</style>
