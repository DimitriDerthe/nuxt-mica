<script setup lang="ts">
/** Inline text link in brand colour with optional trailing chevron, for navigation in running text or CTAs. */
import type { MiBrand } from '../../utils/miButtons'
import { miSafeHref } from '../../utils/miSafe'

withDefaults(defineProps<{
  /** Destination of the link. */
  href?: string
  /** Color family of the link text. */
  brand?: MiBrand
  /** Shows the trailing chevron. */
  chevron?: boolean
}>(), { href: '#', brand: 'primary', chevron: true })

const _slots = defineSlots<{
  /** Text of the link. */
  default?(): unknown
}>()
</script>

<template>
  <a class="mi-link mi:focus-visible:[outline:3px_solid_color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:focus-visible:outline-offset-[2px]" :class="`mi-link--${brand}`" :href="miSafeHref(href)">
    <slot />
    <svg class="mi:[.mi-link_&]:w-3.5 mi:[.mi-link_&]:h-3.5 mi:[.mi-link_&]:flex-[none] mi:[.mi-link_&]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[.mi-link:hover_&]:transform-[translateX(2px)]" v-if="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
  </a>
</template>

<style scoped>
.mi-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: var(--mi-p-text);
  font-family: var(--mi-font);
  font-size: 15px;
  letter-spacing: -0.01em;
  text-decoration: none;
  border-radius: 4px;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.mi-link--secondary { color: var(--mi-s-text); }
.mi-link:hover { opacity: 0.8; }
</style>
