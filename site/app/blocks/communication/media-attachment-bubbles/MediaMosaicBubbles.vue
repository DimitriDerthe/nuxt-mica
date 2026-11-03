<template>
  <section class="mm mi:@container mi:font-mi mi:text-label" aria-labelledby="mm-title">
    <div class="mm__card mi:relative mi:flex mi:flex-col mi:h-150 mi:max-w-160 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <header class="mm__head mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Marisol Vega" size="sm" tone="green" decorative />
        <div class="mm__head-text mi:min-w-0">
          <MiText id="mm-title" as="h2" variant="headline" weight="semibold">Marisol Vega</MiText>
          <MiText variant="caption" tone="label2">Architect · Gerês cabin renovation</MiText>
        </div>
      </header>

      <MiMessageScroller class="mm__log" label="Conversation with Marisol Vega">
        <MiMarker variant="separator">Site visit, Tuesday</MiMarker>

        <!-- Photo mosaic: four drawn frames, the last one counting the rest. -->
        <MiMessage label="Marisol Vega" class="mm__msg mi:[&.is-end]:ms-auto">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <div class="mm__mosaic mi:grid mi:grid-cols-[1fr_1fr] mi:gap-[3px] mi:w-[min(300px,_68cqi)] mi:rounded-[18px_18px_18px_6px] mi:overflow-hidden" role="group" aria-label="7 photos from the site visit">
            <button
              v-for="(p, i) in photos.slice(0, 4)" :key="p.id" type="button" class="mm__ph mi:relative mi:aspect-[1] mi:p-0 mi:[border:0] mi:overflow-hidden mi:isolate mi:[.mm__mosaic_&:first-child]:col-[span_2] mi:[.mm__mosaic_&:first-child]:aspect-[2_/_1] mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-3px] mi:before:content-[''] mi:before:absolute mi:before:-z-1 mi:after:content-[''] mi:after:absolute mi:after:-z-1" :class="'mm__ph--' + p.id"
              :aria-label="i === 3 && photos.length > 4 ? 'Open ' + (photos.length - 3) + ' more photos' : 'Open photo: ' + p.caption" @click="view = i"
            >
              <span v-if="i === 3 && photos.length > 4" class="mm__more mi:absolute mi:inset-0 mi:grid mi:place-items-center mi:[background:color-mix(in_srgb,_var(--mi-label)_55%,_transparent)] mi:text-page mi:text-[22px] mi:font-bold">+{{ photos.length - 4 }}</span>
            </button>
          </div>
          <template #footer>7 photos · 09:41</template>
        </MiMessage>

        <MiMessage label="Marisol Vega" class="mm__msg mi:[&.is-end]:ms-auto">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <MiBubble variant="secondary" class="mm__bub">The north wall is drier than we feared. Updated plan attached, see page 3 for the new window.</MiBubble>
        </MiMessage>

        <MiMessage label="Marisol Vega" class="mm__msg mi:[&.is-end]:ms-auto">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <MiAttachment class="mm__file" name="Cabin floor plan v3.pdf" :file-size="2516582" type="application/pdf" :removable="false" />
          <template #footer>09:44</template>
        </MiMessage>

        <!-- Location card with a drawn map tile. -->
        <MiMessage label="Marisol Vega" class="mm__msg mi:[&.is-end]:ms-auto">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <a class="mm__place mi:grid mi:w-[min(300px,_68cqi)] mi:rounded-[18px_18px_18px_6px] mi:overflow-hidden mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep2)] mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" href="#mm-title" aria-label="Location: Casa do Rio, Gerês">
            <svg class="mm__map mi:block mi:w-full mi:h-30 mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_var(--mi-page))]" viewBox="0 0 280 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
              <path class="mm__map-river mi:fill-[color:none] mi:stroke-blue/45 mi:[stroke-width:10] mi:[stroke-linecap:round]" d="M-10 92C40 70 70 104 120 84s80-40 170-22" />
              <path class="mm__map-road mi:fill-[color:none] mi:stroke-card mi:[stroke-width:5]" d="M20 -10L64 130M150 -10c-10 50 30 80 20 140M-10 30h300" />
              <circle class="mm__map-ring mi:fill-p/22" cx="146" cy="58" r="16" />
              <circle class="mm__map-pin mi:fill-p mi:stroke-card mi:[stroke-width:2]" cx="146" cy="58" r="6" />
            </svg>
            <span class="mm__place-text mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3 mi:text-[12.5px] mi:text-label2">
              <strong class="mi:[.mm__place-text_&]:text-[14px]">Casa do Rio</strong>
              <span>Rua da Ponte 12, Gerês · 41.73° N, 8.16° W</span>
            </span>
          </a>
          <template #footer>Pinned location</template>
        </MiMessage>

        <MiMarker variant="separator">Today</MiMarker>

        <MiMessage v-for="u in uploads" :key="u.id" align="end" label="You" class="mm__msg is-end mi:[&.is-end]:ms-auto">
          <MiAttachment
            class="mm__file" :name="u.name" :file-size="u.size" :type="u.type" :progress="u.progress" :removable="u.progress < 100"
            @remove="cancel(u.id)"
          />
          <template #footer>
            <span aria-live="polite">{{ u.progress < 100 ? 'Uploading ' + u.progress + '%' : 'Delivered' }}</span>
          </template>
        </MiMessage>
      </MiMessageScroller>

      <div class="mm__composer mi:flex mi:[justify-content:flex-start] mi:py-3 mi:px-3.5 mi:border-t mi:border-t-sep">
        <MiButton variant="tinted" size="small" :disabled="queue >= files.length" @click="attach">
          <template #leading><MiIcon :svg="icons.clip" :size="16" /></template>
          {{ queue >= files.length ? 'All files sent' : 'Attach ' + files[queue]?.name }}
        </MiButton>
      </div>

      <!-- Inline viewer, shown over the conversation (no teleport). -->
      <Transition name="mm-fade">
        <div v-if="view !== null" class="mm__viewer mi:absolute mi:inset-0 mi:z-2 mi:flex mi:flex-col mi:gap-3 mi:p-3.5 mi:[background:color-mix(in_srgb,_var(--mi-page)_94%,_transparent)] mi:[backdrop-filter:blur(10px)]" role="dialog" aria-modal="false" :aria-label="'Photo ' + (view + 1) + ' of ' + photos.length" @keydown.esc="view = null">
          <div class="mm__viewer-top mi:flex mi:items-center mi:gap-2.5">
            <MiText variant="subheadline" weight="semibold">{{ photos[view]?.caption }}</MiText>
            <MiText variant="caption" class="mm__viewer-n">{{ view + 1 }} / {{ photos.length }}</MiText>
            <MiIconButton label="Close viewer" variant="gray" size="small" @click="view = null"><MiIcon name="close" :size="16" /></MiIconButton>
          </div>
          <div class="mm__stage mi:flex-1 mi:min-h-0 mi:grid mi:place-items-center">
            <Transition name="mm-slide" mode="out-in">
              <div :key="view" class="mm__big mm__ph mi:relative mi:aspect-[1] mi:p-0 mi:[border:0] mi:overflow-hidden mi:isolate mi:[.mm__mosaic_&:first-child]:col-[span_2] mi:[.mm__mosaic_&:first-child]:aspect-[2_/_1] mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-3px] mi:before:content-[''] mi:before:absolute mi:before:-z-1 mi:after:content-[''] mi:after:absolute mi:after:-z-1 mi:w-full mi:h-full mi:max-h-full mi:aspect-[auto] mi:rounded-lg" :class="'mm__ph--' + photos[view]?.id" />
            </Transition>
          </div>
          <div class="mm__viewer-nav mi:flex mi:items-center mi:justify-between mi:gap-3">
            <MiIconButton label="Previous photo" variant="gray" @click="move(-1)"><MiIcon name="chevron-left" /></MiIconButton>
            <div class="mm__dots mi:flex mi:gap-1.5" aria-hidden="true"><span class="mi:[.mm__dots_&]:h-1.5 mi:[.mm__dots_&]:rounded-[50%] mi:[.mm__dots_&]:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" v-for="(p, i) in photos" :key="p.id" :class="{ 'is-on mi:[.mm__dots_&]:transform-[scale(1.4)]': i === view }" /></div>
            <MiIconButton label="Next photo" variant="gray" @click="move(1)"><MiIcon name="chevron-right" /></MiIconButton>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

