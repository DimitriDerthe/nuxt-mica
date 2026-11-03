<template>
  <section class="mi:@container/rsc mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="rsc-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="rsc-title" as="h2" variant="title3" weight="semibold">Choose a region</MiText>
        <MiText variant="footnote" tone="label2">orbit-analytics · Postgres 17 · 2 vCPU / 8 GB</MiText>
      </div>
      <label class="mi:inline-flex mi:items-center mi:gap-2 mi:text-[13px] mi:text-label2 mi:cursor-pointer">
        <MiSwitch v-model="euOnly" size="compact" label="Keep data in the EU" />
        <span aria-hidden="true">EU data residency</span>
      </label>
    </header>

    <MiAlert v-if="created" tone="success" title="Cluster is provisioning" dismissible @dismiss="created = ''">{{ created }}</MiAlert>

    <form class="mi:grid mi:gap-4.5 mi:p-4.5 mi:rounded-xl mi:bg-card mi:shadow-1" novalidate @submit.prevent="submit">
      <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-2.5">
        <MiSegmented v-model="area" label="Area" :options="areas" />
        <MiSegmented v-model="sortBy" label="Sort by" :options="sorts" variant="tinted" />
      </div>

      <fieldset class="mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0]">
        <legend class="mi:p-0 mi:mb-2.5 mi:text-[15px] mi:font-semibold">Primary region <span aria-hidden="true" class="mi:text-red">*</span></legend>
        <div class="mi:grid mi:gap-2.5 mi:grid-cols-[minmax(0,_1fr)] mi:@[520px]/rsc:grid-cols-2 mi:@[900px]/rsc:grid-cols-4">
          <label
            v-for="r in shown" :key="r.id" class="mi:relative mi:grid mi:gap-3.5 mi:p-3.5 mi:rounded-lg mi:border mi:bg-card mi:[transition:transform_var(--mi-dur-2)_var(--mi-ease)] mi:active:transform-[scale(.99)] mi:[&:has(input:focus-visible)]:[outline:2px_solid_var(--mi-p)] mi:[&:has(input:focus-visible)]:outline-offset-[2px]"
            :class="[primary === r.id ? 'mi:border-p mi:shadow-[0_0_0_3px_var(--mi-p-tint)]' : 'mi:border-sep mi:hover:border-[color-mix(in_srgb,_var(--mi-p)_40%,_var(--mi-sep))]', blocked(r) ? 'mi:cursor-not-allowed mi:opacity-50' : 'mi:cursor-pointer']"
          >
            <input v-model="primary" class="mi:absolute mi:opacity-0 mi:pointer-events-none" type="radio" name="rsc-primary" :value="r.id" :disabled="blocked(r)" :aria-describedby="'rsc-' + r.id + '-d'">
            <span class="mi:flex mi:items-center mi:gap-2.5">
              <span class="mi:grid mi:place-items-center mi:w-8.5 mi:h-8.5 mi:flex-[none] mi:rounded-[10px] mi:text-[12px] mi:font-bold mi:tracking-[.04em]" :class="primary === r.id ? 'mi:bg-p mi:text-p-on' : 'mi:bg-fill3 mi:text-label2'" aria-hidden="true">{{ r.cc }}</span>
              <span class="mi:grid mi:flex-1 mi:min-w-0 mi:leading-tight">
                <b class="mi:text-[15px] mi:font-semibold">{{ r.city }}</b>
                <code class="mi:[font:11.5px_ui-monospace,SFMono-Regular,Menlo,monospace] mi:text-label3">{{ r.id }}</code>
              </span>
              <span class="mi:w-4.5 mi:h-4.5 mi:flex-[none] mi:rounded-[50%]" :class="primary === r.id ? 'mi:border-5 mi:border-p' : 'mi:border-[1.5px] mi:border-sep'" aria-hidden="true" />
            </span>
            <span :id="'rsc-' + r.id + '-d'" class="mi:grid mi:gap-2">
              <span class="mi:grid mi:grid-cols-[74px_minmax(0,_1fr)_auto] mi:items-center mi:gap-2 mi:text-[12px]">
                <span class="mi:text-label2">Latency</span>
                <span class="mi:h-1 mi:rounded-[2px] mi:bg-fill3 mi:overflow-hidden"><i class="mi:block mi:h-full mi:bg-p mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${Math.min(r.ms / 240, 1)})` }" /></span>
                <span class="mi:tabular-nums mi:text-label mi:text-end">{{ r.ms }} ms</span>
              </span>
              <span class="mi:grid mi:grid-cols-[74px_minmax(0,_1fr)_auto] mi:items-center mi:gap-2 mi:text-[12px]">
                <span class="mi:text-label2">Grid carbon</span>
                <span class="mi:justify-self-start mi:py-px mi:px-1.5 mi:rounded-[5px] mi:font-semibold mi:tabular-nums" :class="carbon(r.co2)">{{ r.co2 }} g/kWh</span>
                <span class="mi:tabular-nums mi:text-label mi:text-end">€{{ r.price.toFixed(3) }}/h</span>
              </span>
            </span>
            <span v-if="r.id === best" class="mi:absolute mi:top-[-9px] mi:right-3 mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[10.5px] mi:font-bold mi:tracking-[.03em] mi:text-p-on mi:bg-p">Best balance</span>
            <span v-if="blocked(r)" class="mi:absolute mi:top-[-9px] mi:right-3 mi:py-0.5 mi:px-2 mi:rounded-[999px] mi:text-[10.5px] mi:font-bold mi:tracking-[.03em] mi:text-label2 mi:bg-fill2">Outside the EU</span>
          </label>
        </div>
        <MiText v-if="err('primary')" variant="footnote" tone="red" role="alert">{{ err('primary') }}</MiText>
      </fieldset>

      <!-- Second shape: a selectable list for backup replicas, excluding the primary. -->
      <fieldset class="mi:[&_[role=group]]:max-h-65 mi:[&_[role=group]]:overflow-y-auto mi:grid mi:gap-2.5 mi:min-w-0 mi:m-0 mi:p-0 mi:[border:0] mi:pt-4 mi:border-t mi:border-t-sep">
        <legend class="mi:p-0 mi:mb-2.5 mi:text-[15px] mi:font-semibold">Backup replicas</legend>
        <MiText variant="footnote" tone="label2">Nightly snapshots are copied to every region you tick. Pick one or two.</MiText>
        <MiCheckboxGroup v-model="backups" label="Backup regions" :options="backupOptions" />
        <MiText v-if="err('backups')" variant="footnote" tone="red" role="alert">{{ err('backups') }}</MiText>
      </fieldset>

      <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5">
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
const carbon = (g: number) => (g < 100 ? 'mi:text-green-t mi:bg-green/14' : g < 420 ? 'mi:text-orange-t mi:bg-orange/14' : 'mi:text-red-t mi:bg-red/12')

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
