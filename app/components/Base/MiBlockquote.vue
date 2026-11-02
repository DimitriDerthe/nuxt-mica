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
  <figure class="mi-bq" :class="[`is-${variant}`, `is-${size}`]">
    <blockquote class="mi-bq__quote" :cite="source"><slot>{{ quote }}</slot></blockquote>
    <figcaption v-if="cite || slots.cite || slots.avatar" class="mi-bq__cap">
      <span v-if="slots.avatar" class="mi-bq__avatar"><slot name="avatar" /></span>
      <span class="mi-bq__who">
        <slot name="cite">
          <cite v-if="cite" class="mi-bq__name">{{ cite }}</cite>
          <span v-if="role" class="mi-bq__role">{{ role }}</span>
        </slot>
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.mi-bq{position:relative;margin:0;padding:0;font-family:var(--mi-font);color:var(--mi-label);display:flex;flex-direction:column;gap:16px;box-sizing:border-box}
.mi-bq__quote{margin:0;font-size:17px;line-height:1.55;letter-spacing:-.005em;text-wrap:pretty}
.is-lg .mi-bq__quote{font-size:clamp(20px,2.4vw + 10px,28px);line-height:1.35;font-weight:500;letter-spacing:-.015em}
.mi-bq__cap{display:flex;align-items:center;gap:12px;min-width:0}
.mi-bq__avatar{flex:none;display:flex}
.mi-bq__who{display:flex;flex-direction:column;min-width:0}
.mi-bq__name{font-style:normal;font-size:14px;font-weight:600;color:var(--mi-label)}
.mi-bq__role{font-size:13px;color:var(--mi-label2)}
.is-bordered{padding-left:20px}
.is-bordered::before{content:'';position:absolute;left:0;top:2px;bottom:2px;width:3px;border-radius:2px;background:linear-gradient(var(--mi-p),var(--mi-s,var(--mi-p)))}
.is-card{padding:28px 28px 24px;border-radius:var(--mi-radius-xl,22px);background:var(--mi-card);box-shadow:var(--mi-sh2);overflow:hidden}
.is-card::before{content:'\201C';position:absolute;right:20px;top:-6px;font-family:Georgia,'Times New Roman',serif;font-size:96px;line-height:1;color:var(--mi-p-tint2,var(--mi-p-tint));pointer-events:none}
.is-card > *{position:relative}
</style>
