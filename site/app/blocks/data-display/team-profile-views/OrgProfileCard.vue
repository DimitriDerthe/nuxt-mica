<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="opc-title">
    <article class="mi:grid mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden">
      <div class="mi:h-24 mi:[background:radial-gradient(120%_140%_at_0%_0%,_var(--mi-p-tint2),_transparent_60%),_radial-gradient(90%_120%_at_100%_100%,_var(--mi-s-tint2),_transparent_55%),_var(--mi-fill4)] mi:@[640px]:h-30" aria-hidden="true" />
      <div class="mi:grid mi:gap-3 mi:pt-0 mi:px-5 mi:pb-4 mi:@[640px]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:@[640px]:items-end mi:@[640px]:gap-4.5 mi:@[640px]:pt-0 mi:@[640px]:px-7 mi:@[640px]:pb-4.5">
        <MiAvatar :name="person.name" size="xl" tone="auto" class="mi:rounded-[50%]! mi:-mt-10 mi:shadow-[0_0_0_4px_var(--mi-card)] mi:@[640px]:-mt-7" decorative />
        <div class="mi:grid mi:gap-1 mi:min-w-0">
          <MiText id="opc-title" variant="title2" as="h2" weight="bold">{{ person.name }}</MiText>
          <MiText variant="subheadline" tone="label2">{{ person.role }} · {{ person.team }}</MiText>
          <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-2 mi:mt-1">
            <MiBadge :tone="person.away ? 'warning' : 'success'" :label="person.away ? 'Out until ' + person.away : 'Available'" dot />
            <MiText variant="caption" tone="label2">{{ person.city }} · {{ person.local }} local time</MiText>
          </div>
        </div>
        <div class="mi:flex mi:gap-2">
          <MiButton size="small">Message</MiButton>
          <MiButton variant="gray" size="small">Book 1:1</MiButton>
        </div>
      </div>

      <MiTabs v-model="tab" :items="TABS" aria-label="Profile sections" class="mi:pt-0! mi:px-5! mi:pb-5! mi:@[640px]:px-7! mi:@[640px]:pb-6!">
        <template #about>
          <div class="mi:grid mi:content-start mi:gap-3 mi:pt-3.5">
            <MiText variant="body" tone="label2">{{ person.bio }}</MiText>
            <MiDetails :items="facts" label-width="110px" />
            <div class="mi:flex mi:flex-wrap mi:gap-1.5" aria-label="Skills">
              <MiChip v-for="s in person.skills" :key="s" :label="s" tone="neutral" size="small" />
            </div>
          </div>
        </template>
        <template #work>
          <div class="mi:grid mi:content-start mi:gap-3 mi:pt-3.5">
            <MiText variant="footnote" tone="label2">{{ allocated }}% of the week allocated</MiText>
            <ul class="mi:grid mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none]">
              <li v-for="w in person.work" :key="w.project">
                <div class="mi:flex mi:justify-between mi:gap-2 mi:text-[14px]"><b class="mi:font-semibold">{{ w.project }}</b><MiText variant="caption" tone="label2" tabular>{{ w.share }}%</MiText></div>
                <div class="mi:h-1.5 mi:mt-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="w.project + ' allocation'" :aria-valuenow="w.share" aria-valuemin="0" aria-valuemax="100">
                  <i class="mi:block mi:h-full mi:[background:linear-gradient(90deg,_var(--mi-p),_var(--mi-s))] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${w.share / 100})` }" />
                </div>
              </li>
            </ul>
          </div>
        </template>
        <template #org>
          <!-- Reporting line: every name is a button that opens that person's profile here. -->
          <div class="mi:grid mi:content-start mi:gap-3 mi:pt-3.5">
            <template v-if="manager">
              <MiText variant="caption" weight="semibold" tone="label2" as="h3">Reports to</MiText>
              <button type="button" class="mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:[background:var(--mi-fill4)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="go(manager.id)">
                <MiAvatar class="mi:grid! mi:flex-1! mi:text-[14px]! mi:min-w-0!" :name="manager.name" size="sm" tone="auto" decorative />
                <span class="mi:grid mi:flex-1 mi:text-[14px] mi:min-w-0"><b class="mi:font-semibold">{{ manager.name }}</b><small class="mi:text-[12px] mi:text-label2">{{ manager.role }}</small></span>
                <MiIcon name="chevron-right" :size="14" />
              </button>
            </template>
            <MiText variant="caption" weight="semibold" tone="label2" as="h3">{{ reports.length ? reports.length + ' direct reports' : 'No direct reports' }}</MiText>
            <button v-for="r in reports" :key="r.id" type="button" class="mi:flex mi:items-center mi:gap-3 mi:w-full mi:py-2.5 mi:px-3 mi:[border:0] mi:rounded-md mi:[background:var(--mi-fill4)] mi:text-inherit mi:[font:inherit] mi:text-start mi:cursor-pointer mi:hover:[background:var(--mi-fill3)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" @click="go(r.id)">
              <MiAvatar class="mi:grid! mi:flex-1! mi:text-[14px]! mi:min-w-0!" :name="r.name" size="sm" tone="auto" decorative />
              <span class="mi:grid mi:flex-1 mi:text-[14px] mi:min-w-0"><b class="mi:font-semibold">{{ r.name }}</b><small class="mi:text-[12px] mi:text-label2">{{ r.role }}</small></span>
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
