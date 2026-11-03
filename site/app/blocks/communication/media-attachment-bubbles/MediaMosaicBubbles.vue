<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="mm-title">
    <div class="mi:relative mi:flex mi:flex-col mi:h-150 mi:max-w-160 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Marisol Vega" size="sm" tone="green" decorative />
        <div class="mi:min-w-0">
          <MiText id="mm-title" as="h2" variant="headline" weight="semibold">Marisol Vega</MiText>
          <MiText variant="caption" tone="label2">Architect · Gerês cabin renovation</MiText>
        </div>
      </header>

      <MiMessageScroller class="mi:flex-1 mi:min-h-0! mi:bg-page" label="Conversation with Marisol Vega">
        <MiMarker variant="separator">Site visit, Tuesday</MiMarker>

        <!-- Photo mosaic: four drawn frames, the last one counting the rest. -->
        <MiMessage label="Marisol Vega" class="mi:max-w-full!">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:gap-[3px] mi:w-[min(300px,_68cqi)] mi:rounded-[18px_18px_18px_6px] mi:overflow-hidden" role="group" aria-label="7 photos from the site visit">
            <button
              v-for="(p, i) in photos.slice(0, 4)" :key="p.id" type="button" class="mi:cursor-zoom-in mi:relative mi:aspect-[1] mi:p-0 mi:[border:0] mi:overflow-hidden mi:isolate mi:first:col-[span_2] mi:first:aspect-[2_/_1] mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-3px] mi:before:content-[''] mi:before:absolute mi:before:-z-1 mi:after:content-[''] mi:after:absolute mi:after:-z-1" :class="art[p.id]"
              :aria-label="i === 3 && photos.length > 4 ? 'Open ' + (photos.length - 3) + ' more photos' : 'Open photo: ' + p.caption" @click="view = i"
            >
              <span v-if="i === 3 && photos.length > 4" class="mi:absolute mi:inset-0 mi:grid mi:place-items-center mi:[background:color-mix(in_srgb,_var(--mi-label)_55%,_transparent)] mi:text-page mi:text-[22px] mi:font-bold">+{{ photos.length - 4 }}</span>
            </button>
          </div>
          <template #footer>7 photos · 09:41</template>
        </MiMessage>

        <MiMessage label="Marisol Vega" class="mi:max-w-full!">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <MiBubble variant="secondary" class="mi:max-w-full!">The north wall is drier than we feared. Updated plan attached, see page 3 for the new window.</MiBubble>
        </MiMessage>

        <MiMessage label="Marisol Vega" class="mi:max-w-full!">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <MiAttachment class="mi:w-[min(300px,68cqi)]!" name="Cabin floor plan v3.pdf" :file-size="2516582" type="application/pdf" :removable="false" />
          <template #footer>09:44</template>
        </MiMessage>

        <!-- Location card with a drawn map tile. -->
        <MiMessage label="Marisol Vega" class="mi:max-w-full!">
          <template #avatar><MiAvatar name="Marisol Vega" size="xs" tone="green" decorative /></template>
          <a class="mi:grid mi:w-[min(300px,_68cqi)] mi:rounded-[18px_18px_18px_6px] mi:overflow-hidden mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep2)] mi:text-inherit mi:[text-decoration:none] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" href="#mm-title" aria-label="Location: Casa do Rio, Gerês">
            <svg class="mi:block mi:w-full mi:h-30 mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_var(--mi-page))]" viewBox="0 0 280 120" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
              <path class="mi:fill-[color:none] mi:stroke-blue/45 mi:[stroke-width:10] mi:[stroke-linecap:round]" d="M-10 92C40 70 70 104 120 84s80-40 170-22" />
              <path class="mi:fill-[color:none] mi:stroke-card mi:[stroke-width:5]" d="M20 -10L64 130M150 -10c-10 50 30 80 20 140M-10 30h300" />
              <circle class="mi:fill-p/22" cx="146" cy="58" r="16" />
              <circle class="mi:fill-p mi:stroke-card mi:[stroke-width:2]" cx="146" cy="58" r="6" />
            </svg>
            <span class="mi:grid mi:gap-0.5 mi:py-2.5 mi:px-3 mi:text-[12.5px] mi:text-label2">
              <strong class="mi:text-label mi:text-[14px]">Casa do Rio</strong>
              <span>Rua da Ponte 12, Gerês · 41.73° N, 8.16° W</span>
            </span>
          </a>
          <template #footer>Pinned location</template>
        </MiMessage>

        <MiMarker variant="separator">Today</MiMarker>

        <MiMessage v-for="u in uploads" :key="u.id" align="end" label="You" class="mi:max-w-full! mi:ms-auto">
          <MiAttachment
            class="mi:w-[min(300px,68cqi)]!" :name="u.name" :file-size="u.size" :type="u.type" :progress="u.progress" :removable="u.progress < 100"
            @remove="cancel(u.id)"
          />
          <template #footer>
            <span aria-live="polite">{{ u.progress < 100 ? 'Uploading ' + u.progress + '%' : 'Delivered' }}</span>
          </template>
        </MiMessage>
      </MiMessageScroller>

      <div class="mi:flex mi:[justify-content:flex-start] mi:py-3 mi:px-3.5 mi:border-t mi:border-t-sep">
        <MiButton variant="tinted" size="small" :disabled="queue >= files.length" @click="attach">
          <template #leading><MiIcon :svg="icons.clip" :size="16" /></template>
          {{ queue >= files.length ? 'All files sent' : 'Attach ' + files[queue]?.name }}
        </MiButton>
      </div>

      <!-- Inline viewer, shown over the conversation (no teleport). -->
      <Transition enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0" leave-to-class="mi:opacity-0">
        <div v-if="view !== null" class="mi:absolute mi:inset-0 mi:z-2 mi:flex mi:flex-col mi:gap-3 mi:p-3.5 mi:[background:color-mix(in_srgb,_var(--mi-page)_94%,_transparent)] mi:[backdrop-filter:blur(10px)]" role="dialog" aria-modal="false" :aria-label="'Photo ' + (view + 1) + ' of ' + photos.length" @keydown.esc="view = null">
          <div class="mi:flex mi:items-center mi:gap-2.5">
            <MiText variant="subheadline" weight="semibold" class="mi:flex-1 mi:min-w-0">{{ photos[view]?.caption }}</MiText>
            <MiText variant="caption" class="mi:text-label2 mi:tabular-nums">{{ view + 1 }} / {{ photos.length }}</MiText>
            <MiIconButton label="Close viewer" variant="gray" size="small" @click="view = null"><MiIcon name="close" :size="16" /></MiIconButton>
          </div>
          <div class="mi:flex-1 mi:min-h-0 mi:grid mi:place-items-center">
            <Transition mode="out-in" enter-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" leave-active-class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-ease)]" enter-from-class="mi:opacity-0 mi:transform-[scale(.97)]" leave-to-class="mi:opacity-0 mi:transform-[scale(1.02)]">
              <div :key="view" class="mi:cursor-default mi:relative mi:p-0 mi:[border:0] mi:overflow-hidden mi:isolate mi:focus-visible:[outline:3px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-3px] mi:before:content-[''] mi:before:absolute mi:before:-z-1 mi:after:content-[''] mi:after:absolute mi:after:-z-1 mi:w-full mi:h-full mi:max-h-full mi:aspect-[auto] mi:rounded-lg" :class="art[photos[view]?.id ?? 0]" />
            </Transition>
          </div>
          <div class="mi:flex mi:items-center mi:justify-between mi:gap-3">
            <MiIconButton label="Previous photo" variant="gray" @click="move(-1)"><MiIcon name="chevron-left" /></MiIconButton>
            <div class="mi:flex mi:gap-1.5" aria-hidden="true"><span class="mi:w-1.5 mi:h-1.5 mi:rounded-[50%] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" v-for="(p, i) in photos" :key="p.id" :class="i === view ? 'mi:bg-p mi:transform-[scale(1.4)]' : 'mi:bg-fill'" /></div>
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

