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
  <div class="ex mi:grid mi:gap-7 mi:justify-items-center mi:w-[min(100%,_420px)]">
    <MiToast v-bind="p" />
    <div class="fire mi:grid mi:gap-2.5 mi:justify-items-center">
      <span class="cap mi:text-[13px] mi:text-label2">Show one for real</span>
      <div class="btns mi:flex mi:flex-wrap mi:justify-center mi:gap-2">
        <MiButton v-for="s in samples" :key="s.tone" variant="gray" size="small" @click="fire(s)">{{ s.label }}</MiButton>
      </div>
    </div>
  </div>
</template>
