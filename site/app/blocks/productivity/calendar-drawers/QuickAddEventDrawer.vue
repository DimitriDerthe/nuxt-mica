<template>
  <section class="mi:@container mi:font-mi mi:text-label" aria-labelledby="qad-title">
    <MiText id="qad-title" variant="title3" as="h2" weight="semibold" class="mi:overflow-hidden mi:whitespace-nowrap mi:absolute mi:w-px mi:h-px mi:[clip-path:inset(50%)]">Quick add event drawer</MiText>

    <div class="mi:grid mi:gap-4 mi:@[820px]:grid-cols-[minmax(0,_1fr)_minmax(380px,_420px)] mi:@[820px]:items-start mi:@[820px]:gap-5">
      <!-- Faux day view behind the drawer: the draft shows up as a dashed ghost while you edit. -->
      <div class="mi:relative mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1 mi:after:content-[''] mi:after:absolute mi:after:inset-0 mi:after:rounded-[inherit] mi:after:bg-scrim mi:after:opacity-30 mi:after:pointer-events-none" aria-hidden="true">
        <div class="mi:grid">
          <span class="mi:text-[12px] mi:font-semibold mi:uppercase mi:tracking-[.06em] mi:text-label2">{{ day.weekday }}</span>
          <span class="mi:text-[22px] mi:font-bold mi:tracking-[-.02em]">November {{ day.date }}</span>
        </div>
        <div class="mi:grid mi:grid-cols-[44px_minmax(0,_1fr)] mi:auto-rows-[9px] mi:gap-x-2.5">
          <span v-for="h in hours" :key="h" class="mi:col-[1] mi:text-[11px] mi:text-label3 mi:tabular-nums mi:border-t mi:border-t-sep mi:pt-0.5" :style="{ gridRow: `${(h - 8) * 4 + 1} / span 4` }">{{ h }}:00</span>
          <span v-for="e in dayEvents" :key="e.title" class="mi:col-[2] mi:z-1 mi:min-w-0 mi:my-px mi:mx-0 mi:py-[3px] mi:px-2 mi:overflow-hidden mi:rounded-sm mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:text-ellipsis mi:bg-fill3 mi:text-label2" :style="slot(e.start, e.minutes)">{{ e.title }}</span>
          <span class="mi:col-[2] mi:min-w-0 mi:my-px mi:mx-0 mi:py-[3px] mi:px-2 mi:overflow-hidden mi:rounded-sm mi:text-[12px] mi:font-semibold mi:whitespace-nowrap mi:text-ellipsis mi:z-2 mi:[border:1.5px_dashed_var(--mi-p)]" :class="clash ? 'mi:border-orange mi:[background:color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)] mi:text-orange-t' : 'mi:bg-p-tint mi:text-p-text'" :style="slot(start, duration)">{{ title || 'New event' }}</span>
        </div>
      </div>

      <div>
        <MiDrawer :model-value="true" inline show-swipe-handle title="New event" :description="summary">
          <div class="mi:grid mi:gap-4">
            <MiField label="Title" :error="touched && !title.trim() ? 'Give the event a name.' : undefined">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="title" :aria-describedby="describedBy" placeholder="Design review" />
              </template>
            </MiField>

            <div class="mi:grid mi:gap-2 mi:min-w-0" role="group" aria-labelledby="qad-day-label">
              <MiText id="qad-day-label" variant="footnote" weight="semibold" tone="label2">Day</MiText>
              <div class="mi:grid mi:grid-cols-5 mi:gap-1.5">
                <button
                  v-for="d in week" :key="d.date" type="button" class="mi:[font:inherit] mi:text-[12px] mi:grid mi:justify-items-center mi:gap-0.5 mi:py-2 mi:px-0 mi:border mi:rounded-md mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
                  :class="d.date === dayDate ? 'mi:border-p mi:bg-p-tint mi:text-p-text' : 'mi:border-sep mi:bg-transparent mi:text-label2'" :aria-pressed="d.date === dayDate" @click="dayDate = d.date"
                >
                  <span>{{ d.weekday.slice(0, 3) }}</span><strong class="mi:text-[16px]" :class="d.date === dayDate ? 'mi:text-p-text' : 'mi:text-label'">{{ d.date }}</strong>
                </button>
              </div>
            </div>

            <div class="mi:grid mi:gap-4 mi:@[520px]:grid-cols-[auto_minmax(0,_1fr)]">
              <div class="mi:grid mi:gap-2 mi:min-w-0">
                <MiText variant="footnote" weight="semibold" tone="label2">Starts</MiText>
                <MiTimePicker v-model="startText" :minute-step="15" min="08:00" max="18:00" label="Start time" />
              </div>
              <div class="mi:grid mi:gap-2 mi:min-w-0">
                <MiText variant="footnote" weight="semibold" tone="label2">Duration</MiText>
                <MiSegmented v-model="durationPick" label="Duration" :options="durations" />
              </div>
            </div>

            <MiAlert
              v-if="clash" tone="warning" :title="'Overlaps ' + clash.title"
              :message="next !== null ? 'The next free ' + duration + ' minutes start at ' + clock(next) + '.' : 'No free slot left this day.'"
              :action-label="next !== null ? 'Move to ' + clock(next) : undefined" @action="moveToNext"
            />

            <div class="mi:grid mi:gap-2 mi:min-w-0">
              <MiText variant="footnote" weight="semibold" tone="label2">Calendar</MiText>
              <MiToggleGroup v-model="calendar" :options="calendars" label="Calendar" variant="outline" size="sm" />
            </div>
          </div>

          <template #footer>
            <div class="mi:grid mi:grid-cols-[1fr_1fr] mi:gap-2">
              <MiButton variant="gray" block @click="reset">Discard</MiButton>
              <MiButton block :disabled="!!clash" @click="save">Add to calendar</MiButton>
            </div>
          </template>
        </MiDrawer>
        <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ saved }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface CalEvent { title: string, start: number, minutes: number }
