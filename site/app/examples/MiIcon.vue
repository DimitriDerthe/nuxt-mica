<script lang="ts">
export const playground = {
  props: { name: 'bell', size: '32px', weight: '1.9' },
  controls: ['name', 'size', 'weight', 'filled', 'spin'],
  height: 380
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const set = ['home', 'search', 'calendar', 'folder', 'people', 'settings', 'heart', 'star', 'share', 'lock', 'chat', 'image'] as const
</script>

<template>
  <div class="card">
    <div class="search mi:flex mi:items-center mi:gap-2 mi:h-9 mi:py-0 mi:px-3 mi:rounded-[10px] mi:bg-fill3 mi:text-label3 mi:text-[15px]" aria-hidden="true">
      <MiIcon name="search" :size="16" />
      <span>Search 70 icons</span>
    </div>
    <div class="hero mi:flex mi:items-center mi:gap-3.5">
      <div class="tile mi:grid mi:place-items-center mi:w-16 mi:h-16 mi:rounded-[16px] mi:bg-p-tint mi:text-p-text mi:flex-[none]"><MiIcon v-bind="p" /></div>
      <div>
        <MiText variant="headline">{{ p.name || 'custom' }}</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ p.size }} · stroke {{ p.weight }}</MiText>
      </div>
    </div>
    <ul class="grid mi:grid mi:grid-cols-4 mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]">
      <li class="mi:[.grid_li&]:justify-items-center mi:[.grid_li&]:gap-1 mi:[.grid_li&]:pt-2.5 mi:[.grid_li&]:px-0.5 mi:[.grid_li&]:pb-2 mi:[.grid_li&]:rounded-[12px]" v-for="n in set" :key="n" :class="{ on: n === p.name }">
        <MiIcon class="mi:[.grid_li&]:justify-items-center mi:[.grid_li&]:gap-1 mi:[.grid_li&]:pt-2.5 mi:[.grid_li&]:px-0.5 mi:[.grid_li&]:pb-2 mi:[.grid_li&]:rounded-[12px] mi:[.grid_li_span&]:text-[11px] mi:[.grid_li_span&]:text-label2 mi:[.grid_li_span&]:max-w-full mi:[.grid_li_span&]:text-ellipsis mi:[.grid_li_span&]:whitespace-nowrap" :name="n" :size="22" />
        <span class="mi:[.grid_li_span&]:text-[11px] mi:[.grid_li_span&]:text-label2 mi:[.grid_li_span&]:max-w-full mi:[.grid_li_span&]:text-ellipsis mi:[.grid_li_span&]:whitespace-nowrap">{{ n }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 340px); padding: 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.grid li { display: grid; color: var(--mi-label); background: var(--mi-fill4); }
.grid li span { overflow: hidden; }
.grid li.on { background: var(--mi-p-tint); color: var(--mi-p-text); }
</style>
