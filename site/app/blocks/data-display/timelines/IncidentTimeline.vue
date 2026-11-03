<template>
  <section class="inc" aria-labelledby="inc-title">
    <header class="inc__head">
      <div class="inc__title">
        <div class="inc__tags">
          <MiBadge tone="danger" variant="solid" label="SEV-2" />
          <MiBadge tone="success" label="Resolved" dot />
          <MiText as="span" variant="caption" tone="label2">INC-2291</MiText>
        </div>
        <MiText id="inc-title" variant="title3" as="h2" weight="semibold">Checkout returned 502s after api 2.14.1</MiText>
      </div>
      <dl class="inc__stats">
        <div><dt>Duration</dt><dd>1 h 12 min</dd></div>
        <div><dt>To detect</dt><dd>4 min</dd></div>
        <div><dt>To mitigate</dt><dd>53 min</dd></div>
        <div><dt>Checkouts hit</dt><dd>8.4%</dd></div>
      </dl>
    </header>

    <!-- Phase ribbon: segment widths are real durations, so the slow part of the response is obvious. -->
    <div class="inc__ribbon-card">
      <div class="inc__ribbon" role="group" aria-label="Filter the timeline by phase">
        <button
          v-for="p in phases" :key="p.id" type="button" class="inc__seg" :class="['inc__seg--' + p.id, { 'is-on': phase === p.id, 'is-dim': phase && phase !== p.id }]"
          :style="{ flexGrow: p.minutes }" :aria-pressed="phase === p.id" :aria-label="`${p.label}, ${p.minutes} minutes`"
          @click="phase = phase === p.id ? null : p.id"
        />
      </div>
      <div class="inc__axis" aria-hidden="true"><span>14:02</span><span>15:14</span></div>
      <ul class="inc__legend">
        <li v-for="p in phases" :key="p.id" :class="{ 'is-dim': phase && phase !== p.id }">
          <span class="inc__swatch" :class="'inc__seg--' + p.id" aria-hidden="true" />
          <MiText as="span" variant="caption" weight="semibold">{{ p.label }}</MiText>
          <MiText as="span" variant="caption" tone="label2" tabular>{{ p.minutes }} min</MiText>
        </li>
      </ul>
    </div>

    <MiTimeline :aria-label="phase ? phaseLabel + ' events' : 'Incident timeline'" class="inc__timeline">
      <MiTimelineItem
        v-for="e in shown" :key="e.time + e.title" :title="e.title" :description="e.text" :time="e.time"
        :icon="e.icon" :tone="e.tone" :status="e.status ?? 'done'"
      >
        <div v-if="e.spark" class="inc__spark">
          <MiSparkline :values="errorRate" :width="220" :height="36" stroke="var(--mi-red)" color="var(--mi-red)" label="Checkout error rate, 13:50 to 14:10" />
          <MiText as="span" variant="caption" tone="label2" tabular>5xx rate peaked at 11.8%</MiText>
        </div>
        <blockquote v-if="e.quote" class="inc__quote">
          <MiAvatar :name="e.quote.who" size="xs" tone="auto" decorative />
          <span><strong>{{ e.quote.who }}</strong> {{ e.quote.text }}</span>
        </blockquote>
      </MiTimelineItem>
    </MiTimeline>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Phase = 'detect' | 'triage' | 'mitigate' | 'monitor'
type Icon = 'warning' | 'bell' | 'search' | 'chat' | 'arrow-left' | 'exclamation-circle' | 'check-circle' | 'check' | 'calendar'

const phases: { id: Phase, label: string, minutes: number }[] = [
  { id: 'detect', label: 'Detect', minutes: 4 },
  { id: 'triage', label: 'Triage', minutes: 13 },
  { id: 'mitigate', label: 'Mitigate', minutes: 36 },
  { id: 'monitor', label: 'Monitor', minutes: 19 }
]

