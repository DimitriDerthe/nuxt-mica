<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="pt-title">
    <div class="mi:flex mi:flex-col mi:max-w-140 mi:mx-auto mi:rounded-xl mi:bg-card mi:shadow-2 mi:overflow-hidden">
      <header class="mi:flex mi:flex-wrap mi:items-center mi:gap-3 mi:py-3.5 mi:px-4 mi:border-b mi:border-b-sep">
        <div class="mi:flex-1 mi:min-w-0">
          <MiText id="pt-title" as="h2" variant="headline" weight="semibold">Dock 4 crew</MiText>
          <MiText variant="caption" tone="label2">Push-to-talk · 6 on shift</MiText>
        </div>
        <MiButton variant="tinted" size="small" :disabled="!unheard.length && !playingId" @click="playingId ? stop() : playAll()">
          <template #leading><MiIcon :name="playingId ? 'close' : 'speaker-wave'" :size="15" /></template>
          {{ playingId ? 'Stop' : `Play unheard (${unheard.length})` }}
        </MiButton>
      </header>

      <ol class="mi:[list-style:none] mi:m-0 mi:p-3 mi:grid mi:gap-1.5 mi:bg-page mi:@[480px]:p-4" aria-label="Voice clips">
        <li v-for="c in clips" :key="c.id" class="mi:flex mi:gap-2.5 mi:p-2.5 mi:rounded-lg mi:bg-card mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)]" :class="c.id === playingId ? 'mi:transform-[scale(1.01)] mi:shadow-[inset_0_0_0_1.5px_var(--mi-p)]' : ''">
          <MiAvatar :name="c.who === 'You' ? 'Ruth Adeyemi' : c.who" size="sm" :tone="c.who === 'You' ? 'primary' : 'auto'" decorative />
          <div class="mi:grid mi:gap-1.5 mi:flex-1 mi:min-w-0">
            <span class="mi:flex mi:items-center mi:gap-1 mi:text-[12.5px] mi:text-label2">
              <strong class="mi:text-label">{{ c.who }}</strong> · {{ c.time }}
              <span v-if="!c.heard" class="mi:w-[7px] mi:h-[7px] mi:ml-1 mi:rounded-[50%] mi:bg-p" aria-label="Not played yet" role="img" />
            </span>
            <div class="mi:flex mi:items-center mi:gap-2.5">
              <MiIconButton :label="(c.id === playingId ? 'Stop clip from ' : 'Play clip from ') + c.who" size="small" variant="tinted" @click="c.id === playingId ? stop() : play(c.id, false)">
                <MiIcon :svg="c.id === playingId ? icons.stop : icons.play" :size="14" />
              </MiIconButton>
              <span class="mi:flex mi:items-center mi:gap-0.5 mi:flex-1 mi:min-w-0 mi:h-7 mi:overflow-hidden" aria-hidden="true">
                <span class="mi:h-full mi:flex-1 mi:min-w-0.5 mi:rounded-[2px]" :class="c.id === playingId ? 'mi:bg-p-tint2' : 'mi:bg-fill2'" v-for="(h, i) in c.bars" :key="i" :style="{ transform: `scaleY(${h})` }" />
              </span>
              <span class="mi:flex-[none] mi:text-[12px] mi:text-label3 mi:tabular-nums">0:{{ String(c.seconds).padStart(2, '0') }}</span>
            </div>
            <span class="mi:block mi:h-[3px] mi:rounded-[2px] mi:bg-fill4 mi:overflow-hidden" aria-hidden="true">
              <span class="mi:h-full mi:bg-p mi:animate-[grow_linear_forwards] mi:block mi:origin-left" v-if="c.id === playingId" :style="{ animationDuration: c.seconds + 's' }" @animationend="ended(c)" />
            </span>
          </div>
        </li>
      </ol>

      <footer class="mi:grid mi:justify-items-center mi:gap-2.5 mi:pt-5 mi:px-4 mi:pb-5.5 mi:border-t mi:border-t-sep">
        <button
          type="button" class="mi:group mi:relative mi:grid mi:place-items-center mi:w-19 mi:h-19 mi:[border:0] mi:rounded-[50%] mi:text-p-on mi:cursor-pointer mi:touch-none mi:select-none mi:[transition:transform_var(--mi-dur-2)_var(--mi-spring)] mi:focus-visible:[outline:3px_solid_var(--mi-p-tint2)] mi:focus-visible:outline-offset-[3px]" :class="recording ? 'mi:transform-[scale(1.08)] mi:bg-red' : 'mi:bg-p'" :data-rec="recording || undefined" :aria-pressed="recording"
          aria-label="Hold to talk" @pointerdown.prevent="startRec" @pointerup="stopRec" @pointerleave="stopRec" @pointercancel="stopRec"
          @keydown.space.prevent="startRec" @keyup.space.prevent="stopRec"
        >
          <span class="mi:absolute mi:-inset-1.5 mi:border-2 mi:border-red mi:rounded-[50%] mi:opacity-0 mi:pointer-events-none mi:group-data-[rec]:opacity-80 mi:group-data-[rec]:transform-[scale(.9)] mi:group-data-[rec]:[--mi-out-s:1.35] mi:group-data-[rec]:animate-[out_1.2s_var(--mi-ease)_infinite] mi:motion-reduce:group-data-[rec]:animate-none mi:motion-reduce:group-data-[rec]:opacity-60" aria-hidden="true" />
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
