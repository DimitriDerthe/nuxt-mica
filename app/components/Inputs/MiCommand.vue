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
  <div v-else class="mi-cmd">
    <input
      v-model="query" class="mi-cmd__input" type="text" role="combobox" aria-expanded="true" :aria-controls="listId" :aria-label="placeholder"
      :aria-activedescendant="flat.length ? optId(active) : undefined" autocomplete="off" :placeholder="placeholder" :autofocus="autofocus"
      @input="active = 0" @keydown="onKeydown"
    >
    <div :id="listId" class="mi-cmd__list" role="listbox">
      <div v-if="!flat.length" class="mi-cmd__empty" role="status"><slot name="empty">{{ emptyText }}</slot></div>
      <div v-for="(g, gi) in groups" :key="g.name" class="mi-cmd__group" role="group" :aria-label="g.name || undefined">
        <div v-if="gi > 0" class="mi-cmd__sep" role="separator" />
        <div v-if="g.name" class="mi-cmd__heading" aria-hidden="true">{{ g.name }}</div>
        <div
          v-for="e in g.entries" :id="optId(e.index)" :key="e.item.value" class="mi-cmd__item" role="option"
          :class="{ 'is-active': e.index === active, 'is-disabled': e.item.disabled }" :aria-selected="e.index === active" :aria-disabled="e.item.disabled || undefined"
          @mousemove="active = e.index" @click="run(e.index)"
        >
          <slot name="item" :item="e.item"><span class="mi-cmd__label">{{ e.item.label }}</span></slot>
          <kbd v-if="e.item.shortcut" class="mi-cmd__kbd">{{ e.item.shortcut }}</kbd>
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
.mi-cmd { display: flex; flex-direction: column; min-width: 0; border-radius: 12px; background: var(--mi-elev); color: var(--mi-label); font-family: var(--mi-font); overflow: hidden; }
.mi-cmd__input { box-sizing: border-box; width: 100%; height: 48px; padding: 0 16px; border: 0; border-bottom: 1px solid var(--mi-field-b); background: transparent; color: inherit; font: inherit; font-size: 16px; outline: none; }
.mi-cmd__input:focus-visible { box-shadow: inset 0 -2px 0 var(--mi-p); }
.mi-cmd__list { max-height: 320px; overflow-y: auto; padding: 6px; overscroll-behavior: contain; }
.mi-cmd__heading { padding: 8px 10px 4px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.mi-cmd__item { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 38px; padding: 6px 10px; border-radius: 8px; font-size: 15px; cursor: pointer; user-select: none; }
.mi-cmd__item.is-active { background: var(--mi-p); color: var(--mi-p-on); }
.mi-cmd__item.is-disabled { color: var(--mi-label3); cursor: not-allowed; }
.mi-cmd__item.is-disabled.is-active { background: transparent; }
.mi-cmd__sep { height: 1px; margin: 4px -6px; background: var(--mi-field-b); }
.mi-cmd__kbd { font: inherit; font-size: 12px; opacity: .7; }
.mi-cmd__empty { padding: 24px 10px; text-align: center; font-size: 14px; color: var(--mi-label2); }
</style>
