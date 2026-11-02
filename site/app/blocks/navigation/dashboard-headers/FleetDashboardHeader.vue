<template>
  <div class="dh">
    <header class="dh__header">
      <!-- Row 1: workspace, trail, global tools. -->
      <div class="dh__bar">
        <MiIconButton class="dh__burger" size="toolbar" variant="plain" :label="menuOpen ? 'Close navigation' : 'Open navigation'" :pressed="menuOpen" aria-controls="dh-menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <MiIcon :svg="menuOpen ? icons.close : icons.burger" />
        </MiIconButton>

        <MiMenu v-model="workspace" variant="popup" :items="workspaces" aria-label="Switch workspace">
          <template #trigger="{ props }">
            <button v-bind="props" type="button" class="dh__ws">
              <span class="dh__ws-tile" aria-hidden="true">{{ currentWs.initials }}</span>
              <span class="dh__ws-name">{{ currentWs.label }}</span>
              <MiIcon name="chevron-up-down" :size="14" />
            </button>
          </template>
        </MiMenu>

        <MiBreadcrumb class="dh__crumbs" :items="crumbs" />

        <div class="dh__tools">
          <MiSearch v-model="query" class="dh__search" size="compact" placeholder="Search shipments, drivers…" shortcut="⌘K" aria-label="Search the workspace" />
          <MiIconButton class="dh__search-btn" size="toolbar" variant="plain" label="Search">
            <MiIcon name="search" />
          </MiIconButton>
          <MiBadge :count="alerts" placement="top-right" :offset="2" count-noun="unread alerts">
            <template #target>
              <MiIconButton size="toolbar" variant="plain" label="Alerts" @click="alerts = 0"><MiIcon name="bell" /></MiIconButton>
            </template>
          </MiBadge>
          <MiAvatar name="Rosa Lindqvist" size="sm" tone="auto" />
        </div>
      </div>

      <nav v-show="menuOpen" id="dh-menu" class="dh__menu" aria-label="Sections">
        <a v-for="s in sections" :key="s" href="#" class="dh__menu-link" :aria-current="s === 'Fleet' ? 'page' : undefined" @click.prevent="menuOpen = false">{{ s }}</a>
      </nav>

      <!-- Row 2: page title, freshness and the page's own actions. -->
      <div class="dh__title-row">
        <div class="dh__title">
          <MiText id="dh-title" variant="title2" as="h2" weight="bold">Fleet overview</MiText>
          <button type="button" class="dh__sync" :aria-label="'Last synced ' + syncedText + '. Refresh now'" @click="refresh">
            <span class="dh__sync-dot" aria-hidden="true" />
            <span>Synced {{ syncedText }}</span>
            <MiIcon :svg="icons.refresh" :size="13" :class="{ 'is-spinning': spinning }" />
          </button>
        </div>
        <div class="dh__actions">
          <MiSegmented v-model="range" label="Time range" :options="ranges" />
          <MiButton variant="bordered" size="small">
            <template #leading><MiIcon :svg="icons.download" :size="16" /></template>
            Export
          </MiButton>
          <MiButton size="small">
            <template #leading><MiIcon name="plus" :size="16" /></template>
            New shipment
          </MiButton>
        </div>
      </div>

      <!-- Row 3: the pulse rail, four figures that follow the time range. -->
      <ul class="dh__rail" aria-label="Key figures">
        <li v-for="k in kpis" :key="k.label" class="dh__kpi">
          <MiText as="span" variant="caption" tone="label2" weight="medium">{{ k.label }}</MiText>
          <span class="dh__kpi-row">
            <span class="dh__kpi-val">{{ k.value }}</span>
            <MiText as="span" variant="caption2" :tone="k.good ? 'green' : 'red'" weight="semibold">{{ k.delta }}</MiText>
          </span>
          <MiSparkline :values="k.spark" :width="96" :height="22" :animate="false" />
        </li>
      </ul>
    </header>

    <!-- Faux page body so the header reads in context. -->
    <main class="dh__body" aria-labelledby="dh-title">
      <div class="dh__panel dh__panel--wide"><MiSkeleton :animated="false" :height="148" :radius="10" /></div>
      <div class="dh__panel"><MiSkeleton variant="text" :lines="['70%', '90%', '55%', '80%']" :animated="false" /></div>
      <div class="dh__panel"><MiSkeleton variant="text" :lines="['60%', '85%', '40%']" :animated="false" /></div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const icons = {
  burger: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.8-3.6M4 4v4h4M4 13a8 8 0 0 0 14.8 3.6M20 20v-4h-4"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'
}

