<template>
  <div class="ip-cq">
    <section class="ip" aria-labelledby="ip-title">
      <header class="ip__head">
        <div class="ip__src" aria-hidden="true">
          <span class="ip__logo ip__logo--from">S</span>
          <MiIcon name="arrow-right" :size="14" />
          <span class="ip__logo ip__logo--to"><MiLogo variant="short" :size="14" tone="on-primary" dot="inherit" decorative /></span>
        </div>
        <div class="ip__titles">
          <MiText id="ip-title" variant="title3" as="h2" weight="semibold">Importing Northwind Coffee</MiText>
          <MiText variant="footnote" tone="label2">From Shopify · started 4 min ago by Priya Raman</MiText>
        </div>
      </header>

      <MiSteps :model-value="step" :steps="steps" orientation="horizontal" :clickable="false" aria-label="Import stages" />

      <div class="ip__grid">
        <!-- Overall: a ring for the whole job, with a stop control beside it. -->
        <div class="ip__overall">
          <MiProgressRing :value="overall" :size="88" :label="'Overall import progress'" />
          <div class="ip__overall-text">
            <MiText variant="headline" as="p" aria-live="polite">{{ headline }}</MiText>
            <MiText variant="footnote" tone="label2" tabular>{{ done.toLocaleString('en-US') }} of {{ total.toLocaleString('en-US') }} records</MiText>
            <div class="ip__controls">
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
        <div class="ip__entities">
          <MiProgress
            v-for="e in entities" :key="e.id" :value="e.done" :max="e.total" size="sm" :label="e.label"
            :value-text="`${e.done.toLocaleString('en-US')} / ${e.total.toLocaleString('en-US')}`"
          />
        </div>

        <div class="ip__side">
          <MiProgress :segments="outcome" :label="'Outcome so far'" size="lg" />
          <MiMeter
            :value="budget" label="Shopify API budget" size="sm" :caption="budget + '% in use'"
            :hint="budget > 80 ? 'Throttling soon' : 'Healthy'" :color="budget > 80 ? 'var(--mi-orange)' : undefined"
          />
          <div class="ip__reindex">
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

<style scoped>
.ip-cq { container-type: inline-size; }
.ip {
  display: grid; gap: 20px; padding: 20px; border-radius: var(--mi-radius-xl);
  font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-card); box-shadow: var(--mi-sh1);
}
.ip__head { display: flex; align-items: center; gap: 14px; }
.ip__src { display: flex; align-items: center; gap: 6px; flex: none; color: var(--mi-label3); }
.ip__logo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9px; font-weight: 800; font-size: 15px; }
.ip__logo--from { color: var(--mi-green-t); background: color-mix(in srgb, var(--mi-green) 16%, transparent); }
.ip__logo--to { color: var(--mi-p-on); background: var(--mi-p); }
.ip__titles { display: grid; gap: 2px; min-width: 0; }

.ip__grid { display: grid; gap: 14px; }
.ip__overall { display: flex; align-items: center; gap: 18px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.ip__overall-text { display: grid; gap: 2px; min-width: 0; }
.ip__controls { margin-top: 8px; }
.ip__entities { display: grid; gap: 14px; align-content: start; padding: 16px; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.ip__side { display: grid; gap: 18px; align-content: start; padding: 16px; border-radius: var(--mi-radius-l); box-shadow: inset 0 0 0 1px var(--mi-sep); }
.ip__reindex { padding-top: 14px; border-top: 1px solid var(--mi-sep); }

@container (min-width: 640px) {
  .ip { padding: 24px 26px; }
  .ip__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ip__overall { grid-column: 1 / -1; }
}
@container (min-width: 980px) {
  .ip__grid { grid-template-columns: 280px minmax(0, 1fr) minmax(0, 1fr); }
  .ip__overall { grid-column: auto; flex-direction: column; align-items: flex-start; }
}
</style>
