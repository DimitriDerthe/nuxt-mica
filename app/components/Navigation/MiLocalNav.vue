<script setup lang="ts">
/** Sticky in-page section tabs with v-model selection, arrow-key navigation and an optional call-to-action pill. */
import { ref } from 'vue'
import { miNavRoving } from '../../utils/miNav'

export interface MiLocalNavItem { id: string, label: string, disabled?: boolean }

const props = withDefaults(defineProps<{
  /** Product or page name shown at the start of the bar. Replaced by the `title` slot when given. */
  title?: string
  /** Sections to switch between; the selected id is the v-model. */
  items: MiLocalNavItem[]
  /** Label of the call-to-action pill. Omit to hide it. */
  actionLabel?: string
  /** Pins the bar to the top of its scroll container (12px offset). False renders it static. */
  sticky?: boolean
  /** Accessible name of the section navigation. */
  ariaLabel?: string
}>(), { sticky: true, ariaLabel: 'Sections' })

const emit = defineEmits<{ action: [] }>()
/** Value of the selected section tab. */
const model = defineModel<string>()
const root = ref<HTMLElement | null>(null)

function pick(it: MiLocalNavItem) { if (!it.disabled && it.id !== model.value) model.value = it.id }
function onKey(e: KeyboardEvent) { miNavRoving(e, root.value, 'button.mi-ln__item', 'horizontal') }
const active = (id: string) => (model.value ?? props.items[0]?.id) === id
defineSlots<{
  /** Replaces the title text at the start of the bar. */
  title?(): unknown
  /** Replaces the call-to-action pill. */
  action?(): unknown
}>()
</script>

<template>
  <header class="mi-ln" :class="{ 'is-sticky': sticky }">
    <slot name="title"><span v-if="title" class="mi-ln__title">{{ title }}</span></slot>
    <span class="mi-ln__spacer" />
    <nav ref="root" class="mi-ln__nav" :aria-label="ariaLabel" @keydown="onKey">
      <button
        v-for="it in items" :key="it.id" type="button" class="mi-ln__item" :class="{ 'is-on': active(it.id) }"
        :disabled="it.disabled" :aria-current="active(it.id) ? 'page' : undefined" @click="pick(it)"
      ><span class="mi-ln__label">{{ it.label }}</span></button>
    </nav>
    <slot name="action">
      <button v-if="actionLabel" type="button" class="mi-ln__cta" @click="emit('action')">{{ actionLabel }}</button>
    </slot>
  </header>
</template>

<style scoped>
.mi-ln{font-family:var(--mi-font);border-radius:14px;background:var(--mi-mat);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%);box-shadow:var(--mi-sh1);padding:0 20px;height:56px;display:flex;align-items:center;gap:24px;color:var(--mi-label);z-index:10}
.mi-ln.is-sticky{position:sticky;top:12px}
.mi-ln__title{flex:none;font-size:21px;font-weight:600;letter-spacing:-.02em;white-space:nowrap}
.mi-ln__spacer{flex:1;min-width:0}
.mi-ln__nav{display:flex;align-items:center;gap:4px;min-width:0;overflow-x:auto;scrollbar-width:none}
.mi-ln__item{position:relative;height:44px;padding:0 10px;border:0;background:transparent;color:var(--mi-label2);font-size:13px;white-space:nowrap}
.mi-ln__item:disabled{color:var(--mi-label3)}
.mi-ln__label{display:inline-block;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-ln__item:hover:not(:disabled):not(.is-on) .mi-ln__label{opacity:.7}
.mi-ln__item::after{content:"";position:absolute;left:10px;right:10px;bottom:0;height:2px;border-radius:2px 2px 0 0;background:var(--mi-p);opacity:0;transform:scaleX(.4);transition:opacity var(--mi-dur-2) var(--mi-ease),transform var(--mi-dur-3) var(--mi-spring)}
.mi-ln__item.is-on{color:var(--mi-label);font-weight:600}
.mi-ln__item.is-on::after{opacity:1;transform:scaleX(1)}
.mi-ln__cta{flex:none;height:28px;padding:0 14px;border:0;border-radius:999px;background:var(--mi-p);color:var(--mi-p-on);font-size:12px;font-weight:600;white-space:nowrap;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-ln__cta:active{transform:scale(.95)}
.mi-ln :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
@media (max-width:640px){.mi-ln{padding:0 12px;gap:10px}.mi-ln__title{font-size:17px}.mi-ln__item{padding:0 7px}.mi-ln__item::after{left:7px;right:7px}.mi-ln__nav{gap:0}}
</style>
