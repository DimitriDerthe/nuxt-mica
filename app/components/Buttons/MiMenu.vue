<script setup lang="ts">
/** Dropdown trigger with a floating panel: popup picks a value (listbox), pulldown runs actions; keyboard and typeahead support. */
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import type { MiMenuItem, MiMenuPlacement, MiMenuVariant } from '../../utils/miMenu'
import { isNavigationShortcut, matchShortcut, mayFireGlobally, parseShortcut } from '../../utils/miShortcut'

const props = withDefaults(defineProps<{
  /** Entries of the menu as MiMenuItem objects. */
  items: MiMenuItem[]
  /** popup: shows the selected value (listbox); pulldown: shows an action menu. */
  variant?: MiMenuVariant
  /** Trigger text (placeholder for popup when nothing is selected). */
  label?: string
  /** Accessible name of the trigger and the menu. */
  ariaLabel?: string
  /** Side and alignment of the panel relative to the trigger. */
  placement?: MiMenuPlacement
  /** Gap in px between the trigger and the panel. */
  offset?: number
  /** Blocks opening and dims the trigger. */
  disabled?: boolean
  /** Also run item shortcuts while the menu is closed. By default they run only while it is open. */
  globalShortcuts?: boolean
}>(), { variant: 'pulldown', placement: 'bottom-start', offset: 6, label: '', ariaLabel: undefined })

/** Value of the chosen item in `popup` mode. */

const model = defineModel<string | number | undefined>()
/** Whether the menu panel is open. */
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ select: [item: MiMenuItem] }>()

const uid = useId()
const menuId = `mi-menu-${uid}`
const root = ref<HTMLElement | null>(null)
const pos = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const origin = ref('50% 0')
const itemEls: (HTMLElement | null)[] = []
let raf = 0
let typed = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined
let listening = false

interface Row { kind: 'item' | 'sep' | 'heading', item: MiMenuItem, idx: number, key: string }

const rows = computed<Row[]>(() => {
  let i = 0
  return props.items.map((item, n) => {
    if (item.separator) return { kind: 'sep', item, idx: -1, key: `s${n}` }
    if (item.heading !== undefined && item.label === undefined) return { kind: 'heading', item, idx: -1, key: `h${n}` }
    return { kind: 'item', item, idx: i++, key: `i${item.value ?? n}` }
  })
})
const actionable = computed(() => rows.value.filter(r => r.kind === 'item'))

const isListbox = computed(() => props.variant === 'popup')
const hasSelectable = computed(() => isListbox.value || model.value !== undefined || props.items.some(i => i.checked !== undefined))

function isSelected(item: MiMenuItem) {
  if (item.checked !== undefined) return item.checked
  return model.value !== undefined && item.value === model.value
}
function roleOf(item: MiMenuItem) {
  if (isListbox.value) return 'option'
  if (item.checked !== undefined) return 'menuitemcheckbox'
  if (model.value !== undefined) return 'menuitemradio'
  return 'menuitem'
}

const triggerText = computed(() => {
  if (isListbox.value) {
    const sel = props.items.find(i => i.value !== undefined && i.value === model.value)
    if (sel?.label) return sel.label
  }
  return props.label
})

function triggerEl(): HTMLElement | null {
  return root.value?.querySelector<HTMLElement>('[data-mi-menu-trigger]') ?? null
}

function enabledIdx(): number[] {
  return actionable.value.filter(r => !r.item.disabled).map(r => r.idx)
}
function focusItem(idx: number) {
  const el = itemEls[idx]
  if (el) el.focus({ preventScroll: false })
}
function focusStart(where: 'first' | 'last' | 'selected' | 'panel') {
  const list = enabledIdx()
  if (where === 'panel' || !list.length) { panel.value?.focus({ preventScroll: true }); return }
  if (where === 'selected') {
    const sel = actionable.value.find(r => !r.item.disabled && isSelected(r.item))
    focusItem(sel ? sel.idx : list[0]!)
    return
  }
  focusItem(where === 'first' ? list[0]! : list[list.length - 1]!)
}

function move(delta: 1 | -1) {
  const list = enabledIdx()
  if (!list.length) return
  const cur = itemEls.findIndex(el => el && el === document.activeElement)
  const at = list.indexOf(cur)
  const next = at < 0 ? (delta === 1 ? 0 : list.length - 1) : (at + delta + list.length) % list.length
  focusItem(list[next]!)
}

