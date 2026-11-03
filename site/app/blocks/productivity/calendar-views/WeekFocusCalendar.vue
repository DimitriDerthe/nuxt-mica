<template>
  <section class="mi:[--h:46px] mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="week-focus-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="week-focus-title" variant="title3" as="h2" weight="semibold">Week 45</MiText>
        <MiText variant="footnote" tone="label2">November 2 – {{ showWeekend ? 8 : 6 }}, 2026 · Paris time</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-3">
        <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Visible calendars">
          <MiChip v-for="c in calendars" :key="c.id" v-model="c.on" selectable size="small" tone="neutral">
            <span class="mi:inline-block mi:w-2 mi:h-2 mi:me-1.5 mi:rounded-[50%] mi:[background:var(--c)] mi:[vertical-align:1px]" :style="{ '--c': c.color }" aria-hidden="true" />{{ c.label }}
          </MiChip>
        </div>
        <div class="mi:flex mi:items-center mi:gap-2">
          <MiSwitch v-model="showWeekend" size="compact" label="Show weekend" />
          <MiText as="span" variant="footnote" tone="label2" aria-hidden="true">Weekend</MiText>
        </div>
      </div>
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[980px]:grid-cols-[minmax(0,_1fr)_248px] mi:@[980px]:items-start">
      <div class="mi:overflow-x-auto mi:overscroll-x-contain mi:[scroll-snap-type:x_mandatory] mi:[scroll-padding-inline-start:52px] mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" role="region" aria-label="Week grid">
        <div class="mi:grid mi:grid-cols-[52px_repeat(var(--days),_minmax(136px,_1fr))] mi:@[720px]:grid-cols-[52px_repeat(var(--days),_minmax(0,_1fr))]" :style="{ '--days': days.length, '--hours': hours.length }">
          <div class="mi:sticky mi:start-0 mi:z-3 mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep" aria-hidden="true" />
          <div v-for="d in days" :key="'h' + d.idx" class="mi:border-b mi:border-b-sep mi:grid mi:gap-1.5 mi:pt-3 mi:px-2.5 mi:pb-2.5 mi:snap-start mi:min-w-0">
            <div class="mi:flex mi:items-baseline mi:gap-1.5">
              <span class="mi:text-[12px] mi:font-semibold mi:text-label2 mi:uppercase mi:tracking-[.04em]">{{ d.dow }}</span>
              <span class="mi:font-bold mi:tracking-[-.03em] mi:tabular-nums" :class="d.today ? 'mi:place-items-center mi:min-w-7.5 mi:rounded-[15px] mi:inline-grid mi:h-7.5 mi:bg-p mi:text-p-on mi:text-[16px]' : 'mi:text-[20px]'">{{ d.date }}</span>
            </div>
            <div
              class="mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="d.long + ' meeting load'" aria-valuemin="0" aria-valuemax="9"
              :aria-valuenow="d.load" :aria-valuetext="fmtDur(d.load) + ' of meetings'"
            >
              <span class="mi:block mi:h-full mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="d.load >= 5 ? 'mi:bg-orange' : 'mi:bg-p'" :style="{ transform: `scaleX(${Math.min(d.load / 9, 1)})` }" />
            </div>
            <MiText variant="caption2" tone="label2">{{ d.load ? fmtDur(d.load) + ' booked' : 'Free day' }}</MiText>
          </div>

          <div class="mi:sticky mi:start-0 mi:z-3 mi:[background:var(--mi-card)] mi:grid mi:auto-rows-(--h) mi:pt-0" aria-hidden="true">
            <span class="mi:text-[11px] mi:text-label3 mi:pe-2 mi:text-end mi:tabular-nums mi:transform-[translateY(-7px)] mi:first:transform-[translateY(3px)]" v-for="h in hours" :key="h">{{ h }}:00</span>
          </div>
          <div
            v-for="d in days" :key="'c' + d.idx" class="mi:relative mi:h-[calc(var(--hours)_*_var(--h))] mi:snap-start mi:[border-inline-start:1px_solid_var(--mi-sep)] mi:bg-[repeating-linear-gradient(to_bottom,_var(--mi-sep)_0_1px,_transparent_1px_var(--h))] " :class="d.idx > 4 ? 'mi:bg-fill4/70' : ''"
            role="group" :aria-label="d.long"
          >
            <button
              v-if="d.gap" type="button" class="mi:[font:inherit] mi:text-[11px] mi:font-semibold mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:z-2 mi:absolute mi:inset-x-1 mi:flex mi:[align-items:flex-start] mi:justify-center mi:gap-1 mi:pt-2 mi:[border:1.5px_dashed_color-mix(in_srgb,_var(--mi-green)_50%,_transparent)] mi:rounded-[10px] mi:[background:transparent] mi:text-green-t mi:cursor-pointer mi:opacity-70 mi:[transition:opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:opacity-100 mi:hover:[background:color-mix(in_srgb,_var(--mi-green)_8%,_transparent)]" :style="place(d.gap.start, d.gap.end)"
              :aria-label="`Block focus time on ${d.long} from ${fmtT(d.gap.start)}`" @click="blockFocus(d.idx, d.gap)"
            >
              <MiIcon name="plus" :size="12" :weight="2.4" />
              <span>Focus · {{ fmtDur(Math.min(2, d.gap.end - d.gap.start)) }}</span>
            </button>
            <button
              v-for="e in d.events" :key="e.id" type="button" class="mi:absolute mi:flex mi:mt-px mi:px-[7px] mi:overflow-hidden mi:[border:0] mi:rounded-[9px] mi:text-start mi:[font:inherit] mi:text-label mi:cursor-pointer mi:[background:color-mix(in_srgb,_var(--c)_15%,_var(--mi-card))] mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease),_opacity_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-1px)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px] mi:focus-visible:z-2"
              :class="[e.id === selectedId ? 'mi:z-2 mi:shadow-[inset_3px_0_0_var(--c),_0_0_0_2px_var(--c),_var(--mi-sh2)]' : 'mi:z-1 mi:shadow-[inset_3px_0_0_var(--c)]', e.end - e.start < 0.75 ? 'mi:flex-row mi:items-center mi:gap-1.5 mi:py-0.5' : 'mi:flex-col mi:gap-0.5 mi:py-[5px]']"
              :style="{ ...place(e.start, e.end), left: `calc(${e.lane / e.lanes * 100}% + 2px)`, width: `calc(${100 / e.lanes}% - 4px)`, '--c': colorOf(e.cal) }"
              :aria-pressed="e.id === selectedId" @click="selectedId = e.id"
            >
              <span class="mi:text-[12px] mi:leading-[15px] mi:font-semibold mi:[display:-webkit-box] mi:[-webkit-box-orient:vertical] mi:overflow-hidden" :class="e.end - e.start < 0.75 ? 'mi:[-webkit-line-clamp:1] mi:flex-1 mi:min-w-0' : 'mi:[-webkit-line-clamp:2]'">{{ e.title }}</span>
              <span class="mi:text-[11px] mi:leading-[13px] mi:text-label2 mi:tabular-nums mi:whitespace-nowrap">{{ fmtT(e.start) }} – {{ fmtT(e.end) }}</span>
            </button>
            <div v-if="d.today" class="mi:absolute mi:inset-x-0 mi:z-2 mi:h-0 mi:border-t-2 mi:border-t-red mi:pointer-events-none mi:before:content-[''] mi:before:absolute mi:before:start-[-5px] mi:before:-top-1.5 mi:before:w-2.5 mi:before:h-2.5 mi:before:rounded-[50%] mi:before:[background:var(--mi-red)]" :style="{ top: `calc(${now - first} * var(--h))` }" aria-hidden="true" />
          </div>
        </div>
      </div>

      <aside class="mi:grid mi:gap-3 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" aria-live="polite">
        <template v-if="selected">
          <div class="mi:inline-flex mi:items-center mi:justify-self-start mi:py-[3px] mi:px-2.5 mi:rounded-[999px] mi:text-[12px] mi:font-semibold mi:[background:color-mix(in_srgb,_var(--c)_14%,_transparent)]" :style="{ '--c': colorOf(selected.cal) }">
            <span class="mi:inline-block mi:w-2 mi:h-2 mi:me-1.5 mi:rounded-[50%] mi:[background:var(--c)] mi:[vertical-align:1px]" aria-hidden="true" />{{ selectedCal }}
          </div>
          <MiText variant="headline" as="h3">{{ selected.title }}</MiText>
          <dl class="mi:grid mi:gap-2 mi:m-0">
            <div class="mi:grid mi:gap-px"><dt class="mi:text-[11px] mi:text-label3 mi:font-semibold mi:uppercase mi:tracking-[.05em]">When</dt><dd class="mi:text-[14px] mi:m-0">{{ longDays[selected.day] }}, {{ fmtT(selected.start) }} – {{ fmtT(selected.end) }}</dd></div>
            <div class="mi:grid mi:gap-px"><dt class="mi:text-[11px] mi:text-label3 mi:font-semibold mi:uppercase mi:tracking-[.05em]">Where</dt><dd class="mi:text-[14px] mi:m-0">{{ selected.where }}</dd></div>
          </dl>
          <div v-if="selected.people.length" class="mi:flex mi:items-center mi:gap-2.5">
            <MiAvatarGroup :items="selected.people.map(n => ({ name: n, tone: 'auto' }))" :max="4" :size="28" />
            <MiText variant="footnote" tone="label2">{{ selected.people.length }} guests</MiText>
          </div>
          <MiButton v-if="selected.cal === 'focus'" class="mi:justify-self-start" variant="gray" size="small" @click="removeEvent(selected.id)">Release this block</MiButton>
          <MiButton v-else-if="selected.where.startsWith('Meet')" class="mi:justify-self-start" variant="tinted" size="small">Join call</MiButton>
        </template>
        <MiText v-else variant="footnote" tone="label2">Pick an event to see its details.</MiText>
        <p class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap mi:m-0" role="status">{{ announce }}</p>
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Cal = 'product' | 'hiring' | 'focus' | 'personal'
interface Ev { id: number, day: number, start: number, end: number, title: string, cal: Cal, where: string, people: string[] }

