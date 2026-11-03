<script setup lang="ts">
/** Marketing site header: logo, primary links (with dropdowns), actions and a mobile burger that opens an inline panel; collapses under 820px of its own width, optionally sticky. */
import { nextTick, onMounted, ref, useId, watch } from 'vue'
import MiMenu from '../Buttons/MiMenu.vue'
import type { MiMenuItem } from '../../utils/miMenu'

export interface MiSiteLink {
  label: string
  /** Destination URL. */
  href?: string
  /** Route path; rendered as a plain anchor unless you provide the `link` slot. */
  to?: string
  /** Marks the current page. */
  active?: boolean
  /** Sub-links, shown as a dropdown on desktop and as a nested list in the mobile panel. */
  children?: MiSiteLink[]
}

defineSlots<{
  /** Brand area on the left, usually a logo wrapped in a link. */
  logo?(): unknown
  /** Call-to-action buttons on the right; also repeated at the bottom of the mobile panel. */
  actions?(): unknown
  /** Custom link renderer, e.g. to output NuxtLink. Receives the link and its CSS class. */
  link?(props: { link: MiSiteLink, class: string }): unknown
}>()

const props = withDefaults(defineProps<{
  /** Primary navigation entries. */
  links?: MiSiteLink[]
  /** Keep the header fixed at the top of the viewport while scrolling, on a translucent blurred surface. */
  sticky?: boolean
  /** Accessible name of the main navigation. */
  ariaLabel?: string
}>(), { links: () => [], ariaLabel: 'Main' })

/** Whether the mobile panel is open. */

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ navigate: [link: MiSiteLink] }>()

const uid = `mi-sh-${useId()}`
const root = ref<HTMLElement | null>(null)
const burger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
let ready = false
onMounted(() => { ready = true })

const dest = (l: MiSiteLink) => l.href ?? l.to
const menuItems = (l: MiSiteLink): MiMenuItem[] => (l.children ?? []).map(c => ({ value: dest(c) ?? c.label, label: c.label, checked: c.active || undefined }))
function onSelect(parent: MiSiteLink, item: MiMenuItem) {
  const c = parent.children?.find(x => (dest(x) ?? x.label) === item.value)
  if (!c) return
  emit('navigate', c)
  const url = dest(c)
  if (url && typeof window !== 'undefined') window.location.assign(url)
}

watch(open, async (v) => {
  const el = panel.value
  if (v) {
    await nextTick()
    panel.value?.querySelector<HTMLElement>('a,button')?.focus()
  }
  if (!ready || !el || typeof el.animate !== 'function') return
  if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches) return
  el.animate({ gridTemplateRows: v ? ['0fr', '1fr'] : ['1fr', '0fr'] }, { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' })
})

function close(restoreFocus = false) {
  if (!open.value) return
  open.value = false
  if (restoreFocus) burger.value?.focus()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) { e.preventDefault(); close(true) }
}
function onLink(l: MiSiteLink) {
  emit('navigate', l)
  close()
}
</script>

