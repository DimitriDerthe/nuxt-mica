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
    <span v-for="n in names" :key="n" class="ex-mq__chip mi:py-2.5 mi:px-5 mi:rounded-[999px] mi:bg-card mi:shadow-1 mi:text-label mi:text-[15px] mi:font-semibold mi:tracking-[-.01em] mi:whitespace-nowrap">{{ n }}</span>
  </MiMarquee>
</template>

<style scoped>
.ex-mq { width: min(100%, 560px); }
</style>