function typeahead(ch: string) {
  typed += ch.toLowerCase()
  clearTimeout(typedTimer)
  typedTimer = setTimeout(() => { typed = '' }, 600)
  const list = actionable.value.filter(r => !r.item.disabled)
  const cur = itemEls.findIndex(el => el && el === document.activeElement)
  const ordered = [...list.filter(r => r.idx > cur), ...list.filter(r => r.idx <= cur)]
  const hit = ordered.find(r => (r.item.label ?? '').toLowerCase().startsWith(typed))
  if (hit) focusItem(hit.idx)
}

let pendingFocus: 'first' | 'last' | 'selected' | 'panel' = 'first'

function openMenu(where: typeof pendingFocus) {
  itemEls.length = 0
  if (props.disabled || open.value) return
  pendingFocus = where
  open.value = true
}
function close(returnFocus = true) {
  if (!open.value) return
  open.value = false
  if (returnFocus) triggerEl()?.focus({ preventScroll: true })
}

function onTriggerClick(e: MouseEvent) {
  if (props.disabled) return
  if (open.value) { close(false); return }
  const kb = e.detail === 0
  openMenu(kb ? (isListbox.value ? 'selected' : 'first') : 'panel')
}
function onTriggerKeydown(e: KeyboardEvent) {
  if (props.disabled) return
  if (e.key === 'ArrowDown') { e.preventDefault(); openMenu(isListbox.value ? 'selected' : 'first') }
  else if (e.key === 'ArrowUp') { e.preventDefault(); openMenu('last') }
}

function onPanelKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': e.preventDefault(); move(1); break
    case 'ArrowUp': e.preventDefault(); move(-1); break
    case 'Home': e.preventDefault(); focusStart('first'); break
    case 'End': e.preventDefault(); focusStart('last'); break
    case 'Escape': e.preventDefault(); e.stopPropagation(); close(true); break
    case 'Tab': close(true); break
    default:
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') typeahead(e.key)
  }
}

/** Items whose `shortcut` can be pressed: actionable, enabled, and not a bare navigation key (Enter, arrows, Esc...). */
const shortcutItems = computed(() => actionable.value.flatMap((r) => {
  const s = r.item.disabled || r.item.value === undefined ? null : parseShortcut(r.item.shortcut)
  return s && !isNavigationShortcut(s) ? [{ item: r.item, s }] : []
}))

function onShortcut(e: KeyboardEvent) {
  if (props.disabled || !shortcutItems.value.length || (!open.value && !props.globalShortcuts)) return
  const hit = shortcutItems.value.find(({ s }) => matchShortcut(e, s))
  if (!hit || (!open.value && !mayFireGlobally(e, hit.s))) return
  e.preventDefault()
  e.stopPropagation()
  choose(hit.item)
}
onMounted(() => document.addEventListener('keydown', onShortcut, true))

function choose(item: MiMenuItem) {
  if (item.disabled) return
  if (item.value !== undefined && (isListbox.value || model.value !== undefined) && item.checked === undefined) model.value = item.value
  emit('select', item)
  close(true)
}

/** One-shot measurement per open/scroll/resize; positions with a single transform write. */
function place() {
  const t = triggerEl()
  const p = pos.value
  if (!t || !p) return
  const M = 8
  const r = t.getBoundingClientRect()
  if (isListbox.value) p.style.minWidth = `${Math.round(r.width)}px`
  const pw = p.offsetWidth
  const ph = p.offsetHeight
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  let side: 'top' | 'bottom' = props.placement.startsWith('top') ? 'top' : 'bottom'
  const below = vh - r.bottom - props.offset - M
  const above = r.top - props.offset - M
  if (side === 'bottom' && ph > below && above > below) side = 'top'
  else if (side === 'top' && ph > above && below > above) side = 'bottom'
  let y = side === 'bottom' ? r.bottom + props.offset : r.top - props.offset - ph
  y = Math.max(M, Math.min(y, vh - ph - M))
  const alignEnd = props.placement.endsWith('end')
  let x = alignEnd ? r.right - pw : r.left
  if (x + pw > vw - M) x = r.right - pw
  if (x < M) x = r.left
  x = Math.max(M, Math.min(x, vw - pw - M))
  p.style.transform = `translate3d(${Math.round(x)}px,${Math.round(y)}px,0)`
  const ox = Math.max(0, Math.min(pw, r.left + r.width / 2 - x))
  origin.value = `${Math.round(ox)}px ${side === 'bottom' ? '0' : '100%'}`
}

