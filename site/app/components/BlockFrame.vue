<template>
  <section :id="meta.file" class="bf mi:grid mi:gap-3.5 mi:min-w-0 mi:[scroll-margin-top:88px]" :aria-labelledby="meta.file + '-t'">
    <header class="bf__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="bf__text mi:grid mi:gap-1 mi:min-w-0 mi:flex-[1_1_320px]">
        <h2 :id="meta.file + '-t'" class="bf__title mi:m-0 mi:text-[20px] mi:tracking-[-.02em]"><a class="mi:[.bf__title_&]:text-inherit mi:[.bf__title_&]:[text-decoration:none] mi:[.bf__title_&:hover]:text-p-text" :href="'#' + meta.file">{{ meta.title[lang] }}</a></h2>
        <p class="bf__sum mi:m-0 mi:max-w-[70ch] mi:text-[14px] mi:leading-normal mi:text-label2">{{ meta.summary[lang] }}</p>
      </div>
      <div class="bf__tools mi:flex mi:flex-wrap mi:gap-2">
        <MiSegmented
          v-show="view === 'preview'" v-model="device" class="bf__devices" :label="t('blocks.width')"
          :options="devices.map(d => ({ value: d.id, ariaLabel: t('blocks.' + d.id) }))"
        >
          <template #icon="{ option }"><MiIcon :svg="devices.find(d => d.id === option.value)!.svg" :size="16" /></template>
        </MiSegmented>
        <MiSegmented v-model="view" :label="t('blocks.view')" :options="[{ value: 'preview', label: t('blocks.preview') }, { value: 'code', label: t('blocks.code') }]" />
      </div>
    </header>

    <div v-show="view === 'preview'" ref="stage" class="bf__stage mi:relative mi:flex mi:flex-col mi:items-center mi:gap-2.5 mi:rounded-[22px] mi:overflow-hidden mi:[background:radial-gradient(circle_at_1px_1px,_var(--mi-fill3)_1px,_transparent_0)_0_0_/_18px_18px,_var(--mi-page)] mi:shadow-[0_0_0_1px_var(--mi-sep)]" :class="{ 'bf__stage--bleed': meta.stage === 'bleed' }">
      <div class="bf__frame mi:relative mi:grid mi:max-w-full mi:box-border mi:[contain:layout] mi:overflow-clip mi:[overflow-clip-margin:6px] mi:[.bf__stage--bleed_&]:rounded-[16px] mi:[.bf__stage--bleed_&]:overflow-hidden mi:[.bf__stage--bleed_&]:shadow-[0_0_0_1px_var(--mi-sep),_var(--mi-sh2)] mi:[.bf__stage--bleed_&]:[background:var(--mi-page)]" :style="{ width: frameWidth, minHeight: (meta.height ?? 360) + 'px' }">
        <component :is="block" v-if="block" />
        <MiSpinner v-else class="bf__spin mi:place-self-center" />
        <button
          type="button" class="bf__grip mi:absolute mi:top-1/2 mi:-right-4 mi:hidden mi:place-items-center mi:w-3.5 mi:h-14 mi:-mt-7 mi:p-0 mi:[border:0] mi:rounded-[7px] mi:[background:transparent] mi:cursor-ew-resize mi:touch-none mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:min-[820px]:grid" :aria-label="t('blocks.resize')" @pointerdown="grab" @keydown.left.prevent="nudge(-24)" @keydown.right.prevent="nudge(24)"
        >
          <span class="mi:[.bf__grip_&]:w-1 mi:[.bf__grip_&]:h-9 mi:[.bf__grip_&]:rounded-[2px] mi:[.bf__grip_&]:[background:var(--mi-fill)] mi:[.bf__grip_&]:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:[.bf__grip:hover_&]:transform-[scaleY(1.2)] mi:[.bf__grip:hover_&]:[background:var(--mi-p)] mi:[.bf__grip:focus-visible_&]:transform-[scaleY(1.2)] mi:[.bf__grip:focus-visible_&]:[background:var(--mi-p)]" />
        </button>
      </div>
      <span class="bf__px mi:text-label3" aria-live="polite">{{ pxLabel }}</span>
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
.bf__devices { display: none; }
@media (min-width: 820px) { .bf__devices { display: inline-flex; } }

.bf__stage { padding: 28px 20px 14px;
}
.bf__stage--bleed { padding-top: 14px; }
/* The frame draws the window edge: a block root with its own rounded ring would show a second arc in each corner. */
.bf__stage--bleed .bf__frame > :deep(*) { border-radius: inherit; }
@media (min-width: 820px) { .bf__stage { padding-inline: 32px; } }
.bf__px { font: 500 11px/1 ui-monospace, "SF Mono", Menlo, monospace; font-variant-numeric: tabular-nums; }
.bf__code :deep(.code__pre) { max-height: 620px; overflow: auto; }
</style>
