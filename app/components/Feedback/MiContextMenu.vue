<script lang="ts">
import type { MiFbIconName } from './MiFbIcon.vue'

export interface MiContextMenuItem {
  id: string
  label?: string
  icon?: MiFbIconName
  /** Right aligned hint such as `⌘D`; pressing it selects the item while the menu is open. Bare Enter, Space, Tab, Esc and arrows are ignored. */
  shortcut?: string
  type?: 'item' | 'checkbox' | 'separator'
  checked?: boolean
  destructive?: boolean
  disabled?: boolean
  /** Nested items open a submenu. */
  children?: MiContextMenuItem[]
}
</script>

<script setup lang="ts">
/** Action menu opened from right-click, long-press or keyboard on its default slot; `inline` renders it in place. */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MiFbIcon from './MiFbIcon.vue'
import { MI_OVERLAY_Z, miOverlayPosition, useMiOverlay, useMiPresence } from '../../utils/miOverlay'
import { isNavigationShortcut, matchShortcut, parseShortcut } from '../../utils/miShortcut'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** Menu entries; `disabled` entries are skipped by keyboard navigation. */
  items: MiContextMenuItem[]
  /** Accessible name of the menu. */
  label?: string
  /** Menu width in px. */
  width?: number
  /** Render the menu in place (no teleport, no trigger handling). */
  inline?: boolean
  /** Item id shown highlighted in `inline` mode. */
  highlighted?: string
  /** Disable the contextmenu / long-press / keyboard trigger on the default slot. */
  disabled?: boolean
}>(), {
  label: 'Menu',
  width: 260
})

const emit = defineEmits<{
  select: [id: string, item: MiContextMenuItem]
  close: []
}>()

/** Whether the menu is open. */

const open = defineModel<boolean>({ default: false })

interface Level { items: MiContextMenuItem[], parent?: MiContextMenuItem }
interface Pos { x: number, y: number, ready: boolean }

const anchorPoint = ref({ x: 0, y: 0 })
const path = ref<string[]>([])
const pos = ref<Pos[]>([{ x: 0, y: 0, ready: false }])
const panels: Array<HTMLElement | null> = []
const rootPanel = ref<HTMLElement | null>(null)
const { rendered } = useMiPresence(open)
let viaKeyboard = false
let leaveTimer: ReturnType<typeof setTimeout> | undefined
let hoverTimer: ReturnType<typeof setTimeout> | undefined
let pressTimer: ReturnType<typeof setTimeout> | undefined

const levels = computed<Level[]>(() => {
  const out: Level[] = [{ items: props.items }]
  let cur = props.items
  for (const id of path.value) {
    const it = cur.find(i => i.id === id)
    if (!it?.children) break
    out.push({ items: it.children, parent: it })
    cur = it.children
  }
  return out
})

const hasLead = (items: MiContextMenuItem[]) => items.some(i => i.icon || i.type === 'checkbox')
const isSep = (i: MiContextMenuItem) => i.type === 'separator'
const role = (i: MiContextMenuItem) => (i.type === 'checkbox' ? 'menuitemcheckbox' : 'menuitem')

function setPanel(level: number, el: unknown) {
  panels[level] = (el as HTMLElement | null) ?? null
  if (level === 0) rootPanel.value = panels[0] ?? null
}

async function placeLevel(level: number, anchor: { left: number, top: number, width: number, height: number }, offset: number) {
  await nextTick()
  const el = panels[level]
  if (!el) return
  const p = miOverlayPosition(anchor, { width: el.offsetWidth, height: el.offsetHeight }, 'right-start', {
    offset,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    padding: 8
  })
  // When the menu fits on neither side of the anchor (narrow phones), keep it fully on screen.
  const pad = 8
  const x = Math.max(pad, Math.min(p.x, window.innerWidth - el.offsetWidth - pad))
  const y = Math.max(pad, Math.min(p.y, window.innerHeight - el.offsetHeight - pad))
  pos.value[level] = { x, y, ready: true }
  if (level === 0 && viaKeyboard) focusFirst(0)
}

function itemEls(level: number): HTMLElement[] {
  const el = panels[level]
  return el ? Array.from(el.querySelectorAll<HTMLElement>('[role^=menuitem]:not(:disabled)')) : []
}
function focusFirst(level: number) {
  itemEls(level)[0]?.focus({ preventScroll: true })
}

