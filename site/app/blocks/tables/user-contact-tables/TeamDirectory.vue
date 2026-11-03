<template>
  <section class="tdir" aria-labelledby="tdir-title">
    <header class="tdir__head">
      <div class="tdir__title">
        <MiText id="tdir-title" variant="title3" as="h2" weight="semibold">Team directory</MiText>
        <MiText variant="footnote" tone="label2" tabular>
          <span class="tdir__live" aria-hidden="true" />{{ workingCount }} of {{ people.length }} people are in working hours · your time {{ viewerTime }}
        </MiText>
      </div>
      <div class="tdir__view"><MiSegmented v-model="view" label="Layout" :options="views" /></div>
    </header>

    <div class="tdir__filters">
      <div class="tdir__search"><MiSearch v-model="query" size="compact" placeholder="Name, role or city" aria-label="Search people" /></div>
      <div class="tdir__chips" role="group" aria-label="Filter by department">
        <MiChip
          v-for="d in departments" :key="d" selectable size="small" tone="neutral" :model-value="depts.includes(d)"
          :label="`${d} ${countBy(d)}`" @update:model-value="toggleDept(d)"
        />
        <MiChip v-model="reachable" selectable size="small" tone="primary"><span class="tdir__live" aria-hidden="true" />Working now</MiChip>
      </div>
    </div>

    <div class="tdir__body">
      <div ref="scroller" class="tdir__scroll" tabindex="0" aria-label="People" role="region">
        <!-- Table view: one row group per letter, so the scrubber has a target in both layouts. -->
        <table v-if="view === 'table'" class="tdir__table">
          <caption class="tdir__sr">People sorted by first name, with their local time</caption>
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col" class="c-dept">Department</th>
              <th scope="col" class="c-loc">Location</th>
              <th scope="col" class="c-time">Local time</th>
              <th scope="col" class="c-act"><span class="tdir__sr">Contact</span></th>
            </tr>
          </thead>
          <tbody v-for="sec in sections" :key="sec.letter">
            <tr class="tdir__letter-row">
              <th :id="`tdir-l-${sec.letter}`" :data-letter="sec.letter" scope="rowgroup" colspan="5" class="tdir__letter">{{ sec.letter }}</th>
            </tr>
            <tr v-for="p in sec.people" :key="p.id" class="tdir__row">
              <td>
                <span class="tdir__who">
                  <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
                  <span class="tdir__who-text">
                    <span class="tdir__name">{{ p.name }}</span>
                    <span class="tdir__role">{{ p.role }}<span class="tdir__role-more"> · {{ p.dept }} · {{ p.city }}</span></span>
                  </span>
                </span>
              </td>
              <td class="c-dept"><span class="tdir__dept" :data-dept="p.dept">{{ p.dept }}</span></td>
              <td class="c-loc">{{ p.city }}</td>
              <td class="c-time">
                <div class="tdir__time" :class="`is-${p.c.state}`">
                  <span class="tdir__clock">{{ p.c.time }}</span>
                  <div class="tdir__day" aria-hidden="true">
                    <i class="tdir__work" :style="{ insetInlineStart: `${(p.c.start / 24) * 100}%`, width: `${((p.c.end - p.c.start) / 24) * 100}%` }" />
                    <span class="tdir__now" :style="{ transform: `translateX(${(p.c.hour / 24) * 100}%)` }"><i /></span>
                  </div>
                  <span class="tdir__rel">{{ p.c.rel }}<template v-if="p.c.day"> · {{ p.c.day }}</template></span>
                  <span class="tdir__status">{{ p.c.status }}</span>
                </div>
              </td>
              <td class="c-act">
                <MiIconButton size="small" variant="plain" :label="`Message ${p.name}`"><MiIcon name="chat" :size="16" /></MiIconButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Card view: one continuous grid; the first card of each letter carries the scrubber target. -->
        <ul v-else class="tdir__grid">
          <li v-for="p in filtered" :key="p.id" class="tdir__card" :data-letter="p.first ? p.letter : undefined">
            <div class="tdir__card-top">
                  <MiAvatar :name="p.name" size="md" tone="auto" decorative />
                  <MiIconButton size="small" variant="gray" :label="`Message ${p.name}`"><MiIcon name="chat" :size="15" /></MiIconButton>
                </div>
                <div class="tdir__card-id">
                  <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
                  <MiText variant="caption" tone="label2" :lines="1">{{ p.role }}</MiText>
                </div>
                <div class="tdir__card-meta">
                  <span class="tdir__dept" :data-dept="p.dept">{{ p.dept }}</span>
                  <span class="tdir__city"><MiIcon name="globe" :size="12" />{{ p.city }}</span>
                </div>
                <div class="tdir__time" :class="`is-${p.c.state}`">
                  <span class="tdir__clock">{{ p.c.time }}</span>
                  <div class="tdir__day" aria-hidden="true">
                    <i class="tdir__work" :style="{ insetInlineStart: `${(p.c.start / 24) * 100}%`, width: `${((p.c.end - p.c.start) / 24) * 100}%` }" />
                    <span class="tdir__now" :style="{ transform: `translateX(${(p.c.hour / 24) * 100}%)` }"><i /></span>
                  </div>
                  <span class="tdir__rel">{{ p.c.rel }}<template v-if="p.c.day"> · {{ p.c.day }}</template></span>
                  <span class="tdir__status">{{ p.c.status }}</span>
                </div>
          </li>
        </ul>

        <p v-if="!sections.length" class="tdir__none">Nobody matches these filters.</p>
      </div>

      <!-- A–Z scrubber: letters with people are buttons, the letter in view is marked current. -->
      <nav class="tdir__az" aria-label="Jump to letter">
        <button
          v-for="l in alphabet" :key="l" type="button" class="tdir__az-btn" :disabled="!letters.has(l)"
          :aria-current="current === l ? 'true' : undefined" :aria-label="`Jump to ${l}`" @click="jump(l)"
        >
          {{ l }}
        </button>
      </nav>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Dept = 'Design' | 'Engineering' | 'Product' | 'Sales' | 'Support'
