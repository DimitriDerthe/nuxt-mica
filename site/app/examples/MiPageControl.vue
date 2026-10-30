<script lang="ts">
export const playground = {
  props: { count: 4 },
  controls: ['count'],
  height: 360
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ p: Record<string, unknown> }>()

const slides = [
  { title: 'Plan together', body: 'Share boards with your team and see changes as they happen.' },
  { title: 'Stay in focus', body: 'Mute everything except the projects you pinned today.' },
  { title: 'Ship on time', body: 'Milestones turn amber a week before they are due.' },
  { title: 'Look back', body: 'A weekly digest of what moved, every Friday at 5pm.' }
]
const page = ref(0)
const total = computed(() => Math.max(1, Number(props.p.count) || 1))
const slide = computed(() => slides[Math.min(page.value, total.value - 1) % slides.length])
const last = computed(() => page.value >= total.value - 1)

function next() {
  page.value = last.value ? 0 : page.value + 1
}
</script>

<template>
  <div class="card">
    <div class="art" aria-hidden="true">
      <span class="num">{{ String(page + 1).padStart(2, '0') }}</span>
    </div>
    <h3>{{ slide.title }}</h3>
    <p>{{ slide.body }}</p>
    <MiPageControl v-model="page" v-bind="p" item-label="Step" aria-label="Onboarding" />
    <MiButton block @click="next">{{ last ? 'Get started' : 'Next' }}</MiButton>
  </div>
</template>

<style scoped>
.card { width: min(100%, 300px); padding: 20px; border-radius: 24px; background: var(--mi-card); box-shadow: var(--mi-sh1); display: grid; justify-items: center; gap: 10px; text-align: center; box-sizing: border-box; }
.art { width: 100%; height: 96px; border-radius: 16px; background: var(--mi-p-tint); display: grid; place-items: center; }
.num { font-size: 40px; font-weight: 800; letter-spacing: -0.03em; color: var(--mi-p-text); }
h3 { margin: 6px 0 0; font-size: 19px; font-weight: 700; color: var(--mi-label); }
p { margin: 0; min-height: 40px; font-size: 14px; line-height: 1.4; color: var(--mi-label2); }
</style>
