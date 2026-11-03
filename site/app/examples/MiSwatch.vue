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
  <div class="card mi:items-center mi:gap-4 mi:box-border mi:max-[480px]:[align-items:flex-start] mi:max-[480px]:gap-3">
    <div class="folder mi:grid mi:place-items-center mi:w-16 mi:h-16 mi:rounded-[16px] mi:bg-fill4 mi:flex-[none] mi:max-[480px]:w-12 mi:max-[480px]:h-12 mi:max-[480px]:rounded-[12px]" :style="{ color: fill }" aria-hidden="true">
      <MiIcon name="folder" :size="44" filled />
    </div>
    <div class="body mi:grid mi:gap-2 mi:flex-1 mi:min-w-0">
      <MiText variant="headline" as="h3">Client work</MiText>
      <MiSwatch v-model="color" v-bind="p" />
    </div>
  </div>
</template>

<style scoped>
.card { display: flex; width: min(100%, 560px); padding: 16px 18px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); }
@media (max-width: 480px) { .folder :deep(svg) { width: 32px; height: 32px; } }
</style>
