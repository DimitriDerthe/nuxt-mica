<script setup lang="ts">
/** Top navigation bar whose entries are plain links or triggers for flyout panels of titled links, opened on hover or click and shown in a shared viewport; v-model is the open item id. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { miNavRoving } from '../../utils/miNav'
import { miSafeHref } from '../../utils/miSafe'

export interface MiNavigationLink { title: string, description?: string, href: string }
export interface MiNavigationItem { id: string, label: string, href?: string, links?: MiNavigationLink[] }

const props = withDefaults(defineProps<{
  /** Entries: with `links` they open a flyout, otherwise they are plain links to `href`. */
  items: MiNavigationItem[]
  /** Accessible name of the navigation. */
  ariaLabel?: string
  /** Show every flyout in one shared panel under the bar (true) or anchored under its own trigger (false). */
  viewport?: boolean
  /** Open flyouts on pointer hover as well as on click. */
  hover?: boolean
  /** Close delay in ms after the pointer leaves. */
  closeDelay?: number
}>(), { ariaLabel: 'Main', viewport: true, hover: true, closeDelay: 150 })

/** Value of the open menu item, empty when all are closed. */

const model = defineModel<string | undefined>()
const emit = defineEmits<{ navigate: [link: MiNavigationLink] }>()
const root = ref<HTMLElement | null>(null)
const shown = ref<string | undefined>(model.value)
let timer: ReturnType<typeof setTimeout> | undefined
const active = computed(() => props.items.find(i => i.id === model.value))
const last = computed(() => props.items.find(i => i.id === shown.value))

function setOpen(id: string | undefined) {
  clearTimeout(timer)
  model.value = id
  if (id) shown.value = id
}
function cancelClose() { clearTimeout(timer) }
function toggle(id: string) { setOpen(model.value === id ? undefined : id) }
function enter(id: string | undefined, hasLinks: boolean) {
  if (!props.hover) return
  clearTimeout(timer)
  if (hasLinks && id) setOpen(id)
  else if (model.value) setOpen(undefined)
}
function leave() {
  if (!props.hover) return
  clearTimeout(timer)
  timer = setTimeout(() => { model.value = undefined }, props.closeDelay)
}
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key === 'Escape' && model.value) {
    const id = model.value
    setOpen(undefined)
    root.value?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.focus()
    return
  }
  if (e.key === 'ArrowDown' && t.dataset.id) {
    e.preventDefault()
    setOpen(t.dataset.id)
    setTimeout(() => root.value?.querySelector<HTMLElement>('.mi-nm__panel.is-open a')?.focus(), 0)
    return
  }
  miNavRoving(e, root.value, '.mi-nm__top', 'horizontal')
}
function onOutside(e: PointerEvent) { if (model.value && !root.value?.contains(e.target as Node)) setOpen(undefined) }
onMounted(() => document.addEventListener('pointerdown', onOutside, true))
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onOutside, true); clearTimeout(timer) })
</script>