const calendars = reactive([
  { id: 'product' as Cal, label: 'Product', color: 'var(--mi-p)', on: true },
  { id: 'hiring' as Cal, label: 'Hiring', color: 'var(--mi-s)', on: true },
  { id: 'focus' as Cal, label: 'Focus', color: 'var(--mi-green)', on: true },
  { id: 'personal' as Cal, label: 'Personal', color: 'var(--mi-orange)', on: true }
])
const colorOf = (cal: Cal) => calendars.find(c => c.id === cal)!.color

const showWeekend = ref(false)
const first = 8
const hours = Array.from({ length: 11 }, (_, i) => first + i)
const now = 10 + 40 / 60
const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const longDays = ['Monday, Nov 2', 'Tuesday, Nov 3', 'Wednesday, Nov 4', 'Thursday, Nov 5', 'Friday, Nov 6', 'Saturday, Nov 7', 'Sunday, Nov 8']

// Sample week; swap for your calendar API. Times are decimal hours.
const standup = (day: number, id: number): Ev => ({ id, day, start: 9, end: 9.5, title: 'Standup', cal: 'product', where: 'Meet · product-daily', people: ['Ines Duarte', 'Tomás Ruiz', 'Hana Kobayashi', 'Malik Osei'] })
const events = ref<Ev[]>([
  standup(0, 1),
  { id: 2, day: 0, start: 10, end: 11.5, title: 'Pricing page review', cal: 'product', where: 'Room Lumière', people: ['Ines Duarte', 'Malik Osei'] },
  { id: 3, day: 0, start: 11, end: 12, title: 'Interview: Léa Moreau, Staff engineer', cal: 'hiring', where: 'Meet · loop-2231', people: ['Léa Moreau', 'Tomás Ruiz'] },
  { id: 4, day: 0, start: 13, end: 14, title: 'Lunch with Ines', cal: 'personal', where: 'Café Kitsuné, Palais-Royal', people: ['Ines Duarte'] },
  { id: 5, day: 0, start: 16, end: 17, title: 'Roadmap sync with Sales', cal: 'product', where: 'Meet · sales-roadmap', people: ['Carla Benoit', 'Owen Pryce', 'Malik Osei'] },
  standup(1, 6),
  { id: 7, day: 1, start: 9.5, end: 11, title: 'Onboarding spec', cal: 'focus', where: 'Do not disturb', people: [] },
  { id: 8, day: 1, start: 14, end: 15.5, title: 'Hiring debrief', cal: 'hiring', where: 'Room Méliès', people: ['Tomás Ruiz', 'Hana Kobayashi', 'Rosa Lind'] },
  { id: 9, day: 1, start: 15, end: 15.75, title: '1:1 Tomás', cal: 'product', where: 'Room Méliès', people: ['Tomás Ruiz'] },
  { id: 10, day: 1, start: 17.5, end: 18.5, title: 'Dentist', cal: 'personal', where: '14 rue de Turenne', people: [] },
  standup(2, 11),
  { id: 12, day: 2, start: 11, end: 12.5, title: 'Design critique', cal: 'product', where: 'Room Lumière', people: ['Hana Kobayashi', 'Ines Duarte', 'Owen Pryce'] },
  { id: 13, day: 2, start: 12, end: 13, title: 'Candidate lunch', cal: 'hiring', where: 'Le Petit Vendôme', people: ['Yuki Tanaka'] },
  { id: 14, day: 2, start: 15, end: 16, title: 'Customer call: Brightwave', cal: 'product', where: 'Meet · brightwave-q4', people: ['Dana Whitfield', 'Carla Benoit'] },
  standup(3, 15),
  { id: 16, day: 3, start: 10, end: 12, title: 'Quarterly planning', cal: 'product', where: 'Room Lumière', people: ['Ines Duarte', 'Malik Osei', 'Carla Benoit', 'Owen Pryce', 'Rosa Lind'] },
  { id: 17, day: 3, start: 14, end: 14.75, title: 'Interview: Yuki Tanaka, PM', cal: 'hiring', where: 'Meet · loop-2240', people: ['Yuki Tanaka'] },
  { id: 18, day: 3, start: 14.5, end: 15.5, title: 'Analytics deep dive', cal: 'product', where: 'Room Méliès', people: ['Malik Osei'] },
  standup(4, 19),
  { id: 20, day: 4, start: 10.5, end: 11.5, title: 'Demo day rehearsal', cal: 'product', where: 'Auditorium', people: ['Ines Duarte', 'Tomás Ruiz'] },
  { id: 21, day: 4, start: 16, end: 17, title: 'Team retro', cal: 'product', where: 'Room Lumière', people: ['Ines Duarte', 'Tomás Ruiz', 'Hana Kobayashi'] },
  { id: 22, day: 4, start: 17, end: 18.5, title: 'Team drinks', cal: 'personal', where: 'Le Perchoir, Ménilmontant', people: ['Ines Duarte', 'Tomás Ruiz', 'Hana Kobayashi', 'Malik Osei', 'Rosa Lind'] },
  { id: 23, day: 5, start: 10, end: 12, title: 'Climbing session', cal: 'personal', where: 'Arkose Montreuil', people: [] },
  { id: 24, day: 6, start: 18, end: 19, title: 'Call with parents', cal: 'personal', where: 'Phone', people: [] }
])
let nextId = 100

