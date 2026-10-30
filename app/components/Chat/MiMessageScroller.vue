<script setup lang="ts">
/** Scroll container for a message list: sticks to the bottom while streaming, keeps position when older rows are prepended, shows a jump-to-latest button. */
import { nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { MI_MESSAGE_SCROLLER_KEY, type MiScrollToOptions } from '../../composables/useMiMessageScroller'

const props = withDefaults(defineProps<{
  /** Follow new content while the reader is at the bottom. Any manual scroll away releases it. */
  autoScroll?: boolean
  /** Where the list opens. */
  initialPosition?: 'start' | 'end' | 'last-anchor'
  /** Px of the previous row kept visible above an anchor when opening on `last-anchor`. */
  scrollPreviousItemPeek?: number
  /** Px of spacing applied when scrolling to a target. */
  scrollMargin?: number
  /** Distance in px from the bottom still counted as "at the live edge". */
  threshold?: number
  /** Accessible name of the scrollable region. */
  label?: string
  /** Label of the jump-to-latest button. */
  jumpLabel?: string
  /** Set while a response is streaming (`aria-busy` on the log). */
  busy?: boolean
}>(), { autoScroll: true, initialPosition: 'end', threshold: 48, scrollPreviousItemPeek: 0, scrollMargin: 0, label: 'Messages', jumpLabel: 'Jump to latest' })

const emit = defineEmits<{
  /** Fired when the reader reaches or leaves the bottom. */
  'update:atEnd': [value: boolean]
}>()

const vp = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const atEnd = ref(true)
let ro: ResizeObserver | null = null
let prevH = 0
let prevTop = 0

function measure() {
  const el = vp.value
  if (!el) return
  const v = el.scrollHeight - el.scrollTop - el.clientHeight <= props.threshold
  scrollable.value = { start: el.scrollTop > 0, end: !v }
  if (v !== atEnd.value) { atEnd.value = v; emit('update:atEnd', v) }
}
function scrollToEnd(behavior: ScrollBehavior = 'smooth') {
  vp.value?.scrollTo({ top: vp.value.scrollHeight, behavior })
}
function scrollToStart(behavior: ScrollBehavior = 'smooth') {
  vp.value?.scrollTo({ top: 0, behavior })
}
const scrollable = ref({ start: false, end: false })
const currentAnchorId = ref<string | null>(null)
const visibleMessageIds = ref<string[]>([])
const visible = new Set<string>()
let io: IntersectionObserver | null = null

function rowEl(id: string): HTMLElement | null {
  return vp.value ? Array.from(vp.value.querySelectorAll<HTMLElement>('[data-message-id]')).find(e => e.dataset.messageId === id) ?? null : null
}
function offsetTop(row: HTMLElement, el: HTMLElement) {
  return row.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop
}
function scrollToMessage(id: string, o: MiScrollToOptions = {}): boolean {
  const el = vp.value
  const row = rowEl(id)
  if (!el || !row) return false
  const m = o.scrollMargin ?? props.scrollMargin
  const top = offsetTop(row, el)
  const y = o.align === 'end' ? top + row.offsetHeight - el.clientHeight + m
    : o.align === 'center' ? top - (el.clientHeight - row.offsetHeight) / 2
      : top - m
  el.scrollTo({ top: Math.max(0, y), behavior: o.behavior ?? 'smooth' })
  return true
}
function scrollToLastAnchor(): boolean {
  const el = vp.value
  const a = el?.querySelectorAll<HTMLElement>('[data-scroll-anchor]')
  const last = a?.[a.length - 1]
  if (!el || !last) return false
  const prev = last.previousElementSibling as HTMLElement | null
  const peek = prev ? Math.min(props.scrollPreviousItemPeek, prev.offsetHeight) : 0
  el.scrollTop = Math.max(0, offsetTop(last, el) - peek - props.scrollMargin)
  return true
}
function updateAnchor() {
  const el = vp.value
  if (!el) return
  let id: string | null = null
  for (const a of el.querySelectorAll<HTMLElement>('[data-scroll-anchor]')) {
    if (offsetTop(a, el) <= el.scrollTop + 1) id = a.dataset.messageId ?? null
  }
  currentAnchorId.value = id
}
function observe(target: Element) {
  io ??= typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
    for (const e of entries) {
      const id = (e.target as HTMLElement).dataset.messageId
      if (!id) continue
      if (e.isIntersecting) visible.add(id)
      else visible.delete(id)
    }
    visibleMessageIds.value = [...visible]
  }, { root: vp.value })
  io?.observe(target)
  return () => { io?.unobserve(target); visible.delete((target as HTMLElement).dataset.messageId ?? '') }
}
provide(MI_MESSAGE_SCROLLER_KEY, { scrollToMessage, scrollToEnd, scrollToStart, scrollable, currentAnchorId, visibleMessageIds, observe })

