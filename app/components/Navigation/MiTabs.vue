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
  <div class="mi-tabs" :class="`is-${orientation}`">
    <slot />
    <div v-if="items" ref="root" class="mi-tabs__list" role="tablist" :aria-label="ariaLabel" :aria-orientation="orientation" @keydown="onKey">
      <button
        v-for="it in list" :id="tabId(it.value)" :key="it.value" type="button" role="tab" class="mi-tabs__tab"
        :class="{ 'is-on': it.value === current?.value }" :aria-selected="it.value === current?.value"
        :aria-controls="panelId(it.value)" :tabindex="it.value === current?.value ? 0 : -1" :disabled="it.disabled || undefined"
        @click="model = it.value"
      >
        {{ it.label }}
      </button>
    </div>
    <template v-for="it in list" :key="it.value">
      <div
        v-if="it.value === current?.value" :id="panelId(it.value)" class="mi-tabs__panel" role="tabpanel"
        :aria-labelledby="tabId(it.value)" tabindex="0"
      >
        <slot :name="it.value" :item="it" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.mi-tabs{font-family:var(--mi-font);color:var(--mi-label);display:flex;flex-direction:column;gap:12px}
.mi-tabs.is-vertical{flex-direction:row;align-items:flex-start}
.mi-tabs__list{display:inline-flex;gap:2px;padding:3px;border-radius:10px;background:var(--mi-fill3);align-self:flex-start}
.is-vertical .mi-tabs__list{flex-direction:column;align-self:flex-start}
.mi-tabs__tab{border:0;border-radius:8px;height:30px;padding:0 12px;background:transparent;color:var(--mi-label2);font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:opacity var(--mi-dur-1) var(--mi-ease),transform var(--mi-dur-1) var(--mi-ease)}
.mi-tabs__tab.is-on{background:var(--mi-card);color:var(--mi-label);box-shadow:var(--mi-sh1)}
.mi-tabs__tab:active:not(:disabled){transform:scale(.97)}
.mi-tabs__tab:disabled{color:var(--mi-label3);cursor:default}
.mi-tabs__tab:focus-visible,.mi-tabs__panel:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
.mi-tabs__panel{outline:none;flex:1;min-width:0}
</style>
