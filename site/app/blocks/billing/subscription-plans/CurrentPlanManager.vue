<template>
  <section class="cpm" aria-labelledby="cpm-title">
    <header class="cpm__head">
      <div class="cpm__intro">
        <MiText id="cpm-title" as="h2" variant="title2" weight="bold">Plan and usage</MiText>
        <MiText variant="footnote" tone="label2">Kestrel Architects · billing period {{ day(periodStart) }} to {{ day(periodEnd) }}</MiText>
      </div>
      <div class="cpm__now">
        <span class="cpm__now-name">{{ plan.name }}</span>
        <span class="cpm__now-price">{{ eur(plan.price) }}<small>/ month</small></span>
      </div>
    </header>

    <div class="cpm__layout">
      <div class="cpm__usage">
        <section class="cpm__card" aria-labelledby="cpm-quota-title">
          <div class="cpm__card-head">
            <MiText id="cpm-quota-title" as="h3" variant="headline">This period</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ daysLeft }} days left</MiText>
          </div>
          <div class="cpm__meters">
            <div v-for="q in quotas" :key="q.id" class="cpm__quota" :class="`is-${q.state}`">
              <MiMeter
                :value="q.unlimited ? 0 : q.used" :max="q.unlimited ? 1 : q.limit" :label="q.label" size="sm" :color="q.color"
                :value-text="q.unlimited ? `${q.used} ${q.unit}, unlimited` : `${q.used} of ${q.limit} ${q.unit}`"
              >
                <span class="cpm__quota-foot">
                  <span class="cpm__quota-num">{{ q.used }}<span> / {{ q.unlimited ? '∞' : q.limitText }}</span></span>
                  <span class="cpm__quota-state">
                    <MiIcon v-if="q.state !== 'ok'" :name="q.state === 'full' ? 'exclamation-circle' : 'warning'" :size="13" />
                    {{ q.note }}
                  </span>
                </span>
              </MiMeter>
            </div>
          </div>
        </section>

        <!-- Why upgrade: the limit hits, placed on the billing period. -->
        <section v-if="planId === 'team'" class="cpm__card cpm__why" aria-labelledby="cpm-why-title">
          <MiText id="cpm-why-title" as="h3" variant="headline">You hit the project limit 3 times this period</MiText>
          <MiText variant="footnote" tone="label2">Each time, someone archived a project to start a new one. Business removes the cap.</MiText>
          <div class="cpm__period" role="img" :aria-label="`Limit reached on ${hits.map(h => day(h)).join(', ')}`">
            <span class="cpm__period-line" />
            <span class="cpm__period-done" :style="{ transform: `scaleX(${elapsed})` }" />
            <span v-for="h in hits" :key="h.toISOString()" class="cpm__hit" :style="{ left: `${at(h) * 100}%` }" />
            <span class="cpm__today" :style="{ left: `${elapsed * 100}%` }"><span>Today</span></span>
          </div>
          <div class="cpm__period-ends" aria-hidden="true">
            <span>{{ day(periodStart) }}</span>
            <span class="cpm__hits">Limit reached {{ hits.map(h => day(h)).join(', ') }}</span>
            <span>{{ day(periodEnd) }}</span>
          </div>
        </section>
      </div>

      <section class="cpm__card cpm__change" aria-labelledby="cpm-change-title">
        <MiText id="cpm-change-title" as="h3" variant="headline">Change plan</MiText>
        <MiSegmented v-model="target" label="New plan" :options="plans.map(p => ({ value: p.id, label: p.id === planId ? `${p.name} (current)` : p.name }))" />

        <template v-if="next.id !== planId">
          <MiRadioGroup v-model="timing" label="When the change applies" :options="timingOptions" orientation="horizontal" />

          <div class="cpm__diff">
            <div v-for="d in diffs" :key="d.label" class="cpm__diff-row" :class="{ 'is-block': d.blocked, 'is-up': d.up }">
              <span class="cpm__diff-label">{{ d.label }}</span>
              <span class="cpm__diff-vals"><span class="cpm__from">{{ d.from }}</span><MiIcon name="arrow-right" :size="13" /><strong>{{ d.to }}</strong></span>
            </div>
          </div>

          <MiAlert v-if="blockers.length" tone="danger" title="Too much in use for this plan">
            {{ blockers.join(' ') }}
          </MiAlert>

          <dl v-else class="cpm__bill" aria-live="polite">
            <template v-if="timing === 'now'">
              <div><dt>Unused {{ plan.name }}, {{ daysLeft }} of {{ periodDays }} days</dt><dd>−{{ eur(credit, 2) }}</dd></div>
              <div><dt>{{ next.name }} for the same {{ daysLeft }} days</dt><dd>{{ eur(charge, 2) }}</dd></div>
              <div class="cpm__due"><dt>{{ due >= 0 ? 'Due today' : 'Credit to your balance' }}</dt><dd>{{ eur(Math.abs(due), 2) }}</dd></div>
              <p class="cpm__eff">Effective today, {{ day(today) }}. From {{ day(periodEnd) }} you pay {{ eur(next.price) }} a month.</p>
            </template>
            <template v-else>
              <div><dt>Due today</dt><dd>{{ eur(0, 2) }}</dd></div>
              <div class="cpm__due"><dt>First {{ next.name }} invoice, {{ day(periodEnd) }}</dt><dd>{{ eur(next.price, 2) }}</dd></div>
              <p class="cpm__eff">You keep {{ plan.name }} until {{ day(periodEnd) }}, then switch automatically.</p>
            </template>
          </dl>

          <MiButton block :variant="blockers.length ? 'gray' : 'filled'" :disabled="!!blockers.length" :loading="busy" @click="confirm">
            {{ cta }}
          </MiButton>
        </template>
        <p v-else class="cpm__idle" :class="{ 'is-done': doneNote }" aria-live="polite">
          <MiIcon v-if="doneNote" name="check-circle-fill" :size="18" />
          <span>{{ doneNote || 'Pick another plan to preview the price difference and new limits.' }}</span>
        </p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const t = setTimeout(() => { timers.delete(t); fn() }, ms)
  timers.add(t)
}
onBeforeUnmount(() => { timers.forEach(clearTimeout); timers.clear() })

