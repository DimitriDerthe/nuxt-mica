<script setup lang="ts">
/** "On this page" outline: anchor links for page sections that highlight the one in view (scrollspy), with a sliding indicator and smooth scrolling on click; v-model:active is the active section id. */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useMiScrollspy } from '../../composables/useMiScrollspy'

export interface MiScrollspyItem { id: string, label: string, level?: number }

const props = withDefaults(defineProps<{
  /** Sections to link to: the element `id`, the link text and an optional nesting level (1 = top level, 2 = indented...). */
  items: MiScrollspyItem[]
  /** Height in px of a fixed header to keep clear when scrolling and when deciding which section is active. */
  offset?: number
  /** Custom IntersectionObserver rootMargin, overriding the one derived from `offset`. */
  rootMargin?: string
  /** Accessible name of the navigation. */
  ariaLabel?: string
}>(), { offset: 80, ariaLabel: 'On this page' })

/** Id of the active section. Follows the scroll position and is set immediately when a link is clicked. */

const model = defineModel<string | undefined>('active')

const ROW = 32
const ids = computed(() => props.items.map(i => i.id))
const { active } = useMiScrollspy(ids, { offset: props.offset, rootMargin: props.rootMargin })
let lockUntil = 0
let timer: ReturnType<typeof setTimeout> | undefined

watch(active, (id) => {
  if (id && Date.now() >= lockUntil) model.value = id
})
const index = computed(() => props.items.findIndex(i => i.id === model.value))

function go(e: MouseEvent, id: string) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null
  if (!el) return
  e.preventDefault()
  model.value = id
  lockUntil = Date.now() + 900
  clearTimeout(timer)
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  el.style.scrollMarginTop = `${props.offset}px`
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  try { history.replaceState(null, '', `#${id}`) } catch { /* unavailable */ }
  timer = setTimeout(() => { el.style.removeProperty('scroll-margin-top') }, 1000)
}
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <nav class="mi-ss" :aria-label="ariaLabel" :style="{ '--mi-ss-row': `${ROW}px` }">
    <ul class="mi-ss__list">
      <li v-if="index >= 0" class="mi-ss__ind" aria-hidden="true" :style="{ transform: `translate3d(0,${index * ROW}px,0)` }" />
      <li v-for="it in items" :key="it.id" class="mi-ss__li">
        <a
          class="mi-ss__link"
          :class="{ 'is-active': model === it.id }"
          :href="`#${it.id}`"
          :aria-current="model === it.id ? 'location' : undefined"
          :style="{ '--mi-ss-l': (it.level ?? 1) - 1 }"
          @click="go($event, it.id)"
        >{{ it.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.mi-ss{font-family:var(--mi-font)}
.mi-ss__list{position:relative;list-style:none;margin:0;padding:0 0 0 2px;box-shadow:inset 2px 0 0 var(--mi-sep2)}
.mi-ss__ind{position:absolute;left:0;top:0;width:2px;height:var(--mi-ss-row);border-radius:1px;background:var(--mi-p);transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-ss__li{list-style:none;height:var(--mi-ss-row)}
.mi-ss__link{display:block;height:var(--mi-ss-row);line-height:var(--mi-ss-row);padding:0 8px 0 calc(14px + var(--mi-ss-l) * 14px);font-size:14px;color:var(--mi-label2);text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-radius:0 8px 8px 0}
.mi-ss__link:hover{color:var(--mi-label)}
.mi-ss__link.is-active{color:var(--mi-p-text);font-weight:600}
.mi-ss__link:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-2px}
</style>
