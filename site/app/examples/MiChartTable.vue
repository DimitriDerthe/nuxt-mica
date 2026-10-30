<script lang="ts">
export const playground = {
  props: {
    caption: 'Revenue by channel, Q3 2026',
    columns: [
      { key: 'channel', label: 'Channel' },
      { key: 'visits', label: 'Visits', align: 'right' },
      { key: 'conv', label: 'Conversion', align: 'right' },
      { key: 'revenue', label: 'Revenue', align: 'right' }
    ],
    rows: [
      { channel: 'Organic search', visits: '48,210', conv: '3.4%', revenue: '$82,400' },
      { channel: 'Direct', visits: '23,105', conv: '4.1%', revenue: '$51,960' },
      { channel: 'Referral', visits: '12,870', conv: '2.8%', revenue: '$19,300' },
      { channel: 'Paid social', visits: '9,442', conv: '1.9%', revenue: '$11,240' },
      { channel: 'Newsletter', visits: '5,390', conv: '6.2%', revenue: '$17,850' }
    ]
  },
  controls: ['zebra', 'caption'],
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <section class="ex-box" aria-labelledby="ex-ct-h">
    <h3 id="ex-ct-h" class="ex-h">Revenue by channel</h3>
    <p class="ex-sub">Q3 2026, all regions</p>
    <MiChartTable v-bind="p" />
  </section>
</template>

<style scoped>
.ex-box { align-self: center; width: 100%; max-width: 620px; margin: 0 auto; padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; min-width: 0; overflow-x: auto; }
.ex-h { margin: 0; font-size: 17px; font-weight: 600; color: var(--mi-label); }
.ex-sub { margin: 2px 0 12px; font-size: 13px; color: var(--mi-label2); }
</style>
