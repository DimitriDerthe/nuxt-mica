<script setup lang="ts">
/** Compound part of MiTabs: the panel shown when its value is the selected tab. */
import { computed, inject } from 'vue'
import { miTabsKey } from '../../utils/miTabs'

const props = defineProps<{
  /** Value shared with the matching MiTabsTrigger. */
  value: string
}>()
const ctx = inject(miTabsKey, null)
const on = computed(() => ctx?.model.value === props.value)
defineSlots<{
  /** Panel content. */
  default?(): unknown
}>()
</script>

<template>
  <div
    v-if="on" :id="`mi-tabpanel-${ctx?.uid}-${value}`" class="mi-tabs__panel mi:font-mi mi:[outline:none] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]" role="tabpanel"
    :aria-labelledby="`mi-tab-${ctx?.uid}-${value}`" tabindex="0"
  >
    <slot />
  </div>
</template>

<style scoped>
.mi-tabs__panel{color:var(--mi-label);flex:1;min-width:0}
</style>
