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
  <div class="ex mi:w-[min(100%,_360px)] mi:rounded-[14px] mi:overflow-hidden mi:shadow-1">
    <MiAspectRatio v-bind="p">
      <div class="frame mi:w-full mi:h-full mi:grid mi:place-content-center mi:justify-items-center mi:gap-1.5 mi:bg-card mi:text-label2 mi:text-[14px]">
        <MiIcon name="image" :size="28" />
        <span>Cover image</span>
      </div>
    </MiAspectRatio>
  </div>
</template>
