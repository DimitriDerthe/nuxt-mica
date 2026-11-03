<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="cpt-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="cpt-title" variant="title3" as="h2" weight="semibold">Acquisition channels</MiText>
        <MiText variant="footnote" tone="label2">Halden Outdoor store · compared with the previous {{ periodName }}</MiText>
      </div>
      <MiSegmented v-model="period" label="Period" :options="periods" />
    </header>

    <dl class="mi:grid mi:grid-cols-3 mi:gap-px mi:m-0 mi:rounded-lg mi:overflow-hidden mi:bg-sep mi:shadow-1">
      <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-3 mi:px-3.5 mi:min-w-0"><dt class="mi:text-[11px] mi:text-label2">Sessions</dt><dd class="mi:m-0 mi:text-[clamp(17px,_4.6cqi,_24px)] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ num(totals.sessions) }}</dd><MiText as="span" variant="caption" :tone="totals.sessions >= totals.prevSessions ? 'green' : 'red'" tabular>{{ delta(totals.sessions, totals.prevSessions) }}</MiText></div>
      <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-3 mi:px-3.5 mi:min-w-0"><dt class="mi:text-[11px] mi:text-label2">Conversion</dt><dd class="mi:m-0 mi:text-[clamp(17px,_4.6cqi,_24px)] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ pct(totals.orders / totals.sessions) }}</dd><MiText as="span" variant="caption" tone="label2">store average</MiText></div>
      <div class="mi:grid mi:bg-card mi:gap-0.5 mi:py-3 mi:px-3.5 mi:min-w-0"><dt class="mi:text-[11px] mi:text-label2">Revenue</dt><dd class="mi:m-0 mi:text-[clamp(17px,_4.6cqi,_24px)] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ money(totals.revenue) }}</dd><MiText as="span" variant="caption" :tone="totals.revenue >= totals.prevRevenue ? 'green' : 'red'" tabular>{{ delta(totals.revenue, totals.prevRevenue) }}</MiText></div>
    </dl>

    <div class="mi:hidden mi:min-w-0 mi:overflow-x-auto mi:@[720px]:block">
      <MiTable :columns="columns" :rows="rows" caption="Channel performance" density="relaxed" :zebra="false">
        <template #cell-name="{ row }">
          <span class="mi:inline-flex mi:items-center mi:gap-2.5 mi:font-semibold mi:whitespace-nowrap"><span class="mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)]" :style="{ '--tint': c(row).tint }" aria-hidden="true"><MiIcon :svg="c(row).icon" :size="15" /></span>{{ c(row).name }}</span>
        </template>
        <template #cell-sessions="{ row }">
          <!-- Data bar with a ghost tick at last period's value: growth reads as the gap between them. -->
          <span class="mi:grid mi:gap-1">
            <span class="mi:font-semibold mi:tabular-nums">{{ num(c(row).sessions) }}</span>
            <span class="mi:relative mi:block mi:h-1.5 mi:rounded-[3px] mi:bg-fill2">
              <i class="mi:absolute mi:rounded-[inherit] mi:bg-p/75 mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${c(row).sessions / maxSessions})` }" />
              <b class="mi:absolute mi:-ms-px mi:rounded-[1px] mi:bg-label mi:top-[-3px] mi:bottom-[-3px] mi:w-0.5 mi:opacity-55" :style="{ insetInlineStart: (c(row).prevSessions / maxSessions) * 100 + '%' }" />
            </span>
          </span>
        </template>
        <template #cell-conv="{ row }">
          <span class="mi:inline-block mi:py-[3px] mi:px-2 mi:rounded-[7px] mi:text-[13px] mi:font-semibold mi:tabular-nums mi:[background:color-mix(in_srgb,_var(--mi-green)_var(--heat),_transparent)] mi:text-label" :style="{ '--heat': Math.round(Math.min(1, c(row).conv / 0.05) * 60) + '%' }">{{ pct(c(row).conv) }}</span>
        </template>
        <template #cell-revenue="{ row }">
          <span class="mi:grid mi:justify-items-end mi:leading-tight">
            <span class="mi:font-semibold mi:tabular-nums">{{ money(c(row).revenue) }}</span>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="c(row).revenue >= c(row).prevRevenue ? 'mi:text-green-t' : 'mi:text-red-t'">{{ delta(c(row).revenue, c(row).prevRevenue) }}</span>
          </span>
        </template>
        <template #cell-trend="{ row }">
          <MiSparkline :values="c(row).trend" :width="96" :height="26" :animate="false" :label="c(row).name + ' revenue trend'" />
        </template>
      </MiTable>
    </div>

    <ul class="mi:grid mi:gap-2 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[720px]:hidden">
      <li v-for="ch in rows" :key="ch.id" class="mi:grid mi:gap-2.5 mi:py-3 mi:px-3.5 mi:rounded-lg mi:bg-card mi:shadow-1">
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2.5">
          <span class="mi:inline-flex mi:items-center mi:gap-2.5 mi:font-semibold mi:whitespace-nowrap"><span class="mi:grid mi:place-items-center mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_14%,_transparent)]" :style="{ '--tint': ch.tint }" aria-hidden="true"><MiIcon :svg="ch.icon" :size="15" /></span>{{ ch.name }}</span>
          <span class="mi:grid mi:justify-items-end mi:leading-tight">
            <span class="mi:font-semibold mi:tabular-nums">{{ money(ch.revenue) }}</span>
            <span class="mi:text-[12px] mi:font-semibold mi:tabular-nums" :class="ch.revenue >= ch.prevRevenue ? 'mi:text-green-t' : 'mi:text-red-t'">{{ delta(ch.revenue, ch.prevRevenue) }}</span>
          </span>
        </div>
        <span class="mi:relative mi:block mi:h-1.5 mi:rounded-[3px] mi:bg-fill2"><i class="mi:absolute mi:rounded-[inherit] mi:bg-p/75 mi:inset-0 mi:origin-left mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :style="{ transform: `scaleX(${ch.sessions / maxSessions})` }" /><b class="mi:absolute mi:-ms-px mi:rounded-[1px] mi:bg-label mi:top-[-3px] mi:bottom-[-3px] mi:w-0.5 mi:opacity-55" :style="{ insetInlineStart: (ch.prevSessions / maxSessions) * 100 + '%' }" /></span>
        <div class="mi:flex mi:items-center mi:justify-between mi:gap-2">
          <MiText as="span" variant="caption" tone="label2" tabular>{{ num(ch.sessions) }} sessions</MiText>
          <span class="mi:inline-block mi:py-[3px] mi:px-2 mi:rounded-[7px] mi:text-[13px] mi:font-semibold mi:tabular-nums mi:[background:color-mix(in_srgb,_var(--mi-green)_var(--heat),_transparent)] mi:text-label" :style="{ '--heat': Math.round(Math.min(1, ch.conv / 0.05) * 60) + '%' }">{{ pct(ch.conv) }} conv.</span>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const glyph = {
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  ad: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M8 15l2.2-6 2.2 6M8.8 13h2.8M15 9v6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.5 7l7.5 6 7.5-6"/>',
  direct: '<path d="M5 19L19 5M9 5h10v10"/>',
  social: '<circle cx="7" cy="12" r="2.5"/><circle cx="17" cy="6.5" r="2.5"/><circle cx="17" cy="17.5" r="2.5"/><path d="M9.2 10.8l5.6-3M9.2 13.2l5.6 3"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>'
}

