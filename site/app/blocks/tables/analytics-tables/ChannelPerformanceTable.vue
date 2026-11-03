<template>
  <section class="cpt" aria-labelledby="cpt-title">
    <header class="cpt__head">
      <div>
        <MiText id="cpt-title" variant="title3" as="h2" weight="semibold">Acquisition channels</MiText>
        <MiText variant="footnote" tone="label2">Halden Outdoor store · compared with the previous {{ periodName }}</MiText>
      </div>
      <MiSegmented v-model="period" label="Period" :options="periods" />
    </header>

    <dl class="cpt__totals">
      <div><dt>Sessions</dt><dd>{{ num(totals.sessions) }}</dd><MiText as="span" variant="caption" :tone="totals.sessions >= totals.prevSessions ? 'green' : 'red'" tabular>{{ delta(totals.sessions, totals.prevSessions) }}</MiText></div>
      <div><dt>Conversion</dt><dd>{{ pct(totals.orders / totals.sessions) }}</dd><MiText as="span" variant="caption" tone="label2">store average</MiText></div>
      <div><dt>Revenue</dt><dd>{{ money(totals.revenue) }}</dd><MiText as="span" variant="caption" :tone="totals.revenue >= totals.prevRevenue ? 'green' : 'red'" tabular>{{ delta(totals.revenue, totals.prevRevenue) }}</MiText></div>
    </dl>

    <div class="cpt__table">
      <MiTable :columns="columns" :rows="rows" caption="Channel performance" density="relaxed" :zebra="false">
        <template #cell-name="{ row }">
          <span class="cpt__chan"><span class="cpt__glyph" :style="{ '--tint': c(row).tint }" aria-hidden="true"><MiIcon :svg="c(row).icon" :size="15" /></span>{{ c(row).name }}</span>
        </template>
        <template #cell-sessions="{ row }">
          <!-- Data bar with a ghost tick at last period's value: growth reads as the gap between them. -->
          <span class="cpt__bar-cell">
            <span class="cpt__num">{{ num(c(row).sessions) }}</span>
            <span class="cpt__bar">
              <i :style="{ transform: `scaleX(${c(row).sessions / maxSessions})` }" />
              <b :style="{ insetInlineStart: (c(row).prevSessions / maxSessions) * 100 + '%' }" />
            </span>
          </span>
        </template>
        <template #cell-conv="{ row }">
          <span class="cpt__heat" :style="{ '--heat': Math.round(Math.min(1, c(row).conv / 0.05) * 60) + '%' }">{{ pct(c(row).conv) }}</span>
        </template>
        <template #cell-revenue="{ row }">
          <span class="cpt__rev">
            <span class="cpt__num">{{ money(c(row).revenue) }}</span>
            <span class="cpt__delta" :class="c(row).revenue >= c(row).prevRevenue ? 'is-up' : 'is-down'">{{ delta(c(row).revenue, c(row).prevRevenue) }}</span>
          </span>
        </template>
        <template #cell-trend="{ row }">
          <MiSparkline :values="c(row).trend" :width="96" :height="26" :animate="false" :label="c(row).name + ' revenue trend'" />
        </template>
      </MiTable>
    </div>

    <ul class="cpt__cards">
      <li v-for="ch in rows" :key="ch.id" class="cpt__card">
        <div class="cpt__card-top">
          <span class="cpt__chan"><span class="cpt__glyph" :style="{ '--tint': ch.tint }" aria-hidden="true"><MiIcon :svg="ch.icon" :size="15" /></span>{{ ch.name }}</span>
          <span class="cpt__rev cpt__rev--end">
            <span class="cpt__num">{{ money(ch.revenue) }}</span>
            <span class="cpt__delta" :class="ch.revenue >= ch.prevRevenue ? 'is-up' : 'is-down'">{{ delta(ch.revenue, ch.prevRevenue) }}</span>
          </span>
        </div>
        <span class="cpt__bar"><i :style="{ transform: `scaleX(${ch.sessions / maxSessions})` }" /><b :style="{ insetInlineStart: (ch.prevSessions / maxSessions) * 100 + '%' }" /></span>
        <div class="cpt__card-foot">
          <MiText as="span" variant="caption" tone="label2" tabular>{{ num(ch.sessions) }} sessions</MiText>
          <span class="cpt__heat" :style="{ '--heat': Math.round(Math.min(1, ch.conv / 0.05) * 60) + '%' }">{{ pct(ch.conv) }} conv.</span>
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

<style scoped>
.cpt { container-type: inline-size; display: grid; align-content: start; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.cpt__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }

.cpt__totals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; margin: 0; border-radius: var(--mi-radius-l); overflow: hidden; background: var(--mi-sep); box-shadow: var(--mi-sh1); }
.cpt__totals div { display: grid; gap: 2px; padding: 12px 14px; background: var(--mi-card); min-width: 0; }
.cpt__totals dt { font-size: 11px; color: var(--mi-label2); }
.cpt__totals dd { margin: 0; font-size: clamp(17px, 4.6cqi, 24px); font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }

.cpt__table { display: none; min-width: 0; overflow-x: auto; }
.cpt__cards { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 720px) { .cpt__table { display: block; } .cpt__cards { display: none; } }

.cpt__chan { display: inline-flex; align-items: center; gap: 10px; font-weight: 600; white-space: nowrap; }
.cpt__glyph { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--tint); background: color-mix(in srgb, var(--tint) 14%, transparent); }
.cpt__num { font-weight: 600; font-variant-numeric: tabular-nums; }
.cpt__bar-cell { display: grid; gap: 4px; }
.cpt__bar { position: relative; display: block; height: 6px; border-radius: 3px; background: var(--mi-fill2); }
.cpt__bar i { position: absolute; inset: 0; border-radius: inherit; background: color-mix(in srgb, var(--mi-p) 75%, transparent); transform-origin: left; transition: transform var(--mi-dur-4) var(--mi-spring); }
.cpt__bar b { position: absolute; top: -3px; bottom: -3px; width: 2px; margin-inline-start: -1px; border-radius: 1px; background: var(--mi-label); opacity: .55; }
/* Heat chip: tint strength follows the conversion rate (5% and above is full). */
.cpt__heat {
  display: inline-block; padding: 3px 8px; border-radius: 7px; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums;
  background: color-mix(in srgb, var(--mi-green) var(--heat), transparent); color: var(--mi-label);
}
.cpt__rev { display: grid; justify-items: end; line-height: 1.25; }
.cpt__delta { font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }
.cpt__delta.is-up { color: var(--mi-green-t); }
.cpt__delta.is-down { color: var(--mi-red-t); }

.cpt__card { display: grid; gap: 10px; padding: 12px 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.cpt__card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.cpt__card-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
</style>
