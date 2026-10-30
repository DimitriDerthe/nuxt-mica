<script setup lang="ts">
/** Scroll-snap carousel with prev/next buttons, dots, optional loop and a v-model slide index. Each direct child of the default slot is one slide. */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineSlots<{
  /** The slides, one element per slide. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Wrap around from the last slide to the first and back. */
  loop?: boolean
  /** Show the previous/next buttons. */
  arrows?: boolean
  /** Show the dot indicators. */
  dots?: boolean
  /** Scroll axis. */
  orientation?: 'horizontal' | 'vertical'
  /** Slide alignment inside the viewport (Embla `align`). */
  align?: 'start' | 'center'
  /** CSS flex-basis of each slide, e.g. `50%` or `33.333%` (shadcn `basis-*`). */
  basis?: string
  /** Accessible name of the carousel. */
  label?: string
}>(), { loop: false, arrows: true, dots: true, orientation: 'horizontal', align: 'start', basis: '100%', label: 'Carousel' })

/** Current slide index (0-based). */
const index = defineModel<number>({ default: 0 })

const emit = defineEmits<{ (e: 'select', index: number): void }>()

const track = ref<HTMLElement>()
const count = ref(0)
const vertical = () => props.orientation === 'vertical'
let raf = 0

function measure() { count.value = track.value?.children.length ?? 0 }
function goTo(i: number, smooth = true) {
  const el = track.value
  if (!el || !count.value) return
  const n = props.loop ? (i + count.value) % count.value : Math.max(0, Math.min(count.value - 1, i))
  index.value = n
  const size = vertical() ? el.clientHeight : el.clientWidth
  el.scrollTo({ [vertical() ? 'top' : 'left']: n * size, behavior: smooth ? 'smooth' : 'auto' })
}
const prev = () => goTo(index.value - 1)
const next = () => goTo(index.value + 1)
const canPrev = () => props.loop || index.value > 0
const canNext = () => props.loop || index.value < count.value - 1

function onScroll() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const el = track.value
    if (!el) return
    const size = (vertical() ? el.clientHeight : el.clientWidth) || 1
    const i = Math.round((vertical() ? el.scrollTop : el.scrollLeft) / size)
    if (i !== index.value && i >= 0 && i < count.value) index.value = i
  })
}
function onKey(e: KeyboardEvent) {
  const a = vertical() ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
  if (e.key === a[0]) { e.preventDefault(); prev() }
  else if (e.key === a[1]) { e.preventDefault(); next() }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0) }
  else if (e.key === 'End') { e.preventDefault(); goTo(count.value - 1) }
}

let mo: MutationObserver | undefined
onMounted(() => {
  measure()
  if (track.value && typeof MutationObserver !== 'undefined') {
    mo = new MutationObserver(measure)
    mo.observe(track.value, { childList: true })
  }
  nextTick(() => index.value && goTo(index.value, false))
})
onBeforeUnmount(() => { mo?.disconnect(); cancelAnimationFrame(raf) })
watch(index, (v) => {
  emit('select', v)
  const el = track.value
  if (!el) return
  const size = vertical() ? el.clientHeight : el.clientWidth
  const cur = vertical() ? el.scrollTop : el.scrollLeft
  if (Math.abs(cur - v * size) > 2) goTo(v)
})
defineExpose({ prev, next, goTo })
</script>

<template>
  <section class="mi-car" :class="[`mi-car--${orientation}`, `mi-car--${align}`]" :style="{ '--mi-car-basis': basis }" role="region" aria-roledescription="carousel" :aria-label="label" tabindex="0" @keydown="onKey">
    <div ref="track" class="mi-car__track" aria-live="polite" @scroll.passive="onScroll">
      <slot />
    </div>
    <template v-if="arrows">
      <button type="button" class="mi-car__btn mi-car__btn--prev" aria-label="Previous slide" :disabled="!canPrev()" @click="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button type="button" class="mi-car__btn mi-car__btn--next" aria-label="Next slide" :disabled="!canNext()" @click="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </template>
    <div v-if="dots && count > 1" class="mi-car__dots">
      <button v-for="i in count" :key="i" type="button" class="mi-car__dot" :class="{ 'mi-car__dot--on': index === i - 1 }" :aria-label="`Go to slide ${i}`" :aria-current="index === i - 1 ? 'true' : undefined" @click="goTo(i - 1)" />
    </div>
  </section>
</template>

<style scoped>
.mi-car{position:relative;font-family:var(--mi-font);color:var(--mi-label);border-radius:14px}
.mi-car__track{display:flex;overflow:auto;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior:contain;border-radius:inherit}
.mi-car__track::-webkit-scrollbar{display:none}
.mi-car--vertical .mi-car__track{flex-direction:column;scroll-snap-type:y mandatory;height:100%}
.mi-car__track :deep(> *){flex:0 0 var(--mi-car-basis,100%);min-width:0;scroll-snap-align:start;scroll-snap-stop:always}
.mi-car--vertical .mi-car__track :deep(> *){min-height:100%}
.mi-car--center .mi-car__track :deep(> *){scroll-snap-align:center}
.mi-car__btn{position:absolute;top:50%;display:grid;place-items:center;width:36px;height:36px;margin-top:-18px;padding:0;border:0;border-radius:50%;background:var(--mi-card);color:var(--mi-label);box-shadow:var(--mi-sh2);cursor:pointer;transition:transform var(--mi-dur-2) var(--mi-ease),opacity var(--mi-dur-2) linear}
.mi-car__btn--prev{left:10px}
.mi-car__btn--next{right:10px}
.mi-car--vertical .mi-car__btn{left:50%;margin:0 0 0 -18px}
.mi-car--vertical .mi-car__btn--prev{top:10px;transform:rotate(90deg)}
.mi-car--vertical .mi-car__btn--next{top:auto;bottom:10px;transform:rotate(90deg)}
.mi-car__btn:disabled{opacity:.35;cursor:default}
.mi-car__btn:not(:disabled):active{transform:scale(.92)}
.mi-car--vertical .mi-car__btn:not(:disabled):active{transform:rotate(90deg) scale(.92)}
.mi-car__dots{position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:6px;pointer-events:none}
.mi-car--vertical .mi-car__dots{left:auto;right:10px;top:0;bottom:0;flex-direction:column;align-items:center}
.mi-car__dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:var(--mi-label3);opacity:.5;cursor:pointer;pointer-events:auto;transition:transform var(--mi-dur-2) var(--mi-spring),opacity var(--mi-dur-2) linear}
.mi-car__dot--on{background:var(--mi-p);opacity:1;transform:scale(1.35)}
</style>
