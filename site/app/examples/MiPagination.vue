<script lang="ts">
export const playground = {
  props: { total: 24, siblings: 1, summary: true, compact: 'auto' },
  controls: ['total', 'siblings', 'compact', 'summary'],
  height: 360
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const page = ref(3)
const customers = ['Northwind Labs', 'Acme Studio', 'Bluebird Health', 'Fernway Travel', 'Orbit Foods', 'Halcyon Bank', 'Juniper Legal']
const rows = computed(() => Array.from({ length: 4 }, (_, i) => {
  const n = (page.value - 1) * 4 + i
  return {
    id: `INV-${String(2041 + n).padStart(4, '0')}`,
    customer: customers[n % customers.length],
    amount: `$${(180 + ((n * 137) % 900)).toLocaleString('en-US')}.00`
  }
}))
</script>

<template>
  <div class="card mi:w-[min(100%,_480px)] mi:rounded-[20px] mi:bg-card mi:shadow-1 mi:justify-items-center mi:box-border">
    <ul class="rows mi:[list-style:none] mi:m-0 mi:p-0 mi:w-full">
      <li class="mi:[.rows_&]:grid mi:[.rows_&]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:[.rows_&]:gap-3 mi:[.rows_&]:py-2.5 mi:[.rows_&]:px-0.5 mi:[.rows_&]:border-b mi:[.rows_&]:border-b-sep mi:[.rows_&]:text-[14px]" v-for="r in rows" :key="r.id">
        <span class="id mi:font-[ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-[12px] mi:text-label3 mi:self-center">{{ r.id }}</span>
        <span class="who mi:text-label mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ r.customer }}</span>
        <span class="amt mi:text-label mi:tabular-nums">{{ r.amount }}</span>
      </li>
    </ul>
    <div class="pager mi:w-full mi:flex mi:justify-center">
      <MiPagination v-model="page" v-bind="p" aria-label="Invoices" />
    </div>
  </div>
</template>

<style scoped>
.card { padding: 14px 16px; display: grid; gap: 14px; }
@media (max-width: 480px) { .card { padding: 12px 10px; } }
</style>
