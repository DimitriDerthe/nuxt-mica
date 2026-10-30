<script setup lang="ts">
/** Text with the system-style type scale (largeTitle to caption2), semantic tag, tone and optional line clamp; use it for all copy. */
import { computed } from 'vue'

export type MiTextVariant = 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' | 'body' | 'callout' | 'subheadline' | 'footnote' | 'caption' | 'caption2'
export type MiTextTone = 'inherit' | 'label' | 'label2' | 'label3' | 'primary' | 'secondary' | 'red' | 'orange' | 'green'
export type MiTextWeight = 'regular' | 'medium' | 'semibold' | 'bold'

const props = withDefaults(defineProps<{
  /** Type scale step that sets size, line height, default weight and default element. */
  variant?: MiTextVariant
  /** Element to render. Defaults to a heading for titles and `p` otherwise. */
  as?: string
  /** `primary`/`secondary` are the BRAND colors; for muted body text use `label2` (or `label3` for hints). */
  tone?: MiTextTone
  /** Overrides the variant's default font weight. */
  weight?: MiTextWeight
  /** Horizontal text alignment, flipping with the reading direction. */
  align?: 'start' | 'center' | 'end'
  /** Clamp to this many lines with an ellipsis (1 = single-line truncation). */
  lines?: number
  /** Tabular (fixed-width) numerals, for aligned figures and counters. */
  tabular?: boolean
  /** Balance line lengths when wrapping (text-wrap: balance), for short headings. */
  balance?: boolean
}>(), { variant: 'body', tone: 'inherit' })

const TAGS: Record<MiTextVariant, string> = {
  largeTitle: 'h1', title1: 'h2', title2: 'h3', title3: 'h4',
  headline: 'p', body: 'p', callout: 'p', subheadline: 'p', footnote: 'p', caption: 'p', caption2: 'p'
}
const WEIGHTS: Record<MiTextWeight, number> = { regular: 400, medium: 500, semibold: 600, bold: 700 }

const tag = computed(() => props.as ?? TAGS[props.variant])
const style = computed(() => {
  const s: Record<string, string | number> = {}
  if (props.weight) s.fontWeight = WEIGHTS[props.weight]
  if (props.align) s.textAlign = props.align
  if (props.lines && props.lines > 0) s['--mi-text-lines'] = props.lines
  return s
})

defineSlots<{
  /** Text content. */
  default?(): unknown
}>()
</script>

<template>
  <component
    :is="tag"
    class="mi-text"
    :class="[`mi-text--${variant}`, tone !== 'inherit' && `mi-text--tone-${tone}`, { 'mi-text--clamp': lines && lines > 0, 'mi-text--tab': tabular, 'mi-text--balance': balance }]"
    :style="style"
  >
    <slot />
  </component>
</template>

<style scoped>
.mi-text{margin:0;font-family:var(--mi-font);font-weight:400;overflow-wrap:break-word}
.mi-text--largeTitle{font-size:34px;line-height:41px;font-weight:700;letter-spacing:-.03em}
.mi-text--title1{font-size:28px;line-height:34px;font-weight:700;letter-spacing:-.025em}
.mi-text--title2{font-size:22px;line-height:28px;font-weight:700;letter-spacing:-.02em}
.mi-text--title3{font-size:20px;line-height:25px;font-weight:600;letter-spacing:-.015em}
.mi-text--headline{font-size:17px;line-height:22px;font-weight:600;letter-spacing:-.01em}
.mi-text--body{font-size:17px;line-height:22px;letter-spacing:-.01em}
.mi-text--callout{font-size:16px;line-height:21px;letter-spacing:-.01em}
.mi-text--subheadline{font-size:15px;line-height:20px;letter-spacing:-.01em}
.mi-text--footnote{font-size:13px;line-height:18px;letter-spacing:0}
.mi-text--caption{font-size:12px;line-height:16px;letter-spacing:0}
.mi-text--caption2{font-size:11px;line-height:13px;font-weight:500;letter-spacing:.01em;text-transform:uppercase}
.mi-text--tone-label{color:var(--mi-label)}
.mi-text--tone-label2{color:var(--mi-label2)}
.mi-text--tone-label3{color:var(--mi-label3)}
.mi-text--tone-primary{color:var(--mi-p-text)}
.mi-text--tone-secondary{color:var(--mi-s-text)}
.mi-text--tone-red{color:var(--mi-red-t)}
.mi-text--tone-orange{color:var(--mi-orange-t)}
.mi-text--tone-green{color:var(--mi-green-t)}
.mi-text--tab{font-variant-numeric:tabular-nums}
.mi-text--balance{text-wrap:balance}
.mi-text--clamp{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:var(--mi-text-lines);line-clamp:var(--mi-text-lines);overflow:hidden}
</style>
