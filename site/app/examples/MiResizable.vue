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
  <div class="ex-box">
    <MiResizable v-model="sizes" v-bind="p">
      <template #panel-0>
        <div class="ex-pane"><strong>Inbox</strong><span>12 unread</span></div>
      </template>
      <template #panel-1>
        <div class="ex-pane"><strong>Welcome aboard</strong><span>Drag the handle to resize.</span></div>
      </template>
    </MiResizable>
  </div>
</template>

<style scoped>
.ex-box { height: 240px; width: min(100%, 520px); margin-inline: auto; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.ex-pane { display: grid; align-content: start; gap: 4px; padding: 16px; color: var(--mi-label); }
.ex-pane span { font-size: 14px; color: var(--mi-label2); }
</style>
