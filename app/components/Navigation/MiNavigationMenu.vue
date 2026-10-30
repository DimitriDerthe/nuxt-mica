<script setup lang="ts">
/** Top navigation bar whose entries are plain links or triggers for flyout panels of titled links, opened on hover or click and shown in a shared viewport; v-model is the open item id. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { miNavRoving } from '../../utils/miNav'

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
  <nav ref="root" class="mi-nm" :aria-label="ariaLabel" @keydown="onKey" @pointerleave="leave">
    <ul class="mi-nm__list">
      <li v-for="it in items" :key="it.id" class="mi-nm__li" @pointerenter="enter(it.id, !!it.links)">
        <button
          v-if="it.links" type="button" class="mi-nm__top" :data-id="it.id" :aria-expanded="model === it.id"
          :aria-controls="`mi-nm-${it.id}`" @click="toggle(it.id)"
        >
          {{ it.label }}
          <svg class="mi-nm__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <a v-else class="mi-nm__top" :href="it.href">{{ it.label }}</a>
        <div
          v-if="it.links && !viewport" :id="`mi-nm-${it.id}`" class="mi-nm__panel mi-nm__panel--anchored"
          :class="{ 'is-open': model === it.id }" :inert="model !== it.id || undefined" @pointerenter="enter(it.id, true)"
        >
          <a v-for="l in it.links" :key="l.href" class="mi-nm__link" :href="l.href" @click="emit('navigate', l)">
            <span class="mi-nm__title">{{ l.title }}</span>
            <span v-if="l.description" class="mi-nm__desc">{{ l.description }}</span>
          </a>
        </div>
      </li>
    </ul>
    <div
      v-if="viewport && last?.links" :id="`mi-nm-${last.id}`" class="mi-nm__panel mi-nm__viewport"
      :class="{ 'is-open': !!active }" :inert="!active || undefined" @pointerenter="cancelClose"
    >
      <a v-for="l in last.links" :key="l.href" class="mi-nm__link" :href="l.href" @click="emit('navigate', l)">
        <span class="mi-nm__title">{{ l.title }}</span>
        <span v-if="l.description" class="mi-nm__desc">{{ l.description }}</span>
      </a>
    </div>
  </nav>
</template>

<style scoped>
.mi-nm{font-family:var(--mi-font);color:var(--mi-label);position:relative;display:inline-block}
.mi-nm__list{display:flex;gap:2px;margin:0;padding:0;list-style:none}
.mi-nm__li{position:relative}
.mi-nm__top{display:inline-flex;align-items:center;gap:4px;height:36px;padding:0 14px;border:0;border-radius:8px;background:transparent;color:var(--mi-label);font:inherit;font-size:14px;font-weight:500;text-decoration:none;cursor:pointer}
.mi-nm__top:hover,.mi-nm__top[aria-expanded='true']{background:var(--mi-fill3)}
.mi-nm__top:focus-visible,.mi-nm__link:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-1px}
.mi-nm__chev{width:12px;height:12px;transition:transform var(--mi-dur-3) var(--mi-spring)}
.mi-nm__top[aria-expanded='true'] .mi-nm__chev{transform:rotate(180deg)}
.mi-nm__panel{position:absolute;top:100%;left:0;z-index:50;display:flex;flex-direction:column;gap:2px;min-width:260px;margin-top:6px;padding:6px;border-radius:14px;background:var(--mi-mat);-webkit-backdrop-filter:saturate(180%) blur(24px);backdrop-filter:saturate(180%) blur(24px);box-shadow:var(--mi-sh3),inset 0 0 0 .5px var(--mi-mat-b);opacity:0;transform:translate3d(0,-4px,0) scale(.97);transform-origin:0 0;visibility:hidden;pointer-events:none;transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-3) var(--mi-spring),visibility 0s linear var(--mi-dur-2)}
.mi-nm__panel::before{content:'';position:absolute;left:0;right:0;top:-8px;height:8px}
.mi-nm__panel.is-open{opacity:1;transform:none;visibility:visible;pointer-events:auto;transition-delay:0s}
.mi-nm__link{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:8px;color:var(--mi-label);text-decoration:none}
.mi-nm__link:hover,.mi-nm__link:focus{background:var(--mi-fill3)}
.mi-nm__title{font-size:14px;font-weight:600}
.mi-nm__desc{font-size:13px;color:var(--mi-label2)}
</style>
