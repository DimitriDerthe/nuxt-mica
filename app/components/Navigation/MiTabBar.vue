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
    ref="root" class="mi-tb" :class="`is-${variant}`" :aria-label="ariaLabel"
    :style="{ '--n': items.length, '--i': index }" @keydown="onKey"
  >
    <span v-if="variant === 'capsule'" class="mi-tb__thumb" aria-hidden="true" />
    <button
      v-for="(it, i) in items" :key="it.id" type="button" class="mi-tb__tab" :class="{ 'is-on': i === index }"
      :aria-current="i === index ? 'page' : undefined" @click="model = it.id"
    >
      <span v-if="variant === 'bar' && it.icon" class="mi-tb__ic">
        <MiNavGlyph :name="it.icon" :size="24" />
        <span v-if="it.badge !== undefined && it.badge !== ''" class="mi-tb__badge">{{ it.badge }}</span>
      </span>
      <span class="mi-tb__label">{{ it.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.mi-tb{font-family:var(--mi-font);display:grid;grid-template-columns:repeat(var(--n),minmax(0,1fr));background:var(--mi-mat);-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-tb__tab{border:0;background:transparent;color:var(--mi-label2);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;transition:transform var(--mi-dur-1) var(--mi-ease)}
.mi-tb__tab.is-on{color:var(--mi-p-text)}
.mi-tb__tab:active{transform:scale(.94)}
.is-bar{padding:6px 4px calc(18px + env(safe-area-inset-bottom,0px)) ;border-top:.5px solid var(--mi-sep)}
.is-bar .mi-tb__tab{height:50px;gap:3px;font-size:10px;font-weight:600;letter-spacing:.01em}
.mi-tb__ic{position:relative;display:flex}
.mi-tb__ic :deep(svg){transition:transform var(--mi-dur-3) var(--mi-spring)}
.is-on .mi-tb__ic :deep(svg){transform:scale(1.08)}
.mi-tb__badge{position:absolute;top:-4px;left:calc(100% - 8px);min-width:16px;height:16px;padding:0 4px;border-radius:999px;background:var(--mi-red);color:#fff;font-size:10px;font-weight:700;line-height:16px;text-align:center}
.is-capsule{position:relative;gap:4px;padding:4px;border-radius:999px;box-shadow:var(--mi-sh2)}
.is-capsule .mi-tb__tab{height:44px;border-radius:999px;font-size:13px;font-weight:600;z-index:1}
.mi-tb__thumb{position:absolute;left:4px;top:4px;bottom:4px;width:calc((100% - 8px - (var(--n) - 1) * 4px) / var(--n));border-radius:999px;background:var(--mi-p-tint);transform:translate3d(calc(var(--i) * (100% + 4px)),0,0);transition:transform var(--mi-dur-3) var(--mi-spring);pointer-events:none}
.mi-tb__tab:focus-visible{outline:3px solid color-mix(in srgb,var(--mi-p) 55%,transparent);outline-offset:-2px;border-radius:12px}
.is-capsule .mi-tb__tab:focus-visible{border-radius:999px}
</style>
