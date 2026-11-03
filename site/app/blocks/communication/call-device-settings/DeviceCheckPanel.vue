<template>
  <section class="dc mi:@container mi:font-mi mi:text-label" aria-labelledby="dc-title">
    <div class="dc__card mi:grid mi:gap-5 mi:max-w-220 mi:mx-auto mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-2 mi:@[600px]:p-6">
      <header class="dc__head mi:grid mi:gap-0.5">
        <MiText id="dc-title" as="h2" variant="title3" weight="bold">Check your setup</MiText>
        <MiText variant="footnote" tone="label2">Sprint 42 review starts in 2 minutes · 5 people waiting</MiText>
      </header>

      <div class="dc__grid mi:grid mi:gap-5 mi:grid-cols-[minmax(0,_1fr)] mi:@[720px]:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] mi:@[720px]:gap-7">
        <!-- Preview: a drawn camera tile; mirror flips it, blur crossfades a soft layer over the room. -->
        <div class="dc__preview-col mi:grid mi:gap-3 mi:content-start">
          <div class="dc__preview mi:relative mi:grid mi:place-items-center mi:aspect-[4_/_3] mi:rounded-xl mi:overflow-hidden mi:isolate mi:[background:linear-gradient(180deg,_color-mix(in_srgb,_var(--mi-orange)_22%,_var(--mi-page)),_color-mix(in_srgb,_var(--mi-p)_22%,_var(--mi-page)))] mi:[&.is-off]:[background:var(--mi-label)]" :class="{ 'is-mirror': mirror, 'is-off': !camOn }" role="img" :aria-label="camOn ? 'Camera preview' : 'Camera is off'">
            <div class="dc__room mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:[.dc__preview.is-mirror_&]:transform-[scaleX(-1)] mi:absolute mi:inset-0 mi:-z-2 mi:[.dc__preview.is-off_&]:opacity-0" aria-hidden="true"><span class="dc__shelf mi:absolute mi:left-[8%] mi:top-[18%] mi:w-[30%] mi:h-[6%] mi:rounded-[3px] mi:[background:color-mix(in_srgb,_var(--mi-orange)_45%,_var(--mi-label))] mi:shadow-[0_-22px_0_-4px_color-mix(in_srgb,_var(--mi-teal)_55%,_transparent),_22px_-18px_0_-6px_color-mix(in_srgb,_var(--mi-pink)_55%,_transparent)]" /><span class="dc__plant mi:absolute mi:right-[10%] mi:bottom-0 mi:w-[16%] mi:h-[46%] mi:rounded-[50%_50%_8px_8px] mi:[background:color-mix(in_srgb,_var(--mi-green)_60%,_var(--mi-label))]" /><span class="dc__lamp mi:absolute mi:right-[30%] mi:top-[8%] mi:w-[14%] mi:aspect-[1] mi:rounded-[50%] mi:[background:radial-gradient(closest-side,_color-mix(in_srgb,_var(--mi-yellow)_80%,_transparent),_transparent)]" /></div>
            <div class="dc__blur mi:absolute mi:inset-0 mi:-z-1 mi:[background:color-mix(in_srgb,_var(--mi-page)_30%,_transparent)] mi:[backdrop-filter:blur(14px)] mi:opacity-0 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)] mi:[&.is-on]:opacity-100 mi:[.dc__preview.is-off_&]:opacity-0" :class="{ 'is-on': blur }" aria-hidden="true" />
            <span class="dc__face mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)] mi:grid mi:place-items-center mi:w-[34%] mi:aspect-[1] mi:rounded-[50%] mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))] mi:text-p-on mi:text-[clamp(24px,_6cqi,_40px)] mi:font-bold mi:shadow-[0_18px_40px_-16px_color-mix(in_srgb,_var(--mi-p)_70%,_transparent)]" aria-hidden="true">LF</span>
            <span class="dc__cam-label mi:absolute mi:left-2.5 mi:bottom-2.5 mi:max-w-[calc(100%_-_20px)] mi:py-[3px] mi:px-2.5 mi:rounded-[999px] mi:[background:color-mix(in_srgb,_var(--mi-label)_55%,_transparent)] mi:text-page mi:text-[12px] mi:font-semibold mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ cameraName }}</span>
          </div>
          <div class="dc__quick mi:flex mi:flex-wrap mi:gap-2">
            <MiButton :variant="camOn ? 'gray' : 'filled'" size="small" :pressed="!camOn" @click="camOn = !camOn">
              <template #leading><MiIcon :svg="camOn ? icons.cam : icons.camOff" :size="16" /></template>{{ camOn ? 'Camera on' : 'Camera off' }}
            </MiButton>
            <MiButton :variant="micOn ? 'gray' : 'filled'" size="small" :pressed="!micOn" @click="micOn = !micOn">
              <template #leading><MiIcon :svg="micOn ? icons.mic : icons.micOff" :size="16" /></template>{{ micOn ? 'Mic on' : 'Muted' }}
            </MiButton>
          </div>
        </div>

        <div class="dc__form mi:grid mi:gap-4.5 mi:content-start mi:min-w-0">
          <div class="dc__field mi:grid mi:gap-2 mi:min-w-0">
            <label for="dc-cam" class="dc__label mi:text-[13px] mi:font-semibold mi:text-label2">Camera</label>
            <MiSelect id="dc-cam" v-model="camera" :options="cameras" size="sm" />
          </div>

          <div class="dc__field mi:grid mi:gap-2 mi:min-w-0">
            <label for="dc-mic" class="dc__label mi:text-[13px] mi:font-semibold mi:text-label2">Microphone</label>
            <MiSelect id="dc-mic" v-model="mic" :options="mics" size="sm" />
            <!-- Level ladder: bars bounce with CSS, the group is scaled by input volume and device sensitivity. -->
            <div class="dc__level mi:flex mi:items-center mi:gap-3 mi:h-8" role="meter" aria-label="Microphone level" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="micOn ? Math.round(level * 100) : 0">
              <div class="dc__bars mi:flex-1 mi:flex mi:items-center mi:gap-[3px] mi:h-7 mi:origin-center mi:[transition:transform_var(--mi-dur-3)_var(--mi-ease)]" :class="{ 'is-still': !micOn }" :style="{ transform: `scaleY(${micOn ? level : 0.06})` }">
                <span class="mi:[.dc__bars_&]:h-full mi:[.dc__bars_&]:rounded-[2px] mi:[.dc__bars_&]:[background:linear-gradient(var(--mi-green),_color-mix(in_srgb,_var(--mi-green)_50%,_var(--mi-p)))] mi:[.dc__bars_&]:origin-center mi:[.dc__bars.is-still_&]:[background:var(--mi-fill)]" v-for="i in 18" :key="i" :style="{ animationDelay: (i * 97 % 600) + 'ms', animationDuration: (520 + (i * 131 % 380)) + 'ms' }" />
              </div>
              <MiText variant="caption" tone="label2" class="dc__level-text mi:flex-[none] mi:min-w-23 mi:text-end">{{ micOn ? (level > 0.75 ? 'Loud and clear' : level > 0.4 ? 'Sounds good' : 'A bit quiet') : 'Muted' }}</MiText>
            </div>
            <MiSlider v-model="volume" :min="0" :max="100" aria-label="Input volume" unit="%" />
          </div>

          <div class="dc__field mi:grid mi:gap-2 mi:min-w-0">
            <label for="dc-out" class="dc__label mi:text-[13px] mi:font-semibold mi:text-label2">Speakers</label>
            <div class="dc__row mi:flex mi:gap-2 mi:items-center">
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

      <footer class="dc__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3 mi:pt-4 mi:border-t mi:border-t-sep">
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
.dc__grow { flex: 1; min-width: 0; }
.dc__bars span { flex: 1; animation: dc-lvl 700ms ease-in-out infinite alternate; }
.dc__bars.is-still span { animation-play-state: paused; }
@keyframes dc-lvl { from { transform: scaleY(.18); } to { transform: scaleY(1); } }

.dc__spk.is-playing { animation: dc-pulse .5s var(--mi-ease) infinite alternate; }
@keyframes dc-pulse { from { transform: scale(1); opacity: .6; } to { transform: scale(1.15); opacity: 1; } }

.dc__toggles { margin-inline: -4px; }
.dc__foot > :last-child { margin-inline-start: auto; }
@media (prefers-reduced-motion: reduce) { .dc__bars span, .dc__spk.is-playing { animation: none; } }
</style>