type PlanId = 'starter' | 'team' | 'business'
type QuotaId = 'seats' | 'projects' | 'storage'
const plans: { id: PlanId, name: string, price: number, limits: Record<QuotaId, number> }[] = [
  { id: 'starter', name: 'Starter', price: 90, limits: { seats: 5, projects: 5, storage: 50 } },
  { id: 'team', name: 'Team', price: 240, limits: { seats: 15, projects: 20, storage: 250 } },
  { id: 'business', name: 'Business', price: 420, limits: { seats: 40, projects: Infinity, storage: 1000 } }
]
const usage: Record<QuotaId, number> = { seats: 13, projects: 20, storage: 118 }
const meta: Record<QuotaId, { label: string, unit: string }> = {
  seats: { label: 'Seats', unit: 'people' },
  projects: { label: 'Active projects', unit: 'projects' },
  storage: { label: 'File storage', unit: 'GB' }
}

const today = new Date('2026-11-02')
const periodStart = new Date('2026-10-20')
const periodEnd = new Date('2026-11-20')
const hits = [new Date('2026-10-23'), new Date('2026-10-28'), new Date('2026-11-01')]
const DAY = 86_400_000
const periodDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / DAY)
const daysLeft = Math.round((periodEnd.getTime() - today.getTime()) / DAY)
const at = (d: Date) => (d.getTime() - periodStart.getTime()) / (periodEnd.getTime() - periodStart.getTime())
const elapsed = at(today)
const day = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

const planId = ref<PlanId>('team')
const plan = computed(() => plans.find(p => p.id === planId.value)!)
const target = ref<string | number | null>('business')
const next = computed(() => plans.find(p => p.id === target.value) ?? plan.value)

