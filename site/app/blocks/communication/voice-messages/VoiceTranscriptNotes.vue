<template>
  <section class="vn mi:@container mi:font-mi mi:text-label" aria-labelledby="vn-title">
    <div class="vn__card mi:flex mi:flex-col mi:h-145 mi:max-w-155 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <header class="vn__head mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Tobias Lund" size="sm" tone="blue" decorative />
        <div class="vn__head-text mi:min-w-0">
          <MiText id="vn-title" as="h2" variant="headline" weight="semibold">Tobias Lund</MiText>
          <MiText variant="caption" tone="label2">Site lead · Malmö warehouse</MiText>
        </div>
      </header>

      <div class="vn__log mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:flex mi:flex-col mi:gap-3.5 mi:p-4 mi:[background:var(--mi-page)]" role="log" aria-label="Voice messages with Tobias Lund">
        <MiMarker variant="separator">Today</MiMarker>
        <MiMessage
          v-for="n in notes" :key="n.id" :align="n.me ? 'end' : 'start'" :label="n.me ? 'You' : 'Tobias Lund'"
          class="vn__msg mi:[&.is-end]:ms-auto" :class="{ 'is-end': n.me }"
        >
          <template v-if="!n.me" #avatar><MiAvatar name="Tobias Lund" size="xs" tone="blue" decorative /></template>
          <div class="vn__note mi:[--tone:var(--mi-p)] mi:grid mi:gap-1.5 mi:w-[min(20rem,_76cqi)] mi:box-border mi:py-2.5 mi:px-3 mi:rounded-[20px_20px_20px_6px] mi:[background:var(--mi-fill2)] mi:[&.is-mine]:[--tone:var(--mi-p-on)] mi:[&.is-mine]:rounded-[20px_20px_6px_20px] mi:[&.is-mine]:[background:var(--mi-p)] mi:[&.is-mine]:text-p-on" :class="{ 'is-mine': n.me, 'is-playing': playing === n.id }">
            <div class="vn__player mi:flex mi:items-center mi:gap-2.5">
              <button type="button" class="vn__play mi:grid mi:place-items-center mi:flex-[none] mi:w-9.5 mi:h-9.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:var(--tone)] mi:text-p-on mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:[.vn__note.is-mine_&]:text-p mi:active:transform-[scale(.92)] mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px]" :aria-label="(playing === n.id ? 'Pause' : 'Play') + ' voice message, ' + fmt(n.dur)" @click="toggle(n)">
                <MiIcon :svg="playing === n.id ? icons.pause : icons.play" :size="18" :filled="playing !== n.id" />
              </button>
              <!-- Waveform: the played layer is revealed with a counter-translated mask (transform only). -->
              <div class="vn__wave mi:relative mi:flex-1 mi:min-w-0 mi:h-8 mi:overflow-hidden" :style="{ '--p': progress(n) }">
                <span class="vn__bars mi:absolute mi:inset-0 mi:flex mi:items-center mi:gap-0.5" aria-hidden="true"><span class="mi:[.vn__bars_&]:flex-1 mi:[.vn__bars_&]:h-full mi:[.vn__bars_&]:rounded-[2px]" v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span>
                <span class="vn__mask mi:absolute mi:inset-0 mi:overflow-hidden mi:[transition:transform_100ms_linear] mi:pointer-events-none mi:transform-[translateX(calc((var(--p)_-_1)_*_100%))]" aria-hidden="true"><span class="vn__mask-in mi:absolute mi:inset-0 mi:overflow-hidden mi:[transition:transform_100ms_linear] mi:transform-[translateX(calc((1_-_var(--p))_*_100%))]"><span class="vn__bars vn__bars--on mi:absolute mi:inset-0 mi:flex mi:items-center mi:gap-0.5"><span class="mi:[.vn__bars_&]:flex-1 mi:[.vn__bars_&]:h-full mi:[.vn__bars_&]:rounded-[2px]" v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span></span></span>
                <input
                  v-model.number="pos[n.id]" class="vn__seek mi:absolute mi:inset-0 mi:w-full mi:h-full mi:m-0 mi:opacity-0 mi:cursor-pointer mi:focus-visible:opacity-100 mi:focus-visible:accent-p" type="range" min="0" :max="n.dur" step="0.1"
                  :aria-label="'Seek in voice message'" :aria-valuetext="fmt(pos[n.id] ?? 0) + ' of ' + fmt(n.dur)"
                >
              </div>
              <button type="button" class="vn__speed mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px] mi:flex-[none] mi:min-w-10 mi:py-1 mi:px-2 mi:[border:0] mi:rounded-[999px] mi:[background:color-mix(in_srgb,_currentColor_14%,_transparent)] mi:text-inherit mi:cursor-pointer" :aria-label="'Playback speed ' + n.speed + 'x'" @click="n.speed = n.speed === 2 ? 1 : n.speed + 0.5">{{ n.speed }}×</button>
            </div>
            <div class="vn__meta mi:flex mi:items-center mi:gap-2 mi:pl-12 mi:text-[12px]">
              <span class="vn__time mi:tabular-nums mi:opacity-75">{{ fmt(playing === n.id || (pos[n.id] ?? 0) > 0 ? pos[n.id] ?? 0 : n.dur) }}</span>
              <span v-if="!n.me && !n.heard" class="vn__new mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-p)]" aria-label="not played yet" />
              <button type="button" class="vn__tx-btn mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px] mi:p-0 mi:[border:0] mi:[background:none] mi:text-inherit mi:underline-offset-[2px] mi:cursor-pointer" :aria-expanded="n.showText" @click="n.showText = !n.showText">{{ n.showText ? 'Hide transcript' : 'Transcript' }}</button>
              <span class="vn__clock mi:ml-auto mi:opacity-60">{{ n.time }}</span>
            </div>
            <!-- Transcript follows playback word by word. -->
            <p v-if="n.showText" class="vn__tx mi:mt-1 mi:mx-0 mi:mb-0.5 mi:pt-2 mi:border-t mi:border-t-[color:color-mix(in_srgb,_currentColor_14%,_transparent)] mi:text-[14px] mi:leading-[1.55]">
              <span class="mi:[.vn__tx_&]:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" v-for="(w, i) in n.words" :key="i" :class="{ 'is-said': i < spoken(n), 'is-now mi:[.vn__tx_&]:underline-offset-[3px]': i === spoken(n) - 1 && playing === n.id }">{{ w + ' ' }}</span>
            </p>
          </div>
        </MiMessage>
      </div>

      <div class="vn__composer mi:flex mi:items-center mi:gap-2.5 mi:min-h-16 mi:py-2.5 mi:px-3.5 mi:border-t mi:border-t-sep mi:box-border" :class="{ 'is-rec': recording }">
        <template v-if="recording">
          <MiIconButton label="Discard recording" variant="gray" size="regular" @click="stopRec(false)"><MiIcon name="trash" :size="18" /></MiIconButton>
          <span class="vn__rec-dot mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:[background:var(--mi-red)]" aria-hidden="true" />
          <span class="vn__rec-time mi:flex-[none] mi:min-w-9 mi:text-[14px] mi:font-semibold mi:tabular-nums" role="timer" aria-live="off">{{ fmt(recSecs) }}</span>
          <span class="vn__rec-bars mi:flex-1 mi:min-w-0 mi:flex mi:items-center mi:gap-0.5 mi:h-7 mi:overflow-hidden" aria-hidden="true"><span class="mi:[.vn__rec-bars_&]:flex-1 mi:[.vn__rec-bars_&]:min-w-0.5 mi:[.vn__rec-bars_&]:h-full mi:[.vn__rec-bars_&]:rounded-[2px] mi:[.vn__rec-bars_&]:origin-center" v-for="i in 24" :key="i" :style="{ animationDelay: (i * 83 % 500) + 'ms' }" /></span>
          <MiIconButton label="Send voice message" size="regular" @click="stopRec(true)"><MiIcon name="arrow-up" :size="18" /></MiIconButton>
        </template>
        <template v-else>
          <MiText variant="footnote" tone="label2" class="vn__hint mi:flex-1">Reply with your voice</MiText>
          <MiButton size="small" @click="startRec">
            <template #leading><MiIcon :svg="icons.mic" :size="16" /></template>Record
          </MiButton>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'