// 30-day baseline; the other periods scale it with a per-channel drift so the ranking changes a little.
const base = [
  { id: 'organic', name: 'Organic search', icon: glyph.search, tint: 'var(--mi-green)', sessions: 48_210, prevSessions: 44_900, conv: 0.026, aov: 118, prevRevenue: 131_400, trend: [21, 22, 24, 23, 26, 27, 29, 31], drift: [0.25, 2.8] },
  { id: 'paid', name: 'Paid search', icon: glyph.ad, tint: 'var(--mi-blue)', sessions: 22_640, prevSessions: 25_100, conv: 0.031, aov: 104, prevRevenue: 81_900, trend: [16, 17, 15, 14, 15, 13, 12, 12], drift: [0.22, 3.1] },
  { id: 'email', name: 'Email', icon: glyph.mail, tint: 'var(--mi-purple)', sessions: 9_870, prevSessions: 8_410, conv: 0.048, aov: 126, prevRevenue: 47_200, trend: [5, 6, 6, 7, 6, 8, 8, 9], drift: [0.3, 2.6] },
  { id: 'direct', name: 'Direct', icon: glyph.direct, tint: 'var(--mi-label2)', sessions: 17_320, prevSessions: 16_980, conv: 0.022, aov: 131, prevRevenue: 48_700, trend: [9, 9, 10, 9, 10, 10, 10, 11], drift: [0.24, 3] },
  { id: 'social', name: 'Paid social', icon: glyph.social, tint: 'var(--mi-pink)', sessions: 26_480, prevSessions: 19_350, conv: 0.009, aov: 87, prevRevenue: 16_800, trend: [3, 4, 5, 5, 6, 7, 7, 8], drift: [0.2, 3.3] },
  { id: 'referral', name: 'Referral', icon: glyph.link, tint: 'var(--mi-orange)', sessions: 4_150, prevSessions: 4_620, conv: 0.019, aov: 142, prevRevenue: 12_300, trend: [4, 4, 3, 4, 3, 3, 3, 3], drift: [0.26, 2.7] }
]

