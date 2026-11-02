<script lang="ts">
export const playground = {
  props: { value: 'npm install @dimitriderthe/mica', label: 'Copy', copiedLabel: 'Copied' },
  controls: ['value', 'label', 'copiedLabel', 'timeout', 'variant', 'iconOnly', 'disabled']
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <MiCopyButton v-bind="p" />
</template>