<template>
  <header ref="root" class="mi-sh mi:@container/mi-sh mi:relative mi:z-20 mi:font-mi mi:text-label mi:bg-page mi:border-b mi:border-b-sep mi:[&.is-sticky]:sticky mi:[&.is-sticky]:top-0 mi:[&.is-sticky]:bg-mat mi:[&.is-sticky]:border-b-mat-b" :class="{ 'is-sticky': sticky, 'is-open': open }" @keydown="onKey">
    <div class="mi-sh__bar mi:flex mi:items-center mi:gap-3 mi:min-h-16 mi:py-0 mi:px-4 mi:box-border mi:@[820px]/mi-sh:py-0 mi:@[820px]/mi-sh:px-6">
      <div class="mi-sh__logo mi:flex mi:items-center mi:flex-[1_1_auto] mi:min-w-0 mi:@[820px]/mi-sh:flex-[none]"><slot name="logo" /></div>
      <nav class="mi-sh__nav mi:hidden mi:@[820px]/mi-sh:block mi:@[820px]/mi-sh:flex-[1_1_auto] mi:@[820px]/mi-sh:ml-4" :aria-label="ariaLabel">
        <ul class="mi-sh__list mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:items-center mi:gap-0.5">
          <li v-for="l in links" :key="l.label" class="mi-sh__li mi:flex">
            <MiMenu
              v-if="l.children?.length" :items="menuItems(l)" :label="l.label" :aria-label="l.label"
              @select="onSelect(l, $event)"
            >
              <template #trigger="{ props: tp, open: isOpen }">
                <button v-bind="tp" type="button" class="mi-sh__link mi-sh__drop mi:relative mi:inline-flex mi:items-center mi:gap-[5px] mi:h-10 mi:py-0 mi:px-3 mi:[border:0] mi:bg-transparent mi:text-label2 mi:[text-decoration:none] mi:cursor-pointer mi:hover:bg-fill4 mi:after:content-[''] mi:after:absolute mi:after:left-3 mi:after:right-3 mi:after:bottom-1 mi:after:h-0.5 mi:after:bg-p mi:after:transform-[scaleX(0)] mi:after:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-active]:after:transform-[scaleX(1)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-active': l.active || l.children.some(c => c.active), 'is-open': isOpen }">
                  {{ l.label }}
                  <svg class="mi-sh__chev mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-sh__drop.is-open_&]:transform-[rotate(180deg)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </button>
              </template>
            </MiMenu>
            <slot v-else name="link" :link="l" class="mi-sh__link">
              <a class="mi-sh__link mi:relative mi:inline-flex mi:items-center mi:gap-[5px] mi:h-10 mi:py-0 mi:px-3 mi:[border:0] mi:bg-transparent mi:text-label2 mi:[text-decoration:none] mi:cursor-pointer mi:hover:bg-fill4 mi:after:content-[''] mi:after:absolute mi:after:left-3 mi:after:right-3 mi:after:bottom-1 mi:after:h-0.5 mi:after:bg-p mi:after:transform-[scaleX(0)] mi:after:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-active]:after:transform-[scaleX(1)] mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px]" :class="{ 'is-active': l.active }" :href="dest(l)" :aria-current="l.active ? 'page' : undefined" @click="emit('navigate', l)">{{ l.label }}</a>
            </slot>
          </li>
        </ul>
      </nav>
      <div class="mi-sh__actions mi:hidden mi:items-center mi:gap-2 mi:@[820px]/mi-sh:flex"><slot name="actions" /></div>
      <button
        ref="burger" type="button" class="mi-sh__burger mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px] mi:flex-[none] mi:w-11 mi:h-11 mi:-mr-2 mi:[border:0] mi:rounded-[12px] mi:bg-transparent mi:text-label mi:flex mi:items-center mi:justify-center mi:cursor-pointer mi:hover:bg-fill4 mi:@[820px]/mi-sh:hidden" :aria-expanded="open" :aria-controls="`${uid}-panel`"
        :aria-label="open ? 'Close menu' : 'Open menu'" @click="open = !open"
      >
        <span class="mi-sh__bars mi:relative mi:w-5 mi:h-3.5" aria-hidden="true"><span class="mi:[.mi-sh__bars_&]:absolute mi:[.mi-sh__bars_&]:left-0 mi:[.mi-sh__bars_&]:right-0 mi:[.mi-sh__bars_&]:top-1.5 mi:[.mi-sh__bars_&]:h-0.5 mi:[.mi-sh__bars_&]:rounded-[1px] mi:[.mi-sh__bars_&]:bg-current mi:[.mi-sh__bars_&]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-sh__bars_&:first-child]:transform-[translate3d(0,-4px,0)] mi:[.mi-sh__bars_&:last-child]:transform-[translate3d(0,4px,0)] mi:[.is-open_.mi-sh__bars_&:first-child]:transform-[rotate(45deg)] mi:[.is-open_.mi-sh__bars_&:last-child]:transform-[rotate(-45deg)]" /><span class="mi:[.mi-sh__bars_&]:absolute mi:[.mi-sh__bars_&]:left-0 mi:[.mi-sh__bars_&]:right-0 mi:[.mi-sh__bars_&]:top-1.5 mi:[.mi-sh__bars_&]:h-0.5 mi:[.mi-sh__bars_&]:rounded-[1px] mi:[.mi-sh__bars_&]:bg-current mi:[.mi-sh__bars_&]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-sh__bars_&:first-child]:transform-[translate3d(0,-4px,0)] mi:[.mi-sh__bars_&:last-child]:transform-[translate3d(0,4px,0)] mi:[.is-open_.mi-sh__bars_&:first-child]:transform-[rotate(45deg)] mi:[.is-open_.mi-sh__bars_&:last-child]:transform-[rotate(-45deg)]" /></span>
      </button>
    </div>
    <div :id="`${uid}-panel`" ref="panel" class="mi-sh__panel mi:grid mi:grid-rows-[0fr] mi:invisible mi:[transition:visibility_0s_linear_var(--mi-dur-3)] mi:[.is-open_&]:grid-rows-[1fr] mi:[.is-open_&]:visible mi:[.is-open_&]:delay-[0s] mi:@[820px]/mi-sh:hidden" :inert="!open || undefined">
      <div class="mi-sh__panel-in mi:min-h-0 mi:overflow-hidden">
        <nav class="mi:[.mi-sh__panel-in>&]:pt-1 mi:[.mi-sh__panel-in>&]:px-4 mi:[.mi-sh__panel-in>&]:pb-0" :aria-label="`${ariaLabel} (mobile)`">
          <ul class="mi-sh__mlist mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:flex-col">
            <li v-for="l in links" :key="l.label">
              <template v-if="l.children?.length">
                <p class="mi-sh__mgroup mi:mt-2.5 mi:mx-0 mi:mb-0.5 mi:py-0 mi:px-3 mi:text-[12px] mi:font-semibold mi:tracking-[.06em] mi:uppercase mi:text-label2">{{ l.label }}</p>
                <ul class="mi-sh__mlist mi-sh__mlist--sub mi:[list-style:none] mi:m-0 mi:p-0 mi:flex mi:flex-col mi:pl-3 mi:mb-1.5 mi:border-l-2 mi:border-l-sep2">
                  <li v-for="c in l.children" :key="c.label">
                    <a class="mi-sh__mlink mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px] mi:flex mi:items-center mi:min-h-11 mi:py-0 mi:px-3 mi:rounded-[10px] mi:text-[16px] mi:font-medium mi:text-label mi:[text-decoration:none] mi:[&.is-active]:text-p-text" :class="{ 'is-active': c.active }" :href="dest(c)" :aria-current="c.active ? 'page' : undefined" @click="onLink(c)">{{ c.label }}</a>
                  </li>
                </ul>
              </template>
              <a v-else class="mi-sh__mlink mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[1px] mi:flex mi:items-center mi:min-h-11 mi:py-0 mi:px-3 mi:rounded-[10px] mi:text-[16px] mi:font-medium mi:text-label mi:[text-decoration:none] mi:[&.is-active]:text-p-text" :class="{ 'is-active': l.active }" :href="dest(l)" :aria-current="l.active ? 'page' : undefined" @click="onLink(l)">{{ l.label }}</a>
            </li>
          </ul>
        </nav>
        <div class="mi-sh__mactions mi:flex mi:flex-wrap mi:gap-2 mi:pt-3 mi:px-4 mi:pb-4 mi:empty:hidden"><slot name="actions" /></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mi-sh.is-sticky{-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px)}
.mi-sh__link{border-radius:10px;font:inherit;font-size:15px;font-weight:500}
.mi-sh__link:hover{color:var(--mi-label)}
.mi-sh__link::after{border-radius:1px}
.mi-sh__link.is-active{color:var(--mi-label)}
.mi-sh__mlink:hover{background:var(--mi-fill4)}
.mi-sh__mlink.is-active{background:var(--mi-p-tint)}
</style>
