<script lang="ts">
export const playground = {
  props: {
    variant: 'stat',
    items: [
      { label: 'Organic search', sub: '+4.2% vs last week', value: '48.2k', color: miChartColor(0) },
      { label: 'Direct', sub: '+1.1% vs last week', value: '23.1k', color: miChartColor(1) },
      { label: 'Referral', sub: '-0.6% vs last week', value: '12.9k', color: miChartColor(2) },
      { label: 'Newsletter', sub: '+8.9% vs last week', value: '5.4k', color: miChartColor(3) }
    ]
  },
  controls: ['variant', 'columns', 'lessLabel', 'moreLabel'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const active = ref(-1)
</script>

<template>
  <section class="ex-box mi:self-center mi:shadow-1 mi:box-border" aria-labelledby="ex-legend-h">
    <h3 id="ex-legend-h" class="ex-h mi:mt-0 mi:mx-0 mi:mb-3 mi:text-[17px] mi:font-semibold mi:text-label">Visits by source</h3>
    <MiChartLegend v-bind="p" v-model:active="active" />
  </section>
</template>

<style scoped>
.ex-box { width: 100%; max-width: 560px; margin: 0 auto; padding: 16px 18px; border-radius: 18px; background: var(--mi-card); }
</style>
