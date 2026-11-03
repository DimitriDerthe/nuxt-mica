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
  <div class="ex mi:gap-5.5 mi:@container">
    <div class="hero mi:flex mi:flex-col mi:items-center mi:gap-3.5">
      <MiOrb v-bind="p" />
      <MiShimmerText :text="states.find(s => s.state === p.state)?.text ?? 'Thinking…'" class="hero__text mi:text-[15px]" :paused="!!p.paused" />
    </div>
    <ul class="grid mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[520px]:grid-cols-2 mi:@[820px]:grid-cols-3">
      <li v-for="s in states" :key="s.state" class="pill mi:flex mi:items-center mi:gap-2.5 mi:min-w-0 mi:py-2.5 mi:px-3.5 mi:rounded-[14px] mi:bg-card mi:shadow-1 mi:text-[14px]">
        <MiOrb :state="s.state" size="sm" label="" />
        <MiShimmerText :text="s.text" :paused="s.state === 'idle'" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ex { display: grid; width: 100%; }
</style>
