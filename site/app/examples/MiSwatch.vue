<script lang="ts">
export const playground = {
  props: { label: 'Folder color' },
  controls: ['label', 'showName', 'disabled']
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const color = ref<string | null>('primary')
const fill = computed(() => MI_SWATCH_DEFAULTS.find(o => o.value === color.value)?.color ?? 'var(--mi-p)')
</script>

<template>
  <div class="card">
    <div class="folder" :style="{ color: fill }" aria-hidden="true">
      <MiIcon name="folder" :size="44" filled />
    </div>
    <div class="body">
      <MiText variant="headline" as="h3">Client work</MiText>
      <MiSwatch v-model="color" v-bind="p" />
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; align-items: center; gap: 16px; width: min(100%, 560px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.folder { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 16px; background: var(--mi-fill4); flex: none; }
.body { display: grid; gap: 8px; flex: 1; min-width: 0; }
@media (max-width: 480px) { .card { align-items: flex-start; gap: 12px; } .folder { width: 48px; height: 48px; border-radius: 12px; } .folder :deep(svg) { width: 32px; height: 32px; } }
</style>
