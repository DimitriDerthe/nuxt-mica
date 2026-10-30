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
  <div class="ex-wrap">
    <MiCarousel v-model="index" v-bind="p">
      <div v-for="s in slides" :key="s.t" class="ex-slide">
        <MiIcon :name="s.i" :size="28" />
        <strong>{{ s.t }}</strong>
        <span>{{ s.d }}</span>
      </div>
    </MiCarousel>
  </div>
</template>

<style scoped>
.ex-wrap { width: min(100%, 460px); margin-inline: auto; }
.ex-slide { display: grid; align-content: center; justify-items: start; gap: 6px; height: 200px; padding: 24px; box-sizing: border-box; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); color: var(--mi-label); }
.ex-slide strong { font-size: 22px; }
.ex-slide span { font-size: 15px; color: var(--mi-label2); }
</style>