const events: { phase: Phase, time: string, title: string, text: string, icon: Icon, tone: 'danger' | 'warning' | 'primary' | 'success' | 'neutral' | 'info', status?: 'current' | 'upcoming', spark?: boolean, quote?: { who: string, text: string } }[] = [
  { phase: 'detect', time: '14:02', title: 'Checkout SLO alert fired', text: 'Errors on POST /checkout crossed 5% for two minutes.', icon: 'warning', tone: 'danger', spark: true },
  { phase: 'detect', time: '14:06', title: 'Kofi Mensah acknowledged the page', text: 'Incident channel #inc-2291 opened, Inès joins as commander.', icon: 'bell', tone: 'neutral' },
  { phase: 'triage', time: '14:09', title: 'Spike traced to the 13:58 deploy', text: 'api 2.14.1 changed the connection pool size from 40 to 4.', icon: 'search', tone: 'info' },
  { phase: 'triage', time: '14:17', title: 'Decision: roll back, no hotfix', text: 'The config diff was one line, but a rollback was already tested.', icon: 'chat', tone: 'primary', quote: { who: 'Inès Moreau', text: 'Roll back first, we can argue about the pool later.' } },
  { phase: 'mitigate', time: '14:19', title: 'Rollback to 2.14.0 started', text: 'Three regions, canary first.', icon: 'arrow-left', tone: 'primary' },
  { phase: 'mitigate', time: '14:41', title: 'eu-west-3 stuck on the old pods', text: 'Drained by hand after the health check timed out.', icon: 'exclamation-circle', tone: 'warning' },
  { phase: 'mitigate', time: '14:55', title: 'Error rate back under 0.5%', text: 'Retries cleared the queued orders; no payment was lost.', icon: 'check-circle', tone: 'success' },
  { phase: 'monitor', time: '15:14', title: 'Incident resolved', text: 'Pool size now has a lower bound check in CI.', icon: 'check', tone: 'success', status: 'current' },
  { phase: 'monitor', time: 'Wed 10:00', title: 'Postmortem review', text: 'Owner: Kofi Mensah. Draft due Tuesday.', icon: 'calendar', tone: 'neutral', status: 'upcoming' }
]

const errorRate = [0.3, 0.4, 0.3, 0.5, 0.4, 1.2, 3.8, 6.1, 9.4, 11.8, 11.2, 10.6]

const phase = ref<Phase | null>(null)
const phaseLabel = computed(() => phases.find(p => p.id === phase.value)?.label ?? '')
const shown = computed(() => events.filter(e => !phase.value || e.phase === phase.value))
</script>

<style scoped>
.inc { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.inc__head { display: grid; gap: 14px; }
.inc__title { display: grid; gap: 6px; }
.inc__tags { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.inc__stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 0; border-radius: var(--mi-radius-l); overflow: hidden; background: var(--mi-sep); box-shadow: var(--mi-sh1); }
@container (min-width: 600px) { .inc__stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.inc__stats div { display: grid; gap: 2px; padding: 12px 14px; background: var(--mi-card); }
.inc__stats dt { font-size: 11px; color: var(--mi-label2); }
.inc__stats dd { margin: 0; font-size: 20px; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }

.inc__ribbon-card { display: grid; gap: 8px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.inc__ribbon { display: flex; gap: 3px; height: 28px; }
.inc__seg { flex-basis: 0; min-width: 10px; padding: 0; border: 0; border-radius: 6px; cursor: pointer; transition: opacity var(--mi-dur-2) var(--mi-ease), transform var(--mi-dur-2) var(--mi-spring); }
.inc__seg:hover { transform: scaleY(1.12); }
.inc__seg:focus-visible { outline: 2px solid var(--mi-label); outline-offset: 2px; }
.inc__seg--detect { background: var(--mi-red); }
.inc__seg--triage { background: var(--mi-orange); }
.inc__seg--mitigate { background: var(--mi-p); }
.inc__seg--monitor { background: var(--mi-green); }
.is-dim { opacity: .3; }
.inc__axis { display: flex; justify-content: space-between; font-size: 10px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.inc__legend { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px 12px; margin: 0; padding: 4px 0 0; list-style: none; }
@container (min-width: 600px) { .inc__legend { grid-template-columns: repeat(4, max-content); gap: 6px 24px; } }
.inc__legend li { display: flex; align-items: center; gap: 6px; transition: opacity var(--mi-dur-2) var(--mi-ease); }
.inc__swatch { width: 10px; height: 10px; border-radius: 3px; }

.inc__timeline { max-width: 720px; }
.inc__spark { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin-top: 6px; padding: 8px 12px; border-radius: 10px; background: color-mix(in srgb, var(--mi-red) 7%, transparent); }
.inc__spark :deep(svg) { max-width: 100%; }
.inc__quote { display: flex; align-items: flex-start; gap: 8px; margin: 6px 0 0; padding: 8px 12px; border-radius: 10px; font-size: 13px; line-height: 1.45; color: var(--mi-label2); background: var(--mi-fill); }
.inc__quote strong { font-weight: 600; color: var(--mi-label); }
</style>