interface Note { id: number, me: boolean, dur: number, time: string, bars: number[], words: string[], speed: number, showText: boolean, heard: boolean }

const icons = {
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  pause: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'
}

// Deterministic pseudo-waveform so server and client render the same bars.
function wave(seed: number, count = 38) {
  return Array.from({ length: count }, (_, i) => {
    const v = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1
    const env = Math.sin((i / (count - 1)) * Math.PI) * 0.55 + 0.35
    return Math.round(Math.max(0.12, Math.min(1, v * env + 0.12)) * 100) / 100
  })
}

const note = (id: number, me: boolean, dur: number, time: string, text: string): Note =>
  ({ id, me, dur, time, bars: wave(id), words: text.split(' '), speed: 1, showText: id === 1, heard: me })

// Sample voice notes; swap for your audio and transcription API.
const notes = ref<Note[]>([
  note(1, false, 14, '07:42', 'Morning. The truck from Gdańsk is two hours late, so the 9 o\'clock pick wave moves to 11. I need four people from returns to help unload.'),
  note(2, true, 6, '07:45', 'Fine by me. Take Elin and Marco from returns, I will cover their queue.'),
  note(3, false, 9, '07:51', 'Thanks. Truck is at the gate now, we should be back on schedule by lunch.')
])

const pos = reactive<Record<number, number>>({})
const playing = ref<number | null>(null)
const recording = ref(false)
const recSecs = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
const progress = (n: Note) => Math.min(1, (pos[n.id] ?? 0) / n.dur)
const spoken = (n: Note) => Math.ceil(progress(n) * n.words.length)

