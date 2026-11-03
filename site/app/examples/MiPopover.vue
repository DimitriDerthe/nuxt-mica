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
  <div class="ex mi:justify-center">
    <MiPopover v-model="open" v-bind="p" label="Share Atlas">
      <template #trigger="{ attrs }">
        <MiButton v-bind="attrs" variant="tinted" size="small">Share</MiButton>
      </template>
      <div class="panel mi:grid mi:gap-2">
        <div class="title mi:text-[15px] mi:font-semibold mi:text-label">Share “Atlas”</div>
        <p class="sub mi:m-0 mi:text-[13px] mi:leading-[1.4] mi:text-label2">Anyone with the link can view. Only invited people can edit.</p>
        <div class="link mi:flex mi:items-center mi:justify-between mi:gap-2 mi:pt-1.5 mi:pr-1.5 mi:pb-1.5 mi:pl-2.5 mi:rounded-[10px] mi:bg-fill3">
          <code class="mi:[.link_code&]:overflow-hidden mi:[.link_code&]:text-ellipsis">atlas.app/s/k7Qe2</code>
          <MiButton class="mi:[.link_code&]:overflow-hidden mi:[.link_code&]:text-ellipsis" size="mini" :variant="copied ? 'tinted' : 'filled'" @click.stop="copy">{{ copied ? 'Copied' : 'Copy' }}</MiButton>
        </div>
      </div>
    </MiPopover>
  </div>
</template>

<style scoped>
.ex { width: 100%; display: flex; padding-top: 8px; }
.link code { font: 12px ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label); white-space: nowrap; }
</style>
