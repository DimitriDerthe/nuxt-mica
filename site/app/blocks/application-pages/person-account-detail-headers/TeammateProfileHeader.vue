<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="tph-title">
    <div class="mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden mi:isolate mi:relative mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-30 mi:before:-z-1 mi:before:[background:linear-gradient(120deg,_var(--mi-p-tint),_color-mix(in_srgb,_var(--mi-s)_14%,_transparent)_70%,_transparent)]">
      <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-3.5 mi:gap-x-4 mi:items-center mi:@[760px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
        <MiAvatar :name="person.name" size="lg" tone="primary" decorative class="mi:rounded-[50%]! mi:shadow-[0_0_0_3px_var(--mi-card)]" />
        <div class="mi:grid mi:gap-0.5 mi:justify-items-start mi:min-w-0">
          <div class="mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <MiText id="tph-title" as="h2" variant="title2" weight="bold">{{ person.name }}</MiText>
            <MiText variant="footnote" tone="label3">{{ person.pronouns }}</MiText>
          </div>
          <MiText variant="subheadline" tone="label2">{{ person.role }} · {{ person.team }}</MiText>
          <MiBadge tone="secondary" :label="person.status" dot class="mi:mt-1.5" />
        </div>
        <div class="mi:col-span-full mi:flex mi:flex-wrap mi:gap-2 mi:@[760px]:col-[auto]">
          <MiButton size="small">
            <template #leading><MiIcon name="chat" :size="16" /></template>
            Message
          </MiButton>
          <MiButton variant="gray" size="small">
            <template #leading><MiIcon name="calendar" :size="16" /></template>
            Book time
          </MiButton>
          <MiButton variant="bordered" size="small" :pressed="following" @click="following = !following">
            {{ following ? 'Following' : 'Follow' }}
          </MiButton>
        </div>
      </div>

      <!-- Reporting line: the chain up to the CEO, and who reports to this person. -->
      <nav class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)]" aria-label="Reporting line">
        <ol class="mi:flex mi:items-center mi:gap-1.5 mi:m-0 mi:p-0 mi:text-[13px] mi:text-label2 mi:flex-wrap mi:[list-style:none]">
          <li v-for="m in chain" :key="m.name" class="mi:inline-flex mi:items-center mi:gap-1.5">
            <MiAvatar :name="m.name" size="xs" tone="auto" decorative />
            <span><strong class="mi:text-label mi:font-semibold">{{ m.name }}</strong> {{ m.role }}</span>
            <MiIcon name="chevron-right" :size="14" class="mi:text-label3" />
          </li>
          <li aria-current="true" class="mi:inline-flex mi:items-center mi:gap-1.5"><strong class="mi:text-label mi:font-semibold">{{ person.name }}</strong></li>
        </ol>
        <div class="mi:flex mi:items-center mi:gap-2">
          <MiAvatarGroup :items="reports" :max="3" size="xs" :label="`${reports.length} direct reports`" />
          <MiText variant="caption" tone="label2">{{ reports.length }} direct reports</MiText>
        </div>
      </nav>

      <dl class="mi:grid mi:grid-cols-2 mi:gap-px mi:m-0 mi:rounded-md mi:[background:var(--mi-sep)] mi:overflow-hidden mi:@[760px]:grid-cols-4">
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:content-start mi:justify-items-start mi:min-w-0 mi:[background:var(--mi-card)]">
          <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Local time</dt>
          <dd class="mi:m-0 mi:text-[17px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">{{ person.localTime }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.city }} · {{ person.offset }}</MiText>
        </div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:content-start mi:justify-items-start mi:min-w-0 mi:[background:var(--mi-card)]">
          <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Working hours</dt>
          <dd class="mi:m-0 mi:text-[17px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">{{ person.hours }}</dd>
          <MiText variant="caption2" tone="label3" as="span">Mon to Thu, Fri mornings</MiText>
        </div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:content-start mi:justify-items-start mi:min-w-0 mi:[background:var(--mi-card)]">
          <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Joined</dt>
          <dd class="mi:m-0 mi:text-[17px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">{{ person.joined }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.tenure }}</MiText>
        </div>
        <div class="mi:grid mi:gap-0.5 mi:py-3 mi:px-3.5 mi:content-start mi:justify-items-start mi:min-w-0 mi:[background:var(--mi-card)]">
          <dt class="mi:text-[12px] mi:font-medium mi:text-label2">Email</dt>
          <dd class="mi:m-0 mi:text-[14px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums mi:max-w-full mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ person.email }}</dd>
          <MiCopyButton :value="person.email" label="Copy" variant="ghost" />
        </div>
      </dl>
    </div>

    <div class="mi:flex">
      <MiSegmented v-model="view" label="Profile section" :options="views" />
    </div>
    <div class="mi:grid mi:gap-2.5 mi:@[640px]:grid-cols-2" aria-live="polite">
      <template v-if="view === 'focus'">
        <article v-for="f in focus" :key="f.title" class="mi:grid mi:gap-1 mi:min-w-0 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <MiText variant="subheadline" weight="semibold" as="h3">{{ f.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ f.body }}</MiText>
        </article>
      </template>
      <template v-else-if="view === 'skills'">
        <div class="mi:col-span-full mi:flex mi:flex-wrap mi:gap-2 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <MiChip v-for="s in skills" :key="s" :label="s" tone="neutral" size="small" />
        </div>
      </template>
      <template v-else>
        <article v-for="t in timeOff" :key="t.when" class="mi:grid mi:gap-1 mi:min-w-0 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:grid-cols-[minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
          <div>
            <MiText variant="subheadline" weight="semibold" as="h3">{{ t.when }}</MiText>
            <MiText variant="footnote" tone="label2">{{ t.what }}</MiText>
          </div>
          <MiBadge :tone="t.approved ? 'success' : 'warning'" :label="t.approved ? 'Approved' : 'Pending'" />
        </article>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Sample directory record; swap for your HR system.
const person = {
  name: 'Amara Osei', pronouns: 'she/her', role: 'Staff engineer', team: 'Payments platform',
  status: 'Focusing until 15:00', localTime: '13:42', city: 'Lisbon', offset: 'UTC+0, 1 h behind you',
  hours: '09:00–17:30', joined: 'March 2022', tenure: '2 years, 8 months', email: 'amara.osei@ledgerly.io'
}
const chain = [
  { name: 'Inès Moreau', role: 'CEO' },
  { name: 'Daniel Kwan', role: 'VP Engineering' },
  { name: 'Sofia Lindqvist', role: 'Payments lead' }
]
const reports = [{ name: 'Kenji Watanabe' }, { name: 'Lucía Romero' }, { name: 'Ben Adeyemi' }, { name: 'Hana Novak' }]

const views = [{ value: 'focus', label: 'Current focus' }, { value: 'skills', label: 'Skills' }, { value: 'time', label: 'Time off' }]
const view = ref<string | number | null>('focus')
const following = ref(false)

const focus = [
  { title: 'Ledger v2 migration', body: 'Owns the double-entry rewrite; cutover for EU merchants is planned for Nov 18.' },
  { title: 'Incident review rota', body: 'Runs the Thursday review of payment incidents for the platform group.' }
]
const skills = ['Go', 'Postgres', 'Event sourcing', 'PCI DSS', 'Kafka', 'Incident command', 'Mentoring']
const timeOff = [
  { when: 'Nov 24 – Nov 28', what: 'Holiday in Accra · Kenji covers on-call', approved: true },
  { when: 'Dec 22 – Jan 2', what: 'End-of-year leave', approved: false }
]
</script>
