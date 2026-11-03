<template>
  <section class="psp" aria-labelledby="psp-title">
    <header class="psp__head">
      <div>
        <MiText id="psp-title" variant="title3" as="h2" weight="semibold">Studio pipeline</MiText>
        <MiText variant="footnote" tone="label2">{{ projects.length }} projects · {{ money(totalBudget) }} booked · {{ overCount }} over budget</MiText>
      </div>
      <MiButton v-if="stage" variant="plain" size="small" @click="stage = null">Show all stages</MiButton>
    </header>

    <!-- Stage rail: each step is a filter, sized by the money sitting in it. -->
    <ol class="psp__rail" aria-label="Stages">
      <li v-for="s in stageStats" :key="s.id">
        <button type="button" class="psp__stage" :class="{ 'is-on': stage === s.id }" :aria-pressed="stage === s.id" @click="stage = stage === s.id ? null : s.id">
          <span class="psp__stage-top"><b>{{ s.label }}</b><span>{{ s.count }}</span></span>
          <span class="psp__stage-sum">{{ money(s.budget) }}</span>
          <span class="psp__stage-bar" aria-hidden="true"><i :style="{ transform: `scaleX(${s.budget / maxStage})` }" /></span>
        </button>
      </li>
    </ol>

    <ul class="psp__list" aria-live="polite">
      <li v-for="p in shown" :key="p.id" class="psp__row">
        <div class="psp__who">
          <MiText variant="headline" as="h3" :lines="1">{{ p.name }}</MiText>
          <MiText variant="caption" tone="label2">{{ p.client }} · due {{ p.due }}</MiText>
        </div>
        <MiAvatarGroup :items="teamOf(p)" :max="3" size="xs" />
        <div class="psp__burn">
          <div class="psp__burn-top">
            <MiText variant="caption" weight="semibold" :tone="burn(p) > 1 ? 'red' : burn(p) > .85 ? 'orange' : 'label2'" tabular>
              {{ money(p.spent) }} of {{ money(p.budget) }}
            </MiText>
            <MiText variant="caption" tone="label3" tabular>{{ Math.round(burn(p) * 100) }}%</MiText>
          </div>
          <div class="psp__track" role="meter" :aria-label="p.name + ' budget used'" :aria-valuenow="Math.round(burn(p) * 100)" aria-valuemin="0" aria-valuemax="100">
            <i :class="{ 'is-over': burn(p) > 1, 'is-warn': burn(p) > .85 && burn(p) <= 1 }" :style="{ transform: `scaleX(${Math.min(burn(p), 1)})` }" />
          </div>
        </div>
        <div class="psp__act">
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
.psp { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.psp__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.psp__rail { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 6px; margin: 0; padding: 0; list-style: none; }
.psp__stage { display: grid; gap: 4px; width: 100%; padding: 10px 12px; border: 0; border-radius: var(--mi-radius-m); background: var(--mi-card); box-shadow: var(--mi-sh1); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.psp__stage.is-on { background: var(--mi-p-tint); box-shadow: inset 0 0 0 1.5px var(--mi-p); }
.psp__stage:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.psp__stage-top { display: flex; justify-content: space-between; gap: 6px; font-size: 13px; }
.psp__stage-top span { color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.psp__stage-sum { font-size: 17px; font-weight: 700; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.psp__stage-bar { height: 3px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.psp__stage-bar i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }

.psp__list { display: grid; margin: 0; padding: 0; list-style: none; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.psp__row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px 14px; align-items: center; padding: 14px 16px; }
.psp__row + .psp__row { border-top: 1px solid var(--mi-sep); }
.psp__who { display: grid; min-width: 0; }
.psp__burn { grid-column: 1 / -1; display: grid; gap: 4px; }
.psp__burn-top { display: flex; justify-content: space-between; gap: 8px; }
.psp__track { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.psp__track i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.psp__track i.is-warn { background: var(--mi-orange); }
.psp__track i.is-over { background: var(--mi-red); }
.psp__act { grid-column: 1 / -1; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }

@container (min-width: 760px) {
  .psp__row { grid-template-columns: minmax(0, 1.3fr) auto minmax(160px, 1fr) minmax(0, 220px); }
  .psp__burn, .psp__act { grid-column: auto; }
  .psp__act { justify-content: flex-end; }
}
</style>
