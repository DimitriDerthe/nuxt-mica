<template>
  <section class="wk" aria-labelledby="week-focus-title">
    <header class="wk__head">
      <div>
        <MiText id="week-focus-title" variant="title3" as="h2" weight="semibold">Week 45</MiText>
        <MiText variant="footnote" tone="label2">November 2 – {{ showWeekend ? 8 : 6 }}, 2026 · Paris time</MiText>
      </div>
      <div class="wk__tools">
        <div class="wk__cals" role="group" aria-label="Visible calendars">
          <MiChip v-for="c in calendars" :key="c.id" v-model="c.on" selectable size="small" tone="neutral">
            <span class="wk__dot" :style="{ '--c': c.color }" aria-hidden="true" />{{ c.label }}
          </MiChip>
        </div>
        <div class="wk__weekend">
          <MiSwitch v-model="showWeekend" size="compact" label="Show weekend" />
          <MiText as="span" variant="footnote" tone="label2" aria-hidden="true">Weekend</MiText>
        </div>
      </div>
    </header>

    <div class="wk__body">
      <div class="wk__scroll" tabindex="0" role="region" aria-label="Week grid">
        <div class="wk__grid" :style="{ '--days': days.length, '--hours': hours.length }">
          <div class="wk__corner" aria-hidden="true" />
          <div v-for="d in days" :key="'h' + d.idx" class="wk__dayhead" :class="{ 'is-today': d.today }">
            <div class="wk__dayname">
              <span class="wk__dow">{{ d.dow }}</span>
              <span class="wk__date">{{ d.date }}</span>
            </div>
            <div
              class="wk__load" role="meter" :aria-label="d.long + ' meeting load'" aria-valuemin="0" aria-valuemax="9"
              :aria-valuenow="d.load" :aria-valuetext="fmtDur(d.load) + ' of meetings'"
            >
              <span :class="{ 'is-heavy': d.load >= 5 }" :style="{ transform: `scaleX(${Math.min(d.load / 9, 1)})` }" />
            </div>
            <MiText variant="caption2" tone="label2">{{ d.load ? fmtDur(d.load) + ' booked' : 'Free day' }}</MiText>
          </div>

          <div class="wk__gutter" aria-hidden="true">
            <span v-for="h in hours" :key="h">{{ h }}:00</span>
          </div>
          <div
            v-for="d in days" :key="'c' + d.idx" class="wk__col" :class="{ 'is-weekend': d.idx > 4 }"
            role="group" :aria-label="d.long"
          >
            <button
              v-if="d.gap" type="button" class="wk__gap" :style="place(d.gap.start, d.gap.end)"
              :aria-label="`Block focus time on ${d.long} from ${fmtT(d.gap.start)}`" @click="blockFocus(d.idx, d.gap)"
            >
              <MiIcon name="plus" :size="12" :weight="2.4" />
              <span>Focus · {{ fmtDur(Math.min(2, d.gap.end - d.gap.start)) }}</span>
            </button>
            <button
              v-for="e in d.events" :key="e.id" type="button" class="wk__ev"
              :class="{ 'is-sel': e.id === selectedId, 'is-short': e.end - e.start < 0.75 }"
              :style="{ ...place(e.start, e.end), left: `calc(${e.lane / e.lanes * 100}% + 2px)`, width: `calc(${100 / e.lanes}% - 4px)`, '--c': colorOf(e.cal) }"
              :aria-pressed="e.id === selectedId" @click="selectedId = e.id"
            >
              <span class="wk__ev-title">{{ e.title }}</span>
              <span class="wk__ev-time">{{ fmtT(e.start) }} – {{ fmtT(e.end) }}</span>
            </button>
            <div v-if="d.today" class="wk__now" :style="{ top: `calc(${now - first} * var(--h))` }" aria-hidden="true" />
          </div>
        </div>
      </div>

      <aside class="wk__detail" aria-live="polite">
        <template v-if="selected">
          <div class="wk__tag" :style="{ '--c': colorOf(selected.cal) }">
            <span class="wk__dot" aria-hidden="true" />{{ selectedCal }}
          </div>
          <MiText variant="headline" as="h3">{{ selected.title }}</MiText>
          <dl class="wk__facts">
            <div><dt>When</dt><dd>{{ longDays[selected.day] }}, {{ fmtT(selected.start) }} – {{ fmtT(selected.end) }}</dd></div>
            <div><dt>Where</dt><dd>{{ selected.where }}</dd></div>
          </dl>
          <div v-if="selected.people.length" class="wk__people">
            <MiAvatarGroup :items="selected.people.map(n => ({ name: n, tone: 'auto' }))" :max="4" :size="28" />
            <MiText variant="footnote" tone="label2">{{ selected.people.length }} guests</MiText>
          </div>
          <MiButton v-if="selected.cal === 'focus'" class="wk__act" variant="gray" size="small" @click="removeEvent(selected.id)">Release this block</MiButton>
          <MiButton v-else-if="selected.where.startsWith('Meet')" class="wk__act" variant="tinted" size="small">Join call</MiButton>
        </template>
        <MiText v-else variant="footnote" tone="label2">Pick an event to see its details.</MiText>
        <p class="wk__sr" role="status">{{ announce }}</p>
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

