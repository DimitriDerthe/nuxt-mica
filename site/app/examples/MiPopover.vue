<script lang="ts">
export const playground = {
  props: { width: '280px' },
  controls: ['placement', 'arrow', 'width', 'offset', 'flush', 'closeOnOutside', 'disabled'],
  height: 320,
  layout: 'start'
}
</script>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ p: Record<string, unknown> }>()
const open = ref(false)
const copied = ref(false)

function copy() {
  copied.value = true
  setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <div class="ex">
    <MiPopover v-model="open" v-bind="p" label="Share Atlas">
      <template #trigger="{ attrs }">
        <MiButton v-bind="attrs" variant="tinted" size="small">Share</MiButton>
      </template>
      <div class="panel">
        <div class="title">Share “Atlas”</div>
        <p class="sub">Anyone with the link can view. Only invited people can edit.</p>
        <div class="link">
          <code>atlas.app/s/k7Qe2</code>
          <MiButton size="mini" :variant="copied ? 'tinted' : 'filled'" @click.stop="copy">{{ copied ? 'Copied' : 'Copy' }}</MiButton>
        </div>
      </div>
    </MiPopover>
  </div>
</template>

<style scoped>
.ex { width: 100%; display: flex; justify-content: center; padding-top: 8px; }
.panel { display: grid; gap: 8px; }
.title { font-size: 15px; font-weight: 600; color: var(--mi-label); }
.sub { margin: 0; font-size: 13px; line-height: 1.4; color: var(--mi-label2); }
.link { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px 6px 10px; border-radius: 10px; background: var(--mi-fill3); }
.link code { font: 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
