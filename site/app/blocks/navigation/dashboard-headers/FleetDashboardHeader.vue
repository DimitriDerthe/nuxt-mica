<template>
  <div class="dh mi:@container mi:grid mi:content-start mi:min-h-full mi:font-mi mi:text-label mi:[background:var(--mi-page)]">
    <header class="dh__header mi:grid mi:gap-3.5 mi:pt-2.5 mi:px-3.5 mi:pb-4 mi:[background:var(--mi-card)] mi:shadow-[0_1px_0_var(--mi-sep)] mi:@[560px]:pt-3 mi:@[560px]:px-5 mi:@[560px]:pb-4.5">
      <!-- Row 1: workspace, trail, global tools. -->
      <div class="dh__bar mi:flex mi:items-center mi:gap-2 mi:min-w-0">
        <MiIconButton class="dh__burger" size="toolbar" variant="plain" :label="menuOpen ? 'Close navigation' : 'Open navigation'" :pressed="menuOpen" aria-controls="dh-menu" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
          <MiIcon :svg="menuOpen ? icons.close : icons.burger" />
        </MiIconButton>

        <MiMenu v-model="workspace" variant="popup" :items="workspaces" aria-label="Switch workspace">
          <template #trigger="{ props }">
            <button v-bind="props" type="button" class="dh__ws mi:inline-flex mi:items-center mi:gap-2 mi:min-w-0 mi:h-9 mi:pt-0 mi:pr-2 mi:pb-0 mi:pl-1 mi:[border:0] mi:rounded-[10px] mi:text-inherit mi:[background:none] mi:cursor-pointer mi:hover:[background:var(--mi-fill4)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[1px]">
              <span class="dh__ws-tile mi:grid mi:place-items-center mi:flex-[none] mi:w-7 mi:h-7 mi:rounded-[8px] mi:text-[11px] mi:font-extrabold mi:tracking-[.02em] mi:text-p-on mi:[background:linear-gradient(140deg,_var(--mi-p),_var(--mi-s))]" aria-hidden="true">{{ currentWs.initials }}</span>
              <span class="dh__ws-name mi:overflow-hidden mi:whitespace-nowrap mi:text-ellipsis mi:max-w-[9ch] mi:@[560px]:max-w-[18ch]">{{ currentWs.label }}</span>
              <MiIcon name="chevron-up-down" :size="14" />
            </button>
          </template>
        </MiMenu>

        <MiBreadcrumb class="dh__crumbs" :items="crumbs" />

        <div class="dh__tools mi:flex mi:flex-[none] mi:items-center mi:gap-1 mi:ml-auto">
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

      <nav v-show="menuOpen" id="dh-menu" class="dh__menu mi:grid mi:gap-0.5 mi:p-1.5 mi:rounded-lg mi:[background:var(--mi-fill4)] mi:@[900px]:hidden" aria-label="Sections">
        <a v-for="s in sections" :key="s" href="#" class="dh__menu-link mi:py-2.5 mi:px-3 mi:rounded-md mi:text-[15px] mi:font-medium mi:text-label2 mi:[text-decoration:none] mi:[&[aria-current='page']]:text-p-text mi:[&[aria-current='page']]:[background:var(--mi-p-tint)] mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[-2px]" :aria-current="s === 'Fleet' ? 'page' : undefined" @click.prevent="menuOpen = false">{{ s }}</a>
      </nav>

      <!-- Row 2: page title, freshness and the page's own actions. -->
      <div class="dh__title-row mi:grid mi:gap-3 mi:@[900px]:grid-cols-[minmax(0,_1fr)_auto] mi:@[900px]:items-center">
        <div class="dh__title mi:flex mi:flex-wrap mi:items-center mi:gap-y-2 mi:gap-x-3">
          <MiText id="dh-title" variant="title2" as="h2" weight="bold">Fleet overview</MiText>
          <button type="button" class="dh__sync mi:inline-flex mi:items-center mi:gap-1.5 mi:h-6.5 mi:py-0 mi:px-2.5 mi:[border:0] mi:rounded-[999px] mi:text-label2 mi:[background:var(--mi-fill4)] mi:cursor-pointer mi:focus-visible:[outline:2px_solid_var(--mi-p)] mi:focus-visible:outline-offset-[2px]" :aria-label="'Last synced ' + syncedText + '. Refresh now'" @click="refresh">
            <span class="dh__sync-dot mi:w-[7px] mi:h-[7px] mi:rounded-[50%] mi:[background:var(--mi-green)] mi:shadow-[0_0_0_3px_color-mix(in_srgb,_var(--mi-green)_20%,_transparent)]" aria-hidden="true" />
            <span>Synced {{ syncedText }}</span>
            <MiIcon :svg="icons.refresh" :size="13" :class="{ 'is-spinning': spinning }" />
          </button>
        </div>
        <div class="dh__actions mi:flex mi:flex-wrap mi:items-center mi:gap-2">
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
      <ul class="dh__rail mi:grid mi:grid-flow-col mi:auto-cols-[minmax(172px,_1fr)] mi:gap-0 mi:mt-0.5 mi:-mx-3.5 mi:mb-0 mi:py-0 mi:px-3.5 mi:[scroll-padding-inline:14px] mi:[list-style:none] mi:overflow-x-auto mi:[scroll-snap-type:x_mandatory] mi:[scrollbar-width:none] mi:@[560px]:-mx-5 mi:@[560px]:px-5 mi:@[560px]:[scroll-padding-inline:20px] mi:@[900px]:grid-flow-row mi:@[900px]:grid-cols-4 mi:@[900px]:overflow-visible" aria-label="Key figures">
        <li v-for="k in kpis" :key="k.label" class="dh__kpi mi:grid mi:gap-1 mi:pt-2.5 mi:pr-4 mi:pb-1 mi:pl-0 mi:snap-start mi:[.dh__kpi+&]:pl-4 mi:[.dh__kpi+&]:[border-left:1px_dashed_var(--mi-sep)]">
          <MiText as="span" variant="caption" tone="label2" weight="medium">{{ k.label }}</MiText>
          <span class="dh__kpi-row mi:flex mi:items-baseline mi:gap-2">
            <span class="dh__kpi-val mi:text-[22px] mi:font-bold mi:tracking-[-.03em] mi:tabular-nums">{{ k.value }}</span>
            <MiText as="span" variant="caption2" :tone="k.good ? 'green' : 'red'" weight="semibold">{{ k.delta }}</MiText>
          </span>
          <MiSparkline :values="k.spark" :width="96" :height="22" :animate="false" />
        </li>
      </ul>
    </header>

    <!-- Faux page body so the header reads in context. -->
    <main class="dh__body mi:grid mi:gap-3 mi:py-4 mi:px-3.5 mi:@[560px]:grid-cols-[1fr_1fr] mi:@[560px]:p-5 mi:@[900px]:grid-cols-[2fr_1fr_1fr]" aria-labelledby="dh-title">
      <div class="dh__panel dh__panel--wide mi:min-h-30 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)] mi:grid mi:min-h-45 mi:@[560px]:col-span-full mi:@[900px]:col-[auto]"><MiSkeleton :animated="false" :height="148" :radius="10" /></div>
      <div class="dh__panel mi:min-h-30 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]"><MiSkeleton variant="text" :lines="['70%', '90%', '55%', '80%']" :animated="false" /></div>
      <div class="dh__panel mi:min-h-30 mi:p-4 mi:rounded-lg mi:[background:var(--mi-card)] mi:shadow-[0_0_0_1px_var(--mi-sep)]"><MiSkeleton variant="text" :lines="['60%', '85%', '40%']" :animated="false" /></div>
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
.dh__ws {
  font: inherit; font-size: 14px; font-weight: 600;
}
.dh__crumbs { display: none; min-width: 0; padding-left: 12px; border-left: 1px solid var(--mi-sep); }
/* Doubled class so it beats the display set by MiSearch itself. */
.dh__tools .dh__search { display: none; width: 260px; }
.dh__sync {
  font: inherit; font-size: 12px; font-weight: 500; font-variant-numeric: tabular-nums;
}
.dh__sync .is-spinning { animation: dh-spin 700ms var(--mi-ease); }
@keyframes dh-spin { to { transform: rotate(360deg); } }
.dh__actions > :first-child { margin-right: auto; }

@container (min-width: 560px) {
  .dh__tools .dh__search { display: inline-flex; width: 200px; }
  .dh__tools .dh__search-btn { display: none; }
}
@container (min-width: 900px) {
  .dh__burger { display: none; }
  .dh__crumbs { display: block; }
  .dh__tools .dh__search { width: 260px; }
  .dh__actions > :first-child { margin-right: 4px; }
}
</style>
