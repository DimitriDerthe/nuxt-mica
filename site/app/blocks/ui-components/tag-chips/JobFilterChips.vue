<template>
  <div class="jfc">
    <section class="jfc__card" aria-labelledby="jfc-title">
      <header class="jfc__head">
        <MiText id="jfc-title" variant="title3" as="h2" weight="semibold">Open roles</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ jobs.length }} roles match</MiText>
      </header>

      <div class="jfc__layout">
        <!-- Chip groups: each chip shows how many roles it would leave, given the other filters. -->
        <div class="jfc__facets">
          <fieldset v-for="g in groups" :key="g.id" class="jfc__group">
            <legend class="jfc__legend">{{ g.label }}</legend>
            <div class="jfc__chips">
              <MiChip
                v-for="o in g.options" :key="o" selectable size="small" :tone="g.id === 'team' ? 'secondary' : 'primary'"
                :model-value="picked[g.id].includes(o)" :disabled="!picked[g.id].includes(o) && counts[g.id + o] === 0"
                @update:model-value="toggle(g.id, o)"
              >
                {{ o }} <span class="jfc__n">{{ counts[g.id + o] }}</span>
              </MiChip>
            </div>
          </fieldset>
        </div>

        <div class="jfc__results">
          <div v-if="active.length" class="jfc__active" aria-label="Active filters" role="group">
            <MiChip
              v-for="a in active" :key="a.group + a.value" removable tone="neutral" size="small" :label="a.value"
              :remove-label="`Remove ${a.value} filter`" @remove="toggle(a.group, a.value)"
            />
            <MiButton variant="plain" size="small" @click="clear">Clear all</MiButton>
          </div>

          <ul class="jfc__list" aria-label="Matching roles">
            <li v-for="j in results" :key="j.id" class="jfc__job">
              <div class="jfc__job-main">
                <MiText variant="subheadline" weight="semibold" as="h3">{{ j.title }}</MiText>
                <MiText variant="caption" tone="label2">{{ j.team }} · {{ j.city }} · {{ j.salary }}</MiText>
              </div>
              <div class="jfc__tags">
                <MiBadge variant="outline" tone="neutral" :label="j.mode" />
                <MiBadge variant="tint" tone="neutral" :label="j.level" />
              </div>
            </li>
            <li v-if="!results.length" class="jfc__none">
              <MiText variant="footnote" tone="label2">No role fits every filter. Remove one to widen the search.</MiText>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type GroupId = 'mode' | 'level' | 'team'
interface Job { id: number, title: string, team: string, city: string, salary: string, mode: string, level: string }

const groups: { id: GroupId, label: string, options: string[] }[] = [
  { id: 'mode', label: 'Work mode', options: ['Remote', 'Hybrid', 'On-site'] },
  { id: 'level', label: 'Seniority', options: ['Junior', 'Mid', 'Senior', 'Lead'] },
  { id: 'team', label: 'Team', options: ['Engineering', 'Design', 'Data', 'Sales'] }
]

const jobs: Job[] = [
  { id: 1, title: 'Senior backend engineer, payments', team: 'Engineering', city: 'Lisbon', salary: '€85–100k', mode: 'Remote', level: 'Senior' },
  { id: 2, title: 'Product designer, onboarding', team: 'Design', city: 'Berlin', salary: '€65–78k', mode: 'Hybrid', level: 'Mid' },
  { id: 3, title: 'Data engineer, warehouse', team: 'Data', city: 'Amsterdam', salary: '€70–85k', mode: 'Remote', level: 'Mid' },
  { id: 4, title: 'Engineering manager, platform', team: 'Engineering', city: 'Paris', salary: '€110–125k', mode: 'Hybrid', level: 'Lead' },
  { id: 5, title: 'Account executive, DACH', team: 'Sales', city: 'Munich', salary: '€60k + commission', mode: 'On-site', level: 'Mid' },
  { id: 6, title: 'Frontend engineer, design system', team: 'Engineering', city: 'Lisbon', salary: '€55–65k', mode: 'Remote', level: 'Junior' },
  { id: 7, title: 'Staff analyst, pricing', team: 'Data', city: 'Paris', salary: '€95–110k', mode: 'On-site', level: 'Senior' }
]

const groupIds: GroupId[] = ['mode', 'level', 'team']
const picked = ref<Record<GroupId, string[]>>({ mode: ['Remote'], level: [], team: ['Engineering'] })

// Within a group chips are OR, across groups AND.
const fits = (j: Job, sel: Record<GroupId, string[]>): boolean =>
  groupIds.every(g => !sel[g].length || sel[g].includes(j[g]))

const results = computed(() => jobs.filter(j => fits(j, picked.value)))
const active = computed(() => groups.flatMap(g => picked.value[g.id].map(value => ({ group: g.id, value }))))

// Roles each chip would leave if it were the only pick in its group, keyed by group + option.
const counts = computed(() => Object.fromEntries(groups.flatMap(g => g.options.map(o =>
  [g.id + o, jobs.filter(j => fits(j, { ...picked.value, [g.id]: [o] })).length]))))
function toggle(group: GroupId, option: string): void {
  const list = picked.value[group]
  picked.value[group] = list.includes(option) ? list.filter(o => o !== option) : [...list, option]
}
function clear(): void {
  picked.value = { mode: [], level: [], team: [] }
}
</script>

<style scoped>
.jfc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.jfc__card { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.jfc__head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 16px; }

.jfc__layout { display: grid; gap: 20px; }
.jfc__facets { display: grid; gap: 14px; align-content: start; }
.jfc__group { display: grid; gap: 8px; margin: 0; padding: 0; border: 0; min-width: 0; }
.jfc__legend { padding: 0; margin-bottom: 8px; font-size: 12px; font-weight: 600; color: var(--mi-label2); }
.jfc__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.jfc__n { margin-left: 2px; opacity: .6; font-variant-numeric: tabular-nums; }

.jfc__results { display: grid; gap: 12px; align-content: start; min-width: 0; }
.jfc__active { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.jfc__list { display: grid; margin: 0; padding: 0; list-style: none; }
.jfc__job { display: grid; gap: 8px; padding: 12px 0; border-top: 1px solid var(--mi-sep); }
.jfc__job:first-child { border-top: 0; }
.jfc__job-main { min-width: 0; }
.jfc__tags { display: flex; flex-wrap: wrap; gap: 6px; }
.jfc__none { padding: 16px 0; }

@container (min-width: 760px) {
  .jfc__card { padding: 24px 28px; }
  .jfc__layout { grid-template-columns: 260px minmax(0, 1fr); gap: 28px; }
  .jfc__job { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
}
</style>
