<script setup lang="ts">
/** Container surface (card, elevated or translucent material) with radius, padding and shadow presets; use it to group content. */
import { computed } from 'vue'
import { miSafeTag } from '../../utils/miSafe'

export type MiSurfaceVariant = 'card' | 'elevated' | 'material'
export type MiSurfaceMaterial = 'ultra-thin' | 'thin' | 'regular' | 'thick'
export type MiSurfaceRadius = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'capsule'
export type MiSurfacePadding = 'none' | 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  /** Look of the surface: flat `card`, shadowed `elevated` or translucent blurred `material`. */
  variant?: MiSurfaceVariant
  /** Translucency of the `material` variant. */
  material?: MiSurfaceMaterial
  /** Corner rounding from `xs` to `xl`, or fully rounded `capsule`. */
  radius?: MiSurfaceRadius
  /** Inner spacing: none, sm (12px), md (18px) or lg (24px). */
  padding?: MiSurfacePadding
  /** Shadow depth 0-3 (`--mi-sh1..3`). Defaults to 1 for cards, 2 for elevated, 0 for materials. */
  elevation?: 0 | 1 | 2 | 3
  /** Tag or component to render instead of the default div (e.g. 'section', 'li'). */
  as?: string
}>(), { variant: 'card', material: 'regular', radius: 'lg', padding: 'none', as: 'div' })

const level = computed(() => props.elevation ?? (props.variant === 'card' ? 1 : props.variant === 'elevated' ? 2 : 0))

defineSlots<{
  /** Content grouped on the surface. */
  default?(): unknown
}>()
</script>

<template>
  <component
    :is="miSafeTag(as, 'div')"
    class="mi-surface"
    :class="[`mi-surface--${variant}`, `mi-surface--r-${radius}`, `mi-surface--p-${padding}`, `mi-surface--e${level}`, variant === 'material' && `mi-surface--m-${material}`]"
  >
    <span v-if="variant === 'material'" class="mi-surface__bg mi:absolute mi:inset-0 mi:-z-1 mi:rounded-[inherit] mi:pointer-events-none mi:shadow-[inset_0_0_0_.5px_var(--mi-mat-b)] mi:bg-mat" aria-hidden="true" />
    <slot />
  </component>
</template>

<style scoped>
.mi-surface{position:relative;isolation:isolate;font-family:var(--mi-font);color:var(--mi-label);min-width:0}
.mi-surface--card{background:var(--mi-card)}
.mi-surface--elevated{background:var(--mi-elev)}
.mi-surface--e0{box-shadow:none}
.mi-surface--e1{box-shadow:var(--mi-sh1)}
.mi-surface--e2{box-shadow:var(--mi-sh2)}
.mi-surface--e3{box-shadow:var(--mi-sh3)}
.mi-surface--r-xs{border-radius:6px}
.mi-surface--r-sm{border-radius:10px}
.mi-surface--r-md{border-radius:14px}
.mi-surface--r-lg{border-radius:20px}
.mi-surface--r-xl{border-radius:28px}
.mi-surface--r-capsule{border-radius:999px}
.mi-surface--p-sm{padding:12px}
.mi-surface--p-md{padding:18px}
.mi-surface--p-lg{padding:24px}
/* Blur lives on one static layer behind the content; nothing inside it is animated by the surface. */
.mi-surface__bg{-webkit-backdrop-filter:blur(24px) saturate(180%);backdrop-filter:blur(24px) saturate(180%)}
.mi-surface--m-ultra-thin .mi-surface__bg{background:color-mix(in srgb,var(--mi-mat) 42%,transparent)}
.mi-surface--m-thin .mi-surface__bg{background:color-mix(in srgb,var(--mi-mat) 69%,transparent)}
.mi-surface--m-regular .mi-surface__bg{background:var(--mi-mat)}
.mi-surface--m-thick .mi-surface__bg{background:color-mix(in srgb,var(--mi-card) 88%,transparent)}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  .mi-surface__bg{background:var(--mi-card)}
}
</style>
