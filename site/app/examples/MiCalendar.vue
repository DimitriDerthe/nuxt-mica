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
  <div class="card mi:p-4 mi:shadow-1 mi:grid mi:gap-3">
    <header class="head">
      <h3 class="mi:[.head_&]:m-0">Delivery date</h3>
      <p class="mi:[.head_&]:mt-0.5 mi:[.head_&]:mx-0 mi:[.head_&]:mb-0">Weekdays only, up to two months ahead.</p>
    </header>
    <MiCalendar v-model="date" v-bind="p" :min="min" :max="max" :is-disabled="isDisabled" />
    <footer class="foot mi:flex mi:justify-between mi:items-baseline mi:gap-3 mi:pt-3 mi:border-t mi:border-t-sep mi:text-[14px] mi:text-label2">
      <span>Arrives</span>
      <strong class="mi:[.foot_&]:text-right">{{ label }}</strong>
    </footer>
  </div>
</template>

<style scoped>
.card { width: min(100%, 320px); border-radius: 20px; background: var(--mi-card); }
.head h3 { font-size: 17px; font-weight: 600; color: var(--mi-label); }
.head p { font-size: 13px; color: var(--mi-label2); }
.foot strong { color: var(--mi-label); font-weight: 600; }
</style>
