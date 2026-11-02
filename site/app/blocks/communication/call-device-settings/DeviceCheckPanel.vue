<template>
  <section class="dc" aria-labelledby="dc-title">
    <div class="dc__card">
      <header class="dc__head">
        <MiText id="dc-title" as="h2" variant="title3" weight="bold">Check your setup</MiText>
        <MiText variant="footnote" tone="label2">Sprint 42 review starts in 2 minutes · 5 people waiting</MiText>
      </header>

      <div class="dc__grid">
        <!-- Preview: a drawn camera tile; mirror flips it, blur crossfades a soft layer over the room. -->
        <div class="dc__preview-col">
          <div class="dc__preview" :class="{ 'is-mirror': mirror, 'is-off': !camOn }" role="img" :aria-label="camOn ? 'Camera preview' : 'Camera is off'">
            <div class="dc__room" aria-hidden="true"><span class="dc__shelf" /><span class="dc__plant" /><span class="dc__lamp" /></div>
            <div class="dc__blur" :class="{ 'is-on': blur }" aria-hidden="true" />
            <span class="dc__face" aria-hidden="true">LF</span>
            <span class="dc__cam-label">{{ cameraName }}</span>
          </div>
          <div class="dc__quick">
            <MiButton :variant="camOn ? 'gray' : 'filled'" size="small" :pressed="!camOn" @click="camOn = !camOn">
              <template #leading><MiIcon :svg="camOn ? icons.cam : icons.camOff" :size="16" /></template>{{ camOn ? 'Camera on' : 'Camera off' }}
            </MiButton>
            <MiButton :variant="micOn ? 'gray' : 'filled'" size="small" :pressed="!micOn" @click="micOn = !micOn">
              <template #leading><MiIcon :svg="micOn ? icons.mic : icons.micOff" :size="16" /></template>{{ micOn ? 'Mic on' : 'Muted' }}
            </MiButton>
          </div>
        </div>

        <div class="dc__form">
          <div class="dc__field">
            <label for="dc-cam" class="dc__label">Camera</label>
            <MiSelect id="dc-cam" v-model="camera" :options="cameras" size="sm" />
          </div>

          <div class="dc__field">
            <label for="dc-mic" class="dc__label">Microphone</label>
            <MiSelect id="dc-mic" v-model="mic" :options="mics" size="sm" />
            <!-- Level ladder: bars bounce with CSS, the group is scaled by input volume and device sensitivity. -->
            <div class="dc__level" role="meter" aria-label="Microphone level" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="micOn ? Math.round(level * 100) : 0">
              <div class="dc__bars" :class="{ 'is-still': !micOn }" :style="{ transform: `scaleY(${micOn ? level : 0.06})` }">
                <span v-for="i in 18" :key="i" :style="{ animationDelay: (i * 97 % 600) + 'ms', animationDuration: (520 + (i * 131 % 380)) + 'ms' }" />
              </div>
              <MiText variant="caption" tone="label2" class="dc__level-text">{{ micOn ? (level > 0.75 ? 'Loud and clear' : level > 0.4 ? 'Sounds good' : 'A bit quiet') : 'Muted' }}</MiText>
            </div>
            <MiSlider v-model="volume" :min="0" :max="100" aria-label="Input volume" unit="%" />
          </div>

          <div class="dc__field">
            <label for="dc-out" class="dc__label">Speakers</label>
            <div class="dc__row">
              <MiSelect id="dc-out" v-model="speaker" :options="speakers" size="sm" class="dc__grow" />
              <MiButton variant="tinted" size="small" :disabled="testing" @click="testSound">
                <template #leading><MiIcon :svg="icons.speaker" :size="16" class="dc__spk" :class="{ 'is-playing': testing }" /></template>
                {{ testing ? 'Playing…' : 'Test' }}
              </MiButton>
            </div>
          </div>

          <MiList :grouped="false" label="Audio and video effects" class="dc__toggles">
            <MiListItem title="Noise suppression" subtitle="Filters keyboards and fans">
              <template #trailing><MiSwitch v-model="noise" size="compact" label="Noise suppression" /></template>
            </MiListItem>
            <MiListItem title="Blur background">
              <template #trailing><MiSwitch v-model="blur" size="compact" label="Blur background" /></template>
            </MiListItem>
            <MiListItem title="Mirror my video" subtitle="Only you see it mirrored">
              <template #trailing><MiSwitch v-model="mirror" size="compact" label="Mirror my video" /></template>
            </MiListItem>
          </MiList>
        </div>
      </div>

      <footer class="dc__foot">
        <MiText variant="caption" tone="label3">Settings are remembered on this device.</MiText>
        <MiButton>Join call</MiButton>
      </footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const icons = {
  cam: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2"/>',
  camOff: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="M15.5 10.2 21 7v10l-5.5-3.2M3 3l18 18"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
  micOff: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16"/>',
  speaker: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>'
}

const cameras = [
  { value: 'facetime', label: 'FaceTime HD Camera' },
  { value: 'brio', label: 'Logitech Brio 4K' },
  { value: 'iphone', label: 'iPhone 15 (Continuity)' }
]
// Sensitivity stands in for a real input level; swap for an AnalyserNode reading.
const mics = [
  { value: 'built-in', label: 'MacBook Pro Microphone', description: 'Built-in', sensitivity: 0.6 },
  { value: 'mv7', label: 'Shure MV7', description: 'USB', sensitivity: 0.95 },
  { value: 'airpods', label: 'AirPods Pro', description: 'Bluetooth', sensitivity: 0.45 }
]
const speakers = [
  { value: 'built-in', label: 'MacBook Pro Speakers' },
  { value: 'airpods', label: 'AirPods Pro' },
  { value: 'studio', label: 'Studio Display' }
]

