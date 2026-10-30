<script setup lang="ts">
/** Media slot of an attachment: an icon tile, or a full image when variant is image. */
withDefaults(defineProps<{
  /** `image` fills the tile with the slotted img. */
  variant?: 'icon' | 'image'
}>(), { variant: 'icon' })

defineSlots<{
  /** Icon or img shown in the tile. */
  default?(): unknown
}>()
</script>

<template>
  <span class="mi-att__media" :class="`is-${variant}`"><slot /></span>
</template>
