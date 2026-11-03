<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="tz-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="tz-title" variant="title3" as="h2" weight="semibold">Product team</MiText>
        <MiText variant="footnote" tone="label2">{{ team.length }} people across {{ zones }} time zones</MiText>
      </div>
      <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Department">
        <MiChip
          v-for="d in depts" :key="d" selectable size="small" tone="neutral" :label="d"
          :model-value="dept === d" @update:model-value="dept = d"
        />
      </div>
    </header>

    <!-- Overlap ribbon: one bar per UTC hour, as tall as the number of people at work then. -->
    <div class="mi:grid mi:gap-3 mi:p-4 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1">
      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-2 mi:gap-x-3">
        <div>
          <MiText as="h3" variant="subheadline" weight="semibold">Meeting at {{ clock(hour * 60) }} UTC</MiText>
          <MiText variant="caption" tone="label2" aria-live="polite" tabular>{{ workingNow }} of {{ shown.length }} in working hours</MiText>
        </div>
        <MiButton size="small" variant="tinted" @click="hour = best">
          <template #leading><MiIcon name="star" :size="14" /></template>
          Best overlap
        </MiButton>
      </div>
      <div class="mi:grid mi:grid-cols-24 mi:items-end mi:gap-[3px] mi:h-16" role="group" aria-label="Pick a meeting hour (UTC)">
        <button
          v-for="(n, h) in overlap" :key="h" type="button" class="mi:group mi:flex mi:[align-items:flex-end] mi:h-full mi:p-0 mi:[border:0] mi:rounded-[4px] mi:[background:none] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]"
          :aria-pressed="h === hour" :aria-label="`${clock(h * 60)} UTC, ${n} available`" @click="hour = h"
        >
          <span class="mi:h-full mi:rounded-[4px] mi:block mi:w-full mi:origin-bottom mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="h === hour ? 'mi:bg-p' : 'mi:bg-[color-mix(in_srgb,_var(--mi-p)_28%,_var(--mi-fill2))] mi:group-hover:bg-[color-mix(in_srgb,_var(--mi-p)_45%,_var(--mi-fill2))]'" :style="{ transform: `scaleY(${Math.max(n, 0.25) / maxOverlap})` }" />
        </button>
      </div>
      <div class="mi:flex mi:justify-between mi:text-[10px] mi:tabular-nums mi:text-label3" aria-hidden="true"><span v-for="h in [0, 6, 12, 18, 23]" :key="h">{{ String(h).padStart(2, '0') }}</span></div>
    </div>

    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-2.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[560px]:grid-cols-2 mi:@[900px]:grid-cols-3">
      <li v-for="p in shown" :key="p.name" class="mi:grid mi:gap-2.5 mi:p-3.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:[transition:opacity_var(--mi-dur-3)_var(--mi-ease)]" :class="p.state === 'sleep' ? 'mi:opacity-62' : ''">
        <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-2.5">
          <MiBadge dot-only :tone="p.state === 'work' ? 'success' : p.state === 'off' ? 'warning' : 'neutral'" placement="bottom-right" :aria-label="stateLabel[p.state]">
            <template #target><MiAvatar :name="p.name" size="sm" tone="auto" decorative /></template>
          </MiBadge>
          <div class="mi:min-w-0">
            <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ p.role }} · {{ p.city }}</MiText>
          </div>
          <div class="mi:grid mi:justify-items-end mi:leading-[1.1]">
            <span class="mi:text-[20px] mi:font-650 mi:tracking-[-.02em] mi:tabular-nums">{{ clock(p.local) }}</span>
            <MiText as="span" variant="caption" tone="label2">{{ p.day }}</MiText>
          </div>
        </div>
        <!-- 24-hour strip in the person's own day: working hours tinted, the meeting slot outlined. -->
        <div class="mi:grid mi:grid-cols-24 mi:gap-0.5" aria-hidden="true">
          <i v-for="h in 24" :key="h" class="mi:h-2 mi:rounded-[2px]" :class="[h - 1 === Math.floor(p.local / 60) ? (p.state === 'work' ? 'mi:transform-[scaleY(1.6)] mi:bg-green' : 'mi:transform-[scaleY(1.6)] mi:bg-label') : p.works(h - 1) ? 'mi:bg-[color-mix(in_srgb,_var(--mi-green)_55%,_var(--mi-fill3))]' : 'mi:bg-fill3']" />
        </div>
        <MiText variant="caption" tone="label2">{{ stateLabel[p.state] }} · works {{ clock(p.start * 60) }}–{{ clock(p.end * 60) }}</MiText>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type State = 'work' | 'off' | 'sleep'
const stateLabel: Record<State, string> = { work: 'In working hours', off: 'Off hours', sleep: 'Probably asleep' }

// Sample team; `utc` is the offset in hours (November, so no summer time), work hours are local.
const team = [
  { name: 'Inès Moreau', role: 'Product lead', dept: 'Product', city: 'Paris', utc: 1, start: 9, end: 18 },
  { name: 'Kofi Mensah', role: 'Staff engineer', dept: 'Engineering', city: 'Accra', utc: 0, start: 8, end: 17 },
  { name: 'Saoirse Byrne', role: 'Product designer', dept: 'Design', city: 'Dublin', utc: 0, start: 9, end: 18 },
  { name: 'Yuki Tanaka', role: 'Mobile engineer', dept: 'Engineering', city: 'Tokyo', utc: 9, start: 10, end: 19 },
  { name: 'Arjun Mehta', role: 'Backend engineer', dept: 'Engineering', city: 'Bengaluru', utc: 5.5, start: 10, end: 19 },
  { name: 'Lena Vogel', role: 'Data analyst', dept: 'Product', city: 'Berlin', utc: 1, start: 8, end: 16 },
  { name: 'Tomás Ruiz', role: 'Frontend engineer', dept: 'Engineering', city: 'Mexico City', utc: -6, start: 9, end: 18 },
  { name: 'Noor Haddad', role: 'Content designer', dept: 'Design', city: 'Dubai', utc: 4, start: 9, end: 18 },
  { name: 'Ana Paula Souza', role: 'Design engineer', dept: 'Design', city: 'São Paulo', utc: -3, start: 9, end: 18 }
]

const depts = ['All', 'Product', 'Design', 'Engineering']
const dept = ref('All')
const hour = ref(13)

const zones = new Set(team.map(p => p.utc)).size
const days = ['Sun', 'Mon', 'Tue']
const clock = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const works = (p: typeof team[number], localHour: number) => localHour >= p.start && localHour < p.end

const shown = computed(() => team
  .filter(p => dept.value === 'All' || p.dept === dept.value)
  .map((p) => {
    const raw = hour.value * 60 + p.utc * 60
    const local = ((raw % 1440) + 1440) % 1440
    const h = Math.floor(local / 60)
    const state: State = works(p, h) ? 'work' : h >= 7 && h < 23 ? 'off' : 'sleep'
    return { ...p, local, state, day: days[1 + Math.floor(raw / 1440)], works: (x: number) => works(p, x) }
  }))

// Number of people at work for each UTC hour, for the current department.
const overlap = computed(() => Array.from({ length: 24 }, (_, h) => shown.value.filter((p) => {
  const local = Math.floor((((h + p.utc) % 24) + 24) % 24)
  return works(p, local)
}).length))
const maxOverlap = computed(() => Math.max(1, ...overlap.value))
const best = computed(() => overlap.value.indexOf(maxOverlap.value))
const workingNow = computed(() => shown.value.filter(p => p.state === 'work').length)
</script>
