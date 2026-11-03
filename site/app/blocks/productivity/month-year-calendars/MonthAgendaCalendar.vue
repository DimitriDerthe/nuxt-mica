<template>
  <section class="mac mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="mac-title">
    <header class="mac__head mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <div class="mac__nav mi:flex mi:items-center mi:gap-2.5">
        <MiIconButton class="mi:[.mac__nav_h2&]:min-w-[9.5em]" size="small" variant="gray" label="Previous month" :disabled="month === 0" @click="month--"><MiIcon class="mi:[.mac__nav_h2&]:min-w-[9.5em]" name="chevron-left" :size="16" /></MiIconButton>
        <MiText class="mi:[.mac__nav_h2&]:min-w-[9.5em]" id="mac-title" variant="title3" as="h2" weight="semibold" aria-live="polite">{{ monthName }}</MiText>
        <MiIconButton class="mi:[.mac__nav_h2&]:min-w-[9.5em]" size="small" variant="gray" label="Next month" :disabled="month === months.length - 1" @click="month++"><MiIcon class="mi:[.mac__nav_h2&]:min-w-[9.5em]" name="chevron-right" :size="16" /></MiIconButton>
      </div>
      <div class="mac__filters mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Calendars">
        <MiChip v-for="c in calendars" :key="c.id" v-model="visible[c.id]" selectable size="small" tone="neutral">
          <span class="mac__swatch mi:inline-block mi:w-2 mi:h-2 mi:mr-1.5 mi:rounded-[50%] mi:[background:var(--c)]" :class="'is-' + c.id" aria-hidden="true" />{{ c.label }}
        </MiChip>
      </div>
    </header>

    <div class="mac__layout mi:grid mi:gap-4 mi:@[1000px]:grid-cols-[minmax(0,_1fr)_280px] mi:@[1000px]:items-start">
      <!-- Month grid: dots on phones, titled chips once there is room. -->
      <div class="mac__month mi:p-3 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
        <div class="mac__weekdays mi:grid mi:grid-cols-7" aria-hidden="true"><span class="mi:[.mac__weekdays_&]:pt-1 mi:[.mac__weekdays_&]:px-0 mi:[.mac__weekdays_&]:pb-2 mi:[.mac__weekdays_&]:text-[11px] mi:[.mac__weekdays_&]:font-semibold mi:[.mac__weekdays_&]:uppercase mi:[.mac__weekdays_&]:tracking-[.05em] mi:[.mac__weekdays_&]:text-label3" v-for="w in weekdays" :key="w">{{ w }}</span></div>
        <div class="mac__grid mi:grid mi:gap-0.5" role="group" :aria-label="monthName">
          <div v-for="(week, wi) in weeks" :key="wi" class="mac__week mi:grid mi:grid-cols-7 mi:gap-0.5">
            <button
              v-for="d in week" :key="d.key" type="button" class="mac__day mi:grid mi:justify-items-center mi:content-start mi:gap-1 mi:min-w-0 mi:min-h-13 mi:py-1.5 mi:px-0.5 mi:[border:0] mi:rounded-md mi:[background:transparent] mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px] mi:[&.is-out]:text-label3 mi:@[720px]:justify-items-stretch mi:@[720px]:min-h-23 mi:@[720px]:p-1.5"
              :class="{ 'is-out': !d.inMonth, 'is-today': d.key === TODAY, 'is-on': d.key === selected }"
              :aria-pressed="d.key === selected" :aria-label="d.label + (d.events.length ? ', ' + d.events.length + ' events' : '')"
              @click="selected = d.key"
            >
              <span class="mac__num mi:grid mi:place-items-center mi:w-6.5 mi:h-6.5 mi:rounded-[50%] mi:text-[13px] mi:font-semibold mi:tabular-nums mi:[.mac__day.is-today_&]:[background:var(--mi-p)] mi:[.mac__day.is-today_&]:text-p-on mi:@[720px]:justify-self-start">{{ d.date }}</span>
              <span class="mac__dots mi:flex mi:gap-[3px] mi:min-h-[5px] mi:@[720px]:hidden" aria-hidden="true"><i class="mi:[.mac__dots_&]:[background:var(--c)] mi:[.mac__dots_&]:w-[5px] mi:[.mac__dots_&]:h-[5px] mi:[.mac__dots_&]:rounded-[50%]" v-for="e in d.events.slice(0, 3)" :key="e.title" :class="'is-' + e.cal" /></span>
              <span class="mac__chips mi:hidden mi:@[720px]:grid mi:@[720px]:gap-[3px] mi:@[720px]:min-w-0" aria-hidden="true">
                <span v-for="e in d.events.slice(0, 2)" :key="e.title" class="mac__chip mi:@[720px]:py-0.5 mi:@[720px]:px-1.5 mi:@[720px]:overflow-hidden mi:@[720px]:rounded-[4px] mi:@[720px]:text-[11px] mi:@[720px]:font-semibold mi:@[720px]:text-start mi:@[720px]:whitespace-nowrap mi:@[720px]:text-ellipsis mi:@[720px]:[background:color-mix(in_srgb,_var(--c)_14%,_transparent)]" :class="'is-' + e.cal">{{ e.title }}</span>
                <span v-if="d.events.length > 2" class="mac__more mi:@[720px]:pl-1.5 mi:@[720px]:text-[11px] mi:@[720px]:text-start mi:@[720px]:text-label2">+{{ d.events.length - 2 }} more</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Agenda of the selected day. -->
      <aside class="mac__agenda mi:grid mi:content-start mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-labelledby="mac-agenda-title">
        <MiText id="mac-agenda-title" variant="headline" as="h3">{{ selectedLabel }}</MiText>
        <ol v-if="selectedEvents.length" class="mac__list mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="e in selectedEvents" :key="e.title" class="mac__item mi:grid mi:grid-cols-[56px_minmax(0,_1fr)] mi:gap-2.5 mi:py-2.5 mi:px-3 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--c)_10%,_transparent)] mi:shadow-[inset_3px_0_0_var(--c)]" :class="'is-' + e.cal">
            <span class="mac__time mi:text-[13px] mi:font-semibold mi:text-label2 mi:tabular-nums">{{ e.time }}</span>
            <span class="mac__item-title mi:text-[14px] mi:font-semibold">{{ e.title }}</span>
          </li>
        </ol>
        <MiText v-else variant="footnote" tone="label2">Nothing planned. A good day for deep work.</MiText>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type CalId = 'team' | 'travel' | 'personal'
