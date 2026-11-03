<script setup lang="ts">
/** Generic content row with media, title, description and actions slots; outline or muted variants. For settings-style rows prefer MiListItem. */
import { computed } from 'vue'
import { miSafeHref } from '../../utils/miSafe'

defineSlots<{
  /** Content above the row, e.g. a banner or badge. */
  header?(): unknown
  /** Leading visual such as an icon, avatar or image, styled by `mediaVariant`. */
  media?(): unknown
  /** Custom title replacing the `title` text. */
  title?(): unknown
  /** Custom description replacing the `description` text. */
  description?(): unknown
  /** Extra content under the description. */
  default?(): unknown
  /** Trailing controls such as buttons. */
  actions?(): unknown
  /** Content below the row. */
  footer?(): unknown
}>()

const props = withDefaults(defineProps<{
  /** Visual style: transparent, bordered or softly filled. */
  variant?: 'default' | 'outline' | 'muted'
  /** Row density. */
  size?: 'default' | 'sm' | 'xs'
  /** Main line of the row. */
  title?: string
  /** Secondary text under the title. */
  description?: string
  /** Media style: bare, rounded icon tile or image. */
  mediaVariant?: 'default' | 'icon' | 'image'
  /** Renders an anchor, making the whole row a link. */
  href?: string
}>(), { variant: 'default', size: 'default', mediaVariant: 'default' })

const tag = computed(() => (props.href ? 'a' : 'div'))
</script>

<template>
  <component :is="tag" :href="miSafeHref(href)" class="mi-item" :class="[`mi-item--${variant}`, `mi-item--${size}`, { 'mi-item--link': href }]" role="listitem">
    <div v-if="$slots.header" class="mi-item__header mi:flex-[0_0_100%]"><slot name="header" /></div>
    <div v-if="$slots.media" class="mi-item__media mi:flex-[none] mi:grid mi:place-items-center" :class="`mi-item__media--${mediaVariant}`"><slot name="media" /></div>
    <div class="mi-item__body mi:flex-1 mi:min-w-0">
      <div v-if="title || $slots.title" class="mi-item__title mi:font-semibold mi:leading-[1.3]"><slot name="title">{{ title }}</slot></div>
      <div v-if="description || $slots.description" class="mi-item__desc mi:text-label2 mi:text-[13px] mi:leading-[1.4]"><slot name="description">{{ description }}</slot></div>
      <slot />
    </div>
    <div v-if="$slots.actions" class="mi-item__actions mi:flex-[none] mi:flex mi:items-center mi:gap-2"><slot name="actions" /></div>
    <div v-if="$slots.footer" class="mi-item__footer mi:flex-[0_0_100%]"><slot name="footer" /></div>
  </component>
</template>

<style scoped>
.mi-item{display:flex;align-items:center;gap:14px;padding:14px 16px;border:.5px solid transparent;border-radius:12px;color:var(--mi-label);font-family:var(--mi-font);font-size:14px;text-decoration:none;position:relative;isolation:isolate}
.mi-item--link::before{content:"";position:absolute;inset:0;border-radius:inherit;background:var(--mi-fill3);opacity:0;z-index:-1;transition:opacity var(--mi-dur-2) var(--mi-ease)}
.mi-item--sm{gap:10px;padding:8px 12px}
.mi-item--xs{gap:8px;padding:6px 10px;font-size:13px}
.mi-item{flex-wrap:wrap}
.mi-item--outline{border-color:var(--mi-sep)}
.mi-item--muted{background:var(--mi-fill4)}
.mi-item--link{cursor:pointer}
@media (hover:hover){.mi-item--link:hover::before{opacity:1}}
.mi-item--link:focus-visible{outline-offset:2px}
.mi-item__media--icon{width:36px;height:36px;border-radius:10px;background:var(--mi-fill3);color:var(--mi-label2)}
.mi-item__media--image{width:44px;height:44px;border-radius:10px;overflow:hidden}
.mi-item__media--image :deep(img){width:100%;height:100%;object-fit:cover}
</style>
