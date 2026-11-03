<template>
  <section class="rsc" aria-labelledby="rsc-title">
    <header class="rsc__head">
      <div>
        <MiText id="rsc-title" as="h2" variant="title3" weight="semibold">Choose a region</MiText>
        <MiText variant="footnote" tone="label2">orbit-analytics · Postgres 17 · 2 vCPU / 8 GB</MiText>
      </div>
      <label class="rsc__eu">
        <MiSwitch v-model="euOnly" size="compact" label="Keep data in the EU" />
        <span aria-hidden="true">EU data residency</span>
      </label>
    </header>

    <MiAlert v-if="created" tone="success" title="Cluster is provisioning" dismissible @dismiss="created = ''">{{ created }}</MiAlert>

    <form class="rsc__form" novalidate @submit.prevent="submit">
      <div class="rsc__tools">
        <MiSegmented v-model="area" label="Area" :options="areas" />
        <MiSegmented v-model="sortBy" label="Sort by" :options="sorts" variant="tinted" />
      </div>

      <fieldset class="rsc__set">
        <legend class="rsc__legend">Primary region <span aria-hidden="true">*</span></legend>
        <div class="rsc__cards">
          <label
            v-for="r in shown" :key="r.id" class="rsc__card"
            :class="{ 'is-on': primary === r.id, 'is-off': blocked(r) }"
          >
            <input v-model="primary" class="rsc__radio" type="radio" name="rsc-primary" :value="r.id" :disabled="blocked(r)" :aria-describedby="'rsc-' + r.id + '-d'">
            <span class="rsc__card-top">
              <span class="rsc__cc" aria-hidden="true">{{ r.cc }}</span>
              <span class="rsc__name">
                <b>{{ r.city }}</b>
                <code>{{ r.id }}</code>
              </span>
              <span class="rsc__dot" aria-hidden="true" />
            </span>
            <span :id="'rsc-' + r.id + '-d'" class="rsc__stats">
              <span class="rsc__stat">
                <span class="rsc__stat-l">Latency</span>
                <span class="rsc__lat"><i :style="{ transform: `scaleX(${Math.min(r.ms / 240, 1)})` }" /></span>
                <span class="rsc__stat-v">{{ r.ms }} ms</span>
              </span>
              <span class="rsc__stat">
                <span class="rsc__stat-l">Grid carbon</span>
                <span class="rsc__co2" :class="carbon(r.co2)">{{ r.co2 }} g/kWh</span>
                <span class="rsc__stat-v">€{{ r.price.toFixed(3) }}/h</span>
              </span>
            </span>
            <span v-if="r.id === best" class="rsc__best">Best balance</span>
            <span v-if="blocked(r)" class="rsc__why">Outside the EU</span>
          </label>
        </div>
        <MiText v-if="err('primary')" variant="footnote" tone="red" role="alert">{{ err('primary') }}</MiText>
      </fieldset>

      <!-- Second shape: a selectable list for backup replicas, excluding the primary. -->
      <fieldset class="rsc__set rsc__backups">
        <legend class="rsc__legend">Backup replicas</legend>
        <MiText variant="footnote" tone="label2">Nightly snapshots are copied to every region you tick. Pick one or two.</MiText>
        <MiCheckboxGroup v-model="backups" label="Backup regions" :options="backupOptions" />
        <MiText v-if="err('backups')" variant="footnote" tone="red" role="alert">{{ err('backups') }}</MiText>
      </fieldset>

      <div class="rsc__foot">
        <MiText variant="footnote" tone="label2" aria-live="polite">{{ monthly }}</MiText>
        <MiButton type="submit" :loading="busy">Create cluster</MiButton>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type Val = string | number
interface Region { id: string, city: string, cc: string, area: 'eu' | 'am' | 'as', ms: number, co2: number, price: number }

