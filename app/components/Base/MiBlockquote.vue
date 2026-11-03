<script setup lang="ts">
/** Quotation as a semantic figure with blockquote and figcaption, with an optional author, role, avatar and source link; plain, bordered or card look. */
import { useSlots } from 'vue'

const slots = useSlots()

defineSlots<{
  /** The quoted text (when `quote` is not used). */
  default?(): unknown
  /** Replaces the author block in the caption. */
  cite?(): unknown
  /** Avatar or logo shown beside the author. */
  avatar?(): unknown
}>()

withDefaults(defineProps<{
  /** Look: `plain` has just the text, `bordered` adds a brand rule on the leading edge, `card` puts it on an elevated surface with a large quote mark. */
  variant?: 'plain' | 'bordered' | 'card'
  /** Quoted text, as a shortcut for the default slot. */
  quote?: string
  /** Author of the quote, shown in the caption. */
  cite?: string
  /** Secondary caption line, e.g. job title or publication. */
  role?: string
  /** URL of the source, set as the `cite` attribute of the blockquote. */
  source?: string
  /** Text size. */
  size?: 'md' | 'lg'
}>(), { variant: 'plain', size: 'md' })
</script>

<template>
  <figure class="mi-bq mi:relative mi:m-0 mi:p-0 mi:font-mi mi:text-label mi:flex mi:flex-col mi:gap-4 mi:box-border" :class="[`is-${variant}`, `is-${size}`]">
    <blockquote class="mi-bq__quote mi:m-0 mi:text-[17px] mi:leading-[1.55] mi:tracking-[-.005em] mi:text-pretty mi:[.is-lg_&]:text-[clamp(20px,2.4vw_+_10px,28px)] mi:[.is-lg_&]:leading-[1.35] mi:[.is-lg_&]:font-medium mi:[.is-lg_&]:tracking-[-.015em] mi:[.is-card>&]:relative" :cite="source"><slot>{{ quote }}</slot></blockquote>
    <figcaption v-if="cite || slots.cite || slots.avatar" class="mi-bq__cap mi:flex mi:items-center mi:gap-3 mi:min-w-0 mi:[.is-card>&]:relative">
      <span v-if="slots.avatar" class="mi-bq__avatar mi:flex-[none] mi:flex"><slot name="avatar" /></span>
      <span class="mi-bq__who mi:flex mi:flex-col mi:min-w-0">
        <slot name="cite">
          <cite v-if="cite" class="mi-bq__name mi:not-italic mi:text-[14px] mi:font-semibold mi:text-label">{{ cite }}</cite>
          <span v-if="role" class="mi-bq__role mi:text-[13px] mi:text-label2">{{ role }}</span>
        </slot>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.is-bordered{padding-left:20px}
.is-bordered::before{content:'';position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:2px;background:linear-gradient(var(--mi-p),var(--mi-s,var(--mi-p)))}
.is-card{padding:28px 28px 24px;border-radius:var(--mi-radius-xl,22px);background:var(--mi-card);box-shadow:var(--mi-sh2);overflow:hidden}
.is-card::before{content:'\201C';position:absolute;right:20px;top:-6px;font-family:Georgia,'Times New Roman',serif;font-size:96px;line-height:1;color:var(--mi-p-tint2,var(--mi-p-tint));pointer-events:none}
</style>
