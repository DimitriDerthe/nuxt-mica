<script setup lang="ts">
/** Hierarchical tree view with expandable branches, single or multiple selection, optional checkboxes with mixed parents, and full WAI-ARIA keyboard support with type-ahead. */
import { computed, nextTick, ref } from 'vue'
import MiTreeNode from './MiTreeNode.vue'
import type { MiIconName } from '../../utils/miIcons'

export type MiTreeId = string | number
export interface MiTreeItem { id: MiTreeId, label: string, icon?: MiIconName, children?: MiTreeItem[], disabled?: boolean }
export type MiTreeCheck = 'checked' | 'mixed' | 'none'
/** Shared state and handlers MiTree hands to every MiTreeNode. */
export interface MiTreeContext {
  selected: Set<MiTreeId>
  expanded: Set<MiTreeId>
  checks: Map<MiTreeId, MiTreeCheck>
  checkable: boolean
  focusId: MiTreeId | null
  focus: (id: MiTreeId) => void
  toggle: (id: MiTreeId) => void
  activate: (item: MiTreeItem) => void
}
interface Flat { item: MiTreeItem, parent: MiTreeItem | null }

const props = withDefaults(defineProps<{
  /** Root nodes. Each node has an `id`, a `label`, and optional `icon`, `children` and `disabled`. */
  items: MiTreeItem[]
  /** Allow several selected nodes; the `selected` model is then an array. */
  multiple?: boolean
  /** Show a checkbox per node. Parents show a mixed state; the `selected` model (always an array) holds the checked leaves. */
  checkable?: boolean
  /** Accessible name of the tree. */
  ariaLabel?: string
}>(), { ariaLabel: 'Tree' })

/** Selected node id, or an array of ids with `multiple` or `checkable`. */

const selected = defineModel<MiTreeId | MiTreeId[] | null | undefined>('selected')
/** Ids of the expanded branches. */

const expanded = defineModel<MiTreeId[]>('expanded', { default: () => [] })

const root = ref<HTMLElement | null>(null)
const focusId = ref<MiTreeId | null>(null)
const multi = computed(() => props.multiple || props.checkable)
const selSet = computed(() => new Set<MiTreeId>(Array.isArray(selected.value) ? selected.value : selected.value == null ? [] : [selected.value]))
const expSet = computed(() => new Set<MiTreeId>(expanded.value))
const hasKids = (i: MiTreeItem) => !!i.children?.length

const flat = computed<Flat[]>(() => {
  const out: Flat[] = []
  const walk = (list: MiTreeItem[], parent: MiTreeItem | null) => {
    for (const item of list) {
      out.push({ item, parent })
      if (hasKids(item) && expSet.value.has(item.id)) walk(item.children!, item)
    }
  }
  walk(props.items, null)
  return out
})
const enabled = computed(() => flat.value.filter(f => !f.item.disabled))

const checks = computed(() => {
  const map = new Map<MiTreeId, MiTreeCheck>()
  if (!props.checkable) return map
  const walk = (i: MiTreeItem): MiTreeCheck => {
    if (!hasKids(i)) {
      const s: MiTreeCheck = selSet.value.has(i.id) ? 'checked' : 'none'
      map.set(i.id, s)
      return s
    }
    const states = i.children!.map(c => ({ c, s: walk(c) }))
    const counted = states.filter(x => !x.c.disabled)
    const use = (counted.length ? counted : states).map(x => x.s)
    const s: MiTreeCheck = use.every(x => x === 'checked') ? 'checked' : use.every(x => x === 'none') ? 'none' : 'mixed'
    map.set(i.id, s)
    return s
  }
  props.items.forEach(walk)
  return map
})

const tabId = computed<MiTreeId | null>(() => {
  const list = enabled.value
  if (focusId.value != null && list.some(f => f.item.id === focusId.value)) return focusId.value
  return list.find(f => selSet.value.has(f.item.id))?.item.id ?? list[0]?.item.id ?? null
})

