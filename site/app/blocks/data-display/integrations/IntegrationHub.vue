<template>
  <section class="mi:@container mi:grid mi:content-start mi:gap-3.5 mi:font-mi mi:text-label" aria-labelledby="hub-title">
    <header class="mi:flex mi:flex-wrap mi:[align-items:flex-end] mi:justify-between mi:gap-3">
      <div>
        <MiText id="hub-title" variant="title3" as="h2" weight="semibold">Integrations</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ connected.length }} connected · {{ totalEvents.toLocaleString('en-US') }} events in the last 24 h</MiText>
      </div>
      <MiSearch v-model="query" size="compact" class="mi:flex-[0_1_260px]! mi:min-w-0!" placeholder="Search apps" aria-label="Search integrations" />
    </header>

    <div class="mi:flex mi:flex-wrap mi:gap-1.5" role="group" aria-label="Category">
      <MiChip v-for="c in cats" :key="c" selectable size="small" tone="neutral" :label="c" :model-value="cat === c" @update:model-value="cat = c" />
    </div>

    <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="mi:mt-1.5! mi:uppercase! mi:tracking-[.06em]!">Connected</MiText>
    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:grid-cols-2">
      <li v-for="app in connectedShown" :key="app.id" class="mi:grid mi:gap-3.5 mi:p-4 mi:rounded-xl mi:bg-card" :class="app.failed && app.on ? 'mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--mi-red)_35%,_transparent),_var(--mi-sh1)]' : 'mi:shadow-1'">
        <div class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-center mi:gap-3">
          <span class="mi:rounded-[12px] mi:text-[17px] mi:grid mi:place-items-center mi:flex-[none] mi:w-10 mi:h-10 mi:font-bold mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_13%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_20%,_transparent)]" :class="app.on ? '' : 'mi:[filter:grayscale(1)] mi:opacity-60'" :style="{ '--tint': app.tint }" aria-hidden="true">{{ app.name.slice(0, 1) }}</span>
          <div class="mi:min-w-0">
            <MiText as="h4" variant="headline" :lines="1">{{ app.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ app.on ? app.flow : 'Paused · nothing is syncing' }}</MiText>
          </div>
          <MiSwitch v-model="app.on" size="compact" :label="(app.on ? 'Pause ' : 'Resume ') + app.name" />
        </div>

        <!-- Sync pulse: 24 hourly bars of delivered events, failed deliveries overlaid in red. -->
        <div class="mi:grid mi:grid-cols-24 mi:items-end mi:gap-0.5 mi:h-11" role="img" :aria-label="`${app.name}: ${sum(app.hours)} events, ${app.failed} failed in 24 hours`">
          <span v-for="(v, i) in app.hours" :key="i" class="mi:relative mi:flex mi:flex-col mi:[justify-content:flex-end] mi:h-full">
            <i class="mi:block mi:w-full mi:h-full mi:rounded-[2px] mi:origin-bottom mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)]" :class="app.on ? 'mi:[background:color-mix(in_srgb,_var(--mi-p)_70%,_transparent)]' : 'mi:bg-fill3'" :style="{ transform: `scaleY(${app.on ? v / peak(app) : 0.04})` }" />
            <b class="mi:block mi:w-full mi:h-full mi:rounded-[2px] mi:origin-bottom mi:[transition:transform_var(--mi-dur-4)_var(--mi-spring)] mi:absolute mi:bottom-0 mi:bg-red" v-if="app.on && app.fails[i]" :style="{ transform: `scaleY(${Math.max(0.18, app.fails[i] / peak(app))})` }" />
          </span>
        </div>

        <div class="mi:flex mi:flex-wrap mi:items-center mi:justify-between mi:gap-y-1.5 mi:gap-x-2.5 mi:min-h-7">
          <MiText as="span" variant="caption" tone="label2" tabular>{{ sum(app.hours).toLocaleString('en-US') }} events · synced {{ app.last }}</MiText>
          <MiButton v-if="app.failed && app.on" size="mini" variant="tinted" brand="secondary">Review {{ app.failed }} failures</MiButton>
        </div>
      </li>
    </ul>

    <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="mi:mt-1.5! mi:uppercase! mi:tracking-[.06em]!">Available</MiText>
    <ul class="mi:grid mi:grid-cols-[minmax(0,_1fr)] mi:gap-3 mi:m-0 mi:p-0 mi:[list-style:none] mi:@[620px]:grid-cols-2 mi:@[980px]:grid-cols-3">
      <li v-for="app in availableShown" :key="app.id" class="mi:grid mi:grid-cols-[auto_minmax(0,_1fr)_auto] mi:items-start mi:gap-3 mi:p-3.5 mi:rounded-lg mi:bg-card mi:shadow-1">
        <span class="mi:rounded-[10px] mi:text-[15px] mi:grid mi:place-items-center mi:flex-[none] mi:w-10 mi:h-10 mi:font-bold mi:text-(--tint) mi:[background:color-mix(in_srgb,_var(--tint)_13%,_var(--mi-card))] mi:shadow-[inset_0_0_0_1px_color-mix(in_srgb,_var(--tint)_20%,_transparent)] mi:w-8.5 mi:h-8.5" :style="{ '--tint': app.tint }" aria-hidden="true">{{ app.name.slice(0, 1) }}</span>
        <div class="mi:grid mi:gap-0.5 mi:min-w-0">
          <MiText as="h4" variant="subheadline" weight="semibold">{{ app.name }}</MiText>
          <MiText variant="caption" tone="label2" :lines="2">{{ app.flow }}</MiText>
        </div>
        <MiButton size="small" variant="gray" :aria-label="'Connect ' + app.name" @click="connect(app.id)">Connect</MiButton>
      </li>
    </ul>
    <MiEmptyState v-if="!availableShown.length && !connectedShown.length" title="No app found" description="Try another name or category." icon="search" />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

