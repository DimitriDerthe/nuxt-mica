<script setup lang="ts">
/** Small loading indicator: `ticks` for the 8-step activity spinner or `arc` for a rotating arc, in a preset or pixel size. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** `ticks` is the 8-step activity indicator, `arc` a continuous rotating arc. */
  variant?: 'ticks' | 'arc'
  /** Preset: sm 16px, md 20px, lg 32px. A number is an exact size in px. */
  size?: 'sm' | 'md' | 'lg' | number
  /** `inherit` follows the text colour. */
  tone?: 'inherit' | 'primary' | 'secondary'
  /** Accessible name. An empty string hides the spinner from assistive tech. */
  label?: string
}>(), {
  variant: 'ticks',
  size: 'md',
  tone: 'inherit',
  label: 'Loading'
})

const px = computed(() => (typeof props.size === 'number' ? props.size : ({ sm: 16, md: 20, lg: 32 } as const)[props.size]))
const color = computed(() => (props.tone === 'primary' ? 'var(--mi-p)' : props.tone === 'secondary' ? 'var(--mi-s)' : undefined))
const TICKS = [
  ['M12 3v4', 1], ['M18.4 5.6l-2.8 2.8', 0.86], ['M21 12h-4', 0.72], ['M18.4 18.4l-2.8-2.8', 0.58],
  ['M12 21v-4', 0.44], ['M5.6 18.4l2.8-2.8', 0.32], ['M3 12h4', 0.22], ['M5.6 5.6l2.8 2.8', 0.14]
] as const
</script>

<template>
  <span class="mi-spin" :role="label ? 'status' : undefined" :aria-label="label || undefined" :aria-hidden="label ? undefined : 'true'" :style="{ color }">
    <svg v-if="variant === 'ticks'" class="mi-spin-svg is-ticks mi:block mi:will-change-transform" :width="px" :height="px" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g stroke="currentColor" :stroke-width="px >= 28 ? 2 : 2.4" stroke-linecap="round">
        <path v-for="t in TICKS" :key="t[0]" :d="t[0]" :opacity="t[1]" />
      </g>
    </svg>
    <svg v-else class="mi-spin-svg is-arc mi:block mi:will-change-transform" :width="px" :height="px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true" focusable="false">
      <path d="M12 3a9 9 0 019 9" />
    </svg>
  </span>
</template>

<style scoped>
.mi-spin{display:inline-flex;flex:none;line-height:0}
.mi-spin-svg.is-ticks{animation:mi-spin-rot .8s steps(8) infinite}
.mi-spin-svg.is-arc{animation:mi-spin-rot .9s linear infinite}
@keyframes mi-spin-rot{to{transform:rotate(360deg)}}
</style>
