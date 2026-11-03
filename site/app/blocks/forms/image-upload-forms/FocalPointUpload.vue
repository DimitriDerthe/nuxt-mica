<template>
  <section class="fp mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="fp-title">
    <header class="fp__head mi:flex mi:flex-wrap mi:[align-items:flex-start] mi:justify-between mi:gap-3">
      <div>
        <MiText id="fp-title" variant="title3" as="h2" weight="semibold">Event cover</MiText>
        <MiText variant="footnote" tone="label2">Lisbon Product Summit · shown on the ticket page, feed and invites</MiText>
      </div>
      <MiBadge :tone="saved ? 'success' : 'neutral'" :label="saved ? 'Saved' : 'Draft'" dot />
    </header>

    <div class="fp__grid mi:grid mi:gap-4.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[780px]:grid-cols-[minmax(0,_1.45fr)_minmax(0,_1fr)] mi:@[780px]:items-start">
      <!-- Stage: the full image with the focal point and the outline of the selected crop. -->
      <div class="fp__main mi:grid mi:gap-3 mi:min-w-0">
        <div
          class="fp__stage mi:relative mi:w-full mi:max-h-130 mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:var(--mi-fill3)] mi:shadow-1 mi:cursor-crosshair mi:touch-none mi:select-none mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[3px]" :style="{ aspectRatio: String(ratio) }" tabindex="0" role="group"
          aria-label="Focal point. Click the image or use the arrow keys to move it." aria-describedby="fp-pos"
          @keydown="nudge"
        >
          <img v-if="url" :src="url" alt="" class="fp__img mi:block mi:w-full mi:h-full mi:object-fill mi:pointer-events-none mi:[-webkit-user-drag:none] mi:[.fp__stage>&]:absolute mi:[.fp__stage>&]:inset-0" @load="measure">
          <div v-else class="fp__img fp__art mi:block mi:w-full mi:h-full mi:object-fill mi:pointer-events-none mi:[-webkit-user-drag:none] mi:[.fp__stage>&]:absolute mi:[.fp__stage>&]:inset-0 mi:[background:radial-gradient(circle_at_63%_42%,_var(--mi-yellow)_0_5.5%,_transparent_6%),_radial-gradient(circle_at_63%_42%,_color-mix(in_srgb,_var(--mi-yellow)_35%,_transparent)_0_11%,_transparent_18%),_radial-gradient(110%_55%_at_18%_104%,_var(--mi-p)_0_52%,_transparent_52.5%),_radial-gradient(120%_60%_at_92%_112%,_var(--mi-s)_0_52%,_transparent_52.5%),_linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-indigo)_45%,_var(--mi-card))_0%,_color-mix(in_srgb,_var(--mi-orange)_55%,_var(--mi-card))_78%)]" />
          <span
            class="fp__crop mi:absolute mi:top-0 mi:left-0 mi:z-1 mi:pointer-events-none mi:rounded-[6px] mi:shadow-[inset_0_0_0_2px_var(--mi-p-on),_0_0_0_999px_color-mix(in_srgb,_var(--mi-page)_46%,_transparent)] mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" aria-hidden="true"
            :style="{ width: frame(active).w * 100 + '%', height: frame(active).h * 100 + '%', transform: frame(active).t }"
          />
          <div class="fp__hits mi:absolute mi:inset-0 mi:z-2 mi:grid mi:grid-cols-[repeat(10,_1fr)] mi:grid-rows-[repeat(6,_1fr)]" aria-hidden="true">
            <span v-for="n in COLS * ROWS" :key="n" @pointerdown="pick(n - 1)" @pointerenter="drag && pick(n - 1)" />
          </div>
          <span class="fp__focus-layer mi:absolute mi:inset-0 mi:z-3 mi:pointer-events-none mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" aria-hidden="true" :style="{ transform: `translate(${focus.x}%, ${focus.y}%)` }">
            <span class="fp__dot mi:absolute mi:-top-3.5 mi:-left-3.5 mi:w-7 mi:h-7 mi:rounded-[50%] mi:border-2 mi:border-p-on mi:[background:color-mix(in_srgb,_var(--mi-p)_55%,_transparent)] mi:shadow-2 mi:after:content-[''] mi:after:absolute mi:after:inset-[9px] mi:after:rounded-[50%] mi:after:[background:var(--mi-p-on)]" />
          </span>
        </div>
        <p id="fp-pos" class="fp__sr mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">Focal point at {{ Math.round(focus.x) }}% across, {{ Math.round(focus.y) }}% down</p>

        <MiFileUpload
          v-model="files" accept="image/png,image/jpeg,image/webp" :max-size="8 * 1024 * 1024"
          label="Drop a cover image or browse" hint="PNG, JPG or WebP up to 8 MB · 2400 × 1600 px or larger"
          @reject="onReject"
        />
        <MiText v-if="rejectMsg" variant="footnote" tone="red" role="alert">{{ rejectMsg }}</MiText>
      </div>

      <aside class="fp__side mi:@container mi:grid mi:gap-4 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:min-w-0" aria-label="Crop previews and details">
        <div class="fp__side-head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
          <MiText variant="subheadline" weight="semibold" as="h3">Where it appears</MiText>
          <MiSegmented v-model="activeKey" label="Outline crop" :options="crops.map(c => ({ value: c.id, label: c.short }))" />
        </div>

        <ul class="fp__previews mi:flex mi:[align-items:flex-end] mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="c in crops" :key="c.id" :class="{ 'is-active': c.id === active.id }">
            <button type="button" class="fp__thumb mi:h-[clamp(56px,_18cqi,_96px)] mi:p-0 mi:[border:0] mi:rounded-[10px] mi:overflow-hidden mi:cursor-pointer mi:[background:var(--mi-fill3)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-2px)] mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[.is-active_&]:shadow-[0_0_0_2px_var(--mi-p)]" :style="{ aspectRatio: String(c.ar) }" :aria-label="'Show the ' + c.label + ' crop'" @click="activeKey = c.id">
              <span class="fp__inner mi:block mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :style="{ width: 100 / frame(c).w + '%', height: 100 / frame(c).h + '%', transform: frame(c).shift }">
                <img v-if="url" :src="url" alt="" class="fp__img mi:block mi:w-full mi:h-full mi:object-fill mi:pointer-events-none mi:[-webkit-user-drag:none] mi:[.fp__stage>&]:absolute mi:[.fp__stage>&]:inset-0">
                <span v-else class="fp__img fp__art mi:block mi:w-full mi:h-full mi:object-fill mi:pointer-events-none mi:[-webkit-user-drag:none] mi:[.fp__stage>&]:absolute mi:[.fp__stage>&]:inset-0 mi:[background:radial-gradient(circle_at_63%_42%,_var(--mi-yellow)_0_5.5%,_transparent_6%),_radial-gradient(circle_at_63%_42%,_color-mix(in_srgb,_var(--mi-yellow)_35%,_transparent)_0_11%,_transparent_18%),_radial-gradient(110%_55%_at_18%_104%,_var(--mi-p)_0_52%,_transparent_52.5%),_radial-gradient(120%_60%_at_92%_112%,_var(--mi-s)_0_52%,_transparent_52.5%),_linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-indigo)_45%,_var(--mi-card))_0%,_color-mix(in_srgb,_var(--mi-orange)_55%,_var(--mi-card))_78%)]" />
              </span>
            </button>
            <MiText variant="caption" weight="medium">{{ c.label }}</MiText>
            <MiText variant="caption2" tone="label3">{{ c.where }}</MiText>
          </li>
        </ul>

        <dl class="fp__facts mi:grid mi:gap-2 mi:m-0 mi:py-3 mi:px-0 mi:[border-block:1px_solid_var(--mi-sep)] mi:text-[13px]">
          <div><dt>File</dt><dd>{{ file ? file.name : 'summit-dusk-default.svg' }}</dd></div>
          <div><dt>Size</dt><dd>{{ file ? fmtSize(file.size) : 'Vector' }}</dd></div>
          <div>
            <dt>Pixels</dt>
            <dd>
              {{ dims ? dims.w + ' × ' + dims.h : '2400 × 1600' }}
              <MiBadge v-if="dims && dims.w < 1600" tone="warning" label="Low for header" />
            </dd>
          </div>
        </dl>

        <form class="fp__form mi:grid mi:gap-3" novalidate @submit.prevent="save">
          <MiField label="Alt text" required :error="altError" :hint="alt.length + ' / 125 · describe the scene, not the file'">
            <MiInput v-model="alt" maxlength="125" placeholder="Sunset over the Tagus with the bridge in silhouette" />
          </MiField>
          <div class="fp__actions mi:flex mi:[justify-content:flex-end] mi:gap-2 mi:flex-wrap">
            <MiButton variant="plain" @click="reset">Reset focus</MiButton>
            <MiButton type="submit">Save cover</MiButton>
          </div>
        </form>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const COLS = 10
