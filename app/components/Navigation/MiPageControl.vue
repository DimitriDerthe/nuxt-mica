<script setup lang="ts">
/** Dot pager for carousels and onboarding: one tab per item, v-model is the zero-based active index. */
import { computed, ref } from 'vue'
import { miNavRoving } from '../../utils/miNav'

const props = withDefaults(defineProps<{
  /** Number of dots, one per slide or page. */
  count: number
  /** Accessible name of the dot tablist. */
  ariaLabel?: string
  /** Label prefix of each dot, e.g. "Slide" gives "Slide 2". */
  itemLabel?: string
}>(), { ariaLabel: 'Slides', itemLabel: 'Slide' })

/** Zero-based index of the active page. */

const model = defineModel<number>({ default: 0 })
const root = ref<HTMLElement | null>(null)
const index = computed(() => Math.min(Math.max(model.value, 0), Math.max(props.count - 1, 0)))

function set(i: number) { if (i !== model.value) model.value = i }
function onKey(e: KeyboardEvent) {
  if (!miNavRoving(e, root.value, '[role=tab]', 'horizontal')) return
  const el = document.activeElement as HTMLElement | null
  const i = Number(el?.dataset.i)
  if (!Number.isNaN(i)) set(i)
}
</script>

<template>
  <div ref="root" class="mi-pc" role="tablist" :aria-label="ariaLabel" :style="{ '--i': index }" @keydown="onKey">
    <span class="mi-pc__thumb" aria-hidden="true" />
    <button
      v-for="n in count" :key="n" type="button" role="tab" class="mi-pc__dot"
      :data-i="n - 1" :aria-selected="index === n - 1" :aria-label="`${itemLabel} ${n}`" :tabindex="index === n - 1 ? 0 : -1"
      @click="set(n - 1)"
    ><span class="mi-pc__pip" /></button>
  </div>
</template>

<style scoped>
.mi-pc{position:relative;display:inline-flex;justify-content:flex-start;width:fit-content;max-width:100%;padding:0 8px;border-radius:999px;background:var(--mi-fill4);font-family:var(--mi-font)}
.mi-pc__dot{position:relative;width:24px;height:28px;border:0;padding:0;background:transparent;display:flex;align-items:center;justify-content:center;border-radius:999px}
.mi-pc__pip{width:8px;height:8px;border-radius:50%;background:var(--mi-fill);transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-pc__dot[aria-selected=true] .mi-pc__pip{opacity:0}
.mi-pc__thumb{position:absolute;left:8px;top:10px;width:24px;height:8px;pointer-events:none;transform:translate3d(calc(var(--i) * 24px),0,0);transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-pc__thumb::before{content:"";position:absolute;left:2px;right:2px;top:0;bottom:0;border-radius:999px;background:var(--mi-p)}
.mi-pc :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-2px}
</style>