const selectedId = ref<number | null>(2)
const selected = computed(() => events.value.find(e => e.id === selectedId.value) ?? null)
const selectedCal = computed(() => calendars.find(c => c.id === selected.value?.cal)?.label ?? '')
const announce = ref('')

/** Assigns side-by-side lanes to overlapping events so none of them cover another. */
function layout(list: Ev[]) {
  const sorted = [...list].sort((a, b) => a.start - b.start || b.end - a.end)
  const out: (Ev & { lane: number, lanes: number })[] = []
  let cluster: (Ev & { lane: number, lanes: number })[] = []
  let clusterEnd = -1
  const flush = () => { const n = Math.max(...cluster.map(c => c.lane)) + 1; cluster.forEach(c => { c.lanes = n }); out.push(...cluster); cluster = [] }
  for (const e of sorted) {
    if (cluster.length && e.start >= clusterEnd) flush()
    const ends: number[] = []
    cluster.forEach(c => { ends[c.lane] = Math.max(ends[c.lane] ?? 0, c.end) })
    let lane = ends.findIndex(end => end <= e.start)
    if (lane === -1) lane = ends.length
    cluster.push({ ...e, lane, lanes: 1 })
    clusterEnd = Math.max(clusterEnd, e.end)
  }
  if (cluster.length) flush()
  return out
}