interface Person { id: string, name: string, role: string, dept: Dept, city: string, tz: string, start: number, end: number }
interface Clock { time: string, day: string, rel: string, state: 'in' | 'late' | 'off', status: string, hour: number, start: number, end: number }

// Sample team; swap for your HR directory.
const people: Person[] = [
  { id: 'p1', name: 'Aiko Matsuda', role: 'Senior Product Designer', dept: 'Design', city: 'Tokyo', tz: 'Asia/Tokyo', start: 10, end: 19 },
  { id: 'p2', name: 'Amara Okeke', role: 'Backend Engineer', dept: 'Engineering', city: 'Lagos', tz: 'Africa/Lagos', start: 9, end: 17 },
  { id: 'p3', name: 'Ben Carter', role: 'Account Executive', dept: 'Sales', city: 'Chicago', tz: 'America/Chicago', start: 8, end: 17 },
  { id: 'p4', name: 'Camille Durand', role: 'Support Lead', dept: 'Support', city: 'Paris', tz: 'Europe/Paris', start: 9, end: 18 },
  { id: 'p5', name: 'Diego Álvarez', role: 'Mobile Engineer', dept: 'Engineering', city: 'Mexico City', tz: 'America/Mexico_City', start: 9, end: 18 },
  { id: 'p6', name: 'Elif Yıldız', role: 'Product Manager, Billing', dept: 'Product', city: 'Istanbul', tz: 'Europe/Istanbul', start: 9, end: 18 },
  { id: 'p7', name: 'Freya Nilsen', role: 'Brand Designer', dept: 'Design', city: 'Copenhagen', tz: 'Europe/Copenhagen', start: 8, end: 16 },
  { id: 'p8', name: 'Hamid Rahimi', role: 'Platform Engineer', dept: 'Engineering', city: 'Toronto', tz: 'America/Toronto', start: 9, end: 17 },
  { id: 'p9', name: 'Isla McKenzie', role: 'Sales Manager, UK', dept: 'Sales', city: 'Edinburgh', tz: 'Europe/London', start: 9, end: 17 },
  { id: 'p10', name: 'Jae-won Park', role: 'Staff Engineer', dept: 'Engineering', city: 'Seoul', tz: 'Asia/Seoul', start: 10, end: 19 },
  { id: 'p11', name: 'Kavya Menon', role: 'Product Manager, Growth', dept: 'Product', city: 'Bengaluru', tz: 'Asia/Kolkata', start: 10, end: 19 },
  { id: 'p12', name: 'Lucas Ferreira', role: 'Support Engineer', dept: 'Support', city: 'São Paulo', tz: 'America/Sao_Paulo', start: 9, end: 18 },
  { id: 'p13', name: 'Mila Novak', role: 'UX Researcher', dept: 'Design', city: 'Ljubljana', tz: 'Europe/Ljubljana', start: 8, end: 16 },
  { id: 'p14', name: 'Nathan Brooks', role: 'Head of Sales', dept: 'Sales', city: 'San Francisco', tz: 'America/Los_Angeles', start: 8, end: 17 },
  { id: 'p15', name: 'Olivia Hart', role: 'Frontend Engineer', dept: 'Engineering', city: 'Sydney', tz: 'Australia/Sydney', start: 9, end: 17 },
  { id: 'p16', name: 'Rafael Ortiz', role: 'Customer Success', dept: 'Support', city: 'Madrid', tz: 'Europe/Madrid', start: 9, end: 18 },
  { id: 'p17', name: 'Sana Qureshi', role: 'Security Engineer', dept: 'Engineering', city: 'Dubai', tz: 'Asia/Dubai', start: 9, end: 18 },
  { id: 'p18', name: 'Tess Morgan', role: 'VP Product', dept: 'Product', city: 'New York', tz: 'America/New_York', start: 9, end: 18 },
  { id: 'p19', name: 'Wen Li', role: 'Data Engineer', dept: 'Engineering', city: 'Singapore', tz: 'Asia/Singapore', start: 9, end: 18 },
  { id: 'p20', name: 'Zoë Laurent', role: 'Interaction Designer', dept: 'Design', city: 'Montréal', tz: 'America/Toronto', start: 9, end: 17 }
]

