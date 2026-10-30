<script lang="ts">
export const playground = {
  props: { title: 'Advanced options' },
  controls: ['title', 'disabled']
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
</script>

<template>
  <div class="ex-box">
    <MiCollapsible v-model:open="open" v-bind="p">
      <div class="ex-body">
        <span>Retry failed jobs automatically</span>
        <span>Keep logs for 30 days</span>
      </div>
    </MiCollapsible>
  </div>
</template>

<style scoped>
.ex-box { width: min(100%, 320px); padding: 8px 16px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.ex-body { display: grid; gap: 8px; padding: 8px 0 12px; font-size: 15px; color: var(--mi-label2); }
</style>