const show = (id: QuotaId, v: number) => (v === Infinity ? 'Unlimited' : id === 'storage' ? (v >= 1000 ? `${v / 1000} TB` : `${v} GB`) : String(v))
const quotas = computed(() => (Object.keys(meta) as QuotaId[]).map((id) => {
  const limit = plan.value.limits[id]
  const used = usage[id]
  const unlimited = limit === Infinity
  const ratio = unlimited ? 0 : used / limit
  const state = ratio >= 1 ? 'full' : ratio >= 0.8 ? 'warn' : 'ok'
  const note = unlimited ? 'Unlimited' : state === 'full' ? 'Limit reached' : state === 'warn' ? `${limit - used} left` : `${Math.round(ratio * 100)}% used`
  const color = state === 'full' ? 'var(--mi-red)' : state === 'warn' ? 'var(--mi-orange)' : undefined
  const limitText = id === 'storage' ? show(id, limit) : `${limit} ${meta[id].unit}`
  return { id, ...meta[id], used, limit, limitText, unlimited, state, note, color }
}))

const timingOptions = [{ value: 'now', label: 'Now, prorated' }, { value: 'renewal', label: 'At renewal' }]
const timing = ref<string | number | boolean | null>('now')

const diffs = computed(() => (Object.keys(meta) as QuotaId[]).map(id => ({
  label: meta[id].label,
  from: show(id, plan.value.limits[id]),
  to: show(id, next.value.limits[id]),
  up: next.value.limits[id] > plan.value.limits[id],
  blocked: usage[id] > next.value.limits[id]
})))
const blockers = computed(() => (Object.keys(meta) as QuotaId[])
  .filter(id => usage[id] > next.value.limits[id])
  .map(id => `${usage[id]} ${meta[id].unit} in use, ${next.value.name} allows ${show(id, next.value.limits[id])}.`))

const credit = computed(() => (plan.value.price * daysLeft) / periodDays)
const charge = computed(() => (next.value.price * daysLeft) / periodDays)
const due = computed(() => charge.value - credit.value)
const cta = computed(() => {
  if (blockers.value.length) return `Free up space to move to ${next.value.name}`
  if (timing.value === 'renewal') return `Schedule ${next.value.name} for ${day(periodEnd)}`
  return due.value >= 0 ? `Switch now and pay ${eur(due.value, 2)}` : `Switch now, keep ${eur(-due.value, 2)} credit`
})

const busy = ref(false)
const doneNote = ref('')
function confirm() {
  if (blockers.value.length) return
  busy.value = true
  later(() => {
    busy.value = false
    if (timing.value === 'now') {
      doneNote.value = `${next.value.name} is active. A receipt for ${eur(due.value, 2)} is on its way to billing@kestrel.studio.`
      planId.value = next.value.id
    }
    else {
      doneNote.value = `${next.value.name} starts on ${day(periodEnd)}. You can cancel the change until then.`
    }
    target.value = planId.value
  }, 700)
}

const eur = (v: number, digits = 0) => new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v)
</script>

<style scoped>
.cpm { container: cpm / inline-size; display: grid; align-content: start; gap: 20px; font-family: var(--mi-font); color: var(--mi-label); }
.cpm__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px 20px; }
.cpm__intro { display: grid; gap: 4px; }
.cpm__now { display: flex; align-items: baseline; gap: 10px; padding: 8px 14px; border-radius: 999px; background: var(--mi-fill4); }
.cpm__now-name { font-size: 13px; font-weight: 700; color: var(--mi-p-text); }
.cpm__now-price { font-size: 15px; font-weight: 650; font-variant-numeric: tabular-nums; }
.cpm__now-price small { margin-left: 3px; font-size: 12px; font-weight: 500; color: var(--mi-label2); }

.cpm__layout { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); align-items: start; }
@container cpm (min-width: 760px) { .cpm__layout { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 20px; } }
.cpm__usage { display: grid; gap: 16px; min-width: 0; }
.cpm__card { display: grid; gap: 14px; padding: 20px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); min-width: 0; }
.cpm__card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }

