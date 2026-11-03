<script setup lang="ts">
/** Lightweight rich-text editor with a formatting toolbar and shortcuts; v-model is a sanitized HTML string limited to basic text formatting, lists, headings, quotes, code and links. */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import MiIconButton from '../Buttons/MiIconButton.vue'
import MiIcon from '../Base/MiIcon.vue'
import { miIsEmptyHtml, miSafeUrl, miSanitizeHtml, miTextToHtml, miEscapeHtml } from '../../utils/miSanitize'

const props = withDefaults(defineProps<{
  /** Accessible name of the editing area. */
  label?: string
  /** Hint shown while the editor is empty. */
  placeholder?: string
  /** Shows the content without allowing edits; the area stays focusable and selectable. */
  readonly?: boolean
  /** Blocks interaction and dims the editor. */
  disabled?: boolean
  /** Minimum height of the editing area, in px or any CSS length. */
  minHeight?: number | string
  /** Maximum height before the area scrolls, in px or any CSS length. */
  maxHeight?: number | string
  /** Shows the formatting toolbar. */
  toolbar?: boolean
  /** How pasted content is inserted: as sanitized HTML (keeps basic formatting) or as plain text. */
  pasteMode?: 'html' | 'text'
  /** Marks the editing area as invalid (`aria-invalid`) and tints its border. */
  invalid?: boolean
  /** Prompt label of the link address field. */
  linkLabel?: string
}>(), { label: 'Rich text editor', minHeight: 160, toolbar: true, pasteMode: 'html', linkLabel: 'Link address' })

const emit = defineEmits<{
  /** Fired when the editing area gains focus. */
  focus: [event: FocusEvent]
  /** Fired when the editing area loses focus. */
  blur: [event: FocusEvent]
}>()

/** The content as sanitized HTML. */
const model = defineModel<string>({ default: '' })

const uid = useId()
const surface = ref<HTMLElement | null>(null)
const toolbarEl = ref<HTMLElement | null>(null)
/* Content rendered through v-html. Only external changes touch it, so typing never resets the caret. */
const html = ref(miSanitizeHtml(model.value))
let lastEmitted = html.value
const empty = computed(() => miIsEmptyHtml(model.value))
const editable = computed(() => !props.readonly && !props.disabled)
const css = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v)

type Cmd = 'bold' | 'italic' | 'underline' | 'strike' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'code' | 'link'
const active = ref<Record<Cmd, boolean>>({ bold: false, italic: false, underline: false, strike: false, h2: false, h3: false, ul: false, ol: false, quote: false, code: false, link: false })

function exec(cmd: string, value?: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false
  try { return document.execCommand(cmd, false, value) } catch { return false }
}
function state(cmd: string): boolean {
  try { return typeof document.queryCommandState === 'function' && document.queryCommandState(cmd) } catch { return false }
}

function selectionInside(): boolean {
  const sel = typeof window !== 'undefined' ? window.getSelection() : null
  return !!(sel && sel.rangeCount && surface.value && surface.value.contains(sel.anchorNode))
}
function closest(tag: string): Element | null {
  const sel = window.getSelection()
  let n: Node | null = sel?.anchorNode ?? null
  while (n && n !== surface.value) {
    if (n.nodeType === 1 && (n as Element).tagName.toLowerCase() === tag) return n as Element
    n = n.parentNode
  }
  return null
}
function blockValue(): string {
  try { return String(document.queryCommandValue('formatBlock') || '').replace(/[<>]/g, '').toLowerCase() } catch { return '' }
}

/* Toolbar state follows the selection; one rAF-throttled listener, only while the editor holds the caret. */
let raf = 0
function refresh() {
  raf = 0
  if (!selectionInside()) return
  const block = blockValue()
  active.value = {
    bold: state('bold'), italic: state('italic'), underline: state('underline'), strike: state('strikeThrough'),
    ul: state('insertUnorderedList'), ol: state('insertOrderedList'),
    h2: block === 'h2', h3: block === 'h3', quote: block === 'blockquote',
    code: !!closest('code') || !!closest('pre'), link: !!closest('a')
  }
}
function onSelectionChange() { if (!raf) raf = requestAnimationFrame(refresh) }

function commit() {
  const el = surface.value
  if (!el) return
  const clean = miSanitizeHtml(el.innerHTML)
  if (clean !== lastEmitted) {
    lastEmitted = clean
    model.value = clean
  }
}

