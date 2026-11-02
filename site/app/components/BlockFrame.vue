<template>
  <section :id="meta.file" class="bf" :aria-labelledby="meta.file + '-t'">
    <header class="bf__head">
      <div class="bf__text">
        <h2 :id="meta.file + '-t'" class="bf__title"><a :href="'#' + meta.file">{{ meta.title[lang] }}</a></h2>
        <p class="bf__sum">{{ meta.summary[lang] }}</p>
      </div>
      <div class="bf__tools">
        <MiSegmented
          v-show="view === 'preview'" v-model="device" class="bf__devices" :label="t('blocks.width')"
          :options="devices.map(d => ({ value: d.id, ariaLabel: t('blocks.' + d.id) }))"
        >
          <template #icon="{ option }"><MiIcon :svg="devices.find(d => d.id === option.value)!.svg" :size="16" /></template>
        </MiSegmented>
        <MiSegmented v-model="view" :label="t('blocks.view')" :options="[{ value: 'preview', label: t('blocks.preview') }, { value: 'code', label: t('blocks.code') }]" />
      </div>
    </header>

    <div v-show="view === 'preview'" ref="stage" class="bf__stage" :class="{ 'bf__stage--bleed': meta.stage === 'bleed' }">
      <div class="bf__frame" :style="{ width: frameWidth, minHeight: (meta.height ?? 360) + 'px' }">
        <component :is="block" v-if="block" />
        <MiSpinner v-else class="bf__spin" />
        <button
          type="button" class="bf__grip" :aria-label="t('blocks.resize')" @pointerdown="grab" @keydown.left.prevent="nudge(-24)" @keydown.right.prevent="nudge(24)"
        >
          <span />
        </button>
      </div>
      <span class="bf__px" aria-live="polite">{{ pxLabel }}</span>
    </div>

    <SiteCode
      v-if="view === 'code'" class="bf__code" :file="meta.file + '.vue'" :text="source || '…'"
      :copy-label="t('start.copy')" :copied-label="t('start.copied')"
    />
  </section>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { loadBlock, loadSource, type BlockMeta } from '~/blocks/catalog'

const p = defineProps<{ family: string, category: string, meta: BlockMeta }>()
const { t, locale } = useI18n()
const lang = computed(() => (locale.value === 'fr' ? 'fr' : 'en'))

const devices = [
  { id: 'mobile', width: 390, svg: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>' },
  { id: 'tablet', width: 768, svg: '<rect x="4.5" y="3" width="15" height="18" rx="2.5"/><path d="M11 18h2"/>' },
  { id: 'desktop', width: 0, svg: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M9 20h6M12 16v4"/>' }
] as const
type Device = typeof devices[number]['id']

const view = ref<'preview' | 'code'>('preview')
const device = ref<Device>('desktop')
/** Free width set by dragging the grip; cleared when a preset is picked. */
const custom = ref<number | null>(null)
const stage = ref<HTMLElement>()
const stageWidth = ref(0)

const presetWidth = computed(() => devices.find(d => d.id === device.value)!.width)
const frameWidth = computed(() => (custom.value ? custom.value + 'px' : presetWidth.value ? presetWidth.value + 'px' : '100%'))
const pxLabel = computed(() => `${Math.round(custom.value ?? (presetWidth.value || stageWidth.value))} px`)
watch(device, () => { custom.value = null })

const block = shallowRef<Component | null>(null)
const source = ref('')

onMounted(async () => {
  if (stage.value) {
    const ro = new ResizeObserver(([e]) => { stageWidth.value = e!.contentRect.width })
    ro.observe(stage.value)
    onBeforeUnmount(() => ro.disconnect())
  }
  const load = loadBlock(p.family, p.category, p.meta.file)
  if (load) block.value = markRaw(((await load()) as { default: Component }).default)
})

watch(view, async (v) => {
  if (v !== 'code' || source.value) return
  const load = loadSource(p.family, p.category, p.meta.file)
  if (load) source.value = (await load()).trimEnd()
})

const clamp = (w: number) => Math.round(Math.min(Math.max(w, 320), stageWidth.value || w))

function nudge(dx: number) {
  const from = custom.value ?? (presetWidth.value || stageWidth.value)
  custom.value = clamp(from + dx)
}

/** Drags the right edge of the frame; the frame is centered, so the width moves twice as fast as the pointer. */
function grab(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture(e.pointerId)
  const startX = e.clientX
  const startW = (el.parentElement as HTMLElement).getBoundingClientRect().width
  let raf = 0
  let next = startW
  const move = (ev: PointerEvent) => {
    next = clamp(startW + (ev.clientX - startX) * 2)
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; custom.value = next })
  }
  const up = () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move, { passive: true })
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}
</script>

<style scoped>
.bf { display: grid; gap: 14px; min-width: 0; scroll-margin-top: 88px; }
.bf__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 20px; }
.bf__text { display: grid; gap: 4px; min-width: 0; flex: 1 1 320px; }
.bf__title { margin: 0; font-size: 20px; letter-spacing: -.02em; }
.bf__title a { color: inherit; text-decoration: none; }
.bf__title a:hover { color: var(--mi-p-text); }
.bf__sum { margin: 0; max-width: 70ch; font-size: 14px; line-height: 1.5; color: var(--mi-label2); }
.bf__tools { display: flex; flex-wrap: wrap; gap: 8px; }
.bf__devices { display: none; }
@media (min-width: 820px) { .bf__devices { display: inline-flex; } }

.bf__stage {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 28px 20px 14px; border-radius: 22px; overflow: hidden;
  background: radial-gradient(circle at 1px 1px, var(--mi-fill3) 1px, transparent 0) 0 0 / 18px 18px, var(--mi-page); box-shadow: 0 0 0 1px var(--mi-sep);
}
.bf__stage--bleed { padding-top: 14px; }
.bf__frame { position: relative; display: grid; max-width: 100%; box-sizing: border-box; contain: layout paint; }
.bf__stage--bleed .bf__frame { border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 1px var(--mi-sep), var(--mi-sh2); background: var(--mi-page); }
.bf__spin { place-self: center; }
.bf__grip { position: absolute; top: 50%; right: -16px; display: none; place-items: center; width: 14px; height: 56px; margin-top: -28px; padding: 0; border: 0; border-radius: 7px; background: transparent; cursor: ew-resize; touch-action: none; }
.bf__grip span { width: 4px; height: 36px; border-radius: 2px; background: var(--mi-fill); transition: transform var(--mi-dur-1) var(--mi-ease); }
.bf__grip:hover span, .bf__grip:focus-visible span { transform: scaleY(1.2); background: var(--mi-p); }
.bf__grip:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
@media (min-width: 820px) { .bf__grip { display: grid; } .bf__stage { padding-inline: 32px; } }
.bf__px { font: 500 11px/1 ui-monospace, "SF Mono", Menlo, monospace; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.bf__code :deep(.code__pre) { max-height: 620px; overflow: auto; }
</style>
