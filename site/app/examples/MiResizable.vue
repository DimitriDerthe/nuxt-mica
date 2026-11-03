<script lang="ts">
export const playground = {
  controls: ['orientation', 'withHandle', 'minSize', 'maxSize', 'step'],
  props: { withHandle: true },
  layout: 'fill',
  height: 320
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const sizes = ref([35, 65])
</script>

<template>
  <div class="ex-box mi:h-60 mi:w-[min(100%,_520px)] mi:mx-auto mi:rounded-[16px] mi:bg-card mi:shadow-1 mi:overflow-hidden">
    <MiResizable v-model="sizes" v-bind="p">
      <template #panel-0>
        <div class="ex-pane mi:grid mi:content-start mi:gap-1 mi:p-4 mi:text-label"><strong>Inbox</strong><span class="mi:[.ex-pane_&]:text-[14px] mi:[.ex-pane_&]:text-label2">12 unread</span></div>
      </template>
      <template #panel-1>
        <div class="ex-pane mi:grid mi:content-start mi:gap-1 mi:p-4 mi:text-label"><strong>Welcome aboard</strong><span class="mi:[.ex-pane_&]:text-[14px] mi:[.ex-pane_&]:text-label2">Drag the handle to resize.</span></div>
      </template>
    </MiResizable>
  </div>
</template>
