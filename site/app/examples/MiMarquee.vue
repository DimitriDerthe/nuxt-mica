<script lang="ts">
export const playground = {
  props: { ariaLabel: 'Trusted by' },
  controls: ['speed', 'direction', 'pauseOnHover', 'gap', 'vertical', 'fade']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const names = ['Northwind', 'Lumen', 'Atlas', 'Foundry', 'Parallel', 'Meridian']
</script>

<template>
  <MiMarquee v-bind="p" class="ex-mq">
    <span v-for="n in names" :key="n" class="ex-mq__chip">{{ n }}</span>
  </MiMarquee>
</template>

<style scoped>
.ex-mq { width: min(100%, 560px); }
.ex-mq__chip { padding: 10px 20px; border-radius: 999px; background: var(--mi-card); box-shadow: var(--mi-sh1); color: var(--mi-label); font-size: 15px; font-weight: 600; letter-spacing: -.01em; white-space: nowrap; }
</style>
