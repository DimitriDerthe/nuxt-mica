<script lang="ts">
export const playground = {
  props: {
    pageSize: 5,
    selectable: 'multiple',
    columns: [
      { key: 'name', label: 'Customer', sortable: true },
      { key: 'plan', label: 'Plan', sortable: true },
      { key: 'seats', label: 'Seats', align: 'end', numeric: true, sortable: true },
      { key: 'mrr', label: 'MRR', align: 'end', numeric: true, sortable: true }
    ],
    rows: [
      { id: '1', name: 'Northwind Traders', plan: 'Business', seats: 48, mrr: '$1,440' },
      { id: '2', name: 'Acme Robotics', plan: 'Enterprise', seats: 220, mrr: '$8,800' },
      { id: '3', name: 'Lumen Studio', plan: 'Starter', seats: 6, mrr: '$72' },
      { id: '4', name: 'Fjord Analytics', plan: 'Business', seats: 35, mrr: '$1,050' },
      { id: '5', name: 'Bright Orchard', plan: 'Starter', seats: 9, mrr: '$108' },
      { id: '6', name: 'Halcyon Health', plan: 'Enterprise', seats: 410, mrr: '$16,400' },
      { id: '7', name: 'Pixel & Pine', plan: 'Business', seats: 22, mrr: '$660' }
    ]
  },
  controls: ['filterable', 'columnToggle', 'selectable', 'pageSize', 'filterPlaceholder'],
  layout: 'fill',
  height: 460
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiDataTable v-bind="p" caption="Customers">
    <template #toolbar><MiButton size="small" variant="tinted">Export</MiButton></template>
    <template #empty>No customers match this filter.</template>
  </MiDataTable>
</template>
