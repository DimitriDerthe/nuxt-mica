<template>
  <section class="pt mi:@container mi:font-mi mi:text-label" aria-labelledby="pt-title">
    <div class="pt__card mi:flex mi:flex-col mi:max-w-140 mi:mx-auto mi:rounded-xl mi:bg-card mi:shadow-2 mi:overflow-hidden">
      <header class="pt__head mi:flex mi:flex-wrap mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <div class="pt__head-text mi:flex-1 mi:min-w-0">
          <MiText id="pt-title" as="h2" variant="headline" weight="semibold">Dock 4 crew</MiText>
          <MiText variant="caption" tone="label2">Push-to-talk · 6 on shift</MiText>
        </div>
        <MiButton variant="tinted" size="small" :disabled="!unheard.length && !playingId" @click="playingId ? stop() : playAll()">
          <template #leading><MiIcon :name="playingId ? 'close' : 'speaker-wave'" :size="15" /></template>
          {{ playingId ? 'Stop' : `Play unheard (${unheard.length})` }}
        </MiButton>
      </header>

      <ol class="pt__clips mi:[list-style:none] mi:m-0 mi:p-3 mi:grid mi:gap-1.5 mi:bg-page mi:@[480px]:p-4" aria-label="Voice clips">
        <li v-for="c in clips" :key="c.id" class="pt__clip mi:flex mi:gap-2.5 mi:p-2.5 mi:rounded-lg mi:bg-card mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&.is-playing]:transform-[scale(1.01)] mi:[&.is-playing]:shadow-[inset_0_0_0_1.5px_var(--mi-p)]" :class="{ 'is-me': c.who === 'You', 'is-playing': c.id === playingId }">
          <MiAvatar :name="c.who === 'You' ? 'Ruth Adeyemi' : c.who" size="sm" :tone="c.who === 'You' ? 'primary' : 'auto'" decorative />
          <div class="pt__clip-body mi:grid mi:gap-1.5 mi:flex-1 mi:min-w-0">
            <span class="pt__meta mi:flex mi:items-center mi:gap-1 mi:text-[12.5px] mi:text-label2">
              <strong class="mi:[.pt__meta_&]:text-label">{{ c.who }}</strong> · {{ c.time }}
              <span v-if="!c.heard" class="pt__new mi:w-[7px] mi:h-[7px] mi:ml-1 mi:rounded-[50%] mi:bg-p" aria-label="Not played yet" role="img" />
            </span>
            <div class="pt__player mi:flex mi:items-center mi:gap-2.5">
              <MiIconButton :label="(c.id === playingId ? 'Stop clip from ' : 'Play clip from ') + c.who" size="small" variant="tinted" @click="c.id === playingId ? stop() : play(c.id, false)">
                <MiIcon :svg="c.id === playingId ? icons.stop : icons.play" :size="14" />
              </MiIconButton>
              <span class="pt__wave mi:flex mi:items-center mi:gap-0.5 mi:flex-1 mi:min-w-0 mi:h-7 mi:overflow-hidden" aria-hidden="true">
                <span class="mi:[.pt__wave_&]:flex-1 mi:[.pt__wave_&]:min-w-0.5 mi:[.pt__wave_&]:rounded-[2px] mi:[.pt__clip.is-playing_.pt__wave_&]:bg-p-tint2" v-for="(h, i) in c.bars" :key="i" :style="{ transform: `scaleY(${h})` }" />
              </span>
              <span class="pt__dur mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">0:{{ String(c.seconds).padStart(2, '0') }}</span>
            </div>
            <span class="pt__track mi:block mi:h-[3px] mi:rounded-[2px] mi:bg-fill4 mi:overflow-hidden" aria-hidden="true">
              <span class="mi:[.pt__track_&]:block mi:[.pt__track_&]:origin-left" v-if="c.id === playingId" :style="{ animationDuration: c.seconds + 's' }" @animationend="ended(c)" />
            </span>
          </div>
        </li>
      </ol>

      <footer class="pt__talk mi:grid mi:justify-items-center mi:gap-2.5 mi:pt-5 mi:px-4 mi:pb-5.5 mi:border-t mi:border-t-sep">
        <button
          type="button" class="pt__ptt mi:relative mi:grid mi:place-items-center mi:w-19 mi:h-19 mi:[border:0] mi:rounded-[50%] mi:bg-p mi:text-p-on mi:cursor-pointer mi:touch-none mi:select-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:focus-visible:[outline:3px_solid_var(--mi-p-tint2)] mi:focus-visible:outline-offset-[3px] mi:[&.is-rec]:transform-[scale(1.08)] mi:[&.is-rec]:bg-red" :class="{ 'is-rec': recording }" :aria-pressed="recording"
          aria-label="Hold to talk" @pointerdown.prevent="startRec" @pointerup="stopRec" @pointerleave="stopRec" @pointercancel="stopRec"
          @keydown.space.prevent="startRec" @keyup.space.prevent="stopRec"
        >
          <span class="pt__ring mi:absolute mi:-inset-1.5 mi:border-2 mi:border-red mi:rounded-[50%] mi:opacity-0 mi:pointer-events-none mi:motion-reduce:[.pt__ptt.is-rec_&]:opacity-60" aria-hidden="true" />
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
.pt__wave span { height: 100%; background: var(--mi-fill2); }
.pt__track span { height: 100%; background: var(--mi-p); animation: pt-progress linear forwards; }
@keyframes pt-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.pt__ptt.is-rec .pt__ring { animation: pt-pulse 1.2s var(--mi-ease) infinite; }
@keyframes pt-pulse { from { transform: scale(.9); opacity: .8; } to { transform: scale(1.35); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .pt__ptt.is-rec .pt__ring { animation: none; } }
</style>
