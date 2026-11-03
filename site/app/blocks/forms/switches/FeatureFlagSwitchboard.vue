<template>
  <section class="ffs mi:@container/ffs mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="ffs-title">
    <header class="ffs__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="ffs-title" as="h2" variant="title3" weight="semibold">Feature flags</MiText>
        <MiText variant="footnote" tone="label2">Ridgeway iOS and Android · {{ onInProd }} of {{ flags.length }} live in production</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Filter flags" aria-label="Filter flags" />
    </header>

    <div class="ffs__card mi:rounded-xl mi:bg-card mi:shadow-1 mi:overflow-hidden">
      <div class="ffs__cols mi:hidden mi:@[700px]/ffs:grid mi:@[700px]/ffs:grid-cols-[minmax(0,_1fr)_repeat(3,_96px)] mi:@[700px]/ffs:gap-4 mi:@[700px]/ffs:items-center mi:@[700px]/ffs:py-3 mi:@[700px]/ffs:px-4.5 mi:@[700px]/ffs:text-[12px] mi:@[700px]/ffs:font-semibold mi:@[700px]/ffs:text-label2 mi:@[700px]/ffs:border-b mi:@[700px]/ffs:border-b-sep" aria-hidden="true">
        <span>Flag</span><span v-for="e in envs" :key="e.id">{{ e.label }}</span>
      </div>

      <ul class="ffs__list mi:m-0 mi:p-0 mi:[list-style:none]">
        <li v-for="f in shown" :key="f.key" class="ffs__flag mi:[.ffs__flag+&]:border-t mi:[.ffs__flag+&]:border-t-sep mi:[&.is-arming]:[background:color-mix(in_srgb,_var(--mi-green)_6%,_transparent)]" :class="{ 'is-arming': arming?.key === f.key }">
          <div class="ffs__row mi:grid mi:grid-cols-3 mi:gap-y-3.5 mi:gap-x-2 mi:py-4 mi:px-4.5 mi:@[700px]/ffs:grid mi:@[700px]/ffs:grid-cols-[minmax(0,_1fr)_repeat(3,_96px)] mi:@[700px]/ffs:gap-4 mi:@[700px]/ffs:items-center">
            <div class="ffs__info mi:col-span-full mi:grid mi:gap-1 mi:min-w-0 mi:@[700px]/ffs:col-[auto]">
              <div class="ffs__name mi:flex mi:flex-wrap mi:items-center mi:gap-y-1.5 mi:gap-x-2.5">
                <code class="mi:[.ffs__name_&]:[font:600_13.5px_ui-monospace,_SFMono-Regular,_Menlo,_monospace] mi:[.ffs__name_&]:wrap-anywhere" :id="`ffs-${f.key}-name`">{{ f.key }}</code>
                <span v-if="f.stale" class="ffs__stale mi:py-px mi:px-[7px] mi:rounded-[999px] mi:text-[11px] mi:font-semibold mi:text-orange-t mi:[background:color-mix(in_srgb,_var(--mi-orange)_14%,_transparent)]">Unused {{ f.stale }} days</span>
              </div>
              <MiText variant="footnote" tone="label2">{{ f.desc }}</MiText>
              <div class="ffs__owner mi:flex mi:items-center mi:gap-1.5 mi:mt-0.5">
                <MiAvatar :name="f.owner" size="xs" tone="auto" decorative />
                <MiText variant="caption" tone="label3">{{ f.owner }} · {{ f.changed }}</MiText>
              </div>
            </div>
            <div v-for="e in envs" :key="e.id" class="ffs__env mi:flex mi:flex-col mi:[align-items:flex-start] mi:gap-1.5 mi:@[700px]/ffs:flex-row mi:@[700px]/ffs:items-center mi:@[700px]/ffs:gap-2">
              <span :id="`ffs-${f.key}-${e.id}`" class="ffs__env-l mi:text-[11.5px] mi:font-semibold mi:text-label2 mi:@[700px]/ffs:absolute mi:@[700px]/ffs:w-px mi:@[700px]/ffs:h-px mi:@[700px]/ffs:overflow-hidden mi:@[700px]/ffs:[clip-path:inset(50%)] mi:@[700px]/ffs:whitespace-nowrap">{{ e.label }}</span>
              <MiSwitch
                :model-value="f.on[e.id] || (e.id === 'prod' && arming?.key === f.key)" size="compact"
                :tone="e.id === 'prod' ? 'success' : 'primary'" :aria-labelledby="`ffs-${f.key}-name ffs-${f.key}-${e.id}`"
                @update:model-value="flip(f, e.id, $event)"
              />
              <span v-if="e.id === 'prod' && f.on.prod && f.rollout < 100" class="ffs__pct mi:text-[11px] mi:font-semibold mi:text-green-t mi:tabular-nums">{{ f.rollout }}%</span>
            </div>
          </div>

          <!-- Turning a flag on in production asks for a rollout and a reason; turning it off is instant (kill switch). -->
          <form v-if="arming?.key === f.key" class="ffs__arm mi:grid mi:gap-3 mi:mt-0 mi:mx-4.5 mi:mb-4.5 mi:p-4 mi:rounded-lg mi:bg-card mi:shadow-2 mi:@[700px]/ffs:ms-auto mi:@[700px]/ffs:max-w-115" novalidate @submit.prevent="confirm(f)">
            <MiText as="h3" variant="subheadline" weight="semibold">Enable in production</MiText>
            <MiSlider v-model="arming.rollout" :min="5" :max="100" :step="5" label="Rollout" unit="%" />
            <MiText variant="caption" tone="label2">≈ {{ users }} of 312,400 monthly users will see it.</MiText>
            <MiField label="Reason for the audit log" required :error="armError">
              <MiInput v-model="arming.reason" placeholder="QA signed off on 4.18 build 2207" />
            </MiField>
            <div class="ffs__arm-actions mi:flex mi:[justify-content:flex-end] mi:gap-2">
              <MiButton variant="gray" size="small" @click="cancel">Cancel</MiButton>
              <MiButton type="submit" size="small">Turn on for {{ rolloutPct }}%</MiButton>
            </div>
          </form>
        </li>
      </ul>
      <MiText v-if="!shown.length" variant="footnote" tone="label3" class="ffs__empty mi:py-5 mi:px-4.5">No flag matches “{{ query }}”.</MiText>
    </div>

    <p class="ffs__log mi:flex mi:items-center mi:gap-2 mi:min-h-5 mi:m-0 mi:text-[13px] mi:text-label2" role="status" aria-live="polite">
      <MiIcon v-if="log" name="check-circle-fill" :size="16" />{{ log }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

type Env = 'dev' | 'staging' | 'prod'
interface Flag { key: string, desc: string, owner: string, changed: string, stale?: number, rollout: number, on: Record<Env, boolean> }

const envs: { id: Env, label: string }[] = [{ id: 'dev', label: 'Dev' }, { id: 'staging', label: 'Staging' }, { id: 'prod', label: 'Production' }]
const flags = reactive<Flag[]>([
  { key: 'live_activities', desc: 'Lock-screen trip progress on iOS 17+', owner: 'Sofia Lindqvist', changed: '2 h ago', rollout: 100, on: { dev: true, staging: true, prod: false } },
  { key: 'offline_maps_v2', desc: 'Vector tiles cached per region instead of per trip', owner: 'Rahul Menon', changed: 'yesterday', rollout: 25, on: { dev: true, staging: true, prod: true } },
  { key: 'tipping_prompt', desc: 'Ask riders for a tip after five-star trips', owner: 'Grace Okafor', changed: 'Oct 28', rollout: 100, on: { dev: true, staging: false, prod: false } },
  { key: 'legacy_receipts', desc: 'Old PDF receipt renderer as a fallback', owner: 'Martin Duval', changed: 'Sep 22', stale: 41, rollout: 100, on: { dev: false, staging: false, prod: true } }
])
const query = ref('')
const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? flags.filter(f => (f.key + ' ' + f.desc).toLowerCase().includes(q)) : flags
})
const onInProd = computed(() => flags.filter(f => f.on.prod).length)

