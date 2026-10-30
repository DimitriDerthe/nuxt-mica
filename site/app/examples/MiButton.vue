<script lang="ts">
export const playground = {
  props: { variant: 'filled', size: 'regular' },
  controls: ['variant', 'brand', 'size', 'loading', 'disabled', 'block', 'soft'],
  slot: 'Continue'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiButton v-bind="p">Continue</MiButton>
</template>
