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
    <div class="hero mi:p-5 mi:rounded-[18px] mi:bg-card mi:shadow-1 mi:text-label">
      <MiText v-bind="p">Quiet interfaces, loud ideas. Mica sets every word on a calm, readable rhythm.</MiText>
    </div>
    <ol class="scale mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
      <li class="mi:[.scale_li&]:grid-cols-[112px_minmax(0,_1fr)] mi:[.scale_li&]:items-baseline mi:[.scale_li&]:gap-3 mi:[.scale_li&]:py-1.5 mi:[.scale_li&]:px-2.5 mi:[.scale_li&]:rounded-[10px] mi:max-[480px]:[.scale_li&]:grid-cols-[92px_minmax(0,_1fr)] mi:max-[480px]:[.scale_li&]:gap-2" v-for="[v, px] in scale" :key="v" :class="{ 'on mi:[.scale_&]:bg-p-tint': v === p.variant }">
        <span class="tag mi:[font:12px/1.3_ui-monospace,_'SF_Mono',_Menlo,_monospace] mi:text-label2">{{ v }} <em class="mi:[.tag_&]:not-italic">{{ px }}</em></span>
        <MiText :variant="v" :lines="1" as="span" class="sample mi:[.scale_li&]:grid-cols-[112px_minmax(0,_1fr)] mi:[.scale_li&]:items-baseline mi:[.scale_li&]:gap-3 mi:[.scale_li&]:py-1.5 mi:[.scale_li&]:px-2.5 mi:[.scale_li&]:rounded-[10px] mi:min-w-0 mi:max-[480px]:[.scale_li&]:grid-cols-[92px_minmax(0,_1fr)] mi:max-[480px]:[.scale_li&]:gap-2">The quick brown fox</MiText>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.specimen { display: grid; gap: 20px; width: 100%; max-width: 640px; margin: auto; }
.scale li { display: grid; border-bottom: 1px solid var(--mi-sep); color: var(--mi-label); }
.scale li.on { border-bottom-color: transparent; }
.tag em { color: var(--mi-label3); }
</style>
