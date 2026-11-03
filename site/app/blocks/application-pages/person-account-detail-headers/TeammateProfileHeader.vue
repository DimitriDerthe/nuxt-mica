<template>
  <section class="tph mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="tph-title">
    <div class="tph__card mi:grid mi:gap-4 mi:p-5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:overflow-hidden mi:isolate mi:relative mi:before:content-[''] mi:before:absolute mi:before:top-0 mi:before:right-0 mi:before:bottom-auto mi:before:left-0 mi:before:h-30 mi:before:-z-1 mi:before:[background:linear-gradient(120deg,_var(--mi-p-tint),_color-mix(in_srgb,_var(--mi-s)_14%,_transparent)_70%,_transparent)]">
      <div class="tph__top mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:gap-y-3.5 mi:gap-x-4 mi:items-center mi:@[760px]:grid-cols-[auto_minmax(0,_1fr)_auto]">
        <MiAvatar :name="person.name" size="lg" tone="primary" decorative class="tph__avatar mi:shadow-[0_0_0_3px_var(--mi-card)]" />
        <div class="tph__id mi:grid mi:gap-0.5 mi:justify-items-start mi:min-w-0">
          <div class="tph__name-row mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
            <MiText id="tph-title" as="h2" variant="title2" weight="bold">{{ person.name }}</MiText>
            <MiText variant="footnote" tone="label3">{{ person.pronouns }}</MiText>
          </div>
          <MiText variant="subheadline" tone="label2">{{ person.role }} · {{ person.team }}</MiText>
          <MiBadge tone="secondary" :label="person.status" dot class="tph__status" />
        </div>
        <div class="tph__actions mi:col-span-full mi:flex mi:flex-wrap mi:gap-2 mi:@[760px]:col-[auto]">
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
      <nav class="tph__line mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2.5 mi:gap-x-4 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:var(--mi-fill4)]" aria-label="Reporting line">
        <ol class="mi:[.tph__line_ol&]:flex-wrap mi:[.tph__line_ol&]:[list-style:none]">
          <li v-for="m in chain" :key="m.name">
            <MiAvatar class="mi:[.tph__line_ol&]:flex-wrap mi:[.tph__line_ol&]:[list-style:none]" :name="m.name" size="xs" tone="auto" decorative />
            <span><strong>{{ m.name }}</strong> {{ m.role }}</span>
            <MiIcon name="chevron-right" :size="14" class="tph__chev mi:[.tph__line_ol&]:flex-wrap mi:[.tph__line_ol&]:[list-style:none] mi:text-label3" />
          </li>
          <li aria-current="true"><strong>{{ person.name }}</strong></li>
        </ol>
        <div class="tph__reports mi:flex mi:items-center mi:gap-2">
          <MiAvatarGroup class="mi:[.tph__line_ol&]:flex-wrap mi:[.tph__line_ol&]:[list-style:none]" :items="reports" :max="3" size="xs" :label="`${reports.length} direct reports`" />
          <MiText class="mi:[.tph__line_ol&]:flex-wrap mi:[.tph__line_ol&]:[list-style:none]" variant="caption" tone="label2">{{ reports.length }} direct reports</MiText>
        </div>
      </nav>

      <dl class="tph__facts mi:grid mi:grid-cols-2 mi:gap-px mi:m-0 mi:rounded-md mi:[background:var(--mi-sep)] mi:overflow-hidden mi:@[760px]:grid-cols-4">
        <div class="mi:[.tph__facts>&]:content-start mi:[.tph__facts>&]:justify-items-start mi:[.tph__facts>&]:min-w-0 mi:[.tph__facts>&]:[background:var(--mi-card)]">
          <dt>Local time</dt>
          <dd>{{ person.localTime }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.city }} · {{ person.offset }}</MiText>
        </div>
        <div class="mi:[.tph__facts>&]:content-start mi:[.tph__facts>&]:justify-items-start mi:[.tph__facts>&]:min-w-0 mi:[.tph__facts>&]:[background:var(--mi-card)]">
          <dt>Working hours</dt>
          <dd>{{ person.hours }}</dd>
          <MiText variant="caption2" tone="label3" as="span">Mon to Thu, Fri mornings</MiText>
        </div>
        <div class="mi:[.tph__facts>&]:content-start mi:[.tph__facts>&]:justify-items-start mi:[.tph__facts>&]:min-w-0 mi:[.tph__facts>&]:[background:var(--mi-card)]">
          <dt>Joined</dt>
          <dd>{{ person.joined }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.tenure }}</MiText>
        </div>
        <div class="mi:[.tph__facts>&]:content-start mi:[.tph__facts>&]:justify-items-start mi:[.tph__facts>&]:min-w-0 mi:[.tph__facts>&]:[background:var(--mi-card)]">
          <dt>Email</dt>
          <dd class="tph__email mi:[.tph__facts_&]:max-w-full mi:[.tph__facts_&]:overflow-hidden mi:[.tph__facts_&]:text-ellipsis mi:[.tph__facts_&]:whitespace-nowrap">{{ person.email }}</dd>
          <MiCopyButton :value="person.email" label="Copy" variant="ghost" />
        </div>
      </dl>
    </div>

    <div class="tph__tabs mi:flex">
      <MiSegmented v-model="view" label="Profile section" :options="views" />
    </div>
    <div class="tph__panel mi:grid mi:gap-2.5 mi:@[640px]:grid-cols-2" aria-live="polite">
      <template v-if="view === 'focus'">
        <article v-for="f in focus" :key="f.title" class="tph__item mi:grid mi:gap-1 mi:min-w-0 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <MiText variant="subheadline" weight="semibold" as="h3">{{ f.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ f.body }}</MiText>
        </article>
      </template>
      <template v-else-if="view === 'skills'">
        <div class="tph__chips mi:col-span-full mi:flex mi:flex-wrap mi:gap-2 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <MiChip v-for="s in skills" :key="s" :label="s" tone="neutral" size="small" />
        </div>
      </template>
      <template v-else>
        <article v-for="t in timeOff" :key="t.when" class="tph__item tph__item--row mi:grid mi:gap-1 mi:min-w-0 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:grid-cols-[minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
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

<style scoped>
.tph__avatar { border-radius: 50%; }
.tph__status { margin-top: 6px; }
.tph__line ol { display: flex; align-items: center; gap: 6px; margin: 0; padding: 0; font-size: 13px; color: var(--mi-label2); }
.tph__line li { display: inline-flex; align-items: center; gap: 6px; }
.tph__line li strong { color: var(--mi-label); font-weight: 600; }
.tph__facts > div { display: grid; gap: 2px; padding: 12px 14px; }
.tph__facts dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.tph__facts dd { margin: 0; font-size: 17px; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.tph__facts dd.tph__email { font-size: 14px; }
</style>
