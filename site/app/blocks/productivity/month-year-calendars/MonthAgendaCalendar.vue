<template>
  <section class="mac" aria-labelledby="mac-title">
    <header class="mac__head">
      <div class="mac__nav">
        <MiIconButton size="small" variant="gray" label="Previous month" :disabled="month === 0" @click="month--"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
        <MiText id="mac-title" variant="title3" as="h2" weight="semibold" aria-live="polite">{{ monthName }}</MiText>
        <MiIconButton size="small" variant="gray" label="Next month" :disabled="month === months.length - 1" @click="month++"><MiIcon name="chevron-right" :size="16" /></MiIconButton>
      </div>
      <div class="mac__filters" role="group" aria-label="Calendars">
        <MiChip v-for="c in calendars" :key="c.id" v-model="visible[c.id]" selectable size="small" tone="neutral">
          <span class="mac__swatch" :class="'is-' + c.id" aria-hidden="true" />{{ c.label }}
        </MiChip>
      </div>
    </header>

    <div class="mac__layout">
      <!-- Month grid: dots on phones, titled chips once there is room. -->
      <div class="mac__month">
        <div class="mac__weekdays" aria-hidden="true"><span v-for="w in weekdays" :key="w">{{ w }}</span></div>
        <div class="mac__grid" role="group" :aria-label="monthName">
          <div v-for="(week, wi) in weeks" :key="wi" class="mac__week">
            <button
              v-for="d in week" :key="d.key" type="button" class="mac__day"
              :class="{ 'is-out': !d.inMonth, 'is-today': d.key === TODAY, 'is-on': d.key === selected }"
              :aria-pressed="d.key === selected" :aria-label="d.label + (d.events.length ? ', ' + d.events.length + ' events' : '')"
              @click="selected = d.key"
            >
              <span class="mac__num">{{ d.date }}</span>
              <span class="mac__dots" aria-hidden="true"><i v-for="e in d.events.slice(0, 3)" :key="e.title" :class="'is-' + e.cal" /></span>
              <span class="mac__chips" aria-hidden="true">
                <span v-for="e in d.events.slice(0, 2)" :key="e.title" class="mac__chip" :class="'is-' + e.cal">{{ e.title }}</span>
                <span v-if="d.events.length > 2" class="mac__more">+{{ d.events.length - 2 }} more</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Agenda of the selected day. -->
      <aside class="mac__agenda" aria-labelledby="mac-agenda-title">
        <MiText id="mac-agenda-title" variant="headline" as="h3">{{ selectedLabel }}</MiText>
        <ol v-if="selectedEvents.length" class="mac__list">
          <li v-for="e in selectedEvents" :key="e.title" class="mac__item" :class="'is-' + e.cal">
            <span class="mac__time">{{ e.time }}</span>
            <span class="mac__item-title">{{ e.title }}</span>
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
.mac { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.mac__head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.mac__nav { display: flex; align-items: center; gap: 10px; }
.mac__nav h2 { min-width: 9.5em; margin: 0; text-align: center; }
.mac__filters { display: flex; flex-wrap: wrap; gap: 6px; }
.mac__swatch { display: inline-block; width: 8px; height: 8px; margin-right: 6px; border-radius: 50%; }

.is-team { --c: var(--mi-p); }
.is-travel { --c: var(--mi-orange); }
.is-personal { --c: var(--mi-green); }
.mac__swatch, .mac__dots i { background: var(--c); }

.mac__layout { display: grid; gap: 16px; }
.mac__month { padding: 12px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mac__weekdays, .mac__week { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.mac__weekdays span { padding: 4px 0 8px; font-size: 11px; font-weight: 600; text-align: center; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label3); }
.mac__grid { display: grid; gap: 2px; }
.mac__week { gap: 2px; }

.mac__day {
  display: grid; justify-items: center; align-content: start; gap: 4px; min-width: 0; min-height: 52px; padding: 6px 2px;
  border: 0; border-radius: var(--mi-radius-m); background: transparent; font: inherit; color: inherit; cursor: pointer;
}
.mac__day:hover { background: var(--mi-fill4); }
.mac__day:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }
.mac__day.is-out { color: var(--mi-label3); }
.mac__day.is-on { background: var(--mi-p-tint); }
.mac__num { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mac__day.is-today .mac__num { background: var(--mi-p); color: var(--mi-p-on); }
.mac__dots { display: flex; gap: 3px; min-height: 5px; }
.mac__dots i { width: 5px; height: 5px; border-radius: 50%; }
.mac__chips { display: none; }

.mac__agenda { display: grid; align-content: start; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.mac__agenda h3 { margin: 0; }
.mac__list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.mac__item { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 10px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--c) 10%, transparent); box-shadow: inset 3px 0 0 var(--c); }
.mac__time { font-size: 13px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.mac__item-title { font-size: 14px; font-weight: 600; }

@container (min-width: 720px) {
  .mac__day { justify-items: stretch; min-height: 92px; padding: 6px; }
  .mac__num { justify-self: start; }
  .mac__dots { display: none; }
  .mac__chips { display: grid; gap: 3px; min-width: 0; }
  .mac__chip { padding: 2px 6px; overflow: hidden; border-radius: 4px; font-size: 11px; font-weight: 600; text-align: start; white-space: nowrap; text-overflow: ellipsis; background: color-mix(in srgb, var(--c) 14%, transparent); }
  .mac__more { padding-left: 6px; font-size: 11px; text-align: start; color: var(--mi-label2); }
}
@container (min-width: 1000px) { .mac__layout { grid-template-columns: minmax(0, 1fr) 280px; align-items: start; } }
</style>
