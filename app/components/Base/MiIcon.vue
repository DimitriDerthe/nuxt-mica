<script setup lang="ts">
/** Inline SVG icon from the built-in set or raw SVG markup; decorative (aria-hidden) unless label is set; spin for loaders. */
import { computed } from 'vue'
import { miIconMarkup, miSteppedIcons, type MiIconName } from '../../utils/miIcons'

const props = withDefaults(defineProps<{
  /** Name from the built-in set. */
  name?: MiIconName
  /** Raw inner SVG markup (24x24 grid). Trusted, static markup only. Takes precedence over `name`. */
  svg?: string
  /** Width and height: a number in px or a CSS length string (e.g. '1.25em'). */
  size?: number | string
  /** Stroke width on the 24x24 grid. */
  weight?: number | string
  /** Accessible name. When omitted the icon is decorative and hidden from assistive tech. */
  label?: string
  /** Fill the shape with the current color while keeping the outline (SF "fill" variants). */
  filled?: boolean
  /** Rotate continuously (activity indicators). Transform-only animation. */
  spin?: boolean
}>(), { size: 20, weight: 1.9 })

const markup = computed(() => miIconMarkup(props.name, props.svg))
const stepped = computed(() => !!props.name && miSteppedIcons.includes(props.name))
</script>

<template>
  <svg
    class="mi-icon"
    :class="{ 'mi-icon--spin': spin, 'mi-icon--steps': spin && stepped }"
    viewBox="0 0 24 24"
    :width="size"
    :height="size"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    :stroke-width="weight"
    stroke-linecap="round"
    stroke-linejoin="round"
    focusable="false"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    v-html="markup"
  />
</template>

<style scoped>
.mi-icon{display:inline-block;flex:none;vertical-align:middle;overflow:visible}
.mi-icon--spin{animation:mi-icon-spin .8s linear infinite;will-change:transform;transform-origin:50% 50%}
.mi-icon--steps{animation-timing-function:steps(8,end)}
@keyframes mi-icon-spin{to{transform:rotate(360deg)}}
</style>
