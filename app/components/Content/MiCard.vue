<script setup lang="ts">
/** Surface card with optional media, title, description and header/footer slots. Use for content tiles; `href` or `to` makes it a link. */
import { computed, resolveComponent, useSlots } from 'vue'
import { miSafeHref } from '../../utils/miSafe'

defineSlots<{
  /** Custom media area replacing the `image`; shown full-bleed on top. */
  media?(): unknown
  /** Extra content above the eyebrow and title, e.g. badges. */
  header?(): unknown
  /** Main body content below the text. */
  default?(): unknown
  /** Footer pinned to the bottom of the card, e.g. actions. */
  footer?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** `elevated`: soft shadow. `outlined`: hairline border. `filled`: tinted fill, no shadow. */
  variant?: 'elevated' | 'outlined' | 'filled'
  /** Body padding. `auto` uses the compact media layout when a media slot or image exists. */
  padding?: 'none' | 'auto' | 'lg'
  /** `center` centers the body text and footer content. */
  align?: 'start' | 'center'
  /** Cover image URL, rendered full-bleed on top. */
  image?: string
  /** Alt text for `image`. */
  imageAlt?: string
  /** Height of the media area in px. */
  mediaHeight?: number
  /** Small uppercase line above the title. */
  eyebrow?: string
  /** Heading of the card. */
  title?: string
  /** Supporting paragraph under the title. */
  description?: string
  /** Heading level for the title. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Renders the whole card as a link. */
  href?: string
  /** Router link target (NuxtLink). Takes precedence over `href`. */
  to?: string
}>(), { variant: 'elevated', padding: 'auto', align: 'start', mediaHeight: 168, headingLevel: 3 })

const slots = useSlots()
const hasMedia = computed(() => !!(props.image || slots.media))
const tag = computed(() => (props.to ? resolveComponent('NuxtLink') : props.href ? 'a' : 'article'))
const link = computed(() => (props.to ? { to: props.to } : props.href ? { href: miSafeHref(props.href) } : {}))
const hasText = computed(() => !!(props.eyebrow || props.title || props.description))
const hasHead = computed(() => !!slots.header)
const hasFoot = computed(() => !!slots.footer)
const heading = computed(() => `h${props.headingLevel}`)
</script>

<template>
  <component
    :is="tag"
    v-bind="link"
    class="mi-card"
    :class="[`mi-card--${variant}`, `mi-card--${align}`, `mi-card--pad-${padding === 'auto' ? (hasMedia ? 'media' : 'md') : padding}`, { 'mi-card--link': href || to }]"
  >
    <div v-if="hasMedia" class="mi-card__media mi:relative mi:flex-[none] mi:overflow-hidden mi:flex mi:flex-col mi:items-center mi:justify-center mi:gap-1.5" :style="{ height: mediaHeight + 'px' }">
      <slot name="media">
        <img class="mi-card__img mi:absolute mi:inset-0 mi:w-full mi:h-full mi:object-cover mi:block" :src="image" :alt="imageAlt ?? ''" loading="lazy" decoding="async">
      </slot>
    </div>
    <div class="mi-card__body mi:flex mi:flex-1 mi:flex-col mi:gap-1.5 mi:min-w-0 mi:[.mi-card--center_&]:items-center mi:[.mi-card--center_&]:text-center">
      <div v-if="hasHead" class="mi-card__head mi:self-stretch"><slot name="header" /></div>
      <template v-if="hasText">
        <span v-if="eyebrow" class="mi-card__eyebrow mi:text-[12px] mi:font-semibold mi:text-s-text mi:uppercase mi:tracking-[.04em]">{{ eyebrow }}</span>
        <component :is="heading" v-if="title" class="mi-card__title">{{ title }}</component>
        <p v-if="description" class="mi-card__desc mi:m-0 mi:text-[15px] mi:leading-[21px] mi:text-label2">{{ description }}</p>
      </template>
      <slot />
      <template v-if="hasFoot">
        <span class="mi-card__grow mi:flex-1" />
        <div class="mi-card__foot mi:self-stretch mi:mt-1"><slot name="footer" /></div>
      </template>
    </div>
  </component>
</template>

<style scoped>
.mi-card{position:relative;display:flex;flex-direction:column;min-width:0;border-radius:20px;background:var(--mi-card);color:var(--mi-label);font-family:var(--mi-font);overflow:hidden;text-decoration:none;box-shadow:var(--mi-sh1)}
.mi-card--outlined{box-shadow:inset 0 0 0 .5px var(--mi-sep2)}
.mi-card--filled{background:var(--mi-fill4);box-shadow:none}
.mi-card--link{transition:transform var(--mi-dur-2) var(--mi-ease)}
@media (hover:hover){.mi-card--link:hover{transform:translate3d(0,-2px,0)}}
.mi-card--link:active{transform:scale(.99)}
.mi-card--pad-md .mi-card__body{padding:22px;gap:14px}
.mi-card--pad-lg .mi-card__body{padding:28px;gap:16px}
.mi-card--pad-media .mi-card__body{padding:18px 20px 20px}
.mi-card--pad-none .mi-card__body{padding:0}
.mi-card--pad-md.mi-card--center .mi-card__body{gap:10px}
.mi-card__title{margin:0;font-size:20px;line-height:25px;font-weight:700;letter-spacing:-.015em}
</style>
