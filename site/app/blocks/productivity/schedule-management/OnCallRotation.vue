<template>
  <section class="ocr" aria-labelledby="ocr-title">
    <header class="ocr__head">
      <div>
        <MiText id="ocr-title" variant="title3" as="h2" weight="semibold">Payments on-call</MiText>
        <MiText variant="footnote" tone="label2">Weekly rotation · hand-off Mondays at 9:00 CET</MiText>
      </div>
      <MiBadge :tone="overrides ? 'warning' : 'neutral'" :label="overrides + ' override' + (overrides === 1 ? '' : 's')" />
    </header>

    <div class="ocr__layout">
      <!-- Rotation: one row per week, primary and secondary side by side. Pick a slot to swap it. -->
      <div class="ocr__table" role="table" aria-label="Rotation">
        <div class="ocr__tr ocr__th" role="row">
          <span role="columnheader">Week</span><span role="columnheader">Primary</span><span role="columnheader">Secondary</span>
        </div>
        <div v-for="w in weeks" :key="w.id" class="ocr__tr" :class="{ 'is-now': w.id === NOW }" role="row">
          <span class="ocr__week" role="rowheader">
            <strong>{{ w.label }}</strong>
            <small>{{ w.id === NOW ? 'This week' : w.range }}</small>
          </span>
          <span v-for="layer in layers" :key="layer" role="cell">
            <button
              type="button" class="ocr__slot" :class="{ 'is-on': isPicked(w.id, layer), 'is-override': !!w.override[layer] }"
              :aria-pressed="isPicked(w.id, layer)" :aria-label="`${w.label}, ${layer}: ${personOf(w, layer)}`" @click="pick(w.id, layer)"
            >
              <MiAvatar :name="personOf(w, layer)" tone="auto" size="xs" decorative />
              <span class="ocr__name">{{ personOf(w, layer).split(' ')[0] }}</span>
              <MiIcon v-if="w.override[layer]" name="arrow-right" :size="12" class="ocr__swap-icon" />
            </button>
          </span>
        </div>
      </div>

      <div class="ocr__side">
        <!-- Swap panel for the picked slot. -->
        <div class="ocr__panel" aria-live="polite">
          <template v-if="picked && pickedWeek">
            <MiText variant="footnote" weight="semibold" tone="label2" as="h3">Swap {{ picked.layer }} · {{ pickedWeek.label }}</MiText>
            <MiText variant="subheadline">Scheduled: <strong>{{ pickedWeek[picked.layer] }}</strong></MiText>
            <MiSelect v-model="cover" :options="coverOptions" placeholder="Who covers?" size="sm" />
            <div class="ocr__actions">
              <MiButton size="small" :disabled="!cover" @click="applySwap">Create override</MiButton>
              <MiButton v-if="pickedWeek.override[picked.layer]" size="small" variant="gray" @click="clearSwap">Undo override</MiButton>
            </div>
          </template>
          <MiText v-else variant="footnote" tone="label2">Pick a slot in the rotation to hand it to a teammate.</MiText>
        </div>

        <!-- Load across the quarter, so swaps stay fair. -->
        <div class="ocr__panel">
          <MiText variant="footnote" weight="semibold" tone="label2" as="h3">Primary weeks this quarter</MiText>
          <ul class="ocr__load">
            <li v-for="p in load" :key="p.name">
              <span class="ocr__load-name">{{ p.name }}</span>
              <span class="ocr__load-bar" role="meter" :aria-label="p.name + ' primary weeks'" :aria-valuenow="p.weeks" aria-valuemin="0" :aria-valuemax="maxLoad">
                <i :class="{ 'is-high': p.weeks >= maxLoad }" :style="{ transform: `scaleX(${p.weeks / maxLoad})` }" />
              </span>
              <span class="ocr__load-num">{{ p.weeks }}</span>
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

<style scoped>
.ocr { container-type: inline-size; display: grid; align-content: start; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.ocr__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.ocr__layout { display: grid; gap: 16px; }

.ocr__table { display: grid; padding: 6px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ocr__tr { display: grid; grid-template-columns: minmax(72px, .8fr) minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 6px; padding: 6px; border-radius: var(--mi-radius-l); }
.ocr__tr.is-now { background: var(--mi-p-tint); }
.ocr__th span { padding: 4px 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--mi-label3); }
.ocr__week { display: grid; padding-left: 6px; }
.ocr__week strong { font-size: 14px; font-variant-numeric: tabular-nums; }
.ocr__week small { font-size: 12px; color: var(--mi-label2); white-space: nowrap; }

.ocr__slot {
  display: flex; align-items: center; gap: 8px; width: 100%; min-width: 0; padding: 8px; border: 1px solid transparent; border-radius: var(--mi-radius-m);
  background: var(--mi-fill4); font: inherit; color: inherit; cursor: pointer; text-align: start;
}
.ocr__slot:hover { background: var(--mi-fill3); }
.ocr__slot:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.ocr__slot.is-on { border-color: var(--mi-p); background: var(--mi-card); }
.ocr__slot.is-override { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-orange) 14%, transparent) 0 6px, transparent 6px 12px); }
.ocr__name { min-width: 0; font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ocr__swap-icon { margin-left: auto; flex: none; color: var(--mi-orange-t); }

.ocr__side { display: grid; align-content: start; gap: 12px; }
.ocr__panel { display: grid; gap: 10px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ocr__panel h3 { margin: 0; text-transform: uppercase; letter-spacing: .05em; font-size: 11px; }
.ocr__actions { display: flex; flex-wrap: wrap; gap: 8px; }
.ocr__load { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
.ocr__load li { display: grid; grid-template-columns: 112px minmax(0, 1fr) 20px; align-items: center; gap: 10px; font-size: 13px; }
.ocr__load-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ocr__load-bar { height: 6px; border-radius: 3px; background: var(--mi-fill3); overflow: hidden; }
.ocr__load-bar i { display: block; height: 100%; border-radius: inherit; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-3) var(--mi-spring); }
.ocr__load-bar i.is-high { background: var(--mi-orange); }
.ocr__load-num { text-align: end; font-weight: 600; font-variant-numeric: tabular-nums; }

@container (min-width: 820px) { .ocr__layout { grid-template-columns: minmax(0, 1.4fr) minmax(280px, 1fr); align-items: start; } }
</style>