/** Open the menu with its top-left corner at viewport coordinates. */
function openAt(x: number, y: number, byKeyboard = false) {
  if (props.inline) return
  viaKeyboard = byKeyboard
  anchorPoint.value = { x, y }
  path.value = []
  pos.value = [{ x: 0, y: 0, ready: false }]
  open.value = true
}
function close() {
  if (!open.value) return
  open.value = false
}

watch(open, (v) => {
  clearTimeout(leaveTimer)
  clearTimeout(hoverTimer)
  if (v) {
    addGlobal()
    placeLevel(0, { left: anchorPoint.value.x, top: anchorPoint.value.y, width: 0, height: 0 }, 0)
  } else {
    removeGlobal()
    emit('close')
    leaveTimer = setTimeout(() => { if (!open.value) { rendered.value = false; path.value = [] } }, 220)
  }
})

onMounted(() => {
  if (open.value && !props.inline) {
    addGlobal()
    placeLevel(0, { left: anchorPoint.value.x, top: anchorPoint.value.y, width: 0, height: 0 }, 0)
  }
})

function onViewportChange() { close() }
function onScrollAnywhere(e: Event) {
  const t = e.target as Node | null
  if (t && panels.some(p => p && p.contains(t))) return
  close()
}
function addGlobal() {
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onScrollAnywhere, { capture: true, passive: true })
  window.addEventListener('blur', onViewportChange)
  document.addEventListener('keydown', onShortcut, true)
}
function removeGlobal() {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onScrollAnywhere, { capture: true } as EventListenerOptions)
  window.removeEventListener('blur', onViewportChange)
  document.removeEventListener('keydown', onShortcut, true)
}
onBeforeUnmount(() => {
  removeGlobal()
  clearTimeout(leaveTimer)
  clearTimeout(hoverTimer)
  clearTimeout(pressTimer)
})

useMiOverlay({
  open: computed(() => open.value && !props.inline),
  panel: rootPanel,
  trap: false,
  lock: false,
  onEscape: () => {
    if (path.value.length) closeSub(path.value.length - 1, true)
    else close()
  },
  initialFocus: () => (viaKeyboard ? itemEls(0)[0] ?? rootPanel.value : rootPanel.value)
})

/* ------------------------------------------------------------ submenus */

function openSub(level: number, item: MiContextMenuItem, el: HTMLElement, focus: boolean) {
  if (!item.children?.length || item.disabled) return
  path.value = [...path.value.slice(0, level), item.id]
  pos.value = [...pos.value.slice(0, level + 1), { x: 0, y: 0, ready: false }]
  const r = el.getBoundingClientRect()
  placeLevel(level + 1, { left: r.left, top: r.top - 5, width: r.width, height: r.height }, -4).then(() => {
    if (focus) focusFirst(level + 1)
  })
}
function closeSub(level: number, refocus: boolean) {
  const id = path.value[level]
  path.value = path.value.slice(0, level)
  pos.value = pos.value.slice(0, level + 1)
  if (refocus && id) {
    nextTick(() => panels[level]?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true }))
  }
}

function onItemEnter(level: number, item: MiContextMenuItem, e: PointerEvent) {
  if (props.inline || e.pointerType === 'touch') return
  const el = e.currentTarget as HTMLElement
  if (!item.disabled) el.focus({ preventScroll: true })
  clearTimeout(hoverTimer)
  if (item.children?.length) {
    if (path.value[level] !== item.id) hoverTimer = setTimeout(() => openSub(level, item, el, false), 120)
  } else if (path.value.length > level) {
    hoverTimer = setTimeout(() => closeSub(level, false), 120)
  }
}

function activate(level: number, item: MiContextMenuItem, e: MouseEvent) {
  if (item.disabled) return
  if (item.children?.length) {
    openSub(level, item, e.currentTarget as HTMLElement, true)
    return
  }
  run(item)
}
function run(item: MiContextMenuItem) {
  emit('select', item.id, item)
  if (!props.inline) close()
}

/** Pressing an item's shortcut runs it; the deepest open submenu is searched first. */
function onShortcut(e: KeyboardEvent) {
  if (!open.value || props.inline) return
  for (const level of [...levels.value].reverse()) {
    for (const it of level.items) {
      if (it.disabled || it.type === 'separator' || it.children?.length) continue
      const s = parseShortcut(it.shortcut)
      if (!s || isNavigationShortcut(s) || !matchShortcut(e, s)) continue
      e.preventDefault()
      e.stopPropagation()
      run(it)
      return
    }
  }
}

