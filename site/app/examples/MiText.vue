<script lang="ts">
export const playground = {
  props: { variant: 'title1', balance: true },
  controls: ['variant', 'tone', 'weight', 'align', 'lines', 'tabular', 'balance'],
  slot: 'Quiet interfaces, loud ideas.',
  layout: 'fill',
  height: 560
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const scale = [
  ['largeTitle', '34'], ['title1', '28'], ['title2', '22'], ['title3', '20'], ['headline', '17'], ['body', '17'],
  ['callout', '16'], ['subheadline', '15'], ['footnote', '13'], ['caption', '12'], ['caption2', '11']
] as const
</script>

<template>
  <div class="specimen">
    <div class="hero">
      <MiText v-bind="p">Quiet interfaces, loud ideas. Mica sets every word on a calm, readable rhythm.</MiText>
    </div>
    <ol class="scale">
      <li v-for="[v, px] in scale" :key="v" :class="{ on: v === p.variant }">
        <span class="tag">{{ v }} <em>{{ px }}</em></span>
        <MiText :variant="v" :lines="1" as="span" class="sample">The quick brown fox</MiText>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.specimen { display: grid; gap: 20px; width: 100%; max-width: 640px; margin: auto; }
.hero { padding: 20px; border-radius: 18px; background: var(--mi-card); box-shadow: var(--mi-sh1); color: var(--mi-label); }
.scale { display: grid; margin: 0; padding: 0; list-style: none; }
.scale li { display: grid; grid-template-columns: 112px minmax(0, 1fr); align-items: baseline; gap: 12px; padding: 6px 10px; border-radius: 10px; border-bottom: 1px solid var(--mi-sep); color: var(--mi-label); }
.scale li.on { background: var(--mi-p-tint); border-bottom-color: transparent; }
.tag { font: 12px/1.3 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label2); }
.tag em { font-style: normal; color: var(--mi-label3); }
.sample { min-width: 0; }
@media (max-width: 480px) { .scale li { grid-template-columns: 92px minmax(0, 1fr); gap: 8px; } }
</style>