/** Each frame: a sky gradient, a sun or window, and a ground shape (utility classes per photo id). */
const art: Record<number, string> = {
  1: 'mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-orange)_55%,_var(--mi-card)),_color-mix(in_srgb,_var(--mi-p)_35%,_var(--mi-card)))] mi:before:w-[26%] mi:before:aspect-[1] mi:before:left-[62%] mi:before:top-[18%] mi:before:rounded-[50%] mi:before:[background:color-mix(in_srgb,_var(--mi-yellow)_80%,_var(--mi-card))] mi:after:[inset:58%_-10%_-20%_-10%] mi:after:rounded-[50%_50%_0_0] mi:after:[background:color-mix(in_srgb,_var(--mi-green)_55%,_var(--mi-label))]',
  2: 'mi:[background:linear-gradient(160deg,_color-mix(in_srgb,_var(--mi-orange)_40%,_var(--mi-label)),_color-mix(in_srgb,_var(--mi-orange)_30%,_var(--mi-label)))] mi:before:[inset:20%_-10%_auto_-10%] mi:before:h-[10%] mi:before:[background:color-mix(in_srgb,_var(--mi-orange)_45%,_var(--mi-card))] mi:before:transform-[rotate(-12deg)] mi:after:[inset:52%_-10%_auto_-10%] mi:after:h-[10%] mi:after:[background:color-mix(in_srgb,_var(--mi-orange)_35%,_var(--mi-card))] mi:after:transform-[rotate(-12deg)]',
  3: 'mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-teal)_50%,_var(--mi-card)),_color-mix(in_srgb,_var(--mi-blue)_40%,_var(--mi-card)))] mi:before:inset-[12%] mi:before:[border:5px_solid_color-mix(in_srgb,_var(--mi-label)_70%,_transparent)] mi:before:rounded-[4px] mi:after:[inset:62%_12%_12%_12%] mi:after:[background:color-mix(in_srgb,_var(--mi-green)_60%,_var(--mi-label))] mi:after:[clip-path:polygon(0_100%,_0_40%,_30%_0,_55%_50%,_75%_20%,_100%_60%,_100%_100%)]',
  4: 'mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-indigo)_65%,_var(--mi-label)),_color-mix(in_srgb,_var(--mi-pink)_50%,_var(--mi-card)))] mi:after:[inset:70%_-10%_-10%_-10%] mi:after:[background:repeating-linear-gradient(90deg,_color-mix(in_srgb,_var(--mi-label2)_80%,_transparent)_0_18%,_color-mix(in_srgb,_var(--mi-label3)_80%,_transparent)_18%_20%)]',
  5: 'mi:[background:radial-gradient(circle_at_50%_60%,_color-mix(in_srgb,_var(--mi-orange)_70%,_var(--mi-card))_0_12%,_color-mix(in_srgb,_var(--mi-label)_85%,_transparent)_13%_30%,_color-mix(in_srgb,_var(--mi-label2)_60%,_var(--mi-card))_31%)]',
  6: 'mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-mint)_45%,_var(--mi-card)),_color-mix(in_srgb,_var(--mi-green)_50%,_var(--mi-label)))] mi:after:[inset:40%_30%_-10%_30%] mi:after:[background:color-mix(in_srgb,_var(--mi-orange)_35%,_var(--mi-card))] mi:after:[clip-path:polygon(45%_0,_55%_0,_100%_100%,_0_100%)]',
  7: 'mi:[background:linear-gradient(90deg,_color-mix(in_srgb,_var(--mi-yellow)_30%,_var(--mi-card))_0_60%,_color-mix(in_srgb,_var(--mi-teal)_30%,_var(--mi-card))_60%)] mi:after:[inset:55%_0_0_0] mi:after:[background:color-mix(in_srgb,_var(--mi-label)_70%,_transparent)]'
}

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
