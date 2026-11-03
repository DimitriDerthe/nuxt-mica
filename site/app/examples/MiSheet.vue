<script lang="ts">
export const playground = {
  props: { title: 'Filters', cancelLabel: 'Reset', confirmLabel: 'Apply' },
  controls: ['title', 'cancelLabel', 'confirmLabel', 'dismissible', 'grabber', 'modal', 'closeOnConfirm'],
  height: 280
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const detent = ref(0)
const filters = ref({ stock: true, shipping: false, sale: true })
const active = computed(() => Object.values(filters.value).filter(Boolean).length)
const rows = [
  { key: 'stock', label: 'In stock only', hint: 'Hide items that ship later' },
  { key: 'shipping', label: 'Free shipping', hint: 'Orders over $35' },
  { key: 'sale', label: 'On sale', hint: 'At least 20% off' }
] as const
</script>

<template>
  <div class="ex">
    <div class="bar mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-3.5 mi:px-4 mi:rounded-[18px] mi:bg-card mi:shadow-1">
      <div>
        <div class="name mi:text-[15px] mi:font-semibold mi:text-label">Running shoes</div>
        <div class="sub mi:text-[13px] mi:text-label2">128 results</div>
      </div>
      <MiButton variant="gray" size="small" @click="open = true">Filters · {{ active }}</MiButton>
    </div>
    <MiSheet
      v-model="open" v-model:detent="detent" v-bind="p"
      @cancel="filters = { stock: false, shipping: false, sale: false }"
    >
      <div class="list mi:grid mi:py-1 mi:px-0">
        <div v-for="r in rows" :key="r.key" class="row mi:flex mi:items-center mi:justify-between mi:gap-4 mi:py-3 mi:px-0 mi:border-b mi:border-b-sep mi:last:[border-bottom:0]">
          <div>
            <div :id="'ex-sheet-' + r.key" class="name mi:text-[15px] mi:font-semibold mi:text-label">{{ r.label }}</div>
            <div class="sub mi:text-[13px] mi:text-label2">{{ r.hint }}</div>
          </div>
          <MiSwitch v-model="filters[r.key]" :aria-labelledby="'ex-sheet-' + r.key" />
        </div>
      </div>
    </MiSheet>
  </div>
</template>

<style scoped>
.ex { width: min(100%, 340px); }
</style>
