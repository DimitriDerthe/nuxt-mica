<script lang="ts">
export const playground = {
  props: { title: 'Wi-Fi', value: 'Studio 5G', tile: 'blue', chevron: true, button: true },
  controls: ['variant', 'title', 'subtitle', 'description', 'value', 'tile', 'chevron', 'destructive', 'disabled', 'align']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const bt = ref(true)
</script>

<template>
  <MiList class="ex-list" label="Connections">
    <MiListItem v-bind="p">
      <template #leading><MiIcon name="wifi" /></template>
    </MiListItem>
    <MiListItem title="Bluetooth" tile="blue">
      <template #leading><MiIcon name="bluetooth" /></template>
      <template #trailing><MiSwitch v-model="bt" size="compact" label="Bluetooth" /></template>
    </MiListItem>
    <MiListItem title="VPN" value="Not connected" tile="indigo" chevron button>
      <template #leading><MiIcon name="lock" /></template>
    </MiListItem>
  </MiList>
</template>

<style scoped>
.ex-list { width: min(100%, 400px); }
</style>