function schedulePlace() {
  if (raf) return
  raf = requestAnimationFrame(() => { raf = 0; place() })
}
function onOutside(e: PointerEvent) {
  const n = e.target as Node
  if (pos.value?.contains(n) || root.value?.contains(n)) return
  close(false)
}
function listen(on: boolean) {
  if (on === listening) return
  listening = on
  const f = on ? 'addEventListener' : 'removeEventListener'
  document[f]('pointerdown', onOutside as EventListener, true)
  window[f]('resize', schedulePlace, { passive: true } as AddEventListenerOptions)
  window[f]('scroll', schedulePlace, { passive: true, capture: true } as AddEventListenerOptions)
}

watch(open, (v) => {
  if (v) {
    place()
    listen(true)
    focusStart(pendingFocus)
    pendingFocus = 'first'
  } else {
    listen(false)
  }
}, { flush: 'post' })

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onShortcut, true)
  listen(false)
  if (raf) cancelAnimationFrame(raf)
  clearTimeout(typedTimer)
})

const triggerProps = computed(() => ({
  'data-mi-menu-trigger': '',
  'aria-haspopup': isListbox.value ? ('listbox' as const) : ('menu' as const),
  'aria-expanded': open.value,
  'aria-controls': open.value ? menuId : undefined,
  'aria-label': props.ariaLabel,
  onClick: onTriggerClick,
  onKeydown: onTriggerKeydown
}))

const _slots = defineSlots<{
  /** Custom trigger element; spread the given props on it so it opens the menu. */
  trigger?(props: { props: Record<string, unknown>, open: boolean }): unknown
  /** Icon shown before the text of each item. */
  icon?(props: { item: MiMenuItem }): unknown
  /** Custom content of each item; defaults to its label. */
  item?(props: { item: MiMenuItem }): unknown
}>()
</script>

<template>
  <span ref="root" class="mi-menu">
    <slot name="trigger" :props="triggerProps" :open="open">
      <button
        v-bind="triggerProps"
        type="button"
        class="mi-menu__trigger"
        :class="[`mi-menu__trigger--${variant}`, { 'is-open': open }]"
        :disabled="disabled ? true : undefined"
      >
        <span class="mi-menu__trigger-label">{{ triggerText }}</span>
        <span v-if="variant === 'popup'" class="mi-menu__badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 9l5-5 5 5M7 15l5 5 5-5" /></svg>
        </span>
        <svg v-else class="mi-menu__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>
    </slot>

    <Teleport to="body">
      <Transition name="mi-menu" :duration="{ enter: 320, leave: 120 }">
        <div v-if="open" ref="pos" class="mi mi-menu__pos" :style="{ '--mi-menu-origin': origin }">
          <div
            :id="menuId"
            ref="panel"
            class="mi-menu__panel"
            :role="isListbox ? 'listbox' : 'menu'"
            :aria-label="ariaLabel || label || undefined"
            tabindex="-1"
            @keydown="onPanelKeydown"
          >
            <template v-for="row in rows" :key="row.key">
              <div v-if="row.kind === 'sep'" class="mi-menu__sep" role="separator" />
              <div v-else-if="row.kind === 'heading'" class="mi-menu__heading" role="presentation">{{ row.item.heading }}</div>
              <button
                v-else
                :ref="(el) => { itemEls[row.idx] = el as HTMLElement | null }"
                type="button"
                class="mi-menu__item"
                :class="{ 'is-destructive': row.item.destructive, 'is-selected': isSelected(row.item) }"
                :role="roleOf(row.item)"
                tabindex="-1"
                :aria-disabled="row.item.disabled ? 'true' : undefined"
                :aria-selected="isListbox ? isSelected(row.item) : undefined"
                :aria-checked="!isListbox && (row.item.checked !== undefined || model !== undefined) ? isSelected(row.item) : undefined"
                @pointerenter="!row.item.disabled && focusItem(row.idx)"
                @click="choose(row.item)"
              >
                <span v-if="$slots.icon" class="mi-menu__icon"><slot name="icon" :item="row.item" /></span>
                <span class="mi-menu__text"><slot name="item" :item="row.item">{{ row.item.label }}</slot></span>
                <span v-if="row.item.shortcut" class="mi-menu__shortcut">{{ row.item.shortcut }}</span>
                <svg v-if="hasSelectable" class="mi-menu__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.mi-menu { display: contents; }

