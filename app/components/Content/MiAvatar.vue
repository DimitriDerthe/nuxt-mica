<script setup lang="ts">
/** User avatar: image, or initials from `name` on a tone background. Use for people; `tone="auto"` picks a stable color from the name. */
import { computed, ref, watch } from 'vue'

export type MiAvatarTone =
  | 'primary' | 'secondary' | 'primary-soft' | 'secondary-soft' | 'neutral' | 'auto'
  | 'red' | 'orange' | 'green' | 'mint' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink'
export type MiAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number

const SIZES: Record<string, { px: number, fs: number }> = {
  xs: { px: 24, fs: 10 },
  sm: { px: 32, fs: 12 },
  md: { px: 44, fs: 16 },
  lg: { px: 64, fs: 22 },
  xl: { px: 80, fs: 28 }
}
const AUTO: MiAvatarTone[] = ['primary', 'secondary', 'teal', 'indigo', 'green', 'pink', 'purple', 'orange']

defineSlots<{
  /** Fallback shown when there is no image and no initials; defaults to a person silhouette. */
  default?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Full name, used for initials and the accessible label. */
  name?: string
  /** Explicit initials, overrides the ones derived from `name`. */
  initials?: string
  /** Image URL; falls back to initials if it fails to load. */
  src?: string
  /** Image alt text. Defaults to `name`. */
  alt?: string
  /** Preset xs 24px, sm 32px, md 44px, lg 64px, xl 80px, or a number of px. */
  size?: MiAvatarSize
  /** Circle or rounded square outline. */
  shape?: 'circle' | 'square'
  /** Background color. `auto` picks a stable color from `name`. */
  tone?: MiAvatarTone
  /** Hide from assistive tech when the name is rendered next to the avatar. */
  decorative?: boolean
}>(), { size: 'md', shape: 'circle', tone: 'primary', decorative: false })

const dim = computed(() => {
  if (typeof props.size === 'number') return { px: props.size, fs: Math.max(10, Math.round(props.size * 0.35)) }
  return SIZES[props.size] ?? SIZES.md!
})

const letters = computed(() => {
  if (props.initials) return props.initials.slice(0, 3)
  const parts = (props.name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return ''
  const first = parts[0]!.charAt(0)
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : ''
  return (first + last).toUpperCase()
})

const resolvedTone = computed<MiAvatarTone>(() => {
  if (props.tone !== 'auto') return props.tone
  let h = 0
  for (const c of props.name ?? '') h = (h * 31 + c.charCodeAt(0)) >>> 0
  return AUTO[h % AUTO.length]!
})

const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
const showImg = computed(() => !!props.src && !failed.value)
const label = computed(() => props.alt ?? props.name ?? 'Avatar')
</script>

<template>
  <span
    class="mi-av mi:[--_bg:var(--mi-p)] mi:select-none"
    :class="[`mi-av--${shape}`, `mi-av--${resolvedTone}`]"
    :style="{ '--mi-av': dim.px + 'px', '--mi-av-fs': dim.fs + 'px' }"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative ? 'true' : undefined"
  >
    <img v-if="showImg" class="mi-av__img mi:absolute mi:inset-0 mi:w-full mi:h-full mi:object-cover mi:block" :src="src" alt="" loading="lazy" decoding="async" draggable="false" @error="failed = true">
    <template v-else-if="letters">{{ letters }}</template>
    <slot v-else>
      <svg class="mi-av__ph mi:w-[53%] mi:h-[53%]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8.5" r="4" /><path d="M4 20.5a8 8 0 0116 0z" /></svg>
    </slot>
  </span>
</template>

<style scoped>
.mi-av{--_fg:var(--mi-p-on);position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:var(--mi-av);height:var(--mi-av);overflow:hidden;background:var(--_bg);color:var(--_fg);font-family:var(--mi-font);font-size:var(--mi-av-fs);font-weight:700;line-height:1;letter-spacing:0;vertical-align:middle}
.mi-av--circle{border-radius:50%}
.mi-av--square{border-radius:28%}
.mi-av--secondary{--_bg:var(--mi-s);--_fg:var(--mi-s-on)}
.mi-av--primary-soft{--_bg:var(--mi-p-tint);--_fg:var(--mi-p-text)}
.mi-av--secondary-soft{--_bg:var(--mi-s-tint);--_fg:var(--mi-s-text)}
.mi-av--neutral{--_bg:var(--mi-fill2);--_fg:var(--mi-label2)}
.mi-av--red{--_bg:var(--mi-red);--_fg:#fff}
.mi-av--orange{--_bg:var(--mi-orange);--_fg:#fff}
.mi-av--green{--_bg:var(--mi-green);--_fg:#fff}
.mi-av--mint{--_bg:var(--mi-mint);--_fg:#fff}
.mi-av--teal{--_bg:var(--mi-teal);--_fg:#fff}
.mi-av--blue{--_bg:var(--mi-blue);--_fg:#fff}
.mi-av--indigo{--_bg:var(--mi-indigo);--_fg:#fff}
.mi-av--purple{--_bg:var(--mi-purple);--_fg:#fff}
.mi-av--pink{--_bg:var(--mi-pink);--_fg:#fff}
</style>
