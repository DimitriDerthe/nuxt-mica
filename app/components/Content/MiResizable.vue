<script setup lang="ts">
/** Resizable split panels with draggable, keyboard-operable handles; horizontal or vertical, with min/max sizes and a v-model of percentages. */
import { computed, ref } from 'vue'

defineSlots<{
  /** Content of the panel at the index in the slot name (`panel-0`, `panel-1`, ...), given its current size in percent. */
  [name: `panel-${number}`]: (props: { size: number }) => unknown
}>()

const props = withDefaults(defineProps<{
  /** `horizontal` places panels side by side, `vertical` stacks them. */
  orientation?: 'horizontal' | 'vertical'
  /** Minimum size of any panel, in percent. */
  minSize?: number
  /** Maximum size of any panel, in percent. */
  maxSize?: number
  /** Show a visible grip on each handle. */
  withHandle?: boolean
  /** Per-panel minimum sizes in percent, overriding `minSize`. */
  minSizes?: number[]
  /** Keyboard step in percent. */
  step?: number
  /** Accessible name of each handle. */
  handleLabel?: string
}>(), { orientation: 'horizontal', withHandle: false, minSizes: () => [], minSize: 10, maxSize: 90, step: 5, handleLabel: 'Resize panels' })

/** Panel sizes in percent; the length sets the panel count (slots `panel-0`, `panel-1`, ...). */
const sizes = defineModel<number[]>({ default: () => [50, 50] })

const root = ref<HTMLElement>()
const active = ref(-1)
const horiz = computed(() => props.orientation === 'horizontal')

/** Move the boundary after panel i by delta percent, clamped for both neighbours. */
function shift(i: number, delta: number, base: number[] = sizes.value) {
  const a = base[i]!, b = base[i + 1]!
  const ma = props.minSizes[i] ?? props.minSize
  const mb = props.minSizes[i + 1] ?? props.minSize
  const lo = Math.max(ma - a, b - props.maxSize)
  const hi = Math.min(props.maxSize - a, b - mb)
  const d = Math.max(lo, Math.min(hi, delta))
  const out = [...base]
  out[i] = a + d
  out[i + 1] = b - d
  sizes.value = out
}

function onKey(i: number, e: KeyboardEvent) {
  const fwd = horiz.value ? 'ArrowRight' : 'ArrowDown'
  const back = horiz.value ? 'ArrowLeft' : 'ArrowUp'
  if (e.key === fwd) { e.preventDefault(); shift(i, props.step) }
  else if (e.key === back) { e.preventDefault(); shift(i, -props.step) }
  else if (e.key === 'Home') { e.preventDefault(); shift(i, -100) }
  else if (e.key === 'End') { e.preventDefault(); shift(i, 100) }
}

function onDown(i: number, e: PointerEvent) {
  const el = root.value
  if (!el) return
  e.preventDefault()
  const t = e.currentTarget as HTMLElement
  t.setPointerCapture?.(e.pointerId)
  active.value = i
  const total = (horiz.value ? el.clientWidth : el.clientHeight) || 1
  const start = horiz.value ? e.clientX : e.clientY
  const base = [...sizes.value]
  let raf = 0
  const move = (ev: PointerEvent) => {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => shift(i, (((horiz.value ? ev.clientX : ev.clientY) - start) / total) * 100, base))
  }
  const up = () => { active.value = -1; t.removeEventListener('pointermove', move); t.removeEventListener('pointerup', up) }
  t.addEventListener('pointermove', move)
  t.addEventListener('pointerup', up)
}
</script>

<template>
  <div ref="root" class="mi-rs mi:flex mi:w-full mi:h-full mi:font-mi mi:overflow-hidden mi:rounded-[14px] mi:[background:var(--mi-card)] mi:shadow-1" :class="[`mi-rs--${orientation}`, { 'mi-rs--drag mi:select-none': active >= 0 }]">
    <template v-for="(s, i) in sizes" :key="i">
      <div class="mi-rs__panel mi:flex-[0_1_auto] mi:min-w-0 mi:min-h-0 mi:overflow-auto" :style="{ flexBasis: s + '%' }">
        <slot :name="`panel-${i}`" :size="s" />
      </div>
      <div
        v-if="i < sizes.length - 1"
        class="mi-rs__handle mi:relative mi:flex-[none] mi:[background:var(--mi-sep)] mi:touch-none mi:[.mi-rs--horizontal>&]:w-px mi:[.mi-rs--horizontal>&]:cursor-col-resize mi:[.mi-rs--vertical>&]:h-px mi:[.mi-rs--vertical>&]:cursor-row-resize mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:[background:var(--mi-p)] mi:before:opacity-0 mi:before:[transition:opacity_var(--mi-dur-2)_linear] mi:[.mi-rs--horizontal>&]:after:content-[''] mi:[.mi-rs--horizontal>&]:after:absolute mi:[.mi-rs--horizontal>&]:after:top-0 mi:[.mi-rs--horizontal>&]:after:bottom-0 mi:[.mi-rs--horizontal>&]:after:left-[-5px] mi:[.mi-rs--horizontal>&]:after:right-[-5px] mi:[.mi-rs--vertical>&]:after:content-[''] mi:[.mi-rs--vertical>&]:after:absolute mi:[.mi-rs--vertical>&]:after:left-0 mi:[.mi-rs--vertical>&]:after:right-0 mi:[.mi-rs--vertical>&]:after:top-[-5px] mi:[.mi-rs--vertical>&]:after:bottom-[-5px] mi:[.mi-rs--horizontal>&]:before:-left-px mi:[.mi-rs--horizontal>&]:before:-right-px mi:[.mi-rs--vertical>&]:before:-top-px mi:[.mi-rs--vertical>&]:before:-bottom-px"
        :class="{ 'mi-rs__handle--on mi:before:opacity-100': active === i }"
        role="separator"
        tabindex="0"
        :aria-label="handleLabel"
        :aria-orientation="horiz ? 'vertical' : 'horizontal'"
        :aria-valuenow="Math.round(s)"
        :aria-valuemin="minSize"
        :aria-valuemax="maxSize"
        @pointerdown="onDown(i, $event)"
        @keydown="onKey(i, $event)"
      ><span v-if="withHandle" class="mi-rs__grip mi:absolute mi:top-1/2 mi:left-1/2 mi:z-1 mi:w-3 mi:h-4 mi:rounded-[4px] mi:[background:var(--mi-fill2,var(--mi-sep))] mi:shadow-[inset_0_0_0_.5px_var(--mi-label3)] mi:transform-[translate(-50%,-50%)] mi:[.mi-rs--vertical>.mi-rs__handle_&]:w-4 mi:[.mi-rs--vertical>.mi-rs__handle_&]:h-3" aria-hidden="true" /></div>
    </template>
  </div>
</template>

<style scoped>
.mi-rs{color:var(--mi-label)}
.mi-rs--vertical{flex-direction:column}
.mi-rs__handle:hover::before, .mi-rs__handle:focus-visible::before{opacity:1}
</style>
