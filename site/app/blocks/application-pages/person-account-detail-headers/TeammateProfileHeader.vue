<template>
  <section class="tph" aria-labelledby="tph-title">
    <div class="tph__card">
      <div class="tph__top">
        <MiAvatar :name="person.name" size="lg" tone="primary" decorative class="tph__avatar" />
        <div class="tph__id">
          <div class="tph__name-row">
            <MiText id="tph-title" as="h2" variant="title2" weight="bold">{{ person.name }}</MiText>
            <MiText variant="footnote" tone="label3">{{ person.pronouns }}</MiText>
          </div>
          <MiText variant="subheadline" tone="label2">{{ person.role }} · {{ person.team }}</MiText>
          <MiBadge tone="secondary" :label="person.status" dot class="tph__status" />
        </div>
        <div class="tph__actions">
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
      <nav class="tph__line" aria-label="Reporting line">
        <ol>
          <li v-for="m in chain" :key="m.name">
            <MiAvatar :name="m.name" size="xs" tone="auto" decorative />
            <span><strong>{{ m.name }}</strong> {{ m.role }}</span>
            <MiIcon name="chevron-right" :size="14" class="tph__chev" />
          </li>
          <li aria-current="true"><strong>{{ person.name }}</strong></li>
        </ol>
        <div class="tph__reports">
          <MiAvatarGroup :items="reports" :max="3" size="xs" :label="`${reports.length} direct reports`" />
          <MiText variant="caption" tone="label2">{{ reports.length }} direct reports</MiText>
        </div>
      </nav>

      <dl class="tph__facts">
        <div>
          <dt>Local time</dt>
          <dd>{{ person.localTime }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.city }} · {{ person.offset }}</MiText>
        </div>
        <div>
          <dt>Working hours</dt>
          <dd>{{ person.hours }}</dd>
          <MiText variant="caption2" tone="label3" as="span">Mon to Thu, Fri mornings</MiText>
        </div>
        <div>
          <dt>Joined</dt>
          <dd>{{ person.joined }}</dd>
          <MiText variant="caption2" tone="label3" as="span">{{ person.tenure }}</MiText>
        </div>
        <div>
          <dt>Email</dt>
          <dd class="tph__email">{{ person.email }}</dd>
          <MiCopyButton :value="person.email" label="Copy" variant="ghost" />
        </div>
      </dl>
    </div>

    <div class="tph__tabs">
      <MiSegmented v-model="view" label="Profile section" :options="views" />
    </div>
    <div class="tph__panel" aria-live="polite">
      <template v-if="view === 'focus'">
        <article v-for="f in focus" :key="f.title" class="tph__item">
          <MiText variant="subheadline" weight="semibold" as="h3">{{ f.title }}</MiText>
          <MiText variant="footnote" tone="label2">{{ f.body }}</MiText>
        </article>
      </template>
      <template v-else-if="view === 'skills'">
        <div class="tph__chips">
          <MiChip v-for="s in skills" :key="s" :label="s" tone="neutral" size="small" />
        </div>
      </template>
      <template v-else>
        <article v-for="t in timeOff" :key="t.when" class="tph__item tph__item--row">
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
.tph { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.tph__card { display: grid; gap: 16px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; isolation: isolate; position: relative; }
/* Soft brand wash behind the identity row: a static gradient. */
.tph__card::before { content: ""; position: absolute; inset: 0 0 auto; height: 120px; z-index: -1; background: linear-gradient(120deg, var(--mi-p-tint), color-mix(in srgb, var(--mi-s) 14%, transparent) 70%, transparent); }

.tph__top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 14px 16px; align-items: center; }
@container (min-width: 760px) { .tph__top { grid-template-columns: auto minmax(0, 1fr) auto; } }
.tph__avatar { box-shadow: 0 0 0 3px var(--mi-card); border-radius: 50%; }
.tph__id { display: grid; gap: 2px; justify-items: start; min-width: 0; }
.tph__name-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.tph__status { margin-top: 6px; }
.tph__actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; }
@container (min-width: 760px) { .tph__actions { grid-column: auto; } }

.tph__line { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.tph__line ol { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; padding: 0; list-style: none; font-size: 13px; color: var(--mi-label2); }
.tph__line li { display: inline-flex; align-items: center; gap: 6px; }
.tph__line li strong { color: var(--mi-label); font-weight: 600; }
.tph__chev { color: var(--mi-label3); }
.tph__reports { display: flex; align-items: center; gap: 8px; }

.tph__facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 0; border-radius: var(--mi-radius-m); background: var(--mi-sep); overflow: hidden; }
@container (min-width: 760px) { .tph__facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.tph__facts > div { display: grid; gap: 2px; align-content: start; justify-items: start; min-width: 0; padding: 12px 14px; background: var(--mi-card); }
.tph__facts dt { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.tph__facts dd { margin: 0; font-size: 17px; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.tph__facts dd.tph__email { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }

.tph__tabs { display: flex; }
.tph__panel { display: grid; gap: 10px; }
@container (min-width: 640px) { .tph__panel { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.tph__item { display: grid; gap: 4px; min-width: 0; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tph__item--row { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.tph__chips { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
</style>
