<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="ocr-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ocr-title" variant="title3" as="h2" weight="semibold">Payments on-call</MiText>
        <MiText variant="footnote" tone="label2">Weekly rotation · hand-off Mondays at 9:00 CET</MiText>
      </div>
      <MiBadge :tone="overrides ? 'warning' : 'neutral'" :label="overrides + ' override' + (overrides === 1 ? '' : 's')" />
    </header>

    <div class="mi:grid mi:gap-4 mi:@[820px]:grid-cols-[minmax(0,_1.4fr)_minmax(280px,_1fr)] mi:@[820px]:items-start">
      <!-- Rotation: one row per week, primary and secondary side by side. Pick a slot to swap it. -->
      <div class="mi:grid mi:p-1.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" role="table" aria-label="Rotation">
        <div class="mi:grid mi:grid-cols-[minmax(72px,_.8fr)_minmax(0,_1fr)_minmax(0,_1fr)] mi:items-center mi:gap-1.5 mi:p-1.5 mi:rounded-lg" role="row">
          <span class="mi:py-1 mi:px-1.5 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3" role="columnheader">Week</span><span class="mi:py-1 mi:px-1.5 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3" role="columnheader">Primary</span><span class="mi:py-1 mi:px-1.5 mi:text-[11px] mi:font-semibold mi:uppercase mi:tracking-[.05em] mi:text-label3" role="columnheader">Secondary</span>
        </div>
        <div v-for="w in weeks" :key="w.id" class="mi:grid mi:grid-cols-[minmax(72px,_.8fr)_minmax(0,_1fr)_minmax(0,_1fr)] mi:items-center mi:gap-1.5 mi:p-1.5 mi:rounded-lg " :class="w.id === NOW ? 'mi:[background:var(--mi-p-tint)]' : ''" role="row">
          <span class="mi:grid mi:pl-1.5" role="rowheader">
            <strong class="mi:text-[14px] mi:tabular-nums">{{ w.label }}</strong>
            <small class="mi:text-[12px] mi:text-label2 mi:whitespace-nowrap">{{ w.id === NOW ? 'This week' : w.range }}</small>
          </span>
          <span v-for="layer in layers" :key="layer" role="cell">
            <button
              type="button" class="mi:flex mi:items-center mi:gap-2 mi:w-full mi:min-w-0 mi:p-2 mi:border mi:rounded-md mi:[font:inherit] mi:text-inherit mi:cursor-pointer mi:text-start mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :class="[isPicked(w.id, layer) ? 'mi:border-p' : 'mi:border-transparent', w.override[layer] ? 'mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)_0_6px,_transparent_6px_12px)]' : isPicked(w.id, layer) ? 'mi:[background:var(--mi-card)]' : 'mi:[background:var(--mi-fill4)] mi:hover:[background:var(--mi-fill3)]']"
              :aria-pressed="isPicked(w.id, layer)" :aria-label="`${w.label}, ${layer}: ${personOf(w, layer)}`" @click="pick(w.id, layer)"
            >
              <MiAvatar :name="personOf(w, layer)" tone="auto" size="xs" decorative />
              <span class="mi:min-w-0 mi:text-[13px] mi:font-semibold mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ personOf(w, layer).split(' ')[0] }}</span>
              <MiIcon v-if="w.override[layer]" name="arrow-right" :size="12" class="mi:ml-auto mi:text-orange-t" />
            </button>
          </span>
        </div>
      </div>

      <div class="mi:grid mi:content-start mi:gap-3">
        <!-- Swap panel for the picked slot. -->
        <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1" aria-live="polite">
          <template v-if="picked && pickedWeek">
            <MiText variant="footnote" weight="semibold" tone="label2" as="h3" class="mi:m-0 mi:uppercase mi:tracking-[.05em]! mi:text-[11px]!">Swap {{ picked.layer }} · {{ pickedWeek.label }}</MiText>
            <MiText variant="subheadline">Scheduled: <strong>{{ pickedWeek[picked.layer] }}</strong></MiText>
            <MiSelect v-model="cover" :options="coverOptions" placeholder="Who covers?" size="sm" />
            <div class="mi:flex mi:flex-wrap mi:gap-2">
              <MiButton size="small" :disabled="!cover" @click="applySwap">Create override</MiButton>
              <MiButton v-if="pickedWeek.override[picked.layer]" size="small" variant="gray" @click="clearSwap">Undo override</MiButton>
            </div>
          </template>
          <MiText v-else variant="footnote" tone="label2">Pick a slot in the rotation to hand it to a teammate.</MiText>
        </div>

        <!-- Load across the quarter, so swaps stay fair. -->
        <div class="mi:grid mi:gap-2.5 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3" class="mi:m-0 mi:uppercase mi:tracking-[.05em]! mi:text-[11px]!">Primary weeks this quarter</MiText>
          <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none]">
            <li class="mi:grid mi:grid-cols-[112px_minmax(0,_1fr)_20px] mi:items-center mi:gap-2.5 mi:text-[13px]" v-for="p in load" :key="p.name">
              <span class="mi:whitespace-nowrap mi:overflow-hidden mi:text-ellipsis">{{ p.name }}</span>
              <span class="mi:h-1.5 mi:rounded-[3px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="p.name + ' primary weeks'" :aria-valuenow="p.weeks" aria-valuemin="0" :aria-valuemax="maxLoad">
                <i class="mi:block mi:h-full mi:rounded-[inherit] mi:origin-left mi:[transition:transform_var(--mi-dur-3)_var(--mi-spring)]" :class="p.weeks >= maxLoad ? 'mi:bg-orange' : 'mi:bg-p'" :style="{ transform: `scaleX(${p.weeks / maxLoad})` }" />
              </span>
              <span class="mi:text-end mi:font-semibold mi:tabular-nums">{{ p.weeks }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Layer = 'primary' | 'secondary'
interface Week { id: number, label: string, range: string, primary: string, secondary: string, override: Partial<Record<Layer, string>> }

const NOW = 45
const layers: Layer[] = ['primary', 'secondary']
const team = ['Omar Haddad', 'Lena Brooks', 'Ken Osei', 'Priya Nair', 'Tomás Rivera']
// Weeks already served earlier in the quarter, before the window shown here.
const served: Record<string, number> = { 'Omar Haddad': 3, 'Lena Brooks': 2, 'Ken Osei': 2, 'Priya Nair': 3, 'Tomás Rivera': 1 }

// Sample rotation; swap for your paging tool's schedule.
const weeks = ref<Week[]>([
  { id: 45, label: 'W45', range: 'Nov 2 – 8', primary: 'Omar Haddad', secondary: 'Lena Brooks', override: {} },
  { id: 46, label: 'W46', range: 'Nov 9 – 15', primary: 'Lena Brooks', secondary: 'Ken Osei', override: {} },
  { id: 47, label: 'W47', range: 'Nov 16 – 22', primary: 'Ken Osei', secondary: 'Priya Nair', override: { primary: 'Tomás Rivera' } },
  { id: 48, label: 'W48', range: 'Nov 23 – 29', primary: 'Priya Nair', secondary: 'Tomás Rivera', override: {} },
  { id: 49, label: 'W49', range: 'Nov 30 – Dec 6', primary: 'Tomás Rivera', secondary: 'Omar Haddad', override: {} }
])

const picked = ref<{ week: number, layer: Layer } | null>({ week: 46, layer: 'primary' })
const cover = ref<string | number | null>(null)

const personOf = (w: Week, layer: Layer): string => w.override[layer] ?? w[layer]
const isPicked = (week: number, layer: Layer): boolean => picked.value?.week === week && picked.value.layer === layer
const pickedWeek = computed(() => weeks.value.find(w => w.id === picked.value?.week))
const overrides = computed(() => weeks.value.reduce((n, w) => n + Object.keys(w.override).length, 0))

// Anyone not already on this week can cover; the label shows their quarter load.
const coverOptions = computed(() => {
  const w = pickedWeek.value
  if (!w) return []
  const busy = new Set(layers.map(l => personOf(w, l)))
  return team.filter(n => !busy.has(n)).map(n => ({ value: n, label: n, description: `${loadOf(n)} primary weeks this quarter` }))
})

const loadOf = (name: string): number => (served[name] ?? 0) + weeks.value.filter(w => personOf(w, 'primary') === name).length
const load = computed(() => team.map(name => ({ name, weeks: loadOf(name) })).sort((a, b) => b.weeks - a.weeks))
const maxLoad = computed(() => Math.max(...load.value.map(p => p.weeks), 1))

function pick(week: number, layer: Layer) {
  picked.value = { week, layer }
  cover.value = null
}
function applySwap() {
  const w = pickedWeek.value
  if (!w || !picked.value || typeof cover.value !== 'string') return
  w.override = { ...w.override, [picked.value.layer]: cover.value }
  cover.value = null
}
function clearSwap() {
  const w = pickedWeek.value
  if (!w || !picked.value) return
  const rest = { ...w.override }
  delete rest[picked.value.layer]
  w.override = rest
}
</script>
