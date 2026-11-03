<template>
  <section class="opc" aria-labelledby="opc-title">
    <article class="opc__card">
      <div class="opc__cover" aria-hidden="true" />
      <div class="opc__top">
        <MiAvatar :name="person.name" size="xl" tone="auto" class="opc__avatar" decorative />
        <div class="opc__id">
          <MiText id="opc-title" variant="title2" as="h2" weight="bold">{{ person.name }}</MiText>
          <MiText variant="subheadline" tone="label2">{{ person.role }} · {{ person.team }}</MiText>
          <div class="opc__chips">
            <MiBadge :tone="person.away ? 'warning' : 'success'" :label="person.away ? 'Out until ' + person.away : 'Available'" dot />
            <MiText variant="caption" tone="label2">{{ person.city }} · {{ person.local }} local time</MiText>
          </div>
        </div>
        <div class="opc__cta">
          <MiButton size="small">Message</MiButton>
          <MiButton variant="gray" size="small">Book 1:1</MiButton>
        </div>
      </div>

      <MiTabs v-model="tab" :items="TABS" aria-label="Profile sections" class="opc__tabs">
        <template #about>
          <div class="opc__panel">
            <MiText variant="body" tone="label2">{{ person.bio }}</MiText>
            <MiDetails :items="facts" label-width="110px" />
            <div class="opc__skills" aria-label="Skills">
              <MiChip v-for="s in person.skills" :key="s" :label="s" tone="neutral" size="small" />
            </div>
          </div>
        </template>
        <template #work>
          <div class="opc__panel">
            <MiText variant="footnote" tone="label2">{{ allocated }}% of the week allocated</MiText>
            <ul class="opc__work">
              <li v-for="w in person.work" :key="w.project">
                <div class="opc__work-top"><b>{{ w.project }}</b><MiText variant="caption" tone="label2" tabular>{{ w.share }}%</MiText></div>
                <div class="opc__share" role="meter" :aria-label="w.project + ' allocation'" :aria-valuenow="w.share" aria-valuemin="0" aria-valuemax="100">
                  <i :style="{ transform: `scaleX(${w.share / 100})` }" />
                </div>
              </li>
            </ul>
          </div>
        </template>
        <template #org>
          <!-- Reporting line: every name is a button that opens that person's profile here. -->
          <div class="opc__panel">
            <template v-if="manager">
              <MiText variant="caption" weight="semibold" tone="label2" as="h3">Reports to</MiText>
              <button type="button" class="opc__person" @click="go(manager.id)">
                <MiAvatar :name="manager.name" size="sm" tone="auto" decorative />
                <span><b>{{ manager.name }}</b><small>{{ manager.role }}</small></span>
                <MiIcon name="chevron-right" :size="14" />
              </button>
            </template>
            <MiText variant="caption" weight="semibold" tone="label2" as="h3">{{ reports.length ? reports.length + ' direct reports' : 'No direct reports' }}</MiText>
            <button v-for="r in reports" :key="r.id" type="button" class="opc__person" @click="go(r.id)">
              <MiAvatar :name="r.name" size="sm" tone="auto" decorative />
              <span><b>{{ r.name }}</b><small>{{ r.role }}</small></span>
              <MiIcon name="chevron-right" :size="14" />
            </button>
          </div>
        </template>
      </MiTabs>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Work { project: string, share: number }
interface Person {
  id: string, name: string, role: string, team: string, city: string, local: string, away?: string, managerId?: string
  email: string, started: string, bio: string, skills: string[], work: Work[]
}

const TABS = [{ value: 'about', label: 'About' }, { value: 'work', label: 'Work' }, { value: 'org', label: 'Reporting line' }]

