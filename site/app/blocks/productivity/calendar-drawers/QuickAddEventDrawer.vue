<template>
  <section class="qad" aria-labelledby="qad-title">
    <MiText id="qad-title" variant="title3" as="h2" weight="semibold" class="qad__sr">Quick add event drawer</MiText>

    <div class="qad__stage">
      <!-- Faux day view behind the drawer: the draft shows up as a dashed ghost while you edit. -->
      <div class="qad__page" aria-hidden="true">
        <div class="qad__page-head">
          <span class="qad__eyebrow">{{ day.weekday }}</span>
          <span class="qad__date">November {{ day.date }}</span>
        </div>
        <div class="qad__day">
          <span v-for="h in hours" :key="h" class="qad__hour" :style="{ gridRow: `${(h - 8) * 4 + 1} / span 4` }">{{ h }}:00</span>
          <span v-for="e in dayEvents" :key="e.title" class="qad__ev" :style="slot(e.start, e.minutes)">{{ e.title }}</span>
          <span class="qad__ev qad__ev--draft" :class="{ 'is-clash': clash }" :style="slot(start, duration)">{{ title || 'New event' }}</span>
        </div>
      </div>

      <div class="qad__drawer">
        <MiDrawer :model-value="true" inline show-swipe-handle title="New event" :description="summary">
          <div class="qad__body">
            <MiField label="Title" :error="touched && !title.trim() ? 'Give the event a name.' : undefined">
              <template #default="{ id, describedBy }">
                <MiInput :id="id" v-model="title" :aria-describedby="describedBy" placeholder="Design review" />
              </template>
            </MiField>

            <div class="qad__group" role="group" aria-labelledby="qad-day-label">
              <MiText id="qad-day-label" variant="footnote" weight="semibold" tone="label2">Day</MiText>
              <div class="qad__days">
                <button
                  v-for="d in week" :key="d.date" type="button" class="qad__daybtn"
                  :class="{ 'is-on': d.date === dayDate }" :aria-pressed="d.date === dayDate" @click="dayDate = d.date"
                >
                  <span>{{ d.weekday.slice(0, 3) }}</span><strong>{{ d.date }}</strong>
                </button>
              </div>
            </div>

            <div class="qad__when">
              <div class="qad__group">
                <MiText variant="footnote" weight="semibold" tone="label2">Starts</MiText>
                <MiTimePicker v-model="startText" :minute-step="15" min="08:00" max="18:00" label="Start time" />
              </div>
              <div class="qad__group">
                <MiText variant="footnote" weight="semibold" tone="label2">Duration</MiText>
                <MiSegmented v-model="durationPick" label="Duration" :options="durations" />
              </div>
            </div>

            <MiAlert
              v-if="clash" tone="warning" :title="'Overlaps ' + clash.title"
              :message="next !== null ? 'The next free ' + duration + ' minutes start at ' + clock(next) + '.' : 'No free slot left this day.'"
              :action-label="next !== null ? 'Move to ' + clock(next) : undefined" @action="moveToNext"
            />

            <div class="qad__group">
              <MiText variant="footnote" weight="semibold" tone="label2">Calendar</MiText>
              <MiToggleGroup v-model="calendar" :options="calendars" label="Calendar" variant="outline" size="sm" />
            </div>
          </div>

          <template #footer>
            <div class="qad__foot">
              <MiButton variant="gray" block @click="reset">Discard</MiButton>
              <MiButton block :disabled="!!clash" @click="save">Add to calendar</MiButton>
            </div>
          </template>
        </MiDrawer>
        <p class="qad__live" aria-live="polite">{{ saved }}</p>
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

<style scoped>
.qad { container-type: inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.qad__sr, .qad__live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.qad__stage { display: grid; gap: 16px; }

.qad__page { position: relative; display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.qad__page::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: var(--mi-scrim); opacity: .3; pointer-events: none; }
.qad__page-head { display: grid; }
.qad__eyebrow { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--mi-label2); }
.qad__date { font-size: 22px; font-weight: 700; letter-spacing: -.02em; }
.qad__day { display: grid; grid-template-columns: 44px minmax(0, 1fr); grid-auto-rows: 9px; column-gap: 10px; }
.qad__hour { grid-column: 1; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; border-top: 1px solid var(--mi-sep); padding-top: 2px; }
.qad__ev {
  grid-column: 2; z-index: 1; min-width: 0; margin: 1px 0; padding: 3px 8px; overflow: hidden; border-radius: var(--mi-radius-s);
  font-size: 12px; font-weight: 600; white-space: nowrap; text-overflow: ellipsis;
  background: var(--mi-fill3); color: var(--mi-label2);
}
.qad__ev--draft { z-index: 2; border: 1.5px dashed var(--mi-p); background: var(--mi-p-tint); color: var(--mi-p-text); }
.qad__ev--draft.is-clash { border-color: var(--mi-orange); background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }

.qad__body { display: grid; gap: 16px; }
.qad__group { display: grid; gap: 8px; min-width: 0; }
.qad__days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.qad__daybtn {
  display: grid; justify-items: center; gap: 2px; padding: 8px 0; border: 1px solid var(--mi-sep); border-radius: var(--mi-radius-m);
  background: transparent; font: inherit; font-size: 12px; color: var(--mi-label2); cursor: pointer;
}
.qad__daybtn strong { font-size: 16px; color: var(--mi-label); }
.qad__daybtn.is-on { border-color: var(--mi-p); background: var(--mi-p-tint); color: var(--mi-p-text); }
.qad__daybtn.is-on strong { color: var(--mi-p-text); }
.qad__daybtn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.qad__when { display: grid; gap: 16px; }
.qad__foot { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

@container (min-width: 520px) { .qad__when { grid-template-columns: auto minmax(0, 1fr); } }
@container (min-width: 820px) { .qad__stage { grid-template-columns: minmax(0, 1fr) minmax(380px, 420px); align-items: start; gap: 20px; } }
</style>