const arming = ref<{ key: string, rollout: number | [number, number], reason: string } | null>(null)
const tried = ref(false)
const log = ref('')
const rolloutPct = computed(() => { const r = arming.value?.rollout ?? 100; return Array.isArray(r) ? r[1] : r })
const users = computed(() => Math.round(312400 * rolloutPct.value / 100).toLocaleString('en-US'))
const armError = computed(() => {
  if (!tried.value || !arming.value) return undefined
  const len = arming.value.reason.trim().length
  return len === 0 ? 'Say why, so on-call knows what changed.' : len < 10 ? 'A few more words, please (10 characters minimum).' : undefined
})

function flip(f: Flag, env: Env, on: boolean) {
  if (env !== 'prod') { f.on[env] = on; f.changed = 'just now'; return }
  if (on) { arming.value = { key: f.key, rollout: 25, reason: '' }; tried.value = false; return }
  if (arming.value?.key === f.key) { cancel(); return }
  f.on.prod = false
  f.changed = 'just now'
  log.value = `${f.key} turned off in production. Takes effect within 30 seconds.`
}
function cancel() { arming.value = null; tried.value = false }
function confirm(f: Flag) {
  tried.value = true
  if (armError.value || !arming.value) return
  f.on.prod = true
  f.rollout = rolloutPct.value
  f.changed = 'just now'
  f.stale = undefined
  log.value = `${f.key} on in production for ${f.rollout}% of users. Logged: “${arming.value.reason.trim()}”.`
  cancel()
}
</script>

<style scoped>
.ffs__head > :last-child { flex: 0 1 240px; }

.ffs__arm { animation: ffs-in var(--mi-dur-3) var(--mi-ease); }
.ffs__log :deep(svg) { flex: none; color: var(--mi-green); }
@keyframes ffs-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ffs__arm { animation: none; } }
</style>
