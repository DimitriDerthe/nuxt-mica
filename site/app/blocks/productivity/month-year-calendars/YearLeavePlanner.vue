<template>
  <section class="yr" aria-labelledby="year-leave-title">
    <header class="yr__head">
      <div>
        <MiText id="year-leave-title" variant="title3" as="h2" weight="semibold">Leave planner 2027</MiText>
        <MiText variant="footnote" tone="label2">Paris office · French public holidays</MiText>
      </div>
      <MiSegmented v-model="view" label="Calendar view" :options="views" />
    </header>

    <div class="yr__budget">
      <div class="yr__budget-text">
        <p class="yr__big">{{ left }}<span> / {{ allowance }}</span></p>
        <MiText variant="footnote" tone="label2">days left · {{ used }} booked, weekends and holidays never count</MiText>
      </div>
      <div class="yr__bar" role="meter" aria-label="Leave used" aria-valuemin="0" :aria-valuemax="allowance" :aria-valuenow="used">
        <span :class="{ 'is-over': used > allowance }" :style="{ transform: `scaleX(${Math.min(used / allowance, 1)})` }" />
      </div>
    </div>

    <div class="yr__body">
      <!-- Year: twelve compact months, every weekday is a toggle. -->
      <div v-if="view === 'year'" class="yr__months">
        <article v-for="m in months" :key="m.index" class="yr__mini">
          <button type="button" class="yr__mname" @click="openMonth(m.index)">
            {{ m.name }}<span v-if="m.pto" class="yr__mcount">{{ m.pto }}d</span>
          </button>
          <div class="yr__wk" aria-hidden="true"><span v-for="w in weekdays" :key="w">{{ w[0] }}</span></div>
          <div class="yr__days" role="group" :aria-label="m.name + ' 2027'">
            <span v-for="n in m.offset" :key="'o' + n" aria-hidden="true" />
            <button
              v-for="d in m.days" :key="d.day" type="button" class="yr__d" :class="d.cls" :disabled="!d.bookable"
              :aria-pressed="d.bookable ? d.pto : undefined" :aria-label="d.aria" :title="d.note || undefined" @click="toggle(m.index, d.day)"
            >{{ d.day }}</button>
          </div>
        </article>
      </div>

      <!-- Month: the same data, roomy enough for labels. -->
      <div v-else class="yr__month">
        <div class="yr__month-head">
          <MiIconButton label="Previous month" variant="gray" size="small" :disabled="month === 0" @click="month--"><MiIcon name="chevron-left" :size="16" /></MiIconButton>
          <MiText variant="headline" as="h3" aria-live="polite">{{ cur.name }} 2027</MiText>
          <MiIconButton label="Next month" variant="gray" size="small" :disabled="month === 11" @click="month++"><MiIcon name="chevron-right" :size="16" /></MiIconButton>
        </div>
        <div class="yr__big-wk" aria-hidden="true"><span v-for="w in weekdays" :key="w">{{ w }}</span></div>
        <div class="yr__big-days" role="group" :aria-label="cur.name + ' 2027'">
          <span v-for="n in cur.offset" :key="'o' + n" class="yr__cell yr__cell--pad" aria-hidden="true" />
          <button
            v-for="d in cur.days" :key="d.day" type="button" class="yr__cell" :class="d.cls" :disabled="!d.bookable"
            :aria-pressed="d.bookable ? d.pto : undefined" :aria-label="d.aria" @click="toggle(cur.index, d.day)"
          >
            <span class="yr__cell-n">{{ d.day }}</span>
            <span v-if="d.note" class="yr__cell-note">{{ d.note }}</span>
          </button>
        </div>
      </div>

      <aside class="yr__tips" aria-labelledby="year-leave-bridges">
        <MiText id="year-leave-bridges" variant="subheadline" weight="semibold" as="h3">Bridge days</MiText>
        <MiText variant="footnote" tone="label2">One day off that joins a holiday to a weekend.</MiText>
        <ul class="yr__bridges">
          <li v-for="b in bridges" :key="b.key">
            <div class="yr__bridge-text">
              <span class="yr__bridge-date">{{ b.label }}</span>
              <MiText variant="caption" tone="label2">{{ b.span }} days off for 1 · {{ b.holiday }}</MiText>
            </div>
            <MiButton :variant="b.taken ? 'gray' : 'tinted'" size="small" :aria-label="(b.taken ? 'Release ' : 'Take ') + b.label" @click="toggle(b.m, b.d)">
              {{ b.taken ? 'Taken' : 'Take' }}
            </MiButton>
          </li>
        </ul>
        <ul class="yr__legend" aria-label="Legend">
          <li><i class="is-pto" />Leave</li>
          <li><i class="is-hol" />Public holiday</li>
          <li><i class="is-ev" />Company event</li>
          <li><i class="is-bridge" />Bridge day</li>
        </ul>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const year = 2027
