<template>
  <section class="vn" aria-labelledby="vn-title">
    <div class="vn__card">
      <header class="vn__head">
        <MiAvatar name="Tobias Lund" size="sm" tone="blue" decorative />
        <div class="vn__head-text">
          <MiText id="vn-title" as="h2" variant="headline" weight="semibold">Tobias Lund</MiText>
          <MiText variant="caption" tone="label2">Site lead · Malmö warehouse</MiText>
        </div>
      </header>

      <div class="vn__log" role="log" aria-label="Voice messages with Tobias Lund">
        <MiMarker variant="separator">Today</MiMarker>
        <MiMessage
          v-for="n in notes" :key="n.id" :align="n.me ? 'end' : 'start'" :label="n.me ? 'You' : 'Tobias Lund'"
          class="vn__msg" :class="{ 'is-end': n.me }"
        >
          <template v-if="!n.me" #avatar><MiAvatar name="Tobias Lund" size="xs" tone="blue" decorative /></template>
          <div class="vn__note" :class="{ 'is-mine': n.me, 'is-playing': playing === n.id }">
            <div class="vn__player">
              <button type="button" class="vn__play" :aria-label="(playing === n.id ? 'Pause' : 'Play') + ' voice message, ' + fmt(n.dur)" @click="toggle(n)">
                <MiIcon :svg="playing === n.id ? icons.pause : icons.play" :size="18" :filled="playing !== n.id" />
              </button>
              <!-- Waveform: the played layer is revealed with a counter-translated mask (transform only). -->
              <div class="vn__wave" :style="{ '--p': progress(n) }">
                <span class="vn__bars" aria-hidden="true"><span v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span>
                <span class="vn__mask" aria-hidden="true"><span class="vn__mask-in"><span class="vn__bars vn__bars--on"><span v-for="(h, i) in n.bars" :key="i" :style="{ transform: `scaleY(${h})` }" /></span></span></span>
                <input
                  v-model.number="pos[n.id]" class="vn__seek" type="range" min="0" :max="n.dur" step="0.1"
                  :aria-label="'Seek in voice message'" :aria-valuetext="fmt(pos[n.id] ?? 0) + ' of ' + fmt(n.dur)"
                >
              </div>
              <button type="button" class="vn__speed" :aria-label="'Playback speed ' + n.speed + 'x'" @click="n.speed = n.speed === 2 ? 1 : n.speed + 0.5">{{ n.speed }}×</button>
            </div>
            <div class="vn__meta">
              <span class="vn__time">{{ fmt(playing === n.id || (pos[n.id] ?? 0) > 0 ? pos[n.id] ?? 0 : n.dur) }}</span>
              <span v-if="!n.me && !n.heard" class="vn__new" aria-label="not played yet" />
              <button type="button" class="vn__tx-btn" :aria-expanded="n.showText" @click="n.showText = !n.showText">{{ n.showText ? 'Hide transcript' : 'Transcript' }}</button>
              <span class="vn__clock">{{ n.time }}</span>
            </div>
            <!-- Transcript follows playback word by word. -->
            <p v-if="n.showText" class="vn__tx">
              <span v-for="(w, i) in n.words" :key="i" :class="{ 'is-said': i < spoken(n), 'is-now': i === spoken(n) - 1 && playing === n.id }">{{ w + ' ' }}</span>
            </p>
          </div>
        </MiMessage>
      </div>

      <div class="vn__composer" :class="{ 'is-rec': recording }">
        <template v-if="recording">
          <MiIconButton label="Discard recording" variant="gray" size="regular" @click="stopRec(false)"><MiIcon name="trash" :size="18" /></MiIconButton>
          <span class="vn__rec-dot" aria-hidden="true" />
          <span class="vn__rec-time" role="timer" aria-live="off">{{ fmt(recSecs) }}</span>
          <span class="vn__rec-bars" aria-hidden="true"><span v-for="i in 24" :key="i" :style="{ animationDelay: (i * 83 % 500) + 'ms' }" /></span>
          <MiIconButton label="Send voice message" size="regular" @click="stopRec(true)"><MiIcon name="arrow-up" :size="18" /></MiIconButton>
        </template>
        <template v-else>
          <MiText variant="footnote" tone="label2" class="vn__hint">Reply with your voice</MiText>
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
.vn { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.vn__card { display: flex; flex-direction: column; height: 580px; max-width: 620px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.vn__head { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.vn__head-text { min-width: 0; }
.vn__log { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; padding: 16px; background: var(--mi-page); }
.vn__msg { max-width: 100%; }
.vn__msg.is-end { margin-inline-start: auto; }

.vn__note { --tone: var(--mi-p); display: grid; gap: 6px; width: min(20rem, 76cqi); box-sizing: border-box; padding: 10px 12px; border-radius: 20px 20px 20px 6px; background: var(--mi-fill2); }
.vn__note.is-mine { --tone: var(--mi-p-on); border-radius: 20px 20px 6px 20px; background: var(--mi-p); color: var(--mi-p-on); }
.vn__player { display: flex; align-items: center; gap: 10px; }
.vn__play { display: grid; place-items: center; flex: none; width: 38px; height: 38px; padding: 0; border: 0; border-radius: 50%; background: var(--tone); color: var(--mi-p-on); cursor: pointer; transition: transform var(--mi-dur-1) var(--mi-ease); }
.vn__note.is-mine .vn__play { color: var(--mi-p); }
.vn__play:active { transform: scale(.92); }
.vn__play:focus-visible, .vn__speed:focus-visible, .vn__tx-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }

.vn__wave { position: relative; flex: 1; min-width: 0; height: 32px; overflow: hidden; }
.vn__bars { position: absolute; inset: 0; display: flex; align-items: center; gap: 2px; }
.vn__bars span { flex: 1; height: 100%; border-radius: 2px; background: color-mix(in srgb, currentColor 30%, transparent); }
.vn__bars--on span { background: var(--tone); }
.vn__mask, .vn__mask-in { position: absolute; inset: 0; overflow: hidden; transition: transform 100ms linear; }
.vn__mask { pointer-events: none; transform: translateX(calc((var(--p) - 1) * 100%)); }
.vn__mask-in { transform: translateX(calc((1 - var(--p)) * 100%)); }
.vn__seek { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.vn__seek:focus-visible { opacity: 1; accent-color: var(--mi-p); }
.vn__speed { flex: none; min-width: 40px; padding: 4px 8px; border: 0; border-radius: 999px; background: color-mix(in srgb, currentColor 14%, transparent); color: inherit; font: inherit; font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums; cursor: pointer; }

.vn__meta { display: flex; align-items: center; gap: 8px; padding-left: 48px; font-size: 12px; }
.vn__time { font-variant-numeric: tabular-nums; opacity: .75; }
.vn__new { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-p); }
.vn__tx-btn { padding: 0; border: 0; background: none; color: inherit; font: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 2px; text-decoration-color: color-mix(in srgb, currentColor 40%, transparent); cursor: pointer; }
.vn__clock { margin-left: auto; opacity: .6; }
.vn__tx { margin: 4px 0 2px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, currentColor 14%, transparent); font-size: 14px; line-height: 1.55; }
.vn__tx span { opacity: .5; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.vn__tx span.is-said { opacity: 1; }
.vn__tx span.is-now { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; }

.vn__composer { display: flex; align-items: center; gap: 10px; min-height: 64px; padding: 10px 14px; border-top: 1px solid var(--mi-sep); box-sizing: border-box; }
.vn__hint { flex: 1; }
.vn__rec-dot { flex: none; width: 10px; height: 10px; border-radius: 50%; background: var(--mi-red); animation: vn-blink 1s steps(2, start) infinite; }
@keyframes vn-blink { to { opacity: .2; } }
.vn__rec-time { flex: none; min-width: 36px; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.vn__rec-bars { flex: 1; min-width: 0; display: flex; align-items: center; gap: 2px; height: 28px; overflow: hidden; }
.vn__rec-bars span { flex: 1; min-width: 2px; height: 100%; border-radius: 2px; background: var(--mi-red); transform-origin: center; animation: vn-rec 640ms ease-in-out infinite alternate; }
@keyframes vn-rec { from { transform: scaleY(.15); } to { transform: scaleY(.9); } }
@media (prefers-reduced-motion: reduce) { .vn__rec-bars span, .vn__rec-dot { animation: none; } }
</style>
