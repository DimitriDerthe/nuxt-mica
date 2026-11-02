<template>
  <section class="msp" aria-labelledby="msp-title">
    <div v-if="booked" class="msp__done" role="status" aria-live="polite">
      <span class="msp__done-date" aria-hidden="true"><b>{{ booked.dayNum }}</b>{{ booked.month }}</span>
      <div class="msp__done-text">
        <MiText as="h2" variant="title3" weight="semibold">You're booked with Dana</MiText>
        <MiText variant="subheadline" tone="label2">{{ booked.line }}</MiText>
        <MiText variant="footnote" tone="label3">An invite is on its way to your inbox with the {{ booked.where }} details.</MiText>
      </div>
      <div class="msp__done-actions">
        <MiButton variant="gray" @click="booked = null">Change time</MiButton>
      </div>
    </div>

    <form v-else class="msp__card" novalidate @submit.prevent="confirm">
      <aside class="msp__host">
        <div class="msp__who">
          <MiAvatar name="Dana Whitfield" size="md" tone="indigo" decorative />
          <div>
            <MiText variant="footnote" tone="label2">Dana Whitfield · Halcyon Health</MiText>
            <MiText id="msp-title" as="h2" variant="headline">Design partner review</MiText>
          </div>
        </div>

        <div class="msp__opt">
          <MiText id="msp-dur" variant="footnote" weight="semibold">Length</MiText>
          <MiToggleGroup v-model="duration" :options="durations" variant="outline" size="sm" label="Meeting length" />
        </div>
        <div class="msp__opt">
          <MiText variant="footnote" weight="semibold">Where</MiText>
          <MiSegmented v-model="where" label="Meeting place" :options="places" />
        </div>
        <MiField label="Your time zone">
          <MiCombobox v-model="zone" :options="zones" search-placeholder="Search a city" />
        </MiField>
      </aside>

      <div class="msp__pick">
        <div class="msp__days" role="group" aria-label="Day">
          <button
            v-for="(d, i) in days" :key="d.key" type="button" class="msp__day" :class="{ 'is-on': day === i }"
            :disabled="!slotsFor(i).length" :aria-pressed="day === i"
            :aria-label="d.long + (slotsFor(i).length ? ', ' + slotsFor(i).length + ' times free' : ', fully booked')"
            @click="day = i; slot = null"
          >
            <span class="msp__dow">{{ d.dow }}</span>
            <span class="msp__num">{{ d.num }}</span>
            <!-- Availability density: up to four pips. -->
            <span class="msp__pips" aria-hidden="true">
              <i v-for="p in 4" :key="p" :class="{ 'is-on': p <= Math.ceil(slotsFor(i).length / 3) }" />
            </span>
          </button>
        </div>

        <div class="msp__slots-head">
          <MiText as="h3" variant="subheadline" weight="semibold">{{ days[day]?.long }}</MiText>
          <MiText variant="caption" tone="label2">Your time · Dana's time</MiText>
        </div>
        <div v-if="slots.length" class="msp__slots" role="group" aria-label="Start time">
          <button
            v-for="s in slots" :key="s" type="button" class="msp__slot" :class="{ 'is-on': slot === s }" :aria-pressed="slot === s"
            :aria-label="fmt(s + offsetDiff) + ' your time, ' + fmt(s) + ' for Dana'" @click="slot = s"
          >
            <span class="msp__t1">{{ fmt(s + offsetDiff) }}</span>
            <span class="msp__t2">{{ fmt(s) }}</span>
          </button>
        </div>
        <MiText v-else variant="footnote" tone="label2">No {{ duration }}-minute window left that day. Try a shorter meeting.</MiText>

        <div class="msp__foot">
          <MiText v-if="error" variant="footnote" tone="red" role="alert">{{ error }}</MiText>
          <MiText v-else variant="footnote" tone="label2" aria-live="polite">{{ summary }}</MiText>
          <MiButton type="submit">Confirm</MiButton>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Val = string | number

const durations = [{ value: 15, label: '15 min' }, { value: 30, label: '30 min' }, { value: 45, label: '45 min' }, { value: 60, label: '1 hour' }]
const places = [{ value: 'video', label: 'Video' }, { value: 'phone', label: 'Phone' }]
// Host is in New York (UTC-5); offsets are hours from UTC.
const zones = [
  { value: 'paris', label: 'Paris (UTC+1)', offset: 1 },
  { value: 'london', label: 'London (UTC+0)', offset: 0 },
  { value: 'ny', label: 'New York (UTC−5)', offset: -5 },
  { value: 'chicago', label: 'Chicago (UTC−6)', offset: -6 },
  { value: 'sf', label: 'San Francisco (UTC−8)', offset: -8 },
  { value: 'dubai', label: 'Dubai (UTC+4)', offset: 4 }
]
const hostOffset = -5

// Next working days from Tue Nov 3 2026; busy blocks in host minutes from midnight.
const days = [
  { key: 'tue', dow: 'Tue', num: 3, long: 'Tuesday, November 3', busy: [[540, 660], [780, 840], [900, 1020]] },
  { key: 'wed', dow: 'Wed', num: 4, long: 'Wednesday, November 4', busy: [[600, 630], [720, 780]] },
  { key: 'thu', dow: 'Thu', num: 5, long: 'Thursday, November 5', busy: [[540, 1020]] },
  { key: 'fri', dow: 'Fri', num: 6, long: 'Friday, November 6', busy: [[540, 600], [840, 1020]] },
  { key: 'mon', dow: 'Mon', num: 9, long: 'Monday, November 9', busy: [[660, 720]] }
]
const dayStart = 540 // 09:00
const dayEnd = 1020 // 17:00

