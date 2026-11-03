<template>
  <div ref="root" class="bt mi:relative mi:aspect-[16_/_10] mi:overflow-hidden mi:rounded-[12px] mi:pointer-events-none mi:select-none mi:[contain:strict] mi:[background:radial-gradient(circle_at_1px_1px,_var(--mi-fill3)_1px,_transparent_0)_0_0_/_16px_16px,_var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)]" aria-hidden="true" inert>
    <div v-if="block" class="bt__scale mi:absolute mi:top-0 mi:left-0 mi:p-7 mi:box-border mi:origin-[0_0]" :style="{ width: CANVAS + 'px', transform: `scale(${scale})` }">
      <component :is="block" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { loadBlock } from '~/blocks/catalog'

const p = defineProps<{ family: string, category: string, file?: string }>()

/** Desktop-like width the block is laid out at before being scaled into the card. */
const CANVAS = 1040

const root = ref<HTMLElement>()
const block = shallowRef<Component | null>(null)
const scale = ref(.3)

function fit() {
  if (root.value) scale.value = root.value.clientWidth / CANVAS
}

// Blocks load only when their card nears the viewport; the scale follows the card width.
onMounted(() => {
  const load = p.file ? loadBlock(p.family, p.category, p.file) : undefined
  if (!load || !root.value) return
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(root.value)
  const io = new IntersectionObserver(async (entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    io.disconnect()
    const mod = await load() as { default: Component }
    block.value = markRaw(mod.default)
  }, { rootMargin: '300px' })
  io.observe(root.value)
  onBeforeUnmount(() => { io.disconnect(); ro.disconnect() })
})

onErrorCaptured(() => { block.value = null; return false })
</script>

<style scoped>
.bt__scale { animation: bt-in var(--mi-dur-3) var(--mi-ease) backwards; }
@keyframes bt-in { from { opacity: 0; } }
</style>