interface Upload { id: number, name: string, size: number, type: string, progress: number }

const icons = { clip: '<path d="m20 11.5-8.3 8.3a5 5 0 0 1-7-7l8.6-8.6a3.4 3.4 0 0 1 4.8 4.8l-8.4 8.4a1.7 1.7 0 0 1-2.4-2.4l7.7-7.7"/>' }

// Photos are drawn with token gradients; swap the classes for real thumbnails.
const photos = [
  { id: 1, caption: 'North wall, morning light' },
  { id: 2, caption: 'Roof beams after cleaning' },
  { id: 3, caption: 'View from the new window' },
  { id: 4, caption: 'Stone terrace at dusk' },
  { id: 5, caption: 'Old stove, to be kept' },
  { id: 6, caption: 'Path to the river' },
  { id: 7, caption: 'Kitchen corner' }
]
const files = [
  { name: 'Tile quote.xlsx', size: 48210, type: 'application/vnd.ms-excel' },
  { name: 'Window sketch.png', size: 1840211, type: 'image/png' },
  { name: 'Permit form.pdf', size: 612000, type: 'application/pdf' }
]

const view = ref<number | null>(null)
const uploads = ref<Upload[]>([{ id: 0, name: 'Budget, revised.pdf', size: 318400, type: 'application/pdf', progress: 100 }])
const queue = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

function move(dir: 1 | -1) {
  if (view.value !== null) view.value = (view.value + dir + photos.length) % photos.length
}

// A single interval drives every upload in flight; it stops when none is left.
function tick() {
  let busy = false
  for (const u of uploads.value) {
    if (u.progress < 100) {
      u.progress = Math.min(100, u.progress + 9)
      busy = true
    }
  }
  if (!busy) { clearInterval(timer); timer = undefined }
}

