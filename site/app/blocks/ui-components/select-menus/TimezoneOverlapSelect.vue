<template>
  <section class="tzo" aria-labelledby="tzo-title">
    <header class="tzo__head">
      <MiText id="tzo-title" variant="title3" as="h2" weight="semibold">Find a standup slot</MiText>
      <MiText variant="footnote" tone="label2">Working hours 9:00 to 17:00 on both sides · times for Monday, Nov 2</MiText>
    </header>

    <div class="tzo__fields">
      <MiField label="You are in">
        <MiSelect v-model="mine" :options="options" />
      </MiField>
      <MiField label="Teammate is in">
        <MiSelect v-model="theirs" :options="options" />
      </MiField>
    </div>

    <div class="tzo__body">
      <!-- The teammate select drawn open: a listbox panel hanging from its field. -->
      <div class="tzo__open" aria-label="Teammate city list, shown open" role="group">
        <div class="tzo__fake-field" aria-hidden="true">
          <span>{{ zoneOf(theirs).label }}</span>
          <MiIcon name="chevron-up" :size="16" />
        </div>
        <div class="tzo__listbox">
          <MiList :grouped="false" label="Cities">
            <MiListItem
              v-for="z in zones" :key="z.value" button :title="z.label" :subtitle="z.region"
              :aria-pressed="z.value === theirs" :class="{ 'is-on': z.value === theirs }" @click="theirs = z.value"
            >
              <template #trailing>
                <span class="tzo__time">{{ clock(nowUtc + z.offset) }}</span>
                <MiIcon :name="z.value === theirs ? 'check' : 'dash'" :size="16" :class="z.value === theirs ? 'tzo__check' : 'tzo__nocheck'" />
              </template>
            </MiListItem>
          </MiList>
        </div>
      </div>

      <!-- Overlap story: both workdays on one axis, in your local time. -->
      <article class="tzo__viz">
        <div class="tzo__verdict" aria-live="polite">
          <p class="tzo__big">{{ overlap.hours ? fmtHours(overlap.hours) : 'No overlap' }}</p>
          <MiText variant="footnote" tone="label2">{{ verdict }}</MiText>
        </div>

        <div class="tzo__rows">
          <div v-for="row in lanes" :key="row.name" class="tzo__lane">
            <MiText variant="caption" weight="semibold" class="tzo__lane-name">{{ row.name }}</MiText>
            <div class="tzo__cells" role="img" :aria-label="row.name + ' working hours'">
              <i v-for="(on, i) in row.cells" :key="i" :class="{ 'is-on': on, 'is-both': overlapCells[i] }" />
            </div>
          </div>
          <div class="tzo__axis" aria-hidden="true">
            <span v-for="h in [0, 6, 12, 18, 24]" :key="h" :style="{ left: (h / 24) * 100 + '%' }">{{ h === 24 ? '' : String(h).padStart(2, '0') }}</span>
          </div>
        </div>

        <div v-if="overlap.hours" class="tzo__slot">
          <MiIcon name="calendar" :size="18" />
          <MiText variant="subheadline" weight="medium">Suggested: {{ clock(overlap.start) }} for you, {{ clock(overlap.start + delta) }} for them</MiText>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Zone { value: string, label: string, region: string, offset: number }
// Offsets valid for early November 2026 (US and EU daylight time over, Sydney on daylight time).
const zones: Zone[] = [
  { value: 'sf', label: 'San Francisco', region: 'UTC−8', offset: -8 },
  { value: 'nyc', label: 'New York', region: 'UTC−5', offset: -5 },
  { value: 'sao', label: 'São Paulo', region: 'UTC−3', offset: -3 },
  { value: 'lon', label: 'London', region: 'UTC+0', offset: 0 },
  { value: 'par', label: 'Paris', region: 'UTC+1', offset: 1 },
  { value: 'nbo', label: 'Nairobi', region: 'UTC+3', offset: 3 },
  { value: 'blr', label: 'Bengaluru', region: 'UTC+5:30', offset: 5.5 },
  { value: 'sin', label: 'Singapore', region: 'UTC+8', offset: 8 },
  { value: 'syd', label: 'Sydney', region: 'UTC+11', offset: 11 }
]
const nowUtc = 14.5 // 14:30 UTC, fixed so the demo reads the same for everyone

