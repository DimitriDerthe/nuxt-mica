<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="inc-title">
    <header class="mi:grid mi:gap-3.5">
      <div class="mi:grid mi:gap-1.5">
        <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-1.5">
          <MiBadge tone="danger" variant="solid" label="SEV-2" />
          <MiBadge tone="success" label="Resolved" dot />
          <MiText as="span" variant="caption" tone="label2">INC-2291</MiText>
        </div>
        <MiText id="inc-title" variant="title3" as="h2" weight="semibold">Checkout returned 502s after api 2.14.1</MiText>
      </div>
      <dl class="mi:grid mi:grid-cols-2 mi:gap-px mi:m-0 mi:rounded-lg mi:overflow-hidden mi:bg-sep mi:shadow-1 mi:@[600px]:grid-cols-4">
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:bg-card"><dt class="mi:text-[11px] mi:text-label2">Duration</dt><dd class="mi:m-0 mi:text-[20px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">1 h 12 min</dd></div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:bg-card"><dt class="mi:text-[11px] mi:text-label2">To detect</dt><dd class="mi:m-0 mi:text-[20px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">4 min</dd></div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:bg-card"><dt class="mi:text-[11px] mi:text-label2">To mitigate</dt><dd class="mi:m-0 mi:text-[20px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">53 min</dd></div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:bg-card"><dt class="mi:text-[11px] mi:text-label2">Checkouts hit</dt><dd class="mi:m-0 mi:text-[20px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">8.4%</dd></div>
      </dl>
    </header>

    <!-- Phase ribbon: segment widths are real durations, so the slow part of the response is obvious. -->
    <div class="mi:grid mi:gap-2 mi:p-3.5 mi:rounded-lg mi:bg-card mi:shadow-1">
      <div class="mi:flex mi:gap-[3px] mi:h-7" role="group" aria-label="Filter the timeline by phase">
        <button
          v-for="p in phases" :key="p.id" type="button" class="mi:basis-0 mi:min-w-2.5 mi:p-0 mi:[border:0] mi:rounded-[6px] mi:cursor-pointer mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease),_transform_var(--mi-dur-2)_var(--mi-spring)] mi:hover:transform-[scaleY(1.12)] mi:focus-visible:[outline:2px_solid_var(--mi-label)] mi:focus-visible:outline-offset-[2px]" :class="[SEG_BG[p.id], phase && phase !== p.id ? 'mi:opacity-30' : '']"
          :style="{ flexGrow: p.minutes }" :aria-pressed="phase === p.id" :aria-label="`${p.label}, ${p.minutes} minutes`"
          @click="phase = phase === p.id ? null : p.id"
        />
      </div>
      <div class="mi:flex mi:justify-between mi:text-[10px] mi:text-label3 mi:tabular-nums" aria-hidden="true"><span>14:02</span><span>15:14</span></div>
      <ul class="mi:grid mi:grid-cols-2 mi:gap-y-1.5 mi:gap-x-3 mi:m-0 mi:pt-1 mi:px-0 mi:pb-0 mi:[list-style:none] mi:@[600px]:grid-cols-[repeat(4,_max-content)] mi:@[600px]:gap-y-1.5 mi:@[600px]:gap-x-6">
        <li class="mi:flex mi:items-center mi:gap-1.5 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)]" v-for="p in phases" :key="p.id" :class="phase && phase !== p.id ? 'mi:opacity-30' : ''">
          <span class="mi:w-2.5 mi:h-2.5 mi:rounded-[3px]" :class="SEG_BG[p.id]" aria-hidden="true" />
          <MiText as="span" variant="caption" weight="semibold">{{ p.label }}</MiText>
          <MiText as="span" variant="caption" tone="label2" tabular>{{ p.minutes }} min</MiText>
        </li>
      </ul>
    </div>

    <MiTimeline :aria-label="phase ? phaseLabel + ' events' : 'Incident timeline'" class="mi:max-w-180">
      <MiTimelineItem
        v-for="e in shown" :key="e.time + e.title" :title="e.title" :description="e.text" :time="e.time"
        :icon="e.icon" :tone="e.tone" :status="e.status ?? 'done'"
      >
        <div v-if="e.spark" class="mi:[&_svg]:max-w-full! mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-3 mi:mt-1.5 mi:py-2 mi:px-3 mi:rounded-[10px] mi:[background:color-mix(in_srgb,_var(--mi-red)_7%,_transparent)]">
          <MiSparkline :values="errorRate" :width="220" :height="36" stroke="var(--mi-red)" color="var(--mi-red)" label="Checkout error rate, 13:50 to 14:10" />
          <MiText as="span" variant="caption" tone="label2" tabular>5xx rate peaked at 11.8%</MiText>
        </div>
        <blockquote v-if="e.quote" class="mi:flex mi:[align-items:flex-start] mi:gap-2 mi:mt-1.5 mi:mx-0 mi:mb-0 mi:py-2 mi:px-3 mi:rounded-[10px] mi:text-[13px] mi:leading-[1.45] mi:text-label2 mi:bg-fill">
          <MiAvatar :name="e.quote.who" size="xs" tone="auto" decorative />
          <span><strong class="mi:font-semibold mi:text-label">{{ e.quote.who }}</strong> {{ e.quote.text }}</span>
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
const SEG_BG: Record<string, string> = { detect: 'mi:bg-red', triage: 'mi:bg-orange', mitigate: 'mi:bg-p', monitor: 'mi:bg-green' }

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
