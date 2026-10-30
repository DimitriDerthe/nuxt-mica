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
    <div class="bar">
      <div>
        <div class="name">Running shoes</div>
        <div class="sub">128 results</div>
      </div>
      <MiButton variant="gray" size="small" @click="open = true">Filters · {{ active }}</MiButton>
    </div>
    <MiSheet
      v-model="open" v-model:detent="detent" v-bind="p"
      @cancel="filters = { stock: false, shipping: false, sale: false }"
    >
      <div class="list">
        <div v-for="r in rows" :key="r.key" class="row">
          <div>
            <div :id="'ex-sheet-' + r.key" class="name">{{ r.label }}</div>
            <div class="sub">{{ r.hint }}</div>
          </div>
          <MiSwitch v-model="filters[r.key]" :aria-labelledby="'ex-sheet-' + r.key" />
        </div>
      </div>
    </MiSheet>
  </div>
</template>

<style scoped>
.ex { width: min(100%, 340px); }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
.name { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub { font-size: 13px; color: var(--mi-label2); }
.list { display: grid; padding: 4px 0; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--mi-sep); }
.row:last-child { border-bottom: 0; }
</style>
