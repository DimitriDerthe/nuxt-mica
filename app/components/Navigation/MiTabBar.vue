<script setup lang="ts">
/** Tab switcher: a bottom tab bar with icons (variant "bar") or a floating pill (variant "capsule"); v-model is the selected item id. */
import { computed, ref } from 'vue'
import MiNavGlyph from './MiNavGlyph.vue'
import { miNavRoving, type MiNavIconName } from '../../utils/miNav'

export interface MiTabItem { id: string, label: string, icon?: MiNavIconName, badge?: number | string }

const props = withDefaults(defineProps<{
  /** Tabs to show; the selected id is the v-model. */
  items: MiTabItem[]
  /** `bar` is the bottom tab bar with icons, `capsule` the floating pill. */
  variant?: 'bar' | 'capsule'
  /** Accessible name of the tab bar. */
  ariaLabel?: string
}>(), { variant: 'bar', ariaLabel: 'Tab bar' })

/** Id of the selected tab. */

const model = defineModel<string>()
const root = ref<HTMLElement | null>(null)
const index = computed(() => Math.max(props.items.findIndex(i => i.id === model.value), 0))

function onKey(e: KeyboardEvent) { miNavRoving(e, root.value, 'button.mi-tb__tab', 'horizontal') }
</script>

<template>
  <nav
    ref="root" class="mi-tb mi:font-mi mi:grid-cols-[repeat(var(--n),minmax(0,1fr))]" :class="`is-${variant}`" :aria-label="ariaLabel"
    :style="{ '--n': items.length, '--i': index }" @keydown="onKey"
  >
    <span v-if="variant === 'capsule'" class="mi-tb__thumb mi:absolute mi:left-1 mi:top-1 mi:bottom-1 mi:w-[calc((100%_-_8px_-_(var(--n)_-_1)_*_4px)_/_var(--n))] mi:rounded-[999px] mi:bg-p-tint mi:transform-[translate3d(calc(var(--i)_*_(100%_+_4px)),0,0)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)] mi:pointer-events-none" aria-hidden="true" />
    <button
      v-for="(it, i) in items" :key="it.id" type="button" class="mi-tb__tab mi:[border:0] mi:bg-transparent mi:text-label2 mi:flex mi:flex-col mi:items-center mi:justify-center mi:relative mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:[&.is-on]:text-p-text mi:active:transform-[scale(.94)] mi:[.is-bar_&]:h-12.5 mi:[.is-bar_&]:gap-[3px] mi:[.is-bar_&]:text-[10px] mi:[.is-bar_&]:font-semibold mi:[.is-bar_&]:tracking-[.01em] mi:[.is-capsule_&]:h-11 mi:[.is-capsule_&]:rounded-[999px] mi:[.is-capsule_&]:text-[13px] mi:[.is-capsule_&]:font-semibold mi:[.is-capsule_&]:z-1 mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,var(--mi-p)_55%,transparent)] mi:focus-visible:outline-offset-[-2px] mi:focus-visible:rounded-[12px] mi:[.is-capsule_&:focus-visible]:rounded-[999px]" :class="{ 'is-on': i === index }"
      :aria-current="i === index ? 'page' : undefined" @click="model = it.id"
    >
      <span v-if="variant === 'bar' && it.icon" class="mi-tb__ic mi:relative mi:flex">
        <MiNavGlyph :name="it.icon" :size="24" />
        <span v-if="it.badge !== undefined && it.badge !== ''" class="mi-tb__badge mi:absolute mi:-top-1 mi:left-[calc(100%_-_8px)] mi:min-w-4 mi:h-4 mi:py-0 mi:px-1 mi:rounded-[999px] mi:bg-red mi:text-[color:#fff] mi:text-[10px] mi:font-bold mi:leading-4 mi:text-center">{{ it.badge }}</span>
      </span>
      <span class="mi-tb__label">{{ it.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.mi-tb{display:grid;background:var(--mi-mat);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.is-bar{padding:6px 4px calc(18px + env(safe-area-inset-bottom,0px)) ;border-top:.5px solid var(--mi-sep)}
.mi-tb__ic :deep(svg){transition:transform var(--mi-dur-3) var(--mi-spring)}
.is-on .mi-tb__ic :deep(svg){transform:scale(1.08)}
.is-capsule{position:relative;gap:4px;padding:4px;border-radius:999px;box-shadow:var(--mi-sh2)}
</style>
