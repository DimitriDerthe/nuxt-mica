<script setup lang="ts">
/** Command palette: search input over a filtered, grouped list with keyboard navigation; place it inside MiDialog for a modal palette. */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export interface MiCommandItem {
  value: string
  label: string
  /** Group heading; items sharing a group are listed together. */
  group?: string
  /** Right-aligned hint such as a shortcut. */
  shortcut?: string
  disabled?: boolean
  /** Extra search terms. */
  keywords?: string[]
}

const props = withDefaults(defineProps<{
  /** Commands to list; they are filtered by the query and grouped by their `group`. */
  items: MiCommandItem[]
  /** Placeholder of the search input. */
  placeholder?: string
  /** Text shown when nothing matches. */
  emptyText?: string
  /** Focus the search input on mount. */
  autofocus?: boolean
  /** Render as a modal palette with scrim; control it with v-model:open. */
  dialog?: boolean
  /** Key that toggles the dialog together with Cmd/Ctrl (for example `k`); empty disables. */
  hotkey?: string
  /** Accessible name of the dialog. */
  label?: string
}>(), { label: 'Command menu', placeholder: 'Type a command or search...', emptyText: 'No results found.' })

const emit = defineEmits<{ select: [item: MiCommandItem] }>()
/** Text typed in the search field, which filters the items. */
const query = defineModel<string>('query', { default: '' })
/** Whether the palette dialog is open (only with `dialog`). */
const open = defineModel<boolean>('open', { default: false })
const root = ref<HTMLElement | null>(null)
let prevFocus: HTMLElement | null = null


const uid = useId()
const active = ref(0)
const listId = `mi-cmd-list-${uid}`
const optId = (i: number) => `mi-cmd-opt-${uid}-${i}`

const flat = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? props.items.filter(i => [i.label, i.group ?? '', ...(i.keywords ?? [])].join(' ').toLowerCase().includes(q)) : props.items
})
const groups = computed(() => {
  const map = new Map<string, { item: MiCommandItem, index: number }[]>()
  flat.value.forEach((item, index) => {
    const g = item.group ?? ''
    if (!map.has(g)) map.set(g, [])
    map.get(g)!.push({ item, index })
  })
  return [...map].map(([name, entries]) => ({ name, entries }))
})

function move(dir: 1 | -1) {
  const n = flat.value.length
  for (let k = 1; k <= n; k++) {
    const i = (((active.value + dir * k) % n) + n) % n
    if (!flat.value[i]!.disabled) { active.value = i; break }
  }
}
function run(i: number) {
  const it = flat.value[i]
  if (it && !it.disabled) { emit('select', it); if (props.dialog) open.value = false }
}
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Home') { e.preventDefault(); active.value = 0 }
  else if (e.key === 'End') { e.preventDefault(); active.value = Math.max(0, flat.value.length - 1) }
  else if (e.key === 'Enter') { e.preventDefault(); run(active.value) }
}
function onHotkey(e: KeyboardEvent) {
  if (props.dialog && props.hotkey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === props.hotkey.toLowerCase()) { e.preventDefault(); open.value = !open.value }
}
function onDialogKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { e.stopPropagation(); open.value = false }
}
watch(open, async (v) => {
  if (v) { prevFocus = document.activeElement as HTMLElement | null; query.value = ''; active.value = 0; await nextTick(); root.value?.querySelector('input')?.focus() }
  else prevFocus?.focus?.()
})
onMounted(() => document.addEventListener('keydown', onHotkey))
onBeforeUnmount(() => document.removeEventListener('keydown', onHotkey))
defineSlots<{
  /** Custom row content for each command. */
  item?(props: { item: MiCommandItem }): unknown
  /** Replaces the no-match message. */
  empty?(): unknown
}>()
</script>

