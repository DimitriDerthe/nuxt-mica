<template>
  <section class="msp mi:@container/msp mi:font-mi mi:text-label" aria-labelledby="msp-title">
    <div v-if="booked" class="msp__done mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-y-4 mi:gap-x-5 mi:p-6 mi:rounded-xl mi:bg-card mi:shadow-1 mi:@[640px]/msp:grid-cols-[auto_minmax(0,_1fr)_auto]" role="status" aria-live="polite">
      <span class="msp__done-date mi:grid mi:justify-items-center mi:w-18 mi:py-2.5 mi:px-0 mi:rounded-[16px] mi:bg-p-tint mi:text-p-text mi:text-[12px] mi:font-semibold mi:uppercase mi:tracking-[.06em]" aria-hidden="true"><b class="mi:[.msp__done-date_&]:text-[30px] mi:[.msp__done-date_&]:leading-[1.1] mi:[.msp__done-date_&]:tracking-[-.03em] mi:[.msp__done-date_&]:text-label">{{ booked.dayNum }}</b>{{ booked.month }}</span>
      <div class="msp__done-text mi:grid mi:gap-1">
        <MiText as="h2" variant="title3" weight="semibold">You're booked with Dana</MiText>
        <MiText variant="subheadline" tone="label2">{{ booked.line }}</MiText>
        <MiText variant="footnote" tone="label3">An invite is on its way to your inbox with the {{ booked.where }} details.</MiText>
      </div>
      <div class="msp__done-actions mi:col-span-full mi:@[640px]/msp:col-[auto]">
        <MiButton variant="gray" @click="booked = null">Change time</MiButton>
      </div>
    </div>

    <form v-else class="msp__card mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden mi:@[760px]/msp:grid-cols-[290px_minmax(0,_1fr)]" novalidate @submit.prevent="confirm">
      <aside class="msp__host mi:@[760px]/msp:border-r mi:@[760px]/msp:border-r-sep mi:grid mi:content-start mi:gap-4.5 mi:p-5 mi:bg-fill4">
        <div class="msp__who mi:flex mi:items-center mi:gap-3">
          <MiAvatar name="Dana Whitfield" size="md" tone="indigo" decorative />
          <div>
            <MiText variant="footnote" tone="label2">Dana Whitfield · Halcyon Health</MiText>
            <MiText id="msp-title" as="h2" variant="headline">Design partner review</MiText>
          </div>
        </div>

        <div class="msp__opt mi:grid mi:gap-2">
          <MiText id="msp-dur" variant="footnote" weight="semibold">Length</MiText>
          <MiToggleGroup v-model="duration" :options="durations" variant="outline" size="sm" label="Meeting length" />
        </div>
        <div class="msp__opt mi:grid mi:gap-2">
          <MiText variant="footnote" weight="semibold">Where</MiText>
          <MiSegmented v-model="where" label="Meeting place" :options="places" />
        </div>
        <MiField label="Your time zone">
          <MiCombobox v-model="zone" :options="zones" search-placeholder="Search a city" />
        </MiField>
      </aside>

      <div class="msp__pick mi:grid mi:content-start mi:gap-3.5 mi:p-5 mi:min-w-0">
        <div class="msp__days mi:grid mi:grid-cols-5 mi:gap-1.5" role="group" aria-label="Day">
          <button
            v-for="(d, i) in days" :key="d.key" type="button" class="msp__day mi:grid mi:justify-items-center mi:gap-0.5 mi:pt-2.5 mi:px-1 mi:pb-2 mi:border mi:border-sep mi:rounded-[14px] mi:bg-transparent mi:text-label mi:[font:inherit] mi:cursor-pointer mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:bg-fill4 mi:[&:active:not(:disabled)]:transform-[scale(.97)] mi:disabled:cursor-not-allowed mi:disabled:opacity-45 mi:[&.is-on]:border-p mi:[&.is-on]:bg-p-tint mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="{ 'is-on': day === i }"
            :disabled="!slotsFor(i).length" :aria-pressed="day === i"
            :aria-label="d.long + (slotsFor(i).length ? ', ' + slotsFor(i).length + ' times free' : ', fully booked')"
            @click="day = i; slot = null"
          >
            <span class="msp__dow mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-label2">{{ d.dow }}</span>
            <span class="msp__num mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ d.num }}</span>
            <!-- Availability density: up to four pips. -->
            <span class="msp__pips mi:flex mi:gap-[3px] mi:mt-0.5" aria-hidden="true">
              <i class="mi:[.msp__pips_&]:w-1 mi:[.msp__pips_&]:h-1 mi:[.msp__pips_&]:rounded-[50%] mi:[.msp__pips_&]:bg-fill2" v-for="p in 4" :key="p" :class="{ 'is-on': p <= Math.ceil(slotsFor(i).length / 3) }" />
            </span>
          </button>
        </div>

        <div class="msp__slots-head mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3">
          <MiText as="h3" variant="subheadline" weight="semibold">{{ days[day]?.long }}</MiText>
          <MiText variant="caption" tone="label2">Your time · Dana's time</MiText>
        </div>
        <div v-if="slots.length" class="msp__slots mi:grid mi:grid-cols-[repeat(auto-fill,_minmax(104px,_1fr))] mi:gap-2 mi:max-h-59 mi:overflow-y-auto mi:p-0.5" role="group" aria-label="Start time">
          <button
            v-for="s in slots" :key="s" type="button" class="msp__slot mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:grid mi:gap-px mi:py-2 mi:px-2.5 mi:border mi:border-sep mi:rounded-[12px] mi:bg-transparent mi:[font:inherit] mi:text-start mi:text-label mi:cursor-pointer mi:[&.is-on]:bg-p mi:[&.is-on]:text-p-on" :class="{ 'is-on': slot === s }" :aria-pressed="slot === s"
            :aria-label="fmt(s + offsetDiff) + ' your time, ' + fmt(s) + ' for Dana'" @click="slot = s"
          >
            <span class="msp__t1 mi:text-[14px] mi:font-semibold mi:tabular-nums mi:whitespace-nowrap">{{ fmt(s + offsetDiff) }}</span>
            <span class="msp__t2 mi:text-[11.5px] mi:opacity-70 mi:tabular-nums mi:whitespace-nowrap">{{ fmt(s) }}</span>
          </button>
        </div>
        <MiText v-else variant="footnote" tone="label2">No {{ duration }}-minute window left that day. Try a shorter meeting.</MiText>

        <div class="msp__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:pt-3.5 mi:border-t mi:border-t-sep">
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
@container msp (min-width: 760px) { .msp__host { border-bottom: 0; } }

.msp__host { border-bottom: 1px solid var(--mi-sep); }
.msp__pips i.is-on { background: var(--mi-p); }
.msp__slot:hover { border-color: color-mix(in srgb, var(--mi-p) 50%, var(--mi-sep)); }
.msp__slot.is-on { border-color: var(--mi-p); }
</style>
