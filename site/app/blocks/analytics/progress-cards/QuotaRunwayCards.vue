<template>
  <section class="qr mi:@container mi:grid mi:content-start mi:gap-4 mi:font-mi mi:text-label" aria-labelledby="qr-title">
    <header class="qr__head mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="qr-title" variant="title3" as="h2" weight="semibold">Plan usage</MiText>
        <MiText variant="footnote" tone="label2">Team plan · cycle resets on Nov 14, in {{ DAYS_LEFT }} days</MiText>
      </div>
      <MiSegmented v-model="paceId" label="Project with" :options="paces" />
    </header>

    <div class="qr__grid mi:grid mi:gap-3 mi:grid-cols-[minmax(0,_1fr)] mi:@[600px]:grid-cols-2 mi:@[1040px]:grid-cols-4">
      <article v-for="q in quotas" :key="q.id" class="qr__card mi:grid mi:gap-2.5 mi:content-start mi:min-w-0 mi:p-4.5 mi:rounded-xl mi:[background:var(--mi-card)] mi:shadow-1 mi:[&.is-short]:shadow-[var(--mi-sh1),_inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-orange)_35%,_transparent)]" :class="{ 'is-short': q.short }" :aria-labelledby="'qr-' + q.id">
        <div class="qr__top mi:flex mi:items-center mi:gap-2.5 mi:min-h-8">
          <span class="qr__icon mi:grid mi:place-items-center mi:w-8 mi:h-8 mi:rounded-[10px] mi:[background:var(--mi-p-tint)] mi:text-p-text mi:[.is-short_&]:[background:color-mix(in_srgb,_var(--mi-orange)_16%,_transparent)]" aria-hidden="true"><MiIcon :svg="q.icon" :size="18" /></span>
          <MiText :id="'qr-' + q.id" variant="subheadline" weight="semibold" as="h3">{{ q.label }}</MiText>
          <MiBadge v-if="q.short" tone="warning" label="Runs out" dot />
        </div>

        <p class="qr__value mi:mt-1 mi:mx-0 mi:mb-0 mi:tabular-nums"><b class="mi:[.qr__value_&]:font-bold mi:[.qr__value_&]:tracking-[-.04em]">{{ q.usedText }}</b><span> / {{ q.limitText }}</span></p>

        <!-- Track spans 0 to 125% of the limit, so the projection can visibly cross the limit line. -->
        <div
          class="qr__track mi:relative mi:h-2.5 mi:rounded-[5px] mi:[background:var(--mi-fill3)] mi:overflow-hidden" role="meter" :aria-label="`${q.label} used`" :aria-valuenow="q.pct" aria-valuemin="0" aria-valuemax="100"
          :aria-valuetext="`${q.pct}% used, ${q.projPct}% projected at reset`"
        >
          <span class="qr__proj mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-p)_45%,_transparent)_0_3px,_transparent_3px_6px)] mi:[.is-short_&]:[background:repeating-linear-gradient(135deg,_color-mix(in_srgb,_var(--mi-orange)_55%,_transparent)_0_3px,_transparent_3px_6px)] mi:motion-reduce:[transition:none]" :style="{ transform: `scaleX(${Math.min(q.projPct, 125) / 125})` }" />
          <span class="qr__used mi:absolute mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:rounded-[inherit] mi:[background:var(--mi-p)] mi:[.is-short_&]:[background:var(--mi-orange)] mi:motion-reduce:[transition:none]" :style="{ transform: `scaleX(${Math.min(q.pct, 125) / 125})` }" />
          <span class="qr__limit mi:absolute mi:top-0 mi:bottom-0 mi:left-[80%] mi:w-0.5 mi:-ml-px mi:[background:var(--mi-label)]" aria-hidden="true" />
        </div>
        <div class="qr__scale mi:relative mi:h-3.5 mi:text-[11px] mi:text-label2 mi:tabular-nums" aria-hidden="true"><span class="mi:[.qr__scale_&:last-child]:absolute mi:[.qr__scale_&:last-child]:left-[80%] mi:[.qr__scale_&:last-child]:transform-[translateX(-50%)]">{{ q.pct }}% used</span><span class="mi:[.qr__scale_&:last-child]:absolute mi:[.qr__scale_&:last-child]:left-[80%] mi:[.qr__scale_&:last-child]:transform-[translateX(-50%)]">Limit</span></div>

        <MiText variant="footnote" :tone="q.short ? 'orange' : 'label2'" class="qr__runway mi:min-h-[2.8em]">{{ q.runway }}</MiText>

        <div class="qr__foot mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-2 mi:pt-2.5 mi:border-t mi:border-t-sep">
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
.qr__top > h3 { flex: 1; min-width: 0; }
.is-short .qr__icon { color: var(--mi-orange-t); }
.qr__value b { font-size: 30px; }
.qr__value span { font-size: 14px; color: var(--mi-label2); }
</style>
