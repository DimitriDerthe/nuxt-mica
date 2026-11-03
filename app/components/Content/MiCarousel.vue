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
  /** CSS flex-basis of each slide, e.g. `50%` or `33.333%`. */
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
  <section class="mi-car mi:relative mi:font-mi mi:rounded-[14px]" :class="[`mi-car--${orientation}`, `mi-car--${align}`]" :style="{ '--mi-car-basis': basis }" role="region" aria-roledescription="carousel" :aria-label="label" tabindex="0" @keydown="onKey">
    <div ref="track" class="mi-car__track mi:flex mi:overflow-auto mi:[scroll-snap-type:x_mandatory] mi:[scrollbar-width:none] mi:overscroll-contain mi:rounded-[inherit] mi:[&::-webkit-scrollbar]:hidden mi:[.mi-car--vertical_&]:flex-col mi:[.mi-car--vertical_&]:[scroll-snap-type:y_mandatory] mi:[.mi-car--vertical_&]:h-full" aria-live="polite" @scroll.passive="onScroll">
      <slot />
    </div>
    <template v-if="arrows">
      <button type="button" class="mi-car__btn mi-car__btn--prev mi:absolute mi:top-1/2 mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:-mt-4.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-card mi:text-label mi:shadow-2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),opacity_var(--mi-dur-2)_linear] mi:left-2.5 mi:[.mi-car--vertical_&]:left-1/2 mi:[.mi-car--vertical_&]:mt-0 mi:[.mi-car--vertical_&]:mr-0 mi:[.mi-car--vertical_&]:mb-0 mi:[.mi-car--vertical_&]:-ml-4.5 mi:[.mi-car--vertical_&]:top-2.5 mi:[.mi-car--vertical_&]:transform-[rotate(90deg)] mi:disabled:opacity-35 mi:disabled:cursor-default mi:[&:not(:disabled):active]:transform-[scale(.92)] mi:[.mi-car--vertical_&:not(:disabled):active]:transform-[rotate(90deg)_scale(.92)]" aria-label="Previous slide" :disabled="!canPrev()" @click="prev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </button>
      <button type="button" class="mi-car__btn mi-car__btn--next mi:absolute mi:top-1/2 mi:grid mi:place-items-center mi:w-9 mi:h-9 mi:-mt-4.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-card mi:text-label mi:shadow-2 mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),opacity_var(--mi-dur-2)_linear] mi:right-2.5 mi:[.mi-car--vertical_&]:left-1/2 mi:[.mi-car--vertical_&]:mt-0 mi:[.mi-car--vertical_&]:mr-0 mi:[.mi-car--vertical_&]:mb-0 mi:[.mi-car--vertical_&]:-ml-4.5 mi:[.mi-car--vertical_&]:top-auto mi:[.mi-car--vertical_&]:bottom-2.5 mi:[.mi-car--vertical_&]:transform-[rotate(90deg)] mi:disabled:opacity-35 mi:disabled:cursor-default mi:[&:not(:disabled):active]:transform-[scale(.92)] mi:[.mi-car--vertical_&:not(:disabled):active]:transform-[rotate(90deg)_scale(.92)]" aria-label="Next slide" :disabled="!canNext()" @click="next">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>
    </template>
    <div v-if="dots && count > 1" class="mi-car__dots mi:absolute mi:left-0 mi:right-0 mi:bottom-2.5 mi:flex mi:justify-center mi:gap-1.5 mi:pointer-events-none mi:[.mi-car--vertical_&]:left-auto mi:[.mi-car--vertical_&]:right-2.5 mi:[.mi-car--vertical_&]:top-0 mi:[.mi-car--vertical_&]:bottom-0 mi:[.mi-car--vertical_&]:flex-col mi:[.mi-car--vertical_&]:items-center">
      <button v-for="i in count" :key="i" type="button" class="mi-car__dot mi:w-2 mi:h-2 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:bg-label3 mi:cursor-pointer mi:pointer-events-auto mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring),opacity_var(--mi-dur-2)_linear]" :class="{ 'mi-car__dot--on mi:bg-p mi:transform-[scale(1.35)]': index === i - 1 }" :aria-label="`Go to slide ${i}`" :aria-current="index === i - 1 ? 'true' : undefined" @click="goTo(i - 1)" />
    </div>
  </section>
</template>

<style scoped>
.mi-car{color:var(--mi-label)}
.mi-car__track :deep(> *){flex:0 0 var(--mi-car-basis,100%);min-width:0;scroll-snap-align:start;scroll-snap-stop:always}
.mi-car--vertical .mi-car__track :deep(> *){min-height:100%}
.mi-car--center .mi-car__track :deep(> *){scroll-snap-align:center}
.mi-car__dot{opacity:.5}
.mi-car__dot--on{opacity:1}
</style>
