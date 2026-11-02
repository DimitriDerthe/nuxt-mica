<template>
  <section class="qr" aria-labelledby="qr-title">
    <header class="qr__head">
      <div>
        <MiText id="qr-title" variant="title3" as="h2" weight="semibold">Plan usage</MiText>
        <MiText variant="footnote" tone="label2">Team plan · cycle resets on Nov 14, in {{ DAYS_LEFT }} days</MiText>
      </div>
      <MiSegmented v-model="paceId" label="Project with" :options="paces" />
    </header>

    <div class="qr__grid">
      <article v-for="q in quotas" :key="q.id" class="qr__card" :class="{ 'is-short': q.short }" :aria-labelledby="'qr-' + q.id">
        <div class="qr__top">
          <span class="qr__icon" aria-hidden="true"><MiIcon :svg="q.icon" :size="18" /></span>
          <MiText :id="'qr-' + q.id" variant="subheadline" weight="semibold" as="h3">{{ q.label }}</MiText>
          <MiBadge v-if="q.short" tone="warning" label="Runs out" dot />
        </div>

        <p class="qr__value"><b>{{ q.usedText }}</b><span> / {{ q.limitText }}</span></p>

        <!-- Track spans 0 to 125% of the limit, so the projection can visibly cross the limit line. -->
        <div
          class="qr__track" role="meter" :aria-label="`${q.label} used`" :aria-valuenow="q.pct" aria-valuemin="0" aria-valuemax="100"
          :aria-valuetext="`${q.pct}% used, ${q.projPct}% projected at reset`"
        >
          <span class="qr__proj" :style="{ transform: `scaleX(${Math.min(q.projPct, 125) / 125})` }" />
          <span class="qr__used" :style="{ transform: `scaleX(${Math.min(q.pct, 125) / 125})` }" />
          <span class="qr__limit" aria-hidden="true" />
        </div>
        <div class="qr__scale" aria-hidden="true"><span>{{ q.pct }}% used</span><span>Limit</span></div>

        <MiText variant="footnote" :tone="q.short ? 'orange' : 'label2'" class="qr__runway">{{ q.runway }}</MiText>

        <div class="qr__foot">
          <MiText variant="caption" tone="label2" as="span">{{ q.rateText }}</MiText>
          <MiButton
            :variant="q.short ? 'tinted' : 'plain'" size="small" :pressed="requested.has(q.id)"
            @click="toggle(q.id)"
          >
            {{ requested.has(q.id) ? 'Requested' : q.action }}
          </MiButton>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const DAYS_LEFT = 12

const paces = [{ value: 'week', label: '7-day pace' }, { value: 'month', label: '30-day pace' }]
const paceId = ref<string | number | null>('week')

const icons = {
  seats: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19"/>',
  storage: '<ellipse cx="12" cy="6" rx="7.5" ry="2.8"/><path d="M4.5 6v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8V6"/><path d="M4.5 12v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/>',
  api: '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="m13.5 4-3 16"/>',
  runs: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>'
}

// Sample quotas: `rate` is daily growth at each pace; seats grow per week of hiring, so they barely move.
const base = [
  { id: 'seats', label: 'Seats', used: 42, limit: 50, unit: '', rate: { week: 0.29, month: 0.2 }, action: 'Add seats', fmt: (v: number) => String(Math.round(v)) },
  { id: 'storage', label: 'Storage', used: 812, limit: 1000, unit: 'GB', rate: { week: 17.5, month: 11.2 }, action: 'Add 500 GB', fmt: (v: number) => (v >= 1000 ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 2) + ' TB' : Math.round(v) + ' GB') },
  { id: 'api', label: 'API calls', used: 3.1, limit: 5, unit: 'M', rate: { week: 0.11, month: 0.16 }, action: 'Raise limit', fmt: (v: number) => v.toFixed(1) + 'M' },
  { id: 'runs', label: 'Automation runs', used: 9400, limit: 10000, unit: '', rate: { week: 310, month: 205 }, action: 'Buy run pack', fmt: (v: number) => Math.round(v).toLocaleString('en-US') }
] as const

const quotas = computed(() => base.map((q) => {
  const rate = q.rate[(paceId.value ?? 'week') as 'week' | 'month']
  const projected = q.used + rate * DAYS_LEFT
  const pct = Math.round((q.used / q.limit) * 100)
  const projPct = Math.round((projected / q.limit) * 100)
  const daysToLimit = Math.floor((q.limit - q.used) / rate)
  const short = projected > q.limit
  return {
    id: q.id, label: q.label, action: q.action, icon: icons[q.id], pct, projPct, short,
    usedText: q.fmt(q.used), limitText: q.fmt(q.limit),
    rateText: `+${q.fmt(rate * 7)} a week`,
    runway: short
      ? `At this pace you hit the limit in ${daysToLimit} ${daysToLimit === 1 ? 'day' : 'days'}, ${DAYS_LEFT - daysToLimit} before the reset.`
      : `Ends the cycle around ${projPct}%. No action needed.`
  }
}))

const requested = reactive(new Set<string>())
function toggle (id: string) {
  if (requested.has(id)) requested.delete(id)
  else requested.add(id)
}
</script>

<style scoped>
.qr { container-type: inline-size; display: grid; gap: 16px; font-family: var(--mi-font); color: var(--mi-label); }
.qr__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.qr__grid { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
@container (min-width: 600px) { .qr__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 1040px) { .qr__grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

.qr__card { display: grid; gap: 10px; align-content: start; min-width: 0; padding: 18px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.qr__card.is-short { box-shadow: var(--mi-sh1), inset 0 0 0 1px color-mix(in srgb, var(--mi-orange) 35%, transparent); }
.qr__top { display: flex; align-items: center; gap: 10px; min-height: 32px; }
.qr__top > h3 { flex: 1; min-width: 0; }
.qr__icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 10px; background: var(--mi-p-tint); color: var(--mi-p-text); }
.is-short .qr__icon { background: color-mix(in srgb, var(--mi-orange) 16%, transparent); color: var(--mi-orange-t); }

.qr__value { margin: 4px 0 0; font-variant-numeric: tabular-nums; }
.qr__value b { font-size: 30px; font-weight: 700; letter-spacing: -.04em; }
.qr__value span { font-size: 14px; color: var(--mi-label2); }

.qr__track { position: relative; height: 10px; border-radius: 5px; background: var(--mi-fill3); overflow: hidden; }
.qr__used, .qr__proj { position: absolute; inset: 0; transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.qr__used { border-radius: inherit; background: var(--mi-p); }
/* Projection to the reset date: hatched so it reads as a forecast, not usage. */
.qr__proj { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-p) 45%, transparent) 0 3px, transparent 3px 6px); }
.is-short .qr__used { background: var(--mi-orange); }
.is-short .qr__proj { background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--mi-orange) 55%, transparent) 0 3px, transparent 3px 6px); }
.qr__limit { position: absolute; top: 0; bottom: 0; left: 80%; width: 2px; margin-left: -1px; background: var(--mi-label); }
.qr__scale { position: relative; height: 14px; font-size: 11px; color: var(--mi-label2); font-variant-numeric: tabular-nums; }
.qr__scale span:last-child { position: absolute; left: 80%; transform: translateX(-50%); }

.qr__runway { min-height: 2.8em; }
.qr__foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding-top: 10px; border-top: 1px solid var(--mi-sep); }
@media (prefers-reduced-motion: reduce) { .qr__used, .qr__proj { transition: none; } }
</style>
