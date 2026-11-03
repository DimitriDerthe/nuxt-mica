<template>
  <div class="ip-cq mi:@container">
    <section class="ip mi:grid mi:gap-5 mi:p-5 mi:rounded-xl mi:font-mi mi:text-label mi:bg-card mi:shadow-1 mi:@[640px]:py-6 mi:@[640px]:px-6.5" aria-labelledby="ip-title">
      <header class="ip__head mi:flex mi:items-center mi:gap-3.5">
        <div class="ip__src mi:flex mi:items-center mi:gap-1.5 mi:flex-[none] mi:text-label3" aria-hidden="true">
          <span class="ip__logo ip__logo--from mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[9px] mi:font-extrabold mi:text-[15px] mi:text-green-t mi:[background:color-mix(in_srgb,_var(--mi-green)_16%,_transparent)]">S</span>
          <MiIcon name="arrow-right" :size="14" />
          <span class="ip__logo ip__logo--to mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[9px] mi:font-extrabold mi:text-[15px] mi:text-p-on mi:bg-p"><MiLogo variant="short" :size="14" tone="on-primary" dot="inherit" decorative /></span>
        </div>
        <div class="ip__titles mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText id="ip-title" variant="title3" as="h2" weight="semibold">Importing Northwind Coffee</MiText>
          <MiText variant="footnote" tone="label2">From Shopify · started 4 min ago by Priya Raman</MiText>
        </div>
      </header>

      <MiSteps :model-value="step" :steps="steps" orientation="horizontal" :clickable="false" aria-label="Import stages" />

      <div class="ip__grid mi:grid mi:gap-3.5 mi:@[640px]:grid-cols-2 mi:@[980px]:grid-cols-[280px_minmax(0,_1fr)_minmax(0,_1fr)]">
        <!-- Overall: a ring for the whole job, with a stop control beside it. -->
        <div class="ip__overall mi:flex mi:items-center mi:gap-4.5 mi:p-4 mi:rounded-lg mi:bg-fill4 mi:@[640px]:col-span-full mi:@[980px]:col-[auto] mi:@[980px]:flex-col mi:@[980px]:[align-items:flex-start]">
          <MiProgressRing :value="overall" :size="88" :label="'Overall import progress'" />
          <div class="ip__overall-text mi:grid mi:gap-0.5 mi:min-w-0">
            <MiText variant="headline" as="p" aria-live="polite">{{ headline }}</MiText>
            <MiText variant="footnote" tone="label2" tabular>{{ done.toLocaleString('en-US') }} of {{ total.toLocaleString('en-US') }} records</MiText>
            <div class="ip__controls mi:mt-2">
              <MiButton v-if="phase !== 'done'" size="small" variant="gray" :disabled="phase === 'reindex'" @click="running = !running">
                <template #leading>
                  <MiSpinner v-if="running && phase === 'import'" variant="ticks" size="sm" label="" />
                  <MiIcon v-else :svg="icons.play" :size="14" />
                </template>
                {{ running ? 'Pause' : 'Resume' }}
              </MiButton>
              <MiButton v-else size="small" variant="tinted" @click="restart">Run the demo again</MiButton>
            </div>
          </div>
        </div>

        <!-- Per entity: one linear bar each, with exact counts. -->
        <div class="ip__entities mi:grid mi:gap-3.5 mi:content-start mi:p-4 mi:rounded-lg mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
          <MiProgress
            v-for="e in entities" :key="e.id" :value="e.done" :max="e.total" size="sm" :label="e.label"
            :value-text="`${e.done.toLocaleString('en-US')} / ${e.total.toLocaleString('en-US')}`"
          />
        </div>

        <div class="ip__side mi:grid mi:gap-4.5 mi:content-start mi:p-4 mi:rounded-lg mi:shadow-[inset_0_0_0_1px_var(--mi-sep)]">
          <MiProgress :segments="outcome" :label="'Outcome so far'" size="lg" />
          <MiMeter
            :value="budget" label="Shopify API budget" size="sm" :caption="budget + '% in use'"
            :hint="budget > 80 ? 'Throttling soon' : 'Healthy'" :color="budget > 80 ? 'var(--mi-orange)' : undefined"
          />
          <div class="ip__reindex mi:pt-3.5 mi:border-t mi:border-t-sep">
            <MiProgress :value="phase === 'reindex' ? null : phase === 'done' ? 100 : 0" size="sm" label="Search index" :value-text="reindexText" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const icons = { play: '<path d="M7 5v14l12-7L7 5Z"/>' }
const steps = [
  { label: 'Connect', description: 'Shopify Plus' },
  { label: 'Map fields', description: '42 of 42' },
  { label: 'Import', description: 'Products, people, orders' },
  { label: 'Reindex', description: 'Search and reports' }
]

const seed = [
  { id: 'products', label: 'Products', total: 1240, start: 1240 },
  { id: 'customers', label: 'Customers', total: 8912, start: 5120 },
  { id: 'orders', label: 'Orders', total: 23410, start: 7400 },
  { id: 'discounts', label: 'Discount codes', total: 86, start: 0 }
]
const entities = reactive(seed.map(e => ({ ...e, done: e.start })))
const running = ref(true)
const phase = ref<'import' | 'reindex' | 'done'>('import')

const total = computed(() => entities.reduce((n, e) => n + e.total, 0))
const done = computed(() => entities.reduce((n, e) => n + e.done, 0))
const overall = computed(() => Math.round((done.value / total.value) * 100))
const step = computed(() => (phase.value === 'import' ? 2 : 3))

// About 1.2 % merged and 0.4 % skipped, the rest imported cleanly.
const outcome = computed(() => [
  { value: Math.round(done.value * 0.984), label: 'Imported', tone: 'primary' as const },
  { value: Math.round(done.value * 0.012), label: 'Merged duplicates', tone: 'secondary' as const },
  { value: Math.round(done.value * 0.004), label: 'Skipped', tone: 'neutral' as const }
])
const budget = computed(() => (running.value && phase.value === 'import' ? 64 + (done.value % 23) : 8))
const left = computed(() => Math.max(1, Math.ceil((100 - overall.value) / 8)))
const headline = computed(() => {
  if (phase.value === 'done') return 'Import complete'
  if (phase.value === 'reindex') return 'Rebuilding search'
  return running.value ? `About ${left.value} s left` : 'Paused'
})
const reindexText = computed(() => ({ import: 'Waiting', reindex: 'Working…', done: 'Ready' }[phase.value]))

let tick: ReturnType<typeof setInterval> | undefined
let after: ReturnType<typeof setTimeout> | undefined

function advance() {
  if (!running.value || phase.value !== 'import') return
  for (const e of entities) e.done = Math.min(e.total, e.done + Math.ceil(e.total / 36))
  if (entities.every(e => e.done === e.total)) {
    phase.value = 'reindex'
    after = setTimeout(() => { phase.value = 'done' }, 2600)
  }
}

function restart() {
  entities.forEach((e, i) => { e.done = seed[i]!.start })
  phase.value = 'import'
  running.value = true
}

watch(phase, p => { if (p === 'done') running.value = false })
onMounted(() => { tick = setInterval(advance, 380) })
onBeforeUnmount(() => { clearInterval(tick); clearTimeout(after) })
</script>
