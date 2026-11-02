<script lang="ts">
export const playground = {
  props: { zIndex: 9999 },
  controls: ['zIndex']
}
</script>

<script setup lang="ts">

defineProps<{ p: Record<string, unknown> }>()
const { fire } = useMiConfetti()
function celebrate(e: MouseEvent) {
  fire({ origin: e.currentTarget as HTMLElement, count: 120, spread: 80 })
}
</script>

<template>
  <div>
    <MiConfetti v-bind="p" />
    <MiButton @click="celebrate">Celebrate</MiButton>
  </div>
</template>