<template>
  <nav ref="root" class="mi-nm mi:font-mi mi:text-label mi:relative" :aria-label="ariaLabel" @keydown="onKey" @pointerleave="leave">
    <ul class="mi-nm__list mi:flex mi:gap-0.5 mi:m-0 mi:p-0 mi:[list-style:none]">
      <li v-for="it in items" :key="it.id" class="mi-nm__li mi:relative" @pointerenter="enter(it.id, !!it.links)">
        <button
          v-if="it.links" type="button" class="mi-nm__top mi:inline-flex mi:items-center mi:gap-1 mi:h-9 mi:py-0 mi:px-3.5 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:[text-decoration:none] mi:cursor-pointer mi:hover:bg-fill3 mi:aria-expanded:bg-fill3 mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-1px]" :data-id="it.id" :aria-expanded="model === it.id"
          :aria-controls="`mi-nm-${it.id}`" @click="toggle(it.id)"
        >
          {{ it.label }}
          <svg class="mi-nm__chev mi:w-3 mi:h-3 mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:[.mi-nm__top[aria-expanded='true']_&]:transform-[rotate(180deg)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <a v-else class="mi-nm__top mi:inline-flex mi:items-center mi:gap-1 mi:h-9 mi:py-0 mi:px-3.5 mi:[border:0] mi:rounded-[8px] mi:bg-transparent mi:text-label mi:[text-decoration:none] mi:cursor-pointer mi:hover:bg-fill3 mi:aria-expanded:bg-fill3 mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-1px]" :href="miSafeHref(it.href)">{{ it.label }}</a>
        <div
          v-if="it.links && !viewport" :id="`mi-nm-${it.id}`" class="mi-nm__panel mi-nm__panel--anchored mi:absolute mi:top-full mi:left-0 mi:z-50 mi:flex mi:flex-col mi:gap-0.5 mi:min-w-65 mi:mt-1.5 mi:p-1.5 mi:rounded-[14px] mi:bg-mat mi:shadow-[var(--mi-sh3),inset_0_0_0_.5px_var(--mi-mat-b)] mi:opacity-0 mi:transform-[translate3d(0,-4px,0)_scale(.97)] mi:origin-[0_0] mi:invisible mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-3)_var(--mi-spring),visibility_0s_linear_var(--mi-dur-2)] mi:before:content-[''] mi:before:absolute mi:before:left-0 mi:before:right-0 mi:before:-top-2 mi:before:h-2 mi:[&.is-open]:opacity-100 mi:[&.is-open]:transform-none mi:[&.is-open]:visible mi:[&.is-open]:pointer-events-auto mi:[&.is-open]:delay-[0s]"
          :class="{ 'is-open': model === it.id }" :inert="model !== it.id || undefined" @pointerenter="enter(it.id, true)"
        >
          <a v-for="l in it.links" :key="l.href" class="mi-nm__link mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-1px] mi:flex mi:flex-col mi:gap-0.5 mi:py-2 mi:px-2.5 mi:rounded-[8px] mi:text-label mi:[text-decoration:none]" :href="miSafeHref(l.href)" @click="emit('navigate', l)">
            <span class="mi-nm__title mi:text-[14px] mi:font-semibold">{{ l.title }}</span>
            <span v-if="l.description" class="mi-nm__desc mi:text-[13px] mi:text-label2">{{ l.description }}</span>
          </a>
        </div>
      </li>
    </ul>
    <div
      v-if="viewport && last?.links" :id="`mi-nm-${last.id}`" class="mi-nm__panel mi-nm__viewport mi:absolute mi:top-full mi:left-0 mi:z-50 mi:flex mi:flex-col mi:gap-0.5 mi:min-w-65 mi:mt-1.5 mi:p-1.5 mi:rounded-[14px] mi:bg-mat mi:shadow-[var(--mi-sh3),inset_0_0_0_.5px_var(--mi-mat-b)] mi:opacity-0 mi:transform-[translate3d(0,-4px,0)_scale(.97)] mi:origin-[0_0] mi:invisible mi:pointer-events-none mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-3)_var(--mi-spring),visibility_0s_linear_var(--mi-dur-2)] mi:before:content-[''] mi:before:absolute mi:before:left-0 mi:before:right-0 mi:before:-top-2 mi:before:h-2 mi:[&.is-open]:opacity-100 mi:[&.is-open]:transform-none mi:[&.is-open]:visible mi:[&.is-open]:pointer-events-auto mi:[&.is-open]:delay-[0s]"
      :class="{ 'is-open': !!active }" :inert="!active || undefined" @pointerenter="cancelClose"
    >
      <a v-for="l in last.links" :key="l.href" class="mi-nm__link mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-1px] mi:flex mi:flex-col mi:gap-0.5 mi:py-2 mi:px-2.5 mi:rounded-[8px] mi:text-label mi:[text-decoration:none]" :href="miSafeHref(l.href)" @click="emit('navigate', l)">
        <span class="mi-nm__title mi:text-[14px] mi:font-semibold">{{ l.title }}</span>
        <span v-if="l.description" class="mi-nm__desc mi:text-[13px] mi:text-label2">{{ l.description }}</span>
      </a>
    </div>
  </nav>
</template>

<style scoped>
.mi-nm{display:inline-block}
.mi-nm__top{font:inherit;font-size:14px;font-weight:500}
.mi-nm__panel{-webkit-backdrop-filter:saturate(180%) blur(24px);backdrop-filter:saturate(180%) blur(24px)}
.mi-nm__link:hover,.mi-nm__link:focus{background:var(--mi-fill3)}
</style>
