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
  <div ref="root" class="mi-pc mi:[justify-content:flex-start]" role="tablist" :aria-label="ariaLabel" :style="{ '--i': index }" @keydown="onKey">
    <span class="mi-pc__thumb mi:absolute mi:left-2 mi:top-2.5 mi:w-6 mi:h-2 mi:pointer-events-none mi:transform-[translate3d(calc(var(--i)_*_24px),0,0)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:before:content-[''] mi:before:absolute mi:before:left-0.5 mi:before:right-0.5 mi:before:top-0 mi:before:bottom-0 mi:before:rounded-[999px] mi:before:bg-p" aria-hidden="true" />
    <button
      v-for="n in count" :key="n" type="button" role="tab" class="mi-pc__dot mi:relative mi:w-6 mi:h-7 mi:[border:0] mi:p-0 mi:bg-transparent mi:flex mi:items-center mi:justify-center mi:rounded-[999px]"
      :data-i="n - 1" :aria-selected="index === n - 1" :aria-label="`${itemLabel} ${n}`" :tabindex="index === n - 1 ? 0 : -1"
      @click="set(n - 1)"
    ><span class="mi-pc__pip mi:w-2 mi:h-2 mi:rounded-[50%] mi:bg-fill mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-pc__dot[aria-selected=true]_&]:opacity-0" /></button>
  </div>
</template>

<style scoped>
.mi-pc{position:relative;display:inline-flex;width:fit-content;max-width:100%;padding:0 8px;border-radius:999px;background:var(--mi-fill4);font-family:var(--mi-font)}
.mi-pc :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-2px}
</style>
