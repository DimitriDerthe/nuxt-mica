<template>
  <section class="tz" aria-labelledby="tz-title">
    <header class="tz__head">
      <div>
        <MiText id="tz-title" variant="title3" as="h2" weight="semibold">Product team</MiText>
        <MiText variant="footnote" tone="label2">{{ team.length }} people across {{ zones }} time zones</MiText>
      </div>
      <div class="tz__chips" role="group" aria-label="Department">
        <MiChip
          v-for="d in depts" :key="d" selectable size="small" tone="neutral" :label="d"
          :model-value="dept === d" @update:model-value="dept = d"
        />
      </div>
    </header>

    <!-- Overlap ribbon: one bar per UTC hour, as tall as the number of people at work then. -->
    <div class="tz__ribbon-card">
      <div class="tz__ribbon-head">
        <div>
          <MiText as="h3" variant="subheadline" weight="semibold">Meeting at {{ clock(hour * 60) }} UTC</MiText>
          <MiText variant="caption" tone="label2" aria-live="polite" tabular>{{ workingNow }} of {{ shown.length }} in working hours</MiText>
        </div>
        <MiButton size="small" variant="tinted" @click="hour = best">
          <template #leading><MiIcon name="star" :size="14" /></template>
          Best overlap
        </MiButton>
      </div>
      <div class="tz__ribbon" role="group" aria-label="Pick a meeting hour (UTC)">
        <button
          v-for="(n, h) in overlap" :key="h" type="button" class="tz__hour" :class="{ 'is-on': h === hour }"
          :aria-pressed="h === hour" :aria-label="`${clock(h * 60)} UTC, ${n} available`" @click="hour = h"
        >
          <span :style="{ transform: `scaleY(${Math.max(n, 0.25) / maxOverlap})` }" />
        </button>
      </div>
      <div class="tz__axis" aria-hidden="true"><span v-for="h in [0, 6, 12, 18, 23]" :key="h">{{ String(h).padStart(2, '0') }}</span></div>
    </div>

    <ul class="tz__grid">
      <li v-for="p in shown" :key="p.name" class="tz__card" :class="'tz__card--' + p.state">
        <div class="tz__who">
          <MiBadge dot-only :tone="p.state === 'work' ? 'success' : p.state === 'off' ? 'warning' : 'neutral'" placement="bottom-right" :aria-label="stateLabel[p.state]">
            <template #target><MiAvatar :name="p.name" size="sm" tone="auto" decorative /></template>
          </MiBadge>
          <div class="tz__name">
            <MiText as="h3" variant="subheadline" weight="semibold" :lines="1">{{ p.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ p.role }} · {{ p.city }}</MiText>
          </div>
          <div class="tz__time">
            <span class="tz__clock">{{ clock(p.local) }}</span>
            <MiText as="span" variant="caption" tone="label2">{{ p.day }}</MiText>
          </div>
        </div>
        <!-- 24-hour strip in the person's own day: working hours tinted, the meeting slot outlined. -->
        <div class="tz__day" aria-hidden="true">
          <i v-for="h in 24" :key="h" :class="{ w: p.works(h - 1), now: h - 1 === Math.floor(p.local / 60) }" />
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

<style scoped>
.tz { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.tz__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.tz__chips { display: flex; flex-wrap: wrap; gap: 6px; }

.tz__ribbon-card { display: grid; gap: 12px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tz__ribbon-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.tz__ribbon { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); align-items: end; gap: 3px; height: 64px; }
.tz__hour { display: flex; align-items: flex-end; height: 100%; padding: 0; border: 0; border-radius: 4px; background: none; cursor: pointer; }
.tz__hour span {
  display: block; width: 100%; height: 100%; border-radius: 4px; background: color-mix(in srgb, var(--mi-p) 28%, var(--mi-fill2));
  transform-origin: bottom; transition: transform var(--mi-dur-3) var(--mi-spring);
}
.tz__hour:hover span { background: color-mix(in srgb, var(--mi-p) 45%, var(--mi-fill2)); }
.tz__hour.is-on span { background: var(--mi-p); }
.tz__hour:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.tz__axis { display: flex; justify-content: space-between; font-size: 10px; font-variant-numeric: tabular-nums; color: var(--mi-label3); }

.tz__grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 560px) { .tz__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 900px) { .tz__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.tz__card { display: grid; gap: 10px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); transition: opacity var(--mi-dur-3) var(--mi-ease); }
.tz__card--sleep { opacity: .62; }
.tz__who { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; }
.tz__name { min-width: 0; }
.tz__time { display: grid; justify-items: end; line-height: 1.1; }
.tz__clock { font-size: 20px; font-weight: 650; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.tz__day { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); gap: 2px; }
.tz__day i { height: 8px; border-radius: 2px; background: var(--mi-fill3); }
.tz__day i.w { background: color-mix(in srgb, var(--mi-green) 55%, var(--mi-fill3)); }
.tz__day i.now { background: var(--mi-label); transform: scaleY(1.6); }
.tz__card--work .tz__day i.now { background: var(--mi-green); }
</style>
