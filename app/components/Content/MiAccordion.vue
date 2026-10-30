<script setup lang="ts">
/** Stacked expandable panels (disclosure). Use for FAQs or grouped settings; `single` or `multiple` open mode, optional `items` data. */
import { computed, provide, ref, toRef } from 'vue'
import MiAccordionItem from './MiAccordionItem.vue'
import { miAccordionKey } from '../../utils/miAccordion'

export interface MiAccordionEntry {
  value: string
  title: string
  content: string
  disabled?: boolean
}

defineSlots<{
  /** Panels, normally `MiAccordionItem` elements; replaces the `items` rendering. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** `single`: one panel open at a time. `multiple`: any number. */
  type?: 'single' | 'multiple'
  /** Single mode only: allow closing the open panel. */
  collapsible?: boolean
  /** Convenience: render items from data instead of `MiAccordionItem` slots. */
  items?: MiAccordionEntry[]
  /** `card`: surface with padding. `plain`: no surface. */
  variant?: 'card' | 'plain'
  /** Heading level of each panel trigger; keeps the page outline valid. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
}>(), { type: 'single', collapsible: true, variant: 'card', headingLevel: 3 })

/** Open panel value (single) or values (multiple). */
const model = defineModel<string | string[] | null>({ default: null })
const root = ref<HTMLElement>()

const openSet = computed(() => new Set(Array.isArray(model.value) ? model.value : model.value ? [model.value] : []))

function toggle(v: string) {
  const isOpen = openSet.value.has(v)
  if (props.type === 'multiple') {
    const cur = [...openSet.value]
    model.value = isOpen ? cur.filter(x => x !== v) : [...cur, v]
  } else if (isOpen) {
    if (props.collapsible) model.value = null
  } else {
    model.value = v
  }
}

provide(miAccordionKey, { isOpen: v => openSet.value.has(v), toggle, headingLevel: toRef(props, 'headingLevel') })

function onKey(e: KeyboardEvent) {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End']
  if (!keys.includes(e.key)) return
  const trig = [...(root.value?.querySelectorAll<HTMLButtonElement>('button[data-mi-acc-trigger]:not(:disabled)') ?? [])]
  const i = trig.indexOf(e.target as HTMLButtonElement)
  if (i < 0) return
  e.preventDefault()
  const n = trig.length
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : e.key === 'ArrowDown' ? (i + 1) % n : (i - 1 + n) % n
  trig[next]?.focus()
}
</script>

<template>
  <div ref="root" class="mi-acc" :class="`mi-acc--${variant}`" @keydown="onKey">
    <slot>
      <MiAccordionItem v-for="it in items" :key="it.value" :value="it.value" :title="it.title" :disabled="it.disabled">
        {{ it.content }}
      </MiAccordionItem>
    </slot>
  </div>
</template>

<style scoped>
.mi-acc{font-family:var(--mi-font);color:var(--mi-label);min-width:0}
.mi-acc--card{border-radius:14px;background:var(--mi-card);box-shadow:var(--mi-sh1);padding:0 20px}
</style>