const departments: Dept[] = ['Design', 'Engineering', 'Product', 'Sales', 'Support']
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const views = [{ value: 'table', icon: 'list' as const, ariaLabel: 'Table' }, { value: 'cards', icon: 'grid' as const, ariaLabel: 'Cards' }]
const view = ref<string | number | null>('table')
const query = ref('')
const depts = ref<Dept[]>([])
const reachable = ref(false)

// One clock for the whole block, ticking every 20 s; every local time derives from it.
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => { timer = setInterval(() => { now.value = new Date() }, 20_000) })
onBeforeUnmount(() => clearInterval(timer))

const formats = new Map<string, Intl.DateTimeFormat>()
function partsIn(tz: string | undefined, d: Date) {
  const key = tz ?? 'local'
  let f = formats.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23', timeZoneName: 'shortOffset' })
    formats.set(key, f)
  }
  const p: Record<string, string> = {}
  for (const x of f.formatToParts(d)) p[x.type] = x.value
  const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p.timeZoneName ?? '')
  const offset = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0
  return { hour: Number(p.hour), minute: Number(p.minute), weekday: p.weekday ?? '', offset }
}

const pad = (n: number) => String(n).padStart(2, '0')
const viewer = computed(() => partsIn(undefined, now.value))
const viewerTime = computed(() => `${pad(viewer.value.hour)}:${pad(viewer.value.minute)}`)

function clock(p: Person): Clock {
  const t = partsIn(p.tz, now.value)
  const hour = t.hour + t.minute / 60
  const diff = t.offset - viewer.value.offset
  const abs = Math.abs(diff)
  const rel = diff === 0 ? 'Your time' : `${diff > 0 ? '+' : '−'}${Math.floor(abs / 60)} h${abs % 60 ? ` ${abs % 60}` : ''}`
  const weekend = t.weekday === 'Sat' || t.weekday === 'Sun'
  const inHours = !weekend && hour >= p.start && hour < p.end
  const left = Math.round((p.end - hour) * 60)
  const state = !inHours ? 'off' : left <= 60 ? 'late' : 'in'
  const status = weekend ? 'Weekend' : state === 'late' ? `Signs off in ${left} min` : state === 'in' ? `Working until ${pad(p.end)}:00` : hour < p.start ? `Starts at ${pad(p.start)}:00` : 'Off for the day'
  return { time: `${pad(t.hour)}:${pad(t.minute)}`, day: t.weekday !== viewer.value.weekday ? t.weekday : '', rel, state, status, hour, start: p.start, end: p.end }
}

const initial = (p: Person) => p.name.normalize('NFD').charAt(0).toUpperCase()
const countBy = (d: Dept) => people.filter(p => p.dept === d).length
const toggleDept = (d: Dept) => { depts.value = depts.value.includes(d) ? depts.value.filter(x => x !== d) : [...depts.value, d] }
// Every local time derives from the shared clock, computed once per tick.
const clocks = computed(() => Object.fromEntries(people.map(p => [p.id, clock(p)])) as Record<string, Clock>)
const workingCount = computed(() => people.filter(p => clocks.value[p.id]!.state !== 'off').length)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return people
    .filter(p => (!depts.value.length || depts.value.includes(p.dept))
      && (!reachable.value || clocks.value[p.id]!.state !== 'off')
      && (!q || `${p.name} ${p.role} ${p.city}`.toLowerCase().includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p, i, list) => ({ ...p, c: clocks.value[p.id]!, letter: initial(p), first: i === 0 || initial(list[i - 1]!) !== initial(p) }))
})
const sections = computed(() => {
  const out: { letter: string, people: typeof filtered.value }[] = []
  for (const p of filtered.value) {
    const last = out[out.length - 1]
    if (last && !p.first) last.people.push(p)
    else out.push({ letter: p.letter, people: [p] })
  }
  return out
})
const letters = computed(() => new Set(sections.value.map(s => s.letter)))

