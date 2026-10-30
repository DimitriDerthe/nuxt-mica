<script lang="ts">
export const playground = {
  props: { message: 'Link copied', description: 'Anyone with the link can view “Atlas”.', tone: 'success' },
  controls: ['tone', 'variant', 'message', 'description', 'actionLabel', 'dismissible'],
  height: 300
}
</script>

<script setup lang="ts">
type MiToastTone = 'neutral' | 'success' | 'info' | 'warning' | 'error' | 'loading'

const props = defineProps<{ p: Record<string, unknown> }>()
const toast = useMiToast()

const samples: { tone: MiToastTone, label: string, message: string, description?: string }[] = [
  { tone: 'neutral', label: 'Neutral', message: 'Draft saved' },
  { tone: 'success', label: 'Success', message: 'Payment received', description: '$1,280.00 from Northwind Ltd.' },
  { tone: 'info', label: 'Info', message: 'New version available', description: 'Reload to get v2.4.' },
  { tone: 'warning', label: 'Warning', message: 'Storage almost full', description: '92% of 50 GB used.' },
  { tone: 'error', label: 'Error', message: 'Upload failed', description: 'Check your connection and try again.' },
  { tone: 'loading', label: 'Loading', message: 'Exporting report…' }
]

function fire(s: (typeof samples)[number]) {
  const p = props.p
  const id = toast.show({
    message: s.message,
    description: s.description,
    tone: s.tone,
    variant: p.variant as 'solid' | 'material' | undefined,
    dismissible: p.dismissible as boolean | undefined,
    action: p.actionLabel ? { label: String(p.actionLabel) } : undefined
  })
  if (s.tone === 'loading') {
    setTimeout(() => toast.update(id, { tone: 'success', message: 'Report exported', description: 'Q3-revenue.pdf · 2.1 MB', duration: 4000 }), 2200)
  }
}
</script>

<template>
  <div class="ex">
    <MiToast v-bind="p" />
    <div class="fire">
      <span class="cap">Show one for real</span>
      <div class="btns">
        <MiButton v-for="s in samples" :key="s.tone" variant="gray" size="small" @click="fire(s)">{{ s.label }}</MiButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ex { display: grid; gap: 28px; justify-items: center; width: min(100%, 420px); }
.fire { display: grid; gap: 10px; justify-items: center; }
.cap { font-size: 13px; color: var(--mi-label2); }
.btns { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
</style>