/** Longest free stretch between 9:00 and 18:00, counting hidden calendars as busy too. */
function longestGap(list: Ev[]) {
  let cursor = 9
  let best: { start: number, end: number } | null = null
  for (const e of [...list].sort((a, b) => a.start - b.start)) {
    if (e.start > cursor && (!best || e.start - cursor > best.end - best.start)) best = { start: cursor, end: Math.min(e.start, 18) }
    cursor = Math.max(cursor, e.end)
  }
  if (cursor < 18 && (!best || 18 - cursor > best.end - best.start)) best = { start: cursor, end: 18 }
  return best && best.end - best.start >= 1.5 ? best : null
}

const days = computed(() => {
  const visible = new Set(calendars.filter(c => c.on).map(c => c.id))
  return dows.slice(0, showWeekend.value ? 7 : 5).map((dow, idx) => {
    const all = events.value.filter(e => e.day === idx)
    const load = all.filter(e => e.cal === 'product' || e.cal === 'hiring').reduce((s, e) => s + e.end - e.start, 0)
    return {
      idx, dow, date: idx + 2, long: longDays[idx]!, today: idx === 0, load,
      gap: idx < 5 ? longestGap(all) : null,
      events: layout(all.filter(e => visible.has(e.cal)))
    }
  })
})

const place = (start: number, end: number) => ({ top: `calc(${start - first} * var(--h))`, height: `calc(${end - start} * var(--h) - 2px)` })
const fmtT = (h: number) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`
const fmtDur = (h: number) => (h % 1 ? `${Math.floor(h)}h${String(Math.round((h % 1) * 60)).padStart(2, '0')}` : `${h}h`)

function blockFocus(day: number, gap: { start: number, end: number }) {
  const ev: Ev = { id: nextId++, day, start: gap.start, end: Math.min(gap.start + 2, gap.end), title: 'Deep work', cal: 'focus', where: 'Do not disturb', people: [] }
  events.value = [...events.value, ev]
  calendars.find(c => c.id === 'focus')!.on = true
  selectedId.value = ev.id
  announce.value = `Focus block added on ${longDays[day]}, ${fmtT(ev.start)} to ${fmtT(ev.end)}.`
}

function removeEvent(id: number) {
  events.value = events.value.filter(e => e.id !== id)
  selectedId.value = null
  announce.value = 'Focus block released.'
}
</script>
