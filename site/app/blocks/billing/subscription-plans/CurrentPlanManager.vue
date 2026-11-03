<template>
  <section class="mi:@container/cpm mi:grid mi:content-start mi:gap-5 mi:font-mi mi:text-label" aria-labelledby="cpm-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-y-3 mi:gap-x-5">
      <div class="mi:grid mi:gap-1">
        <MiText id="cpm-title" as="h2" variant="title2" weight="bold">Plan and usage</MiText>
        <MiText variant="footnote" tone="label2">Kestrel Architects · billing period {{ day(periodStart) }} to {{ day(periodEnd) }}</MiText>
      </div>
      <div class="mi:flex mi:items-baseline mi:gap-2.5 mi:py-2 mi:px-3.5 mi:rounded-[999px] mi:[background:var(--mi-fill4)]">
        <span class="mi:text-[13px] mi:font-bold mi:text-p-text">{{ plan.name }}</span>
        <span class="mi:text-[15px] mi:font-650 mi:tabular-nums">{{ eur(plan.price) }}<small class="mi:ml-[3px] mi:text-[12px] mi:font-medium mi:text-label2">/ month</small></span>
      </div>
    </header>

    <div class="mi:grid mi:gap-4 mi:grid-cols-[minmax(0,_1fr)] mi:items-start mi:@[760px]/cpm:grid-cols-[minmax(0,_1.1fr)_minmax(0,_1fr)] mi:@[760px]/cpm:gap-5">
      <div class="mi:grid mi:gap-4 mi:min-w-0">
        <section class="mi:bg-card mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:shadow-1 mi:min-w-0" aria-labelledby="cpm-quota-title">
          <div class="mi:flex mi:items-baseline mi:justify-between mi:gap-2.5">
            <MiText id="cpm-quota-title" as="h3" variant="headline">This period</MiText>
            <MiText variant="caption" tone="label2" tabular>{{ daysLeft }} days left</MiText>
          </div>
          <div class="mi:grid mi:gap-4.5">
            <div v-for="q in quotas" :key="q.id">
              <MiMeter
                :value="q.unlimited ? 0 : q.used" :max="q.unlimited ? 1 : q.limit" :label="q.label" size="sm" :color="q.color"
                :value-text="q.unlimited ? `${q.used} ${q.unit}, unlimited` : `${q.used} of ${q.limit} ${q.unit}`"
              >
                <span class="mi:flex mi:flex-wrap mi:items-baseline mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:w-full">
                  <span class="mi:text-[15px] mi:font-650 mi:tabular-nums">{{ q.used }}<span class="mi:text-[12px] mi:font-medium mi:text-label2"> / {{ q.unlimited ? '∞' : q.limitText }}</span></span>
                  <span class="mi:inline-flex mi:items-center mi:gap-1 mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="q.state === 'warn' ? 'mi:text-orange-t' : q.state === 'full' ? 'mi:text-red-t' : 'mi:text-label2'">
                    <MiIcon v-if="q.state !== 'ok'" :name="q.state === 'full' ? 'exclamation-circle' : 'warning'" :size="13" />
                    {{ q.note }}
                  </span>
                </span>
              </MiMeter>
            </div>
          </div>
        </section>

        <!-- Why upgrade: the limit hits, placed on the billing period. -->
        <section v-if="planId === 'team'" class="mi:[background:linear-gradient(165deg,_var(--mi-p-tint),_transparent_60%),_var(--mi-card)] mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:shadow-1 mi:min-w-0 mi:shadow-[var(--mi-sh1),_inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-p)_22%,_transparent)]" aria-labelledby="cpm-why-title">
          <MiText id="cpm-why-title" as="h3" variant="headline">You hit the project limit 3 times this period</MiText>
          <MiText variant="footnote" tone="label2">Each time, someone archived a project to start a new one. Business removes the cap.</MiText>
          <div class="mi:relative mi:h-10 mi:mt-1 mi:mx-2 mi:mb-0" role="img" :aria-label="`Limit reached on ${hits.map(h => day(h)).join(', ')}`">
            <span class="mi:absolute mi:left-0 mi:right-0 mi:top-3.5 mi:h-1 mi:rounded-[2px] mi:[background:var(--mi-fill3)]" />
            <span class="mi:[background:color-mix(in_srgb,_var(--mi-p)_45%,_transparent)] mi:absolute mi:left-0 mi:right-0 mi:top-3.5 mi:h-1 mi:rounded-[2px] mi:origin-left" :style="{ transform: `scaleX(${elapsed})` }" />
            <span v-for="h in hits" :key="h.toISOString()" class="mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:after:content-[''] mi:after:absolute mi:after:top-2.5 mi:after:-left-1.5 mi:after:w-3 mi:after:h-3 mi:after:box-border mi:after:rounded-[50%] mi:after:[background:var(--mi-red)] mi:after:shadow-[0_0_0_3px_var(--mi-card)]" :style="{ left: `${at(h) * 100}%` }" />
            <span class="mi:absolute mi:top-0 mi:bottom-0 mi:w-0 mi:after:content-[''] mi:after:absolute mi:after:top-1.5 mi:after:-left-px mi:after:w-0.5 mi:after:h-5 mi:after:rounded-[1px] mi:after:[background:var(--mi-label)]" :style="{ left: `${elapsed * 100}%` }"><span class="mi:whitespace-nowrap mi:text-[11px] mi:font-650 mi:text-label mi:absolute mi:top-6.5 mi:left-0 mi:transform-[translateX(-50%)]">Today</span></span>
          </div>
          <div class="mi:flex mi:flex-wrap mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:text-[11px] mi:text-label3 mi:tabular-nums" aria-hidden="true">
            <span>{{ day(periodStart) }}</span>
            <span class="mi:inline-flex mi:items-center mi:gap-1.5 mi:order-3 mi:basis-full mi:text-[12px] mi:font-semibold mi:text-red-t mi:before:content-[''] mi:before:w-2 mi:before:h-2 mi:before:rounded-[50%] mi:before:[background:var(--mi-red)]">Limit reached {{ hits.map(h => day(h)).join(', ') }}</span>
            <span>{{ day(periodEnd) }}</span>
          </div>
        </section>
      </div>

      <section class="mi:bg-card mi:grid mi:gap-3.5 mi:p-5 mi:rounded-xl mi:shadow-1 mi:min-w-0 mi:gap-4" aria-labelledby="cpm-change-title">
        <MiText id="cpm-change-title" as="h3" variant="headline">Change plan</MiText>
        <MiSegmented v-model="target" label="New plan" :options="plans.map(p => ({ value: p.id, label: p.id === planId ? `${p.name} (current)` : p.name }))" />

        <template v-if="next.id !== planId">
          <MiRadioGroup v-model="timing" label="When the change applies" :options="timingOptions" orientation="horizontal" />

          <div class="mi:grid mi:rounded-md mi:[background:var(--mi-fill4)] mi:py-1 mi:px-3.5">
            <div v-for="d in diffs" :key="d.label" class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1 mi:gap-x-3 mi:py-[9px] mi:px-0 mi:text-[13px] mi:not-first:border-t mi:not-first:border-t-sep">
              <span class="mi:text-label2">{{ d.label }}</span>
              <span class="mi:[&_svg]:text-label3 mi:inline-flex mi:items-center mi:gap-1.5 mi:tabular-nums"><span class="mi:text-label2">{{ d.from }}</span><MiIcon name="arrow-right" :size="13" /><strong :class="d.blocked ? 'mi:text-red-t' : d.up ? 'mi:text-green-t' : ''">{{ d.to }}</strong></span>
            </div>
          </div>

          <MiAlert v-if="blockers.length" tone="danger" title="Too much in use for this plan">
            {{ blockers.join(' ') }}
          </MiAlert>

          <dl v-else class="mi:grid mi:gap-0 mi:m-0" aria-live="polite">
            <template v-if="timing === 'now'">
              <div class="mi:text-[13px] mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-0"><dt class="mi:text-label2">Unused {{ plan.name }}, {{ daysLeft }} of {{ periodDays }} days</dt><dd class="mi:m-0 mi:font-semibold mi:whitespace-nowrap mi:tabular-nums">−{{ eur(credit, 2) }}</dd></div>
              <div class="mi:text-[13px] mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-0"><dt class="mi:text-label2">{{ next.name }} for the same {{ daysLeft }} days</dt><dd class="mi:m-0 mi:font-semibold mi:whitespace-nowrap mi:tabular-nums">{{ eur(charge, 2) }}</dd></div>
              <div class="mi:text-[13px] mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-0 mi:mt-1 mi:pt-3 mi:border-t mi:border-t-sep"><dt class="mi:text-[15px] mi:font-650 mi:text-label">{{ due >= 0 ? 'Due today' : 'Credit to your balance' }}</dt><dd class="mi:m-0 mi:font-750 mi:text-[22px] mi:whitespace-nowrap mi:tabular-nums mi:tracking-[-.03em]">{{ eur(Math.abs(due), 2) }}</dd></div>
              <p class="mi:mt-1.5 mi:mx-0 mi:mb-0 mi:text-[12px] mi:leading-[1.45] mi:text-label2">Effective today, {{ day(today) }}. From {{ day(periodEnd) }} you pay {{ eur(next.price) }} a month.</p>
            </template>
            <template v-else>
              <div class="mi:text-[13px] mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-0"><dt class="mi:text-label2">Due today</dt><dd class="mi:m-0 mi:font-semibold mi:whitespace-nowrap mi:tabular-nums">{{ eur(0, 2) }}</dd></div>
              <div class="mi:text-[13px] mi:flex mi:items-baseline mi:justify-between mi:gap-3 mi:py-[7px] mi:px-0 mi:mt-1 mi:pt-3 mi:border-t mi:border-t-sep"><dt class="mi:text-[15px] mi:font-650 mi:text-label">First {{ next.name }} invoice, {{ day(periodEnd) }}</dt><dd class="mi:m-0 mi:font-750 mi:text-[22px] mi:whitespace-nowrap mi:tabular-nums mi:tracking-[-.03em]">{{ eur(next.price, 2) }}</dd></div>
              <p class="mi:mt-1.5 mi:mx-0 mi:mb-0 mi:text-[12px] mi:leading-[1.45] mi:text-label2">You keep {{ plan.name }} until {{ day(periodEnd) }}, then switch automatically.</p>
            </template>
          </dl>

          <MiButton block :variant="blockers.length ? 'gray' : 'filled'" :disabled="!!blockers.length" :loading="busy" @click="confirm">
            {{ cta }}
          </MiButton>
        </template>
        <p v-else class="mi:[&_svg]:flex-none mi:[&_svg]:text-green mi:flex mi:[align-items:flex-start] mi:gap-2.5 mi:m-0 mi:text-[13px] mi:leading-[1.45]" :class="doneNote ? 'mi:text-label mi:py-3 mi:px-3.5 mi:rounded-md mi:[background:color-mix(in_srgb,_var(--mi-green)_12%,_transparent)]' : 'mi:text-label2 mi:py-1 mi:px-0'" aria-live="polite">
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

