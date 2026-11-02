<script setup lang="ts">
/** Full-card overlay that opens a link or fires click, while actions stay independently clickable. */
import { miSafeHref } from '../../utils/miSafe'
defineProps<{
  /** Renders an anchor when set, otherwise a button. */
  href?: string
}>()
defineEmits<{
  /** Fired on press. */
  click: [e: MouseEvent]
}>()

defineSlots<{
  /** Accessible content of the overlay, such as a visually hidden label. */
  default?(): unknown
}>()
</script>

<template>
  <component :is="href ? 'a' : 'button'" class="mi-att__trigger" :href="miSafeHref(href)" :type="href ? undefined : 'button'" @click="$emit('click', $event)"><slot /></component>
</template>
