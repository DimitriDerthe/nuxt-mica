<script setup lang="ts">
/** Prose styles for headings, paragraphs, blockquotes, lists, inline code, lead and muted text. */
import { computed } from 'vue'
import { miSafeTag } from '../../utils/miSafe'

export type MiTypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'blockquote' | 'ul' | 'ol' | 'table' | 'code' | 'lead' | 'large' | 'small' | 'muted'

const props = withDefaults(defineProps<{
  /** Style to apply; also picks the default element. */
  variant?: MiTypographyVariant
  /** Element to render instead of the default. */
  as?: string
}>(), { variant: 'p' })

const TAGS: Record<MiTypographyVariant, string> = {
  h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', p: 'p', blockquote: 'blockquote', ul: 'ul', ol: 'ol', table: 'table',
  code: 'code', lead: 'p', large: 'div', small: 'small', muted: 'p'
}
const tag = computed(() => miSafeTag(props.as, TAGS[props.variant]))

defineSlots<{
  /** Content styled with the chosen prose variant. */
  default?(): unknown
}>()
</script>

<template>
  <component :is="tag" class="mi-typo" :class="`mi-typo--${variant}`"><slot /></component>
</template>

<style scoped>
.mi-typo{margin:0;font-family:var(--mi-font);color:var(--mi-label);overflow-wrap:break-word}
.mi-typo--h1{font-size:36px;line-height:40px;font-weight:800;text-align:inherit;letter-spacing:-.03em;text-wrap:balance}
.mi-typo--h2{font-size:28px;line-height:34px;font-weight:600;letter-spacing:-.025em;padding-bottom:8px;border-bottom:1px solid var(--mi-sep)}
.mi-typo--h3{font-size:22px;line-height:28px;font-weight:600;letter-spacing:-.02em}
.mi-typo--h4{font-size:20px;line-height:26px;font-weight:600;letter-spacing:-.015em}
.mi-typo--p{font-size:16px;line-height:26px}
.mi-typo--p + .mi-typo--p{margin-top:20px}
.mi-typo--blockquote{border-inline-start:2px solid var(--mi-sep);padding-inline-start:16px;font-style:italic;font-size:16px;line-height:26px;color:var(--mi-label2)}
.mi-typo--ul,.mi-typo--ol{padding-inline-start:24px;font-size:16px;line-height:26px}
.mi-typo--ul{list-style:disc}
.mi-typo--ol{list-style:decimal}
.mi-typo--ul,.mi-typo--ol{margin-block:24px}
.mi-typo--ul > :deep(li)+:deep(li),.mi-typo--ol > :deep(li)+:deep(li){margin-top:8px}
.mi-typo--table{display:table;width:100%;border-collapse:collapse;margin-block:24px;font-size:14px}
.mi-typo--table :deep(tr){border-top:1px solid var(--mi-sep)}
.mi-typo--table :deep(tr:nth-child(even)){background:var(--mi-fill2)}
.mi-typo--table :deep(th),.mi-typo--table :deep(td){border:1px solid var(--mi-sep);padding:8px 16px;text-align:start}
.mi-typo--table :deep(th){font-weight:700}
.mi-typo--code{display:inline-block;padding:2px 6px;border-radius:var(--mi-radius-s);background:var(--mi-fill2);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:14px;font-weight:600}
.mi-typo--lead{font-size:20px;line-height:28px;color:var(--mi-label2)}
.mi-typo--large{font-size:18px;line-height:24px;font-weight:600}
.mi-typo--small{font-size:14px;line-height:14px;font-weight:500}
.mi-typo--muted{font-size:14px;line-height:20px;color:var(--mi-label2)}
</style>