function toggleBlock(tag: 'h2' | 'h3' | 'blockquote') {
  exec('formatBlock', blockValue() === tag ? '<p>' : `<${tag}>`)
}

function run(cmd: Cmd) {
  if (!editable.value) return
  surface.value?.focus({ preventScroll: true })
  switch (cmd) {
    case 'bold': exec('bold'); break
    case 'italic': exec('italic'); break
    case 'underline': exec('underline'); break
    case 'strike': exec('strikeThrough'); break
    case 'h2': toggleBlock('h2'); break
    case 'h3': toggleBlock('h3'); break
    case 'quote': toggleBlock('blockquote'); break
    case 'ul': exec('insertUnorderedList'); break
    case 'ol': exec('insertOrderedList'); break
    case 'code': toggleCode(); break
    case 'link': openLink(); return
  }
  commit()
  refresh()
}

function toggleCode() {
  const sel = window.getSelection()
  const text = sel?.toString() ?? ''
  const inCode = closest('code')
  if (inCode) {
    const r = document.createRange()
    r.selectNodeContents(inCode)
    sel?.removeAllRanges()
    sel?.addRange(r)
    exec('insertText', inCode.textContent ?? '')
  } else if (text.includes('\n')) {
    toggleBlockPre()
  } else if (text) {
    exec('insertHTML', `<code>${miEscapeHtml(text)}</code>`)
  }
}
function toggleBlockPre() { exec('formatBlock', blockValue() === 'pre' ? '<p>' : '<pre>') }

function undo() { if (editable.value) { surface.value?.focus({ preventScroll: true }); exec('undo'); commit() } }
function redo() { if (editable.value) { surface.value?.focus({ preventScroll: true }); exec('redo'); commit() } }
function clearFormat() {
  if (!editable.value) return
  surface.value?.focus({ preventScroll: true })
  exec('removeFormat')
  exec('unlink')
  exec('formatBlock', '<p>')
  commit()
  refresh()
}

/* Link editing: the address field takes focus, so the selection is saved and restored. */
const linkOpen = ref(false)
const linkUrl = ref('')
const linkError = ref(false)
const linkInput = ref<HTMLInputElement | null>(null)
let savedRange: Range | null = null

function openLink() {
  const sel = window.getSelection()
  savedRange = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null
  linkUrl.value = (closest('a') as HTMLAnchorElement | null)?.getAttribute('href') ?? ''
  linkError.value = false
  linkOpen.value = true
  nextTick(() => linkInput.value?.focus())
}
function closeLink(refocus = true) {
  linkOpen.value = false
  if (refocus) {
    surface.value?.focus({ preventScroll: true })
    restoreRange()
  }
}
function restoreRange() {
  const sel = window.getSelection()
  if (savedRange && sel) { sel.removeAllRanges(); sel.addRange(savedRange) }
}
/** Adds https:// to bare domains; returns null when the result is not an allowed link. */
function normalizeUrl(raw: string): string | null {
  const v = raw.trim()
  if (!v) return null
  const withProto = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : (v.includes('@') && !v.includes('/') ? `mailto:${v}` : `https://${v}`)
  return miSafeUrl(withProto)
}
function applyLink() {
  if (!linkUrl.value.trim()) {
    restoreRange()
    exec('unlink')
    closeLink()
    commit()
    return
  }
  const url = normalizeUrl(linkUrl.value)
  if (!url) { linkError.value = true; return }
  surface.value?.focus({ preventScroll: true })
  restoreRange()
  const sel = window.getSelection()
  if (sel && sel.isCollapsed) exec('insertHTML', `<a href="${miEscapeHtml(url)}">${miEscapeHtml(url)}</a>`)
  else exec('createLink', url)
  linkOpen.value = false
  commit()
  refresh()
}

function onKeydown(e: KeyboardEvent) {
  if (!editable.value) return
  const mod = e.metaKey || e.ctrlKey
  if (!mod || e.altKey || e.shiftKey) return
  const map: Record<string, Cmd> = { b: 'bold', i: 'italic', u: 'underline', k: 'link' }
  const cmd = map[e.key.toLowerCase()]
  if (!cmd) return
  e.preventDefault()
  run(cmd)
}

function onInput() { commit(); onSelectionChange() }

