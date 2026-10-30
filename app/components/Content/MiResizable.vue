<script setup lang="ts">
/** Resizable split panels with draggable, keyboard-operable handles; horizontal or vertical, with min/max sizes and a v-model of percentages. */
import { computed, ref } from 'vue'

defineSlots<{
  /** Content of the panel at the index in the slot name (`panel-0`, `panel-1`, ...), given its current size in percent. */
  [name: `panel-${number}`]: (props: { size: number }) => unknown
}>()

const props = withDefaults(defineProps<{
  /** `horizontal` places panels side by side, `vertical` stacks them (shadcn `orientation`). */
  orientation?: 'horizontal' | 'vertical'
  /** Minimum size of any panel, in percent. */
  minSize?: number
  /** Maximum size of any panel, in percent. */
  maxSize?: number
  /** Show a visible grip on each handle (shadcn `withHandle`). */
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
  <div ref="root" class="mi-rs" :class="[`mi-rs--${orientation}`, { 'mi-rs--drag': active >= 0 }]">
    <template v-for="(s, i) in sizes" :key="i">
      <div class="mi-rs__panel" :style="{ flexBasis: s + '%' }">
        <slot :name="`panel-${i}`" :size="s" />
      </div>
      <div
        v-if="i < sizes.length - 1"
        class="mi-rs__handle"
        :class="{ 'mi-rs__handle--on': active === i }"
        role="separator"
        tabindex="0"
        :aria-label="handleLabel"
        :aria-orientation="horiz ? 'vertical' : 'horizontal'"
        :aria-valuenow="Math.round(s)"
        :aria-valuemin="minSize"
        :aria-valuemax="maxSize"
        @pointerdown="onDown(i, $event)"
        @keydown="onKey(i, $event)"
      ><span v-if="withHandle" class="mi-rs__grip" aria-hidden="true" /></div>
    </template>
  </div>
</template>

<style scoped>
.mi-rs{display:flex;width:100%;height:100%;font-family:var(--mi-font);color:var(--mi-label);overflow:hidden;border-radius:14px;background:var(--mi-card);box-shadow:var(--mi-sh1)}
.mi-rs--vertical{flex-direction:column}
.mi-rs--drag{user-select:none}
.mi-rs__panel{flex:0 1 auto;min-width:0;min-height:0;overflow:auto}
.mi-rs__handle{position:relative;flex:none;background:var(--mi-sep);touch-action:none}
.mi-rs--horizontal>.mi-rs__handle{width:1px;cursor:col-resize}
.mi-rs--vertical>.mi-rs__handle{height:1px;cursor:row-resize}
.mi-rs__handle::before{content:"";position:absolute;inset:0;background:var(--mi-p);opacity:0;transition:opacity var(--mi-dur-2) linear}
.mi-rs--horizontal>.mi-rs__handle::after{content:"";position:absolute;top:0;bottom:0;left:-5px;right:-5px}
.mi-rs--vertical>.mi-rs__handle::after{content:"";position:absolute;left:0;right:0;top:-5px;bottom:-5px}
.mi-rs__grip{position:absolute;top:50%;left:50%;z-index:1;width:12px;height:16px;border-radius:4px;background:var(--mi-fill2,var(--mi-sep));box-shadow:inset 0 0 0 .5px var(--mi-label3);transform:translate(-50%,-50%)}
.mi-rs--vertical>.mi-rs__handle .mi-rs__grip{width:16px;height:12px}
.mi-rs__handle:hover::before,.mi-rs__handle--on::before,.mi-rs__handle:focus-visible::before{opacity:1}
.mi-rs--horizontal>.mi-rs__handle::before{left:-1px;right:-1px}
.mi-rs--vertical>.mi-rs__handle::before{top:-1px;bottom:-1px}
</style>