let typed = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined
function onPanelKey(level: number, e: KeyboardEvent) {
  const els = itemEls(level)
  const cur = els.indexOf(document.activeElement as HTMLElement)
  let next = -1
  switch (e.key) {
    case 'ArrowDown': next = cur < 0 ? 0 : (cur + 1) % els.length; break
    case 'ArrowUp': next = cur < 0 ? els.length - 1 : (cur - 1 + els.length) % els.length; break
    case 'Home': next = 0; break
    case 'End': next = els.length - 1; break
    case 'ArrowRight': {
      const el = els[cur]
      const item = el && levels.value[level]?.items.find(i => i.id === el.dataset.id)
      if (el && item?.children?.length) {
        e.preventDefault()
        openSub(level, item, el, true)
      }
      return
    }
    case 'ArrowLeft':
      if (level > 0) {
        e.preventDefault()
        closeSub(level - 1, true)
      }
      return
    case 'Tab':
      e.preventDefault()
      close()
      return
    default:
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey && e.key !== ' ') {
        typed += e.key.toLowerCase()
        clearTimeout(typedTimer)
        typedTimer = setTimeout(() => { typed = '' }, 600)
        const order = [...els.slice(cur + 1), ...els.slice(0, cur + 1)]
        const hit = order.find(el => (el.dataset.label ?? '').toLowerCase().startsWith(typed))
        hit?.focus({ preventScroll: true })
      }
      return
  }
  if (next >= 0 && els.length) {
    e.preventDefault()
    els[next]!.focus({ preventScroll: true })
  }
}

/* ------------------------------------------------------------ triggers */

function onContextMenu(e: MouseEvent) {
  if (props.disabled || props.inline) return
  e.preventDefault()
  openAt(e.clientX, e.clientY)
}
function onAreaKey(e: KeyboardEvent) {
  if (props.disabled || props.inline) return
  if (e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey)) {
    e.preventDefault()
    const r = (e.target as HTMLElement).getBoundingClientRect()
    openAt(r.left + Math.min(24, r.width / 2), r.bottom - Math.min(12, r.height / 2), true)
  }
}
let pressStart = { x: 0, y: 0 }
function onAreaDown(e: PointerEvent) {
  if (props.disabled || props.inline || e.pointerType !== 'touch') return
  pressStart = { x: e.clientX, y: e.clientY }
  clearTimeout(pressTimer)
  pressTimer = setTimeout(() => openAt(pressStart.x, pressStart.y), 520)
}
function onAreaMove(e: PointerEvent) {
  if (pressTimer && Math.hypot(e.clientX - pressStart.x, e.clientY - pressStart.y) > 8) clearTimeout(pressTimer)
}
function onAreaUp() { clearTimeout(pressTimer) }

function onBackdropContext(e: MouseEvent) {
  e.preventDefault()
  close()
}

defineExpose({ openAt, close })

defineSlots<{
  /** Area that opens the menu on right-click, long-press or keyboard (Shift+F10 / context key). */
  default?(): unknown
}>()
</script>

