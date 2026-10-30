<script setup lang="ts">
/** Loading placeholder in `rect`, `circle` or `text` shape, with optional line list; shimmers unless `animated` is false. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Shape of the placeholder: block, circle or lines of text. */
  variant?: 'rect' | 'circle' | 'text'
  /** Number is px, string is any CSS length. Defaults to 100%. */
  width?: number | string
  /** Number is px, string is any CSS length. Defaults to 16px (10px for `text`). */
  height?: number | string
  /** Corner radius (px or CSS length). */
  radius?: number | string
  /** `text` only: number of lines, or explicit line widths such as `['88%', '70%']`. */
  lines?: number | Array<number | string>
  /** Plays the shimmer animation; turn off for a static placeholder. */
  animated?: boolean
  /** Accessible name when used as a container around other skeletons. */
  label?: string
}>(), {
  variant: 'rect',
  animated: true,
  label: 'Loading content'
})

const css = (v: number | string | undefined): string | undefined => (v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v)

const box = computed(() => {
  if (props.variant === 'circle') {
    const s = css(props.width ?? props.height ?? 44)
    return { width: s, height: s, borderRadius: '50%' }
  }
  if (props.variant === 'text') {
    return { width: css(props.width ?? '100%'), height: css(props.height ?? 10), borderRadius: css(props.radius ?? 6) }
  }
  return { width: css(props.width ?? '100%'), height: css(props.height ?? 16), borderRadius: css(props.radius ?? 8) }
})

const rows = computed<Array<string | undefined>>(() => {
  if (props.variant !== 'text' || !props.lines) return []
  if (Array.isArray(props.lines)) return props.lines.map(css)
  const n = props.lines
  return Array.from({ length: n }, (_, i): string | undefined => (i === n - 1 && i > 0 ? '70%' : undefined))
})

defineSlots<{
  /** Child skeletons grouped inside this container; the container carries the accessible `label`. */
  default?(): unknown
}>()
</script>

<template>
  <div v-if="$slots.default" class="mi-skel-group" role="group" aria-busy="true" :aria-label="label">
    <slot />
  </div>
  <span v-else-if="rows.length" class="mi-skel-lines" aria-hidden="true">
    <span v-for="(w, i) in rows" :key="i" class="mi-skel" :class="{ 'is-still': !animated }" :style="{ ...box, width: w ?? box.width }" />
  </span>
  <span v-else class="mi-skel" :class="{ 'is-still': !animated }" :style="box" aria-hidden="true" />
</template>

<style scoped>
.mi-skel-group{display:flex;flex-direction:column;gap:14px}
.mi-skel-lines{display:flex;flex-direction:column;gap:10px;width:100%}
.mi-skel{position:relative;display:block;flex:none;max-width:100%;overflow:hidden;background:var(--mi-fill3);contain:paint}
.mi-skel::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--mi-card) 60%,transparent) 50%,transparent 100%);transform:translate3d(-100%,0,0);animation:mi-skel-sweep 1.6s ease-in-out infinite;will-change:transform}
.mi-skel.is-still::after{display:none}
@keyframes mi-skel-sweep{to{transform:translate3d(100%,0,0)}}
</style>
