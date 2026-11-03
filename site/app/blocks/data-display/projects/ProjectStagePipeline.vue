<template>
  <section class="psp mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="psp-title">
    <header class="psp__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="psp-title" variant="title3" as="h2" weight="semibold">Studio pipeline</MiText>
        <MiText variant="footnote" tone="label2">{{ projects.length }} projects · {{ money(totalBudget) }} booked · {{ overCount }} over budget</MiText>
      </div>
      <MiButton v-if="stage" variant="plain" size="small" @click="stage = null">Show all stages</MiButton>
    </header>

    <!-- Stage rail: each step is a filter, sized by the money sitting in it. -->
    <ol class="psp__rail mi:grid mi:grid-cols-[repeat(auto-fit,_minmax(96px,_1fr))] mi:gap-1.5 mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Stages">
      <li v-for="s in stageStats" :key="s.id">
        <button type="button" class="psp__stage mi:grid mi:gap-1 mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:bg-card mi:shadow-1 mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:[&.is-on]:bg-p-tint mi:[&.is-on]:shadow-[inset_0_0_0_1.5px_var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-on': stage === s.id }" :aria-pressed="stage === s.id" @click="stage = stage === s.id ? null : s.id">
          <span class="psp__stage-top mi:flex mi:justify-between mi:gap-1.5 mi:text-[13px]"><b>{{ s.label }}</b><span class="mi:[.psp__stage-top_&]:text-label2 mi:[.psp__stage-top_&]:tabular-nums">{{ s.count }}</span></span>
          <span class="psp__stage-sum mi:text-[17px] mi:font-bold mi:tracking-[-.02em] mi:tabular-nums">{{ money(s.budget) }}</span>
          <span class="psp__stage-bar mi:h-[3px] mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden" aria-hidden="true"><i class="mi:[.psp__stage-bar_&]:block mi:[.psp__stage-bar_&]:h-full mi:[.psp__stage-bar_&]:bg-p mi:[.psp__stage-bar_&]:origin-left mi:[.psp__stage-bar_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${s.budget / maxStage})` }" /></span>
        </button>
      </li>
    </ol>

    <ul class="psp__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none] mi:rounded-lg mi:bg-card mi:shadow-1 mi:overflow-hidden" aria-live="polite">
      <li v-for="p in shown" :key="p.id" class="psp__row mi:grid mi:grid-cols-[minmax(0,_1fr)_auto] mi:gap-y-2.5 mi:gap-x-3.5 mi:items-center mi:py-3.5 mi:px-4 mi:[.psp__row+&]:border-t mi:[.psp__row+&]:border-t-sep mi:@[760px]:grid-cols-[minmax(0,_1.3fr)_auto_minmax(160px,_1fr)_minmax(0,_220px)]">
        <div class="psp__who mi:grid mi:min-w-0">
          <MiText variant="headline" as="h3" :lines="1">{{ p.name }}</MiText>
          <MiText variant="caption" tone="label2">{{ p.client }} · due {{ p.due }}</MiText>
        </div>
        <MiAvatarGroup :items="teamOf(p)" :max="3" size="xs" />
        <div class="psp__burn mi:col-span-full mi:grid mi:gap-1 mi:@[760px]:col-[auto]">
          <div class="psp__burn-top mi:flex mi:justify-between mi:gap-2">
            <MiText variant="caption" weight="semibold" :tone="burn(p) > 1 ? 'red' : burn(p) > .85 ? 'orange' : 'label2'" tabular>
              {{ money(p.spent) }} of {{ money(p.budget) }}
            </MiText>
            <MiText variant="caption" tone="label3" tabular>{{ Math.round(burn(p) * 100) }}%</MiText>
          </div>
          <div class="psp__track mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" :aria-label="p.name + ' budget used'" :aria-valuenow="Math.round(burn(p) * 100)" aria-valuemin="0" aria-valuemax="100">
            <i class="mi:[.psp__track_&]:block mi:[.psp__track_&]:h-full mi:[.psp__track_&]:origin-left mi:[.psp__track_&]:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="{ 'is-over': burn(p) > 1, 'is-warn': burn(p) > .85 && burn(p) <= 1 }" :style="{ transform: `scaleX(${Math.min(burn(p), 1)})` }" />
          </div>
        </div>
        <div class="psp__act mi:col-span-full mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:@[760px]:col-[auto] mi:@[760px]:[justify-content:flex-end]">
          <MiBadge tone="neutral" variant="outline" :label="stageLabel(p.stage)" />
          <MiButton v-if="p.stage < STAGES.length - 1" variant="tinted" size="mini" @click="p.stage++">
            Move to {{ stageLabel(p.stage + 1) }}
          </MiButton>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Stage { id: string, label: string }
interface Project { id: number, name: string, client: string, due: string, team: string[], budget: number, spent: number, stage: number }

const STAGES: Stage[] = [{ id: 'brief', label: 'Brief' }, { id: 'design', label: 'Design' }, { id: 'build', label: 'Build' }, { id: 'review', label: 'Review' }, { id: 'live', label: 'Live' }]

const projects = ref<Project[]>([
  { id: 1, name: 'Booking flow redesign', client: 'Harbor Hotels', due: '12 Jun', team: ['Ines Duarte', 'Sam Okoro'], budget: 48000, spent: 21000, stage: 1 },
  { id: 2, name: 'Member app v3', client: 'Ridgeline Climbing', due: '30 Jun', team: ['Kai Brennan', 'Ines Duarte', 'Lea Hoffmann', 'Ravi Shah'], budget: 92000, spent: 81000, stage: 2 },
  { id: 3, name: 'Annual report site', client: 'Verdant Trust', due: '3 Jun', team: ['Lea Hoffmann'], budget: 26000, spent: 28400, stage: 3 },
  { id: 4, name: 'Loyalty programme', client: 'Copperpot Coffee', due: '18 Jul', team: ['Sam Okoro', 'Ravi Shah'], budget: 64000, spent: 4200, stage: 0 },
  { id: 5, name: 'Clinic finder', client: 'Northfield Health', due: '22 May', team: ['Kai Brennan', 'Ravi Shah'], budget: 38000, spent: 36100, stage: 4 },
  { id: 6, name: 'Driver onboarding', client: 'Swiftcart', due: '9 Jul', team: ['Ines Duarte', 'Kai Brennan', 'Sam Okoro'], budget: 54000, spent: 30500, stage: 2 }
])
const stage = ref<string | null>(null)

const money = (n: number) => '$' + (n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'k' : n)
const burn = (p: Project) => p.spent / p.budget
const stageLabel = (i: number) => STAGES[i]?.label ?? ''
const teamOf = (p: Project) => p.team.map(name => ({ name, tone: 'auto' as const }))

const stageStats = computed(() => STAGES.map((s, i) => {
  const inStage = projects.value.filter(p => p.stage === i)
  return { ...s, count: inStage.length, budget: inStage.reduce((n, p) => n + p.budget, 0) }
}))
const maxStage = computed(() => Math.max(1, ...stageStats.value.map(s => s.budget)))
const totalBudget = computed(() => projects.value.reduce((n, p) => n + p.budget, 0))
const overCount = computed(() => projects.value.filter(p => burn(p) > 1).length)
const shown = computed(() => (stage.value ? projects.value.filter(p => STAGES[p.stage]?.id === stage.value) : projects.value))
</script>

<style scoped>
.psp__track i { background: var(--mi-p); }
.psp__track i.is-warn { background: var(--mi-orange); }
.psp__track i.is-over { background: var(--mi-red); }
</style>