// One interval serves playback and recording; it stops when neither is running.
function tick() {
  const n = notes.value.find(x => x.id === playing.value)
  if (n) {
    const next = (pos[n.id] ?? 0) + 0.1 * n.speed
    if (next >= n.dur) { pos[n.id] = 0; playing.value = null }
    else pos[n.id] = next
  }
  if (recording.value) recSecs.value += 0.1
  if (!playing.value && !recording.value) { clearInterval(timer); timer = undefined }
}
const run = () => { timer ??= setInterval(tick, 100) }

function toggle(n: Note) {
  if (playing.value === n.id) { playing.value = null; return }
  playing.value = n.id
  n.heard = true
  run()
}

function startRec() {
  playing.value = null
  recSecs.value = 0
  recording.value = true
  run()
}

let seq = 100
function stopRec(send: boolean) {
  recording.value = false
  if (send) {
    notes.value.push({ ...note(++seq, true, Math.max(1, Math.round(recSecs.value)), 'Now', 'Transcript will appear here once the recording is processed.'), showText: false })
  }
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<style scoped>
.vn__msg { max-width: 100%; }
.vn__bars span { background: color-mix(in srgb, currentColor 30%, transparent); }
.vn__bars--on span { background: var(--tone); }
.vn__speed { font: inherit; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; }
.vn__tx-btn { font: inherit; font-weight: 600; text-decoration: underline; text-decoration-color: color-mix(in srgb, currentColor 40%, transparent); }
.vn__tx span { opacity: .5; }
.vn__tx span.is-said { opacity: 1; }
.vn__tx span.is-now { text-decoration: underline; text-decoration-thickness: 2px; }
.vn__rec-dot { animation: vn-blink 1s steps(2, start) infinite; }
@keyframes vn-blink { to { opacity: .2; } }
.vn__rec-bars span { background: var(--mi-red); animation: vn-rec 640ms ease-in-out infinite alternate; }
@keyframes vn-rec { from { transform: scaleY(.15); } to { transform: scaleY(.9); } }
@media (prefers-reduced-motion: reduce) { .vn__rec-bars span, .vn__rec-dot { animation: none; } }
</style>
