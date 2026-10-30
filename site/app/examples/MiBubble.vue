<script lang="ts">
export const playground = {
  props: { variant: 'default', align: 'end' },
  controls: ['variant', 'align', 'reactionsSide', 'reactionsAlign'],
  slot: 'Sounds good, see you at 6.',
  layout: 'fill'
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
</script>

<template>
  <div class="ex-thread">
    <MiBubbleGroup>
      <MiBubble align="start" variant="secondary">Are we still on for dinner tonight?</MiBubble>
      <MiBubble align="start" variant="secondary">I booked a table near the canal.</MiBubble>
    </MiBubbleGroup>
    <MiBubbleGroup>
      <MiBubble v-bind="p">
        Sounds good, see you at 6.
        <template #reactions><span>👍</span><span>2</span></template>
      </MiBubble>
    </MiBubbleGroup>
  </div>
</template>

<style scoped>
.ex-thread { display: grid; gap: 12px; width: min(100%, 420px); margin-inline: auto; }
</style>
