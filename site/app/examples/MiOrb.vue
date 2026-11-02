<script lang="ts">
export const playground = {
  props: { state: 'thinking', size: 'lg' },
  controls: ['state', 'size', 'tone', 'speed', 'density', 'paused'],
  layout: 'fill',
  height: 420
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()

const states = [
  { state: 'thinking', text: 'Thinking…' },
  { state: 'searching', text: 'Searching 3 sources…' },
  { state: 'working', text: 'Running the migration…' },
  { state: 'listening', text: 'Listening…' },
  { state: 'composing', text: 'Writing the summary…' },
  { state: 'connecting', text: 'Connecting to Linear…' },
  { state: 'idle', text: 'Ready when you are' }
] as const
</script>

<template>
  <div class="ex">
    <div class="hero">
      <MiOrb v-bind="p" />
      <MiShimmerText :text="states.find(s => s.state === p.state)?.text ?? 'Thinking…'" class="hero__text" :paused="!!p.paused" />
    </div>
    <ul class="grid">
      <li v-for="s in states" :key="s.state" class="pill">
        <MiOrb :state="s.state" size="sm" label="" />
        <MiShimmerText :text="s.text" :paused="s.state === 'idle'" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 22px; width: 100%; container-type: inline-size; }
.hero { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.hero__text { font-size: 15px; }
.grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 520px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 820px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.pill { display: flex; align-items: center; gap: 10px; min-width: 0; padding: 10px 14px; border-radius: 14px; background: var(--mi-card); box-shadow: var(--mi-sh1); font-size: 14px; }
</style>