// The scrubber tracks the section at the top of the list with an observer, so scrolling never reads layout.
const scroller = ref<HTMLElement | null>(null)
const current = ref('A')
let io: IntersectionObserver | undefined
function observe() {
  io?.disconnect()
  if (!scroller.value) return
  io = new IntersectionObserver((entries) => {
    // Entries arrive in document order; cards sharing a row resolve to the first letter of that row.
    const hit = entries.find(e => e.isIntersecting)
    if (hit) current.value = (hit.target as HTMLElement).dataset.letter ?? current.value
  }, { root: scroller.value, rootMargin: '0px 0px -80% 0px' })
  scroller.value.querySelectorAll('[data-letter]').forEach(el => io!.observe(el))
}
onMounted(observe)
onBeforeUnmount(() => io?.disconnect())
watch([sections, view], () => nextTick(observe))

function jump(l: string) {
  const box = scroller.value
  const target = box?.querySelector<HTMLElement>(`[data-letter="${l}"]`)
  if (!box || !target) return
  // One read on click: where the section sits inside the scroller.
  const top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - (view.value === 'table' ? 38 : 12)
  box.scrollTo({ top, behavior: 'smooth' })
  current.value = l
}
</script>

<style scoped>
.tdir { --tdir-t3: color-mix(in srgb, var(--mi-label2) 78%, transparent); container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.tdir__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.tdir__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 20px; }
.tdir__title { display: grid; gap: 2px; min-width: 0; }
.tdir__chips .tdir__live { margin-inline-end: 6px; box-shadow: none; }
.tdir__live { display: inline-block; width: 7px; height: 7px; margin-inline-end: 7px; border-radius: 50%; vertical-align: 1px; background: var(--mi-green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-green) 22%, transparent); }

.tdir__filters { display: grid; gap: 10px; }
.tdir__search { max-width: 320px; min-width: 0; }
.tdir__view { flex: none; }
.tdir__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.tdir__body { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 26px; gap: 6px; min-width: 0; }
.tdir__scroll {
  position: relative; height: 412px; overflow: auto; overscroll-behavior: contain; border-radius: var(--mi-radius-xl);
  background: var(--mi-card); border: 1px solid var(--mi-sep); box-shadow: var(--mi-sh1);
}
.tdir__scroll:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }

/* Scrubber: compact vertical index like a phone's contact list. */
.tdir__az { display: flex; flex-direction: column; justify-content: space-between; padding: 6px 0; }
.tdir__az-btn {
  display: grid; place-items: center; height: 14px; padding: 0; border: 0; border-radius: 4px; background: none;
  font: inherit; font-size: 10px; font-weight: 700; line-height: 1; color: var(--mi-p-text); cursor: pointer;
  transition: transform var(--mi-dur-1) var(--mi-ease), opacity var(--mi-dur-1) var(--mi-ease);
}
.tdir__az-btn:hover:not(:disabled) { transform: scale(1.35); }
.tdir__az-btn:disabled { color: var(--tdir-t3); opacity: .45; cursor: default; }
.tdir__az-btn[aria-current="true"] { background: var(--mi-p); color: var(--mi-p-on); }
.tdir__az-btn:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }

.tdir__table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
.tdir__table thead th {
  position: sticky; top: 0; z-index: 3; height: 38px; padding: 0 14px; text-align: start; white-space: nowrap;
  font-size: 11px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase; color: var(--tdir-t3);
  background: var(--mi-card); border-bottom: 1px solid var(--mi-sep);
}
.tdir__letter {
  margin: 0; padding: 6px 14px; font-size: 12px; font-weight: 700; letter-spacing: .04em; text-align: start; color: var(--mi-p-text);
  background: color-mix(in srgb, var(--mi-fill4) 70%, var(--mi-card)); border-bottom: 1px solid var(--mi-sep);
}
.tdir__table .tdir__letter { position: sticky; top: 38px; z-index: 2; }
.tdir__row td { padding: 10px 14px; border-bottom: 1px solid var(--mi-sep); vertical-align: middle; }
.tdir__row:hover td { background: color-mix(in srgb, var(--mi-fill4) 55%, transparent); }
.tdir__table tbody:last-of-type .tdir__row:last-child td { border-bottom: 0; }
.tdir__table .c-dept, .tdir__table .c-loc { display: none; }
.tdir__table .c-act { display: none; width: 48px; padding-inline: 4px 10px; text-align: end; }
.tdir__table .c-time { width: 124px; padding-inline-start: 4px; }

