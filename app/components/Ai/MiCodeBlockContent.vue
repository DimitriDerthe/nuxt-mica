<script setup lang="ts">
/** Scrollable code body; give it a string (split into lines) or MiCodeBlockLine children. */
import { Comment, Fragment, Text, computed, useSlots, type VNode } from 'vue'
import MiCodeBlockLine from './MiCodeBlockLine.vue'

defineProps<{
  /** Wrap long lines instead of scrolling. */
  wrap?: boolean
  /** Show line numbers (copy-safe, via CSS counters). */
  lineNumbers?: boolean
}>()
const slots = useSlots()
/** Plain text of the slot, or null when it holds elements. */
function flat(nodes: VNode[]): string | null {
  let out = ''
  for (const n of nodes) {
    if (n.type === Comment) continue
    if (n.type === Text) out += String(n.children)
    else if (n.type === Fragment && Array.isArray(n.children)) {
      const r = flat(n.children as VNode[])
      if (r === null) return null
      out += r
    } else return null
  }
  return out
}
const textLines = computed(() => {
  const t = flat(slots.default?.() ?? [])
  return t ? t.replace(/\n$/, '').split('\n') : null
})

defineSlots<{
  /** Code as plain text, split into lines, or MiCodeBlockLine elements for per-line emphasis. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-cb__content" :class="{ 'is-wrap': wrap, 'has-ln': lineNumbers }" dir="ltr" tabindex="0" role="region" aria-label="Code">
    <template v-if="textLines"><MiCodeBlockLine v-for="(l, i) in textLines" :key="i">{{ l }}</MiCodeBlockLine></template>
    <slot v-else />
  </div>
</template>