const camera = ref<string | number | null>('brio')
const mic = ref<string | number | null>('mv7')
const speaker = ref<string | number | null>('built-in')
const volume = ref<number | [number, number]>(72)
const camOn = ref(true)
const micOn = ref(true)
const noise = ref(true)
const blur = ref(false)
const mirror = ref(true)
const testing = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

const cameraName = computed(() => cameras.find(c => c.value === camera.value)?.label ?? '')
const level = computed(() => {
  const sens = mics.find(m => m.value === mic.value)?.sensitivity ?? 0.5
  const vol = typeof volume.value === 'number' ? volume.value : volume.value[1]
  return Math.max(0.08, Math.min(1, sens * (vol / 70)))
})

function testSound() {
  testing.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { testing.value = false }, 2400)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<style scoped>
.dc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.dc__card { display: grid; gap: 20px; max-width: 880px; margin-inline: auto; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh2); }
@container (min-width: 600px) { .dc__card { padding: 24px; } }
.dc__head { display: grid; gap: 2px; }
.dc__grid { display: grid; gap: 20px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 720px) { .dc__grid { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 28px; } }

.dc__preview-col { display: grid; gap: 12px; align-content: start; }
.dc__preview { position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3; border-radius: var(--mi-radius-xl); overflow: hidden; isolation: isolate; background: linear-gradient(180deg, color-mix(in srgb, var(--mi-orange) 22%, var(--mi-page)), color-mix(in srgb, var(--mi-p) 22%, var(--mi-page))); }
.dc__room, .dc__face { transition: transform var(--mi-dur-3) var(--mi-ease); }
.dc__preview.is-mirror .dc__room { transform: scaleX(-1); }
.dc__room { position: absolute; inset: 0; z-index: -2; }
.dc__shelf { position: absolute; left: 8%; top: 18%; width: 30%; height: 6%; border-radius: 3px; background: color-mix(in srgb, var(--mi-orange) 45%, var(--mi-label)); box-shadow: 0 -22px 0 -4px color-mix(in srgb, var(--mi-teal) 55%, transparent), 22px -18px 0 -6px color-mix(in srgb, var(--mi-pink) 55%, transparent); }
.dc__plant { position: absolute; right: 10%; bottom: 0; width: 16%; height: 46%; border-radius: 50% 50% 8px 8px; background: color-mix(in srgb, var(--mi-green) 60%, var(--mi-label)); }
.dc__lamp { position: absolute; right: 30%; top: 8%; width: 14%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--mi-yellow) 80%, transparent), transparent); }
.dc__blur { position: absolute; inset: 0; z-index: -1; background: color-mix(in srgb, var(--mi-page) 30%, transparent); backdrop-filter: blur(14px); opacity: 0; transition: opacity var(--mi-dur-3) var(--mi-ease); }
.dc__blur.is-on { opacity: 1; }
.dc__face { display: grid; place-items: center; width: 34%; aspect-ratio: 1; border-radius: 50%; background: linear-gradient(140deg, var(--mi-p), var(--mi-s)); color: var(--mi-p-on); font-size: clamp(24px, 6cqi, 40px); font-weight: 700; box-shadow: 0 18px 40px -16px color-mix(in srgb, var(--mi-p) 70%, transparent); }
.dc__preview.is-off { background: var(--mi-label); }
.dc__preview.is-off .dc__room, .dc__preview.is-off .dc__blur { opacity: 0; }
.dc__cam-label { position: absolute; left: 10px; bottom: 10px; max-width: calc(100% - 20px); padding: 3px 10px; border-radius: 999px; background: color-mix(in srgb, var(--mi-label) 55%, transparent); color: var(--mi-page); font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dc__quick { display: flex; flex-wrap: wrap; gap: 8px; }

.dc__form { display: grid; gap: 18px; align-content: start; min-width: 0; }
.dc__field { display: grid; gap: 8px; min-width: 0; }
.dc__label { font-size: 13px; font-weight: 600; color: var(--mi-label2); }
.dc__row { display: flex; gap: 8px; align-items: center; }
.dc__grow { flex: 1; min-width: 0; }

.dc__level { display: flex; align-items: center; gap: 12px; height: 32px; }
.dc__bars { flex: 1; display: flex; align-items: center; gap: 3px; height: 28px; transform-origin: center; transition: transform var(--mi-dur-3) var(--mi-ease); }
.dc__bars span { flex: 1; height: 100%; border-radius: 2px; background: linear-gradient(var(--mi-green), color-mix(in srgb, var(--mi-green) 50%, var(--mi-p))); transform-origin: center; animation: dc-lvl 700ms ease-in-out infinite alternate; }
.dc__bars.is-still span { animation-play-state: paused; background: var(--mi-fill); }
@keyframes dc-lvl { from { transform: scaleY(.18); } to { transform: scaleY(1); } }
.dc__level-text { flex: none; min-width: 92px; text-align: end; }

.dc__spk.is-playing { animation: dc-pulse .5s var(--mi-ease) infinite alternate; }
@keyframes dc-pulse { from { transform: scale(1); opacity: .6; } to { transform: scale(1.15); opacity: 1; } }

.dc__toggles { margin-inline: -4px; }
.dc__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.dc__foot > :last-child { margin-inline-start: auto; }
@media (prefers-reduced-motion: reduce) { .dc__bars span, .dc__spk.is-playing { animation: none; } }
</style>
