import { onBeforeUnmount, onMounted, ref } from 'vue'

/** A parsed keyboard shortcut. `mod` is the platform command key: Cmd on macOS, Ctrl elsewhere. */
export interface MiShortcut {
  mod: boolean
  ctrl: boolean
  alt: boolean
  shift: boolean
  /** Lower-cased `KeyboardEvent.key` value: `d`, `enter`, `backspace`, `arrowup`, `f5`... */
  key: string
}

const MODS: Record<string, 'mod' | 'ctrl' | 'alt' | 'shift'> = {
  '⌘': 'mod', cmd: 'mod', command: 'mod', meta: 'mod', mod: 'mod',
  '⌃': 'ctrl', ctrl: 'ctrl', control: 'ctrl',
  '⌥': 'alt', alt: 'alt', option: 'alt', opt: 'alt',
  '⇧': 'shift', shift: 'shift'
}

const KEYS: Record<string, string> = {
  '⏎': 'enter', '↩': 'enter', '⌤': 'enter', enter: 'enter', return: 'enter',
  '⌫': 'backspace', backspace: 'backspace',
  '⌦': 'delete', del: 'delete', delete: 'delete',
  '⎋': 'escape', esc: 'escape', escape: 'escape',
  '⇥': 'tab', tab: 'tab',
  '␣': ' ', space: ' ', spacebar: ' ',
  '↑': 'arrowup', up: 'arrowup', '↓': 'arrowdown', down: 'arrowdown',
  '←': 'arrowleft', left: 'arrowleft', '→': 'arrowright', right: 'arrowright',
  pageup: 'pageup', pagedown: 'pagedown', home: 'home', end: 'end'
}

/** Keys that already drive menus and focus: never taken as a bare (modifier-free) shortcut by a menu. */
const NAVIGATION = new Set(['enter', ' ', 'tab', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'home', 'end', 'pageup', 'pagedown'])

/**
 * Parses hints such as `⌘D`, `⇧⌘M`, `⌘⌫`, `Cmd N`, `Shift Cmd Z`, `Ctrl+K`, `Esc` or `E`.
 * Returns null when the text is empty or holds no key (modifiers only).
 */
export function parseShortcut(text: string | undefined | null): MiShortcut | null {
  if (!text) return null
  const out: MiShortcut = { mod: false, ctrl: false, alt: false, shift: false, key: '' }
  for (const chunk of text.trim().split(/[\s+]+/)) {
    if (!chunk) continue
    const word = chunk.toLowerCase()
    if (MODS[word]) { out[MODS[word]!] = true; continue }
    let rest = ''
    for (const ch of chunk) {
      const m = MODS[ch]
      if (m) out[m] = true
      else rest += ch
    }
    if (!rest) continue
    if (out.key) return null
    out.key = KEYS[rest.toLowerCase()] ?? KEYS[rest] ?? rest.toLowerCase()
  }
  return out.key ? out : null
}

export function isMac(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return /mac|iphone|ipad|ipod/i.test(nav.userAgentData?.platform ?? navigator.platform ?? '')
}

/** True when the shortcut has no modifier and its key is one the menus already use for navigation. */
export function isNavigationShortcut(s: MiShortcut): boolean {
  return !s.mod && !s.ctrl && !s.alt && !s.shift && NAVIGATION.has(s.key)
}

/** Whether a keydown matches the shortcut exactly (every modifier must agree). */
export function matchShortcut(e: KeyboardEvent, s: MiShortcut, mac = isMac()): boolean {
  if (e.repeat) return false
  const wantMeta = mac && s.mod
  const wantCtrl = s.ctrl || (!mac && s.mod)
  if (e.metaKey !== wantMeta || e.ctrlKey !== wantCtrl || e.altKey !== s.alt || e.shiftKey !== s.shift) return false
  const key = e.key.toLowerCase()
  if (key === s.key) return true
  // Option on macOS turns letters into symbols (⌥D gives ∂): fall back to the physical key.
  return /^[a-z]$/.test(s.key) ? e.code === `Key${s.key.toUpperCase()}` : /^[0-9]$/.test(s.key) && e.code === `Digit${s.key}`
}

/** Typing targets keep their keys: bare and Shift-only shortcuts must not fire from them. */
export function isEditableTarget(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el || !el.tagName) return false
  return el.isContentEditable || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'
    || (el.tagName === 'INPUT' && !/^(button|checkbox|radio|submit|reset|range|color|file|image)$/.test((el as HTMLInputElement).type))
}

/** Whether a document-level shortcut may fire for this event (command combos always may; plain typing keys may not while typing). */
export function mayFireGlobally(e: KeyboardEvent, s: MiShortcut): boolean {
  return s.mod || s.ctrl || s.alt || !isEditableTarget(e.target)
}

/**
 * Document-level listener for one shortcut, tied to the calling component. `pressed` is true for a moment after each hit,
 * for a keycap press animation. Command combos call preventDefault so the browser keeps out of it.
 */
export function useMiShortcutPress(shortcut: () => string | undefined, onPress: (e: KeyboardEvent) => void) {
  const pressed = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  function onKey(e: KeyboardEvent) {
    const s = parseShortcut(shortcut())
    if (!s || e.defaultPrevented || !matchShortcut(e, s) || !mayFireGlobally(e, s)) return
    if (s.mod || s.ctrl || s.alt) e.preventDefault()
    pressed.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { pressed.value = false }, 160)
    onPress(e)
  }
  onMounted(() => document.addEventListener('keydown', onKey))
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey)
    clearTimeout(timer)
  })
  return { pressed }
}
