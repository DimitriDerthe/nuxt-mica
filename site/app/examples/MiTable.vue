<script lang="ts">
export const playground = {
  props: {
    caption: 'Customer accounts',
    selectable: 'multiple',
    columns: [
      { key: 'company', label: 'Company', sortable: true },
      { key: 'plan', label: 'Plan', sortable: true },
      { key: 'seats', label: 'Seats', numeric: true, align: 'end', sortable: true },
      { key: 'mrr', label: 'MRR', numeric: true, align: 'end', sortable: true },
      { key: 'status', label: 'Status' }
    ],
    rows: [
      { id: 'acc-1', company: 'Northwind Labs', plan: 'Business', seats: 48, mrr: 2352, status: 'Active' },
      { id: 'acc-2', company: 'Bluefin Studio', plan: 'Team', seats: 12, mrr: 348, status: 'Active' },
      { id: 'acc-3', company: 'Helio Freight', plan: 'Enterprise', seats: 230, mrr: 9890, status: 'Active' },
      { id: 'acc-4', company: 'Paper Lantern', plan: 'Team', seats: 7, mrr: 203, status: 'Past due' },
      { id: 'acc-5', company: 'Quarry & Co', plan: 'Business', seats: 31, mrr: 1519, status: 'Trial' },
      { id: 'acc-6', company: 'Atlas Clinics', plan: 'Enterprise', seats: 154, mrr: 6622, status: 'Active' },
      { id: 'acc-7', company: 'Kite Robotics', plan: 'Team', seats: 19, mrr: 551, status: 'Canceled' }
    ]
  },
  controls: ['selectable', 'density', 'zebra', 'stickyHeader', 'maxHeight', 'emptyText'],
  layout: 'fill',
  height: 380
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const selected = ref<string[]>(['acc-3'])
const sort = ref<{ key: string, dir: 'asc' | 'desc' } | null>({ key: 'seats', dir: 'desc' })
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
function fmt(key: string, value: unknown) {
  if (key === 'mrr') return money.format(Number(value))
  return value
}
const tones: Record<string, string> = { 'Active': 'success', 'Trial': 'primary', 'Past due': 'warning', 'Canceled': 'neutral' }
</script>

<template>
  <div class="ex-table">
    <div class="ex-bar">
      <span class="ex-title">Accounts</span>
      <span class="ex-count">{{ selected.length ? `${selected.length} selected` : '7 accounts' }}</span>
    </div>
    <MiTable v-bind="p" v-model:selected="selected" v-model:sort="sort">
      <template #cell="{ column, value, selected: isSelected }">
        <MiBadge v-if="column.key === 'status' && !isSelected" :tone="tones[String(value)]" dot>{{ value }}</MiBadge>
        <template v-else>{{ fmt(column.key, value) }}</template>
      </template>
    </MiTable>
  </div>
</template>

<style scoped>
.ex-table { display: grid; gap: 10px; min-width: 0; align-content: start; }
.ex-bar { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 0 4px; }
.ex-title { font-size: 17px; font-weight: 600; color: var(--mi-label); }
.ex-count { font-size: 13px; color: var(--mi-label2); }
</style>
