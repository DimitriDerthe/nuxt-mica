<script lang="ts">
export const playground = {
  props: { title: 'Filters', description: 'Narrow the list of invoices.', showSwipeHandle: true },
  controls: ['swipeDirection', 'showSwipeHandle', 'dismissible', 'modal'],
  height: 200
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const status = ref('paid')
const statuses = [{ value: 'paid', label: 'Paid' }, { value: 'due', label: 'Due' }, { value: 'overdue', label: 'Overdue' }]
</script>

<template>
  <div>
    <MiButton @click="open = true">Open filters</MiButton>
    <MiDrawer v-model="open" v-bind="p">
      <div class="body mi:pt-1 mi:px-0 mi:pb-3">
        <MiNativeSelect v-model="status" :options="statuses" aria-label="Status" />
      </div>
      <template #footer="{ close }">
        <MiButton @click="close()">Apply filters</MiButton>
      </template>
    </MiDrawer>
  </div>
</template>
