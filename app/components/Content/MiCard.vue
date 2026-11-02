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
    <div v-if="hasMedia" class="mi-card__media" :style="{ height: mediaHeight + 'px' }">
      <slot name="media">
        <img class="mi-card__img" :src="image" :alt="imageAlt ?? ''" loading="lazy" decoding="async">
      </slot>
    </div>
    <div class="mi-card__body">
      <div v-if="hasHead" class="mi-card__head"><slot name="header" /></div>
      <template v-if="hasText">
        <span v-if="eyebrow" class="mi-card__eyebrow">{{ eyebrow }}</span>
        <component :is="heading" v-if="title" class="mi-card__title">{{ title }}</component>
        <p v-if="description" class="mi-card__desc">{{ description }}</p>
      </template>
      <slot />
      <template v-if="hasFoot">
        <span class="mi-card__grow" />
        <div class="mi-card__foot"><slot name="footer" /></div>
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
.mi-card__media{position:relative;flex:none;overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.mi-card__img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.mi-card__body{display:flex;flex:1;flex-direction:column;gap:6px;min-width:0}
.mi-card--pad-md .mi-card__body{padding:22px;gap:14px}
.mi-card--pad-lg .mi-card__body{padding:28px;gap:16px}
.mi-card--pad-media .mi-card__body{padding:18px 20px 20px}
.mi-card--pad-none .mi-card__body{padding:0}
.mi-card--center .mi-card__body{align-items:center;text-align:center}
.mi-card--pad-md.mi-card--center .mi-card__body{gap:10px}
.mi-card__head{align-self:stretch}
.mi-card__eyebrow{font-size:12px;font-weight:600;color:var(--mi-s-text);text-transform:uppercase;letter-spacing:.04em}
.mi-card__title{margin:0;font-size:20px;line-height:25px;font-weight:700;letter-spacing:-.015em}
.mi-card__desc{margin:0;font-size:15px;line-height:21px;color:var(--mi-label2)}
.mi-card__grow{flex:1}
.mi-card__foot{align-self:stretch;margin-top:4px}
</style>
