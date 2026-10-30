<script setup lang="ts">
/** Row boundary inside MiMessageScroller: gives a message a stable id and marks it as a turn anchor. */
import { inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { MI_MESSAGE_SCROLLER_KEY } from '../../composables/useMiMessageScroller'

defineProps<{
  /** Stable id used for scrollToMessage, visibility and anchoring. */
  messageId: string
  /** Marks the row as the start of a turn (usually a user message). */
  scrollAnchor?: boolean
}>()

const el = ref<HTMLElement | null>(null)
const ctx = inject(MI_MESSAGE_SCROLLER_KEY, null)
let stop: (() => void) | undefined
onMounted(() => { if (el.value && ctx) stop = ctx.observe(el.value) })
onBeforeUnmount(() => stop?.())

defineSlots<{
  /** The message content, such as a MiMessage. */
  default?(): unknown
}>()
</script>

<template>
  <div ref="el" class="mi-msi" :data-message-id="messageId" :data-scroll-anchor="scrollAnchor ? '' : undefined"><slot /></div>
</template>

<style scoped>
.mi-msi{min-width:0;content-visibility:auto;contain-intrinsic-size:auto 56px}
</style>