<template>
  <div v-if="$slots.default" class="mi-cm-area" @contextmenu="onContextMenu" @keydown="onAreaKey" @pointerdown="onAreaDown" @pointermove.passive="onAreaMove" @pointerup="onAreaUp" @pointercancel="onAreaUp">
    <slot />
  </div>
  <Teleport to="body" :disabled="inline">
    <div v-if="inline || rendered" class="mi mi-cm-root" :class="{ 'is-inline': inline }" :style="inline ? undefined : { zIndex: MI_OVERLAY_Z.popover }">
      <div v-if="!inline" class="mi-cm-backdrop" @pointerdown="close" @contextmenu="onBackdropContext" />
      <div
        v-for="(lv, li) in (inline ? levels.slice(0, 1) : levels)"
        :key="li + ':' + (lv.parent?.id ?? '')"
        class="mi-cm-pos"
        :class="{ 'is-static': inline }"
        :style="inline ? undefined : { transform: `translate3d(${pos[li]?.x ?? 0}px,${pos[li]?.y ?? 0}px,0)` }"
      >
        <div
          :ref="(el) => setPanel(li, el)"
          v-bind="li === 0 ? $attrs : undefined"
          class="mi-cm-panel"
          :class="{ 'is-in': inline || (open && pos[li]?.ready) }"
          role="menu"
          :aria-label="lv.parent?.label ?? label"
          aria-orientation="vertical"
          tabindex="-1"
          :style="{ width: width + 'px' }"
          @keydown="onPanelKey(li, $event)"
        >
          <template v-for="it in lv.items" :key="it.id">
            <span v-if="isSep(it)" role="separator" class="mi-cm-sep" />
            <button
              v-else
              type="button"
              class="mi-cm-item"
              :class="{ 'is-destructive': it.destructive, 'is-hl': inline && highlighted === it.id, 'is-open': path[li] === it.id }"
              :role="role(it)"
              :data-id="it.id"
              :data-label="it.label"
              :disabled="it.disabled"
              :aria-checked="it.type === 'checkbox' ? !!it.checked : undefined"
              :aria-haspopup="it.children?.length ? 'menu' : undefined"
              :aria-expanded="it.children?.length ? path[li] === it.id : undefined"
              tabindex="-1"
              @pointerenter="onItemEnter(li, it, $event)"
              @click="activate(li, it, $event)"
            >
              <span v-if="hasLead(lv.items)" class="mi-cm-lead">
                <MiFbIcon v-if="it.type === 'checkbox'" v-show="it.checked" name="check" :size="16" :stroke="2.6" />
                <MiFbIcon v-else-if="it.icon" :name="it.icon" :size="16" />
              </span>
              <span class="mi-cm-label">{{ it.label }}</span>
              <span v-if="it.shortcut" class="mi-cm-short">{{ it.shortcut }}</span>
              <MiFbIcon v-if="it.children?.length" class="mi-cm-chev" name="chevron-right" :size="12" :stroke="2.6" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.mi-cm-area{display:contents}
.mi-cm-root{position:fixed;inset:0;font-family:var(--mi-font)}
.mi-cm-root.is-inline{position:static;inset:auto}
.mi-cm-backdrop{position:absolute;inset:0}
.mi-cm-pos{position:fixed;left:0;top:0}
.mi-cm-pos.is-static{position:static}
.mi-cm-panel{max-width:calc(100vw - 16px);max-height:calc(100dvh - 16px);overflow-y:auto;overscroll-behavior:contain;padding:5px;border-radius:12px;background:var(--mi-menu,var(--mi-mat));-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);box-shadow:var(--mi-sh3);display:flex;flex-direction:column;outline:none;color:var(--mi-label);letter-spacing:-.01em;opacity:0;transform:scale(.96);transform-origin:0 0;pointer-events:none}
.mi-cm-panel.is-in{opacity:1;transform:none;pointer-events:auto;transition:transform var(--mi-dur-2) var(--mi-spring),opacity var(--mi-dur-1) var(--mi-ease)}
.mi-cm-panel:not(.is-in){transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-1) var(--mi-ease)}
.is-static>.mi-cm-panel{opacity:1;transform:none;pointer-events:auto}
.mi-cm-item{appearance:none;flex:none;min-height:30px;display:flex;align-items:center;gap:10px;padding:0 10px;margin:0;border:0;border-radius:6px;background:transparent;color:var(--mi-label);font-family:inherit;font-size:14px;line-height:20px;text-align:left;white-space:nowrap;cursor:default}
.mi-cm-item:focus-visible{outline:none}
.mi-cm-item:focus,.mi-cm-item.is-hl,.mi-cm-item.is-open{background:var(--mi-p);color:var(--mi-p-on)}
.mi-cm-item:disabled{opacity:.4}
.mi-cm-item.is-destructive{color:var(--mi-red-t)}
.mi-cm-item.is-destructive:focus,.mi-cm-item.is-destructive.is-hl{color:var(--mi-p-on)}
.mi-cm-lead{width:16px;height:16px;flex:none;display:flex;align-items:center;justify-content:center}
.mi-cm-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
.mi-cm-short{font-size:13px;color:var(--mi-label2)}
.mi-cm-item:focus .mi-cm-short,.mi-cm-item.is-hl .mi-cm-short,.mi-cm-item.is-open .mi-cm-short{color:inherit}
.mi-cm-item.is-destructive .mi-cm-short{color:inherit}
.mi-cm-chev{color:var(--mi-label2)}
.mi-cm-item:focus .mi-cm-chev,.mi-cm-item.is-open .mi-cm-chev{color:inherit}
.mi-cm-sep{display:block;flex:none;height:1px;margin:5px 10px;background:var(--mi-sep)}
</style>
