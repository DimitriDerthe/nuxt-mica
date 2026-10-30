<script setup lang="ts">
/** iOS-style sticky header with a back link, a trailing action and an optional large title that collapses into the bar on scroll. */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'

const LARGE = 54

const props = withDefaults(defineProps<{
  /** Page title shown centered in the bar and, when `large`, as the big heading below. */
  title: string
  /** Text of the back link (emits back). Ignored when the leading slot is provided. */
  backLabel?: string
  /** Trailing button label (emits action). Ignored when the trailing slot is used. */
  actionLabel?: string
  /** Show the large title that collapses into the bar while scrolling. */
  large?: boolean
  /** Scroll container: element or CSS selector. Defaults to the nearest scrollable ancestor, then the window. */
  target?: HTMLElement | string | null
}>(), { large: true })

const emit = defineEmits<{ back: [], action: [] }>()
/** True once the large title has fully collapsed. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const root = ref<HTMLElement | null>(null)
let scroller: HTMLElement | Window | null = null
let frame = 0

function findScroller(): HTMLElement | Window {
  if (props.target) {
    const el = typeof props.target === 'string' ? document.querySelector<HTMLElement>(props.target) : props.target
    if (el) return el
  }
  let p = root.value?.parentElement ?? null
  while (p) {
    const o = getComputedStyle(p).overflowY
    if (o === 'auto' || o === 'scroll' || o === 'overlay') return p
    p = p.parentElement
  }
  return window
}

/** Writes one CSS variable per frame, no layout reads beyond scrollTop and no reactive churn. */
function update() {
  frame = 0
  if (!root.value || !scroller) return
  const y = scroller instanceof Window ? scroller.scrollY : scroller.scrollTop
  const p = props.large ? Math.min(Math.max(y / LARGE, 0), 1) : 1
  root.value.style.setProperty('--p', p.toFixed(3))
  const c = p >= 1
  if (c !== collapsed.value) collapsed.value = c
}
function onScroll() { if (!frame) frame = requestAnimationFrame(update) }

function attach() {
  detach()
  scroller = findScroller()
  scroller.addEventListener('scroll', onScroll, { passive: true })
  update()
}
function detach() {
  scroller?.removeEventListener('scroll', onScroll)
  scroller = null
  if (frame) { cancelAnimationFrame(frame); frame = 0 }
}

onMounted(attach)
onBeforeUnmount(detach)
watch(() => [props.target, props.large], () => { if (root.value) attach() })
defineSlots<{
  /** Replaces the back link. */
  leading?(): unknown
  /** Replaces the trailing action button. */
  trailing?(): unknown
  /** Replaces the large title content. */
  title?(): unknown
}>()
</script>

<template>
  <header ref="root" class="mi-nb" :class="{ 'has-large': large, 'is-collapsed': collapsed }">
    <div class="mi-nb__row">
      <div class="mi-nb__lead">
        <slot name="leading">
          <a v-if="backLabel" class="mi-nb__back" href="#" @click.prevent="emit('back')">
            <MiNavGlyph name="back" :size="22" :stroke="2.4" />{{ backLabel }}
          </a>
        </slot>
      </div>
      <span class="mi-nb__small" :aria-hidden="large && !collapsed ? 'true' : undefined">{{ title }}</span>
      <div class="mi-nb__trail">
        <slot name="trailing">
          <button v-if="actionLabel" type="button" class="mi-nb__action" @click="emit('action')">{{ actionLabel }}</button>
        </slot>
      </div>
      <span class="mi-nb__edge" aria-hidden="true" />
    </div>
    <div v-if="large" class="mi-nb__big">
      <h1 class="mi-nb__large"><slot name="title">{{ title }}</slot></h1>
    </div>
  </header>
</template>

<style scoped>
/* display:contents lets the 54px row stick to the scroller while the large title scrolls away naturally (no height animation). */
.mi-nb{--p:0;display:contents;font-family:var(--mi-font);color:var(--mi-label)}
.mi-nb__row,.mi-nb__big{background:var(--mi-mat);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-nb__row{position:sticky;top:0;z-index:20;height:54px;padding:10px 16px 0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.mi-nb__big{padding:0 16px 12px;color:var(--mi-label)}
.mi-nb__lead{display:flex;justify-content:flex-start;min-width:0}
.mi-nb__trail{display:flex;justify-content:flex-end;min-width:0}
.mi-nb__back{display:inline-flex;align-items:center;gap:2px;margin-left:-8px;height:44px;color:var(--mi-p-text);text-decoration:none;font-size:17px;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-nb__back:active,.mi-nb__action:active{opacity:.5}
.mi-nb__action{height:44px;border:0;padding:0;background:transparent;color:var(--mi-p-text);font-size:17px;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-nb__small{font-size:17px;font-weight:600;letter-spacing:-.01em;white-space:nowrap}
.has-large .mi-nb__small{opacity:var(--p);transform:translate3d(0,calc((1 - var(--p)) * 6px),0)}
.mi-nb__large{margin:0;font-size:34px;line-height:41px;font-weight:700;letter-spacing:-.03em;transform-origin:left center;opacity:calc(1 - var(--p) * 1.4);transform:translate3d(0,calc(var(--p) * -4px),0) scale(calc(1 - var(--p) * .06))}
.mi-nb__edge{position:absolute;left:0;right:0;bottom:0;height:.5px;background:var(--mi-sep);opacity:var(--p)}
.mi-nb:not(.has-large) .mi-nb__edge{opacity:1}
.mi-nb :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px;border-radius:6px}
</style>
