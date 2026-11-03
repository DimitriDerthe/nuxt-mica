<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4.5 mi:font-mi mi:text-label" aria-labelledby="tzo-title">
    <header class="mi:grid mi:gap-0.5">
      <MiText id="tzo-title" variant="title3" as="h2" weight="semibold">Find a standup slot</MiText>
      <MiText variant="footnote" tone="label2">Working hours 9:00 to 17:00 on both sides · times for Monday, Nov 2</MiText>
    </header>

    <div class="mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]:grid-cols-[1fr_1fr]">
      <MiField label="You are in">
        <MiSelect v-model="mine" :options="options" />
      </MiField>
      <MiField label="Teammate is in">
        <MiSelect v-model="theirs" :options="options" />
      </MiField>
    </div>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]:grid-cols-[280px_minmax(0,_1fr)]">
      <!-- The teammate select drawn open: a listbox panel hanging from its field. -->
      <div class="mi:grid mi:gap-1.5" aria-label="Teammate city list, shown open" role="group">
        <div class="mi:flex mi:items-center mi:justify-between mi:h-10 mi:py-0 mi:px-3 mi:rounded-md mi:bg-field mi:shadow-[0_0_0_2px_var(--mi-p)] mi:text-[15px] mi:text-label2" aria-hidden="true">
          <span>{{ zoneOf(theirs).label }}</span>
          <MiIcon name="chevron-up" :size="16" />
        </div>
        <div class="mi:max-h-66 mi:overflow-y-auto mi:p-1 mi:rounded-lg mi:bg-elev mi:shadow-3 mi:overscroll-contain">
          <MiList :grouped="false" label="Cities">
            <MiListItem
              v-for="z in zones" :key="z.value" button :title="z.label" :subtitle="z.region"
              :aria-pressed="z.value === theirs" :class="z.value === theirs ? 'mi:rounded-sm! mi:bg-p-tint' : ''" @click="theirs = z.value"
            >
              <template #trailing>
                <span class="mi:text-[13px] mi:text-label2 mi:tabular-nums">{{ clock(nowUtc + z.offset) }}</span>
                <MiIcon :name="z.value === theirs ? 'check' : 'dash'" :size="16" :class="z.value === theirs ? 'mi:text-p-text' : 'mi:opacity-0'" />
              </template>
            </MiListItem>
          </MiList>
        </div>
      </div>

      <!-- Overlap story: both workdays on one axis, in your local time. -->
      <article class="mi:grid mi:gap-4.5 mi:p-5 mi:rounded-xl mi:bg-card mi:shadow-1">
        <div class="mi:grid mi:gap-1" aria-live="polite">
          <p class="mi:m-0 mi:text-[clamp(30px,_7cqi,_44px)] mi:leading-none mi:font-bold mi:tracking-[-.04em] mi:tabular-nums">{{ overlap.hours ? fmtHours(overlap.hours) : 'No overlap' }}</p>
          <MiText variant="footnote" tone="label2">{{ verdict }}</MiText>
        </div>

        <div class="mi:grid mi:gap-2.5 mi:pb-4.5 mi:relative">
          <div v-for="row in lanes" :key="row.name" class="mi:grid mi:gap-1">
            <MiText variant="caption" weight="semibold" class="mi:text-label2!">{{ row.name }}</MiText>
            <div class="mi:grid mi:grid-cols-48 mi:gap-px mi:h-5.5" role="img" :aria-label="row.name + ' working hours'">
              <i class="mi:rounded-[2px]" v-for="(on, i) in row.cells" :key="i" :class="overlapCells[i] ? 'mi:bg-p' : on ? 'mi:bg-fill' : 'mi:bg-fill3'" />
            </div>
          </div>
          <div class="mi:absolute mi:left-0 mi:right-0 mi:bottom-0 mi:h-3.5" aria-hidden="true">
            <span class="mi:text-label3 mi:absolute mi:text-[11px] mi:tabular-nums" v-for="h in [0, 6, 12, 18, 24]" :key="h" :style="{ left: (h / 24) * 100 + '%' }">{{ h === 24 ? '' : String(h).padStart(2, '0') }}</span>
          </div>
        </div>

        <div v-if="overlap.hours" class="mi:flex mi:items-center mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-md mi:bg-p-tint mi:text-p-text">
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

