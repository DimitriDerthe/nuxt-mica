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
  <div class="card">
    <ul class="rows">
      <li v-for="r in rows" :key="r.id">
        <span class="id">{{ r.id }}</span>
        <span class="who">{{ r.customer }}</span>
        <span class="amt">{{ r.amount }}</span>
      </li>
    </ul>
    <div class="pager">
      <MiPagination v-model="page" v-bind="p" aria-label="Invoices" />
    </div>
  </div>
</template>

<style scoped>
.card { width: min(100%, 480px); padding: 14px 16px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 14px; justify-items: center; box-sizing: border-box; }
.pager { width: 100%; display: flex; justify-content: center; }
@media (max-width: 480px) { .card { padding: 12px 10px; } }
.rows { list-style: none; margin: 0; padding: 0; width: 100%; }
.rows li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 12px; padding: 10px 2px; border-bottom: 1px solid var(--mi-sep); font-size: 14px; }
.id { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; color: var(--mi-label3); align-self: center; }
.who { color: var(--mi-label); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.amt { color: var(--mi-label); font-variant-numeric: tabular-nums; }
</style>