const workspaces = [
  { value: 'hf', label: 'Harbor Freight Ops', initials: 'HF' },
  { value: 'nl', label: 'Northline Cold Chain', initials: 'NC' },
  { value: 'sandbox', label: 'Sandbox', initials: 'SB' }
]
const workspace = ref<string | number | undefined>('hf')
const currentWs = computed(() => workspaces.find(w => w.value === workspace.value) ?? workspaces[0]!)
const crumbs = [{ label: 'Operations', href: '#' }, { label: 'Fleet', href: '#' }, { label: 'Overview' }]
const sections = ['Overview', 'Fleet', 'Shipments', 'Drivers', 'Depots', 'Reports']

const query = ref('')
const alerts = ref(3)
const menuOpen = ref(false)

const ranges = [{ value: 'today', label: 'Today' }, { value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]
const range = ref<string | number | null>('7d')
const data = {
  today: [
    { label: 'On-time delivery', value: '96.1%', delta: '+0.8 pt', good: true, spark: [93, 94, 95, 94, 96, 96] },
    { label: 'Trucks on the road', value: '184', delta: '+12', good: true, spark: [150, 162, 170, 175, 181, 184] },
    { label: 'Avg. dwell at depot', value: '38 min', delta: '+4 min', good: false, spark: [31, 33, 34, 36, 37, 38] },
    { label: 'Fuel per 100 km', value: '27.4 L', delta: '−0.3 L', good: true, spark: [28, 27.9, 27.8, 27.6, 27.5, 27.4] }
  ],
  '7d': [
    { label: 'On-time delivery', value: '94.7%', delta: '+1.9 pt', good: true, spark: [91, 92, 92, 93, 94, 94, 95] },
    { label: 'Shipments delivered', value: '6,412', delta: '+8.2%', good: true, spark: [820, 870, 905, 880, 940, 990, 1007] },
    { label: 'Avg. dwell at depot', value: '35 min', delta: '−6 min', good: true, spark: [42, 41, 39, 38, 36, 35, 35] },
    { label: 'Fuel per 100 km', value: '27.8 L', delta: '+0.2 L', good: false, spark: [27.5, 27.6, 27.6, 27.7, 27.8, 27.9, 27.8] }
  ],
  '30d': [
    { label: 'On-time delivery', value: '93.2%', delta: '+3.4 pt', good: true, spark: [88, 89, 90, 91, 92, 93, 93] },
    { label: 'Shipments delivered', value: '27,906', delta: '+11.6%', good: true, spark: [5900, 6200, 6650, 6800, 7100, 7256] },
    { label: 'Avg. dwell at depot', value: '39 min', delta: '−2 min', good: true, spark: [43, 42, 41, 41, 40, 39] },
    { label: 'Fuel per 100 km', value: '28.1 L', delta: '−0.6 L', good: true, spark: [28.9, 28.7, 28.5, 28.4, 28.2, 28.1] }
  ]
}
const kpis = computed(() => data[(range.value ?? '7d') as keyof typeof data])

// Freshness pill: counts up every second, the button refreshes it.
const synced = ref(12)
const spinning = ref(false)
const syncedText = computed(() => (synced.value < 60 ? `${synced.value} s ago` : `${Math.floor(synced.value / 60)} min ago`))
let clock: ReturnType<typeof setInterval> | undefined
let spinStop: ReturnType<typeof setTimeout> | undefined
function refresh() {
  spinning.value = true
  spinStop = setTimeout(() => { spinning.value = false; synced.value = 0 }, 700)
}
onMounted(() => { clock = setInterval(() => { synced.value++ }, 1000) })
onBeforeUnmount(() => { clearInterval(clock); clearTimeout(spinStop) })
</script>

<style scoped>
.dh { container-type: inline-size; display: grid; align-content: start; min-height: 100%; font-family: var(--mi-font); color: var(--mi-label); background: var(--mi-page); }
.dh__header { display: grid; gap: 14px; padding: 10px 14px 16px; background: var(--mi-card); box-shadow: 0 1px 0 var(--mi-sep); }

.dh__bar { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dh__ws {
  display: inline-flex; align-items: center; gap: 8px; min-width: 0; height: 36px; padding: 0 8px 0 4px; border: 0; border-radius: 10px;
  font: inherit; font-size: 14px; font-weight: 600; color: inherit; background: none; cursor: pointer;
}
.dh__ws:hover { background: var(--mi-fill4); }
.dh__ws:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 1px; }
.dh__ws-tile { display: grid; place-items: center; flex: none; width: 28px; height: 28px; border-radius: 8px; font-size: 11px; font-weight: 800; letter-spacing: .02em; color: var(--mi-p-on); background: linear-gradient(140deg, var(--mi-p), var(--mi-s)); }
.dh__ws-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 9ch; }
.dh__crumbs { display: none; min-width: 0; padding-left: 12px; border-left: 1px solid var(--mi-sep); }
.dh__tools { display: flex; flex: none; align-items: center; gap: 4px; margin-left: auto; }
/* Doubled class so it beats the display set by MiSearch itself. */
.dh__tools .dh__search { display: none; width: 260px; }