function onPaste(e: ClipboardEvent) {
  if (!editable.value) return
  e.preventDefault()
  const data = e.clipboardData
  const rich = props.pasteMode === 'html' ? data?.getData('text/html') : ''
  const text = data?.getData('text/plain') ?? ''
  const out = rich ? miSanitizeHtml(rich) : miTextToHtml(text)
  if (out) exec('insertHTML', out)
  commit()
}
function onDrop(e: DragEvent) {
  /* Dropped content never enters the DOM unfiltered: insert its text only. */
  e.preventDefault()
  if (!editable.value) return
  const text = e.dataTransfer?.getData('text/plain') ?? ''
  if (text) { surface.value?.focus(); exec('insertHTML', miTextToHtml(text)); commit() }
}

function onFocus(e: FocusEvent) {
  if (editable.value) exec('defaultParagraphSeparator', 'p')
  emit('focus', e)
}
function onBlur(e: FocusEvent) {
  /* Normalise the DOM to the sanitized value once the caret is gone. */
  const el = surface.value
  if (el && editable.value && !linkOpen.value) {
    const clean = miSanitizeHtml(el.innerHTML)
    if (clean !== el.innerHTML) { el.innerHTML = clean; html.value = clean }
    commit()
  }
  emit('blur', e)
}

/* External model changes (not caused by typing) replace the content. */
watch(model, (v) => {
  const clean = miSanitizeHtml(v)
  if (clean === lastEmitted) return
  lastEmitted = clean
  html.value = clean
  if (surface.value && surface.value.innerHTML !== clean) surface.value.innerHTML = clean
  if (clean !== v) model.value = clean
})

/* Toolbar: roving tabindex, arrow keys move focus. */
const tbIndex = ref(0)
function toolbarButtons(): HTMLButtonElement[] {
  return Array.from(toolbarEl.value?.querySelectorAll<HTMLButtonElement>('button[data-tb]') ?? [])
}
function onToolbarKey(e: KeyboardEvent) {
  const btns = toolbarButtons()
  if (!btns.length) return
  const at = Math.max(0, btns.findIndex(b => b === document.activeElement))
  let next = at
  if (e.key === 'ArrowRight') next = (at + 1) % btns.length
  else if (e.key === 'ArrowLeft') next = (at - 1 + btns.length) % btns.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = btns.length - 1
  else return
  e.preventDefault()
  tbIndex.value = next
  btns[next]!.focus()
}

onMounted(() => {
  isMac.value = /mac|iphone|ipad/i.test(navigator.platform || '')
  document.addEventListener('selectionchange', onSelectionChange)
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('selectionchange', onSelectionChange)
  if (raf) cancelAnimationFrame(raf)
})

interface Btn { id: string, label: string, cmd?: Cmd, act?: () => void, svg?: string, text?: string, style?: string, group: number, shortcut?: string }
const stroke = (d: string) => `<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${d}</g>`
const buttons: Btn[] = [
  { id: 'bold', label: 'Bold', cmd: 'bold', text: 'B', style: 'font-weight:800', group: 0, shortcut: 'B' },
  { id: 'italic', label: 'Italic', cmd: 'italic', text: 'I', style: 'font-style:italic;font-family:Georgia,serif', group: 0, shortcut: 'I' },
  { id: 'underline', label: 'Underline', cmd: 'underline', text: 'U', style: 'text-decoration:underline', group: 0, shortcut: 'U' },
  { id: 'strike', label: 'Strikethrough', cmd: 'strike', text: 'S', style: 'text-decoration:line-through', group: 0 },
  { id: 'h2', label: 'Heading 2', cmd: 'h2', text: 'H2', style: 'font-size:12px;font-weight:700', group: 1 },
  { id: 'h3', label: 'Heading 3', cmd: 'h3', text: 'H3', style: 'font-size:12px;font-weight:700', group: 1 },
  { id: 'ul', label: 'Bulleted list', cmd: 'ul', svg: stroke('<path d="M9 6h11M9 12h11M9 18h11" stroke-width="2"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/>'), group: 2 },
  { id: 'ol', label: 'Numbered list', cmd: 'ol', svg: stroke('<path d="M10 6h10M10 12h10M10 18h10" stroke-width="2"/><path d="M4 5l1.5-1v4M3.8 13.5c.4-1 2.2-.8 2.2.3 0 .8-2.2 1.7-2.2 2.7H6" stroke-width="1.5"/>'), group: 2 },
  { id: 'quote', label: 'Quote', cmd: 'quote', svg: stroke('<path d="M10 7H6a1 1 0 00-1 1v4a1 1 0 001 1h3v1.5a2.5 2.5 0 01-2.5 2.5M19 7h-4a1 1 0 00-1 1v4a1 1 0 001 1h3v1.5a2.5 2.5 0 01-2.5 2.5" stroke-width="1.8"/>'), group: 3 },
  { id: 'code', label: 'Code', cmd: 'code', svg: stroke('<path d="M8.5 7L4 12l4.500 5M15.5 7L20 12l-4.500 5" stroke-width="2"/>'), group: 3 },
  { id: 'link', label: 'Link', cmd: 'link', svg: stroke('<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" stroke-width="2"/>'), group: 3, shortcut: 'K' },
  { id: 'undo', label: 'Undo', act: undo, svg: stroke('<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" stroke-width="2"/>'), group: 4 },
  { id: 'redo', label: 'Redo', act: redo, svg: stroke('<path d="M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3" stroke-width="2"/>'), group: 4 },
  { id: 'clear', label: 'Clear formatting', act: clearFormat, svg: stroke('<path d="M5 5h14M12 5l-3 14M9 19h6M4 20L20 4" stroke-width="2"/>'), group: 4 }
]
function press(b: Btn) { if (b.act) b.act(); else run(b.cmd!) }
/* Set after mount so the server and client markup match. */
const isMac = ref(false)
const titleOf = (b: Btn) => (b.shortcut ? `${b.label} (${isMac.value ? '⌘' : 'Ctrl+'}${b.shortcut})` : b.label)
</script>

