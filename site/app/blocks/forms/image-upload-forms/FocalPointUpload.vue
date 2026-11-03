<template>
  <section class="fp" aria-labelledby="fp-title">
    <header class="fp__head">
      <div>
        <MiText id="fp-title" variant="title3" as="h2" weight="semibold">Event cover</MiText>
        <MiText variant="footnote" tone="label2">Lisbon Product Summit · shown on the ticket page, feed and invites</MiText>
      </div>
      <MiBadge :tone="saved ? 'success' : 'neutral'" :label="saved ? 'Saved' : 'Draft'" dot />
    </header>

    <div class="fp__grid">
      <!-- Stage: the full image with the focal point and the outline of the selected crop. -->
      <div class="fp__main">
        <div
          class="fp__stage" :style="{ aspectRatio: String(ratio) }" tabindex="0" role="group"
          aria-label="Focal point. Click the image or use the arrow keys to move it." aria-describedby="fp-pos"
          @keydown="nudge"
        >
          <img v-if="url" :src="url" alt="" class="fp__img" @load="measure">
          <div v-else class="fp__img fp__art" />
          <span
            class="fp__crop" aria-hidden="true"
            :style="{ width: frame(active).w * 100 + '%', height: frame(active).h * 100 + '%', transform: frame(active).t }"
          />
          <div class="fp__hits" aria-hidden="true">
            <span v-for="n in COLS * ROWS" :key="n" @pointerdown="pick(n - 1)" @pointerenter="drag && pick(n - 1)" />
          </div>
          <span class="fp__focus-layer" aria-hidden="true" :style="{ transform: `translate(${focus.x}%, ${focus.y}%)` }">
            <span class="fp__dot" />
          </span>
        </div>
        <p id="fp-pos" class="fp__sr" aria-live="polite">Focal point at {{ Math.round(focus.x) }}% across, {{ Math.round(focus.y) }}% down</p>

        <MiFileUpload
          v-model="files" accept="image/png,image/jpeg,image/webp" :max-size="8 * 1024 * 1024"
          label="Drop a cover image or browse" hint="PNG, JPG or WebP up to 8 MB · 2400 × 1600 px or larger"
          @reject="onReject"
        />
        <MiText v-if="rejectMsg" variant="footnote" tone="red" role="alert">{{ rejectMsg }}</MiText>
      </div>

      <aside class="fp__side" aria-label="Crop previews and details">
        <div class="fp__side-head">
          <MiText variant="subheadline" weight="semibold" as="h3">Where it appears</MiText>
          <MiSegmented v-model="activeKey" label="Outline crop" :options="crops.map(c => ({ value: c.id, label: c.short }))" />
        </div>

        <ul class="fp__previews">
          <li v-for="c in crops" :key="c.id" :class="{ 'is-active': c.id === active.id }">
            <button type="button" class="fp__thumb" :style="{ aspectRatio: String(c.ar) }" :aria-label="'Show the ' + c.label + ' crop'" @click="activeKey = c.id">
              <span class="fp__inner" :style="{ width: 100 / frame(c).w + '%', height: 100 / frame(c).h + '%', transform: frame(c).shift }">
                <img v-if="url" :src="url" alt="" class="fp__img">
                <span v-else class="fp__img fp__art" />
              </span>
            </button>
            <MiText variant="caption" weight="medium">{{ c.label }}</MiText>
            <MiText variant="caption2" tone="label3">{{ c.where }}</MiText>
          </li>
        </ul>

        <dl class="fp__facts">
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

        <form class="fp__form" novalidate @submit.prevent="save">
          <MiField label="Alt text" required :error="altError" :hint="alt.length + ' / 125 · describe the scene, not the file'">
            <MiInput v-model="alt" maxlength="125" placeholder="Sunset over the Tagus with the bridge in silhouette" />
          </MiField>
          <div class="fp__actions">
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
.fp { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.fp__head { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; }
.fp__grid { display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 780px) { .fp__grid { grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr); align-items: start; } }