/* default triggers */
.mi-menu__trigger {
  position: relative;
  display: inline-flex;
  align-items: center;
  box-sizing: border-box;
  height: 32px;
  border: 0;
  border-radius: 8px;
  color: var(--mi-label);
  font-family: var(--mi-font);
  font-size: 14px;
  letter-spacing: -0.01em;
  white-space: nowrap;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;
  transition: transform var(--mi-dur-1) var(--mi-ease);
}
.mi-menu__trigger--popup {
  gap: 10px;
  padding: 0 8px 0 12px;
  border: 1px solid var(--mi-sep2);
  background: var(--mi-card);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
}
.mi-menu__trigger--pulldown {
  gap: 6px;
  padding: 0 10px 0 12px;
  background: var(--mi-fill3);
  font-weight: 500;
}
.mi-menu__trigger::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--mi-label);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
@media (hover: hover) {
  .mi-menu__trigger:hover:not(:disabled)::after { opacity: 0.06; }
}
.mi-menu__trigger:active:not(:disabled) { transform: scale(0.97); }
.mi-menu__trigger:focus-visible { outline: 3px solid color-mix(in srgb, var(--mi-p) 55%, transparent); outline-offset: 2px; }
.mi-menu__trigger:disabled { cursor: default; color: var(--mi-label3); background: var(--mi-fill4); box-shadow: none; }
.mi-menu__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--mi-p);
  color: var(--mi-p-on);
}
.mi-menu__badge svg { width: 12px; height: 12px; }
.mi-menu__chev { width: 14px; height: 14px; flex: none; transition: transform var(--mi-dur-3) var(--mi-spring); }
.is-open .mi-menu__chev { transform: rotate(180deg); }

/* panel */
.mi-menu__pos {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  min-width: 180px;
  max-width: calc(100vw - 16px);
  contain: layout;
}
.mi-menu__panel {
  box-sizing: border-box;
  max-height: calc(100vh - 16px);
  max-height: calc(100dvh - 16px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 6px;
  border-radius: 14px;
  background: var(--mi-mat);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  backdrop-filter: saturate(180%) blur(24px);
  box-shadow: var(--mi-sh3), inset 0 0 0 0.5px var(--mi-mat-b);
  font-family: var(--mi-font);
  color: var(--mi-label);
  outline: none;
  transform-origin: var(--mi-menu-origin, 50% 0);
  transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-3) var(--mi-spring);
}
.mi-menu-enter-from .mi-menu__panel,
.mi-menu-leave-to .mi-menu__panel { opacity: 0; transform: scale(0.94); }
.mi-menu-enter-active .mi-menu__panel,
.mi-menu-leave-active .mi-menu__panel { will-change: transform, opacity; }
.mi-menu-leave-active .mi-menu__panel { transition-duration: var(--mi-dur-1); transition-timing-function: var(--mi-ease); }

.mi-menu__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--mi-label);
  font: inherit;
  font-size: 14px;
  letter-spacing: -0.01em;
  text-align: left;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}
.mi-menu__item:focus { background: var(--mi-fill3); }
.mi-menu__item:active { background: var(--mi-fill2); }
.mi-menu__item.is-destructive { color: var(--mi-red-t); }
.mi-menu__item[aria-disabled='true'] { color: var(--mi-label3); cursor: default; }
.mi-menu__item[aria-disabled='true']:focus { background: transparent; }
.mi-menu__text { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mi-menu__shortcut { color: var(--mi-label2); font-size: 13px; }
.mi-menu__icon { display: inline-flex; width: 18px; height: 18px; color: var(--mi-label2); }
.mi-menu__icon :deep(svg) { width: 18px; height: 18px; }
.mi-menu__check { width: 14px; height: 14px; flex: none; color: var(--mi-p-text); opacity: 0; }
.is-selected .mi-menu__check { opacity: 1; }
.mi-menu__sep { height: 1px; margin: 5px 8px; background: var(--mi-sep); }
.mi-menu__heading { padding: 8px 10px 4px; color: var(--mi-label2); font-size: 12px; font-weight: 600; letter-spacing: 0.01em; }
</style>