<template>
  <div class="mi-ed mi:flex-col mi:min-w-0 mi:rounded-[14px] mi:shadow-[inset_0_0_0_1px_var(--mi-field-b)] mi:font-mi mi:[&.is-disabled]:opacity-45" :class="{ 'is-disabled': disabled, 'is-readonly': readonly, 'is-invalid': invalid }">
    <div v-if="toolbar" ref="toolbarEl" class="mi-ed__tb mi:flex mi:flex-wrap mi:items-center mi:gap-0.5 mi:p-1.5 mi:[border-bottom:.5px_solid_var(--mi-sep)]" role="toolbar" :aria-label="`${label} formatting`" aria-orientation="horizontal" @mousedown.prevent @keydown="onToolbarKey">
      <template v-for="(b, i) in buttons" :key="b.id">
        <span v-if="i > 0 && buttons[i - 1]!.group !== b.group" class="mi-ed__sep mi:w-px mi:h-4.5 mi:my-0 mi:mx-1 mi:[background:var(--mi-sep2)]" role="separator" aria-orientation="vertical" />
        <MiIconButton
          data-tb
          :label="b.label"
          :title="titleOf(b)"
          variant="tinted"
          size="toolbar"
          :class="{ 'is-on': b.cmd && active[b.cmd] }"
          :pressed="b.cmd ? active[b.cmd] : undefined"
          :disabled="!editable"
          :tabindex="i === tbIndex ? 0 : -1"
          @click="press(b)"
          @focus="tbIndex = i"
        >
          <span v-if="b.text" class="mi-ed__glyph mi:text-[14px] mi:leading-none" :style="b.style" aria-hidden="true">{{ b.text }}</span>
          <MiIcon v-else :svg="b.svg" :size="16" />
        </MiIconButton>
      </template>
    </div>
    <form v-if="linkOpen" class="mi-ed__link mi:flex mi:flex-wrap mi:gap-1.5 mi:py-2 mi:px-2.5 mi:[border-bottom:.5px_solid_var(--mi-sep)]" @submit.prevent="applyLink" @keydown.esc.stop.prevent="closeLink()">
      <input
        :id="`${uid}-link`"
        ref="linkInput"
        v-model="linkUrl"
        class="mi-ed__input mi:flex-[1_1_200px] mi:min-w-0 mi:h-8 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[8px] mi:[background:var(--mi-fill3)] mi:text-label mi:[font:14px_var(--mi-font)] mi:focus-visible:outline-offset-[0]"
        type="text"
        inputmode="url"
        autocomplete="off"
        placeholder="https://"
        :aria-label="linkLabel"
        :aria-invalid="linkError || undefined"
        @input="linkError = false"
      >
      <button type="submit" class="mi-ed__ok mi:h-8 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[8px] mi:[font:600_13px_var(--mi-font)] mi:cursor-pointer mi:[background:var(--mi-p)] mi:text-p-on mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]">Apply</button>
      <button type="button" class="mi-ed__cancel mi:h-8 mi:py-0 mi:px-3 mi:[border:0] mi:rounded-[8px] mi:[font:600_13px_var(--mi-font)] mi:cursor-pointer mi:[background:transparent] mi:text-label2 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="closeLink()">Cancel</button>
    </form>
    <div class="mi-ed__wrap mi:relative mi:flex mi:flex-col mi:min-h-0">
      <div
        ref="surface"
        class="mi-ed__surface mi:flex-1 mi:box-border mi:py-3.5 mi:px-4 mi:overflow-y-auto mi:[outline:none] mi:text-[15px] mi:leading-[1.55] mi:wrap-anywhere mi:caret-p mi:[&[data-empty='true']]:before:content-[attr(data-placeholder)] mi:[&[data-empty='true']]:before:absolute mi:[&[data-empty='true']]:before:pointer-events-none mi:[&[data-empty='true']]:before:text-label3 mi:[.mi-ed.is-disabled_&]:cursor-not-allowed"
        role="textbox"
        aria-multiline="true"
        :aria-label="label"
        :aria-readonly="readonly || undefined"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        :aria-placeholder="placeholder"
        :contenteditable="editable ? 'true' : 'false'"
        :tabindex="disabled ? undefined : 0"
        :data-empty="empty ? 'true' : undefined"
        :data-placeholder="placeholder"
        spellcheck="true"
        :style="{ minHeight: css(minHeight), maxHeight: css(maxHeight) }"
        @input="onInput"
        @keydown="onKeydown"
        @paste="onPaste"
        @drop="onDrop"
        @focus="onFocus"
        @blur="onBlur"
        v-html="html"
      />
    </div>
  </div>
