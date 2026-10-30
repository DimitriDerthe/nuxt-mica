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
  <div ref="root" class="mi-pg" :class="{ 'is-compact': fit < 0 }">
    <nav class="mi-pg__nav" :aria-label="ariaLabel">
      <button type="button" class="mi-pg__btn mi-pg__arrow" aria-label="Previous page" :disabled="current <= 1" @click="go(current - 1)">
        <MiNavGlyph name="back" :size="18" :stroke="2.4" />
      </button>
      <span v-if="fit < 0" class="mi-pg__compact" aria-hidden="true"><b>{{ current }}</b> / {{ total }}</span>
      <template v-for="(it, i) in items" :key="it === '…' ? `gap${i}` : it">
        <span v-if="it === '…'" class="mi-pg__gap" aria-hidden="true">…</span>
        <button
          v-else type="button" class="mi-pg__btn mi-pg__page" :class="{ 'is-on': it === current }"
          :aria-label="`Page ${it}`" :aria-current="it === current ? 'page' : undefined" @click="go(it)"
        ><span class="mi-pg__n">{{ it }}</span></button>
      </template>
      <button type="button" class="mi-pg__btn mi-pg__arrow" aria-label="Next page" :disabled="current >= total" @click="go(current + 1)">
        <MiNavGlyph name="forward" :size="18" :stroke="2.4" />
      </button>
    </nav>
    <span v-if="summary" class="mi-pg__sum" aria-live="polite">Page {{ current }} of {{ total }}</span>
  </div>
</template>

<style scoped>
.mi-pg{display:flex;flex-direction:column;gap:14px;min-width:0;max-width:100%;font-family:var(--mi-font)}
.mi-pg__nav{display:flex;align-items:center;gap:4px}
.mi-pg__btn{position:relative;min-width:36px;height:36px;padding:0 6px;border:0;border-radius:10px;background:transparent;color:var(--mi-label);font-size:15px;font-variant-numeric:tabular-nums;display:flex;align-items:center;justify-content:center;isolation:isolate;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-pg__btn::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--mi-fill4);opacity:0;z-index:-1;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-pg__btn:hover:not(:disabled)::before{opacity:1}
.mi-pg__btn:active:not(:disabled){transform:scale(.94)}
.mi-pg__arrow{width:36px;padding:0;color:var(--mi-p-text)}
.mi-pg__btn:disabled{color:var(--mi-label3);cursor:default}
.mi-pg__page::after{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--mi-p);opacity:0;transform:scale(.8);z-index:-1;transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-3) var(--mi-spring)}
.mi-pg__page.is-on{color:var(--mi-p-on);font-weight:600}
.mi-pg__page.is-on::after{opacity:1;transform:scale(1)}
.mi-pg__page.is-on::before{opacity:0}
.mi-pg__gap{min-width:24px;text-align:center;color:var(--mi-label2);font-size:15px}
.mi-pg__sum{font-size:13px;color:var(--mi-label2)}
.mi-pg__compact{min-width:64px;padding:0 6px;text-align:center;font-size:15px;font-variant-numeric:tabular-nums;color:var(--mi-label2);white-space:nowrap}
.mi-pg__compact b{font-weight:600;color:var(--mi-label)}
/* The compact row already shows the position: keep the caption for screen readers only. */
.is-compact .mi-pg__sum{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.mi-pg__btn:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
