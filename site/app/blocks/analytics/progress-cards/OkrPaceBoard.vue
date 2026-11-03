<template>
  <section class="ok" aria-labelledby="ok-title">
    <header class="ok__head">
      <div>
        <MiText id="ok-title" variant="title3" as="h2" weight="semibold">Q4 objectives</MiText>
        <MiText variant="footnote" tone="label2">Product group · each bar shows where you are, the tick where you should be today</MiText>
      </div>
      <MiSegmented v-model="filter" label="Show" :options="filters" />
    </header>

    <!-- Quarter clock: time spent is the yardstick every key result is read against. -->
    <div class="ok__clock">
      <div class="ok__clock-text">
        <MiText variant="subheadline" weight="semibold" as="span">Day {{ DAY }} of {{ DAYS }}</MiText>
        <MiText variant="footnote" tone="label2" as="span">{{ Math.round(pace * 100) }}% of the quarter gone</MiText>
      </div>
      <div class="ok__clock-bar" role="meter" aria-label="Quarter elapsed" :aria-valuenow="Math.round(pace * 100)" aria-valuemin="0" aria-valuemax="100">
        <span :style="{ transform: `scaleX(${pace})` }" />
      </div>
      <ul class="ok__tally" aria-label="Key results by status">
        <li v-for="s in tally" :key="s.id"><i :class="'is-' + s.id" aria-hidden="true" />{{ s.count }} {{ s.label }}</li>
      </ul>
    </div>

    <div class="ok__grid">
      <article v-for="o in visible" :key="o.id" class="ok__card" :aria-labelledby="'ok-' + o.id">
        <header class="ok__card-head">
          <MiProgressRing :value="o.score" :size="48" :stroke="5" show-value :label="`${o.title} progress`">
            <span class="ok__ring">{{ o.score }}</span>
          </MiProgressRing>
          <div class="ok__card-title">
            <MiText :id="'ok-' + o.id" variant="headline" as="h3">{{ o.title }}</MiText>
            <div class="ok__owner">
              <MiAvatar :name="o.owner" size="xs" tone="auto" decorative />
              <MiText variant="caption" tone="label2" as="span">{{ o.owner }}</MiText>
            </div>
          </div>
        </header>

        <ul class="ok__krs">
          <li v-for="k in o.krs" :key="k.id" class="ok__kr">
            <div class="ok__kr-top">
              <MiText variant="footnote" weight="medium">{{ k.title }}</MiText>
              <MiBadge :tone="statusMeta[k.status].tone" :label="statusMeta[k.status].label" />
            </div>
            <div class="ok__track" role="meter" :aria-label="k.title" :aria-valuenow="Math.round(k.progress * 100)" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${Math.round(k.progress * 100)}%, expected ${Math.round(pace * 100)}% by today`">
              <span class="ok__fill" :class="'is-' + k.status" :style="{ transform: `scaleX(${k.progress})` }" />
              <span class="ok__pace" :style="{ insetInlineStart: pace * 100 + '%' }" aria-hidden="true" />
            </div>
            <div class="ok__kr-foot">
              <MiText variant="caption" tone="label2" as="span" tabular>{{ fmt(k, k.start) }} → <b>{{ fmt(k, k.current) }}</b> → {{ fmt(k, k.target) }}</MiText>
              <MiButton v-if="editing !== k.id" variant="plain" size="mini" :aria-label="`Check in on ${k.title}`" @click="startEdit(k)">Check in</MiButton>
            </div>

            <div v-if="editing === k.id" class="ok__checkin">
              <MiStepper
                v-model="draft" variant="field" :min="k.min" :max="k.max" :step="k.step" :unit="k.unit.trim()"
                :label="`New value for ${k.title}`"
              />
              <div class="ok__checkin-actions">
                <MiButton variant="gray" size="small" @click="editing = ''">Cancel</MiButton>
                <MiButton size="small" @click="save(k.id)">Save</MiButton>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </div>
    <p class="ok__sr" aria-live="polite">{{ announce }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Status = 'ahead' | 'track' | 'risk' | 'behind'

const DAY = 33
const DAYS = 92
const pace = DAY / DAYS

const filters = [{ value: 'all', label: 'All' }, { value: 'attention', label: 'Needs attention' }]
const filter = ref<string | number | null>('all')

const statusMeta: Record<Status, { label: string, tone: 'success' | 'primary' | 'warning' | 'danger' }> = {
  ahead: { label: 'Ahead', tone: 'success' },
  track: { label: 'On track', tone: 'primary' },
  risk: { label: 'At risk', tone: 'warning' },
  behind: { label: 'Behind', tone: 'danger' }
}

interface Kr { id: string, title: string, start: number, target: number, current: number, unit: string, step: number, min: number, max: number }
const kr = (id: string, title: string, start: number, target: number, current: number, unit: string, step = 1): Kr =>
  ({ id, title, start, target, current, unit, step, min: 0, max: Math.max(start, target) * 2 })

// Sample objectives; `current` is the latest check-in.
const objectives = reactive([
  {
    id: 'o1', title: 'Make onboarding self-serve', owner: 'Inês Duarte',
    krs: [
      kr('k1', 'Lift activation from 31% to 45%', 31, 45, 38, '%'),
      kr('k2', 'Cut median time to first value to 2 days', 4, 2, 3.4, ' days', 0.1),
      kr('k3', 'Halve setup tickets to 120 a month', 220, 120, 196, ' tickets')
    ]
  },
  {
    id: 'o2', title: 'Grow expansion revenue', owner: 'Kwame Asante',
    krs: [
      kr('k4', 'Net revenue retention from 104% to 112%', 104, 112, 107, '%'),
      kr('k5', 'Move 50% of accounts to annual plans', 38, 50, 39, '%')
    ]
  },
  {
    id: 'o3', title: 'Ship the public API', owner: 'Sofia Bergström',
    krs: [
      kr('k6', 'Document all 40 endpoints', 0, 40, 22, ' endpoints'),
      kr('k7', 'Put 8 design partners live', 0, 8, 3, ' partners'),
      kr('k8', 'Bring p95 latency down to 250 ms', 480, 250, 410, ' ms', 5)
    ]
  }
])

function statusOf (p: number): Status {
  if (p >= pace + 0.1) return 'ahead'
  if (p >= pace - 0.05) return 'track'
  if (p >= pace - 0.15) return 'risk'
  return 'behind'
}

const scored = computed(() => objectives.map((o) => {
  const krs = o.krs.map((k) => {
    const progress = Math.min(1, Math.max(0, (k.current - k.start) / (k.target - k.start)))
    return { ...k, progress, status: statusOf(progress) }
  })
  const score = Math.round((krs.reduce((t, k) => t + k.progress, 0) / krs.length) * 100)
  return { ...o, krs, score }
}))

const visible = computed(() => filter.value === 'attention'
  ? scored.value.map(o => ({ ...o, krs: o.krs.filter(k => k.status === 'risk' || k.status === 'behind') })).filter(o => o.krs.length)
  : scored.value)

const tally = computed(() => (['ahead', 'track', 'risk', 'behind'] as const).map(id => ({
  id, label: statusMeta[id].label.toLowerCase(), count: scored.value.reduce((t, o) => t + o.krs.filter(k => k.status === id).length, 0)
})))

const fmt = (k: Kr, v: number) => (k.step < 1 ? v.toFixed(1) : String(v)) + k.unit

// Check-in: edit one key result at a time with a stepper, then save.
const editing = ref('')
const draft = ref(0)
const announce = ref('')
function startEdit (k: Kr) { editing.value = k.id; draft.value = k.current }
function save (id: string) {
  for (const o of objectives) {
    const k = o.krs.find(x => x.id === id)
    if (k) { k.current = Math.round(draft.value * 10) / 10; announce.value = `Checked in ${k.title} at ${fmt(k, k.current)}.` }
  }
  editing.value = ''
}
</script>

<style scoped>
.ok { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ok__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.ok__sr { position: absolute; width: 1px; height: 1px; margin: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

.ok__clock { display: grid; gap: 10px; padding: 14px 18px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
@container (min-width: 760px) { .ok__clock { grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 18px; } }
.ok__clock-text { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
.ok__clock-bar { height: 8px; border-radius: 4px; overflow: hidden; background: repeating-linear-gradient(90deg, var(--mi-fill3) 0 calc(100% / 13 - 2px), transparent calc(100% / 13 - 2px) calc(100% / 13)); }
.ok__clock-bar span { display: block; height: 100%; background: var(--mi-label); opacity: .75; transform-origin: left; }
.ok__tally { display: flex; flex-wrap: wrap; gap: 4px 14px; margin: 0; padding: 0; list-style: none; font-size: 12px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.ok__tally li { display: inline-flex; align-items: center; gap: 6px; }
.ok__tally i { width: 8px; height: 8px; border-radius: 50%; }

.is-ahead { --ok-c: var(--mi-green); }
.is-track { --ok-c: var(--mi-p); }
.is-risk { --ok-c: var(--mi-orange); }
.is-behind { --ok-c: var(--mi-red); }
.ok__tally i { background: var(--ok-c); }

.ok__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container (min-width: 760px) { .ok__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
/* An odd card out on two columns takes the full row instead of leaving a hole. */
@container (min-width: 760px) and (max-width: 1099px) { .ok__card:nth-child(odd):last-child { grid-column: span 2; } }
@container (min-width: 1100px) { .ok__grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.ok__card { display: grid; gap: 14px; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.ok__card-head { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 12px; }
.ok__ring { font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums; }
.ok__card-title { display: grid; gap: 4px; min-width: 0; }
.ok__owner { display: inline-flex; align-items: center; gap: 6px; }

.ok__krs { display: grid; margin: 0; padding: 0; list-style: none; }
.ok__kr { display: grid; gap: 8px; padding: 12px 0; border-top: 1px solid var(--mi-sep); }
.ok__kr:last-child { padding-bottom: 0; }
.ok__kr-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.ok__kr-top > :first-child { min-width: 0; }
.ok__kr-top > :last-child { flex: none; }

.ok__track { position: relative; height: 8px; border-radius: 4px; background: var(--mi-fill3); }
.ok__fill { position: absolute; inset: 0; border-radius: inherit; background: var(--ok-c); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
/* Pace tick: where this key result should be today if progress were linear. */
.ok__pace { position: absolute; top: -4px; bottom: -4px; width: 2px; margin-inline-start: -1px; border-radius: 1px; background: var(--mi-label); box-shadow: 0 0 0 2px var(--mi-card); }

.ok__kr-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 28px; }
.ok__kr-foot b { color: var(--mi-label); font-weight: 600; }

.ok__checkin { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 10px; border-radius: var(--mi-radius-m); background: var(--mi-fill4); }
.ok__checkin-actions { display: flex; gap: 6px; }
@media (prefers-reduced-motion: reduce) { .ok__fill { transition: none; } }
</style>