.fp__main { display: grid; gap: 12px; min-width: 0; }
.fp__stage {
  position: relative; width: 100%; max-height: 520px; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate;
  background: var(--mi-fill3); box-shadow: var(--mi-sh1); cursor: crosshair; touch-action: none; user-select: none;
}
.fp__stage:focus-visible { outline: 3px solid var(--mi-p); outline-offset: 3px; }
.fp__img { display: block; width: 100%; height: 100%; object-fit: fill; pointer-events: none; -webkit-user-drag: none; }
.fp__stage > .fp__img { position: absolute; inset: 0; }
/* Default artwork: dusk over two hills, built from brand and system tokens. */
.fp__art {
  background:
    radial-gradient(circle at 63% 42%, var(--mi-yellow) 0 5.5%, transparent 6%),
    radial-gradient(circle at 63% 42%, color-mix(in srgb, var(--mi-yellow) 35%, transparent) 0 11%, transparent 18%),
    radial-gradient(110% 55% at 18% 104%, var(--mi-p) 0 52%, transparent 52.5%),
    radial-gradient(120% 60% at 92% 112%, var(--mi-s) 0 52%, transparent 52.5%),
    linear-gradient(180deg, color-mix(in srgb, var(--mi-indigo) 45%, var(--mi-card)) 0%, color-mix(in srgb, var(--mi-orange) 55%, var(--mi-card)) 78%);
}
.fp__crop {
  position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none; border-radius: 6px;
  /* Inset outline: the crop often spans the whole stage width, where an outer ring would be clipped. */
  box-shadow: inset 0 0 0 2px var(--mi-p-on), 0 0 0 999px color-mix(in srgb, var(--mi-page) 46%, transparent);
  transition: transform var(--mi-dur-3) var(--mi-spring);
}
.fp__hits { position: absolute; inset: 0; z-index: 2; display: grid; grid-template-columns: repeat(10, 1fr); grid-template-rows: repeat(6, 1fr); }
.fp__focus-layer { position: absolute; inset: 0; z-index: 3; pointer-events: none; transition: transform var(--mi-dur-3) var(--mi-spring); }
.fp__dot {
  position: absolute; top: -14px; left: -14px; width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid var(--mi-p-on); background: color-mix(in srgb, var(--mi-p) 55%, transparent); box-shadow: var(--mi-sh2);
}
.fp__dot::after { content: ""; position: absolute; inset: 9px; border-radius: 50%; background: var(--mi-p-on); }
.fp__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.fp__side { container-type: inline-size; display: grid; gap: 16px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.fp__side-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
.fp__previews { display: flex; align-items: flex-end; gap: 14px; margin: 0; padding: 0; list-style: none; }
.fp__previews li { display: grid; gap: 2px; min-width: 0; }
.fp__thumb {
  height: clamp(56px, 18cqi, 96px); padding: 0; border: 0; border-radius: 10px; overflow: hidden; cursor: pointer; background: var(--mi-fill3);
  box-shadow: 0 0 0 1px var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.fp__thumb:hover { transform: translateY(-2px); }
.fp__thumb:focus-visible { outline: 3px solid var(--mi-p); outline-offset: 2px; }
.is-active .fp__thumb { box-shadow: 0 0 0 2px var(--mi-p); }
.fp__inner { display: block; transition: transform var(--mi-dur-3) var(--mi-spring); }

.fp__facts { display: grid; gap: 8px; margin: 0; padding: 12px 0; border-block: 1px solid var(--mi-sep); font-size: 13px; }
.fp__facts div { display: flex; justify-content: space-between; gap: 12px; }
.fp__facts dt { color: var(--mi-label2); }
.fp__facts dd { display: flex; align-items: center; gap: 6px; margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.fp__form { display: grid; gap: 12px; }
.fp__actions { display: flex; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
</style>
