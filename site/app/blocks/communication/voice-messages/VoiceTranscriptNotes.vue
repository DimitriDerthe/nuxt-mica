<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="vn-title">
    <div class="mi:flex mi:flex-col mi:h-145 mi:max-w-155 mi:mx-auto mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <MiAvatar name="Tobias Lund" size="sm" tone="blue" decorative />
        <div class="mi:min-w-0">
          <MiText id="vn-title" as="h2" variant="headline" weight="semibold">Tobias Lund</MiText>
          <MiText variant="caption" tone="label2">Site lead · Malmö warehouse</MiText>
        </div>
      </header>

      <div class="mi:flex-1 mi:min-h-0 mi:overflow-y-auto mi:flex mi:flex-col mi:gap-3.5 mi:p-4 mi:[background:var(--mi-page)]" role="log" aria-label="Voice messages with Tobias Lund">
        <MiMarker variant="separator">Today</MiMarker>
        <MiMessage
          v-for="n in notes" :key="n.id" :align="n.me ? 'end' : 'start'" :label="n.me ? 'You' : 'Tobias Lund'"
          class="mi:max-w-full!" :class="n.me ? 'mi:ms-auto!' : ''"
        >
          <template v-if="!n.me" #avatar><MiAvatar name="Tobias Lund" size="xs" tone="blue" decorative /></template>
          <div class="mi:grid mi:gap-1.5 mi:w-[min(20rem,_76cqi)] mi:box-border mi:py-2.5 mi:px-3" :class="n.me ? 'mi:[--tone:var(--mi-p-on)] mi:rounded-[20px_20px_6px_20px] mi:[background:var(--mi-p)] mi:text-p-on' : 'mi:[--tone:var(--mi-p)] mi:rounded-[20px_20px_20px_6px] mi:[background:var(--mi-fill2)]'">
            <div class="mi:flex mi:items-center mi:gap-2.5">
              <button type="button" class="mi:grid mi:place-items-center mi:flex-[none] mi:w-9.5 mi:h-9.5 mi:p-0 mi:[border:0] mi:rounded-[50%] mi:[background:var(--tone)] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease)] mi:active:transform-[scale(.92)] mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px]" :class="n.me ? 'mi:text-p' : 'mi:text-p-on'" :aria-label="(playing === n.id ? 'Pause' : 'Play') + ' voice message, ' + fmt(n.dur)" @click="toggle(n)">
                <MiIcon :svg="playing === n.id ? icons.pause : icons.play" :size="18" :filled="playing !== n.id" />
              </button>
              <!-- Waveform: the played layer is revealed with a counter-translated mask (transform only). -->
              <div class="mi:relative mi:flex-1 mi:min-w-0 mi:h-8 mi:overflow-hidden" :style="{ '--p': progress(n) }">
                <span class="mi:absolute mi:inset-0 mi:flex mi:items-center mi:gap-0.5" aria-hidden="true"><span class="mi:[background:color-mix(in_srgb,_currentColor_30%,_transparent)] mi:flex-1 mi:h-full mi:rounded-[2px]" v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span>
                <span class="mi:absolute mi:inset-0 mi:overflow-hidden mi:[transition:transform_100ms_linear] mi:pointer-events-none mi:transform-[translateX(calc((var(--p)_-_1)_*_100%))]" aria-hidden="true"><span class="mi:absolute mi:inset-0 mi:overflow-hidden mi:[transition:transform_100ms_linear] mi:transform-[translateX(calc((1_-_var(--p))_*_100%))]"><span class="mi:absolute mi:inset-0 mi:flex mi:items-center mi:gap-0.5"><span class="mi:[background:var(--tone)] mi:flex-1 mi:h-full mi:rounded-[2px]" v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span></span></span>
                <input
                  v-model.number="pos[n.id]" class="mi:absolute mi:inset-0 mi:w-full mi:h-full mi:m-0 mi:opacity-0 mi:cursor-pointer mi:focus-visible:opacity-100 mi:focus-visible:accent-p" type="range" min="0" :max="n.dur" step="0.1"
                  :aria-label="'Seek in voice message'" :aria-valuetext="fmt(pos[n.id] ?? 0) + ' of ' + fmt(n.dur)"
                >
              </div>
              <button type="button" class="mi:[font:inherit] mi:text-[12px] mi:font-bold mi:tabular-nums mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px] mi:flex-[none] mi:min-w-10 mi:py-1 mi:px-2 mi:[border:0] mi:rounded-[999px] mi:[background:color-mix(in_srgb,_currentColor_14%,_transparent)] mi:text-inherit mi:cursor-pointer" :aria-label="'Playback speed ' + n.speed + 'x'" @click="n.speed = n.speed === 2 ? 1 : n.speed + 0.5">{{ n.speed }}×</button>
            </div>
            <div class="mi:flex mi:items-center mi:gap-2 mi:pl-12 mi:text-[12px]">
              <span class="mi:tabular-nums mi:opacity-75">{{ fmt(playing === n.id || (pos[n.id] ?? 0) > 0 ? pos[n.id] ?? 0 : n.dur) }}</span>
              <span v-if="!n.me && !n.heard" class="mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-p)]" aria-label="not played yet" />
              <button type="button" class="mi:[font:inherit] mi:font-semibold mi:underline mi:[text-decoration-color:color-mix(in_srgb,_currentColor_40%,_transparent)] mi:focus-visible:[outline:2px_solid_currentColor] mi:focus-visible:outline-offset-[2px] mi:p-0 mi:[border:0] mi:[background:none] mi:text-inherit mi:underline-offset-[2px] mi:cursor-pointer" :aria-expanded="n.showText" @click="n.showText = !n.showText">{{ n.showText ? 'Hide transcript' : 'Transcript' }}</button>
              <span class="mi:ml-auto mi:opacity-60">{{ n.time }}</span>
            </div>
            <!-- Transcript follows playback word by word. -->
            <p v-if="n.showText" class="mi:mt-1 mi:mx-0 mi:mb-0.5 mi:pt-2 mi:border-t mi:border-t-[color:color-mix(in_srgb,_currentColor_14%,_transparent)] mi:text-[14px] mi:leading-[1.55]">
              <span class="mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" v-for="(w, i) in n.words" :key="i" :class="[i < spoken(n) ? 'mi:opacity-100' : 'mi:opacity-50', i === spoken(n) - 1 && playing === n.id ? 'mi:underline-offset-[3px] mi:underline mi:[text-decoration-thickness:2px]' : '']">{{ w + ' ' }}</span>
            </p>
          </div>
        </MiMessage>
      </div>

      <div class="mi:flex mi:items-center mi:gap-2.5 mi:min-h-16 mi:py-2.5 mi:px-3.5 mi:border-t mi:border-t-sep mi:box-border">
        <template v-if="recording">
          <MiIconButton label="Discard recording" variant="gray" size="regular" @click="stopRec(false)"><MiIcon name="trash" :size="18" /></MiIconButton>
          <span class="mi:flex-[none] mi:w-2.5 mi:h-2.5 mi:rounded-[50%] mi:[background:var(--mi-red)] mi:[--mi-blink:.2] mi:animate-[blink_1s_steps(2,_start)_infinite] mi:motion-reduce:animate-none" aria-hidden="true" />
          <span class="mi:flex-[none] mi:min-w-9 mi:text-[14px] mi:font-semibold mi:tabular-nums" role="timer" aria-live="off">{{ fmt(recSecs) }}</span>
          <span class="mi:flex-1 mi:min-w-0 mi:flex mi:items-center mi:gap-0.5 mi:h-7 mi:overflow-hidden" aria-hidden="true"><span class="mi:bg-red mi:[--mi-grow-x:1] mi:[--mi-grow-y:.15] mi:[--mi-grow-y-to:.9] mi:animate-[grow_640ms_ease-in-out_infinite_alternate] mi:motion-reduce:animate-none mi:flex-1 mi:min-w-0.5 mi:h-full mi:rounded-[2px] mi:origin-center" v-for="i in 24" :key="i" :style="{ animationDelay: (i * 83 % 500) + 'ms' }" /></span>
          <MiIconButton label="Send voice message" size="regular" @click="stopRec(true)"><MiIcon name="arrow-up" :size="18" /></MiIconButton>
        </template>
        <template v-else>
          <MiText variant="footnote" tone="label2" class="mi:flex-1">Reply with your voice</MiText>
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