const allowance = 25
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const views = [{ value: 'year', label: 'Year' }, { value: 'month', label: 'Month' }]
const view = ref<string | number | null>('year')
const month = ref(4)

const key = (m: number, d: number) => `${m}-${d}`
// French public holidays 2027 (Easter is March 28).
const holidays: Record<string, string> = {
  [key(0, 1)]: 'New Year', [key(2, 29)]: 'Easter Monday', [key(4, 1)]: 'Labour Day', [key(4, 6)]: 'Ascension', [key(4, 8)]: 'Victory Day',
  [key(4, 17)]: 'Whit Monday', [key(6, 14)]: 'Bastille Day', [key(7, 15)]: 'Assumption', [key(10, 1)]: 'All Saints', [key(10, 11)]: 'Armistice', [key(11, 25)]: 'Christmas'
}
const events: Record<string, string> = {
  [key(1, 3)]: 'Kickoff', [key(5, 9)]: 'Offsite', [key(5, 10)]: 'Offsite', [key(5, 11)]: 'Offsite', [key(8, 21)]: 'Launch', [key(11, 16)]: 'Code freeze'
}

const dateOf = (m: number, d: number) => new Date(year, m, d)
const isWeekend = (m: number, d: number) => { const w = dateOf(m, d).getDay(); return w === 0 || w === 6 }

// Already booked: winter week and the August break.
const pto = ref(new Set<string>([
  ...[15, 16, 17, 18, 19].map(d => key(1, d)),
  ...[2, 3, 4, 5, 6, 9, 10, 11, 12, 13].map(d => key(7, d))
]))

/** A Monday before a Tuesday holiday or a Friday after a Thursday holiday turns one day into a long weekend. */
const bridgeKeys = computed(() => {
  const out: { m: number, d: number, holiday: string }[] = []
  for (const [k, name] of Object.entries(holidays)) {
    const [m, d] = k.split('-').map(Number) as [number, number]
    const w = dateOf(m, d).getDay()
    if (w === 2) { const b = dateOf(m, d - 1); out.push({ m: b.getMonth(), d: b.getDate(), holiday: name }) }
    if (w === 4) { const b = dateOf(m, d + 1); out.push({ m: b.getMonth(), d: b.getDate(), holiday: name }) }
  }
  return out
})
const bridgeSet = computed(() => new Set(bridgeKeys.value.map(b => key(b.m, b.d))))
const bridges = computed(() => bridgeKeys.value.map(b => ({
  ...b, key: key(b.m, b.d), span: 4, taken: pto.value.has(key(b.m, b.d)),
  label: dateOf(b.m, b.d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
})))

function buildMonth(index: number) {
  const count = new Date(year, index + 1, 0).getDate()
  const offset = (dateOf(index, 1).getDay() + 6) % 7
  let ptoCount = 0
  const days = Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const k = key(index, day)
    const weekend = isWeekend(index, day)
    const hol = holidays[k]
    const ev = events[k]
    const off = pto.value.has(k)
    if (off) ptoCount++
    const bridge = bridgeSet.value.has(k) && !off
    const note = hol ?? (off ? 'Leave' : ev ?? (bridge ? 'Bridge day' : ''))
    const long = dateOf(index, day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    return {
      day, pto: off, note, bookable: !weekend && !hol,
      aria: `${long}${note ? ', ' + note : ''}`,
      cls: { 'is-we': weekend, 'is-hol': !!hol, 'is-ev': !!ev && !off, 'is-pto': off, 'is-bridge': bridge }
    }
  })
  return { index, name: monthNames[index]!, offset, days, pto: ptoCount }
}

const months = computed(() => monthNames.map((_, i) => buildMonth(i)))
const cur = computed(() => months.value[month.value]!)
const used = computed(() => pto.value.size)
const left = computed(() => allowance - used.value)

function toggle(m: number, d: number) {
  if (isWeekend(m, d) || holidays[key(m, d)]) return
  const next = new Set(pto.value)
  const k = key(m, d)
  if (next.has(k)) next.delete(k)
  else next.add(k)
  pto.value = next
}

function openMonth(i: number) { month.value = i; view.value = 'month' }
</script>