<style scoped>
.wk { --h: 46px; container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.wk__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.wk__tools { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; }
.wk__cals { display: flex; flex-wrap: wrap; gap: 6px; }
.wk__weekend { display: flex; align-items: center; gap: 8px; }
.wk__dot { display: inline-block; width: 8px; height: 8px; margin-inline-end: 6px; border-radius: 50%; background: var(--c); vertical-align: 1px; }

.wk__body { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 980px) { .wk__body { grid-template-columns: minmax(0, 1fr) 248px; align-items: start; } }

.wk__scroll {
  overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scroll-padding-inline-start: 52px;
  border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.wk__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.wk__grid { display: grid; grid-template-columns: 52px repeat(var(--days), minmax(136px, 1fr)); }
@container (min-width: 720px) { .wk__grid { grid-template-columns: 52px repeat(var(--days), minmax(0, 1fr)); } }

.wk__corner, .wk__gutter { position: sticky; inset-inline-start: 0; z-index: 3; background: var(--mi-card); }
.wk__corner, .wk__dayhead { border-bottom: 1px solid var(--mi-sep); }
.wk__dayhead { display: grid; gap: 6px; padding: 12px 10px 10px; scroll-snap-align: start; min-width: 0; }
.wk__dayname { display: flex; align-items: baseline; gap: 6px; }
.wk__dow { font-size: 12px; font-weight: 600; color: var(--mi-label2); text-transform: uppercase; letter-spacing: .04em; }
.wk__date { font-size: 20px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.is-today .wk__date { display: inline-grid; place-items: center; min-width: 30px; height: 30px; border-radius: 15px; background: var(--mi-p); color: var(--mi-p-on); font-size: 16px; }
.wk__load { height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.wk__load span { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.wk__load span.is-heavy { background: var(--mi-orange); }

.wk__gutter { display: grid; grid-auto-rows: var(--h); padding-top: 0; }
.wk__gutter span { padding-inline-end: 8px; font-size: 11px; text-align: end; color: var(--mi-label3); font-variant-numeric: tabular-nums; transform: translateY(-7px); }
.wk__gutter span:first-child { transform: translateY(3px); }

.wk__col {
  position: relative; height: calc(var(--hours) * var(--h)); scroll-snap-align: start; border-inline-start: 1px solid var(--mi-sep);
  background-image: repeating-linear-gradient(to bottom, var(--mi-sep) 0 1px, transparent 1px var(--h));
}
.wk__col.is-weekend { background-color: color-mix(in srgb, var(--mi-fill4) 70%, transparent); }

.wk__ev {
  position: absolute; display: flex; flex-direction: column; gap: 2px; margin-top: 1px; padding: 5px 7px; overflow: hidden; z-index: 1;
  border: 0; border-radius: 9px; text-align: start; font: inherit; color: var(--mi-label); cursor: pointer;
  background: color-mix(in srgb, var(--c) 15%, var(--mi-card)); box-shadow: inset 3px 0 0 var(--c);
  transition: transform var(--mi-dur-2) var(--mi-ease), opacity var(--mi-dur-2) var(--mi-ease);
}
.wk__ev:hover { transform: translateY(-1px); }
.wk__ev.is-sel { z-index: 2; box-shadow: inset 3px 0 0 var(--c), 0 0 0 2px var(--c), var(--mi-sh2); }
.wk__ev:focus-visible, .wk__gap:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; z-index: 2; }
.wk__ev-title { font-size: 12px; line-height: 15px; font-weight: 600; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.wk__ev-time { font-size: 11px; line-height: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; white-space: nowrap; }
.wk__ev.is-short { flex-direction: row; align-items: center; gap: 6px; padding-block: 2px; }
.wk__ev.is-short .wk__ev-title { -webkit-line-clamp: 1; flex: 1; min-width: 0; }

.wk__gap {
  position: absolute; inset-inline: 4px; display: flex; align-items: flex-start; justify-content: center; gap: 4px; padding-top: 8px;
  border: 1.5px dashed color-mix(in srgb, var(--mi-green) 50%, transparent); border-radius: 10px; background: transparent;
  font: inherit; font-size: 11px; font-weight: 600; color: var(--mi-green-t); cursor: pointer; opacity: .7;
  transition: opacity var(--mi-dur-2) var(--mi-ease);
}
.wk__gap:hover { opacity: 1; background: color-mix(in srgb, var(--mi-green) 8%, transparent); }

.wk__now { position: absolute; inset-inline: 0; z-index: 2; height: 0; border-top: 2px solid var(--mi-red); pointer-events: none; }
.wk__now::before { content: ""; position: absolute; inset-inline-start: -5px; top: -6px; width: 10px; height: 10px; border-radius: 50%; background: var(--mi-red); }

.wk__detail { display: grid; gap: 12px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.wk__tag { display: inline-flex; align-items: center; justify-self: start; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: color-mix(in srgb, var(--c) 14%, transparent); }
.wk__tag .wk__dot { background: var(--c); }
.wk__facts { display: grid; gap: 8px; margin: 0; }
.wk__facts div { display: grid; gap: 1px; }
.wk__facts dt { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label3); }
.wk__facts dd { margin: 0; font-size: 14px; }
.wk__people { display: flex; align-items: center; gap: 10px; }
.wk__act { justify-self: start; }
.wk__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; margin: 0; }
</style>
