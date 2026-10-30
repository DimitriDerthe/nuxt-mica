<script lang="ts">
export const playground = {
  props: { ratio: 1.7778 },
  controls: ['ratio'],
  layout: 'start'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex">
    <MiAspectRatio v-bind="p">
      <div class="frame">
        <MiIcon name="image" :size="28" />
        <span>Cover image</span>
      </div>
    </MiAspectRatio>
  </div>
</template>

<style scoped>
.ex { width: min(100%, 360px); border-radius: 14px; overflow: hidden; box-shadow: var(--mi-sh1); }
.frame { width: 100%; height: 100%; display: grid; place-content: center; justify-items: center; gap: 6px; background: var(--mi-card); color: var(--mi-label2); font-size: 14px; }
</style>
