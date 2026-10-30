<script setup lang="ts">
/** Container that keeps its content at a fixed width-to-height ratio. */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** Width divided by height, e.g. `16 / 9`. */
  ratio: number
}>(), {})

const style = computed(() => ({ aspectRatio: String(props.ratio > 0 ? props.ratio : 1) }))

defineSlots<{
  /** Content sized to fill the ratio box, such as an image or video. */
  default?(): unknown
}>()
</script>

<template>
  <div class="mi-aspect" :style="style"><slot /></div>
</template>

<style scoped>
.mi-aspect{position:relative;width:100%;overflow:hidden}
.mi-aspect > :deep(img),.mi-aspect > :deep(video){width:100%;height:100%;object-fit:cover;display:block}
</style>
