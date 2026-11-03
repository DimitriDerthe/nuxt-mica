<script setup lang="ts">
/** Page navigator with arrows, windowed page numbers and ellipses; v-model is the 1-based current page. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'
import { miPageRange, miPagerWidth } from '../../utils/miNav'

const props = withDefaults(defineProps<{
  /** Total number of pages. */
  total: number
  /** Page numbers shown on each side of the current page before the rest collapse into ellipses. */
  siblings?: number
  /** Show the "Page x of y" caption. */
  summary?: boolean
  /** `auto` drops sibling pages, then switches to the "3 / 24" form, when the row does not fit its container. `true` always uses that form, `false` never adapts. */
  compact?: boolean | 'auto'
  /** Accessible name of the pagination landmark. */
  ariaLabel?: string
}>(), { siblings: 1, summary: true, compact: 'auto', ariaLabel: 'Pagination' })

/** Current page, 1-based. */

const page = defineModel<number>({ default: 1 })
const current = computed(() => Math.min(Math.max(page.value, 1), Math.max(props.total, 1)))

// Width available to the pager: its container's content box, read once mounted (SSR renders the full row).
const root = ref<HTMLElement | null>(null)
const room = ref(Infinity)
let ro: ResizeObserver | null = null
onMounted(() => {
  const host = root.value?.parentElement
  if (!host || typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver(([e]) => { if (e) room.value = e.contentRect.width })
  ro.observe(host)
})
onBeforeUnmount(() => ro?.disconnect())

/** Siblings that fit, or -1 for the compact form. */
const fit = computed(() => {
  if (props.compact === true) return -1
  if (props.compact === false) return props.siblings
  for (let s = props.siblings; s >= 0; s--) if (miPagerWidth(props.total, s) <= room.value) return s
  return -1
})
const items = computed(() => (fit.value < 0 ? [] : miPageRange(current.value, props.total, fit.value)))

function go(n: number) {
  const v = Math.min(Math.max(n, 1), props.total)
  if (v !== page.value) page.value = v
}
</script>

<template>
  <div ref="root" class="mi-pg mi:flex-col mi:min-w-0 mi:max-w-full mi:font-mi" :class="{ 'is-compact': fit < 0 }">
    <nav class="mi-pg__nav mi:flex mi:items-center mi:gap-1" :aria-label="ariaLabel">
      <button type="button" class="mi-pg__btn mi-pg__arrow mi:relative mi:min-w-9 mi:h-9 mi:[border:0] mi:rounded-[10px] mi:bg-transparent mi:text-label mi:text-[15px] mi:tabular-nums mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.94)] mi:w-9 mi:text-p-text mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]" aria-label="Previous page" :disabled="current <= 1" @click="go(current - 1)">
        <MiNavGlyph name="back" :size="18" :stroke="2.4" />
      </button>
      <span v-if="fit < 0" class="mi-pg__compact mi:min-w-16 mi:py-0 mi:px-1.5 mi:text-center mi:text-[15px] mi:tabular-nums mi:text-label2 mi:whitespace-nowrap" aria-hidden="true"><b class="mi:[.mi-pg__compact_&]:font-semibold mi:[.mi-pg__compact_&]:text-label">{{ current }}</b> / {{ total }}</span>
      <template v-for="(it, i) in items" :key="it === '…' ? `gap${i}` : it">
        <span v-if="it === '…'" class="mi-pg__gap mi:min-w-6 mi:text-center mi:text-label2 mi:text-[15px]" aria-hidden="true">…</span>
        <button
          v-else type="button" class="mi-pg__btn mi-pg__page mi:relative mi:min-w-9 mi:h-9 mi:[border:0] mi:rounded-[10px] mi:bg-transparent mi:text-label mi:text-[15px] mi:tabular-nums mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.94)] mi:disabled:cursor-default mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:bg-p mi:after:opacity-0 mi:after:transform-[scale(.8)] mi:after:-z-1 mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-on]:font-semibold mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-[scale(1)] mi:[&.is-on]:before:opacity-0 mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-on': it === current }"
          :aria-label="`Page ${it}`" :aria-current="it === current ? 'page' : undefined" @click="go(it)"
        ><span class="mi-pg__n">{{ it }}</span></button>
      </template>
      <button type="button" class="mi-pg__btn mi-pg__arrow mi:relative mi:min-w-9 mi:h-9 mi:[border:0] mi:rounded-[10px] mi:bg-transparent mi:text-label mi:text-[15px] mi:tabular-nums mi:flex mi:items-center mi:justify-center mi:isolate mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:before:content-[''] mi:before:absolute mi:before:inset-0 mi:before:rounded-[inherit] mi:before:bg-fill4 mi:before:opacity-0 mi:before:-z-1 mi:before:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:before:opacity-100 mi:[&:active:not(:disabled)]:transform-[scale(.94)] mi:w-9 mi:text-p-text mi:disabled:cursor-default mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[2px]" aria-label="Next page" :disabled="current >= total" @click="go(current + 1)">
        <MiNavGlyph name="forward" :size="18" :stroke="2.4" />
      </button>
    </nav>
    <span v-if="summary" class="mi-pg__sum mi:text-[13px] mi:text-label2 mi:[.is-compact_&]:absolute mi:[.is-compact_&]:w-px mi:[.is-compact_&]:h-px mi:[.is-compact_&]:overflow-hidden mi:[.is-compact_&]:[clip-path:inset(50%)] mi:[.is-compact_&]:whitespace-nowrap" aria-live="polite">Page {{ current }} of {{ total }}</span>
  </div>
</template>

<style scoped>
.mi-pg{display:flex;gap:14px}
.mi-pg__btn{padding:0 6px}
.mi-pg__arrow{padding:0}
.mi-pg__btn:disabled{color:var(--mi-label3)}
.mi-pg__page.is-on{color:var(--mi-p-on)}
</style>
