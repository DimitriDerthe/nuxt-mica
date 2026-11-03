<template>
  <section class="cag mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="cag-title">
    <!-- Calendar header built from three groups: date pager, view switch, split create button. -->
    <header class="cag__bar mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-3">
      <div class="cag__nav mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5">
        <MiButtonGroup label="Move through dates">
          <MiIconButton size="toolbar" variant="gray" :label="'Previous ' + view" @click="move(-1)"><MiIcon name="chevron-left" /></MiIconButton>
          <MiButton size="small" variant="gray" :disabled="isToday" @click="anchor = today">Today</MiButton>
          <MiIconButton size="toolbar" variant="gray" :label="'Next ' + view" @click="move(1)"><MiIcon name="chevron-right" /></MiIconButton>
        </MiButtonGroup>
        <MiText id="cag-title" variant="headline" as="h2" aria-live="polite">{{ title }}</MiText>
      </div>
      <div class="cag__tools mi:flex mi:flex-wrap mi:items-center mi:gap-y-2.5 mi:gap-x-3.5">
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

    <ol class="cag__grid mi:grid mi:gap-1.5 mi:m-0 mi:p-2 mi:[list-style:none] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" :class="'cag__grid--' + view" :aria-label="title">
      <li v-for="d in days" :key="d.key" class="cag__day mi:grid mi:content-start mi:gap-1.5 mi:min-w-0 mi:p-2 mi:rounded-md mi:[background:var(--mi-fill4)] mi:[.cag__grid--month_&]:p-1 mi:[.cag__grid--month_&]:min-h-13 mi:[.cag__grid--month_&]:justify-items-center mi:[&.is-out]:opacity-45 mi:[&.is-anchor]:shadow-[inset_0_0_0_2px_var(--mi-p)]" :class="{ 'is-out': d.out, 'is-today': d.key === todayKey, 'is-anchor': d.key === anchorKey }">
        <button type="button" class="cag__date mi:flex mi:items-baseline mi:gap-1.5 mi:p-0 mi:[border:0] mi:[background:none] mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:rounded-[6px] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:[.cag__grid--month_&]:flex-col mi:[.cag__grid--month_&]:items-center mi:[.cag__grid--month_&]:gap-0" :aria-label="d.long + ', ' + d.events.length + ' events'" :aria-pressed="d.key === anchorKey" @click="anchor = d.date">
          <span class="cag__dow mi:[.cag__grid--month_&]:hidden mi:text-[12px] mi:font-semibold mi:text-label2 mi:uppercase mi:tracking-[.04em]">{{ d.dow }}</span><span class="cag__num mi:inline-grid mi:place-items-center mi:min-w-6.5 mi:h-6.5 mi:rounded-[13px] mi:font-bold mi:tabular-nums mi:[.cag__day.is-today_&]:[background:var(--mi-p)] mi:[.cag__day.is-today_&]:text-p-on">{{ d.num }}</span>
        </button>
        <ul v-if="view !== 'month'" class="cag__events mi:grid mi:gap-1 mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="e in d.events" :key="e.id" class="cag__event mi:py-[5px] mi:px-[7px] mi:rounded-[6px] mi:text-[12px] mi:leading-[1.3] mi:wrap-anywhere mi:[background:var(--mi-p-tint)] mi:text-p-text mi:[border-inline-start:3px_solid_var(--mi-p)] mi:[&[data-kind='focus']]:[background:var(--mi-s-tint)] mi:[&[data-kind='focus']]:text-s-text mi:[&[data-kind='focus']]:border-(--mi-s) mi:[&[data-kind='one']]:[background:var(--mi-fill3)] mi:[&[data-kind='one']]:text-label mi:[&[data-kind='one']]:border-label3" :data-kind="e.kind"><b class="mi:[.cag__event_&]:font-bold mi:[.cag__event_&]:tabular-nums">{{ e.time }}</b> {{ e.title }}</li>
        </ul>
        <span v-else class="cag__dots mi:flex mi:gap-[3px]" aria-hidden="true"><i class="mi:[.cag__dots_&]:w-[5px] mi:[.cag__dots_&]:h-[5px] mi:[.cag__dots_&]:rounded-[50%] mi:[.cag__dots_&]:[background:var(--mi-p)] mi:[.cag__dots_&[data-kind='focus']]:[background:var(--mi-s)] mi:[.cag__dots_&[data-kind='one']]:[background:var(--mi-label3)]" v-for="e in d.events.slice(0, 3)" :key="e.id" :data-kind="e.kind" /></span>
      </li>
    </ol>

    <p class="cag__log mi:m-0 mi:text-[13px] mi:text-label2" aria-live="polite">{{ log }}</p>
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
.cag__grid--month { grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
@container (min-width: 720px) { .cag__grid--week { grid-template-columns: repeat(7, minmax(0, 1fr)); } }
</style>
