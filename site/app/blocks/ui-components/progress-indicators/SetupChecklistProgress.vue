<template>
  <div class="scp">
    <section class="scp__card" aria-labelledby="scp-title">
      <header class="scp__head">
        <MiProgressRing :value="doneCount" :max="tasks.length" :size="72" label="Setup tasks completed">
          <span class="scp__ring-text"><strong>{{ doneCount }}</strong>/{{ tasks.length }}</span>
        </MiProgressRing>
        <div class="scp__intro">
          <MiText id="scp-title" variant="title3" as="h2" weight="semibold">Set up your workspace</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">{{ remainingText }}</MiText>
        </div>
      </header>

      <!-- One bar per track, weighted by minutes rather than task count. -->
      <ul class="scp__tracks" aria-label="Progress by track">
        <li v-for="t in trackStats" :key="t.id" class="scp__track">
          <div class="scp__track-top">
            <MiText as="span" variant="caption" weight="semibold">{{ t.label }}</MiText>
            <MiText as="span" variant="caption" tone="label2" tabular>{{ t.done }} / {{ t.total }} min</MiText>
          </div>
          <div class="scp__bar" role="meter" :aria-label="`${t.label} progress`" :aria-valuenow="t.done" aria-valuemin="0" :aria-valuemax="t.total">
            <span :class="'scp__fill--' + t.id" :style="{ transform: `scaleX(${t.total ? t.done / t.total : 0})` }" />
          </div>
        </li>
      </ul>

      <div class="scp__groups">
        <section v-for="t in trackStats" :key="t.id" class="scp__group" :aria-labelledby="`scp-g-${t.id}`">
          <MiText :id="`scp-g-${t.id}`" variant="footnote" tone="label2" weight="semibold" as="h3">{{ t.label }}</MiText>
          <ul class="scp__tasks">
            <li v-for="task in t.items" :key="task.id">
              <MiCheckbox v-model="task.done" :label="task.label" :description="`${task.minutes} min · ${task.hint}`" />
            </li>
          </ul>
        </section>
      </div>

      <MiAlert v-if="doneCount === tasks.length" tone="success" title="Workspace ready" message="Everything is set. Your team can start working in Northwind Studio." />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type TrackId = 'basics' | 'team' | 'billing'
interface Task { id: string, track: TrackId, label: string, hint: string, minutes: number, done: boolean }

const tracks: { id: TrackId, label: string }[] = [
  { id: 'basics', label: 'Basics' }, { id: 'team', label: 'Team' }, { id: 'billing', label: 'Billing' }
]

const tasks = ref<Task[]>([
  { id: 't1', track: 'basics', label: 'Name your workspace', hint: 'shown in invites', minutes: 1, done: true },
  { id: 't2', track: 'basics', label: 'Upload a logo', hint: 'SVG or PNG', minutes: 2, done: true },
  { id: 't3', track: 'basics', label: 'Connect your domain', hint: 'one DNS record', minutes: 6, done: false },
  { id: 't4', track: 'team', label: 'Invite three teammates', hint: 'free until they join', minutes: 3, done: true },
  { id: 't5', track: 'team', label: 'Create your first project', hint: 'templates included', minutes: 4, done: false },
  { id: 't6', track: 'team', label: 'Turn on single sign-on', hint: 'Okta, Google or Entra', minutes: 8, done: false },
  { id: 't7', track: 'billing', label: 'Add a payment method', hint: 'charged after the trial', minutes: 2, done: false },
  { id: 't8', track: 'billing', label: 'Set a billing contact', hint: 'receives invoices', minutes: 1, done: false }
])

const doneCount = computed(() => tasks.value.filter(t => t.done).length)
const trackStats = computed(() => tracks.map(tr => {
  const own = tasks.value.filter(t => t.track === tr.id)
  return { ...tr, items: own, total: own.reduce((s, t) => s + t.minutes, 0), done: own.filter(t => t.done).reduce((s, t) => s + t.minutes, 0) }
}))
const remainingText = computed(() => {
  const left = tasks.value.filter(t => !t.done).reduce((s, t) => s + t.minutes, 0)
  return left ? `About ${left} minutes left · progress saves automatically` : 'All done. Nice work.'
})
</script>

<style scoped>
.scp { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.scp__card { display: grid; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.scp__head { display: flex; align-items: center; gap: 16px; }
.scp__intro { display: grid; gap: 2px; min-width: 0; }
.scp__ring-text { font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.scp__ring-text strong { font-size: 18px; color: var(--mi-label); }

.scp__tracks { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.scp__track { display: grid; gap: 6px; }
.scp__track-top { display: flex; justify-content: space-between; gap: 8px; }
.scp__bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.scp__bar span { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.scp__bar .scp__fill--team { background: var(--mi-s); }
.scp__bar .scp__fill--billing { background: color-mix(in srgb, var(--mi-p) 55%, var(--mi-s)); }

.scp__groups { display: grid; gap: 16px; }
.scp__group { display: grid; gap: 8px; }
.scp__tasks { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }

@container (min-width: 720px) {
  .scp__card { padding: 24px 28px; }
  .scp__tracks { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .scp__groups { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
}
</style>
