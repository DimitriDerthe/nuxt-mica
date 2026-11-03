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
  <header ref="root" class="mi-nb mi:[--p:0] mi:contents mi:font-mi mi:text-label" :class="{ 'has-large': large, 'is-collapsed': collapsed }">
    <div class="mi-nb__row mi:bg-mat mi:sticky mi:top-0 mi:z-20 mi:h-13.5 mi:pt-2.5 mi:px-4 mi:pb-0 mi:grid mi:grid-cols-[1fr_auto_1fr] mi:items-center">
      <div class="mi-nb__lead mi:flex mi:[justify-content:flex-start] mi:min-w-0">
        <slot name="leading">
          <a v-if="backLabel" class="mi-nb__back mi:inline-flex mi:items-center mi:gap-0.5 mi:-ml-2 mi:h-11 mi:text-p-text mi:[text-decoration:none] mi:text-[17px] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:active:opacity-50" href="#" @click.prevent="emit('back')">
            <MiNavGlyph name="back" :size="22" :stroke="2.4" />{{ backLabel }}
          </a>
        </slot>
      </div>
      <span class="mi-nb__small mi:text-[17px] mi:font-semibold mi:tracking-[-.01em] mi:whitespace-nowrap mi:[.has-large_&]:opacity-(--p) mi:[.has-large_&]:transform-[translate3d(0,calc((1_-_var(--p))_*_6px),0)]" :aria-hidden="large && !collapsed ? 'true' : undefined">{{ title }}</span>
      <div class="mi-nb__trail mi:flex mi:[justify-content:flex-end] mi:min-w-0">
        <slot name="trailing">
          <button v-if="actionLabel" type="button" class="mi-nb__action mi:active:opacity-50 mi:h-11 mi:[border:0] mi:p-0 mi:bg-transparent mi:text-p-text mi:text-[17px] mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" @click="emit('action')">{{ actionLabel }}</button>
        </slot>
      </div>
      <span class="mi-nb__edge mi:absolute mi:left-0 mi:right-0 mi:bottom-0 mi:h-[.5px] mi:bg-sep mi:opacity-(--p) mi:[.mi-nb:not(.has-large)_&]:opacity-100" aria-hidden="true" />
    </div>
    <div v-if="large" class="mi-nb__big mi:bg-mat mi:pt-0 mi:px-4 mi:pb-3 mi:text-label">
      <h1 class="mi-nb__large mi:m-0 mi:text-[34px] mi:leading-[41px] mi:font-bold mi:tracking-[-.03em] mi:origin-[left_center] mi:opacity-[calc(1_-_var(--p)_*_1.4)] mi:transform-[translate3d(0,calc(var(--p)_*_-4px),0)_scale(calc(1_-_var(--p)_*_.06))]"><slot name="title">{{ title }}</slot></h1>
    </div>
  </header>
</template>

<style scoped>
.mi-nb__row, .mi-nb__big{-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-nb :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px;border-radius:6px}
</style>
