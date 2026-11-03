<template>
  <section class="cag" aria-labelledby="cag-title">
    <!-- Calendar header built from three groups: date pager, view switch, split create button. -->
    <header class="cag__bar">
      <div class="cag__nav">
        <MiButtonGroup label="Move through dates">
          <MiIconButton size="toolbar" variant="gray" :label="'Previous ' + view" @click="move(-1)"><MiIcon name="chevron-left" /></MiIconButton>
          <MiButton size="small" variant="gray" :disabled="isToday" @click="anchor = today">Today</MiButton>
          <MiIconButton size="toolbar" variant="gray" :label="'Next ' + view" @click="move(1)"><MiIcon name="chevron-right" /></MiIconButton>
        </MiButtonGroup>
        <MiText id="cag-title" variant="headline" as="h2" aria-live="polite">{{ title }}</MiText>
      </div>
      <div class="cag__tools">
        <MiButtonGroup v-model="view" variant="segmented" label="Calendar view" :options="views" />
        <MiButtonGroup variant="split" label="Create event">
          <MiButton size="small" @click="create(template)">
            <template #leading><MiIcon name="plus" :size="16" /></template>
            {{ templateLabel }}
          </MiButton>
          <MiMenu v-model="template" variant="popup" :items="templates" aria-label="Event type" placement="bottom-end">
            <template #trigger="{ props: tp }">
              <MiButton v-bind="tp" size="small" aria-label="Choose event type"><MiIcon name="chevron-down" :size="14" /></MiButton>
            </template>
          </MiMenu>
        </MiButtonGroup>
      </div>
    </header>

    <ol class="cag__grid" :class="'cag__grid--' + view" :aria-label="title">
      <li v-for="d in days" :key="d.key" class="cag__day" :class="{ 'is-out': d.out, 'is-today': d.key === todayKey, 'is-anchor': d.key === anchorKey }">
        <button type="button" class="cag__date" :aria-label="d.long + ', ' + d.events.length + ' events'" :aria-pressed="d.key === anchorKey" @click="anchor = d.date">
          <span class="cag__dow">{{ d.dow }}</span><span class="cag__num">{{ d.num }}</span>
        </button>
        <ul v-if="view !== 'month'" class="cag__events">
          <li v-for="e in d.events" :key="e.id" class="cag__event" :data-kind="e.kind"><b>{{ e.time }}</b> {{ e.title }}</li>
        </ul>
        <span v-else class="cag__dots" aria-hidden="true"><i v-for="e in d.events.slice(0, 3)" :key="e.id" :data-kind="e.kind" /></span>
      </li>
    </ol>

    <p class="cag__log" aria-live="polite">{{ log }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type View = 'day' | 'week' | 'month'
type Kind = 'meet' | 'focus' | 'one'
interface CalEvent { id: string, key: string, time: string, title: string, kind: Kind }

const today = new Date(2026, 10, 3)
const views = [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]
const templates = [{ value: 'meet', label: 'Meeting' }, { value: 'focus', label: 'Focus block' }, { value: 'one', label: '1:1' }]
const presets: Record<Kind, { time: string, title: string }> = {
  meet: { time: '10:00', title: 'New meeting' }, focus: { time: '13:00', title: 'Focus block' }, one: { time: '15:30', title: '1:1 with Ana' }
}
// Recurring week, keyed by weekday (0 = Sunday).
const weekly: Record<number, { time: string, title: string, kind: Kind }[]> = {
  1: [{ time: '09:30', title: 'Team standup', kind: 'meet' }],
  2: [{ time: '09:30', title: 'Team standup', kind: 'meet' }, { time: '14:00', title: 'Write launch notes', kind: 'focus' }],
  3: [{ time: '09:30', title: 'Team standup', kind: 'meet' }, { time: '11:00', title: 'Design critique', kind: 'meet' }],
  4: [{ time: '09:30', title: 'Team standup', kind: 'meet' }, { time: '16:00', title: '1:1 with Malik', kind: 'one' }],
  5: [{ time: '15:00', title: 'Sprint demo', kind: 'meet' }]
}

const view = ref<string | number | undefined>('week')
const template = ref<string | number | undefined>('meet')
const anchor = ref(today)
const added = ref<CalEvent[]>([])
const log = ref('Page through dates, switch views or add an event to the selected day.')

const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
const shift = (d: Date, days: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + days)
const todayKey = keyOf(today)
const anchorKey = computed(() => keyOf(anchor.value))
const isToday = computed(() => anchorKey.value === todayKey)
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', o)

const range = computed(() => {
  const a = anchor.value
  if (view.value === 'day') return [a]
  if (view.value === 'week') { const start = shift(a, -((a.getDay() + 6) % 7)); return Array.from({ length: 7 }, (_, i) => shift(start, i)) }
  const first = new Date(a.getFullYear(), a.getMonth(), 1)
  const start = shift(first, -((first.getDay() + 6) % 7))
  const weeks = Math.ceil(((first.getDay() + 6) % 7 + new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate()) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => shift(start, i))
})

const days = computed(() => range.value.map((date) => {
  const key = keyOf(date)
  const events = [
    ...(weekly[date.getDay()] ?? []).map((e, i) => ({ ...e, id: `${key}-${i}`, key })),
    ...added.value.filter(e => e.key === key)
  ].sort((x, y) => x.time.localeCompare(y.time))
  return { date, key, events, out: view.value === 'month' && date.getMonth() !== anchor.value.getMonth(), dow: fmt(date, { weekday: 'short' }), num: date.getDate(), long: fmt(date, { weekday: 'long', month: 'long', day: 'numeric' }) }
}))

const title = computed(() => {
  const r = range.value
  if (view.value === 'day') return fmt(anchor.value, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  if (view.value === 'month') return fmt(anchor.value, { month: 'long', year: 'numeric' })
  const a = r[0]!, b = r[6]!
  return `${fmt(a, { month: 'short', day: 'numeric' })} – ${fmt(b, a.getMonth() === b.getMonth() ? { day: 'numeric' } : { month: 'short', day: 'numeric' })}, ${b.getFullYear()}`
})
const templateLabel = computed(() => 'New ' + (templates.find(t => t.value === template.value)?.label ?? 'event').toLowerCase())

function move(dir: number) {
  const a = anchor.value
  anchor.value = view.value === 'month' ? new Date(a.getFullYear(), a.getMonth() + dir, 1) : shift(a, dir * (view.value === 'week' ? 7 : 1))
}
function create(kind: string | number | undefined) {
  const k: Kind = kind === 'focus' || kind === 'one' ? kind : 'meet'
  added.value = [...added.value, { id: 'n' + added.value.length, key: anchorKey.value, kind: k, ...presets[k] }]
  log.value = `${presets[k].title} added on ${fmt(anchor.value, { weekday: 'long', month: 'short', day: 'numeric' })} at ${presets[k].time}.`
}
</script>

<style scoped>
.cag { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.cag__bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; }
.cag__nav, .cag__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; }

.cag__grid { display: grid; gap: 6px; margin: 0; padding: 8px; list-style: none; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cag__grid--month { grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
@container (min-width: 720px) { .cag__grid--week { grid-template-columns: repeat(7, minmax(0, 1fr)); } }

.cag__day { display: grid; align-content: start; gap: 6px; min-width: 0; padding: 8px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.cag__grid--month .cag__day { padding: 4px; min-height: 52px; justify-items: center; }
.cag__day.is-out { opacity: .45; }
.cag__day.is-anchor { box-shadow: inset 0 0 0 2px var(--mi-p); }
.cag__date { display: flex; align-items: baseline; gap: 6px; padding: 0; border: 0; background: none; font: inherit; color: inherit; cursor: pointer; border-radius: 6px; }
.cag__date:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.cag__grid--month .cag__date { flex-direction: column; align-items: center; gap: 0; }
.cag__grid--month .cag__dow { display: none; }
.cag__dow { font-size: 12px; font-weight: 600; color: var(--mi-label2); text-transform: uppercase; letter-spacing: .04em; }
.cag__num { display: inline-grid; place-items: center; min-width: 26px; height: 26px; border-radius: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.cag__day.is-today .cag__num { background: var(--mi-p); color: var(--mi-p-on); }

.cag__events { display: grid; gap: 4px; margin: 0; padding: 0; list-style: none; }
.cag__event { padding: 5px 7px; border-radius: 6px; font-size: 12px; line-height: 1.3; overflow-wrap: anywhere; background: var(--mi-p-tint); color: var(--mi-p-text); border-inline-start: 3px solid var(--mi-p); }
.cag__event[data-kind="focus"] { background: var(--mi-s-tint); color: var(--mi-s-text); border-color: var(--mi-s); }
.cag__event[data-kind="one"] { background: var(--mi-fill3); color: var(--mi-label); border-color: var(--mi-label3); }
.cag__event b { font-weight: 700; font-variant-numeric: tabular-nums; }
.cag__dots { display: flex; gap: 3px; }
.cag__dots i { width: 5px; height: 5px; border-radius: 50%; background: var(--mi-p); }
.cag__dots i[data-kind="focus"] { background: var(--mi-s); }
.cag__dots i[data-kind="one"] { background: var(--mi-label3); }

.cag__log { margin: 0; font-size: 13px; color: var(--mi-label2); }
</style>
