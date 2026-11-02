<script setup lang="ts">
/** Vertical activity or history feed: a semantic ordered list of entries on a connecting line, from the `items` shortcut or composed MiTimelineItem parts, optionally alternating sides at wide widths. */
import MiTimelineItem from './MiTimelineItem.vue'
import type { MiTimelineStatus, MiTimelineTone } from './MiTimelineItem.vue'
import type { MiIconName } from '../../utils/miIcons'

export interface MiTimelineEntry {
  title: string
  description?: string
  time?: string | Date
  icon?: MiIconName
  tone?: MiTimelineTone
  status?: MiTimelineStatus
}

defineSlots<{
  /** MiTimelineItem parts, used instead of `items`. */
  default?(): unknown
}>()

withDefaults(defineProps<{
  /** Entries to render; each takes the same fields as MiTimelineItem. Leave empty to compose parts in the default slot. */
  items?: MiTimelineEntry[]
  /** `alternate` places entries on both sides of a central line once the container is at least 640px wide; narrower it stays one column. */
  align?: 'start' | 'alternate'
  /** Accessible name of the list. */
  ariaLabel?: string
}>(), { align: 'start', ariaLabel: 'Timeline' })
</script>

<template>
  <ol class="mi-tl" :class="align === 'alternate' ? 'is-alternate' : 'is-start'" :aria-label="ariaLabel">
    <slot>
      <MiTimelineItem v-for="(it, i) in items" :key="i" v-bind="it" />
    </slot>
  </ol>
</template>

<style scoped>
.mi-tl{container:mi-tl / inline-size;list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
</style>
