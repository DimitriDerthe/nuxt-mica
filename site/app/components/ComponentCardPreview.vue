<template>
  <div ref="root" class="cp mi:relative mi:h-45 mi:mt-auto mi:-mr-6.5 mi:mb-0 mi:ml-0 mi:rounded-[12px] mi:overflow-hidden mi:pointer-events-none mi:select-none mi:[background:radial-gradient(circle_at_1px_1px,_var(--mi-fill3)_1px,_transparent_0)_0_0_/_16px_16px,_var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)]" aria-hidden="true" inert>
    <div v-if="example" class="cp__stage mi:absolute mi:inset-0 mi:flex mi:items-center mi:justify-center mi:p-3">
      <div ref="inner" class="cp__scale mi:flex-[none] mi:flex mi:items-center mi:justify-center mi:w-105 mi:origin-center" :style="{ transform: `scale(${scale})` }"><component :is="example" :p="values" /></div>
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
/* MiForm is a size container: as a flex item it would collapse to zero width. */
.cp__scale > :deep(.mi-form) { width: 100%; }
</style>
