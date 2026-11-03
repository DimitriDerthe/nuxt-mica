<script setup lang="ts">
/** Compound part of MiTabs: the tab list that holds MiTabsTrigger children; arrows/Home/End move between triggers. */
import { inject, ref } from 'vue'
import { miNavRoving } from '../../utils/miNav'
import { miTabsKey } from '../../utils/miTabs'

defineProps<{
  /** Accessible name of the tab list. */
  ariaLabel?: string
}>()
const ctx = inject(miTabsKey, null)
const root = ref<HTMLElement | null>(null)
function onKey(e: KeyboardEvent) {
  if (miNavRoving(e, root.value, '[role="tab"]', ctx?.orientation.value ?? 'horizontal')) (document.activeElement as HTMLElement | null)?.click()
}
defineSlots<{
  /** MiTabsTrigger children. */
  default?(): unknown
}>()
</script>

<template>
  <div ref="root" class="mi-tabs__list mi:font-mi mi:[align-self:flex-start]" role="tablist" :aria-label="ariaLabel" :aria-orientation="ctx?.orientation.value" @keydown="onKey">
    <slot />
  </div>
</template>

<style scoped>
.mi-tabs__list{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:var(--mi-fill3)}
</style>