const ROWS = 6

interface Crop { id: string, label: string, short: string, where: string, ar: number }
const crops: Crop[] = [
  { id: 'header', label: 'Ticket header', short: '16:9', where: 'Event page, 1600 wide', ar: 16 / 9 },
  { id: 'card', label: 'Feed card', short: '4:5', where: 'Mobile feed', ar: 4 / 5 },
  { id: 'avatar', label: 'Invite badge', short: '1:1', where: 'Emails, calendar', ar: 1 }
]
const activeKey = ref<string | number | null>('header')
const active = computed(() => crops.find(c => c.id === activeKey.value) ?? crops[0]!)

const files = ref<File[]>([])
const file = computed(() => files.value[0] ?? null)
const url = ref('')
const dims = ref<{ w: number, h: number } | null>(null)
const rejectMsg = ref('')

watch(file, (f) => {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = f ? URL.createObjectURL(f) : ''
  dims.value = null
  rejectMsg.value = ''
  saved.value = false
})
onBeforeUnmount(() => { if (url.value) URL.revokeObjectURL(url.value) })

function measure(e: Event) {
  const img = e.target as HTMLImageElement
  dims.value = { w: img.naturalWidth, h: img.naturalHeight }
}
function onReject(list: { file: File, reason: 'type' | 'size' | 'count' }[]) {
  const r = list[0]
  if (r) rejectMsg.value = r.reason === 'size' ? `${r.file.name} is over 8 MB.` : `${r.file.name} is not a PNG, JPG or WebP image.`
}

