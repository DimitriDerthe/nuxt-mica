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
    <div class="search" aria-hidden="true">
      <MiIcon name="search" :size="16" />
      <span>Search 70 icons</span>
    </div>
    <div class="hero">
      <div class="tile"><MiIcon v-bind="p" /></div>
      <div>
        <MiText variant="headline">{{ p.name || 'custom' }}</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ p.size }} · stroke {{ p.weight }}</MiText>
      </div>
    </div>
    <ul class="grid">
      <li v-for="n in set" :key="n" :class="{ on: n === p.name }">
        <MiIcon :name="n" :size="22" />
        <span>{{ n }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.card { display: grid; gap: 14px; width: min(100%, 340px); padding: 16px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); box-sizing: border-box; }
.search { display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 10px; background: var(--mi-fill3); color: var(--mi-label3); font-size: 15px; }
.hero { display: flex; align-items: center; gap: 14px; }
.tile { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 16px; background: var(--mi-p-tint); color: var(--mi-p-text); flex: none; }
.grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; margin: 0; padding: 0; list-style: none; }
.grid li { display: grid; justify-items: center; gap: 4px; padding: 10px 2px 8px; border-radius: 12px; color: var(--mi-label); background: var(--mi-fill4); }
.grid li span { font-size: 11px; color: var(--mi-label2); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.grid li.on { background: var(--mi-p-tint); color: var(--mi-p-text); }
</style>
