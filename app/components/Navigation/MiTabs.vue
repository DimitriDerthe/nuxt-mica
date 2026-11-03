<script setup lang="ts">
/** Tabbed panels: compose MiTabsList/MiTabsTrigger/MiTabsContent in the default slot, or pass `items` and fill panel slots named after each value; v-model is the selected tab value. */
import { computed, provide, ref, toRef, useId } from 'vue'
import { miNavRoving } from '../../utils/miNav'
import { miTabsKey } from '../../utils/miTabs'

export interface MiTabsItem { value: string, label: string, disabled?: boolean }

const props = withDefaults(defineProps<{
  /** Tabs to render, in order. */
  items?: MiTabsItem[]
  /** Layout of the tab list. */
  orientation?: 'horizontal' | 'vertical'
  /** Accessible name of the tab list. */
  ariaLabel?: string
}>(), { items: undefined, orientation: 'horizontal', ariaLabel: 'Tabs' })

/** Value of the active tab. */

const model = defineModel<string>()
const uid = useId()
const root = ref<HTMLElement | null>(null)
const list = computed(() => props.items ?? [])
const current = computed(() => {
  const hit = list.value.find(i => i.value === model.value && !i.disabled)
  return hit ?? list.value.find(i => !i.disabled)
})
provide(miTabsKey, { model, uid, orientation: toRef(props, 'orientation') })
const tabId = (v: string) => `mi-tab-${uid}-${v}`
const panelId = (v: string) => `mi-tabpanel-${uid}-${v}`

function onKey(e: KeyboardEvent) {
  if (miNavRoving(e, root.value, '[role="tab"]', props.orientation)) {
    const el = document.activeElement as HTMLElement | null
    el?.click()
  }
}
defineSlots<{
  /** Compound content: MiTabsList and MiTabsContent children. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-tabs mi:font-mi" :class="`is-${orientation}`">
    <slot />
    <div v-if="items" ref="root" class="mi-tabs__list mi:inline-flex mi:gap-0.5 mi:p-[3px] mi:rounded-[10px] mi:bg-fill3 mi:[align-self:flex-start] mi:[.is-vertical_&]:flex-col mi:[.is-vertical_&]:[align-self:flex-start]" role="tablist" :aria-label="ariaLabel" :aria-orientation="orientation" @keydown="onKey">
      <button
        v-for="it in list" :id="tabId(it.value)" :key="it.value" type="button" role="tab" class="mi-tabs__tab mi:[border:0] mi:rounded-[8px] mi:h-7.5 mi:py-0 mi:px-3 mi:bg-transparent mi:text-label2 mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-1)_var(--mi-ease),transform_var(--mi-dur-1)_var(--mi-ease)] mi:[&.is-on]:bg-card mi:[&.is-on]:text-label mi:[&.is-on]:shadow-1 mi:[&:active:not(:disabled)]:transform-[scale(.97)] mi:disabled:text-label3 mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]"
        :class="{ 'is-on': it.value === current?.value }" :aria-selected="it.value === current?.value"
        :aria-controls="panelId(it.value)" :tabindex="it.value === current?.value ? 0 : -1" :disabled="it.disabled || undefined"
        @click="model = it.value"
      >
        {{ it.label }}
      </button>
    </div>
    <template v-for="it in list" :key="it.value">
      <div
        v-if="it.value === current?.value" :id="panelId(it.value)" class="mi-tabs__panel mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px] mi:[outline:none] mi:flex-1 mi:min-w-0" role="tabpanel"
        :aria-labelledby="tabId(it.value)" tabindex="0"
      >
        <slot :name="it.value" :item="it" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.mi-tabs{color:var(--mi-label);display:flex;flex-direction:column;gap:12px}
.mi-tabs.is-vertical{flex-direction:row;align-items:flex-start}
.mi-tabs__tab{font:inherit;font-size:14px;font-weight:500}
</style>