const duration = ref<Val | Val[] | null>(30)
const where = ref<Val | null>('video')
const zone = ref<Val | Val[] | null>('paris')
const day = ref(0)
const slot = ref<number | null>(null)
const error = ref('')
const booked = ref<{ dayNum: number, month: string, line: string, where: string } | null>(null)

const minutes = computed(() => (typeof duration.value === 'number' ? duration.value : 30))
const zoneInfo = computed(() => zones.find(z => z.value === zone.value) ?? zones[0]!)
const offsetDiff = computed(() => (zoneInfo.value.offset - hostOffset) * 60)

function slotsFor(i: number) {
  const busy = days[i]?.busy ?? []
  const out: number[] = []
  for (let s = dayStart; s + minutes.value <= dayEnd; s += 30) {
    if (!busy.some(([a, b]) => s < b! && s + minutes.value > a!)) out.push(s)
  }
  return out
}
const slots = computed(() => slotsFor(day.value))
// A shorter or longer meeting may invalidate the chosen time.
watch(minutes, () => { if (slot.value !== null && !slots.value.includes(slot.value)) slot.value = null })
watch(slot, () => { error.value = '' })

function fmt(m: number) {
  const t = ((m % 1440) + 1440) % 1440
  const h = Math.floor(t / 60)
  const mm = String(t % 60).padStart(2, '0')
  const shift = m >= 1440 ? ' +1' : m < 0 ? ' −1' : ''
  return `${h % 12 || 12}:${mm} ${h < 12 ? 'am' : 'pm'}${shift}`
}

const summary = computed(() => (slot.value === null
  ? 'Pick a time to continue.'
  : `${days[day.value]?.long}, ${fmt(slot.value + offsetDiff.value)} to ${fmt(slot.value + offsetDiff.value + minutes.value)}`))

function confirm() {
  if (slot.value === null) { error.value = 'Choose a start time first.'; return }
  const d = days[day.value]!
  booked.value = {
    dayNum: d.num,
    month: 'Nov',
    line: `${d.long} · ${fmt(slot.value + offsetDiff.value)} ${zoneInfo.value.label.split(' (')[0]} time · ${minutes.value} min`,
    where: where.value === 'phone' ? 'dial-in' : 'video link'
  }
}
</script>

<style scoped>
.msp { container: msp / inline-size; font-family: var(--mi-font); color: var(--mi-label); }
.msp__card { display: grid; grid-template-columns: minmax(0, 1fr); border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }
@container msp (min-width: 760px) { .msp__card { grid-template-columns: 290px minmax(0, 1fr); } .msp__host { border-right: 1px solid var(--mi-sep); border-bottom: 0; } }

.msp__host { display: grid; align-content: start; gap: 18px; padding: 20px; border-bottom: 1px solid var(--mi-sep); background: var(--mi-fill4); }
.msp__who { display: flex; align-items: center; gap: 12px; }
.msp__opt { display: grid; gap: 8px; }

.msp__pick { display: grid; align-content: start; gap: 14px; padding: 20px; min-width: 0; }
.msp__days { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 6px; }
.msp__day {
  display: grid; justify-items: center; gap: 2px; padding: 10px 4px 8px; border: 1px solid var(--mi-sep); border-radius: 14px;
  background: transparent; color: var(--mi-label); font: inherit; cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-ease);
}
.msp__day:hover:not(:disabled) { background: var(--mi-fill4); }
.msp__day:active:not(:disabled) { transform: scale(.97); }
.msp__day:disabled { cursor: not-allowed; opacity: .45; }
.msp__day.is-on { border-color: var(--mi-p); background: var(--mi-p-tint); }
.msp__day:focus-visible, .msp__slot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.msp__dow { font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--mi-label2); }
.msp__num { font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.msp__pips { display: flex; gap: 3px; margin-top: 2px; }
.msp__pips i { width: 4px; height: 4px; border-radius: 50%; background: var(--mi-fill2); }
.msp__pips i.is-on { background: var(--mi-p); }

.msp__slots-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
.msp__slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; max-height: 236px; overflow-y: auto; padding: 2px; }
.msp__slot {
  display: grid; gap: 1px; padding: 8px 10px; border: 1px solid var(--mi-sep); border-radius: 12px; background: transparent;
  font: inherit; text-align: start; color: var(--mi-label); cursor: pointer;
}
.msp__slot:hover { border-color: color-mix(in srgb, var(--mi-p) 50%, var(--mi-sep)); }
.msp__slot.is-on { border-color: var(--mi-p); background: var(--mi-p); color: var(--mi-p-on); }
.msp__t1 { font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.msp__t2 { font-size: 11.5px; opacity: .7; font-variant-numeric: tabular-nums; white-space: nowrap; }
.msp__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding-top: 14px; border-top: 1px solid var(--mi-sep); }

.msp__done { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 16px 20px; padding: 24px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.msp__done-date { display: grid; justify-items: center; width: 72px; padding: 10px 0; border-radius: 16px; background: var(--mi-p-tint); color: var(--mi-p-text); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
.msp__done-date b { font-size: 30px; line-height: 1.1; letter-spacing: -.03em; color: var(--mi-label); }
.msp__done-text { display: grid; gap: 4px; }
.msp__done-actions { grid-column: 1 / -1; }
@container msp (min-width: 640px) { .msp__done { grid-template-columns: auto minmax(0, 1fr) auto; } .msp__done-actions { grid-column: auto; } }
</style>
