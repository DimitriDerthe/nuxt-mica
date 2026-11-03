<script lang="ts">
export const playground = {
  props: {
    label: 'Monthly revenue',
    value: '$84.2k',
    delta: '12.4%',
    spark: [61, 63, 62, 66, 70, 69, 73, 75, 74, 79, 82, 84]
  },
  controls: ['label', 'value', 'delta', 'trend', 'tone', 'comparison'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-grid mi:self-center">
    <MiStatTile v-bind="p" />
    <MiStatTile label="Active customers" value="1,284" delta="3.1%" :spark="[1180, 1192, 1201, 1215, 1222, 1236, 1249, 1255, 1262, 1270, 1279, 1284]" />
    <MiStatTile label="Churn rate" value="2.3%" delta="0.4 pt" trend="down" tone="good" :spark="[3.1, 3, 2.9, 2.9, 2.8, 2.7, 2.7, 2.6, 2.5, 2.4, 2.4, 2.3]" />
  </div>
</template>

<style scoped>
.ex-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; min-width: 0; }
</style>
