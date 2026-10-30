<script lang="ts">
export const playground = {
  props: {
    label: 'Response time over the last 12 hours, trending down',
    values: [212, 224, 218, 240, 231, 205, 198, 201, 189, 194, 186, 182]
  },
  controls: ['width', 'height', 'strokeWidth', 'dot', 'animate', 'label']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const others = [
  { name: 'Error rate', value: '0.42%', values: [0.61, 0.58, 0.66, 0.52, 0.49, 0.55, 0.47, 0.5, 0.44, 0.46, 0.41, 0.42] },
  { name: 'Requests / min', value: '18.4k', values: [12.1, 12.8, 13.6, 14.2, 15.9, 16.4, 15.8, 17.1, 17.6, 18.9, 18.2, 18.4] }
]
</script>

<template>
  <ul class="ex-box" aria-label="API health">
    <li class="ex-row">
      <span class="ex-name">p95 latency</span>
      <MiSparkline v-bind="p" />
      <span class="ex-val">182 ms</span>
    </li>
    <li v-for="o in others" :key="o.name" class="ex-row">
      <span class="ex-name">{{ o.name }}</span>
      <MiSparkline v-bind="p" :values="o.values" :label="undefined" />
      <span class="ex-val">{{ o.value }}</span>
    </li>
  </ul>
</template>

<style scoped>
.ex-box { display: grid; width: min(100%, 360px); margin: 0; padding: 4px 16px; list-style: none; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-row { display: grid; grid-template-columns: minmax(0, 1fr) auto 64px; align-items: center; gap: 12px; min-height: 52px; }
.ex-row + .ex-row { border-top: 1px solid var(--mi-sep); }
.ex-name { font-size: 15px; color: var(--mi-label); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ex-val { font-size: 15px; font-weight: 600; color: var(--mi-label); text-align: right; font-variant-numeric: tabular-nums; }
</style>
