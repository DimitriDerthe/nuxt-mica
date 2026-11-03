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
  <div class="ex-box mi:shadow-1">
    <MiCollapsible v-model:open="open" v-bind="p">
      <div class="ex-body mi:grid mi:gap-2 mi:pt-2 mi:px-0 mi:pb-3 mi:text-[15px] mi:text-label2">
        <span>Retry failed jobs automatically</span>
        <span>Keep logs for 30 days</span>
      </div>
    </MiCollapsible>
  </div>
</template>

<style scoped>
.ex-box { width: min(100%, 320px); padding: 8px 16px; border-radius: 14px; background: var(--mi-card); box-sizing: border-box; }
</style>
