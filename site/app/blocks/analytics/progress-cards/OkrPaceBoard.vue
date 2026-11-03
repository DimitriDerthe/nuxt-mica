<template>
  <section class="ok mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="ok-title">
    <header class="ok__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ok-title" variant="title3" as="h2" weight="semibold">Q4 objectives</MiText>
        <MiText variant="footnote" tone="label2">Product group · each bar shows where you are, the tick where you should be today</MiText>
      </div>
      <MiSegmented v-model="filter" label="Show" :options="filters" />
    </header>

    <!-- Quarter clock: time spent is the yardstick every key result is read against. -->
    <div class="ok__clock mi:grid mi:gap-2.5 mi:py-3.5 mi:px-4.5 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-1 mi:@[760px]:grid-cols-[auto_minmax(0,_1fr)_auto] mi:@[760px]:items-center mi:@[760px]:gap-4.5">
      <div class="ok__clock-text mi:flex mi:flex-wrap mi:items-baseline mi:gap-y-1 mi:gap-x-2.5">
        <MiText variant="subheadline" weight="semibold" as="span">Day {{ DAY }} of {{ DAYS }}</MiText>
        <MiText variant="footnote" tone="label2" as="span">{{ Math.round(pace * 100) }}% of the quarter gone</MiText>
      </div>
      <div class="ok__clock-bar mi:h-2 mi:rounded-[4px] mi:overflow-hidden mi:[background:repeating-linear-gradient(90deg,_var(--mi-fill3)_0_calc(100%_/_13_-_2px),_transparent_calc(100%_/_13_-_2px)_calc(100%_/_13))]" role="meter" aria-label="Quarter elapsed" :aria-valuenow="Math.round(pace * 100)" aria-valuemin="0" aria-valuemax="100">
        <span class="mi:[.ok__clock-bar_&]:block mi:[.ok__clock-bar_&]:h-full mi:[.ok__clock-bar_&]:[background:var(--mi-label)] mi:[.ok__clock-bar_&]:opacity-75 mi:[.ok__clock-bar_&]:origin-left" :style="{ transform: `scaleX(${pace})` }" />
      </div>
      <ul class="ok__tally mi:flex mi:flex-wrap mi:gap-y-1 mi:gap-x-3.5 mi:m-0 mi:p-0 mi:[list-style:none] mi:text-[12px] mi:text-label2 mi:tabular-nums" aria-label="Key results by status">
        <li class="mi:[.ok__tally_&]:inline-flex mi:[.ok__tally_&]:items-center mi:[.ok__tally_&]:gap-1.5" v-for="s in tally" :key="s.id"><i class="mi:[.ok__tally_&]:w-2 mi:[.ok__tally_&]:h-2 mi:[.ok__tally_&]:rounded-[50%] mi:[.ok__tally_&]:[background:var(--ok-c)]" :class="'is-' + s.id" aria-hidden="true" />{{ s.count }} {{ s.label }}</li>
      </ul>
    </div>

    <div class="ok__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]:grid-cols-2 mi:@[1100px]:grid-cols-3">
      <article v-for="o in visible" :key="o.id" class="ok__card mi:[@container_(min-width:_760px)_and_(max-width:_1099px)]:[&:nth-child(odd):last-child]:col-[span_2] mi:grid mi:gap-3.5 mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1" :aria-labelledby="'ok-' + o.id">
        <header class="ok__card-head mi:grid mi:grid-cols-[auto_minmax(0,_1fr)] mi:items-center mi:gap-3">
          <MiProgressRing :value="o.score" :size="48" :stroke="5" show-value :label="`${o.title} progress`">
            <span class="ok__ring mi:text-[13px] mi:font-bold mi:tabular-nums">{{ o.score }}</span>
          </MiProgressRing>
          <div class="ok__card-title mi:grid mi:gap-1 mi:min-w-0">
            <MiText :id="'ok-' + o.id" variant="headline" as="h3">{{ o.title }}</MiText>
            <div class="ok__owner mi:inline-flex mi:items-center mi:gap-1.5">
              <MiAvatar :name="o.owner" size="xs" tone="auto" decorative />
              <MiText variant="caption" tone="label2" as="span">{{ o.owner }}</MiText>
            </div>
          </div>
        </header>

        <ul class="ok__krs mi:grid mi:m-0 mi:p-0 mi:[list-style:none]">
          <li v-for="k in o.krs" :key="k.id" class="ok__kr mi:grid mi:gap-2 mi:py-3 mi:px-0 mi:border-t mi:border-t-sep mi:last:pb-0">
            <div class="ok__kr-top mi:flex mi:[align-items:flex-start] mi:justify-between mi:gap-2.5">
              <MiText variant="footnote" weight="medium">{{ k.title }}</MiText>
              <MiBadge :tone="statusMeta[k.status].tone" :label="statusMeta[k.status].label" />
            </div>
            <div class="ok__track mi:relative mi:h-2 mi:rounded-[4px] mi:[background:var(--mi-fill3)]" role="meter" :aria-label="k.title" :aria-valuenow="Math.round(k.progress * 100)" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${Math.round(k.progress * 100)}%, expected ${Math.round(pace * 100)}% by today`">
              <span class="ok__fill mi:absolute mi:inset-0 mi:rounded-[inherit] mi:[background:var(--ok-c)] mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:motion-reduce:[transition:none]" :class="'is-' + k.status" :style="{ transform: `scaleX(${k.progress})` }" />
              <span class="ok__pace mi:absolute mi:-top-1 mi:-bottom-1 mi:w-0.5 mi:-ms-px mi:rounded-[1px] mi:[background:var(--mi-label)] mi:shadow-[0_0_0_2px_var(--mi-card)]" :style="{ insetInlineStart: pace * 100 + '%' }" aria-hidden="true" />
            </div>
            <div class="ok__kr-foot mi:flex mi:items-center mi:justify-between mi:gap-2 mi:min-h-7">
              <MiText variant="caption" tone="label2" as="span" tabular>{{ fmt(k, k.start) }} → <b>{{ fmt(k, k.current) }}</b> → {{ fmt(k, k.target) }}</MiText>
              <MiButton v-if="editing !== k.id" variant="plain" size="mini" :aria-label="`Check in on ${k.title}`" @click="startEdit(k)">Check in</MiButton>
            </div>

            <div v-if="editing === k.id" class="ok__checkin mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2.5 mi:p-2.5 mi:rounded-md mi:[background:var(--mi-fill4)]">
              <MiStepper
                v-model="draft" variant="field" :min="k.min" :max="k.max" :step="k.step" :unit="k.unit.trim()"
                :label="`New value for ${k.title}`"
              />
              <div class="ok__checkin-actions mi:flex mi:gap-1.5">
                <MiButton variant="gray" size="small" @click="editing = ''">Cancel</MiButton>
                <MiButton size="small" @click="save(k.id)">Save</MiButton>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </div>
    <p class="ok__sr mi:absolute mi:w-px mi:h-px mi:m-0 mi:overflow-hidden mi:[clip-path:inset(50%)] mi:whitespace-nowrap" aria-live="polite">{{ announce }}</p>
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
.is-ahead { --ok-c: var(--mi-green); }
.is-track { --ok-c: var(--mi-p); }
.is-risk { --ok-c: var(--mi-orange); }
.is-behind { --ok-c: var(--mi-red); }
/* An odd card out on two columns takes the full row instead of leaving a hole. */
.ok__kr-top > :first-child { min-width: 0; }
.ok__kr-top > :last-child { flex: none; }
.ok__kr-foot b { color: var(--mi-label); font-weight: 600; }
</style>
