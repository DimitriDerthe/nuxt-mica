<template>
  <section class="hub" aria-labelledby="hub-title">
    <header class="hub__head">
      <div>
        <MiText id="hub-title" variant="title3" as="h2" weight="semibold">Integrations</MiText>
        <MiText variant="footnote" tone="label2" tabular>{{ connected.length }} connected · {{ totalEvents.toLocaleString('en-US') }} events in the last 24 h</MiText>
      </div>
      <MiSearch v-model="query" size="compact" class="hub__search" placeholder="Search apps" aria-label="Search integrations" />
    </header>

    <div class="hub__chips" role="group" aria-label="Category">
      <MiChip v-for="c in cats" :key="c" selectable size="small" tone="neutral" :label="c" :model-value="cat === c" @update:model-value="cat = c" />
    </div>

    <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="hub__section">Connected</MiText>
    <ul class="hub__connected">
      <li v-for="app in connectedShown" :key="app.id" class="hub__live" :class="{ 'is-paused': !app.on, 'is-warn': app.failed && app.on }">
        <div class="hub__live-top">
          <span class="hub__mono" :style="{ '--tint': app.tint }" aria-hidden="true">{{ app.name.slice(0, 1) }}</span>
          <div class="hub__live-name">
            <MiText as="h4" variant="headline" :lines="1">{{ app.name }}</MiText>
            <MiText variant="caption" tone="label2" :lines="1">{{ app.on ? app.flow : 'Paused · nothing is syncing' }}</MiText>
          </div>
          <MiSwitch v-model="app.on" size="compact" :label="(app.on ? 'Pause ' : 'Resume ') + app.name" />
        </div>

        <!-- Sync pulse: 24 hourly bars of delivered events, failed deliveries overlaid in red. -->
        <div class="hub__pulse" role="img" :aria-label="`${app.name}: ${sum(app.hours)} events, ${app.failed} failed in 24 hours`">
          <span v-for="(v, i) in app.hours" :key="i" class="hub__bar">
            <i :style="{ transform: `scaleY(${app.on ? v / peak(app) : 0.04})` }" />
            <b v-if="app.on && app.fails[i]" :style="{ transform: `scaleY(${Math.max(0.18, app.fails[i] / peak(app))})` }" />
          </span>
        </div>

        <div class="hub__live-foot">
          <MiText as="span" variant="caption" tone="label2" tabular>{{ sum(app.hours).toLocaleString('en-US') }} events · synced {{ app.last }}</MiText>
          <MiButton v-if="app.failed && app.on" size="mini" variant="tinted" brand="secondary">Review {{ app.failed }} failures</MiButton>
        </div>
      </li>
    </ul>

    <MiText as="h3" variant="footnote" weight="semibold" tone="label2" class="hub__section">Available</MiText>
    <ul class="hub__available">
      <li v-for="app in availableShown" :key="app.id" class="hub__tile">
        <span class="hub__mono hub__mono--sm" :style="{ '--tint': app.tint }" aria-hidden="true">{{ app.name.slice(0, 1) }}</span>
        <div class="hub__tile-text">
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

<style scoped>
.hub { container-type: inline-size; display: grid; gap: 14px; font-family: var(--mi-font); color: var(--mi-label); }
.hub__head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
.hub__search { flex: 0 1 260px; min-width: 0; }
.hub__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.hub__section { margin-top: 6px; text-transform: uppercase; letter-spacing: .06em; }

.hub__connected, .hub__available { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
@container (min-width: 620px) { .hub__connected, .hub__available { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@container (min-width: 980px) { .hub__available { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.hub__mono {
  display: grid; place-items: center; flex: none; width: 40px; height: 40px; border-radius: 12px; font-size: 17px; font-weight: 700;
  color: var(--tint); background: color-mix(in srgb, var(--tint) 13%, var(--mi-card));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--tint) 20%, transparent);
}
.hub__mono--sm { width: 34px; height: 34px; border-radius: 10px; font-size: 15px; }

.hub__live { display: grid; gap: 14px; padding: 16px; border-radius: var(--mi-radius-xl); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.hub__live.is-warn { box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--mi-red) 35%, transparent), var(--mi-sh1); }
.hub__live-top { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px; }
.hub__live-name { min-width: 0; }
.hub__pulse { display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); align-items: end; gap: 2px; height: 44px; }
.hub__bar { position: relative; display: flex; flex-direction: column; justify-content: flex-end; height: 100%; }
.hub__bar i, .hub__bar b { display: block; width: 100%; border-radius: 2px; transform-origin: bottom; transition: transform var(--mi-dur-4) var(--mi-spring); }
.hub__bar i { height: 100%; background: color-mix(in srgb, var(--mi-p) 70%, transparent); }
.hub__bar b { position: absolute; bottom: 0; height: 100%; background: var(--mi-red); }
.is-paused .hub__bar i { background: var(--mi-fill3); }
.is-paused .hub__mono { filter: grayscale(1); opacity: .6; }
.hub__live-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; min-height: 28px; }

.hub__tile { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 12px; padding: 14px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: var(--mi-sh1); }
.hub__tile-text { display: grid; gap: 2px; min-width: 0; }
</style>
