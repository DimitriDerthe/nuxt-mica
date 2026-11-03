<template>
  <section class="pt" aria-labelledby="pt-title">
    <div class="pt__card">
      <header class="pt__head">
        <div class="pt__head-text">
          <MiText id="pt-title" as="h2" variant="headline" weight="semibold">Dock 4 crew</MiText>
          <MiText variant="caption" tone="label2">Push-to-talk · 6 on shift</MiText>
        </div>
        <MiButton variant="tinted" size="small" :disabled="!unheard.length && !playingId" @click="playingId ? stop() : playAll()">
          <template #leading><MiIcon :name="playingId ? 'close' : 'speaker-wave'" :size="15" /></template>
          {{ playingId ? 'Stop' : `Play unheard (${unheard.length})` }}
        </MiButton>
      </header>

      <ol class="pt__clips" aria-label="Voice clips">
        <li v-for="c in clips" :key="c.id" class="pt__clip" :class="{ 'is-me': c.who === 'You', 'is-playing': c.id === playingId }">
          <MiAvatar :name="c.who === 'You' ? 'Ruth Adeyemi' : c.who" size="sm" :tone="c.who === 'You' ? 'primary' : 'auto'" decorative />
          <div class="pt__clip-body">
            <span class="pt__meta">
              <strong>{{ c.who }}</strong> · {{ c.time }}
              <span v-if="!c.heard" class="pt__new" aria-label="Not played yet" role="img" />
            </span>
            <div class="pt__player">
              <MiIconButton :label="(c.id === playingId ? 'Stop clip from ' : 'Play clip from ') + c.who" size="small" variant="tinted" @click="c.id === playingId ? stop() : play(c.id, false)">
                <MiIcon :svg="c.id === playingId ? icons.stop : icons.play" :size="14" />
              </MiIconButton>
              <span class="pt__wave" aria-hidden="true">
                <span v-for="(h, i) in c.bars" :key="i" :style="{ transform: `scaleY(${h})` }" />
              </span>
              <span class="pt__dur">0:{{ String(c.seconds).padStart(2, '0') }}</span>
            </div>
            <span class="pt__track" aria-hidden="true">
              <span v-if="c.id === playingId" :style="{ animationDuration: c.seconds + 's' }" @animationend="ended(c)" />
            </span>
          </div>
        </li>
      </ol>

      <footer class="pt__talk">
        <button
          type="button" class="pt__ptt" :class="{ 'is-rec': recording }" :aria-pressed="recording"
          aria-label="Hold to talk" @pointerdown.prevent="startRec" @pointerup="stopRec" @pointerleave="stopRec" @pointercancel="stopRec"
          @keydown.space.prevent="startRec" @keyup.space.prevent="stopRec"
        >
          <span class="pt__ring" aria-hidden="true" />
          <MiIcon :svg="icons.mic" :size="28" />
        </button>
        <MiText variant="footnote" tone="label2" role="status">{{ recording ? 'Recording… release to send' : hint }}</MiText>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Clip { id: string, who: string, time: string, seconds: number, heard: boolean, bars: number[] }

const icons = {
  play: '<path d="M8 5.5v13l10-6.5z" fill="currentColor"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'
}

// Deterministic bar heights so the waveform is stable between renders.
const wave = (seed: number, n = 28) => Array.from({ length: n }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(seed * 3.1 + i * 0.9) * Math.cos(i * 0.37 + seed)))

// Sample channel; swap for your audio backend.
const clips = ref<Clip[]>([
  { id: 'c1', who: 'Mike Duarte', time: '06:41', seconds: 6, heard: true, bars: wave(1) },
  { id: 'c2', who: 'Ana Kovač', time: '06:52', seconds: 9, heard: false, bars: wave(2) },
  { id: 'c3', who: 'Mike Duarte', time: '06:55', seconds: 4, heard: false, bars: wave(3) },
  { id: 'c4', who: 'Sam O’Neill', time: '07:03', seconds: 7, heard: false, bars: wave(4) }
])

const playingId = ref<string | null>(null)
const queueMode = ref(false)
const recording = ref(false)
const hint = ref('Hold the button or Space to talk')
let recStart = 0