const PEOPLE: Person[] = [
  { id: 'nadia', name: 'Nadia Karimi', role: 'VP Engineering', team: 'Platform', city: 'Toronto', local: '09:40', email: 'nadia@loomwork.io', started: 'Feb 2019', bio: 'Built the platform org from four engineers to forty. Cares about boring infrastructure and fast reviews.', skills: ['Org design', 'Distributed systems', 'Hiring'], work: [{ project: 'Platform roadmap', share: 50 }, { project: 'Hiring', share: 30 }] },
  { id: 'theo', name: 'Théo Laurent', role: 'Engineering Manager', team: 'Payments', city: 'Lyon', local: '15:40', managerId: 'nadia', email: 'theo@loomwork.io', started: 'Sep 2021', bio: 'Leads the payments squad. Previously shipped card issuing at a neobank; still reviews every migration.', skills: ['Payments', 'Go', 'Incident command', 'Coaching'], work: [{ project: 'Payouts v2', share: 60 }, { project: 'PCI audit', share: 25 }, { project: 'Interviews', share: 10 }] },
  { id: 'ama', name: 'Ama Boateng', role: 'Senior Backend Engineer', team: 'Payments', city: 'Accra', local: '13:40', managerId: 'theo', email: 'ama@loomwork.io', started: 'Jan 2022', bio: 'Owns the ledger service and its reconciliation jobs. Writes the runbooks everyone actually reads.', skills: ['Go', 'Postgres', 'Ledgers'], work: [{ project: 'Payouts v2', share: 80 }, { project: 'On-call', share: 20 }] },
  { id: 'ryo', name: 'Ryo Sato', role: 'Frontend Engineer', team: 'Payments', city: 'Tokyo', local: '22:40', away: '14 Jun', managerId: 'theo', email: 'ryo@loomwork.io', started: 'Jun 2023', bio: 'Makes checkout feel instant. Maintains the shared form components and their accessibility tests.', skills: ['Vue', 'TypeScript', 'Accessibility'], work: [{ project: 'Checkout polish', share: 70 }, { project: 'Design system', share: 20 }] }
]

const currentId = ref('theo')
const tab = ref<string | undefined>('about')

const person = computed(() => PEOPLE.find(p => p.id === currentId.value) ?? PEOPLE[0]!)
const manager = computed(() => PEOPLE.find(p => p.id === person.value.managerId))
const reports = computed(() => PEOPLE.filter(p => p.managerId === person.value.id))
const allocated = computed(() => person.value.work.reduce((n, w) => n + w.share, 0))
const facts = computed(() => [
  { key: 'email', label: 'Email', value: person.value.email, href: '#' },
  { key: 'team', label: 'Team', value: person.value.team },
  { key: 'started', label: 'Joined', value: person.value.started },
  { key: 'city', label: 'Based in', value: person.value.city }
])

function go(id: string) {
  currentId.value = id
}
</script>

<style scoped>
.opc { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.opc__card { display: grid; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
.opc__cover { height: 96px; background: radial-gradient(120% 140% at 0% 0%, var(--mi-p-tint2), transparent 60%), radial-gradient(90% 120% at 100% 100%, var(--mi-s-tint2), transparent 55%), var(--mi-fill4); }
.opc__top { display: grid; gap: 12px; padding: 0 20px 16px; }
.opc__avatar { margin-top: -40px; box-shadow: 0 0 0 4px var(--mi-card); border-radius: 50%; }
.opc__id { display: grid; gap: 4px; min-width: 0; }
.opc__chips { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 4px; }
.opc__cta { display: flex; gap: 8px; }
.opc__tabs { padding: 0 20px 20px; }
.opc__panel { display: grid; align-content: start; gap: 12px; padding-top: 14px; }
.opc__skills { display: flex; flex-wrap: wrap; gap: 6px; }
.opc__work { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.opc__work-top { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; }
.opc__work-top b { font-weight: 600; }
.opc__share { height: 6px; margin-top: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.opc__share i { display: block; height: 100%; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.opc__person { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: 0; border-radius: var(--mi-radius-m); background: var(--mi-fill4); color: inherit; font: inherit; text-align: start; cursor: pointer; }
.opc__person:hover { background: var(--mi-fill3); }
.opc__person:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.opc__person span { display: grid; flex: 1; min-width: 0; font-size: 14px; }
.opc__person b { font-weight: 600; }
.opc__person small { font-size: 12px; color: var(--mi-label2); }

@container (min-width: 640px) {
  .opc__cover { height: 120px; }
  .opc__top { grid-template-columns: auto minmax(0, 1fr) auto; align-items: end; gap: 18px; padding: 0 28px 18px; }
  .opc__avatar { margin-top: -28px; }
  .opc__tabs { padding: 0 28px 24px; }
}
</style>
