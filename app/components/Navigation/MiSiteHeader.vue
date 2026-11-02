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
  <header ref="root" class="mi-sh" :class="{ 'is-sticky': sticky, 'is-open': open }" @keydown="onKey">
    <div class="mi-sh__bar">
      <div class="mi-sh__logo"><slot name="logo" /></div>
      <nav class="mi-sh__nav" :aria-label="ariaLabel">
        <ul class="mi-sh__list">
          <li v-for="l in links" :key="l.label" class="mi-sh__li">
            <MiMenu
              v-if="l.children?.length" :items="menuItems(l)" :label="l.label" :aria-label="l.label"
              @select="onSelect(l, $event)"
            >
              <template #trigger="{ props: tp, open: isOpen }">
                <button v-bind="tp" type="button" class="mi-sh__link mi-sh__drop" :class="{ 'is-active': l.active || l.children.some(c => c.active), 'is-open': isOpen }">
                  {{ l.label }}
                  <svg class="mi-sh__chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </button>
              </template>
            </MiMenu>
            <slot v-else name="link" :link="l" class="mi-sh__link">
              <a class="mi-sh__link" :class="{ 'is-active': l.active }" :href="dest(l)" :aria-current="l.active ? 'page' : undefined" @click="emit('navigate', l)">{{ l.label }}</a>
            </slot>
          </li>
        </ul>
      </nav>
      <div class="mi-sh__actions"><slot name="actions" /></div>
      <button
        ref="burger" type="button" class="mi-sh__burger" :aria-expanded="open" :aria-controls="`${uid}-panel`"
        :aria-label="open ? 'Close menu' : 'Open menu'" @click="open = !open"
      >
        <span class="mi-sh__bars" aria-hidden="true"><span /><span /></span>
      </button>
    </div>
    <div :id="`${uid}-panel`" ref="panel" class="mi-sh__panel" :inert="!open || undefined">
      <div class="mi-sh__panel-in">
        <nav :aria-label="`${ariaLabel} (mobile)`">
          <ul class="mi-sh__mlist">
            <li v-for="l in links" :key="l.label">
              <template v-if="l.children?.length">
                <p class="mi-sh__mgroup">{{ l.label }}</p>
                <ul class="mi-sh__mlist mi-sh__mlist--sub">
                  <li v-for="c in l.children" :key="c.label">
                    <a class="mi-sh__mlink" :class="{ 'is-active': c.active }" :href="dest(c)" :aria-current="c.active ? 'page' : undefined" @click="onLink(c)">{{ c.label }}</a>
                  </li>
                </ul>
              </template>
              <a v-else class="mi-sh__mlink" :class="{ 'is-active': l.active }" :href="dest(l)" :aria-current="l.active ? 'page' : undefined" @click="onLink(l)">{{ l.label }}</a>
            </li>
          </ul>
        </nav>
        <div class="mi-sh__mactions"><slot name="actions" /></div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.mi-sh{container:mi-sh / inline-size;position:relative;z-index:20;font-family:var(--mi-font);color:var(--mi-label);background:var(--mi-page);border-bottom:1px solid var(--mi-sep)}
.mi-sh.is-sticky{position:sticky;top:0;background:var(--mi-mat);-webkit-backdrop-filter:saturate(180%) blur(20px);backdrop-filter:saturate(180%) blur(20px);border-bottom-color:var(--mi-mat-b)}
.mi-sh__bar{display:flex;align-items:center;gap:12px;min-height:64px;padding:0 16px;box-sizing:border-box}
.mi-sh__logo{display:flex;align-items:center;flex:1 1 auto;min-width:0}
.mi-sh__nav{display:none}
.mi-sh__actions{display:none;align-items:center;gap:8px}
.mi-sh__list{list-style:none;margin:0;padding:0;display:flex;align-items:center;gap:2px}
.mi-sh__li{display:flex}
.mi-sh__link{position:relative;display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 12px;border:0;border-radius:10px;background:transparent;font:inherit;font-size:15px;font-weight:500;color:var(--mi-label2);text-decoration:none;cursor:pointer}
.mi-sh__link:hover{color:var(--mi-label);background:var(--mi-fill4)}
.mi-sh__link::after{content:'';position:absolute;left:12px;right:12px;bottom:4px;height:2px;border-radius:1px;background:var(--mi-p);transform:scaleX(0);transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-sh__link.is-active{color:var(--mi-label)}
.mi-sh__link.is-active::after{transform:scaleX(1)}
.mi-sh__chev{transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-sh__drop.is-open .mi-sh__chev{transform:rotate(180deg)}
.mi-sh__link:focus-visible,.mi-sh__burger:focus-visible,.mi-sh__mlink:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:1px}
.mi-sh__burger{flex:none;width:44px;height:44px;margin-right:-8px;border:0;border-radius:12px;background:transparent;color:var(--mi-label);display:flex;align-items:center;justify-content:center;cursor:pointer}
.mi-sh__burger:hover{background:var(--mi-fill4)}
.mi-sh__bars{position:relative;width:20px;height:14px}
.mi-sh__bars span{position:absolute;left:0;right:0;top:6px;height:2px;border-radius:1px;background:currentColor;transition:transform var(--mi-dur-2) var(--mi-ease)}
.mi-sh__bars span:first-child{transform:translate3d(0,-4px,0)}
.mi-sh__bars span:last-child{transform:translate3d(0,4px,0)}
.is-open .mi-sh__bars span:first-child{transform:rotate(45deg)}
.is-open .mi-sh__bars span:last-child{transform:rotate(-45deg)}
.mi-sh__panel{display:grid;grid-template-rows:0fr;visibility:hidden;transition:visibility 0s linear var(--mi-dur-3)}
.is-open .mi-sh__panel{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.mi-sh__panel-in{min-height:0;overflow:hidden}
.mi-sh__panel-in > nav{padding:4px 16px 0}
.mi-sh__mlist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.mi-sh__mlist--sub{padding-left:12px;margin-bottom:6px;border-left:2px solid var(--mi-sep2)}
.mi-sh__mgroup{margin:10px 0 2px;padding:0 12px;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--mi-label2)}
.mi-sh__mlink{display:flex;align-items:center;min-height:44px;padding:0 12px;border-radius:10px;font-size:16px;font-weight:500;color:var(--mi-label);text-decoration:none}
.mi-sh__mlink:hover{background:var(--mi-fill4)}
.mi-sh__mlink.is-active{background:var(--mi-p-tint);color:var(--mi-p-text)}
.mi-sh__mactions{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px 16px}
.mi-sh__mactions:empty{display:none}
@container mi-sh (min-width:820px){
  .mi-sh__bar{padding:0 24px}
  .mi-sh__logo{flex:none}
  .mi-sh__nav{display:block;flex:1 1 auto;margin-left:16px}
  .mi-sh__actions{display:flex}
  .mi-sh__burger,.mi-sh__panel{display:none}
}
</style>