</template>

<style scoped>
.mi-ed { display: flex; background: var(--mi-field); color: var(--mi-label); transition: opacity var(--mi-dur-2) var(--mi-ease); }
.mi-ed:focus-within { box-shadow: inset 0 0 0 2px var(--mi-p); }
.mi-ed.is-invalid { box-shadow: inset 0 0 0 1.5px var(--mi-red); }
.mi-ed__tb :deep(.mi-icon-btn) { --_tint: transparent; color: var(--mi-label2); }
.mi-ed__tb :deep(.mi-icon-btn.is-on) { --_tint: var(--mi-p-tint); color: var(--mi-p-text); }
.mi-ed__input:focus-visible { outline: 2px solid var(--mi-p); }
.mi-ed__input[aria-invalid="true"] { outline: 2px solid var(--mi-red); }
.mi-ed__surface :deep(p) { margin: 0 0 .7em; }
.mi-ed__surface :deep(p:last-child) { margin-bottom: 0; }
.mi-ed__surface :deep(h2) { margin: .9em 0 .4em; font-size: 1.35em; line-height: 1.25; letter-spacing: -.02em; }
.mi-ed__surface :deep(h3) { margin: .9em 0 .4em; font-size: 1.12em; line-height: 1.3; letter-spacing: -.01em; }
.mi-ed__surface :deep(h2:first-child), .mi-ed__surface :deep(h3:first-child) { margin-top: 0; }
.mi-ed__surface :deep(ul), .mi-ed__surface :deep(ol) { margin: 0 0 .7em; padding-left: 1.5em; }
.mi-ed__surface :deep(blockquote) { margin: 0 0 .7em; padding: 2px 0 2px 14px; border-left: 3px solid var(--mi-p); color: var(--mi-label2); }
.mi-ed__surface :deep(code) { padding: .12em .4em; border-radius: 6px; background: var(--mi-fill3); font: .88em ui-monospace, SFMono-Regular, Menlo, monospace; }
.mi-ed__surface :deep(pre) { margin: 0 0 .7em; padding: 12px 14px; border-radius: 10px; background: var(--mi-fill3); overflow-x: auto; font: .88em ui-monospace, SFMono-Regular, Menlo, monospace; }
.mi-ed__surface :deep(pre code) { padding: 0; background: none; }
.mi-ed__surface :deep(a) { color: var(--mi-p-text); text-decoration: underline; text-underline-offset: 2px; }
</style>
