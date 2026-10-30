<script lang="ts">
export const playground = {
  controls: ['fixedRows', 'firstDay', 'locale'],
  height: 460
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const start = new Date()
start.setHours(0, 0, 0, 0)
const min = new Date(start)
const max = new Date(start.getFullYear(), start.getMonth() + 2, start.getDate())
const isDisabled = (d: Date) => d.getDay() === 0 || d.getDay() === 6

const first = new Date(start)
first.setDate(first.getDate() + 2)
while (isDisabled(first)) first.setDate(first.getDate() + 1)
const date = ref<Date | null>(first)

const label = computed(() => date.value
  ? date.value.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  : 'No date selected')
</script>

<template>
  <div class="card">
    <header class="head">
      <h3>Delivery date</h3>
      <p>Weekdays only, up to two months ahead.</p>
    </header>
    <MiCalendar v-model="date" v-bind="p" :min="min" :max="max" :is-disabled="isDisabled" />
    <footer class="foot">
      <span>Arrives</span>
      <strong>{{ label }}</strong>
    </footer>
  </div>
</template>

<style scoped>
.card { width: min(100%, 320px); padding: 16px; border-radius: 20px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; gap: 12px; }
.head h3 { margin: 0; font-size: 17px; font-weight: 600; color: var(--mi-label); }
.head p { margin: 2px 0 0; font-size: 13px; color: var(--mi-label2); }
.foot { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding-top: 12px; border-top: 1px solid var(--mi-sep); font-size: 14px; color: var(--mi-label2); }
.foot strong { color: var(--mi-label); font-weight: 600; text-align: right; }
</style>
