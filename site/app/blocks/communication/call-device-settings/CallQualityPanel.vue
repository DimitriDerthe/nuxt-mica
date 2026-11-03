<template>
  <section class="cqp" aria-labelledby="cqp-title">
    <header class="cqp__head">
      <div>
        <MiText id="cqp-title" as="h2" variant="title3" weight="bold">Call quality</MiText>
        <MiText variant="footnote" tone="label2">Weekly design review · 7 people · 32 min in</MiText>
      </div>
      <MiBadge :tone="health.tone" :label="health.label" dot />
    </header>

    <div class="cqp__grid">
      <!-- Connection: three readings, each against the level where calls start to suffer. -->
      <div class="cqp__card">
        <MiText as="h3" variant="headline">Your connection</MiText>
        <ul class="cqp__stats">
          <li v-for="s in stats" :key="s.label" class="cqp__stat">
            <div class="cqp__stat-top">
              <MiText variant="footnote" weight="medium">{{ s.label }}</MiText>
              <MiText variant="footnote" :tone="s.value > s.warn ? 'orange' : 'label2'" tabular>{{ s.value }} {{ s.unit }}</MiText>
            </div>
            <div class="cqp__bar" role="meter" :aria-label="s.label" :aria-valuenow="s.value" aria-valuemin="0" :aria-valuemax="s.max" :aria-valuetext="s.value + ' ' + s.unit">
              <span :class="{ 'is-warn': s.value > s.warn }" :style="{ transform: `scaleX(${Math.min(1, s.value / s.max)})` }" />
              <i :style="{ left: (s.warn / s.max * 100) + '%' }" aria-hidden="true" />
            </div>
          </li>
        </ul>
        <MiSlider v-model="upload" :min="0.3" :max="4" :step="0.1" label="Upload bandwidth (measured)" :format="v => v.toFixed(1) + ' Mbps'" />
      </div>

      <div class="cqp__card">
        <MiText as="h3" variant="headline">What you send and receive</MiText>
        <div class="cqp__field">
          <MiText variant="footnote" weight="medium">Your video</MiText>
          <MiSegmented v-model="sendQuality" label="Your video quality" :options="sendOptions" />
        </div>
        <div class="cqp__field">
          <MiText variant="footnote" weight="medium">Incoming video</MiText>
          <MiRadioGroup v-model="incoming" label="Incoming video" :options="incomingOptions" :disabled="lowBandwidth" />
        </div>
        <div class="cqp__switch">
          <div>
            <MiText id="cqp-low" variant="subheadline" weight="medium">Low-bandwidth mode</MiText>
            <MiText variant="caption" tone="label2">Sends 360p and shows only the active speaker.</MiText>
          </div>
          <MiSwitch v-model="lowBandwidth" aria-labelledby="cqp-low" />
        </div>
        <footer class="cqp__usage" aria-live="polite">
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

<style scoped>
.cqp { container-type: inline-size; display: flex; flex-direction: column; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.cqp__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 10px; }
.cqp__grid { display: grid; gap: 12px; }
@container (min-width: 760px) { .cqp__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); } }
.cqp__card { display: grid; align-content: start; gap: 16px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }

.cqp__stats { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
.cqp__stat { display: grid; gap: 6px; }
.cqp__stat-top { display: flex; justify-content: space-between; gap: 8px; }
.cqp__bar { position: relative; height: 6px; border-radius: 3px; background: var(--mi-fill3); }
.cqp__bar span { position: absolute; inset: 0; border-radius: inherit; background: var(--mi-green); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.cqp__bar span.is-warn { background: var(--mi-orange); }
/* Tick marking the threshold where quality starts to drop. */
.cqp__bar i { position: absolute; top: -3px; width: 2px; height: 12px; margin-left: -1px; border-radius: 1px; background: var(--mi-label3); }

.cqp__field { display: grid; justify-items: start; gap: 8px; }
.cqp__switch { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }
.cqp__usage { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-p-tint); color: var(--mi-p-text); }
.cqp__usage :deep(strong) { color: var(--mi-label); }
</style>
