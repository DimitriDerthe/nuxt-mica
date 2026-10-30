<script lang="ts">
export const playground = {
  props: { label: 'Support chat' },
  controls: ['autoScroll', 'initialPosition', 'busy'],
  layout: 'fill',
  height: 360
}
</script>

<script setup lang="ts">
defineProps<{ p: Record<string, unknown> }>()
const rows = [
  { id: 'm1', me: true, text: 'Hi, my export keeps failing.' },
  { id: 'm2', me: false, text: 'Sorry about that. Which format are you using?' },
  { id: 'm3', me: true, text: 'CSV, around 40k rows.' },
  { id: 'm4', me: false, text: 'Thanks. We raised the row limit last week, could you retry?' },
  { id: 'm5', me: true, text: 'Retrying now.' },
  { id: 'm6', me: true, text: 'It worked, thank you!' },
  { id: 'm7', me: false, text: 'Great to hear. Anything else I can help with?' }
]
</script>

<template>
  <div class="ex-box">
    <MiMessageScroller v-bind="p">
      <MiMessageScrollerItem v-for="r in rows" :key="r.id" :message-id="r.id" :scroll-anchor="r.me">
        <MiMessage :align="r.me ? 'end' : 'start'">
          <MiBubble :align="r.me ? 'end' : 'start'" :variant="r.me ? 'default' : 'secondary'">{{ r.text }}</MiBubble>
        </MiMessage>
      </MiMessageScrollerItem>
    </MiMessageScroller>
  </div>
</template>

<style scoped>
.ex-box { height: 300px; width: min(100%, 420px); margin-inline: auto; border-radius: 16px; background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
</style>