const regions: Region[] = [
  { id: 'fr-par-2', city: 'Paris', cc: 'FR', area: 'eu', ms: 18, co2: 56, price: 0.042 },
  { id: 'nl-ams-1', city: 'Amsterdam', cc: 'NL', area: 'eu', ms: 24, co2: 328, price: 0.042 },
  { id: 'de-fra-1', city: 'Frankfurt', cc: 'DE', area: 'eu', ms: 22, co2: 381, price: 0.046 },
  { id: 'pl-waw-1', city: 'Warsaw', cc: 'PL', area: 'eu', ms: 41, co2: 662, price: 0.038 },
  { id: 'ca-mtl-1', city: 'Montréal', cc: 'CA', area: 'am', ms: 88, co2: 32, price: 0.044 },
  { id: 'us-iad-1', city: 'Virginia', cc: 'US', area: 'am', ms: 92, co2: 367, price: 0.039 },
  { id: 'sg-sin-1', city: 'Singapore', cc: 'SG', area: 'as', ms: 168, co2: 470, price: 0.051 },
  { id: 'jp-tyo-1', city: 'Tokyo', cc: 'JP', area: 'as', ms: 221, co2: 452, price: 0.053 }
]
const areas = [{ value: 'all', label: 'All' }, { value: 'eu', label: 'Europe' }, { value: 'am', label: 'Americas' }, { value: 'as', label: 'Asia' }]
const sorts = [{ value: 'ms', label: 'Latency' }, { value: 'co2', label: 'Carbon' }, { value: 'price', label: 'Price' }]

const area = ref<Val | null>('all')
const sortBy = ref<Val | null>('ms')
const euOnly = ref(false)
const primary = ref<string>('')
const backups = ref<Val[]>([])

const blocked = (r: Region) => euOnly.value && r.area !== 'eu'
const shown = computed(() => {
  const key = (sortBy.value ?? 'ms') as 'ms' | 'co2' | 'price'
  return regions.filter(r => area.value === 'all' || r.area === area.value).sort((a, b) => a[key] - b[key])
})
// Lowest normalised latency + carbon + price wins the badge.
const best = computed(() => {
  const score = (r: Region) => r.ms / 221 + r.co2 / 662 + r.price / 0.053
  return [...regions].filter(r => !blocked(r)).sort((a, b) => score(a) - score(b))[0]?.id
})
const carbon = (g: number) => (g < 100 ? 'is-low' : g < 420 ? 'is-mid' : 'is-high')

const backupOptions = computed(() => regions
  .filter(r => r.id !== primary.value && !blocked(r))
  .map(r => ({ value: r.id, label: `${r.city} · ${r.id}`, description: `${r.ms} ms from you · €${(r.price * 0.25).toFixed(3)}/h for snapshots` })))

// Residency or a new primary can invalidate earlier picks.
watch([euOnly, primary], () => {
  const allowed = new Set(backupOptions.value.map(o => o.value))
  backups.value = backups.value.filter(v => allowed.has(String(v)))
  const p = regions.find(r => r.id === primary.value)
  if (p && blocked(p)) primary.value = ''
})

const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!primary.value) e.primary = 'Pick where the primary database runs.'
  if (!backups.value.length) e.backups = 'Keep at least one backup replica in another region.'
  else if (backups.value.length > 2) e.backups = 'Two backup regions is the limit on this plan.'
  return e
})
const submitted = ref(false)
const err = (k: string) => (submitted.value ? errors.value[k] : undefined)

const monthly = computed(() => {
  const p = regions.find(r => r.id === primary.value)
  if (!p) return 'Select a primary region to see the estimate.'
  const total = (p.price + backups.value.reduce<number>((n, id) => n + (regions.find(r => r.id === id)?.price ?? 0) * 0.25, 0)) * 730
  return `About €${total.toFixed(2)} per month`
})

const busy = ref(false)
const created = ref('')
function submit() {
  submitted.value = true
  if (Object.keys(errors.value).length) return
  busy.value = true
  later(() => {
    const p = regions.find(r => r.id === primary.value)!
    created.value = `Primary in ${p.city} (${p.id}), ${backups.value.length} backup ${backups.value.length === 1 ? 'replica' : 'replicas'}. Ready in about 4 minutes.`
    busy.value = false
    submitted.value = false
  }, 700)
}
</script>

