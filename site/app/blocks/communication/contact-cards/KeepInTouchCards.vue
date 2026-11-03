<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="kt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="kt-title" as="h2" variant="title3" weight="semibold">Keep in touch</MiText>
        <MiText variant="footnote" tone="label2">{{ dueCount }} of {{ contacts.length }} relationships are due for a catch-up.</MiText>
      </div>
      <MiSegmented v-model="view" label="Show" :options="views" />
    </header>

    <ul class="mi:[list-style:none] mi:m-0 mi:p-0 mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-2 mi:@[940px]:grid-cols-3">
      <li v-for="c in shown" :key="c.id" class="mi:grid mi:content-start mi:gap-3.5 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:flex mi:items-center mi:gap-3">
          <MiAvatar :name="c.name" size="md" tone="auto" decorative />
          <div class="mi:flex-1 mi:min-w-0">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ c.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ c.role }} · {{ c.company }}</MiText>
          </div>
          <MiBadge v-if="isDue(c)" tone="warning" label="Due" dot />
        </div>

        <div class="mi:grid mi:gap-1.5">
          <span class="mi:flex mi:justify-between mi:gap-2">
            <MiText variant="caption" tone="label2">{{ c.days === 0 ? 'Talked today' : c.days + ' days since ' + c.last }}</MiText>
            <MiText variant="caption" tone="label3">every {{ c.every }} days</MiText>
          </span>
          <div
            class="mi:h-1.5 mi:rounded-[3px] mi:bg-fill3 mi:overflow-hidden" role="meter" :aria-label="'Time since last contact with ' + c.name"
            :aria-valuenow="c.days" aria-valuemin="0" :aria-valuemax="c.every" :aria-valuetext="c.days + ' of ' + c.every + ' days'"
          >
            <span class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="isDue(c) ? 'mi:bg-orange' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(c.days / c.every, 1)})` }" />
          </div>
        </div>

        <MiText variant="footnote" tone="label2" :lines="2" class="mi:min-h-[2.6em]">{{ c.note }}</MiText>

        <div class="mi:flex mi:items-center mi:gap-1 mi:pt-3 mi:border-t mi:border-t-sep">
          <MiButton variant="gray" size="small" class="mi:mr-auto" @click="log(c)">
            <template #leading><MiIcon name="check" :size="14" /></template>
            Log catch-up
          </MiButton>
          <MiIconButton :label="'Message ' + c.name" variant="plain" size="small"><MiIcon name="chat" :size="17" /></MiIconButton>
          <MiIconButton :label="'Schedule with ' + c.name" variant="plain" size="small"><MiIcon name="calendar" :size="17" /></MiIconButton>
        </div>
      </li>
    </ul>
    <p class="mi:m-0 mi:min-h-4.5 mi:text-[13px] mi:text-label2" role="status">{{ status }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Contact { id: string, name: string, role: string, company: string, every: number, days: number, last: string, note: string }

const views = [{ value: 'all', label: 'All' }, { value: 'due', label: 'Due' }]
const view = ref<string | number | null>('all')
const status = ref('')

// Sample relationships; `every` is the chosen cadence in days.
const contacts = ref<Contact[]>([
  { id: 'c1', name: 'Olivia Carter', role: 'Head of Partnerships', company: 'Brightwave', every: 14, days: 19, last: 'a call', note: 'Asked for the Q1 co-marketing calendar. Promised a draft by end of month.' },
  { id: 'c2', name: 'Daniel Okafor', role: 'Investor', company: 'Northline Capital', every: 30, days: 12, last: 'the board update', note: 'Wants a warm intro to two logistics founders before March.' },
  { id: 'c3', name: 'Mei Lin', role: 'Former manager', company: 'Fieldnote', every: 60, days: 71, last: 'coffee in Shoreditch', note: 'Moving to Singapore in spring. Offered to review the hiring plan.' },
  { id: 'c4', name: 'Lukas Brandt', role: 'Customer champion', company: 'Kessler Freight', every: 21, days: 6, last: 'an email', note: 'Renewal due in April. Happy with routing, frustrated by invoice exports.' },
  { id: 'c5', name: 'Amélie Laurent', role: 'Design lead', company: 'Studio Ourse', every: 30, days: 33, last: 'a voice note', note: 'Shared her talk slides on accessible charts. Owe her feedback.' },
  { id: 'c6', name: 'Ravi Patel', role: 'Mentor', company: 'Independent', every: 45, days: 20, last: 'a walk', note: 'Suggested pricing interviews with 10 churned accounts.' }
])

const isDue = (c: Contact) => c.days >= c.every
const dueCount = computed(() => contacts.value.filter(isDue).length)
// Most overdue first, measured as a share of each person's cadence.
const shown = computed(() => contacts.value
  .filter(c => view.value === 'all' || isDue(c))
  .sort((a, b) => b.days / b.every - a.days / a.every))

function log(c: Contact) {
  c.days = 0
  c.last = 'today'
  status.value = `Catch-up with ${c.name} logged. Next one in ${c.every} days.`
}
</script>