interface CalEvent { title: string, time: string, cal: CalId }
interface Day { key: string, date: number, inMonth: boolean, label: string, events: CalEvent[] }

const TODAY = '2026-11-3'
const months = [{ y: 2026, m: 10 }, { y: 2026, m: 11 }, { y: 2027, m: 0 }]
const month = ref(0)
const selected = ref(TODAY)
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const calendars: { id: CalId, label: string }[] = [{ id: 'team', label: 'Team' }, { id: 'travel', label: 'Travel' }, { id: 'personal', label: 'Personal' }]
const visible = reactive<Record<CalId, boolean>>({ team: true, travel: true, personal: true })

// Sample events keyed by y-m-d (month 1-based, no padding); swap for your calendar API.
const events: Record<string, CalEvent[]> = {
  '2026-11-3': [{ title: 'Sprint planning', time: '9:30', cal: 'team' }, { title: 'Dentist', time: '17:15', cal: 'personal' }],
  '2026-11-5': [{ title: 'Design crit', time: '11:00', cal: 'team' }],
  '2026-11-9': [{ title: 'Train to Lyon', time: '7:42', cal: 'travel' }, { title: 'Client workshop', time: '10:00', cal: 'team' }, { title: 'Dinner with Hugo', time: '20:00', cal: 'personal' }],
  '2026-11-10': [{ title: 'Return train', time: '18:04', cal: 'travel' }],
  '2026-11-12': [{ title: 'Quarterly review', time: '14:00', cal: 'team' }],
  '2026-11-17': [{ title: 'Board deck due', time: '12:00', cal: 'team' }, { title: 'Climbing', time: '19:00', cal: 'personal' }],
  '2026-11-20': [{ title: 'Offsite day 1', time: '9:00', cal: 'team' }, { title: 'Flight to Lisbon', time: '6:55', cal: 'travel' }],
  '2026-11-24': [{ title: 'Hiring panel', time: '15:00', cal: 'team' }],
  '2026-11-27': [{ title: 'Mum\'s birthday', time: 'All day', cal: 'personal' }],
  '2026-12-1': [{ title: 'Roadmap kickoff', time: '10:00', cal: 'team' }],
  '2026-12-8': [{ title: 'Flight to Berlin', time: '8:10', cal: 'travel' }, { title: 'Partner summit', time: '13:00', cal: 'team' }],
  '2026-12-18': [{ title: 'Team party', time: '18:30', cal: 'team' }],
  '2026-12-24': [{ title: 'Train home', time: '11:20', cal: 'travel' }, { title: 'Family dinner', time: '19:30', cal: 'personal' }],
  '2027-1-6': [{ title: 'Planning week', time: '9:00', cal: 'team' }]
}

const keyOf = (d: Date): string => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const eventsOn = (key: string): CalEvent[] => (events[key] ?? []).filter(e => visible[e.cal])

const current = computed(() => months[month.value] ?? months[0]!)
const monthName = computed(() => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(current.value.y, current.value.m, 1)))

const weeks = computed<Day[][]>(() => {
  const { y, m } = current.value
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7 // Monday first
  const count = Math.ceil((offset + new Date(y, m + 1, 0).getDate()) / 7) * 7
  const days: Day[] = Array.from({ length: count }, (_, i) => {
    const d = new Date(y, m, 1 - offset + i)
    const key = keyOf(d)
    return { key, date: d.getDate(), inMonth: d.getMonth() === m, label: longDate.format(d), events: eventsOn(key) }
  })
  return Array.from({ length: count / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7))
})

const selectedEvents = computed(() => eventsOn(selected.value))
const selectedLabel = computed(() => {
  const [y = 2026, m = 11, d = 3] = selected.value.split('-').map(Number)
  return (selected.value === TODAY ? 'Today · ' : '') + longDate.format(new Date(y, m - 1, d))
})
</script>

<style scoped>
.mac__nav h2 { margin: 0; text-align: center; }

.is-team { --c: var(--mi-p); }
.is-travel { --c: var(--mi-orange); }
.is-personal { --c: var(--mi-green); }
.mac__weekdays span { text-align: center; }
.mac__day:hover { background: var(--mi-fill4); }
.mac__day.is-on { background: var(--mi-p-tint); }
.mac__agenda h3 { margin: 0; }
</style>
