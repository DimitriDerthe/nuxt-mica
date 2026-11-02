<template>
  <section class="ffs" aria-labelledby="ffs-title">
    <header class="ffs__head">
      <div>
        <MiText id="ffs-title" as="h2" variant="title3" weight="semibold">Feature flags</MiText>
        <MiText variant="footnote" tone="label2">Ridgeway iOS and Android · {{ onInProd }} of {{ flags.length }} live in production</MiText>
      </div>
      <MiSearch v-model="query" size="compact" placeholder="Filter flags" aria-label="Filter flags" />
    </header>

    <div class="ffs__card">
      <div class="ffs__cols" aria-hidden="true">
        <span>Flag</span><span v-for="e in envs" :key="e.id">{{ e.label }}</span>
      </div>

      <ul class="ffs__list">
        <li v-for="f in shown" :key="f.key" class="ffs__flag" :class="{ 'is-arming': arming?.key === f.key }">
          <div class="ffs__row">
            <div class="ffs__info">
              <div class="ffs__name">
                <code :id="`ffs-${f.key}-name`">{{ f.key }}</code>
                <span v-if="f.stale" class="ffs__stale">Unused {{ f.stale }} days</span>
              </div>
              <MiText variant="footnote" tone="label2">{{ f.desc }}</MiText>
              <div class="ffs__owner">
                <MiAvatar :name="f.owner" size="xs" tone="auto" decorative />
                <MiText variant="caption" tone="label3">{{ f.owner }} · {{ f.changed }}</MiText>
              </div>
            </div>
            <div v-for="e in envs" :key="e.id" class="ffs__env">
              <span :id="`ffs-${f.key}-${e.id}`" class="ffs__env-l">{{ e.label }}</span>
              <MiSwitch
                :model-value="f.on[e.id] || (e.id === 'prod' && arming?.key === f.key)" size="compact"
                :tone="e.id === 'prod' ? 'success' : 'primary'" :aria-labelledby="`ffs-${f.key}-name ffs-${f.key}-${e.id}`"
                @update:model-value="flip(f, e.id, $event)"
              />
              <span v-if="e.id === 'prod' && f.on.prod && f.rollout < 100" class="ffs__pct">{{ f.rollout }}%</span>
            </div>
          </div>

          <!-- Turning a flag on in production asks for a rollout and a reason; turning it off is instant (kill switch). -->
          <form v-if="arming?.key === f.key" class="ffs__arm" novalidate @submit.prevent="confirm(f)">
            <MiText as="h3" variant="subheadline" weight="semibold">Enable in production</MiText>
            <MiSlider v-model="arming.rollout" :min="5" :max="100" :step="5" label="Rollout" unit="%" />
            <MiText variant="caption" tone="label2">≈ {{ users }} of 312,400 monthly users will see it.</MiText>
            <MiField label="Reason for the audit log" required :error="armError">
              <MiInput v-model="arming.reason" placeholder="QA signed off on 4.18 build 2207" />
            </MiField>
            <div class="ffs__arm-actions">
              <MiButton variant="gray" size="small" @click="cancel">Cancel</MiButton>
              <MiButton type="submit" size="small">Turn on for {{ rolloutPct }}%</MiButton>
            </div>
          </form>
        </li>
      </ul>
      <MiText v-if="!shown.length" variant="footnote" tone="label3" class="ffs__empty">No flag matches “{{ query }}”.</MiText>
    </div>

    <p class="ffs__log" role="status" aria-live="polite">
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
.ffs { container: ffs / inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.ffs__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.ffs__head > :last-child { flex: 0 1 240px; }
.ffs__card { border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); overflow: hidden; }

.ffs__cols { display: none; }
.ffs__list { margin: 0; padding: 0; list-style: none; }
.ffs__flag + .ffs__flag { border-top: 1px solid var(--mi-sep); }
.ffs__flag.is-arming { background: color-mix(in srgb, var(--mi-green) 6%, transparent); }
.ffs__row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 8px; padding: 16px 18px; }
.ffs__info { grid-column: 1 / -1; display: grid; gap: 4px; min-width: 0; }
.ffs__name { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
.ffs__name code { font: 600 13.5px ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
.ffs__stale { padding: 1px 7px; border-radius: 999px; font-size: 11px; font-weight: 600; color: var(--mi-orange-t); background: color-mix(in srgb, var(--mi-orange) 14%, transparent); }
.ffs__owner { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.ffs__env { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.ffs__env-l { font-size: 11.5px; font-weight: 600; color: var(--mi-label2); }
.ffs__pct { font-size: 11px; font-weight: 600; color: var(--mi-green-t); font-variant-numeric: tabular-nums; }

@container ffs (min-width: 700px) {
  .ffs__cols, .ffs__row { display: grid; grid-template-columns: minmax(0, 1fr) repeat(3, 96px); gap: 16px; align-items: center; }
  .ffs__cols { padding: 12px 18px; font-size: 12px; font-weight: 600; color: var(--mi-label2); border-bottom: 1px solid var(--mi-sep); }
  .ffs__info { grid-column: auto; }
  .ffs__env { flex-direction: row; align-items: center; gap: 8px; }
  .ffs__env-l { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}

.ffs__arm { display: grid; gap: 12px; margin: 0 18px 18px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh2); animation: ffs-in var(--mi-dur-3) var(--mi-ease); }
@container ffs (min-width: 700px) { .ffs__arm { margin-inline-start: auto; max-width: 460px; } }
.ffs__arm-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ffs__empty { padding: 20px 18px; }
.ffs__log { display: flex; align-items: center; gap: 8px; min-height: 20px; margin: 0; font-size: 13px; color: var(--mi-label2); }
.ffs__log :deep(svg) { flex: none; color: var(--mi-green); }
@keyframes ffs-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ffs__arm { animation: none; } }
</style>