<style scoped>
.yr { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.yr__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.yr__budget { display: grid; gap: 10px; padding: 16px 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 640px) { .yr__budget { grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 24px; } }
.yr__budget-text { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.yr__big { margin: 0; font-size: 34px; line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.yr__big span { font-size: 17px; font-weight: 600; color: var(--mi-label3); letter-spacing: 0; }
.yr__bar { height: 8px; border-radius: 4px; background: var(--mi-fill3); overflow: hidden; }
.yr__bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--mi-p), var(--mi-s)); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.yr__bar span.is-over { background: var(--mi-red); }

.yr__body { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 1000px) { .yr__body { grid-template-columns: minmax(0, 1fr) 260px; align-items: start; } }

.yr__months { display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
@container (min-width: 560px) { .yr__months { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; } }
@container (min-width: 760px) { .yr__months { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.yr__mini { display: grid; gap: 4px; padding: 10px 8px 8px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.yr__mname {
  display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 2px 4px 4px; border: 0; background: none;
  font: inherit; font-size: 13px; font-weight: 600; color: var(--mi-label); text-align: start; cursor: pointer; border-radius: 6px;
}
.yr__mname:hover { color: var(--mi-p-text); }
.yr__mname:focus-visible { outline: 2px solid var(--mi-p); }
.yr__mcount { padding: 1px 6px; border-radius: 999px; font-size: 11px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.yr__wk, .yr__days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); }
.yr__wk span { font-size: 10px; font-weight: 600; text-align: center; color: var(--mi-label3); }
.yr__d {
  position: relative; aspect-ratio: 1; display: grid; place-items: center; padding: 0; border: 0; border-radius: 50%; background: none;
  font: inherit; font-size: 11px; font-variant-numeric: tabular-nums; color: var(--mi-label); cursor: pointer;
  transition: transform var(--mi-dur-2) var(--mi-spring);
}
.yr__d:hover:not(:disabled) { background: var(--mi-fill4); }
.yr__d:active:not(:disabled) { transform: scale(.85); }
.yr__d:focus-visible, .yr__cell:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; z-index: 1; }
.yr__d:disabled, .yr__cell:disabled { cursor: default; }
.yr__d.is-we { color: var(--mi-label3); }
.yr__d.is-hol { background: color-mix(in srgb, var(--mi-orange) 22%, transparent); color: var(--mi-orange-t); font-weight: 700; }
.yr__d.is-ev { box-shadow: inset 0 0 0 1.5px var(--mi-s); }
.yr__d.is-bridge { box-shadow: inset 0 0 0 1.5px var(--mi-green); border-style: dashed; color: var(--mi-green-t); font-weight: 600; }
.yr__d.is-pto { background: var(--mi-p); color: var(--mi-p-on); font-weight: 600; }

.yr__month { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.yr__month-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.yr__month-head h3 { margin: 0; }
.yr__big-wk, .yr__big-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.yr__big-wk span { font-size: 11px; font-weight: 600; color: var(--mi-label2); text-align: center; text-transform: uppercase; letter-spacing: .04em; }
.yr__cell {
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-height: 52px; padding: 6px; border: 0; border-radius: 10px;
  background: var(--mi-fill4); font: inherit; color: var(--mi-label); text-align: start; cursor: pointer; overflow: hidden; min-width: 0;
}
@container (min-width: 560px) { .yr__cell { min-height: 76px; padding: 8px; } }
.yr__cell--pad { background: none; }
.yr__cell:hover:not(:disabled) { background: var(--mi-fill3); }
.yr__cell-n { font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.yr__cell-note { display: none; max-width: 100%; font-size: 11px; font-weight: 600; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@container (min-width: 560px) { .yr__cell-note { display: block; } }
.yr__cell.is-we { background: none; color: var(--mi-label3); }
.yr__cell.is-hol { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }
.yr__cell.is-ev { box-shadow: inset 3px 0 0 var(--mi-s); }
.yr__cell.is-ev .yr__cell-note { color: var(--mi-s-text); }
.yr__cell.is-bridge { box-shadow: inset 0 0 0 1.5px var(--mi-green); }
.yr__cell.is-bridge .yr__cell-note { color: var(--mi-green-t); }
.yr__cell.is-pto { background: var(--mi-p); color: var(--mi-p-on); }

.yr__tips { display: grid; gap: 10px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.yr__tips h3 { margin: 0; }
.yr__bridges { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.yr__bridges li { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: var(--mi-radius-m); background: color-mix(in srgb, var(--mi-green) 8%, transparent); }
.yr__bridge-text { display: grid; gap: 2px; min-width: 0; }
.yr__bridge-date { font-size: 14px; font-weight: 600; }
.yr__legend { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 4px 0 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); }
.yr__legend li { display: inline-flex; align-items: center; gap: 6px; }
.yr__legend i { width: 10px; height: 10px; border-radius: 50%; }
.yr__legend .is-pto { background: var(--mi-p); }
.yr__legend .is-hol { background: color-mix(in srgb, var(--mi-orange) 40%, transparent); }
.yr__legend .is-ev { box-shadow: inset 0 0 0 1.5px var(--mi-s); }
.yr__legend .is-bridge { box-shadow: inset 0 0 0 1.5px var(--mi-green); }
</style>
