<script setup lang="ts">
/** Scrollable region with slim overlay scrollbars styled by tokens; the thumbs move with transform only. */
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineSlots<{
  /** Scrollable content. */
  default?(): unknown
}>()

withDefaults(defineProps<{
  /** Which scrollbars to offer. */
  orientation?: 'vertical' | 'horizontal' | 'both'
  /** CSS max-height of the viewport, e.g. `240px`. */
  maxHeight?: string
  /** Accessible name of the scroll region. */
  label?: string
}>(), { orientation: 'vertical', label: 'Scrollable area' })

const view = ref<HTMLElement>()
const v = ref({ size: 0, pos: 0, show: false })
const h = ref({ size: 0, pos: 0, show: false })
let raf = 0
let ro: ResizeObserver | undefined

function update() {
  const el = view.value
  if (!el) return
  const vt = el.clientHeight, vs = el.scrollHeight
  const ht = el.clientWidth, hs = el.scrollWidth
  const vsz = Math.max(24, (vt / vs) * vt)
  const hsz = Math.max(24, (ht / hs) * ht)
  v.value = { show: vs > vt + 1, size: vsz, pos: vs > vt ? (el.scrollTop / (vs - vt)) * (vt - vsz) : 0 }
  h.value = { show: hs > ht + 1, size: hsz, pos: hs > ht ? (el.scrollLeft / (hs - ht)) * (ht - hsz) : 0 }
}
function onScroll() { cancelAnimationFrame(raf); raf = requestAnimationFrame(update) }

function drag(axis: 'v' | 'h', e: PointerEvent) {
  const el = view.value
  if (!el) return
  e.preventDefault()
  const t = e.currentTarget as HTMLElement
  t.setPointerCapture?.(e.pointerId)
  const start = axis === 'v' ? e.clientY : e.clientX
  const from = axis === 'v' ? el.scrollTop : el.scrollLeft
  const m = axis === 'v' ? v.value : h.value
  const track = axis === 'v' ? el.clientHeight : el.clientWidth
  const ratio = ((axis === 'v' ? el.scrollHeight : el.scrollWidth) - track) / Math.max(1, track - m.size)
  const move = (ev: PointerEvent) => {
    const d = ((axis === 'v' ? ev.clientY : ev.clientX) - start) * ratio
    if (axis === 'v') el.scrollTop = from + d
    else el.scrollLeft = from + d
  }
  const up = () => { t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up) }
  t.addEventListener('pointermove', move)
  t.addEventListener('pointerup', up)
}

onMounted(() => {
  update()
  if (typeof ResizeObserver === 'undefined' || !view.value) return
  ro = new ResizeObserver(update)
  ro.observe(view.value)
  for (const c of Array.from(view.value.children)) ro.observe(c)
})
onBeforeUnmount(() => { ro?.disconnect(); cancelAnimationFrame(raf) })
defineExpose({ update, el: view })
</script>

<template>
  <div class="mi-sa mi:relative mi:overflow-hidden mi:font-mi mi:text-label">
    <div ref="view" class="mi-sa__view mi:overflow-auto mi:[scrollbar-width:none] mi:overscroll-contain mi:max-h-[inherit] mi:[&::-webkit-scrollbar]:hidden" :class="`mi-sa__view--${orientation}`" :style="{ maxHeight }" role="region" :aria-label="label" tabindex="0" @scroll.passive="onScroll">
      <slot />
    </div>
    <div v-if="orientation !== 'horizontal' && v.show" class="mi-sa__bar mi-sa__bar--v mi:absolute mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_linear] mi:[.mi-sa:hover_&]:opacity-100 mi:[.mi-sa:focus-within_&]:opacity-100 mi:top-0.5 mi:right-0.5 mi:bottom-0.5 mi:w-1.5" aria-hidden="true" data-bar="v">
      <div class="mi-sa__thumb mi:rounded-[3px] mi:bg-label3 mi:cursor-grab mi:touch-none mi:[.mi-sa__bar--v_&]:w-full mi:[.mi-sa__bar--h_&]:h-full mi:hover:bg-label2" :style="{ height: v.size + 'px', transform: `translateY(${v.pos}px)` }" @pointerdown="drag('v', $event)" />
    </div>
    <div v-if="orientation !== 'vertical' && h.show" class="mi-sa__bar mi-sa__bar--h mi:absolute mi:opacity-0 mi:[transition:opacity_var(--mi-dur-2)_linear] mi:[.mi-sa:hover_&]:opacity-100 mi:[.mi-sa:focus-within_&]:opacity-100 mi:left-0.5 mi:right-0.5 mi:bottom-0.5 mi:h-1.5" aria-hidden="true" data-bar="h">
      <div class="mi-sa__thumb mi:rounded-[3px] mi:bg-label3 mi:cursor-grab mi:touch-none mi:[.mi-sa__bar--v_&]:w-full mi:[.mi-sa__bar--h_&]:h-full mi:hover:bg-label2" :style="{ width: h.size + 'px', transform: `translateX(${h.pos}px)` }" @pointerdown="drag('h', $event)" />
    </div>
  </div>
</template>

<style scoped>
.mi-sa__view--vertical{overflow-x:hidden}
.mi-sa__view--horizontal{overflow-y:hidden}
</style>