/** Source aspect ratio; the default artwork is 3:2. Very tall or wide uploads are clamped for the stage. */
const ratio = computed(() => (dims.value ? Math.min(2.4, Math.max(0.7, dims.value.w / dims.value.h)) : 1.5))

const focus = reactive({ x: 62, y: 40 })
const drag = ref(false)
function pick(i: number) {
  focus.x = ((i % COLS) + 0.5) / COLS * 100
  focus.y = (Math.floor(i / COLS) + 0.5) / ROWS * 100
  drag.value = true
  saved.value = false
}
const stopDrag = () => { drag.value = false }
onMounted(() => window.addEventListener('pointerup', stopDrag))
onBeforeUnmount(() => window.removeEventListener('pointerup', stopDrag))

function nudge(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 2
  const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const m = moves[e.key]
  if (!m) return
  e.preventDefault()
  focus.x = Math.min(100, Math.max(0, focus.x + m[0]))
  focus.y = Math.min(100, Math.max(0, focus.y + m[1]))
  saved.value = false
}

/**
 * Visible window of a crop drawn with "cover" at the focal point: its size as a fraction of the source,
 * the transform that places its outline on the stage, and the shift that pans the source inside a preview.
 */
function frame(c: Crop) {
  const w = c.ar > ratio.value ? 1 : c.ar / ratio.value
  const h = c.ar > ratio.value ? ratio.value / c.ar : 1
  const px = focus.x / 100
  const py = focus.y / 100
  return {
    w, h,
    t: `translate(${(px * (1 - w)) / w * 100}%, ${(py * (1 - h)) / h * 100}%)`,
    shift: `translate(${-px * (1 - w) * 100}%, ${-py * (1 - h) * 100}%)`
  }
}

const alt = ref('')
const altError = ref('')
const saved = ref(false)
function save() {
  altError.value = alt.value.trim().length < 8 ? 'Write at least a short sentence so screen reader users get the scene.' : ''
  saved.value = !altError.value
}
function reset() {
  focus.x = 50
  focus.y = 50
  saved.value = false
}
function fmtSize(b: number) {
  return b > 1024 * 1024 ? (b / 1024 / 1024).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'
}
</script>

<style scoped>
.fp__previews li { display: grid; gap: 2px; min-width: 0; }
.fp__facts div { display: flex; justify-content: space-between; gap: 12px; }
.fp__facts dt { color: var(--mi-label2); }
.fp__facts dd { display: flex; align-items: center; gap: 6px; margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
</style>