function attach() {
  const f = files[queue.value]
  if (!f) return
  queue.value += 1
  uploads.value.push({ id: queue.value, ...f, progress: 0 })
  timer ??= setInterval(tick, 160)
}

function cancel(id: number) {
  uploads.value = uploads.value.filter(u => u.id !== id)
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.mm__log { flex: 1; min-height: 0; background: var(--mi-page); }
.mm__msg { max-width: 100%; }
.mm .mm__bub { max-width: 100%; }
.mm__file { width: min(300px, 68cqi); }
.mm__ph { cursor: zoom-in; }
/* Each frame: a sky gradient, a sun or window, and a ground shape. */
.mm__ph--1 { background: linear-gradient(180deg, color-mix(in srgb, var(--mi-orange) 55%, var(--mi-card)), color-mix(in srgb, var(--mi-p) 35%, var(--mi-card))); }
.mm__ph--1::before { width: 26%; aspect-ratio: 1; left: 62%; top: 18%; border-radius: 50%; background: color-mix(in srgb, var(--mi-yellow) 80%, var(--mi-card)); }
.mm__ph--1::after { inset: 58% -10% -20% -10%; border-radius: 50% 50% 0 0; background: color-mix(in srgb, var(--mi-green) 55%, var(--mi-label)); }
.mm__ph--2 { background: linear-gradient(160deg, color-mix(in srgb, var(--mi-orange) 40%, var(--mi-label)), color-mix(in srgb, var(--mi-orange) 30%, var(--mi-label))); }
.mm__ph--2::before { inset: 20% -10% auto -10%; height: 10%; background: color-mix(in srgb, var(--mi-orange) 45%, var(--mi-card)); transform: rotate(-12deg); }
.mm__ph--2::after { inset: 52% -10% auto -10%; height: 10%; background: color-mix(in srgb, var(--mi-orange) 35%, var(--mi-card)); transform: rotate(-12deg); }
.mm__ph--3 { background: linear-gradient(180deg, color-mix(in srgb, var(--mi-teal) 50%, var(--mi-card)), color-mix(in srgb, var(--mi-blue) 40%, var(--mi-card))); }
.mm__ph--3::before { inset: 12%; border: 5px solid color-mix(in srgb, var(--mi-label) 70%, transparent); border-radius: 4px; }
.mm__ph--3::after { inset: 62% 12% 12% 12%; background: color-mix(in srgb, var(--mi-green) 60%, var(--mi-label)); clip-path: polygon(0 100%, 0 40%, 30% 0, 55% 50%, 75% 20%, 100% 60%, 100% 100%); }
.mm__ph--4 { background: linear-gradient(180deg, color-mix(in srgb, var(--mi-indigo) 65%, var(--mi-label)), color-mix(in srgb, var(--mi-pink) 50%, var(--mi-card))); }
.mm__ph--4::after { inset: 70% -10% -10% -10%; background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--mi-label2) 80%, transparent) 0 18%, color-mix(in srgb, var(--mi-label3) 80%, transparent) 18% 20%); }
.mm__ph--5 { background: radial-gradient(circle at 50% 60%, color-mix(in srgb, var(--mi-orange) 70%, var(--mi-card)) 0 12%, color-mix(in srgb, var(--mi-label) 85%, transparent) 13% 30%, color-mix(in srgb, var(--mi-label2) 60%, var(--mi-card)) 31%); }
.mm__ph--6 { background: linear-gradient(180deg, color-mix(in srgb, var(--mi-mint) 45%, var(--mi-card)), color-mix(in srgb, var(--mi-green) 50%, var(--mi-label))); }
.mm__ph--6::after { inset: 40% 30% -10% 30%; background: color-mix(in srgb, var(--mi-orange) 35%, var(--mi-card)); clip-path: polygon(45% 0, 55% 0, 100% 100%, 0 100%); }
.mm__ph--7 { background: linear-gradient(90deg, color-mix(in srgb, var(--mi-yellow) 30%, var(--mi-card)) 0 60%, color-mix(in srgb, var(--mi-teal) 30%, var(--mi-card)) 60%); }
.mm__ph--7::after { inset: 55% 0 0 0; background: color-mix(in srgb, var(--mi-label) 70%, transparent); }
.mm__place-text strong { color: var(--mi-label); }
.mm__viewer-top > :first-child { flex: 1; min-width: 0; }
.mm__viewer-n { color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.mm__big { cursor: default; }
.mm__dots span { width: 6px; background: var(--mi-fill); }
.mm__dots span.is-on { background: var(--mi-p); }

.mm-fade-enter-active, .mm-fade-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease); }
.mm-fade-enter-from, .mm-fade-leave-to { opacity: 0; }
.mm-slide-enter-active, .mm-slide-leave-active { transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-ease); }
.mm-slide-enter-from { opacity: 0; transform: scale(.97); }
.mm-slide-leave-to { opacity: 0; transform: scale(1.02); }
</style>
