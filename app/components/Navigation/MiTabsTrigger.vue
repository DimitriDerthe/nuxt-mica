<script setup lang="ts">
/** Compound part of MiTabs: a tab button that selects the panel with the same value. */
import { computed, inject } from 'vue'
import { miTabsKey } from '../../utils/miTabs'

const props = defineProps<{
  /** Value shared with the matching MiTabsContent. */
  value: string
  /** Dims the tab and prevents it from being selected. */
  disabled?: boolean
}>()
const ctx = inject(miTabsKey, null)
const on = computed(() => ctx?.model.value === props.value)
defineSlots<{
  /** Tab label. */
  default?(): unknown
}>()
</script>

<template>
  <button
    :id="`mi-tab-${ctx?.uid}-${value}`" type="button" role="tab" class="mi-tabs__tab" :class="{ 'is-on': on }"
    :aria-selected="on" :aria-controls="`mi-tabpanel-${ctx?.uid}-${value}`" :tabindex="on ? 0 : -1"
    :disabled="disabled || undefined" @click="ctx && (ctx.model.value = value)"
  >
    <slot />
  </button>
</template>

<style scoped>
.mi-tabs__tab{border:0;border-radius:8px;height:30px;padding:0 12px;background:transparent;color:var(--mi-label2);font:inherit;font-family:var(--mi-font);font-size:14px;font-weight:500;cursor:pointer;transition:opacity var(--mi-dur-1) var(--mi-ease),transform var(--mi-dur-1) var(--mi-ease)}
.mi-tabs__tab.is-on{background:var(--mi-card);color:var(--mi-label);box-shadow:var(--mi-sh1)}
.mi-tabs__tab:active:not(:disabled){transform:scale(.97)}
.mi-tabs__tab:disabled{color:var(--mi-label3);cursor:default}
.mi-tabs__tab:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