interface WeekDay { date: number, weekday: string }

const OPEN = 8 * 60
const CLOSE = 19 * 60
const hours = Array.from({ length: (CLOSE - OPEN) / 60 }, (_, i) => 8 + i)

const week: WeekDay[] = [
  { date: 2, weekday: 'Monday' }, { date: 3, weekday: 'Tuesday' }, { date: 4, weekday: 'Wednesday' },
  { date: 5, weekday: 'Thursday' }, { date: 6, weekday: 'Friday' }
]

// Sample busy times per day of the week (minutes from midnight); swap for your calendar feed.
const busy = ref<Record<number, CalEvent[]>>({
  2: [{ title: 'Weekly planning', start: 570, minutes: 60 }, { title: 'Lunch with Priya', start: 750, minutes: 60 }],
  3: [{ title: 'Customer call · Halden', start: 600, minutes: 45 }, { title: 'Sprint demo', start: 900, minutes: 60 }],
  4: [{ title: 'Hiring panel', start: 540, minutes: 120 }, { title: 'Roadmap sync', start: 840, minutes: 30 }, { title: '1:1 Marcus', start: 900, minutes: 30 }],
  5: [{ title: 'Design crit', start: 660, minutes: 60 }, { title: 'Ops review', start: 960, minutes: 45 }],
  6: [{ title: 'Team retro', start: 900, minutes: 60 }]
})

const durations = [{ value: 15, label: '15m' }, { value: 30, label: '30m' }, { value: 45, label: '45m' }, { value: 60, label: '1h' }]
const calendars = [{ value: 'work', label: 'Work' }, { value: 'focus', label: 'Focus' }, { value: 'personal', label: 'Personal' }]

const title = ref('Pricing page review')
const dayDate = ref(4)
const startText = ref<string | null>('14:00')
const durationPick = ref<string | number | null>(45)
const calendar = ref<string | number | (string | number)[] | null>('work')
const touched = ref(false)
const saved = ref('')

const day = computed<WeekDay>(() => week.find(d => d.date === dayDate.value) ?? week[0]!)
const dayEvents = computed<CalEvent[]>(() => busy.value[dayDate.value] ?? [])
const duration = computed(() => Number(durationPick.value ?? 30))
const start = computed(() => {
  const [h = '9', m = '0'] = (startText.value ?? '09:00').split(':')
  return Number(h) * 60 + Number(m)
})

const overlap = (t: number, len: number): CalEvent | undefined => dayEvents.value.find(e => t < e.start + e.minutes && e.start < t + len)
const clash = computed(() => overlap(start.value, duration.value))
const next = computed<number | null>(() => {
  for (let t = start.value; t + duration.value <= CLOSE; t += 15) if (!overlap(t, duration.value)) return t
  return null
})

const clock = (min: number): string => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`
const summary = computed(() => `${day.value.weekday}, November ${day.value.date} · ${clock(start.value)} – ${clock(start.value + duration.value)}`)
// Grid rows are 15-minute steps from opening time.
const slot = (t: number, len: number) => ({ gridRow: `${(t - OPEN) / 15 + 1} / span ${Math.max(1, len / 15)}` })

function moveToNext() {
  if (next.value !== null) startText.value = `${String(Math.floor(next.value / 60)).padStart(2, '0')}:${String(next.value % 60).padStart(2, '0')}`
}
function save() {
  touched.value = true
  if (!title.value.trim() || clash.value) return
  busy.value[dayDate.value] = [...dayEvents.value, { title: title.value.trim(), start: start.value, minutes: duration.value }]
  saved.value = `Added ${title.value.trim()} on ${summary.value}.`
  title.value = ''
  touched.value = false
}
function reset() {
  title.value = ''
  touched.value = false
  saved.value = ''
}
</script>