<style scoped>
.rsc { container: rsc / inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.rsc__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.rsc__eu { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--mi-label2); cursor: pointer; }
.rsc__form { display: grid; gap: 18px; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.rsc__tools { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px; }
.rsc__set { display: grid; gap: 10px; min-width: 0; margin: 0; padding: 0; border: 0; }
.rsc__legend { padding: 0; margin-bottom: 10px; font-size: 15px; font-weight: 600; }
.rsc__legend span { color: var(--mi-red); }

.rsc__cards { display: grid; gap: 10px; grid-template-columns: minmax(0, 1fr); }
@container rsc (min-width: 520px) { .rsc__cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container rsc (min-width: 900px) { .rsc__cards { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.rsc__card {
  position: relative; display: grid; gap: 14px; padding: 14px; border-radius: var(--mi-radius-l); border: 1px solid var(--mi-sep);
  background: var(--mi-card); cursor: pointer; transition: transform var(--mi-dur-2) var(--mi-ease);
}
.rsc__card:hover { border-color: color-mix(in srgb, var(--mi-p) 40%, var(--mi-sep)); }
.rsc__card:active { transform: scale(.99); }
.rsc__card.is-on { border-color: var(--mi-p); box-shadow: 0 0 0 3px var(--mi-p-tint); }
.rsc__card.is-off { cursor: not-allowed; opacity: .5; }
.rsc__card:has(.rsc__radio:focus-visible) { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.rsc__radio { position: absolute; opacity: 0; pointer-events: none; }
.rsc__card-top { display: flex; align-items: center; gap: 10px; }
.rsc__cc { display: grid; place-items: center; width: 34px; height: 34px; flex: none; border-radius: 10px; font-size: 12px; font-weight: 700; letter-spacing: .04em; color: var(--mi-label2); background: var(--mi-fill3); }
.is-on .rsc__cc { color: var(--mi-p-on); background: var(--mi-p); }
.rsc__name { display: grid; flex: 1; min-width: 0; line-height: 1.25; }
.rsc__name b { font-size: 15px; font-weight: 600; }
.rsc__name code { font: 11.5px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--mi-label3); }
.rsc__dot { width: 18px; height: 18px; flex: none; border-radius: 50%; border: 1.5px solid var(--mi-sep); }
.is-on .rsc__dot { border: 5px solid var(--mi-p); }
.rsc__stats { display: grid; gap: 8px; }
.rsc__stat { display: grid; grid-template-columns: 74px minmax(0, 1fr) auto; align-items: center; gap: 8px; font-size: 12px; }
.rsc__stat-l { color: var(--mi-label2); }
.rsc__stat-v { font-variant-numeric: tabular-nums; color: var(--mi-label); text-align: end; }
.rsc__lat { height: 4px; border-radius: 2px; background: var(--mi-fill3); overflow: hidden; }
.rsc__lat i { display: block; height: 100%; background: var(--mi-p); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.rsc__co2 { justify-self: start; padding: 1px 6px; border-radius: 5px; font-weight: 600; font-variant-numeric: tabular-nums; }
.rsc__co2.is-low { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 14%, transparent); }
.rsc__co2.is-mid { color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.rsc__co2.is-high { color: var(--mi-red-t); background: color-mix(in srgb, var(--mi-red) 12%, transparent); }
.rsc__best, .rsc__why { position: absolute; top: -9px; right: 12px; padding: 2px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 700; letter-spacing: .03em; }
.rsc__best { color: var(--mi-p-on); background: var(--mi-p); }
.rsc__why { color: var(--mi-label2); background: var(--mi-fill2); }

.rsc__backups { padding-top: 16px; border-top: 1px solid var(--mi-sep); }
.rsc__backups :deep([role="group"]) { max-height: 260px; overflow-y: auto; }
.rsc__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; }
</style>
