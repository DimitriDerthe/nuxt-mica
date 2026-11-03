<script lang="ts">
export const playground = {
  props: { label: 'Featured trips' },
  controls: ['loop', 'arrows', 'dots', 'orientation', 'align', 'basis'],
  layout: 'fill',
  height: 320
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const index = ref(0)
const slides = [
  { t: 'Lisbon', d: 'Tiled hills and late sunsets', i: 'globe' },
  { t: 'Kyoto', d: 'Temples, tea and quiet lanes', i: 'bookmark' },
  { t: 'Reykjavik', d: 'Northern lights season', i: 'star' },
  { t: 'Oaxaca', d: 'Markets and mezcal', i: 'heart' }
]
</script>

<template>
  <div class="ex-wrap mi:w-[min(100%,_460px)] mi:mx-auto">
    <MiCarousel v-model="index" v-bind="p">
      <div v-for="s in slides" :key="s.t" class="ex-slide mi:grid mi:content-center mi:justify-items-start mi:gap-1.5 mi:h-50 mi:p-6 mi:box-border mi:rounded-[16px] mi:bg-card mi:shadow-1 mi:text-label">
        <MiIcon class="mi:[.ex-slide_span&]:text-label2" :name="s.i" :size="28" />
        <strong>{{ s.t }}</strong>
        <span class="mi:[.ex-slide_span&]:text-label2">{{ s.d }}</span>
      </div>
    </MiCarousel>
  </div>
</template>

<style scoped>
.ex-slide strong { font-size: 22px; }
.ex-slide span { font-size: 15px; }
</style>
