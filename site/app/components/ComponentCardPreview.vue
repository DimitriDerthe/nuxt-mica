<template>
  <div ref="root" class="cp" aria-hidden="true" inert>
    <div v-if="example" class="cp__stage">
      <div ref="inner" class="cp__scale" :style="{ transform: `scale(${scale})` }"><component :is="example" :p="values" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const p = defineProps<{ name: string }>()

interface PlaygroundMeta { props?: Record<string, unknown> }

/** Width of the virtual canvas the example is laid out in before being scaled down. */
const CANVAS = 420

const modules = import.meta.glob<{ default: Component, playground?: PlaygroundMeta }>('../examples/*.vue')
const root = ref<HTMLElement>()
const inner = ref<HTMLElement>()
const scale = ref(.7)
const example = shallowRef<Component | null>(null)
const values = shallowRef<Record<string, unknown>>({})

/** Example of the component, or of its longest registered parent (MiTabsTrigger uses MiTabs). */
function loaderFor(n: string) {
  if (modules[`../examples/${n}.vue`]) return { load: modules[`../examples/${n}.vue`], part: false }
  const owner = Object.keys(modules).map(k => k.slice(12, -4)).filter(o => n.startsWith(o)).sort((a, b) => b.length - a.length)[0]
  return owner ? { load: modules[`../examples/${owner}.vue`], part: true } : null
}

async function mount() {
  const found = loaderFor(p.name)
  if (!found) return
  const mod = await found.load()
  values.value = { ...mod.playground?.props }
  example.value = markRaw(mod.default)
  await nextTick()
  requestAnimationFrame(fit)
}

/** Scales the example down to fit the thumbnail (never up past 1), keeping a small margin. */
function fit() {
  if (!root.value || !inner.value) return
  const w = Math.max(inner.value.scrollWidth, CANVAS), h = inner.value.scrollHeight
  if (!w || !h) return
  scale.value = Math.max(.25, Math.min(1, (root.value.clientWidth - 24) / w, (root.value.clientHeight - 24) / h))
}

// Examples load only when their card scrolls near the viewport, client side.
onMounted(() => {
  const io = new IntersectionObserver((entries) => {
    if (!entries.some(e => e.isIntersecting)) return
    io.disconnect()
    mount()
  }, { rootMargin: '200px' })
  if (root.value) io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})

onErrorCaptured(() => { example.value = null; return false })
</script>

<style scoped>
.cp { position: relative; height: 180px; margin: auto -26px 0 0; border-radius: 12px; overflow: hidden; pointer-events: none; user-select: none; background: radial-gradient(circle at 1px 1px, var(--mi-fill3) 1px, transparent 0) 0 0 / 16px 16px, var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep); }
.cp__stage { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 12px; }
.cp__scale { flex: none; display: flex; align-items: center; justify-content: center; width: 420px; transform-origin: center; }
/* MiForm is a size container: as a flex item it would collapse to zero width. */
.cp__scale > :deep(.mi-form) { width: 100%; }
</style>
