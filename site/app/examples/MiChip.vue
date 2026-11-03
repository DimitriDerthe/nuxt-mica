<script lang="ts">
export const playground = {
  props: { label: 'Design', selectable: true },
  controls: ['tone', 'size', 'selectable', 'removable', 'disabled']
}
</script>

<script setup lang="ts">
import { reactive, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const all = ['Design', 'Engineering', 'Marketing', 'Sales', 'Support']
const tags = ref([...all])
const picked = reactive<Record<string, boolean>>({ Design: true, Engineering: true })
function remove(t: string) { tags.value = tags.value.filter(x => x !== t) }
</script>

<template>
  <div class="card">
    <div class="head mi:flex mi:items-center mi:justify-between mi:min-h-7">
      <MiText variant="subheadline" weight="semibold" as="h3">Filter by team</MiText>
      <MiButton v-if="tags.length < all.length" size="mini" variant="plain" @click="tags = [...all]">Reset</MiButton>
    </div>
    <div class="chips mi:flex mi:flex-wrap mi:gap-2">
      <MiChip v-for="t in tags" :key="t" v-model="picked[t]" v-bind="p" :label="t" :remove-label="`Remove ${t}`" @remove="remove(t)" />
      <MiText v-if="!tags.length" variant="footnote" tone="label3">No filters applied</MiText>
    </div>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 12px; width: min(100%, 360px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
</style>