.dh__menu { display: grid; gap: 2px; padding: 6px; border-radius: var(--mi-radius-l); background: var(--mi-fill4); }
.dh__menu-link { padding: 10px 12px; border-radius: var(--mi-radius-m); font-size: 15px; font-weight: 500; color: var(--mi-label2); text-decoration: none; }
.dh__menu-link[aria-current="page"] { color: var(--mi-p-text); background: var(--mi-p-tint); }
.dh__menu-link:focus-visible { outline: 2px solid var(--mi-p); outline-offset: -2px; }

.dh__title-row { display: grid; gap: 12px; }
.dh__title { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.dh__sync {
  display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border: 0; border-radius: 999px;
  font: inherit; font-size: 12px; font-weight: 500; color: var(--mi-label2); background: var(--mi-fill4); cursor: pointer; font-variant-numeric: tabular-nums;
}
.dh__sync:focus-visible { outline: 2px solid var(--mi-p); outline-offset: 2px; }
.dh__sync-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--mi-green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--mi-green) 20%, transparent); }
.dh__sync .is-spinning { animation: dh-spin 700ms var(--mi-ease); }
@keyframes dh-spin { to { transform: rotate(360deg); } }
.dh__actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.dh__actions > :first-child { margin-right: auto; }

.dh__rail {
  display: grid; grid-auto-flow: column; grid-auto-columns: minmax(172px, 1fr); gap: 0; margin: 2px -14px 0; padding: 0 14px; scroll-padding-inline: 14px; list-style: none;
  overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none;
}
.dh__kpi { display: grid; gap: 4px; padding: 10px 16px 4px 0; scroll-snap-align: start; }
.dh__kpi + .dh__kpi { padding-left: 16px; border-left: 1px dashed var(--mi-sep); }
.dh__kpi-row { display: flex; align-items: baseline; gap: 8px; }
.dh__kpi-val { font-size: 22px; font-weight: 700; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }

.dh__body { display: grid; gap: 12px; padding: 16px 14px; }
.dh__panel { min-height: 120px; padding: 16px; border-radius: var(--mi-radius-l); background: var(--mi-card); box-shadow: 0 0 0 1px var(--mi-sep); }
.dh__panel--wide { display: grid; min-height: 180px; }

@container (min-width: 560px) {
  .dh__header { padding: 12px 20px 18px; }
  .dh__tools .dh__search { display: inline-flex; width: 200px; }
  .dh__ws-name { max-width: 18ch; }
  .dh__tools .dh__search-btn { display: none; }
  .dh__rail { margin-inline: -20px; padding-inline: 20px; scroll-padding-inline: 20px; }
  .dh__body { grid-template-columns: 1fr 1fr; padding: 20px; }
  .dh__panel--wide { grid-column: 1 / -1; }
}
@container (min-width: 900px) {
  .dh__burger { display: none; }
  .dh__menu { display: none; }
  .dh__crumbs { display: block; }
  .dh__tools .dh__search { width: 260px; }
  .dh__title-row { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .dh__actions > :first-child { margin-right: 4px; }
  .dh__rail { grid-auto-flow: row; grid-template-columns: repeat(4, minmax(0, 1fr)); overflow: visible; }
  .dh__body { grid-template-columns: 2fr 1fr 1fr; }
  .dh__panel--wide { grid-column: auto; }
}
</style>
