<script lang="ts">
export const playground = {
  props: { time: true, dateStyle: 'medium', minuteStep: 15 },
  controls: ['time', 'dateStyle', 'minuteStep', 'placeholder', 'invalid', 'disabled'],
  layout: 'start',
  height: 520
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()

const min = new Date()
min.setHours(0, 0, 0, 0)
const start = new Date(min)
start.setDate(start.getDate() + 3)
start.setHours(10, 30, 0, 0)
const when = ref<Date | null>(start)
</script>

<template>
  <div class="card mi:mx-auto mi:shadow-1">
    <MiField label="Kickoff meeting" hint="Invitees get a calendar invite in their time zone.">
      <MiDatePicker v-model="when" v-bind="p" :min="min" />
    </MiField>
  </div>
</template>

<style scoped>
.card { width: min(100%, 360px); padding: 18px; border-radius: 20px; background: var(--mi-card); }
</style>
