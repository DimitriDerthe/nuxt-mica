<script lang="ts">
export const playground = {
  props: {
    items: [
      { id: 'ex-ss-intro', label: 'Introduction' },
      { id: 'ex-ss-install', label: 'Installation' },
      { id: 'ex-ss-usage', label: 'Usage' },
      { id: 'ex-ss-props', label: 'Props', level: 2 },
      { id: 'ex-ss-slots', label: 'Slots', level: 2 }
    ],
    offset: 16
  },
  controls: ['offset'],
  height: 360
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()
const active = ref<string | undefined>('ex-ss-intro')
const sections = (props.p.items as { id: string, label: string }[])
</script>

<template>
  <div class="ex-ss mi:grid-cols-[160px_minmax(0,_1fr)] mi:w-[min(100%,_560px)]">
    <MiScrollspy v-model:active="active" v-bind="p" class="ex-ss__nav" />
    <div class="ex-ss__body">
      <section v-for="s in sections" :id="s.id" :key="s.id">
        <MiText variant="headline">{{ s.label }}</MiText>
        <MiText variant="body" tone="label2">Scroll the page and the outline on the left follows the section in view.</MiText>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ex-ss { display: grid; gap: 16px; }
.ex-ss__nav { align-self: start; position: sticky; top: 0; }
.ex-ss section { display: grid; gap: 6px; min-height: 180px; padding-bottom: 24px; }
</style>
