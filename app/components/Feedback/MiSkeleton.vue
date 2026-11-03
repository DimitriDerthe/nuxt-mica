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
  <div v-if="$slots.default" class="mi-skel-group mi:flex-col mi:gap-3.5" role="group" aria-busy="true" :aria-label="label">
    <slot />
  </div>
  <span v-else-if="rows.length" class="mi-skel-lines mi:flex-col mi:gap-2.5" aria-hidden="true">
    <span v-for="(w, i) in rows" :key="i" class="mi-skel mi:relative mi:max-w-full mi:[contain:paint] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:transform-[translate3d(-100%,0,0)] mi:after:will-change-transform" :class="{ 'is-still': !animated }" :style="{ ...box, width: w ?? box.width }" />
  </span>
  <span v-else class="mi-skel mi:relative mi:max-w-full mi:[contain:paint] mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:transform-[translate3d(-100%,0,0)] mi:after:will-change-transform" :class="{ 'is-still': !animated }" :style="box" aria-hidden="true" />
</template>

<style scoped>
.mi-skel-group{display:flex}
.mi-skel-lines{display:flex;width:100%}
.mi-skel{display:block;flex:none;overflow:hidden;background:var(--mi-fill3)}
.mi-skel::after{background:linear-gradient(90deg,transparent 0%,color-mix(in srgb,var(--mi-card) 60%,transparent) 50%,transparent 100%);animation:mi-skel-sweep 1.6s ease-in-out infinite}
.mi-skel.is-still::after{display:none}
@keyframes mi-skel-sweep{to{transform:translate3d(100%,0,0)}}
</style>
