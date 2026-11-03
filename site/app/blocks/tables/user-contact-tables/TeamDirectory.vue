<template>
  <section class="mi:[--tdir-t3:color-mix(in_srgb,_var(--mi-label2)_78%,_transparent)] mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="tdir-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="mi:grid mi:gap-0.5 mi:min-w-0">
        <MiText id="tdir-title" variant="title3" as="h2" weight="semibold">Team directory</MiText>
        <MiText variant="footnote" tone="label2" tabular>
          <span class="mi:inline-block mi:w-[7px] mi:h-[7px] mi:me-[7px] mi:rounded-[50%] mi:[vertical-align:1px] mi:[background:var(--mi-green)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-green)_22%,_transparent)]" aria-hidden="true" />{{ workingCount }} of {{ people.length }} people are in working hours · your time {{ viewerTime }}
        </MiText>
      </div>
      <div class="mi:flex-[none]"><MiSegmented v-model="view" label="Layout" :options="views" /></div>
    </header>

    <div class="mi:grid mi:gap-2.5 mi:@[960px]:grid-cols-[minmax(200px,_280px)_minmax(0,_1fr)] mi:@[960px]:items-center">
      <div class="mi:max-w-80 mi:min-w-0"><MiSearch v-model="query" size="compact" placeholder="Name, role or city" aria-label="Search people" /></div>
      <div class="mi:flex mi:flex-wrap mi:gap-1.5 mi:@[960px]:[justify-content:flex-end]" role="group" aria-label="Filter by department">
        <MiChip
          v-for="d in departments" :key="d" selectable size="small" tone="neutral" :model-value="depts.includes(d)"
          :label="`${d} ${countBy(d)}`" @update:model-value="toggleDept(d)"
        />
        <MiChip v-model="reachable" selectable size="small" tone="primary"><span class="mi:me-1.5 mi:shadow-none mi:inline-block mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[vertical-align:1px] mi:[background:var(--mi-green)]" aria-hidden="true" />Working now</MiChip>
      </div>
    </div>

    <div class="mi:relative mi:grid mi:grid-cols-[minmax(0,_1fr)_26px] mi:gap-1.5 mi:min-w-0 mi:@[860px]:grid-cols-[minmax(0,_1fr)_28px] mi:@[860px]:gap-2">
      <div ref="scroller" class="mi:relative mi:h-103 mi:overflow-auto mi:overscroll-contain mi:rounded-xl mi:[background:var(--mi-card)] mi:border mi:border-sep mi:shadow-1 mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" tabindex="0" aria-label="People" role="region">
        <!-- Table view: one row group per letter, so the scrubber has a target in both layouts. -->
        <table v-if="view === 'table'" class="mi:w-full mi:border-separate mi:[border-spacing:0] mi:text-[13px]">
          <caption class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">People sorted by first name, with their local time</caption>
          <thead>
            <tr>
              <th class="mi:sticky mi:top-0 mi:z-3 mi:py-0 mi:px-3.5 mi:text-start mi:whitespace-nowrap mi:h-9.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-(--tdir-t3) mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep" scope="col">Person</th>
              <th scope="col" class="mi:sticky mi:top-0 mi:z-3 mi:py-0 mi:px-3.5 mi:text-start mi:whitespace-nowrap mi:h-9.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-(--tdir-t3) mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:hidden mi:@[860px]:table-cell">Department</th>
              <th scope="col" class="mi:sticky mi:top-0 mi:z-3 mi:py-0 mi:px-3.5 mi:text-start mi:whitespace-nowrap mi:h-9.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-(--tdir-t3) mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:hidden mi:@[640px]:table-cell">Location</th>
              <th scope="col" class="mi:sticky mi:top-0 mi:z-3 mi:py-0 mi:ps-1 mi:pe-3.5 mi:@[640px]:ps-3.5 mi:text-start mi:whitespace-nowrap mi:h-9.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-(--tdir-t3) mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:w-31 mi:@[640px]:w-57.5">Local time</th>
              <th scope="col" class="mi:sticky mi:top-0 mi:z-3 mi:py-0 mi:ps-1 mi:pe-2.5 mi:text-end mi:whitespace-nowrap mi:h-9.5 mi:text-[11px] mi:font-semibold mi:tracking-[.05em] mi:uppercase mi:text-(--tdir-t3) mi:[background:var(--mi-card)] mi:border-b mi:border-b-sep mi:hidden mi:w-12 mi:@[640px]:table-cell"><span class="mi:absolute mi:w-px mi:h-px mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap">Contact</span></th>
            </tr>
          </thead>
          <tbody v-for="sec in sections" :key="sec.letter">
            <tr>
              <th :id="`tdir-l-${sec.letter}`" :data-letter="sec.letter" scope="rowgroup" colspan="5" class="mi:sticky mi:top-9.5 mi:z-2 mi:m-0 mi:py-1.5 mi:px-3.5 mi:text-[12px] mi:font-bold mi:tracking-[.04em] mi:text-start mi:text-p-text mi:[background:color-mix(in_srgb,_var(--mi-fill4)_70%,_var(--mi-card))] mi:border-b mi:border-b-sep">{{ sec.letter }}</th>
            </tr>
            <tr v-for="p in sec.people" :key="p.id" class="mi:group">
              <td class="mi:py-2.5 mi:px-3.5 mi:border-b mi:border-b-sep mi:align-middle mi:group-hover:bg-fill4/55 mi:[tbody:last-of-type_tr:last-child_&]:[border-bottom:0]">
                <span class="mi:flex mi:items-center mi:gap-2.5 mi:min-w-0">
                  <MiAvatar :name="p.name" size="sm" tone="auto" decorative />
                  <span class="mi:grid mi:min-w-0">
                    <span class="mi:font-semibold mi:text-[14px] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ p.name }}</span>
                    <span class="mi:text-[12px] mi:text-label2 mi:overflow-hidden mi:text-ellipsis mi:whitespace-nowrap">{{ p.role }}<span class="mi:@[640px]:hidden"> · {{ p.dept }} · {{ p.city }}</span></span>
                  </span>
                </span>
              </td>
              <td class="mi:py-2.5 mi:px-3.5 mi:border-b mi:border-b-sep mi:align-middle mi:group-hover:bg-fill4/55 mi:[tbody:last-of-type_tr:last-child_&]:[border-bottom:0] mi:hidden mi:@[860px]:table-cell"><span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:font-medium mi:text-label2 mi:whitespace-nowrap mi:before:content-[''] mi:before:w-[7px] mi:before:h-[7px] mi:before:rounded-[2px] mi:before:[background:var(--mi-label3)] mi:[&[data-dept='Design']]:before:[background:var(--mi-pink)] mi:[&[data-dept='Engineering']]:before:[background:var(--mi-p)] mi:[&[data-dept='Product']]:before:[background:var(--mi-orange)] mi:[&[data-dept='Sales']]:before:[background:var(--mi-teal)] mi:[&[data-dept='Support']]:before:[background:var(--mi-purple)]" :data-dept="p.dept">{{ p.dept }}</span></td>
              <td class="mi:py-2.5 mi:px-3.5 mi:border-b mi:border-b-sep mi:align-middle mi:group-hover:bg-fill4/55 mi:[tbody:last-of-type_tr:last-child_&]:[border-bottom:0] mi:@[640px]:whitespace-nowrap mi:@[640px]:text-label2 mi:hidden mi:@[640px]:table-cell">{{ p.city }}</td>
              <td class="mi:py-2.5 mi:ps-1 mi:pe-3.5 mi:@[640px]:ps-3.5 mi:border-b mi:border-b-sep mi:align-middle mi:group-hover:bg-fill4/55 mi:[tbody:last-of-type_tr:last-child_&]:[border-bottom:0] mi:w-31 mi:@[640px]:w-57.5">
                <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:[grid-template-areas:'clock_rel'_'day_day'_'status_status'] mi:items-center mi:gap-y-1 mi:gap-x-2 mi:min-w-0 mi:@[640px]:grid-cols-[58px_minmax(0,_1fr)] mi:@[640px]:[grid-template-areas:'clock_day'_'rel_status'] mi:@[640px]:gap-y-[3px] mi:@[640px]:gap-x-3">
                  <span class="mi:[grid-area:clock] mi:inline-flex mi:items-baseline mi:gap-1 mi:text-[15px] mi:font-semibold mi:tabular-nums mi:tracking-[-.01em]">{{ p.c.time }}</span>
                  <div class="mi:[grid-area:day] mi:relative mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-x-clip mi:[overflow-clip-margin:2px]" aria-hidden="true">
                    <i class="mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[2px]" :class="p.c.state === 'in' ? 'mi:bg-green/60' : p.c.state === 'late' ? 'mi:bg-orange/60' : 'mi:[background:color-mix(in_srgb,_var(--mi-label2)_35%,_transparent)]'" :style="{ insetInlineStart: `${(p.c.start / 24) * 100}%`, width: `${((p.c.end - p.c.start) / 24) * 100}%` }" />
                    <span class="mi:absolute mi:inset-y-[-3px] mi:inset-x-0 mi:[transition:transform_var(--mi-dur-4)_var(--mi-ease)]" :style="{ transform: `translateX(${(p.c.hour / 24) * 100}%)` }"><i class="mi:absolute mi:top-0 mi:-left-px mi:w-0.5 mi:h-2.5 mi:rounded-[1px] mi:[background:var(--mi-label)]" /></span>
                  </div>
                  <span class="mi:[grid-area:rel] mi:justify-self-end mi:text-[11px] mi:text-(--tdir-t3) mi:tabular-nums mi:whitespace-nowrap mi:@[640px]:justify-self-start">{{ p.c.rel }}<template v-if="p.c.day"> · {{ p.c.day }}</template></span>
                  <span class="mi:[grid-area:status] mi:text-[11px] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis" :class="p.c.state === 'in' ? 'mi:text-green-t' : p.c.state === 'late' ? 'mi:text-orange-t' : 'mi:text-(--tdir-t3)'">{{ p.c.status }}</span>
                </div>
              </td>
              <td class="mi:py-2.5 mi:ps-1 mi:pe-2.5 mi:text-end mi:border-b mi:border-b-sep mi:align-middle mi:group-hover:bg-fill4/55 mi:[tbody:last-of-type_tr:last-child_&]:[border-bottom:0] mi:hidden mi:w-12 mi:@[640px]:table-cell">
                <MiIconButton size="small" variant="plain" :label="`Message ${p.name}`"><MiIcon name="chat" :size="16" /></MiIconButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Card view: one continuous grid; the first card of each letter carries the scrubber target. -->
        <ul v-else class="mi:grid mi:grid-cols-[repeat(auto-fill,_minmax(196px,_1fr))] mi:gap-2.5 mi:m-0 mi:p-3 mi:[list-style:none]">
          <li v-for="p in filtered" :key="p.id" class="mi:grid mi:gap-3 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:border mi:border-sep mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:hover:transform-[translateY(-2px)] mi:[scroll-margin-top:12px]" :data-letter="p.first ? p.letter : undefined">
            <div class="mi:flex mi:[align-items:flex-start] mi:gap-2">
                  <MiAvatar class="mi:me-auto!" :name="p.name" size="md" tone="auto" decorative />
                  <MiIconButton size="small" variant="gray" :label="`Message ${p.name}`"><MiIcon name="chat" :size="15" /></MiIconButton>
                </div>
                <div class="mi:grid mi:gap-px mi:min-w-0">
                  <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
                  <MiText variant="caption" tone="label2" :lines="1">{{ p.role }}</MiText>
                </div>
                <div class="mi:flex mi:flex-wrap mi:items-center mi:gap-y-1 mi:gap-x-3">
                  <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:text-[12px] mi:font-medium mi:text-label2 mi:whitespace-nowrap mi:before:content-[''] mi:before:w-[7px] mi:before:h-[7px] mi:before:rounded-[2px] mi:before:[background:var(--mi-label3)] mi:[&[data-dept='Design']]:before:[background:var(--mi-pink)] mi:[&[data-dept='Engineering']]:before:[background:var(--mi-p)] mi:[&[data-dept='Product']]:before:[background:var(--mi-orange)] mi:[&[data-dept='Sales']]:before:[background:var(--mi-teal)] mi:[&[data-dept='Support']]:before:[background:var(--mi-purple)]" :data-dept="p.dept">{{ p.dept }}</span>
                  <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:text-label2"><MiIcon name="globe" :size="12" />{{ p.city }}</span>
                </div>
                <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:[grid-template-areas:'clock_rel'_'day_day'_'status_status'] mi:items-center mi:gap-y-1 mi:gap-x-2 mi:min-w-0 mi:pt-3 mi:border-t mi:border-t-sep mi:@[640px]:grid-cols-[58px_minmax(0,_1fr)] mi:@[640px]:[grid-template-areas:'clock_day'_'rel_status'] mi:@[640px]:gap-y-[3px] mi:@[640px]:gap-x-3">
                  <span class="mi:[grid-area:clock] mi:inline-flex mi:items-baseline mi:gap-1 mi:text-[15px] mi:font-semibold mi:tabular-nums mi:tracking-[-.01em]">{{ p.c.time }}</span>
                  <div class="mi:[grid-area:day] mi:relative mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)] mi:overflow-x-clip mi:[overflow-clip-margin:2px]" aria-hidden="true">
                    <i class="mi:absolute mi:top-0 mi:bottom-0 mi:rounded-[2px]" :class="p.c.state === 'in' ? 'mi:bg-green/60' : p.c.state === 'late' ? 'mi:bg-orange/60' : 'mi:[background:color-mix(in_srgb,_var(--mi-label2)_35%,_transparent)]'" :style="{ insetInlineStart: `${(p.c.start / 24) * 100}%`, width: `${((p.c.end - p.c.start) / 24) * 100}%` }" />
                    <span class="mi:absolute mi:inset-y-[-3px] mi:inset-x-0 mi:[transition:transform_var(--mi-dur-4)_var(--mi-ease)]" :style="{ transform: `translateX(${(p.c.hour / 24) * 100}%)` }"><i class="mi:absolute mi:top-0 mi:-left-px mi:w-0.5 mi:h-2.5 mi:rounded-[1px] mi:[background:var(--mi-label)]" /></span>
                  </div>
                  <span class="mi:[grid-area:rel] mi:justify-self-end mi:text-[11px] mi:text-(--tdir-t3) mi:tabular-nums mi:whitespace-nowrap mi:@[640px]:justify-self-start">{{ p.c.rel }}<template v-if="p.c.day"> · {{ p.c.day }}</template></span>
                  <span class="mi:[grid-area:status] mi:text-[11px] mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis" :class="p.c.state === 'in' ? 'mi:text-green-t' : p.c.state === 'late' ? 'mi:text-orange-t' : 'mi:text-(--tdir-t3)'">{{ p.c.status }}</span>
                </div>
          </li>
        </ul>

        <p v-if="!sections.length" class="mi:m-0 mi:py-12 mi:px-4 mi:text-center mi:text-[13px] mi:text-label2">Nobody matches these filters.</p>
      </div>

      <!-- A–Z scrubber: letters with people are buttons, the letter in view is marked current. -->
      <nav class="mi:flex mi:flex-col mi:justify-between mi:py-1.5 mi:px-0" aria-label="Jump to letter">
        <button
          v-for="l in alphabet" :key="l" type="button" class="mi:[font:inherit] mi:text-[10px] mi:font-bold mi:leading-none mi:disabled:text-(--tdir-t3) mi:aria-current:text-p-on mi:grid mi:place-items-center mi:h-3.5 mi:p-0 mi:[border:0] mi:rounded-[4px] mi:[background:none] mi:text-p-text mi:cursor-pointer mi:[transition:transform_var(--mi-dur-1)_var(--mi-ease),_opacity_var(--mi-dur-1)_var(--mi-ease)] mi:[&:hover:not(:disabled)]:transform-[scale(1.35)] mi:disabled:opacity-45 mi:disabled:cursor-default mi:aria-current:[background:var(--mi-p)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]" :disabled="!letters.has(l)"
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
