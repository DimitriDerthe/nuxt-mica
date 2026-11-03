<template>
  <div class="jfc mi:@container mi:font-mi mi:text-label">
    <section class="jfc__card mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[760px]:py-6 mi:@[760px]:px-7" aria-labelledby="jfc-title">
      <header class="jfc__head mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-4">
        <MiText id="jfc-title" variant="title3" as="h2" weight="semibold">Open roles</MiText>
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ results.length }} of {{ jobs.length }} roles match</MiText>
      </header>

      <div class="jfc__layout mi:grid mi:gap-5 mi:@[760px]:grid-cols-[260px_minmax(0,_1fr)] mi:@[760px]:gap-7">
        <!-- Chip groups: each chip shows how many roles it would leave, given the other filters. -->
        <div class="jfc__facets mi:grid mi:gap-3.5 mi:content-start">
          <fieldset v-for="g in groups" :key="g.id" class="jfc__group mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[border:0] mi:min-w-0">
            <legend class="jfc__legend mi:p-0 mi:mb-2 mi:text-[12px] mi:font-semibold mi:text-label2">{{ g.label }}</legend>
            <div class="jfc__chips mi:flex mi:flex-wrap mi:gap-1.5">
              <MiChip
                v-for="o in g.options" :key="o" selectable size="small" :tone="g.id === 'team' ? 'secondary' : 'primary'"
                :model-value="picked[g.id].includes(o)" :disabled="!picked[g.id].includes(o) && counts[g.id + o] === 0"
                @update:model-value="toggle(g.id, o)"
              >
                {{ o }} <span class="jfc__n mi:ml-0.5 mi:opacity-60 mi:tabular-nums">{{ counts[g.id + o] }}</span>
              </MiChip>
            </div>
          </fieldset>
        </div>

        <div class="jfc__results mi:grid mi:gap-3 mi:content-start mi:min-w-0">
          <div v-if="active.length" class="jfc__active mi:flex mi:flex-wrap mi:items-center mi:gap-1.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:bg-fill4" aria-label="Active filters" role="group">
            <MiChip
              v-for="a in active" :key="a.group + a.value" removable tone="neutral" size="small" :label="a.value"
              :remove-label="`Remove ${a.value} filter`" @remove="toggle(a.group, a.value)"
            />
            <MiButton variant="plain" size="small" @click="clear">Clear all</MiButton>
          </div>

          <ul class="jfc__list mi:grid mi:m-0 mi:p-0 mi:[list-style:none]" aria-label="Matching roles">
            <li v-for="j in results" :key="j.id" class="jfc__job mi:grid mi:gap-2 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep mi:first:[border-top:0] mi:@[760px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[760px]:items-center">
              <div class="jfc__job-main mi:min-w-0">
                <MiText variant="subheadline" weight="semibold" as="h3">{{ j.title }}</MiText>
                <MiText variant="caption" tone="label2">{{ j.team }} · {{ j.city }} · {{ j.salary }}</MiText>
              </div>
              <div class="jfc__tags mi:flex mi:flex-wrap mi:gap-1.5">
                <MiBadge variant="outline" tone="neutral" :label="j.mode" />
                <MiBadge variant="tint" tone="neutral" :label="j.level" />
              </div>
            </li>
            <li v-if="!results.length" class="jfc__none mi:py-4 mi:px-0">
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