.cpm__meters { display: grid; gap: 18px; }
.cpm__quota-foot { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; width: 100%; }
.cpm__quota-num { font-size: 15px; font-weight: 650; font-variant-numeric: tabular-nums; }
.cpm__quota-num span { font-size: 12px; font-weight: 500; color: var(--mi-label2); }
.cpm__quota-state { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.cpm__quota.is-warn .cpm__quota-state { color: var(--mi-orange-t); }
.cpm__quota.is-full .cpm__quota-state { color: var(--mi-red-t); }

.cpm__why { background: linear-gradient(165deg, var(--mi-p-tint), transparent 60%), var(--mi-card); box-shadow: var(--mi-sh1), inset 0 0 0 1px color-mix(in srgb, var(--mi-p) 22%, transparent); }
.cpm__period { position: relative; height: 40px; margin: 4px 8px 0; }
.cpm__period-line, .cpm__period-done { position: absolute; left: 0; right: 0; top: 14px; height: 4px; border-radius: 2px; background: var(--mi-fill3); }
.cpm__period-done { background: color-mix(in srgb, var(--mi-p) 45%, transparent); transform-origin: left; }
.cpm__hit, .cpm__today { position: absolute; top: 0; bottom: 0; width: 0; }
.cpm__hit::after {
  content: ""; position: absolute; top: 10px; left: -6px; width: 12px; height: 12px; box-sizing: border-box; border-radius: 50%;
  background: var(--mi-red); box-shadow: 0 0 0 3px var(--mi-card);
}
.cpm__today::after { content: ""; position: absolute; top: 6px; left: -1px; width: 2px; height: 20px; border-radius: 1px; background: var(--mi-label); }
.cpm__today span {
  position: absolute; top: 26px; left: 0; transform: translateX(-50%); white-space: nowrap; font-size: 11px; font-weight: 650; color: var(--mi-label);
}
.cpm__period-ends { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 4px 12px; font-size: 11px; color: var(--mi-label3); font-variant-numeric: tabular-nums; }
.cpm__hits { display: inline-flex; align-items: center; gap: 6px; order: 3; flex-basis: 100%; font-size: 12px; font-weight: 600; color: var(--mi-red-t); }
.cpm__hits::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--mi-red); }

.cpm__change { gap: 16px; }
.cpm__diff { display: grid; border-radius: var(--mi-radius-m); background: var(--mi-fill4); padding: 4px 14px; }
.cpm__diff-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px 12px; padding: 9px 0; font-size: 13px; }
.cpm__diff-row + .cpm__diff-row { border-top: 1px solid var(--mi-sep); }
.cpm__diff-label { color: var(--mi-label2); }
.cpm__diff-vals { display: inline-flex; align-items: center; gap: 6px; font-variant-numeric: tabular-nums; }
.cpm__diff-vals :deep(svg) { color: var(--mi-label3); }
.cpm__from { color: var(--mi-label2); }
.cpm__diff-row.is-up strong { color: var(--mi-green-t); }
.cpm__diff-row.is-block strong { color: var(--mi-red-t); }

.cpm__bill { display: grid; gap: 0; margin: 0; }
.cpm__bill > div { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 7px 0; font-size: 13px; }
.cpm__bill dt { color: var(--mi-label2); }
.cpm__bill dd { margin: 0; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.cpm__bill > .cpm__due { margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--mi-sep); }
.cpm__due dt { font-size: 15px; font-weight: 650; color: var(--mi-label); }
.cpm__due dd { font-size: 22px; font-weight: 750; letter-spacing: -.03em; }
.cpm__eff { margin: 6px 0 0; font-size: 12px; line-height: 1.45; color: var(--mi-label2); }
.cpm__idle { display: flex; align-items: flex-start; gap: 10px; margin: 0; padding: 4px 0; font-size: 13px; line-height: 1.45; color: var(--mi-label2); }
.cpm__idle.is-done { padding: 12px 14px; border-radius: var(--mi-radius-m); color: var(--mi-label); background: color-mix(in srgb, var(--mi-green) 12%, transparent); }
.cpm__idle :deep(svg) { flex: none; color: var(--mi-green); }
</style>