.tdir__who { display: flex; align-items: center; gap: 10px; min-width: 0; }
.tdir__who-text { display: grid; min-width: 0; }
.tdir__name { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tdir__role { font-size: 12px; color: var(--mi-label2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.tdir__dept { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--mi-label2); white-space: nowrap; }
.tdir__dept::before { content: ""; width: 7px; height: 7px; border-radius: 2px; background: var(--mi-label3); }
.tdir__dept[data-dept="Design"]::before { background: var(--mi-pink); }
.tdir__dept[data-dept="Engineering"]::before { background: var(--mi-p); }
.tdir__dept[data-dept="Product"]::before { background: var(--mi-orange); }
.tdir__dept[data-dept="Sales"]::before { background: var(--mi-teal); }
.tdir__dept[data-dept="Support"]::before { background: var(--mi-purple); }

/* Local time cell: time and offset on the left, a 24 h strip and the working state on the right. */
.tdir__time { display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "clock rel" "day day" "status status"; align-items: center; gap: 4px 8px; min-width: 0; }
.tdir__clock { grid-area: clock; }
.tdir__rel { grid-area: rel; justify-self: end; }
.tdir__day { grid-area: day; }
.tdir__status { grid-area: status; }
.tdir__clock { display: inline-flex; align-items: baseline; gap: 4px; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -.01em; }
.tdir__rel { font-size: 11px; color: var(--tdir-t3); font-variant-numeric: tabular-nums; white-space: nowrap; }
/* overflow-x: clip keeps the full-width "now" layer, shifted by translateX, from widening the table's scroll area. */
.tdir__day { position: relative; height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow-x: clip; overflow-clip-margin: 2px; }
.tdir__work { position: absolute; top: 0; bottom: 0; border-radius: 2px; background: color-mix(in srgb, var(--mi-label2) 35%, transparent); }
.is-in .tdir__work, .is-late .tdir__work { background: color-mix(in srgb, var(--mi-green) 60%, transparent); }
.is-late .tdir__work { background: color-mix(in srgb, var(--mi-orange) 60%, transparent); }
.tdir__now { position: absolute; inset: -3px 0; transition: transform var(--mi-dur-4) var(--mi-ease); }
.tdir__now i { position: absolute; top: 0; left: -1px; width: 2px; height: 10px; border-radius: 1px; background: var(--mi-label); }
.tdir__status { font-size: 11px; color: var(--tdir-t3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.is-in .tdir__status { color: var(--mi-green-t); }
.is-late .tdir__status { color: var(--mi-orange-t); }

/* Card view. */
.tdir__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 10px; margin: 0; padding: 12px; list-style: none; }
.tdir__card {
  display: grid; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card);
  border: 1px solid var(--mi-sep); transition: transform var(--mi-dur-2) var(--mi-ease);
}
.tdir__card:hover { transform: translateY(-2px); }
.tdir__card-top { display: flex; align-items: flex-start; gap: 8px; }
.tdir__card-top > :first-child { margin-inline-end: auto; }
.tdir__card { scroll-margin-top: 12px; }
.tdir__card-id { display: grid; gap: 1px; min-width: 0; }
.tdir__card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 12px; }
.tdir__city { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--mi-label2); }
.tdir__card .tdir__time { padding-top: 12px; border-top: 1px solid var(--mi-sep); }

.tdir__none { margin: 0; padding: 48px 16px; text-align: center; font-size: 13px; color: var(--mi-label2); }

@container (min-width: 640px) {
  .tdir__time { grid-template-columns: 58px minmax(0, 1fr); grid-template-areas: "clock day" "rel status"; gap: 3px 12px; }
  .tdir__rel { justify-self: start; }
  .tdir__table .c-time { width: 230px; padding-inline-start: 14px; }
  .tdir__table .c-act { display: table-cell; }
  .tdir__table .c-loc { display: table-cell; white-space: nowrap; }
  .tdir__table td.c-loc { color: var(--mi-label2); }
  .tdir__role-more { display: none; }
}
@container (min-width: 960px) {
  .tdir__filters { grid-template-columns: minmax(200px, 280px) minmax(0, 1fr); align-items: center; }
  .tdir__chips { justify-content: flex-end; }
}
@container (min-width: 860px) {
  .tdir__table .c-dept { display: table-cell; }
  .tdir__body { grid-template-columns: minmax(0, 1fr) 28px; gap: 8px; }
}
</style>
