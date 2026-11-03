<template>
  <section class="kt" aria-labelledby="kt-title">
    <header class="kt__head">
      <div>
        <MiText id="kt-title" as="h2" variant="title3" weight="semibold">Keep in touch</MiText>
        <MiText variant="footnote" tone="label2">{{ dueCount }} of {{ contacts.length }} relationships are due for a catch-up.</MiText>
      </div>
      <MiSegmented v-model="view" label="Show" :options="views" />
    </header>

    <ul class="kt__grid">
      <li v-for="c in shown" :key="c.id" class="kt__card" :class="{ 'is-due': isDue(c) }">
        <div class="kt__top">
          <MiAvatar :name="c.name" size="md" tone="auto" decorative />
          <div class="kt__id">
            <MiText as="h3" variant="headline" weight="semibold" :lines="1">{{ c.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ c.role }} · {{ c.company }}</MiText>
          </div>
          <MiBadge v-if="isDue(c)" tone="warning" label="Due" dot />
        </div>

        <div class="kt__cadence">
          <span class="kt__cadence-row">
            <MiText variant="caption" tone="label2">{{ c.days === 0 ? 'Talked today' : c.days + ' days since ' + c.last }}</MiText>
            <MiText variant="caption" tone="label3">every {{ c.every }} days</MiText>
          </span>
          <div
            class="kt__bar" role="meter" :aria-label="'Time since last contact with ' + c.name"
            :aria-valuenow="c.days" aria-valuemin="0" :aria-valuemax="c.every" :aria-valuetext="c.days + ' of ' + c.every + ' days'"
          >
            <span :style="{ transform: `scaleX(${Math.min(c.days / c.every, 1)})` }" />
          </div>
        </div>

        <MiText variant="footnote" tone="label2" :lines="2" class="kt__note">{{ c.note }}</MiText>

        <div class="kt__acts">
          <MiButton variant="gray" size="small" @click="log(c)">
            <template #leading><MiIcon name="check" :size="14" /></template>
            Log catch-up
          </MiButton>
          <MiIconButton :label="'Message ' + c.name" variant="plain" size="small"><MiIcon name="chat" :size="17" /></MiIconButton>
          <MiIconButton :label="'Schedule with ' + c.name" variant="plain" size="small"><MiIcon name="calendar" :size="17" /></MiIconButton>
        </div>
      </li>
    </ul>
    <p class="kt__status" role="status">{{ status }}</p>
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

<style scoped>
.kt { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.kt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.kt__grid { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 600px) { .kt__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 940px) { .kt__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.kt__card { display: grid; align-content: start; gap: 14px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.kt__top { display: flex; align-items: center; gap: 12px; }
.kt__id { flex: 1; min-width: 0; }
.kt__cadence { display: grid; gap: 6px; }
.kt__cadence-row { display: flex; justify-content: space-between; gap: 8px; }
.kt__bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.kt__bar span { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.kt__card.is-due .kt__bar span { background: var(--mi-orange); }
.kt__note { min-height: 2.6em; }
.kt__acts { display: flex; align-items: center; gap: 4px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.kt__acts > :first-child { margin-right: auto; }
.kt__status { margin: 0; min-height: 18px; font-size: 13px; color: var(--mi-label2); }
</style>
