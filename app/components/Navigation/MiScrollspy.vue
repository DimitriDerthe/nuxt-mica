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
  <nav class="mi-ss mi:font-mi" :aria-label="ariaLabel" :style="{ '--mi-ss-row': `${ROW}px` }">
    <ul class="mi-ss__list mi:relative mi:[list-style:none] mi:m-0 mi:pt-0 mi:pr-0 mi:pb-0 mi:pl-0.5 mi:shadow-[inset_2px_0_0_var(--mi-sep2)]">
      <li v-if="index >= 0" class="mi-ss__ind mi:absolute mi:left-0 mi:top-0 mi:w-0.5 mi:h-(--mi-ss-row) mi:rounded-[1px] mi:bg-p mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" aria-hidden="true" :style="{ transform: `translate3d(0,${index * ROW}px,0)` }" />
      <li v-for="it in items" :key="it.id" class="mi-ss__li mi:[list-style:none] mi:h-(--mi-ss-row)">
        <a
          class="mi-ss__link mi:block mi:h-(--mi-ss-row) mi:leading-(--mi-ss-row) mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-[calc(14px_+_var(--mi-ss-l)_*_14px)] mi:text-[14px] mi:text-label2 mi:[text-decoration:none] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis mi:rounded-[0_8px_8px_0] mi:[&.is-active]:font-semibold mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-2px]"
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
.mi-ss__link:hover{color:var(--mi-label)}
.mi-ss__link.is-active{color:var(--mi-p-text)}
</style>
