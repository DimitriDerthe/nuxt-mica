<template>
  <div class="scp mi:@container mi:font-mi mi:text-label">
    <section class="scp__card mi:grid mi:gap-5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[720px]:py-6 mi:@[720px]:px-7" aria-labelledby="scp-title">
      <header class="scp__head mi:flex mi:items-center mi:gap-4">
        <MiProgressRing :value="doneCount" :max="tasks.length" :size="72" label="Setup tasks completed">
          <span class="scp__ring-text mi:text-[13px] mi:text-label2 mi:tabular-nums"><strong class="mi:[.scp__ring-text_&]:text-[18px] mi:[.scp__ring-text_&]:text-label">{{ doneCount }}</strong>/{{ tasks.length }}</span>
        </MiProgressRing>
        <div class="scp__intro mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText id="scp-title" variant="title3" as="h2" weight="semibold">Set up your workspace</MiText>
          <MiText variant="footnote" tone="label2" aria-live="polite">{{ remainingText }}</MiText>
        </div>
      </header>

      <!-- One bar per track, weighted by minutes rather than task count. -->
      <ul class="scp__tracks mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[720px]:grid-cols-3 mi:@[720px]:gap-5" aria-label="Progress by track">
        <li v-for="t in trackStats" :key="t.id" class="scp__track mi:grid mi:gap-1.5">
          <div class="scp__track-top mi:flex mi:justify-between mi:gap-2">
            <MiText as="span" variant="caption" weight="semibold">{{ t.label }}</MiText>
            <MiText as="span" variant="caption" tone="label2" tabular>{{ t.done }} / {{ t.total }} min</MiText>
          </div>
          <div class="scp__bar mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" :aria-label="`${t.label} progress`" :aria-valuenow="t.done" aria-valuemin="0" :aria-valuemax="t.total">
            <span class="mi:[.scp__bar_&]:block mi:[.scp__bar_&]:h-full mi:[.scp__bar_&]:rounded-[inherit] mi:[.scp__bar_&]:bg-p mi:[.scp__bar_&]:origin-left mi:[.scp__bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="'scp__fill--' + t.id" :style="{ transform: `scaleX(${t.total ? t.done / t.total : 0})` }" />
          </div>
        </li>
      </ul>

      <div class="scp__groups mi:grid mi:gap-4 mi:@[720px]:grid-cols-3 mi:@[720px]:gap-5">
        <section v-for="t in trackStats" :key="t.id" class="scp__group mi:grid mi:gap-2" :aria-labelledby="`scp-g-${t.id}`">
          <MiText :id="`scp-g-${t.id}`" variant="footnote" tone="label2" weight="semibold" as="h3">{{ t.label }}</MiText>
          <ul class="scp__tasks mi:grid mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none]">
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
.scp__bar .scp__fill--team { background: var(--mi-s); }
.scp__bar .scp__fill--billing { background: color-mix(in srgb, var(--mi-p) 55%, var(--mi-s)); }
</style>
