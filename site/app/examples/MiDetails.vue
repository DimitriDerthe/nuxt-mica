<script lang="ts">
export const playground = {
  props: {
    items: [
      { key: 'order', label: 'Order', value: '#48213' },
      { key: 'placed', label: 'Placed', value: 'Oct 28, 2026' },
      { key: 'status', label: 'Status', value: 'Shipped' },
      { key: 'carrier', label: 'Carrier', value: 'DHL Express' },
      { key: 'tracking', label: 'Tracking', value: 'JD0146 0012 8841', href: '#tracking' },
      { key: 'address', label: 'Ship to', value: '18 Rue Oberkampf, 75011 Paris' },
      { key: 'total', label: 'Total', value: '€248.00' }
    ]
  },
  controls: ['labelWidth']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <section class="ex-box" aria-labelledby="ex-details-h">
    <h3 id="ex-details-h" class="ex-h">Order summary</h3>
    <MiDetails v-bind="p" />
  </section>
</template>

<style scoped>
.ex-box { width: min(100%, 440px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-h { margin: 0 0 10px; font-size: 17px; font-weight: 600; color: var(--mi-label); }
</style>