const periods = [{ value: 7, label: '7 days' }, { value: 30, label: '30 days' }, { value: 90, label: '90 days' }]
const period = ref<string | number | null>(30)
const periodName = computed(() => periods.find(p => p.value === period.value)?.label ?? '')

const rows = computed(() => base.map((ch) => {
  const k = period.value === 7 ? ch.drift[0]! : period.value === 90 ? ch.drift[1]! : 1
  const sessions = Math.round(ch.sessions * k)
  const prevSessions = Math.round(ch.prevSessions * k)
  const revenue = Math.round(sessions * ch.conv * ch.aov)
  return { ...ch, sessions, prevSessions, revenue, prevRevenue: Math.round(ch.prevRevenue * k), orders: sessions * ch.conv }
}))
type Row = typeof rows.value[number]
const c = (row: Record<string, unknown>) => row as unknown as Row

const maxSessions = computed(() => Math.max(...rows.value.map(r => Math.max(r.sessions, r.prevSessions))))
const totals = computed(() => rows.value.reduce((t, r) => ({
  sessions: t.sessions + r.sessions, prevSessions: t.prevSessions + r.prevSessions, revenue: t.revenue + r.revenue, prevRevenue: t.prevRevenue + r.prevRevenue, orders: t.orders + r.orders
}), { sessions: 0, prevSessions: 0, revenue: 0, prevRevenue: 0, orders: 0 }))

const columns = [
  { key: 'name', label: 'Channel', sortable: true },
  { key: 'sessions', label: 'Sessions', sortable: true, width: '190px' },
  { key: 'conv', label: 'Conv. rate', sortable: true, align: 'end' as const, width: '100px' },
  { key: 'revenue', label: 'Revenue', sortable: true, align: 'end' as const, width: '130px' },
  { key: 'trend', label: '8 weeks', align: 'end' as const, width: '120px' }
]

const num = (n: number) => n.toLocaleString('en-US')
const money = (n: number) => (n >= 10_000 ? `$${(n / 1000).toFixed(1)}k` : '$' + n.toLocaleString('en-US'))
const pct = (x: number) => (x * 100).toFixed(1) + '%'
const delta = (a: number, b: number) => { const d = ((a - b) / b) * 100; return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(1) + '%' }
</script>