function onScroll() { measure(); updateAnchor(); if (vp.value) prevTop = vp.value.scrollTop }

onMounted(() => {
  const el = vp.value
  if (!el) return
  if (props.initialPosition === 'end' || (props.initialPosition === 'last-anchor' && !scrollToLastAnchor())) el.scrollTop = el.scrollHeight
  else if (props.initialPosition === 'last-anchor') updateAnchor()
  prevH = el.scrollHeight
  measure()
  if (typeof ResizeObserver === 'undefined' || !content.value) return
  ro = new ResizeObserver(() => {
    const e = vp.value
    if (!e) return
    const grown = e.scrollHeight - prevH
    if (atEnd.value && props.autoScroll) e.scrollTop = e.scrollHeight
    else if (grown > 0 && prevTop <= 0 && e.scrollTop <= 0) {
      // older rows prepended while at top: keep the reader's place
      e.scrollTop = grown
    }
    prevH = e.scrollHeight
    prevTop = e.scrollTop
    measure()
  })
  ro.observe(content.value)
})
onBeforeUnmount(() => { ro?.disconnect(); io?.disconnect() })
watch(() => props.threshold, () => nextTick(measure))

defineExpose({ scrollToMessage, scrollToEnd, scrollToStart, atEnd })

defineSlots<{
  /** Message rows, usually MiMessageScrollerItem elements. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-ms">
    <div ref="vp" class="mi-ms__vp" tabindex="0" role="region" :aria-label="label" @scroll.passive="onScroll">
      <div ref="content" class="mi-ms__c" role="log" aria-relevant="additions" :aria-busy="busy ? 'true' : undefined"><slot /></div>
    </div>
    <Transition name="mi-ms-jump">
      <button v-if="!atEnd" type="button" class="mi-ms__jump" :aria-label="jumpLabel" @click="scrollToEnd()">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.mi-ms{position:relative;display:flex;flex-direction:column;height:100%;min-height:0;font-family:var(--mi-font)}
.mi-ms__vp{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;overflow-anchor:none}
.mi-ms__vp:focus-visible{outline:2px solid var(--mi-p);outline-offset:-2px}
.mi-ms__c{display:flex;flex-direction:column;gap:12px;padding:16px}
.mi-ms__c > :deep(*){content-visibility:auto;contain-intrinsic-size:auto 56px}
.mi-ms__jump{position:absolute;inset-inline:0;inset-block-end:12px;margin-inline:auto;display:grid;place-items:center;width:36px;height:36px;border:1px solid var(--mi-sep2);border-radius:50%;background:var(--mi-card);color:var(--mi-label);box-shadow:var(--mi-sh1);cursor:pointer}
.mi-ms__jump:focus-visible{outline:2px solid var(--mi-p);outline-offset:2px}
.mi-ms-jump-enter-active,.mi-ms-jump-leave-active{transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-2) var(--mi-ease)}
.mi-ms-jump-enter-from,.mi-ms-jump-leave-to{opacity:0;transform:translateY(8px)}
</style>
