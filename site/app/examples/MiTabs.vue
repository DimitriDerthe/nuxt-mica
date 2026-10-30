<script lang="ts">
export const playground = {
  controls: ['orientation'],
  height: 240
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const tab = ref('overview')
</script>

<template>
  <div class="wrap">
    <MiTabs v-model="tab" v-bind="p">
      <MiTabsList aria-label="Project sections">
        <MiTabsTrigger value="overview">Overview</MiTabsTrigger>
        <MiTabsTrigger value="activity">Activity</MiTabsTrigger>
        <MiTabsTrigger value="settings">Settings</MiTabsTrigger>
        <MiTabsTrigger value="billing" disabled>Billing</MiTabsTrigger>
      </MiTabsList>
      <MiTabsContent value="overview"><p>12 active tasks, 3 due this week.</p></MiTabsContent>
      <MiTabsContent value="activity"><p>Maya closed "Onboarding copy" 2 hours ago.</p></MiTabsContent>
      <MiTabsContent value="settings"><p>Rename the project, invite teammates or archive it.</p></MiTabsContent>
      <MiTabsContent value="billing"><p>Only owners can view billing.</p></MiTabsContent>
    </MiTabs>
  </div>
</template>

<style scoped>
.wrap { width: min(100%, 420px); }
p { margin: 12px 0 0; font-size: 15px; }
</style>
