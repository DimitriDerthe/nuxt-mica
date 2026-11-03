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
  <header class="mi-ln mi:font-mi mi:rounded-[14px] mi:bg-mat mi:shadow-1 mi:py-0 mi:px-5 mi:h-14 mi:flex mi:items-center mi:gap-6 mi:text-label mi:z-10 mi:[&.is-sticky]:sticky mi:[&.is-sticky]:top-3 mi:max-[640px]:py-0 mi:max-[640px]:px-3 mi:max-[640px]:gap-2.5" :class="{ 'is-sticky': sticky }">
    <slot name="title"><span v-if="title" class="mi-ln__title mi:flex-[none] mi:text-[21px] mi:font-semibold mi:tracking-[-.02em] mi:whitespace-nowrap mi:max-[640px]:text-[17px]">{{ title }}</span></slot>
    <span class="mi-ln__spacer mi:flex-1 mi:min-w-0" />
    <nav ref="root" class="mi-ln__nav mi:flex mi:items-center mi:gap-1 mi:min-w-0 mi:overflow-x-auto mi:[scrollbar-width:none] mi:max-[640px]:gap-0" :aria-label="ariaLabel" @keydown="onKey">
      <button
        v-for="it in items" :key="it.id" type="button" class="mi-ln__item mi:relative mi:h-11 mi:py-0 mi:px-2.5 mi:[border:0] mi:bg-transparent mi:text-label2 mi:text-[13px] mi:whitespace-nowrap mi:after:content-[''] mi:after:absolute mi:after:left-2.5 mi:after:right-2.5 mi:after:bottom-0 mi:after:h-0.5 mi:after:rounded-[2px_2px_0_0] mi:after:bg-p mi:after:opacity-0 mi:after:transform-[scaleX(.4)] mi:after:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),transform_var(--mi-dur-3)_var(--mi-spring)] mi:[&.is-on]:font-semibold mi:[&.is-on]:after:opacity-100 mi:[&.is-on]:after:transform-[scaleX(1)] mi:max-[640px]:py-0 mi:max-[640px]:px-[7px] mi:max-[640px]:after:left-[7px] mi:max-[640px]:after:right-[7px]" :class="{ 'is-on': active(it.id) }"
        :disabled="it.disabled" :aria-current="active(it.id) ? 'page' : undefined" @click="pick(it)"
      ><span class="mi-ln__label mi:inline-block mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-ln__item:hover:not(:disabled):not(.is-on)_&]:opacity-70">{{ it.label }}</span></button>
    </nav>
    <slot name="action">
      <button v-if="actionLabel" type="button" class="mi-ln__cta mi:flex-[none] mi:h-7 mi:py-0 mi:px-3.5 mi:[border:0] mi:rounded-[999px] mi:bg-p mi:text-p-on mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.95)]" @click="emit('action')">{{ actionLabel }}</button>
    </slot>
  </header>
</template>

<style scoped>
.mi-ln{-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-ln__item:disabled{color:var(--mi-label3)}
.mi-ln__item.is-on{color:var(--mi-label)}
.mi-ln :focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:2px}
</style>