// Deterministic sample traffic so the preview never jumps between renders.
const series = (seed: number, base: number) => Array.from({ length: 24 }, (_, h) => {
  const day = Math.sin(((h - 6) / 24) * Math.PI * 2) * 0.5 + 0.6
  return Math.round(base * Math.max(0.08, day) * (0.75 + (((seed * (h + 3) * 7919) % 97) / 97) * 0.5))
})
const quiet = () => Array.from({ length: 24 }, () => 0)

const apps = reactive([
  { id: 'slack', name: 'Slack', cat: 'Communication', tint: 'var(--mi-purple)', flow: 'Deploy and incident alerts to #release-room', connected: true, on: true, last: '2 min ago', hours: series(3, 40), fails: quiet(), failed: 0 },
  { id: 'github', name: 'GitHub', cat: 'Developer tools', tint: 'var(--mi-label)', flow: 'Pull requests linked to roadmap items', connected: true, on: true, last: 'just now', hours: series(7, 64), fails: quiet(), failed: 0 },
  { id: 'stripe', name: 'Stripe', cat: 'Finance', tint: 'var(--mi-indigo)', flow: 'Invoices and payouts into the ledger', connected: true, on: true, last: '6 min ago', hours: series(11, 30), fails: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1, 0, 0, 0, 0, 0], failed: 6 },
  { id: 'snowflake', name: 'Snowflake', cat: 'Data', tint: 'var(--mi-teal)', flow: 'Nightly export of usage events', connected: true, on: false, last: 'Oct 30', hours: series(5, 22), fails: quiet(), failed: 0 },
  { id: 'linear', name: 'Linear', cat: 'Developer tools', tint: 'var(--mi-blue)', flow: 'Turn customer feedback into issues with the reporter attached.', connected: false, on: true, last: 'just now', hours: quiet(), fails: quiet(), failed: 0 },
  { id: 'hubspot', name: 'HubSpot', cat: 'Communication', tint: 'var(--mi-orange)', flow: 'Sync account owners and deal stages to customer profiles.', connected: false, on: true, last: 'just now', hours: quiet(), fails: quiet(), failed: 0 },
  { id: 'notion', name: 'Notion', cat: 'Data', tint: 'var(--mi-label2)', flow: 'Publish release notes to a shared changelog page.', connected: false, on: true, last: 'just now', hours: quiet(), fails: quiet(), failed: 0 },
  { id: 'pagerduty', name: 'PagerDuty', cat: 'Developer tools', tint: 'var(--mi-green)', flow: 'Page the on-call engineer when a check fails twice.', connected: false, on: true, last: 'just now', hours: quiet(), fails: quiet(), failed: 0 },
  { id: 'xero', name: 'Xero', cat: 'Finance', tint: 'var(--mi-mint)', flow: 'Reconcile paid invoices and refunds every hour.', connected: false, on: true, last: 'just now', hours: quiet(), fails: quiet(), failed: 0 }
])
type App = typeof apps[number]

const cats = ['All', 'Communication', 'Developer tools', 'Finance', 'Data']
const cat = ref('All')
const query = ref('')

const match = (a: App) => (cat.value === 'All' || a.cat === cat.value) && a.name.toLowerCase().includes(query.value.trim().toLowerCase())
const connected = computed(() => apps.filter(a => a.connected))
const connectedShown = computed(() => connected.value.filter(match))
const availableShown = computed(() => apps.filter(a => !a.connected && match(a)))

const sum = (xs: number[]) => xs.reduce((n, x) => n + x, 0)
const peak = (a: App) => Math.max(1, ...a.hours.map((v, i) => v + (a.fails[i] ?? 0)))
const totalEvents = computed(() => connected.value.filter(a => a.on).reduce((n, a) => n + sum(a.hours), 0))

const connect = (id: string) => {
  const app = apps.find(a => a.id === id)
  if (!app) return
  app.connected = true
  app.on = true
  app.hours = Array.from({ length: 24 }, (_, h) => (h === 23 ? 4 : 0))
}
</script>