<template>
  <Teleport v-if="dialog" to="body">
    <Transition name="mi-cmd-fade">
      <div v-if="open" class="mi mi-cmd__scrim" @mousedown.self="open = false" @keydown="onDialogKey">
        <div ref="root" class="mi-cmd__dialog" role="dialog" aria-modal="true" :aria-label="label">
          <MiCommand v-bind="{ items, placeholder, emptyText }" v-model:query="query" @select="(i: MiCommandItem) => { emit('select', i); open = false }" />
        </div>
      </div>
    </Transition>
  </Teleport>
  <div v-else class="mi-cmd mi:flex-col mi:font-mi mi:overflow-hidden">
    <input
      v-model="query" class="mi-cmd__input mi:box-border mi:w-full mi:h-12 mi:py-0 mi:px-4 mi:bg-transparent mi:text-inherit mi:[outline:none] mi:focus-visible:shadow-[inset_0_-2px_0_var(--mi-p)]" type="text" role="combobox" aria-expanded="true" :aria-controls="listId" :aria-label="placeholder"
      :aria-activedescendant="flat.length ? optId(active) : undefined" autocomplete="off" :placeholder="placeholder" :autofocus="autofocus"
      @input="active = 0" @keydown="onKeydown"
    >
    <div :id="listId" class="mi-cmd__list mi:max-h-80 mi:overflow-y-auto mi:p-1.5 mi:overscroll-contain" role="listbox">
      <div v-if="!flat.length" class="mi-cmd__empty mi:py-6 mi:px-2.5 mi:text-center mi:text-[14px] mi:text-label2" role="status"><slot name="empty">{{ emptyText }}</slot></div>
      <div v-for="(g, gi) in groups" :key="g.name" class="mi-cmd__group" role="group" :aria-label="g.name || undefined">
        <div v-if="gi > 0" class="mi-cmd__sep mi:h-px mi:my-1 mi:-mx-1.5 mi:bg-field-b" role="separator" />
        <div v-if="g.name" class="mi-cmd__heading mi:pt-2 mi:px-2.5 mi:pb-1 mi:text-[12px] mi:font-semibold mi:text-label2" aria-hidden="true">{{ g.name }}</div>
        <div
          v-for="e in g.entries" :id="optId(e.index)" :key="e.item.value" class="mi-cmd__item mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-9.5 mi:py-1.5 mi:px-2.5 mi:rounded-[8px] mi:text-[15px] mi:cursor-pointer mi:select-none mi:[&.is-active]:bg-p mi:[&.is-active]:text-p-on mi:[&.is-disabled]:text-label3 mi:[&.is-disabled]:cursor-not-allowed mi:[&.is-disabled.is-active]:bg-transparent" role="option"
          :class="{ 'is-active': e.index === active, 'is-disabled': e.item.disabled }" :aria-selected="e.index === active" :aria-disabled="e.item.disabled || undefined"
          @mousemove="active = e.index" @click="run(e.index)"
        >
          <slot name="item" :item="e.item"><span class="mi-cmd__label">{{ e.item.label }}</span></slot>
          <kbd v-if="e.item.shortcut" class="mi-cmd__kbd mi:opacity-70">{{ e.item.shortcut }}</kbd>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.mi-cmd__scrim { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: center; align-items: flex-start; padding: 12vh 16px 16px; background: rgb(0 0 0 / .4); }
.mi-cmd__dialog { width: 100%; max-width: 560px; border-radius: 14px; overflow: hidden; box-shadow: var(--mi-sh3), inset 0 0 0 .5px var(--mi-mat-b); }
.mi-cmd-fade-enter-active, .mi-cmd-fade-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.mi-cmd-fade-enter-from, .mi-cmd-fade-leave-to { opacity: 0; }
</style>

<style scoped>
.mi-cmd { display: flex; min-width: 0; border-radius: 12px; background: var(--mi-elev); color: var(--mi-label); }
.mi-cmd__input { border: 0; border-bottom: 1px solid var(--mi-field-b); font: inherit; font-size: 16px; }
.mi-cmd__kbd { font: inherit; font-size: 12px; }
</style>
