<template>
  <section class="mi:@container mi:flex mi:flex-col mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="cqp-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-2.5">
      <div>
        <MiText id="cqp-title" as="h2" variant="title3" weight="bold">Call quality</MiText>
        <MiText variant="footnote" tone="label2">Weekly design review · 7 people · 32 min in</MiText>
      </div>
      <MiBadge :tone="health.tone" :label="health.label" dot />
    </header>

    <div class="mi:grid mi:gap-3 mi:@[760px]:grid-cols-[minmax(0,_1fr)_minmax(0,_1.2fr)]">
      <!-- Connection: three readings, each against the level where calls start to suffer. -->
      <div class="mi:grid mi:content-start mi:gap-4 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <MiText as="h3" variant="headline">Your connection</MiText>
        <ul class="mi:grid mi:gap-3.5 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="s in stats" :key="s.label" class="mi:grid mi:gap-1.5">
            <div class="mi:flex mi:justify-between mi:gap-2">
              <MiText variant="footnote" weight="medium">{{ s.label }}</MiText>
              <MiText variant="footnote" :tone="s.value > s.warn ? 'orange' : 'label2'" tabular>{{ s.value }} {{ s.unit }}</MiText>
            </div>
            <div class="mi:relative mi:h-1.5 mi:rounded-[3px] mi:bg-fill3" role="meter" :aria-label="s.label" :aria-valuenow="s.value" aria-valuemin="0" :aria-valuemax="s.max" :aria-valuetext="s.value + ' ' + s.unit">
              <span class="mi:absolute mi:rounded-[inherit] mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="s.value > s.warn ? 'mi:bg-orange' : 'mi:bg-green'" :style="{ transform: `scaleX(${Math.min(1, s.value / s.max)})` }" />
              <i class="mi:absolute mi:rounded-[1px] mi:top-[-3px] mi:w-0.5 mi:h-3 mi:-ml-px mi:bg-label3" :style="{ left: (s.warn / s.max * 100) + '%' }" aria-hidden="true" />
            </div>
          </li>
        </ul>
        <MiSlider v-model="upload" :min="0.3" :max="4" :step="0.1" label="Upload bandwidth (measured)" :format="v => v.toFixed(1) + ' Mbps'" />
      </div>

      <div class="mi:grid mi:content-start mi:gap-4 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <MiText as="h3" variant="headline">What you send and receive</MiText>
        <div class="mi:grid mi:justify-items-start mi:gap-2">
          <MiText variant="footnote" weight="medium">Your video</MiText>
          <MiSegmented v-model="sendQuality" label="Your video quality" :options="sendOptions" />
        </div>
        <div class="mi:grid mi:justify-items-start mi:gap-2">
          <MiText variant="footnote" weight="medium">Incoming video</MiText>
          <MiRadioGroup v-model="incoming" label="Incoming video" :options="incomingOptions" :disabled="lowBandwidth" />
        </div>
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-3.5 mi:pt-3.5 mi:border-t mi:border-t-sep">
          <div>
            <MiText id="cqp-low" variant="subheadline" weight="medium">Low-bandwidth mode</MiText>
            <MiText variant="caption" tone="label2">Sends 360p and shows only the active speaker.</MiText>
          </div>
          <MiSwitch v-model="lowBandwidth" aria-labelledby="cqp-low" />
        </div>
        <footer class="mi:[&_strong]:text-label mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:bg-p-tint mi:text-p-text" aria-live="polite">
          <MiIcon name="wifi" :size="18" />
          <MiText variant="footnote">About <strong>{{ usage }} GB per hour</strong> at {{ effective.send }} sending, {{ incomingPhrase[effective.inc] }}.</MiText>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Resolution = '360p' | '720p' | '1080p'
type Incoming = 'grid' | 'speaker' | 'audio'
interface Stat { label: string, value: number, unit: string, warn: number, max: number }

// Megabits per second for each resolution; drives the options and the data estimate.
const bitrate: Record<Resolution, number> = { '360p': 0.6, '720p': 1.5, '1080p': 3 }
const resolutions: Resolution[] = ['1080p', '720p', '360p']
const incomingCost: Record<Incoming, number> = { grid: 2.4, speaker: 1.5, audio: 0.1 }
const incomingPhrase: Record<Incoming, string> = { grid: 'receiving everyone', speaker: 'receiving the active speaker', audio: 'receiving audio only' }
const incomingOptions: { value: Incoming, label: string, description: string }[] = [
  { value: 'grid', label: 'Everyone', description: 'Up to 6 tiles in a grid' },
  { value: 'speaker', label: 'Active speaker', description: 'One large tile, others paused' },
  { value: 'audio', label: 'Audio only', description: 'Lowest data, names on tiles' }
]
const stats: Stat[] = [
  { label: 'Round-trip latency', value: 84, unit: 'ms', warn: 150, max: 300 },
  { label: 'Packet loss', value: 1.8, unit: '%', warn: 2, max: 6 },
  { label: 'Jitter', value: 34, unit: 'ms', warn: 30, max: 60 }
]

const upload = ref<number | [number, number]>(1.8)
const sendQuality = ref<string | number | null>('auto')
const incoming = ref<string | number | boolean | null>('grid')
const lowBandwidth = ref(false)

const uploadMbps = computed(() => typeof upload.value === 'number' ? upload.value : upload.value[0])
// Hide resolutions the measured upload can't sustain, with 20% headroom.
const sendOptions = computed(() => [
  { value: 'auto', label: 'Auto' },
  ...[...resolutions].reverse().map(q => ({ value: q, label: q, disabled: bitrate[q] * 1.2 > uploadMbps.value }))
])
const effective = computed(() => {
  const auto = resolutions.find(q => bitrate[q] * 1.2 <= uploadMbps.value) ?? '360p'
  const picked = resolutions.find(q => q === sendQuality.value && bitrate[q] * 1.2 <= uploadMbps.value) ?? auto
  const inc = lowBandwidth.value ? 'speaker' : (incomingOptions.find(o => o.value === incoming.value)?.value ?? 'grid')
  return { send: lowBandwidth.value ? '360p' : picked, inc }
})
const usage = computed(() => ((bitrate[effective.value.send] + incomingCost[effective.value.inc]) * 3600 / 8 / 1000).toFixed(2))
const health = computed<{ tone: 'success' | 'warning', label: string }>(() => {
  const issues = stats.filter(s => s.value > s.warn).length + (uploadMbps.value < 1 ? 1 : 0)
  return issues > 1 ? { tone: 'warning', label: 'Unstable connection' } : { tone: 'success', label: 'Good connection' }
})
</script>
