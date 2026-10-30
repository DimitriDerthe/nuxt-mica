<script lang="ts">
export const playground = {
  props: {
    header: 'Notifications',
    footer: 'Quiet hours silence everything except calls from your favorites.'
  },
  controls: ['header', 'footer', 'grouped']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const push = ref(true)
const digest = ref(false)
</script>

<template>
  <MiList v-bind="p" class="ex-list">
    <MiListItem title="Push notifications" tile="red">
      <template #leading><MiIcon name="bell" /></template>
      <template #trailing><MiSwitch v-model="push" size="compact" label="Push notifications" /></template>
    </MiListItem>
    <MiListItem title="Daily digest" subtitle="Every morning at 8:00" tile="orange">
      <template #leading><MiIcon name="tray" /></template>
      <template #trailing><MiSwitch v-model="digest" size="compact" label="Daily digest" /></template>
    </MiListItem>
    <MiListItem title="Quiet hours" value="22:00 to 7:00" tile="indigo" chevron button>
      <template #leading><MiIcon name="moon" /></template>
    </MiListItem>
    <MiListItem title="Mentions" value="Everyone" tile="blue" chevron button>
      <template #leading><MiIcon name="chat" /></template>
    </MiListItem>
  </MiList>
</template>

<style scoped>
.ex-list { width: min(100%, 400px); }
</style>