const unheard = computed(() => clips.value.filter(c => !c.heard))

function play(id: string, queue: boolean) {
  playingId.value = id
  queueMode.value = queue
}
function playAll() {
  const first = unheard.value[0]
  if (first) play(first.id, true)
}
function stop() {
  playingId.value = null
}
// The progress bar is a CSS animation; its end marks the clip heard and advances the queue.
function ended(c: Clip) {
  c.heard = true
  const next = queueMode.value ? unheard.value[0] : undefined
  playingId.value = next ? next.id : null
}

function startRec() {
  if (recording.value) return
  stop()
  recording.value = true
  recStart = performance.now()
}
function stopRec() {
  if (!recording.value) return
  recording.value = false
  const seconds = Math.round((performance.now() - recStart) / 1000)
  if (seconds < 1) { hint.value = 'Too short. Hold a little longer.'; return }
  const id = 'r' + clips.value.length
  clips.value.push({ id, who: 'You', time: 'Now', seconds: Math.min(seconds, 59), heard: true, bars: wave(clips.value.length + 7) })
  hint.value = `Sent a ${seconds}s clip to Dock 4 crew.`
}
</script>

<style scoped>
.pt { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.pt__card { display: flex; flex-direction: column; max-width: 560px; margin-inline: auto; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); overflow: hidden; }
.pt__head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--mi-sep); }
.pt__head-text { flex: 1; min-width: 0; }

.pt__clips { list-style: none; margin: 0; padding: 12px; display: grid; gap: 6px; background: var(--mi-page); }
.pt__clip { display: flex; gap: 10px; padding: 10px; border-radius: var(--mi-radius-l); background: var(--mi-card); transition: transform var(--mi-dur-2) var(--mi-ease); }
.pt__clip.is-playing { transform: scale(1.01); box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.pt__clip-body { display: grid; gap: 6px; flex: 1; min-width: 0; }
.pt__meta { display: flex; align-items: center; gap: 4px; font-size: 12.5px; color: var(--mi-label2); }
.pt__meta strong { color: var(--mi-label); }
.pt__new { width: 7px; height: 7px; margin-left: 4px; border-radius: 50%; background: var(--mi-p); }
.pt__player { display: flex; align-items: center; gap: 10px; }
.pt__wave { display: flex; align-items: center; gap: 2px; flex: 1; min-width: 0; height: 28px; overflow: hidden; }
.pt__wave span { flex: 1; min-width: 2px; height: 100%; border-radius: 2px; background: var(--mi-fill2); }
.pt__clip.is-playing .pt__wave span { background: var(--mi-p-tint2); }
.pt__dur { flex: none; font-size: 12px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.pt__track { display: block; height: 3px; border-radius: 2px; background: var(--mi-fill4); overflow: hidden; }
.pt__track span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; animation: pt-progress linear forwards; }
@keyframes pt-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.pt__talk { display: grid; justify-items: center; gap: 10px; padding: 20px 16px 22px; border-top: 1px solid var(--mi-sep); }
.pt__ptt { position: relative; display: grid; place-items: center; width: 76px; height: 76px; border: 0; border-radius: 50%; background: var(--mi-p); color: var(--mi-p-on); cursor: pointer; touch-action: none; user-select: none; transition: transform var(--mi-dur-2) var(--mi-spring); }
.pt__ptt:focus-visible { outline: 3px solid var(--mi-p-tint2); outline-offset: 3px; }
.pt__ptt.is-rec { transform: scale(1.08); background: var(--mi-red); }
.pt__ring { position: absolute; inset: -6px; border: 2px solid var(--mi-red); border-radius: 50%; opacity: 0; pointer-events: none; }
.pt__ptt.is-rec .pt__ring { animation: pt-pulse 1.2s var(--mi-ease) infinite; }
@keyframes pt-pulse { from { transform: scale(.9); opacity: .8; } to { transform: scale(1.35); opacity: 0; } }
@container (min-width: 480px) { .pt__clips { padding: 16px; } }
@media (prefers-reduced-motion: reduce) { .pt__ptt.is-rec .pt__ring { animation: none; opacity: .6; } }
</style>