const mod24 = (h: number) => ((h % 24) + 24) % 24
function clock(h: number) {
  const t = mod24(h)
  return `${String(Math.floor(t)).padStart(2, '0')}:${t % 1 ? '30' : '00'}`
}
const fmtHours = (h: number) => `${h % 1 ? h.toFixed(1) : h} h overlap`

const options = zones.map(z => ({ value: z.value, label: z.label, description: `${z.region} · ${clock(nowUtc + z.offset)} now` }))
const mine = ref<string | number | null>('par')
const theirs = ref<string | number | null>('blr')
const zoneOf = (v: string | number | null) => zones.find(z => z.value === v) ?? zones[4]!

const delta = computed(() => zoneOf(theirs.value).offset - zoneOf(mine.value).offset)
// 48 half-hour cells along your local day.
const work = (shift: number) => Array.from({ length: 48 }, (_, i) => { const t = mod24(i / 2 + shift); return t >= 9 && t < 17 })
const lanes = computed(() => [
  { name: 'You', cells: work(0) },
  { name: zoneOf(theirs.value).label, cells: work(delta.value) }
])
const overlapCells = computed(() => lanes.value[0]!.cells.map((on, i) => on && lanes.value[1]!.cells[i]!))
const overlap = computed(() => {
  const first = overlapCells.value.indexOf(true)
  const count = overlapCells.value.filter(Boolean).length
  return { hours: count / 2, start: first < 0 ? 0 : first / 2 }
})
const verdict = computed(() => {
  const { hours, start } = overlap.value
  if (!hours) return `${zoneOf(theirs.value).label} starts work as you finish. Try an async update instead.`
  return `${clock(start)} to ${clock(start + hours)} your time. ${hours <= 2 ? 'Tight: keep the standup short.' : 'Room for a standup and a follow-up.'}`
})
</script>

<style scoped>
.tzo { container-type: inline-size; display: grid; align-content: start; gap: 18px; font-family: var(--mi-font); color: var(--mi-label); }
.tzo__head { display: grid; gap: 2px; }
.tzo__fields { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 520px) { .tzo__fields { grid-template-columns: 1fr 1fr; } }
.tzo__body { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 760px) { .tzo__body { grid-template-columns: 280px minmax(0, 1fr); } }

.tzo__open { display: grid; gap: 6px; }
.tzo__fake-field { display: flex; align-items: center; justify-content: space-between; height: 40px; padding: 0 12px; border-radius: var(--mi-radius-m); background: var(--mi-field); box-shadow: 0 0 0 2px var(--mi-p); font-size: 15px; color: var(--mi-label2); }
.tzo__listbox { max-height: 264px; overflow-y: auto; padding: 4px; border-radius: var(--mi-radius-l); background: var(--mi-elev); box-shadow: var(--mi-sh3); overscroll-behavior: contain; }
.tzo__listbox .is-on { border-radius: var(--mi-radius-s); background: var(--mi-p-tint); }
.tzo__time { font-size: 13px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.tzo__check { color: var(--mi-p-text); }
.tzo__nocheck { opacity: 0; }

.tzo__viz { display: grid; gap: 18px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.tzo__verdict { display: grid; gap: 4px; }
.tzo__big { margin: 0; font-size: clamp(30px, 7cqi, 44px); line-height: 1; font-weight: 700; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }

.tzo__rows { display: grid; gap: 10px; padding-bottom: 18px; position: relative; }
.tzo__lane { display: grid; gap: 4px; }
.tzo__lane-name { color: var(--mi-label2); }
.tzo__cells { display: grid; grid-template-columns: repeat(48, minmax(0, 1fr)); gap: 1px; height: 22px; }
.tzo__cells i { border-radius: 2px; background: var(--mi-fill3); }
.tzo__cells i.is-on { background: var(--mi-fill); }
.tzo__cells i.is-both { background: var(--mi-p); }
.tzo__axis { position: absolute; left: 0; right: 0; bottom: 0; height: 14px; }
.tzo__axis span { position: absolute; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }

.tzo__slot { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-m); background: var(--mi-p-tint); color: var(--mi-p-text); }
</style>