function setExpanded(id: MiTreeId, on: boolean) {
  const has = expSet.value.has(id)
  if (on === has) return
  expanded.value = on ? [...expanded.value, id] : expanded.value.filter(x => x !== id)
}
function leaves(i: MiTreeItem): MiTreeItem[] {
  if (i.disabled) return []
  return hasKids(i) ? i.children!.flatMap(leaves) : [i]
}
function activate(item: MiTreeItem) {
  if (item.disabled) return
  if (props.checkable) {
    const ids = leaves(item).map(l => l.id)
    const on = checks.value.get(item.id) !== 'checked'
    const cur = [...selSet.value].filter(x => !ids.includes(x))
    selected.value = on ? [...cur, ...ids] : cur
  } else if (multi.value) {
    const cur = [...selSet.value]
    selected.value = selSet.value.has(item.id) ? cur.filter(x => x !== item.id) : [...cur, item.id]
  } else if (!selSet.value.has(item.id)) {
    selected.value = item.id
  }
}
async function focusItem(id: MiTreeId) {
  focusId.value = id
  await nextTick()
  const el = Array.from(root.value?.querySelectorAll<HTMLElement>('[role=treeitem]') ?? []).find(e => e.dataset.miId === String(id))
  el?.focus()
}

const ctx = computed<MiTreeContext>(() => ({
  selected: selSet.value,
  expanded: expSet.value,
  checks: checks.value,
  checkable: !!props.checkable,
  focusId: tabId.value,
  focus: id => { focusId.value = id; void focusItem(id) },
  toggle: id => setExpanded(id, !expSet.value.has(id)),
  activate
}))

let typed = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined
function typeAhead(ch: string, from: number) {
  clearTimeout(typedTimer)
  typed += ch.toLowerCase()
  typedTimer = setTimeout(() => { typed = '' }, 500)
  const list = enabled.value
  const cur = list.findIndex(f => f.item.id === flat.value[from]?.item.id)
  const order = [...list.slice(cur + (typed.length > 1 ? 0 : 1)), ...list.slice(0, cur + (typed.length > 1 ? 0 : 1))]
  const hit = order.find(f => f.item.label.toLowerCase().startsWith(typed))
  if (hit) void focusItem(hit.item.id)
}

function onKey(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const el = (e.target as HTMLElement).closest<HTMLElement>('[role=treeitem]')
  if (!el) return
  const at = flat.value.findIndex(f => String(f.item.id) === el.dataset.miId)
  if (at < 0) return
  const cur = flat.value[at]!
  const list = enabled.value
  const pos = list.findIndex(f => f.item === cur.item)
  const go = (f?: Flat) => { if (f) void focusItem(f.item.id) }
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); go(list[Math.min(pos + 1, list.length - 1)]); break
    case 'ArrowUp': e.preventDefault(); go(list[Math.max(pos - 1, 0)]); break
    case 'Home': e.preventDefault(); go(list[0]); break
    case 'End': e.preventDefault(); go(list[list.length - 1]); break
    case 'ArrowRight':
      e.preventDefault()
      if (!hasKids(cur.item) || cur.item.disabled) break
      if (!expSet.value.has(cur.item.id)) setExpanded(cur.item.id, true)
      else go(flat.value.slice(at + 1).find(f => f.parent === cur.item && !f.item.disabled))
      break
    case 'ArrowLeft':
      e.preventDefault()
      if (hasKids(cur.item) && expSet.value.has(cur.item.id)) setExpanded(cur.item.id, false)
      else if (cur.parent) go(flat.value.find(f => f.item === cur.parent))
      break
    case 'Enter': case ' ': e.preventDefault(); activate(cur.item); break
    case '*': {
      e.preventDefault()
      const sibs = (cur.parent ? cur.parent.children! : props.items).filter(hasKids)
      expanded.value = [...new Set([...expanded.value, ...sibs.map(s => s.id)])]
      break
    }
    default:
      if (e.key.length === 1) { e.preventDefault(); typeAhead(e.key, at) }
  }
}
function onFocusIn(e: FocusEvent) {
  const t = e.target as HTMLElement
  if (t.getAttribute('role') !== 'treeitem') return
  const f = flat.value.find(x => String(x.item.id) === t.dataset.miId)
  if (f && !f.item.disabled) focusId.value = f.item.id
}
</script>

<template>
  <ul ref="root" class="mi-tree" role="tree" :aria-label="ariaLabel" :aria-multiselectable="multi || undefined" @keydown="onKey" @focusin="onFocusIn">
    <MiTreeNode v-for="(it, i) in items" :key="it.id" :item="it" :level="1" :ctx="ctx" :set-size="items.length" :pos-in-set="i + 1" />
  </ul>
</template>

<style scoped>
.mi-tree{list-style:none;margin:0;padding:6px;display:flex;flex-direction:column;gap:1px;font-family:var(--mi-font);box-sizing:border-box}
</style>
