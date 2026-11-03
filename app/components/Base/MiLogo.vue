<script setup lang="ts">
/** Mica logo: lowercase "mica" wordmark, short "m." form or dot only; the full stop follows the brand color (--mi-p), optional breathing dot for loading states. */
import { computed } from 'vue'

export type MiLogoVariant = 'wordmark' | 'short' | 'dot'
export type MiLogoTone = 'label' | 'inherit' | 'on-primary'
export type MiLogoDot = 'primary' | 'secondary' | 'inherit'

const props = withDefaults(defineProps<{
  /** `wordmark` = "mica.", `short` = "m." for tight spaces and app icons, `dot` = the full stop alone. */
  variant?: MiLogoVariant
  /** Rendered height: a number in px or a CSS length string (e.g. '1em'). Width follows the aspect ratio. */
  size?: number | string
  /** Letter color: `label` (default text color), `inherit` (currentColor) or `on-primary` for use on a --mi-p fill. */
  tone?: MiLogoTone
  /** Full stop color: `primary` (--mi-p), `secondary` (--mi-s) or `inherit` to match the letters (monochrome). */
  dot?: MiLogoDot
  /** Accessible name. */
  label?: string
  /** Hide from assistive tech when the name is already visible next to the logo. */
  decorative?: boolean
  /** Breathing dot (transform/opacity only) for loading states; set aria-busy on the busy region yourself. */
  pulse?: boolean
}>(), { variant: 'wordmark', size: 24, tone: 'label', dot: 'primary', label: 'Mica' })

// Glyphs are drawn on a grid with an x-height of 50 units, baseline at y=60 and 11-unit stems.
const BOXES: Record<MiLogoVariant, [number, number, number, number]> = {
  wordmark: [0, -8, 218, 68],
  short: [0, 10, 91, 50],
  dot: [0, 0, 22, 22]
}

const box = computed(() => BOXES[props.variant])
const style = computed(() => ({
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  aspectRatio: `${box.value[2]} / ${box.value[3]}`
}))
</script>

<template>
  <svg
    class="mi-logo mi:flex-[none] mi:align-middle mi:overflow-visible"
    :class="[`mi-logo--${tone}`, `mi-logo--dot-${dot}`, { 'mi-logo--pulse': pulse }]"
    :viewBox="box.join(' ')"
    :style="style"
    focusable="false"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? 'true' : undefined"
  >
    <g v-if="variant !== 'dot'" fill="none" stroke="currentColor" stroke-width="11">
      <path d="M5.5 60V28a13 12.5 0 0 1 26 0V60M31.5 28a13 12.5 0 0 1 26 0V60" />
      <template v-if="variant === 'wordmark'">
        <path d="M75.5 10V60" />
        <path d="M126.79 21.21A19.5 19.5 0 1 0 126.79 48.79" />
        <circle cx="165" cy="35" r="19.5" />
        <path d="M184.5 10V60" />
      </template>
    </g>
    <circle v-if="variant === 'wordmark'" cx="75.5" cy="-1.5" r="6.5" fill="currentColor" />
    <circle v-if="variant === 'wordmark'" class="mi-logo__dot mi:fill-current mi:[transform-box:fill-box] mi:origin-center mi:[.mi-logo--dot-primary_&]:fill-p mi:[.mi-logo--dot-secondary_&]:fill-s" cx="207" cy="49" r="11" />
    <circle v-else-if="variant === 'short'" class="mi-logo__dot mi:fill-current mi:[transform-box:fill-box] mi:origin-center mi:[.mi-logo--dot-primary_&]:fill-p mi:[.mi-logo--dot-secondary_&]:fill-s" cx="80" cy="49" r="11" />
    <circle v-else class="mi-logo__dot mi:fill-current mi:[transform-box:fill-box] mi:origin-center mi:[.mi-logo--dot-primary_&]:fill-p mi:[.mi-logo--dot-secondary_&]:fill-s" cx="11" cy="11" r="11" />
  </svg>
</template>

<style scoped>
.mi-logo{display:inline-block;width:auto}
.mi-logo--label{color:var(--mi-label)}
.mi-logo--inherit{color:inherit}
.mi-logo--on-primary{color:var(--mi-p-on)}
.mi-logo--pulse .mi-logo__dot{animation:mi-logo-pulse 1.2s var(--mi-ease) infinite}
@keyframes mi-logo-pulse{50%{transform:scale(.55);opacity:.45}}
@media (prefers-reduced-motion:reduce){.mi-logo--pulse .mi-logo__dot{animation:none}}
</style>
